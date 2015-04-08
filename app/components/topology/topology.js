'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:LoginController
 * @description
 * # LoginController
 * Controller of the Login page
 */
//angular.module('bmpUiApp')
angular.module('bmp.components.topology', [])
  .controller('TopologyController', function (apiFactory) {

  })

  .directive('topology', ['apiFactory', '$timeout', function (apiFactory, $timeout) {
    return {
      templateUrl: "components/topology/topology.html",
      restrict: 'AE',
      replace: 'true',
      scope: {
        data: '=',
        options: '=',
        protocol: '=',
        peerHashId: '='
      //  removecard: '&'
      },

      link: function (scope, element, attrs) {


        // create a network
        var container = element[0];
        var network = {};
        var selectedEdges = [];


        $timeout(function () {
            network = new vis.Network(container, scope.data, scope.options);

       //   network.on('select', function (properties) {
              network.on('hoverNode', function (properties) {
              var selectedRouterId;
              selectedEdges = [];
              var selectedNodeId = network.getSelection().nodes[0];

              for(var i=0; i<scope.data.nodes.length; i++){
                if(scope.data.nodes[i].id == selectedNodeId){
                  selectedRouterId = scope.data.nodes[i].label;
                }
              }

              var path_hash_ids = [];
              if(scope.protocol=="ospf") {
                apiFactory.getSPFospf(scope.peerHashId, selectedRouterId).success(function (result) {
                    var SPFdata = result.igp_ospf.data;
                    for (var i = 0; i < result.igp_ospf.size; i++) {
                      path_hash_ids = SPFdata[i].path_hash_ids.split(",");
                      queryEdge(path_hash_ids);
                    }

                    scope.data.nodes[1].color = {
                      background: '#f7a031',
                        border: '#f7a031',
                        highlight: {
                        background: '#9ec654',
                          border: '#9ec654'
                      }
                    };
           //         network.selectNodes([selectedNodeId],false);
                    network.selectEdges(selectedEdges);
            //        network.redraw();
             //        network.focusOnNode(selectedNodeId);
                  }
                ).error(function (error) {
                    console.log(error.message);
                  });
              }
              else{

              }

            });
          }, 1000
        )

        function queryEdge(path_hash_ids) {
          for(var i = 0; i<path_hash_ids.length-1; i++){
            for(var j=0; j<scope.data.edges.length; j++){
              if((path_hash_ids[i] == scope.data.edges[j].from && path_hash_ids[i+1] == scope.data.edges[j].to)||
                (path_hash_ids[i] == scope.data.edges[j].to && path_hash_ids[i+1] == scope.data.edges[j].from)
              ){
                var selectedEdgeId=scope.data.edges[j].id;
                if(selectedEdges.indexOf(selectedEdgeId)== -1) {
                  selectedEdges.push(selectedEdgeId);
                }
                break;
              }
            }
          }
        }


          //var buildGraph;
        //buildGraph = function(scope, element) {
        //  var container, graph;
        //  container = element[0];
        //  graph = new vis.Network(container, scope.data, scope.options);
        //  return graph.on('doubleClick', function(properties) {
        //    if (properties.nodes.length !== 0) {
        //      return $window.location = FRONTEND_URL + properties.nodes;
        //    }
        //  });
        //};
        //// Wait for data asynchronously with $resource in the controller
        //scope.$watch('data', function(newval, oldval) {
        //  buildGraph(scope, element);
        //}, true);
      }


    }
  }])
;
