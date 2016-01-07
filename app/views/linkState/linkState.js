//'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:TopologyController
 * @description
 * # TopologyController
 * Controller of the Topology page
 */

angular.module('bmpUiApp')
  .controller('linkStateController', ['$scope', 'apiFactory', 'toolsFactory', 'leafletData', '$timeout', function ($scope, apiFactory, toolsFactory, leafletData, $timeout) {

    getPeers();

    $scope.protocol;
    $scope.show = false;
    var nodesPromise, linksPromise;
    var nodes = [];
    var links = [];
    var SPFdata;

    var latitudes = [63.391326, 47.6062, 29.7633, 41.85, 33.7861178428426, 44.98, 34.0522, 39.0997, 40.7879, 38.8951,
      45.5234, 42.6526, 25.7743, 32.7153, 42.3584, 36.137242513163];
    var longitudes = [-149.8286774, -122.332, -95.3633, -87.65, -84.1959236252621, -93.2638, -118.244, -94.5786,
      -74.0143, -77.0364, -122.676, -73.7562, -80.1937, -117.157, -71.0598, -120.754451723841];

    // initialize a topology
    //(function(nx, global) {
    //nx.define('LinkStateTopology.', nx.ui.Component, {
    //  view: {
    //    content: {
    //      name: 'topo',
    //      type: 'nx.graphic.Topology',
    //      props: {

    //SPF Table options
    $scope.SPFtableOptions = {
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
        //{field: 'prefix_len', displayName: 'Prefix Length', width: '*'},
        {field: 'Type', displayName: 'Type', width: '*'},
        {field: 'metric', displayName: 'Metric', width: '*'},
        {field: 'src_router_id', displayName: 'Source Router Id', width: '*'},
        {field: 'nei_router_id', displayName: 'Neighbor Router Id', width: '*'},
        {field: 'neighbor_addr_adjusted', displayName: 'Neighbor Address', width: '*'},
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          var path = row.entity.path_hash_ids;
          var neighbor_addr = row.entity.neighbor_addr;
          $scope.drawPath(path, neighbor_addr);
        });
      }
    };

    //topo.on('clickStage', function (sender, event) {
    //  clear();
    //  $scope.SPFtableOptions.data = {};
    //  $scope.show = false;
    //  $scope.$apply();
    //});
    //topo.on('clickNode', function (sender, node) {
    //  var selectedRouterId = node['_label'];
    //
    //  clear();
    //  topo.selectedNodes().clear();
    //  topo.selectedNodes().add(node);
    //
    //  if ($scope.protocol == "OSPF") {
    //    apiFactory.getSPFospf($scope.selectedPeer.peer_hash_id, selectedRouterId).success(function (result) {
    //        SPFdata = result.igp_ospf.data;
    //        drawShortestPathTree(SPFdata);
    //      }
    //    ).error(function (error) {
    //        console.log(error.message);
    //      });
    //  }
    //  else if ($scope.protocol == "ISIS") {
    //    apiFactory.getSPFisis($scope.selectedPeer.peer_hash_id, selectedRouterId).success(function (result) {
    //        SPFdata = result.igp_isis.data;
    //        drawShortestPathTree(SPFdata);
    //      }
    //    ).error(function (error) {
    //        console.log(error.message);
    //      });
    //  }
    //});

    var cluster;

    var routerIcon = L.icon({
      iconUrl: 'images/Router-icon.png',
      iconSize: [15, 15]
    });

    $scope.selectChange = function () {

      $scope.topologyIsLoad = true; //start loading
      getNodes();
      getLinks();

      linksPromise.success(function () {
        nodesPromise.success(function () {

          if (cluster)
            $scope.map.removeLayer(cluster);

          cluster = L.markerClusterGroup({
            maxClusterRadius: 20,
            disableClusteringAtZoom: 6
          });
          var markerLayer = new L.FeatureGroup().on('click', function (e) {
            console.log(e.layer.options.data)
          });
          angular.forEach(nodes, function (node) {
            var marker = new L.Marker([node.latitude, node.longitude], {
              icon: routerIcon,
              data: node,
              title: node.routerIP
            });
            marker.addTo(markerLayer);
          });
          var linkLayer = new L.FeatureGroup();
          angular.forEach(links, function (link) {
            var sourceNode, targetNode;
            angular.forEach(nodes, function (node) {
              if (node.id == link.source)
                sourceNode = node;
              if (node.id == link.target)
                targetNode = node;
            });
            if (sourceNode && targetNode) {
              var polyline = new L.Polyline([L.latLng(sourceNode.latitude, sourceNode.longitude), L.latLng(targetNode.latitude, targetNode.longitude)]);
              polyline.addTo(linkLayer);
            }
          });
          $scope.map.addLayer(cluster.addLayer(markerLayer));
          $scope.map.addLayer(linkLayer);

          $scope.topologyIsLoad = false; //stop loading

          $scope.SPFtableOptions.data = [];
          $scope.show = false;
        });
      });
    };

    function getPeers() {
      apiFactory.getLinkStatePeers().success(
        function (result) {
          $scope.peerData = result.ls_peers.data;
          if ($scope.peerData == 0) {
            $scope.topologyIsLoad = false;
          } else {
            $scope.selectedPeer = $scope.peerData[0];
            init();
          }
        })
        .error(function (error) {
          console.log(error.message);
        });
    }

    function init() {
      var accessToken = 'pk.eyJ1IjoicmFpbnk5MjcxIiwiYSI6ImNpaHNicmNlaDAwcWp0N2tobmxiOGRnbXgifQ.iWcbPl8TwyIX-qaX6nTx-g';
      var mapID = 'rainy9271.obcfe84n';
      angular.extend($scope, {
        defaults: {
          tileLayer: 'https://{s}.tiles.mapbox.com/v4/' + mapID + '/{z}/{x}/{y}.png?access_token=' + accessToken,
          minZoom: 2,
          zoomControl: false
        }
      });

      /****************************************
       Store map object when available
       *****************************************/
      leafletData.getMap($scope.id).then(function (map) {
        $scope.map = map;
        //L.control.zoomslider().addTo(map);
        $scope.map.scrollWheelZoom.disable();
        //$scope.init();
        $scope.map.setView([39.50, -84.35], 4);
      });

      $scope.selectChange();
    }

    $scope.goto = function (location) {
      $scope.map.setView(location.getLatLng());
      if (location.options.type === 'Router') {
        location.expandRouters = true;
        if ($scope.selectedLocation != undefined) {
          $scope.selectedLocation.closePopup();
          $scope.selectedLocation.options.zIndexOffset = 0;
          setIcon($scope.selectedLocation, 'default');
        }
        $scope.selectedLocation = location;
        $scope.selectedLocation.options.zIndexOffset = 1000;
        setIcon($scope.selectedLocation, 'active');
        $scope.selectedLocation.openPopup();
      }
      else {
        location.options.expandPeers = true;
        if ($scope.selectedLocation != undefined) {
          $scope.selectedLocation.closePopup();
          $scope.selectedLocation.options.zIndexOffset = 0;
          setIcon($scope.selectedLocation, 'default');
        }
        $scope.selectedLocation = location;
        $scope.selectedLocation.options.zIndexOffset = 1000;
        setIcon($scope.selectedLocation, 'active');
        $scope.selectedLocation.openPopup();
      }
    };

    function getNodes() {
      nodesPromise = apiFactory.getPeerNodes($scope.selectedPeer.peer_hash_id);
      nodesPromise.success(function (result) {
        nodes = [];
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
          nodes.push(
            {
              id: nodesData[i].hash_id,
              routerId: routerId,
              routerIP: nodesData[i].RouterIP,
              country: nodesData[i].country,
              stateprov: nodesData[i].stateprov,
              city: nodesData[i].city,
              //latitude: latitudes[i],
              //longitude: longitudes[i],
              latitude: nodesData[i].latitude,
              longitude: nodesData[i].longitude,
              level: i
            });
          var location = [nodesData[i].city, nodesData[i].stateprov, nodesData[i].country].join(', ');
          nodesData[i].location = location;
          $scope.lsTableOptions.data = nodesData;
        }
      }).error(function (error) {
        console.log(error.message);
      });
    }

    function getLinks() {
      linksPromise = apiFactory.getPeerLinks($scope.selectedPeer.peer_hash_id);
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
      var selectedLinks = getSelectedLinks(SPFdata);
      var linksLayer = topo.getLayer('links');
      var linksLayerHighlightElements = linksLayer.highlightedElements();
      linksLayerHighlightElements.addRange(selectedLinks);

      for (var i = 0; i < SPFdata.length; i++) {
        SPFdata[i].prefixWithLen = SPFdata[i].prefix + "/" + SPFdata[i].prefix_len;
        SPFdata[i].neighbor_addr_adjusted = (SPFdata[i].neighbor_addr == null) ? 'local' : SPFdata[i].neighbor_addr;
      }
      $scope.SPFtableOptions.data = SPFdata;
      $scope.show = true;
    }

    function getSelectedLinks(SPFdata) {
      var selectedLinks = [];
      for (var i = 0; i < SPFdata.length; i++) {
        var path_hash_ids = SPFdata[i].path_hash_ids.split(",");
        var neighbor_addr = SPFdata[i].neighbor_addr;
        for (var j = 0; j < path_hash_ids.length - 1; j++) {
          var selectedLink = findLink(path_hash_ids[j], path_hash_ids[j + 1], neighbor_addr);
          // nx.extend(linksObj, _linksObj);
          if (selectedLinks.indexOf(selectedLink) == -1) {
            selectedLinks.push(selectedLink);
          }
        }
      }
      return selectedLinks;
    }

    //draw the path
    $scope.drawPath = function (path_hash_ids, neighbor_addr) {
      var pathLayer = topo.getLayer("paths");
      nx.each(pathLayer.paths(), function (path) {
        path.dispose();
      });
      pathLayer.clear();

      var selectedNodes = path_hash_ids.split(",");
      var selectedLinks = [];
      for (var j = 0; j < selectedNodes.length - 1; j++) {
        var selectedLink = findLink(selectedNodes[j], selectedNodes[j + 1], neighbor_addr);
        selectedLinks.push(selectedLink);
      }

      if (selectedLinks.length != 0) {
        var reverse = false;
        if (selectedLinks.length == 1 && selectedNodes[0] > selectedNodes[1]) {
          reverse = true;
        }
        var path = new nx.graphic.Topology.Path({
          links: selectedLinks,
          arrow: 'cap',
          pathStyle: {
            'stroke': '#9ec654',
            'stroke-width': '0px',
            fill: '#9ec654'
          },
          pathWidth: 4,
          reverse: reverse
        });

        pathLayer.addPath(path);
      }
    };

    function findLink(nodeId1, nodeId2, neighbor_addr) {
      var links = nx.util.values(topo.getLinksByNode(nodeId1, nodeId2));

      if (links.length == 1) {
        return links[0];
      }
      else {
        for (var i = 0; i < links.length; i++) {
          var interfaceIP = links[i]._model._data.interfaceIP;
          var neighborIP = links[i]._model._data.neighborIP;
          if (interfaceIP == neighbor_addr || neighborIP == neighbor_addr) {
            return links[i];
          }
        }
        //console.log(links[0].id());
        return links[0];
      }
    }

    function clear() {
      var linksLayer = topo.getLayer('links');
      var linksLayerHighlightElements = linksLayer.highlightedElements();
      linksLayerHighlightElements.clear();

      var pathLayer = topo.getLayer("paths");
      nx.each(pathLayer.paths(), function (path) {
        path.dispose();
      });
      pathLayer.clear();
    }

    nx.define('ExtendLink', nx.graphic.Topology.Link, {
      properties: {
        sourceLabel: null,
        targetLabel: null
      },
      view: function (view) {
        view.content.push({
          name: 'source',
          type: 'nx.graphic.Text',
          props: {
            'class': 'link-label',
            'alignment-baseline': 'text-after-edge',
            'text-anchor': 'start'
          }
        }, {
          name: 'target',
          type: 'nx.graphic.Text',
          props: {
            'class': 'link-label',
            'alignment-baseline': 'text-after-edge',
            'text-anchor': 'end'
          }
        });

        return view;
      },
      methods: {
        update: function () {

          this.inherited();

          var el, point;

          var line = this.line();
          var angle = line.angle();
          var stageScale = this.stageScale();

          // pad line
          line = line.pad(18 * stageScale, 18 * stageScale);

          if (this.sourceLabel()) {
            el = this.view('source');
            point = line.start;
            el.set('x', point.x);
            el.set('y', point.y);
            el.set('text', this.sourceLabel());
            el.set('transform', 'rotate(' + angle + ' ' + point.x + ',' + point.y + ')');
            el.setStyle('font-size', 12 * stageScale);
          }


          if (this.targetLabel()) {
            el = this.view('target');
            point = line.end;
            el.set('x', point.x);
            el.set('y', point.y);
            el.set('text', this.targetLabel());
            el.set('transform', 'rotate(' + angle + ' ' + point.x + ',' + point.y + ')');
            el.setStyle('font-size', 12 * stageScale);
          }
        }
      }
    });
    /**************** Table View ***************/
    $scope.lsTableInitHeight = 300;
    $scope.lsTableOptions = {
      enableFiltering: false,
      enableRowSelection: true,
      enableRowHeaderSelection: false,
      enableColumnResizing: true,
      multiSelect: false,
      height: $scope.lsTableInitHeight,
      rowHeight: 25,
      gridFootHeight: 0,
      showGridFooter: false,
      enableVerticalScrollbar: true,
      rowTemplate: '<div class="hover-row-highlight"><div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div></div>',
      columnDefs: [
        {field: "IGP_RouterId", displayName: "IGP Router ID", width: '17%'},
        {field: "RouterId", displayName: "Router ID", width: '17%'},
        {field: "ISISAreaId", displayName: "ISIS Area ID", width: '10%'},
        {field: "RouterName", displayName: "Hostname", width: '*'},
        {field: "location", displayName: "Location", width: '25%'}
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      }
    };
  }]);
