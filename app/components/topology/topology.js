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
        selectedEdges: '=',
        selectedNode: '=',
        cardType: '@',
        removecard: '&'
      },

      link: function (scope, element, attrs) {


        // create a network
        var container = element[0];
        var network = {};

        $timeout(function () {
            network = new vis.Network(container, scope.data, scope.options);

     //       apiFactory.getNodes();

            network.on('select', function (properties) {

              if(network.getSelection().nodes[0]==1) {
                network.selectEdges([1,2,3,4,5,6,8,10,11,12,13]);
              }

              //apiFactory.getPeerLinks(network.getSelection().nodes[0]).success(function (result) {
              //    var linksData = result.v_ls_links.data;
              //    var selectedEdges = [];
              //    for (var i = 0; i < result.v_ls_links.size; i++) {
              //      var id = linksData[i].id;
              //      selectedEdges.push(id);
              //    }
              //    network.selectEdges(selectedEdges);
              //  }
              //).error(function (error) {
              //    console.log(error.message);
              //  });
            });
          }, 500
        )


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
