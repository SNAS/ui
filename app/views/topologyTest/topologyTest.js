'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:TopologyController
 * @description
 * # TopologyController
 * Controller of the Topology page
 */

angular.module('bmpUiApp')
  .controller('topologyTestController', ['$scope', 'apiFactory', '$timeout', function ($scope, apiFactory, $timeout) {

    //nx.define('ExtendLink', nx.graphic.Topology.Link, {
    //  properties: {
    //    sourceLabel: null,
    //    targetLabel: null
    //  },
    //  view: function(view) {
    //    view.content.push({
    //      name: 'source',
    //      type: 'nx.graphic.Text',
    //      props: {
    //        'class': 'sourceLabel',
    //        'alignment-baseline': 'text-after-edge',
    //        'text-anchor': 'start'
    //      }
    //    }, {
    //      name: 'target',
    //      type: 'nx.graphic.Text',
    //      props: {
    //        'class': 'targetLabel',
    //        'alignment-baseline': 'text-after-edge',
    //        'text-anchor': 'end'
    //      }
    //    });
    //
    //    return view;
    //  },
    //  methods: {
    //    update: function() {
    //
    //      this.inherited();
    //
    //      var el, point;
    //
    //      var line = this.line();
    //      var angle = line.angle();
    //      var stageScale = this.stageScale();
    //
    //      // pad line
    //      line = line.pad(18 * stageScale, 18 * stageScale);
    //
    //      if (this.sourceLabel()) {
    //        el = this.view('source');
    //        point = line.start;
    //        el.set('x', point.x);
    //        el.set('y', point.y);
    //        el.set('text', this.sourceLabel());
    //        el.set('transform', 'rotate(' + angle + ' ' + point.x + ',' + point.y + ')');
    //        el.setStyle('font-size', 12 * stageScale);
    //      }
    //
    //
    //      if (this.targetLabel()) {
    //        el = this.view('target');
    //        point = line.end;
    //        el.set('x', point.x);
    //        el.set('y', point.y);
    //        el.set('text', this.targetLabel());
    //        el.set('transform', 'rotate(' + angle + ' ' + point.x + ',' + point.y + ')');
    //        el.setStyle('font-size', 12 * stageScale);
    //      }
    //    }
    //  }
    //});

    // initialize a topology
    var topo = new nx.graphic.Topology({
      // width: 800,
      // height: 500,
      nodeConfig: {
        label: 'model.label'
      },
      linkConfig: {
        //  linkType: 'curve',
        linkType: 'parallel',
        label: 'model.label',
        sourceLabel: 'model.sourceLabel',
        targetLabel: 'model.targetLabel'
      },
      dataProcessor: 'force',
      adaptive: true,
      identityKey:'id',
      showIcon: true,
   //   linkInstanceClass: 'ExtendLink'
    });

    $scope.peerHashId = "16ea27797629984cc5fd8c7a210b082d"; //ospf
    //   $scope.peerHashId = "42e3715aaec11635f6dded418a1fe8f2"; //isis

    var nodes = [];
    var links = [];
    var topologyData = {};
    var protocol;
    var SPFdata;

    //get nodes
    apiFactory.getPeerNodes($scope.peerHashId).success(function (result) {
      var nodesData = result.v_ls_nodes.data;
      for (var i = 0; i < result.v_ls_nodes.size; i++) {
        var hash_id = nodesData[i].hash_id;
        var routerId;
        if (nodesData[i].protocol == "OSPFv2") {
          routerId = nodesData[i].IGP_RouterId;
          protocol = 'ospf';
        }
        else {
          routerId = nodesData[i].RouterId;
          protocol = 'isis';
        }
        nodes.push(
          {
            id: hash_id,
            label: routerId
          //  image: "/images/routerMed.png",
          });
      }
    }).error(function (error) {
      console.log(error.message);
    });

    //get edges
    apiFactory.getPeerLinks($scope.peerHashId).success(function (result) {
      var linksData = result.v_ls_links.data;
      for (var i = 0; i < result.v_ls_links.size; i++) {
        var source = linksData[i].local_node_hash_id;
        var target = linksData[i].remote_node_hash_id;
        var igp_metric = linksData[i].igp_metric;
        if (source < target) {
          links.push(
            {
              id: i,
              source: source,
              target: target,
              label: igp_metric,
              sourceLabel: igp_metric,
              targetLabel: igp_metric
            });
        }
        else {
          for (var j = 0; j < links.length; j++) {
            if (source == links[j].target && target == links[j].source && igp_metric != links[j].label) {
              links[j]=
                {
                  id: links[j].id,
                  source: links[j].source,
                  target: links[j].target,
                  sourceLabel: links[j].label,
                  targetLabel: igp_metric
                }
              break;
            }
          }
        }
      }
    }).error(function (error) {
      console.log(error.message);
    });

    //var topologyData = {
    //  nodes: [
    //    {"id": 0, "x": 410, "y": 100, "name": "12K-1"},
    //    {"id": 1, "x": 410, "y": 280, "name": "12K-2"},
    //    {"id": 2, "x": 660, "y": 280, "name": "Of-9k-03"},
    //    {"id": 3, "x": 660, "y": 100, "name": "Of-9k-02"},
    //    {"id": 4, "x": 180, "y": 190, "name": "Of-9k-01"}
    //  ],
    //  links: [
    //    {"source": 0, "target": 1},
    //    {"source": 1, "target": 2},
    //    {"source": 1, "target": 3},
    //    {"source": 4, "target": 1},
    //    {"source": 2, "target": 3},
    //    {"source": 2, "target": 0},
    //    {"source": 3, "target": 0},
    //    {"source": 3, "target": 0},
    //    {"source": 3, "target": 0},
    //    {"source": 0, "target": 4},
    //    {"source": 0, "target": 4},
    //    {"source": 0, "target": 3}
    //  ]
    //};

    $timeout(function () {
      topologyData = {
        nodes: nodes,
        links: links
      };

      topo.on('ready', function () {
        topo.data(topologyData);
      });

      var nodeLayer = topo.getLayer('nodes');
      var nodeLayerHighlightElements = nodeLayer.highlightedElements();
      var linksLayer = topo.getLayer('linkSet');
      var linksLayerHighlightElements = linksLayer.highlightedElements();

      topo.on('clickNode', function(sender,event){
        var selectedRouterId = event['_label'];
        var selectedNodeHashId = event['_data-id'];

        nodeLayerHighlightElements.clear();
        linksLayerHighlightElements.clear();
        nodeLayerHighlightElements.add(topo.getNode(selectedNodeHashId));

        if (protocol == "ospf") {
          apiFactory.getSPFospf($scope.peerHashId, selectedRouterId).success(function (result) {
              SPFdata = result.igp_ospf.data;
              var selectedLinks = getSelectedLinks(SPFdata);
              //var test = topo.getNode(selectedNodeHashId).links();
              linksLayerHighlightElements.addRange(selectedLinks);
              //linksLayerHighlightElements.addRange(test);
              for (var i = 0; i < SPFdata.length; i++) {
                SPFdata[i].neighbor_addr_adjusted = (SPFdata[i].neighbor_addr == null) ? 'local' : SPFdata[i].neighbor_addr;
              }
              $scope.SPFtableOptions.data = SPFdata;
            }
          ).error(function (error) {
              console.log(error.message);
            });
        }
        else if (protocol == "isis") {
          apiFactory.getSPFisis($scope.peerHashId, selectedRouterId).success(function (result) {
              SPFdata = result.igp_isis.data;
              var selectedLinks = getSelectedLinks(SPFdata);
              linksLayerHighlightElements.addRange(selectedLinks);
              for (var i = 0; i < SPFdata.length; i++) {
                SPFdata[i].neighbor_addr_adjusted = (SPFdata[i].neighbor_addr == null) ? 'local' : SPFdata[i].neighbor_addr;
              }
              $scope.SPFtableOptions.data = SPFdata;
            }
          ).error(function (error) {
              console.log(error.message);
            });
        }
      });

      var app = new nx.ui.Application();
      app.container(document.getElementById('topology'));
      topo.attach(app);
    },500);


    function getSelectedLinks(SPFdata) {
      var selectedLinks = [];

      for (var i = 0; i < SPFdata.length; i++) {
        var path_hash_ids = SPFdata[i].path_hash_ids.split(",");
        for (var j = 0; j < path_hash_ids.length - 1; j++) {
          var selectedLink = topo.getLinkSet(path_hash_ids[j], path_hash_ids[j + 1]);
          if (selectedLinks.indexOf(selectedLink) == -1) {
            selectedLinks.push(selectedLink);
          }
        }
      }
      return selectedLinks;
    }

    //SPF Table options
    $scope.SPFtableOptions = {
      enableRowSelection: true,
      enableRowHeaderSelection: false,
      multiSelect: false,
      selectionRowHeaderWidth: 35,
      //rowHeight: 35,

      columnDefs: [
        {field: 'prefix', displayName: 'Prefix', width: '*'},
        {field: 'prefix_len', displayName: 'Prefix Length', width: '*'},
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
          $scope.drawPath(path);
        });
      }
    };

    //SPF Table data
    $scope.SPFtableOptions.data = {};
  }]);
