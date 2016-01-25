//'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:TopologyController
 * @description
 * # TopologyController
 * Controller of the Topology page
 */

angular.module('bmpUiApp')
  .controller('linkStateController', ['$scope', 'apiFactory', 'toolsFactory', 'leafletData', '$timeout', '$q',
    function ($scope, apiFactory, toolsFactory, leafletData, $timeout, $q) {

      getPeers();

      var accessToken = 'pk.eyJ1IjoicGlja2xlZGJhZGdlciIsImEiOiJaTG1RUmxJIn0.HV-5_hj6_ggR32VZad4Xpg';
      var mapID = 'pickledbadger.mbkpbek5';
      angular.extend($scope, {
        defaults: {
          tileLayer: 'https://{s}.tiles.mapbox.com/v4/' + mapID + '/{z}/{x}/{y}.png?access_token=' + accessToken,
          minZoom: 2,
          maxZoom: 15,
          zoomControl: false,
          scrollWheelZoom: false
        }
      });

      var objectSize = function (obj) {
        var size = 0, key;
        for (key in obj) {
          if (obj.hasOwnProperty(key)) size++;
        }
        return size;
      };

      $scope.id = "LinkState";

      $scope.protocol;
      var nodesPromise, linksPromise;
      var nodes = [];
      var links = [];
      var SPFdata;

      $scope.translateMT = {
        0: "Standard(IPv4)",
        2: "IPv6",
        3: "Multicast/RPF"
      };

      //var latitudes = [63.391326, 47.6062, 29.7633, 41.85, 33.7861178428426, 44.98, 34.0522, 39.0997, 40.7879, 38.8951,
      //  45.5234, 42.6526, 25.7743, 32.7153, 42.3584, 36.137242513163];
      //var longitudes = [-149.8286774, -122.332, -95.3633, -87.65, -84.1959236252621, -93.2638, -118.244, -94.5786,
      //  -74.0143, -77.0364, -122.676, -73.7562, -80.1937, -117.157, -71.0598, -120.754451723841];

      //SPF Table options
      $scope.SPFtableOptions = {
        enableFiltering: true,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        enableColumnResizing: true,
        multiSelect: false,
        selectionRowHeaderWidth: 35,
        rowHeight: 25,
        gridFooterHeight: 0,
        showGridFooter: true,
        enableHorizontalScrollbar: 0,
        enableVerticalScrollbar: 1,
        rowTemplate: '<div class="hover-row-highlight"><div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div></div>',

        columnDefs: [
          {field: 'prefixWithLen', displayName: 'Prefix', width: '*'},
          {field: 'Type', displayName: 'Type', width: '*'},
          {field: 'metric', displayName: 'Metric', width: '*'},
          {field: 'src_router_id', displayName: 'Source Node ID', width: '*'},
          {field: 'nei_router_id', displayName: 'Neighbor Node ID', width: '*'},
          {field: 'neighbor_addr_adjusted', displayName: 'Neighbor Address', width: '*'}
        ],
        onRegisterApi: function (gridApi) {
          $scope.SPFgridApi = gridApi;
          gridApi.selection.on.rowSelectionChanged($scope, function (row) {
            if (row.isSelected) {
              removeLayers(polylines);
              var path = row.entity.path_hash_ids;
              var neighbor_addr = row.entity.neighbor_addr;
              $scope.drawPath(path, neighbor_addr);
              cluster.clearLayers();
              cluster.addLayers(involvedMarkers);
            }
            else {
              removeLayers(circles.slice(1));
              removeLayers(paths);
              paths = [];
              $scope.pathTraces = null;
              cluster.clearLayers();
              cluster.addLayer(markerLayer);
              angular.forEach(polylines, function (polyline) {
                if (!$scope.map.hasLayer(polyline))
                  $scope.map.addLayer(polyline);
              });
              $scope.map.fitBounds(markerLayer.getBounds());
            }
          });
          gridApi.selection.on.rowSelectionChangedBatch($scope, function () {
            removeLayers(circles.slice(1));
            removeLayers(paths);
            paths = [];
            $scope.pathTraces = null;
            cluster.clearLayers();
            cluster.addLayer(markerLayer);
            angular.forEach(polylines, function (polyline) {
              if (!$scope.map.hasLayer(polyline))
                $scope.map.addLayer(polyline);
            });
            $scope.map.fitBounds(markerLayer.getBounds());
          });
        }
      };

      var polylines, cluster, markers, markerLayer, paths;

      var routerIcon = L.icon({
        iconUrl: 'images/Router-icon.png',
        iconSize: [15, 15]
      });

      $scope.selectNode = function (selectedRouter) {
        removeLayers(circles);
        circles = [];

        if (pathGroup && $scope.map.hasLayer(pathGroup)) {
          $scope.map.removeLayer(pathGroup);
          pathGroup.clearLayers();
          angular.forEach(polylines, function (polyline) {
            if (!$scope.map.hasLayer(polyline))
              $scope.map.addLayer(polyline);
          });
        }

        if (!cluster.hasLayer(markerLayer)) {
          cluster.clearLayers();
          cluster.addLayer(markerLayer);
        }

        removeLayers(paths);
        paths = [];

        $scope.selectedRouter = selectedRouter;

        $scope.pathTraces = null;

        if ($scope.protocol == "OSPF") {
          apiFactory.getSPFospf($scope.selectedPeer.peer_hash_id, selectedRouter.routerId, $scope.selected_mt_id).success(function (result) {
              if (result.igp_ospf) {
                SPFdata = result.igp_ospf.data;
                drawShortestPathTree(SPFdata);
              }
              else {
                $scope.SPFtableOptions.data = [];
              }
            }
          ).error(function (error) {
            console.log(error.message);
          });
        }
        else if ($scope.protocol == "ISIS") {
          apiFactory.getSPFisis($scope.selectedPeer.peer_hash_id, selectedRouter.routerId, $scope.selected_mt_id).success(function (result) {
              if (result.igp_isis) {
                SPFdata = result.igp_isis.data;
                drawShortestPathTree(SPFdata);
              }
              else {
                $scope.SPFtableOptions.data = [];
              }
            }
          ).error(function (error) {
            console.log(error.message);
          });
        }
      };

      $scope.selectChange = function () {

        if ($scope.selectedPeer) {
          if ($scope.selected_mt_id == null || $scope.selected_mt_id == undefined)
            $scope.selected_mt_id = $scope.selectedPeer.available_mt_ids[0];

          $scope.topologyIsLoad = true; //start loading
          getNodes();
          getLinks();

          $scope.selectedRouterName = null;

          markers = {};

          linksPromise.success(function () {
            nodesPromise.success(function () {

              $scope.pathTraces = null;

              if (cluster && $scope.map.hasLayer(cluster))
                $scope.map.removeLayer(cluster);

              removeLayers(circles);
              circles = [];

              removeLayers(polylines);
              polylines = [];

              if (pathGroup && $scope.map.hasLayer(pathGroup)) {
                $scope.map.removeLayer(pathGroup);
                pathGroup.clearLayers();
              }

              removeLayers(paths);
              paths = [];

              var highlightLines = [];

              cluster = L.markerClusterGroup({
                maxClusterRadius: 15,
                spiderfyDistanceMultiplier: 2
              });
              markerLayer = new L.FeatureGroup();
              markerLayer.on('click', function (e) {
                $scope.selectNode(e.layer.options.data);
                $scope.drawHighlightCircle(e.layer._latlng, 'red');
                removeLayers(highlightLines);
                highlightLines = [];
              });
              markerLayer.on('mouseover', function (e) {
                e.layer.openPopup();
                if (!$scope.pathTraces) {
                  angular.forEach(e.layer.options.connectedPolylines, function (polyline) {
                    var highlightLine = new L.Polyline(polyline._latlngs, {
                      color: 'red'
                    }).addTo($scope.map);
                    highlightLines.push(highlightLine);
                  });
                }
              });
              markerLayer.on('mouseout', function (e) {
                e.layer.closePopup();
                if (!$scope.pathTraces) {
                  removeLayers(highlightLines);
                  highlightLines = [];
                }
              });
              angular.forEach(nodes, function (node) {
                var marker = new L.Marker([node.latitude, node.longitude], {
                  icon: routerIcon,
                  data: node,
                  title: "NodeName: " + node.NodeName,
                  connectedPolylines: []
                });

                var linksConnected = 0;
                angular.forEach(links, function (link) {
                  if (link.source == node.id || link.target == node.id) {
                    linksConnected++;
                  }
                });
                var popup = "Connected Links: " + linksConnected;

                angular.forEach(node, function (value, key) {
                  if (['id', '$$hashKey', 'level'].indexOf(key) < 0)
                    popup += "<br>" + key + ": " + value;
                });
                marker.bindPopup(popup);
                marker.addTo(markerLayer);
                markers[node.id] = marker;
              });
              angular.forEach(links, function (link) {
                var sourceNode, targetNode;
                angular.forEach(nodes, function (node) {
                  if (node.id == link.source)
                    sourceNode = node;
                  if (node.id == link.target)
                    targetNode = node;
                });
                if (sourceNode && targetNode) {
                  var polyline = new L.Polyline([L.latLng(sourceNode.latitude, sourceNode.longitude), L.latLng(targetNode.latitude, targetNode.longitude)], {
                    color: 'grey',
                    weight: 2,
                    opacity: 0.2,
                    data: link,
                    sourceID: sourceNode.id,
                    targetID: targetNode.id
                  });
                  var popup = "";
                  angular.forEach(link, function (value, key) {
                    popup += key + ":" + value + "<br>";
                  });
                  polyline.bindPopup(popup);
                  polyline.addTo($scope.map);
                  polylines.push(polyline);
                  markers[sourceNode.id].options.connectedPolylines.push(polyline);
                  markers[targetNode.id].options.connectedPolylines.push(polyline);
                }
              });
              $scope.map.addLayer(cluster.addLayer(markerLayer));

              if ($scope.tab == "map")
                $scope.map.fitBounds(markerLayer.getBounds());

              $scope.topologyIsLoad = false; //stop loading

              $scope.SPFtableOptions.data = [];
            });
          });
        }
      };

      function getPeers() {
        apiFactory.getLinkStatePeers().success(
          function (result) {
            if (result.ls_peers.data.length == 0) {
              $scope.topologyIsLoad = false;
            } else {
              $scope.peerData = [];
              angular.forEach(result.ls_peers.data, function (peer) {
                var existed = $scope.peerData.filter(function (current) {
                  return current.peer_hash_id == peer.peer_hash_id && current.protocol == peer.protocol
                });
                if (existed.length == 0) {
                  peer.available_mt_ids = [peer.mt_id];
                  delete peer.mt_id;
                  $scope.peerData.push(peer);
                }
                else {
                  existed[0].available_mt_ids.push(peer.mt_id);
                }
              });
              $scope.selectedPeer = $scope.peerData[0];
              $scope.selected_mt_id = $scope.peerData[0].available_mt_ids[0];
              init();
            }
          })
          .error(function (error) {
            console.log(error.message);
          });
      }

      function init() {
        /****************************************
         Store map object when available
         *****************************************/
        leafletData.getMap($scope.id).then(function (map) {
          $scope.map = map;
          L.control.zoomslider().addTo($scope.map);
        });

        $scope.selectChange();
      }

      $scope.goto = function (latlng, zoom) {
        if (zoom)
          $scope.map.setView(latlng, zoom);
        else
          $scope.map.panTo(latlng, {animate: true});
      };

      var circles = [];

      $scope.drawHighlightCircle = function (latlng, color) {
        var circle = new L.CircleMarker(latlng, {
          color: color,
          radius: 20
        });
        circle.addTo($scope.map);
        circles.push(circle);
      };

      $scope.toggleLocationSelection = function (location) {
        var index = location.indexOf(' ');
        if (index > -1) {
          location = location.substring(0, index) + '\\' + location.substring(index, location.length);
        }
        var selector = $("#" + location);
        var nodesSelector = $("#" + location + 'nodes');
        if (!selector.hasClass("expanded")) {
          selector.addClass("expanded");
          nodesSelector.show();
        } else {
          selector.removeClass("expanded");
          nodesSelector.hide();
        }
      };

      $scope.panelSearch = function (key) {
        $(".loca").addClass('expanded');
        $('.locationItems').show();
      };

      $scope.locations = {};  //used for card

      function getNodes() {
        nodesPromise = apiFactory.getPeerNodes($scope.selectedPeer.peer_hash_id, $scope.selected_mt_id);
        nodesPromise.success(function (result) {
          nodes = [];
          $scope.locations = {};
          var nodesData = result.v_ls_nodes.data;
          for (var i = 0; i < result.v_ls_nodes.size; i++) {
            toolsFactory.addDefaultInfo(nodesData[i]);
            var routerId;
            if (nodesData[i].protocol == "OSPFv2") {
              routerId = nodesData[i].IGP_RouterId;
              $scope.protocol = 'OSPF';
            }
            else {
              routerId = nodesData[i].RouterId;
              $scope.protocol = 'ISIS';
            }
            var newNode = {
              id: nodesData[i].hash_id,
              routerId: routerId,
              igp_routerId: nodesData[i].IGP_RouterId,
              NodeName: nodesData[i].NodeName,
              country: nodesData[i].country,
              stateprov: nodesData[i].stateprov,
              city: nodesData[i].city,
              latitude: nodesData[i].latitude,
              longitude: nodesData[i].longitude,
              level: i
            };
            nodes.push(newNode);
            if (newNode.city in $scope.locations) {
              $scope.locations[newNode.city].push(newNode);
            } else {
              $scope.locations[newNode.city] = [newNode];
            }
            nodesData[i].location = [nodesData[i].city, nodesData[i].stateprov, nodesData[i].country].join(', ');
            nodesData[i].routerId = routerId;
          }
          if ($scope.LSGridApi) {
            $scope.LSgridApi.selection.clearSelectedRows();
          }
          if ($scope.protocol == 'ISIS') {
            $scope.SPFtableOptions.columnDefs[1] = {field: 'Type', displayName: 'Level', width: '*'};
          }
          if ($scope.tab == 'table')
            $scope.lsTableOptions.data = nodesData;
        }).error(function (error) {
          console.log(error.message);
        });
      }

      function getLinks() {
        linksPromise = apiFactory.getPeerLinks($scope.selectedPeer.peer_hash_id, $scope.selected_mt_id);
        linksPromise.success(function (result) {
          links = [];
          var linksData = result.v_ls_links.data;
          var reverseLinks = [];
          for (var i = 0; i < result.v_ls_links.size; i++) {
            var source = linksData[i].local_node_hash_id;
            var target = linksData[i].remote_node_hash_id;
            var igp_metric = linksData[i].igp_metric;
            var interfaceIP = linksData[i].InterfaceIP;
            var neighborIP = linksData[i].NeighborIP;
            if (source < target) {
              links.push(
                {
                  id: i,
                  source: source,
                  target: target,
                  igp_metric: igp_metric,
                  interfaceIP: interfaceIP,
                  neighborIP: neighborIP
                });
            }
            else {
              reverseLinks.push(
                {
                  id: i,
                  source: source,
                  target: target,
                  igp_metric: igp_metric,
                  interfaceIP: interfaceIP,
                  neighborIP: neighborIP
                });
            }
          }

          for (var i = 0; i < reverseLinks.length; i++) {
            for (var j = 0; j < links.length; j++) {
              if (reverseLinks[i].target == links[j].source && reverseLinks[i].source == links[j].target
                && reverseLinks[i].neighborIP == links[j].interfaceIP && reverseLinks[i].igp_metric != links[j].igp_metric) {
                links[j] =
                {
                  id: links[j].id,
                  source: links[j].source,
                  target: links[j].target,
                  sourceLabel: links[j].igp_metric,
                  targetLabel: reverseLinks[i].igp_metric,
                  interfaceIP: links[j].interfaceIP,
                  neighborIP: links[j].neighborIP
                };
                break;
              }
            }
          }
        }).error(function (error) {
          console.log(error.message);
        });
      }

      function drawShortestPathTree(SPFdata) {
        for (var i = 0; i < SPFdata.length; i++) {
          SPFdata[i].prefixWithLen = SPFdata[i].prefix + "/" + SPFdata[i].prefix_len;
          SPFdata[i].neighbor_addr_adjusted = (SPFdata[i].neighbor_addr == null) ? 'local' : SPFdata[i].neighbor_addr;
          if (SPFdata[i].path_router_ids.split(',').length == 1 && (['0.0.0.0', '::', null].indexOf(SPFdata[i].neighbor_addr) > -1)) {
            SPFdata[i].neighbor_addr_adjusted = 'local';
          }
          else {
            SPFdata[i].neighbor_addr_adjusted = SPFdata[i].neighbor_addr;
          }
        }
        $scope.SPFgridApi.selection.clearSelectedRows();
        //if (tempSPFdata) {
        //  var onlyInA = tempSPFdata.filter(function(current){
        //    return SPFdata.filter(function(current_b){
        //        return current_b.prefixWithLen == current.prefixWithLen
        //      }).length == 0
        //  });
        //
        //  var onlyInB = SPFdata.filter(function(current){
        //    return tempSPFdata.filter(function(current_a){
        //        return current_a.prefixWithLen == current.prefixWithLen
        //      }).length == 0
        //  });
        //
        //  result = onlyInA.concat(onlyInB);
        //
        //  console.log(result);
        //}
        //tempSPFdata = SPFdata;
        $scope.SPFtableOptions.data = SPFdata;
        $('html, body').animate({
          scrollTop: $("#SPFsection").offset().top + $("#SPFsection").outerHeight(true) - $(window).height()
        }, 600);
      }

      var pathGroup, involvedMarkers;

      //draw the path
      $scope.drawPath = function (path_hash_ids) {
        $scope.pathTraces = null;
        removeLayers(circles.slice(1));

        if (pathGroup && $scope.map.hasLayer(pathGroup)) {
          $scope.map.removeLayer(pathGroup);
          pathGroup.clearLayers();
        }

        removeLayers(paths);

        paths = [];
        pathGroup = new L.featureGroup();

        involvedMarkers = [];

        angular.forEach(path_hash_ids.split(","), function (hash) {
          involvedMarkers.push(markers[hash]);
        });
        if (involvedMarkers.length > 1) {
          for (var j = 0; j < involvedMarkers.length - 1; j++) {
            if (involvedMarkers[j]._latlng.lat != involvedMarkers[j + 1]._latlng.lat ||
              involvedMarkers[j]._latlng.long != involvedMarkers[j + 1]._latlng.long) {
              var newLine = new L.polyline([involvedMarkers[j]._latlng, involvedMarkers[j + 1]._latlng], {color: 'purple'});
              angular.forEach(polylines, function (polyline) {
                if ([polyline.options.sourceID, polyline.options.targetID].indexOf(involvedMarkers[j].options.data.id) > -1 &&
                  [polyline.options.sourceID, polyline.options.targetID].indexOf(involvedMarkers[j + 1].options.data.id) > -1)
                  newLine.bindPopup(polyline._popup);
              });
              newLine.addTo(pathGroup);
              paths.push(newLine);
              var path = new L.polylineDecorator(newLine, {
                patterns: [{
                  offset: '20%',
                  repeat: '20%',
                  symbol: L.Symbol.arrowHead({
                    pixelSize: 7,
                    polygon: false,
                    pathOptions: {stroke: true}
                  })
                }]
              });
              path.addTo($scope.map);
              paths.push(path);
            }
          }
          $scope.pathTraces = [];
          angular.forEach(involvedMarkers, function (marker) {
            $scope.pathTraces.push(marker.options.data);
          });
        }
        if (objectSize(pathGroup._layers) > 0) {
          pathGroup.addTo($scope.map);
          if ($scope.tab == "map")
            $scope.map.fitBounds(pathGroup.getBounds());
          $scope.drawHighlightCircle(involvedMarkers[involvedMarkers.length - 1]._latlng, 'purple');
        }
      };

      function removeLayers(layers) {
        angular.forEach(layers, function (layer) {
          if ($scope.map.hasLayer(layer))
            $scope.map.removeLayer(layer);
        });
      }

      $scope.tab = 'map';
      /**************** Table View ***************/
      $scope.lsTableInitHeight = 300;
      $scope.lsTableOptions = {
        enableFiltering: true,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        enableColumnResizing: true,
        multiSelect: false,
        height: $scope.lsTableInitHeight,
        rowHeight: 25,
        gridFootHeight: 0,
        showGridFooter: true,
        enableVerticalScrollbar: true,
        rowTemplate: '<div class="hover-row-highlight"><div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div></div>',
        columnDefs: [
          {field: "NodeName", displayName: "Node Name", width: '*'},
          {field: "IGP_RouterId", displayName: "IGP Router ID", width: '20%'},
          {field: "RouterId", displayName: "Router ID", width: '20%'},
          {field: "ISISAreaId", displayName: "ISIS Area ID", width: '10%'},
          {field: "location", displayName: "Location", width: '25%'}
        ],
        onRegisterApi: function (gridApi) {
          $scope.LSgridApi = gridApi;
          gridApi.selection.on.rowSelectionChanged($scope, function (row) {
            $scope.selectNode(row.entity);
            $scope.drawHighlightCircle([row.entity.latitude, row.entity.longitude], 'red');
          });
        }
      };

      $scope.changeTab = function (value) {
        $scope.tab = value;
        if (value == 'table') {
          $timeout(function () {
            nodesPromise.success(function (res) {
              $scope.lsTableOptions.data = res.v_ls_nodes.data;
            });
          }, 50);
        } else {
          if (objectSize(pathGroup._layers) > 0)
            setTimeout(function () {
              $scope.map.fitBounds(pathGroup.getBounds());
            }, 200);
          else if (markerLayer && objectSize(markerLayer._layers) > 0)
            $scope.map.fitBounds(markerLayer.getBounds());
          $scope.lsTableOptions.data = null;
        }
      };

      $scope.mapHeight = $(window).height() - 220;

    }])
;
