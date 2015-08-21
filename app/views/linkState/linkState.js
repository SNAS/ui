//'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:TopologyController
 * @description
 * # TopologyController
 * Controller of the Topology page
 */

angular.module('bmpUiApp')
  .controller('linkStateController', ['$scope', 'apiFactory', '$timeout', function ($scope, apiFactory, $timeout) {

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
    var topo = new nx.graphic.Topology({
      //width: 1000,
      //height: 500,
      padding:10,
      nodeConfig: {
        // label: 'model.index',
        label: 'model.routerId',
        iconType: 'router'
      },
      linkConfig: {
        //  label :'model.id',
        linkType: 'parallel',
        width: 2,
        label: 'model.igp_metric',
        sourceLabel: 'model.sourceLabel',
        targetLabel: 'model.targetLabel'
      },
      nodeSetConfig: {
        label: 'model.id',
        iconType: 'model.iconType'
      },
      tooltipManagerConfig: {
        showNodeTooltip: false
      },
      dataProcessor: 'force',
      identityKey: 'id',
      adaptive: true,
      showIcon: true,
      scalable: false,
      layoutType: 'USMap',
      //layoutType: 'WorldMap',
      layoutConfig: {
        //worldTopoJson: 'lib/world-50m.json',
        longitude: 'model.longitude',
        latitude: 'model.latitude'
      },
      linkInstanceClass: 'ExtendLink'
      //}
      //    }
      //  }
    });
    //})(nx, nx.global);

    //var topo = new LinkStateTopology();

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

      rowTemplate: '<div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          var path = row.entity.path_hash_ids;
          var neighbor_addr = row.entity.neighbor_addr;
          $scope.drawPath(path, neighbor_addr);
        });
      }
    };

    topo.view('stage').upon('mousewheel', function (sender, event) {
      return false;
    });

    topo.on('clickStage', function (sender, event) {
      clear();
      $scope.SPFtableOptions.data = {};
      $scope.show = false;
      $scope.$apply();
    });

    topo.upon('enterNode', function (sender, node) {
      return false;
    });

    topo.upon('dragNode', function (sender, node) {
      return false;
    });

    topo.on('clickNode', function (sender, node) {
      var selectedRouterId = node['_label'];

      clear();
      topo.selectedNodes().clear();
      topo.selectedNodes().add(node);

      if ($scope.protocol == "OSPF") {
        apiFactory.getSPFospf($scope.selectedPeer.peer_hash_id, selectedRouterId).success(function (result) {
            SPFdata = result.igp_ospf.data;
            drawShortestPathTree(SPFdata);
          }
        ).error(function (error) {
            console.log(error.message);
          });
      }
      else if ($scope.protocol == "ISIS") {
        apiFactory.getSPFisis($scope.selectedPeer.peer_hash_id, selectedRouterId).success(function (result) {
            SPFdata = result.igp_isis.data;
            drawShortestPathTree(SPFdata);
          }
        ).error(function (error) {
            console.log(error.message);
          });
      }
    });

    $scope.selectChange = function () {
      getNodes();
      getLinks();

      $scope.topologyIsLoad = true; //start loading
      linksPromise.success(function () {
        nodesPromise.success(function () {
          var topologyData = {
            nodes: nodes,
            links: links,
            //nodeSet: [{
            //  id: 1,
            //  type: 'nodeSet',
            //  nodes: [nodes[8].id, nodes[9].id],
            //  //root: nodes[8].id,
            //  latitude: nodes[8].latitude,
            //  longitude: nodes[8].longitude,
            //  name: "Node set 1",
            //  iconType: 'server'
            //}]
          };
          topo.data(topologyData);

          $scope.topologyIsLoad = false; //stop loading

          $scope.SPFtableOptions.data = {};
          $scope.show = false;
        });
      });
    };

    function getPeers(){
      apiFactory.getLinkStatePeers().success(
        function (result){
          $scope.peerData = result.ls_peers.data;
          $scope.selectedPeer = $scope.peerData[0];
          init();
        })
        .error(function (error) {
          console.log(error.message);
        });
    }

    function init() {
      var app = new nx.ui.Application();
      app.container(document.getElementById('link_state_topology'));
      topo.attach(app);

      //hierarchical Layout
      //var layout = topo.getLayout('hierarchicalLayout');
      //layout.direction('horizontal');
      //// layout.sortOrder(['Core', 'Distribution', 'Access']);
      //layout.levelBy(function (node, model) {
      //  var level = model._data.level % 3;
      //  //   var level = Math.floor(model._data.level/5);
      //  return level;
      //});
      //topo.activateLayout('hierarchicalLayout');

      $scope.selectChange();
    }

    function getNodes() {
      nodesPromise = apiFactory.getPeerNodes($scope.selectedPeer.peer_hash_id);
      nodesPromise.success(function (result) {
        nodes = [];
        var nodesData = result.v_ls_nodes.data;
        for (var i = 0; i < result.v_ls_nodes.size; i++) {
          var hash_id = nodesData[i].hash_id;
          var latitude = nodesData[i].latitude;
          var longitude = nodesData[i].longitude;
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
              id: hash_id,
              routerId: routerId,
              latitude: latitude != null ? latitude : latitudes[i],
              longitude: longitude != null ? longitude : longitudes[i],
              //latitude: latitudes[i],
              //longitude: longitudes[i],
              level: i
            });
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


    //  $scope.peerHashId = "16ea27797629984cc5fd8c7a210b082d"; //ospf
    //  //   $scope.peerHashId = "42e3715aaec11635f6dded418a1fe8f2"; //isis
    //
    //  $scope.topologyOptions = {
    //    height: '500px',
    //    //dragNodes:false,
    //    //configurePhysics: true,
    //    //hover: true,
    //     stabilize:true,
    //    smoothCurves:{
    //      dynamic: true,
    //      type: "straightCross"
    //    },
    //
    //    //hierarchicalLayout: {
    //    //  direction: "UD",
    //    //  layout: "direction"
    //    //},
    //
    //
    //    //physics: {
    //    //  barnesHut: {
    //    //    enabled: true,
    //    //    gravitationalConstant: -2000,
    //    //    centralGravity: 0.1,
    //    //    springLength: 95,
    //    //    springConstant: 0.04,
    //    //    damping: 0.09
    //    //  },
    //    //  repulsion: {
    //    //    centralGravity: 0.1,
    //    //    springLength: 50,
    //    //    springConstant: 0.05,
    //    //    nodeDistance: 100,
    //    //    damping: 0.09
    //    //  },
    //    //  hierarchicalRepulsion: {
    //    //    //centralGravity: 0.5,
    //    //    //springLength: 150,
    //    //    //springConstant: 0.01,
    //    //    //nodeDistance: 60,
    //    //    //damping: 0.09
    //    //  }
    //    //},
    //
    //    nodes: {
    //      color: {
    //        background: '#9ec654',
    //        border: '#9ec654',
    //        highlight: {
    //          background: '#f7a031',
    //          border: '#f7a031'
    //        }
    //      },
    //      radius: 24
    //    }
    //  };
    //
    //  var nodes = [];
    //  var edges = [];
    //  $scope.topologyData = {};
    //
    //  //get nodes
    //  $(function () {
    //    //var data = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" '
    //    //+ 'width="35px" height="35px" viewBox="-17 775 35 35" enable-background="new -17 775 35 35" xml:space="preserve"> '
    //    //  + ' <g> <path fill="#FFFFFF" stroke="#CECECE" stroke-miterlimit="10" d="M0.732,776.464c8.986,0,16.267,7.282,16.267,16.271 '
    //    //  + 'C17,801.716,9.719,809,0.732,809c-8.986,0-16.269-7.284-16.269-16.266C-15.537,783.746-8.253,776.464,0.732,776.464z"/> '
    //    //  + '<path fill="#333333" d="M0.732,780.452c-6.666,0-12.068,5.4-12.068,12.068c0,6.663,5.402,12.062,12.068,12.062 '
    //    //  + 'c6.662,0,12.066-5.399,12.066-12.062C12.798,785.853,7.395,780.452,0.732,780.452z M-2.065,785.031L-2.065,785.031l2.229-2.226 '
    //    //  + 'c0.171-0.168,0.392-0.251,0.617-0.251l0,0c0.007,0,0.007,0,0.014,0c0.047,0,0.104,0.006,0.151,0.015 '
    //    //  + 'c0.043,0.011,0.087,0.023,0.127,0.041c0.01,0.003,0.02,0.003,0.027,0.011c0.121,0.05,0.224,0.122,0.312,0.21l2.195,2.204 '
    //    //  + 'c0.339,0.339,0.339,0.882,0,1.221l0,0c-0.337,0.338-0.884,0.331-1.219,0L1.632,785.5l-0.011,4.576 '
    //    //  + 'c-0.006,0.477-0.385,0.863-0.869,0.858c-0.476,0-0.861-0.39-0.858-0.868l0.014-4.572l-0.753,0.754c-0.34,0.339-0.887,0.332-1.22,0 '
    //    //  + 'C-2.403,785.909-2.398,785.363-2.065,785.031z M-4.562,795.398L-4.562,795.398c-0.338-0.341-0.338-0.884,0-1.22l0.754-0.756 '
    //    //  + 'l-4.578-0.008c-0.475-0.005-0.864-0.389-0.857-0.867c0-0.475,0.387-0.865,0.868-0.86l4.572,0.012l-0.753-0.754 '
    //    //  + 'c-0.339-0.339-0.334-0.886,0-1.218c0.338-0.335,0.884-0.335,1.217,0l0,0l2.223,2.231c0.169,0.165,0.253,0.391,0.253,0.614l0,0 '
    //    //  + 'c0,0.006,0,0.006,0,0.012c0,0.048-0.008,0.104-0.017,0.151c-0.01,0.045-0.024,0.087-0.038,0.128 '
    //    //  + 'c-0.007,0.01-0.007,0.021-0.013,0.026c-0.047,0.122-0.12,0.222-0.212,0.312l-2.203,2.196 '
    //    //  + 'C-3.683,795.738-4.229,795.738-4.562,795.398z M3.536,800.012L3.536,800.012l-2.229,2.222c-0.171,0.172-0.396,0.252-0.616,0.252 '
    //    //  + 'l0,0c-0.007,0-0.007,0-0.014,0c-0.046,0-0.104-0.003-0.151-0.013c-0.043-0.013-0.087-0.023-0.127-0.037 '
    //    //  + 'c-0.01-0.008-0.02-0.008-0.027-0.013c-0.12-0.051-0.225-0.12-0.312-0.212l-2.196-2.203c-0.339-0.337-0.339-0.878,0-1.216l0,0 '
    //    //  + 'c0.338-0.343,0.884-0.336,1.22,0l0.752,0.75l0.013-4.575c0.003-0.476,0.386-0.864,0.869-0.857c0.475,0,0.861,0.388,0.857,0.868 '
    //    //  + 'l-0.013,4.573l0.754-0.755c0.339-0.34,0.885-0.334,1.22,0C3.875,799.135,3.875,799.68,3.536,800.012z M9.829,793.359l-4.573-0.012 '
    //    //  + 'l0.755,0.755c0.339,0.337,0.332,0.885,0,1.22c-0.339,0.331-0.885,0.331-1.22,0l0,0l-2.224-2.231 '
    //    //  + 'c-0.167-0.166-0.251-0.391-0.251-0.616l0,0c0-0.005,0-0.005,0-0.01c0-0.051,0.007-0.105,0.017-0.152 '
    //    //  + 'c0.009-0.044,0.023-0.086,0.037-0.128c0.006-0.009,0.006-0.019,0.014-0.026c0.047-0.12,0.121-0.224,0.212-0.311l2.201-2.197 '
    //    //  + 'c0.339-0.339,0.878-0.339,1.217,0l0,0c0.339,0.34,0.336,0.885,0,1.218l-0.754,0.754l4.58,0.015 '
    //    //  + 'c0.472,0.002,0.861,0.385,0.857,0.866C10.696,792.979,10.308,793.363,9.829,793.359z"/> '
    //    //  + '</g> </svg>';
    //    //var DOMURL = window.URL || window.webkitURL || window;
    //    ////var img = new Image();
    //    //var svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
    //    //var url = DOMURL.createObjectURL(svg);
    //
    //    apiFactory.getPeerNodes($scope.peerHashId).success(function (result) {
    //      var nodesData = result.v_ls_nodes.data;
    //      for (var i = 0; i < result.v_ls_nodes.size; i++) {
    //        var hash_id = nodesData[i].hash_id;
    //        var label;
    //        if (nodesData[i].protocol == "OSPFv2") {
    //          label = nodesData[i].IGP_RouterId;
    //          $scope.protocol = 'ospf';
    //        }
    //        else {
    //          label = nodesData[i].RouterId;
    //          $scope.protocol = 'isis';
    //        }
    //
    //        nodes.push(
    //          {
    //            id: hash_id,
    //            label: label,
    //            image: "/images/routerMed.png",
    //            shape: 'image'
    //          });
    //
    //      }
    //    }).error(function (error) {
    //      console.log(error.message);
    //    });
    //  })
    //
    //  //get edges
    //  $(function () {
    //    apiFactory.getPeerLinks($scope.peerHashId).success(function (result) {
    //      var linksData = result.v_ls_links.data;
    //      for (var i = 0; i < result.v_ls_links.size; i++) {
    //        var from = linksData[i].local_node_hash_id;
    //        var to = linksData[i].remote_node_hash_id;
    //        var igp_metric = linksData[i].igp_metric;
    //        if (from < to) {
    //          edges.push(
    //            {
    //              id: i,
    //              from: from,
    //              to: to,
    //              label: igp_metric,
    //              style: 'line'
    //            });
    //        }
    //        //else {
    //        //  for (var j = 0; j < edges.length; j++) {
    //        //    if (from == edges[j].to && to == edges[j].from && igp_metric != edges[j].label) {
    //        //      edges.push(
    //        //        {
    //        //          id: i,
    //        //          from: from,
    //        //          to: to,
    //        //          label: igp_metric,
    //        //          style: 'line'
    //        //        }
    //        //      );
    //        //      edges[j].style = 'arrow';
    //        //      break;
    //        //    }
    //        //  }
    //        //}
    //      }
    //    }).error(function (error) {
    //      console.log(error.message);
    //    });
    //  })
    //
    //  $timeout(function () {
    //    $scope.topologyData = {
    //      nodes: nodes,
    //      edges: edges
    //    };
    //
    //  })
    //
    //  //SPF Table options
    //  $scope.SPFtableOptions = {
    //    enableRowSelection: true,
    //    enableRowHeaderSelection: false,
    //    multiSelect: false,
    //    selectionRowHeaderWidth: 35,
    //    //rowHeight: 35,
    //
    //    columnDefs: [
    //      {field: 'prefix', displayName: 'Prefix', width: '*'},
    //      {field: 'prefix_len', displayName: 'Prefix Length', width: '*'},
    //      {field: 'Type', displayName: 'Type', width: '*'},
    //      {field: 'metric', displayName: 'Metric', width: '*'},
    //      {field: 'src_router_id', displayName: 'Source Router Id', width: '*'},
    //      {field: 'nei_router_id', displayName: 'Neighbor Router Id', width: '*'},
    //      {field: 'neighbor_addr_adjusted', displayName: 'Neighbor Address', width: '*'},
    //    ],
    //
    //    rowTemplate: '<div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',
    //    onRegisterApi: function (gridApi) {
    //      $scope.gridApi = gridApi;
    //      gridApi.selection.on.rowSelectionChanged($scope, function (row) {
    //        var path = row.entity.path_hash_ids;
    //        $scope.drawPath(path);
    //      });
    //    }
    //  };
    //
    //  //SPF Table data
    //  $scope.SPFtableOptions.data = {};
    //}])
    //
    //.directive('topology', ['apiFactory', '$timeout', function (apiFactory, $timeout) {
    //  return {
    //    templateUrl: "views/linkState/topology.html",
    //    restrict: 'AE',
    //    replace: 'true',
    //    //scope: {
    //    //  data: '=',
    //    //  options: '=',
    //    //  protocol: '=',
    //    //  peerHashId: '=',
    //    //  getSpfTable: '&',
    //    //  path: '='
    //    //},
    //
    //    link: function ($scope, element, attrs) {
    //      var container = element[0];
    //      var network = {};
    //     // var flag = false;
    //      var SPFdata;
    //
    //      $timeout(function () {
    //          network = new vis.Network(container, $scope.topologyData, $scope.topologyOptions);
    //          network.on('select', click);
    //        }, 1000
    //      );
    //
    //      function click() {
    //        var selectedNodeHashId = network.getSelection().nodes[0];
    //        //if (!selectedNodeHashId) {
    //        //  flag = false;
    //        //}
    //        //else {
    //          var selectedRouterId = queryNodeRouterId(selectedNodeHashId);
    //
    //          //if there is no node having been selected, draw the shortest path tree of this node
    //          //if (flag == false) {
    //          //  flag = true;
    //            if ($scope.protocol == "ospf") {
    //              apiFactory.getSPFospf($scope.peerHashId, selectedRouterId).success(function (result) {
    //                  SPFdata = result.igp_ospf.data;
    //                  drawShortestPathTree(SPFdata);
    //                  for (var i = 0; i < SPFdata.length; i++) {
    //                    SPFdata[i].neighbor_addr_adjusted = (SPFdata[i].neighbor_addr == null) ? 'local' : SPFdata[i].neighbor_addr;
    //                  }
    //                  $scope.SPFtableOptions.data = SPFdata;
    //                }
    //              ).error(function (error) {
    //                  console.log(error.message);
    //                });
    //            }
    //            else if ($scope.protocol == "isis") {
    //              apiFactory.getSPFisis($scope.peerHashId, selectedRouterId).success(function (result) {
    //                  SPFdata = result.igp_isis.data;
    //                  drawShortestPathTree(SPFdata);
    //                  for (var i = 0; i < SPFdata.length; i++) {
    //                    SPFdata[i].neighbor_addr_adjusted = (SPFdata[i].neighbor_addr == null) ? 'local' : SPFdata[i].neighbor_addr;
    //                  }
    //                  $scope.SPFtableOptions.data = SPFdata;
    //                }
    //              ).error(function (error) {
    //                  console.log(error.message);
    //                });
    //            }
    //
    //        //  } else {//if one node have been selected, draw the shortest path between it and the node just selected.
    //        //    flag = false;
    //        //    drawShortestPath(SPFdata, selectedRouterId);
    //        //  }
    //        //}
    //      }
    //
    //      //query node id by node hash id
    //      function queryNodeId(nodeHashId) {
    //        for (var i = 0; i < $scope.topologyData.nodes.length; i++) {
    //          if ($scope.topologyData.nodes[i].id == nodeHashId) {
    //            return i;
    //          }
    //        }
    //        throw new RangeError('Node with id "' + nodeHashId + '" not found');
    //      }
    //
    //      //query node router id by node hash id
    //      function queryNodeRouterId(nodeHashId) {
    //        for (var i = 0; i < $scope.topologyData.nodes.length; i++) {
    //          if ($scope.topologyData.nodes[i].id == nodeHashId) {
    //            var routerId = $scope.topologyData.nodes[i].label;
    //            return routerId;
    //          }
    //        }
    //        throw new RangeError('Node with id "' + nodeHashId + '" not found');
    //      }
    //
    //      //query edge id by two nodes connected to
    //      function queryEdgeId(node1, node2) {
    //        for (var i = 0; i < $scope.topologyData.edges.length; i++) {
    //          if ((node1 == $scope.topologyData.edges[i].from && node2 == $scope.topologyData.edges[i].to) ||
    //            (node1 == $scope.topologyData.edges[i].to && node2 == $scope.topologyData.edges[i].from)) {
    //            var edgeId = $scope.topologyData.edges[i].id;
    //            return edgeId;
    //          }
    //        }
    //        throw new RangeError('Edge connecting node ' + node1 + ' and node ' + node2 + ' not found');
    //      }
    //
    //      //select edges by edge id
    //      function selectEdges(selectedEdges) {
    //        for (var i = 0; i < selectedEdges.length; i++) {
    //          var edge = network.edges[selectedEdges[i]];
    //          if (!edge) {
    //            throw new RangeError('Edge with id "' + selectedEdges[i] + '" not found');
    //          }
    //          edge.select();
    //          network._addToSelection(edge);
    //        }
    //      }
    //
    //      //select nodes by node hash id
    //      function selectNodes(selectedNodes) {
    //        for (var i = 0; i < selectedNodes.length; i++) {
    //          var node = network.nodes[selectedNodes[i]];
    //          if (!node) {
    //            throw new RangeError('Node with id "' + selectedNodes[i] + '" not found');
    //          }
    //          node.select();
    //          network._addToSelection(node);
    //        }
    //      }
    //
    //      //draw the shortest path tree of this node
    //      function drawShortestPathTree(SPFdata) {
    //        var selectedEdges = [];
    //        var selectedNodes = [];
    //
    //        network._unselectAll(true);
    //
    //        selectedNodes.push(SPFdata[0].path_hash_ids.split(",")[0]);
    //        for (var i = 0; i < $scope.topologyData.nodes.length; i++) {
    //          $scope.topologyData.nodes[i].image = "/images/routerMed.png";
    //        }
    //        var root_id = queryNodeId(selectedNodes[0]);
    //        $scope.topologyData.nodes[root_id].image = "/images/routerMedChecked.png";
    //
    //        for (var i = 0; i < SPFdata.length; i++) {
    //          var path_hash_ids = SPFdata[i].path_hash_ids.split(",");
    //          for (var j = 0; j < path_hash_ids.length - 1; j++) {
    //            var selectedEdgeId = queryEdgeId(path_hash_ids[j], path_hash_ids[j + 1]);
    //            if (selectedEdges.indexOf(selectedEdgeId) == -1) {
    //              selectedEdges.push(selectedEdgeId);
    //            }
    //          }
    //
    //          var src_hash_id = path_hash_ids[path_hash_ids.length - 1];
    //          var src_id = queryNodeId(src_hash_id);
    //          $scope.topologyData.nodes[src_id].level = path_hash_ids.length - 1;
    //        }
    //
    //        // create a network
    //          network.storePosition();
    //        network = new vis.Network(container, $scope.topologyData, $scope.topologyOptions);
    //        network.on('select', click)
    //        selectEdges(selectedEdges);
    //        selectNodes(selectedNodes);
    //           //network.focusOnNode(selectedNodes[0], {animation:true});
    //        network.redraw();
    //      //  network.freezeSimulation(true);
    //      }
    //
    //      //draw the shortest path between these two nodes
    //      //function drawShortestPath(SPFdata, selectedRouterId) {
    //      //  var selectedEdges = [];
    //      //  var selectedNodes = [];
    //      //
    //      //  network._unselectAll(true);
    //      //
    //      //  for (var i = 0; i < SPFdata.length; i++) {
    //      //    if (SPFdata[i].src_router_id == selectedRouterId) {
    //      //      selectedNodes = SPFdata[i].path_hash_ids.split(",");
    //      //      for (var j = 0; j < selectedNodes.length - 1; j++) {
    //      //        var selectedEdgeId = queryEdgeId(selectedNodes[j], selectedNodes[j + 1]);
    //      //        if (selectedEdges.indexOf(selectedEdgeId) == -1) {
    //      //          selectedEdges.push(selectedEdgeId);
    //      //        }
    //      //      }
    //      //
    //      //      selectEdges(selectedEdges);
    //      //      selectNodes(selectedNodes);
    //      //      network.redraw();
    //      //      break;
    //      //    }
    //      //  }
    //      //
    //      //}
    //
    //      //draw the path
    //      $scope.drawPath = function (path) {
    //        var selectedEdges = [];
    //        var selectedNodes = [];
    //
    //        network._unselectAll(true);
    //
    //        selectedNodes = path.split(",");
    //        for (var j = 0; j < selectedNodes.length - 1; j++) {
    //          var selectedEdgeId = queryEdgeId(selectedNodes[j], selectedNodes[j + 1]);
    //            selectedEdges.push(selectedEdgeId);
    //        }
    //
    //        selectEdges(selectedEdges);
    //        selectNodes(selectedNodes);
    //        network.redraw();
    //      }
    //
    //    }
    //  }
  }
  ])
;
