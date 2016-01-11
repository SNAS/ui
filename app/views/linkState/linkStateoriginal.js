////'use strict';
//
///**
// * @ngdoc function
// * @name bmpUiApp.controller:TopologyController
// * @description
// * # TopologyController
// * Controller of the Topology page
// */
//
//angular.module('bmpUiApp')
//  .controller('linkStateController', ['$scope', 'apiFactory', '$timeout', function ($scope, apiFactory, $timeout) {
//
//    getPeers();
//
//    $scope.protocol;
//    $scope.show = false;
//    var nodesPromise, linksPromise;
//    var nodes = [];
//    var links = [];
//    var SPFdata;
//
//    var latitudes = [63.391326, 47.6062, 29.7633, 41.85, 33.7861178428426, 44.98, 34.0522, 39.0997, 40.7879, 38.8951,
//      45.5234, 42.6526, 25.7743, 32.7153, 42.3584, 36.137242513163];
//    var longitudes = [-149.8286774, -122.332, -95.3633, -87.65, -84.1959236252621, -93.2638, -118.244, -94.5786,
//      -74.0143, -77.0364, -122.676, -73.7562, -80.1937, -117.157, -71.0598, -120.754451723841];
//
//    // initialize a topology
//    //(function(nx, global) {
//    //nx.define('LinkStateTopology.', nx.ui.Component, {
//    //  view: {
//    //    content: {
//    //      name: 'topo',
//    //      type: 'nx.graphic.Topology',
//    //      props: {
//    var topo = new nx.graphic.Topology({
//      //width: 1000,
//      //height: 500,
//      padding:10,
//      nodeConfig: {
//        // label: 'model.index',
//        label: 'model.routerId',
//        iconType: 'router'
//      },
//      linkConfig: {
//        //  label :'model.id',
//        linkType: 'parallel',
//        width: 2,
//        label: 'model.igp_metric',
//        sourceLabel: 'model.sourceLabel',
//        targetLabel: 'model.targetLabel'
//      },
//      nodeSetConfig: {
//        label: 'model.id',
//        iconType: 'model.iconType'
//      },
//      tooltipManagerConfig: {
//        showNodeTooltip: false
//      },
//      dataProcessor: 'force',
//      identityKey: 'id',
//      adaptive: true,
//      showIcon: true,
//      scalable: false,
//      layoutType: 'USMap',
//      //layoutType: 'WorldMap',
//      layoutConfig: {
//        //worldTopoJson: 'lib/world-50m.json',
//        longitude: 'model.longitude',
//        latitude: 'model.latitude'
//      },
//      linkInstanceClass: 'ExtendLink'
//      //}
//      //    }
//      //  }
//    });
//    //})(nx, nx.global);
//
//    //var topo = new LinkStateTopology();
//
//    //SPF Table options
//    $scope.SPFtableOptions = {
//      enableRowSelection: true,
//      enableRowHeaderSelection: false,
//      enableColumnResizing: true,
//      multiSelect: false,
//      selectionRowHeaderWidth: 35,
//      rowHeight: 25,
//      gridFooterHeight: 0,
//      showGridFooter: true,
//      enableHorizontalScrollbar: 0,
//      enableVerticalScrollbar: 1,
//      rowTemplate: '<div class="hover-row-highlight"><div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div></div>',
//
//      columnDefs: [
//        {field: 'prefixWithLen', displayName: 'Prefix', width: '*'},
//        //{field: 'prefix_len', displayName: 'Prefix Length', width: '*'},
//        {field: 'Type', displayName: 'Type', width: '*'},
//        {field: 'metric', displayName: 'Metric', width: '*'},
//        {field: 'src_router_id', displayName: 'Source Router Id', width: '*'},
//        {field: 'nei_router_id', displayName: 'Neighbor Router Id', width: '*'},
//        {field: 'neighbor_addr_adjusted', displayName: 'Neighbor Address', width: '*'},
//      ],
//
//      rowTemplate: '<div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',
//      onRegisterApi: function (gridApi) {
//        $scope.gridApi = gridApi;
//        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
//          var path = row.entity.path_hash_ids;
//          var neighbor_addr = row.entity.neighbor_addr;
//          $scope.drawPath(path, neighbor_addr);
//        });
//      }
//    };
//
//    topo.view('stage').upon('mousewheel', function (sender, event) {
//      return false;
//    });
//
//    topo.on('clickStage', function (sender, event) {
//      clear();
//      $scope.SPFtableOptions.data = {};
//      $scope.show = false;
//      $scope.$apply();
//    });
//
//    topo.upon('enterNode', function (sender, node) {
//      return false;
//    });
//
//    topo.upon('dragNode', function (sender, node) {
//      return false;
//    });
//
//    topo.on('clickNode', function (sender, node) {
//      var selectedRouterId = node['_label'];
//
//      clear();
//      topo.selectedNodes().clear();
//      topo.selectedNodes().add(node);
//
//      if ($scope.protocol == "OSPF") {
//        apiFactory.getSPFospf($scope.selectedPeer.peer_hash_id, selectedRouterId).success(function (result) {
//            SPFdata = result.igp_ospf.data;
//            drawShortestPathTree(SPFdata);
//          }
//        ).error(function (error) {
//            console.log(error.message);
//          });
//      }
//      else if ($scope.protocol == "ISIS") {
//        apiFactory.getSPFisis($scope.selectedPeer.peer_hash_id, selectedRouterId).success(function (result) {
//            SPFdata = result.igp_isis.data;
//            drawShortestPathTree(SPFdata);
//          }
//        ).error(function (error) {
//            console.log(error.message);
//          });
//      }
//    });
//
//    $scope.selectChange = function () {
//      getNodes();
//      getLinks();
//
//      $scope.topologyIsLoad = true; //start loading
//      linksPromise.success(function () {
//        nodesPromise.success(function () {
//          var topologyData = {
//            nodes: nodes,
//            links: links,
//            //nodeSet: [{
//            //  id: 1,
//            //  type: 'nodeSet',
//            //  nodes: [nodes[8].id, nodes[9].id],
//            //  //root: nodes[8].id,
//            //  latitude: nodes[8].latitude,
//            //  longitude: nodes[8].longitude,
//            //  name: "Node set 1",
//            //  iconType: 'server'
//            //}]
//          };
//          topo.data(topologyData);
//
//          $scope.topologyIsLoad = false; //stop loading
//
//          $scope.SPFtableOptions.data = {};
//          $scope.show = false;
//        });
//      });
//    };
//
//    function getPeers(){
//      apiFactory.getLinkStatePeers().success(
//        function (result){
//          $scope.peerData = result.ls_peers.data;
//          if ($scope.peerData == 0) {
//            $scope.topologyIsLoad = false;
//          } else {
//            $scope.selectedPeer = $scope.peerData[0];
//            init();
//          }
//        })
//        .error(function (error) {
//          console.log(error.message);
//        });
//    }
//
//    function init() {
//      var app = new nx.ui.Application();
//      app.container(document.getElementById('link_state_topology'));
//      topo.attach(app);
//
//      //hierarchical Layout
//      //var layout = topo.getLayout('hierarchicalLayout');
//      //layout.direction('horizontal');
//      //// layout.sortOrder(['Core', 'Distribution', 'Access']);
//      //layout.levelBy(function (node, model) {
//      //  var level = model._data.level % 3;
//      //  //   var level = Math.floor(model._data.level/5);
//      //  return level;
//      //});
//      //topo.activateLayout('hierarchicalLayout');
//
//      $scope.selectChange();
//    }
//
//    function getNodes() {
//      nodesPromise = apiFactory.getPeerNodes($scope.selectedPeer.peer_hash_id);
//      nodesPromise.success(function (result) {
//        nodes = [];
//        var nodesData = result.v_ls_nodes.data;
//        for (var i = 0; i < result.v_ls_nodes.size; i++) {
//          var hash_id = nodesData[i].hash_id;
//          var latitude = nodesData[i].latitude;
//          var longitude = nodesData[i].longitude;
//          var routerId;
//          if (nodesData[i].protocol == "OSPFv2") {
//            routerId = nodesData[i].IGP_RouterId;
//            $scope.protocol = 'OSPF';
//          }
//          else {
//            routerId = nodesData[i].RouterId;
//            $scope.protocol = 'ISIS';
//          }
//          nodes.push(
//            {
//              id: hash_id,
//              routerId: routerId,
//              latitude: latitude != null ? latitude : latitudes[i],
//              longitude: longitude != null ? longitude : longitudes[i],
//              //latitude: latitudes[i],
//              //longitude: longitudes[i],
//              level: i
//            });
//        }
//      }).error(function (error) {
//        console.log(error.message);
//      });
//    }
//
//    function getLinks() {
//      linksPromise = apiFactory.getPeerLinks($scope.selectedPeer.peer_hash_id);
//      linksPromise.success(function (result) {
//        links = [];
//        var linksData = result.v_ls_links.data;
//        var reverseLinks = [];
//        for (var i = 0; i < result.v_ls_links.size; i++) {
//          var source = linksData[i].local_node_hash_id;
//          var target = linksData[i].remote_node_hash_id;
//          var igp_metric = linksData[i].igp_metric;
//          var interfaceIP = linksData[i].InterfaceIP;
//          var neighborIP = linksData[i].NeighborIP;
//          if (source < target) {
//            links.push(
//              {
//                id: i,
//                source: source,
//                target: target,
//                igp_metric: igp_metric,
//                interfaceIP: interfaceIP,
//                neighborIP: neighborIP
//              });
//          }
//          else {
//            reverseLinks.push(
//              {
//                id: i,
//                source: source,
//                target: target,
//                igp_metric: igp_metric,
//                interfaceIP: interfaceIP,
//                neighborIP: neighborIP
//              });
//          }
//        }
//
//        for (var i = 0; i < reverseLinks.length; i++) {
//          for (var j = 0; j < links.length; j++) {
//            if (reverseLinks[i].target == links[j].source && reverseLinks[i].source == links[j].target
//              && reverseLinks[i].neighborIP == links[j].interfaceIP && reverseLinks[i].igp_metric != links[j].igp_metric) {
//              links[j] =
//              {
//                id: links[j].id,
//                source: links[j].source,
//                target: links[j].target,
//                sourceLabel: links[j].igp_metric,
//                targetLabel: reverseLinks[i].igp_metric,
//                interfaceIP: links[j].interfaceIP,
//                neighborIP: links[j].neighborIP
//              };
//              break;
//            }
//          }
//        }
//      }).error(function (error) {
//        console.log(error.message);
//      });
//    }
//
//    function drawShortestPathTree(SPFdata) {
//      var selectedLinks = getSelectedLinks(SPFdata);
//      var linksLayer = topo.getLayer('links');
//      var linksLayerHighlightElements = linksLayer.highlightedElements();
//      linksLayerHighlightElements.addRange(selectedLinks);
//
//      for (var i = 0; i < SPFdata.length; i++) {
//        SPFdata[i].prefixWithLen = SPFdata[i].prefix + "/" + SPFdata[i].prefix_len;
//        SPFdata[i].neighbor_addr_adjusted = (SPFdata[i].neighbor_addr == null) ? 'local' : SPFdata[i].neighbor_addr;
//      }
//      $scope.SPFtableOptions.data = SPFdata;
//      $scope.show = true;
//    }
//
//    function getSelectedLinks(SPFdata) {
//      var selectedLinks = [];
//      for (var i = 0; i < SPFdata.length; i++) {
//        var path_hash_ids = SPFdata[i].path_hash_ids.split(",");
//        var neighbor_addr = SPFdata[i].neighbor_addr;
//        for (var j = 0; j < path_hash_ids.length - 1; j++) {
//          var selectedLink = findLink(path_hash_ids[j], path_hash_ids[j + 1], neighbor_addr);
//          // nx.extend(linksObj, _linksObj);
//          if (selectedLinks.indexOf(selectedLink) == -1) {
//            selectedLinks.push(selectedLink);
//          }
//        }
//      }
//      return selectedLinks;
//    }
//
//    //draw the path
//    $scope.drawPath = function (path_hash_ids, neighbor_addr) {
//      var pathLayer = topo.getLayer("paths");
//      nx.each(pathLayer.paths(), function (path) {
//        path.dispose();
//      });
//      pathLayer.clear();
//
//      var selectedNodes = path_hash_ids.split(",");
//      var selectedLinks = [];
//      for (var j = 0; j < selectedNodes.length - 1; j++) {
//        var selectedLink = findLink(selectedNodes[j], selectedNodes[j + 1], neighbor_addr);
//        selectedLinks.push(selectedLink);
//      }
//
//      if (selectedLinks.length != 0) {
//        var reverse = false;
//        if (selectedLinks.length == 1 && selectedNodes[0] > selectedNodes[1]) {
//          reverse = true;
//        }
//        var path = new nx.graphic.Topology.Path({
//          links: selectedLinks,
//          arrow: 'cap',
//          pathStyle: {
//            'stroke': '#9ec654',
//            'stroke-width': '0px',
//            fill: '#9ec654'
//          },
//          pathWidth: 4,
//          reverse: reverse
//        });
//
//        pathLayer.addPath(path);
//      }
//    };
//
//    function findLink(nodeId1, nodeId2, neighbor_addr) {
//      var links = nx.util.values(topo.getLinksByNode(nodeId1, nodeId2));
//
//      if (links.length == 1) {
//        return links[0];
//      }
//      else {
//        for (var i = 0; i < links.length; i++) {
//          var interfaceIP = links[i]._model._data.interfaceIP;
//          var neighborIP = links[i]._model._data.neighborIP;
//          if (interfaceIP == neighbor_addr || neighborIP == neighbor_addr) {
//            return links[i];
//          }
//        }
//        //console.log(links[0].id());
//        return links[0];
//      }
//    }
//
//    function clear() {
//      var linksLayer = topo.getLayer('links');
//      var linksLayerHighlightElements = linksLayer.highlightedElements();
//      linksLayerHighlightElements.clear();
//
//      var pathLayer = topo.getLayer("paths");
//      nx.each(pathLayer.paths(), function (path) {
//        path.dispose();
//      });
//      pathLayer.clear();
//    }
//
//    nx.define('ExtendLink', nx.graphic.Topology.Link, {
//      properties: {
//        sourceLabel: null,
//        targetLabel: null
//      },
//      view: function (view) {
//        view.content.push({
//          name: 'source',
//          type: 'nx.graphic.Text',
//          props: {
//            'class': 'link-label',
//            'alignment-baseline': 'text-after-edge',
//            'text-anchor': 'start'
//          }
//        }, {
//          name: 'target',
//          type: 'nx.graphic.Text',
//          props: {
//            'class': 'link-label',
//            'alignment-baseline': 'text-after-edge',
//            'text-anchor': 'end'
//          }
//        });
//
//        return view;
//      },
//      methods: {
//        update: function () {
//
//          this.inherited();
//
//          var el, point;
//
//          var line = this.line();
//          var angle = line.angle();
//          var stageScale = this.stageScale();
//
//          // pad line
//          line = line.pad(18 * stageScale, 18 * stageScale);
//
//          if (this.sourceLabel()) {
//            el = this.view('source');
//            point = line.start;
//            el.set('x', point.x);
//            el.set('y', point.y);
//            el.set('text', this.sourceLabel());
//            el.set('transform', 'rotate(' + angle + ' ' + point.x + ',' + point.y + ')');
//            el.setStyle('font-size', 12 * stageScale);
//          }
//
//
//          if (this.targetLabel()) {
//            el = this.view('target');
//            point = line.end;
//            el.set('x', point.x);
//            el.set('y', point.y);
//            el.set('text', this.targetLabel());
//            el.set('transform', 'rotate(' + angle + ' ' + point.x + ',' + point.y + ')');
//            el.setStyle('font-size', 12 * stageScale);
//          }
//        }
//      }
//    });
//  }
//  ])
//;
