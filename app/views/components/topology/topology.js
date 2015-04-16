'use strict';

/**
 * @ngdoc function
 * @name bmp.components.topology.controller:TopologyController
 * @description
 * # TopologyController
 * Controller of the Topology graph
 */
//angular.module('bmpUiApp')
angular.module('bmp.components.topology', [])
  .controller('TopologyController', function (apiFactory) {
  })

  //.directive('topology', ['apiFactory', '$timeout', function (apiFactory, $timeout) {
  //  return {
  //    templateUrl: "components/topology/topology.html",
  //    restrict: 'AE',
  //    replace: 'true',
  //    scope: {
  //      data: '=',
  //      options: '=',
  //      protocol: '=',
  //      peerHashId: '=',
  //      getSpfTable: '&',
  //      path: '='
  //    },
  //
  //    link: function (scope, element, attrs) {
  //      // create a network
  //      var container = element[0];
  //      var network = {};
  //      var flag = false;
  //      var SPFdata;
  //
  //      $timeout(function () {
  //          network = new vis.Network(container, scope.data, scope.options);
  //
  //          network.on('select', function (properties) {
  //            var selectedNodeId = network.getSelection().nodes[0];
  //            if (!selectedNodeId) {
  //              flag = false;
  //            }
  //            else {
  //              var selectedRouterId = queryNodeRouterId(selectedNodeId);
  //
  //              //if there is no node having been selected, draw the shortest path tree of this node
  //              if (flag == false) {
  //                flag = true;
  //                if (scope.protocol == "ospf") {
  //                  apiFactory.getSPFospf(scope.peerHashId, selectedRouterId).success(function (result) {
  //                      SPFdata = result.igp_ospf.data;
  //                      drawShortestPathTree(SPFdata);
  //         //             scope.getSpfTable();
  //                      scope.getSpfTable()(SPFdata);
  //                    //  scope.$apply();
  //                    }
  //                  ).error(function (error) {
  //                      console.log(error.message);
  //                    });
  //                }
  //                else if (scope.protocol == "isis") {
  //                  apiFactory.getSPFisis(scope.peerHashId, selectedRouterId).success(function (result) {
  //                      SPFdata = result.igp_isis.data;
  //                      drawShortestPathTree(SPFdata);
  //                    }
  //                  ).error(function (error) {
  //                      console.log(error.message);
  //                    });
  //                }
  //
  //              } else {//if one node have been selected, draw the shortest path between it and the node just selected.
  //                flag = false;
  //                drawShortestPath(SPFdata, selectedRouterId);
  //              }
  //            }
  //          })
  //        }, 1000
  //      );
  //
  //      function queryNodeRouterId(nodeId) {
  //        for (var i = 0; i < scope.data.nodes.length; i++) {
  //          if (scope.data.nodes[i].id == nodeId) {
  //            var routerId = scope.data.nodes[i].label;
  //            return routerId;
  //          }
  //        }
  //        throw new RangeError('Node with id "' + nodeId + '" not found');
  //      }
  //
  //      function queryEdgeId(node1, node2) {
  //        for (var i = 0; i < scope.data.edges.length; i++) {
  //          if ((node1 == scope.data.edges[i].from && node2 == scope.data.edges[i].to) ||
  //            (node1 == scope.data.edges[i].to && node2 == scope.data.edges[i].from && scope.data.edges[i].style == 'line')) {
  //            var edgeId = scope.data.edges[i].id;
  //            return edgeId;
  //          }
  //        }
  //        throw new RangeError('Edge connecting node "' + node1 + 'and node' + node2 + '" not found');
  //      }
  //
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
  //
  //        for (var i = 0; i < SPFdata.length; i++) {
  //          var path_hash_ids = SPFdata[i].path_hash_ids.split(",");
  //          for (var j = 0; j < path_hash_ids.length - 1; j++) {
  //            var selectedEdgeId = queryEdgeId(path_hash_ids[j], path_hash_ids[j + 1]);
  //            if (selectedEdges.indexOf(selectedEdgeId) == -1) {
  //              selectedEdges.push(selectedEdgeId);
  //            }
  //          }
  //        }
  //
  //        for (var i = 0; i < scope.data.nodes.length; i++) {
  //          var nodeId = scope.data.nodes[i].id;
  //          network.nodes[nodeId].level = i;
  //        }
  //
  //
  //        selectEdges(selectedEdges);
  //        selectNodes(selectedNodes);
  //        network.redraw();
  //      }
  //
  //      //draw the shortest path between these two nodes
  //      function drawShortestPath(SPFdata, selectedRouterId) {
  //        var selectedEdges = [];
  //        var selectedNodes = [];
  //
  //        network._unselectAll(true);
  //
  //        for (var i = 0; i < SPFdata.length; i++) {
  //          if (SPFdata[i].src_router_id == selectedRouterId) {
  //            selectedNodes = SPFdata[i].path_hash_ids.split(",");
  //            for (var j = 0; j < selectedNodes.length - 1; j++) {
  //              var selectedEdgeId = queryEdgeId(selectedNodes[j], selectedNodes[j + 1]);
  //              if (selectedEdges.indexOf(selectedEdgeId) == -1) {
  //                selectedEdges.push(selectedEdgeId);
  //              }
  //            }
  //
  //            selectEdges(selectedEdges);
  //            selectNodes(selectedNodes);
  //            network.redraw();
  //            break;
  //          }
  //        }
  //
  //      }
  //
  //      scope.$watch(scope.path, function(path, oldValue) {
  //
  //        //draw the path
  //     // function drawPath(path) {
  //        var selectedEdges = [];
  //        var selectedNodes = [];
  //
  //        network._unselectAll(true);
  //
  //            selectedNodes = path.split(",");
  //            for (var j = 0; j < selectedNodes.length - 1; j++) {
  //              var selectedEdgeId = queryEdgeId(selectedNodes[j], selectedNodes[j + 1]);
  //              if (selectedEdges.indexOf(selectedEdgeId) == -1) {
  //                selectedEdges.push(selectedEdgeId);
  //              }
  //            }
  //
  //            selectEdges(selectedEdges);
  //            selectNodes(selectedNodes);
  //            network.redraw();
  //          }
  //      );
  //
  //
  //    }
  //  }
  //}])
;
