'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:TopologyController
 * @description
 * # TopologyController
 * Controller of the Topology page
 */

angular.module('bmpUiApp')
  .controller('linkStateController', ['$scope', 'apiFactory', '$timeout', function ($scope, apiFactory, $timeout) {

    $scope.peerHashId = "54ecaeeec115457cbce466ff48857aa7"; //ospf
    //   $scope.peerHashId = "daaa681792b33e36166a2205be05868d"; //isis

    $scope.topologyOptions = {
      height: '1000px',
      //   dragNodes:false,
      configurePhysics: true,
      hover: true,

      hierarchicalLayout: {
        direction: "UD",
        layout: "direction"
      },

      //physics: {
      //  hierarchicalRepulsion: {
      //    //centralGravity: 0.5,
      //    //springLength: 150,
      //    //springConstant: 0.01,
      //    //nodeDistance: 60,
      //    //damping: 0.09
      //  }
      //},

      nodes: {
        color: {
          background: '#9ec654',
          border: '#9ec654',
          highlight: {
            background: '#f7a031',
            border: '#f7a031'
          }
        },
        //   shape: 'star',
        radius: 24
      }
    };

    var nodes = [
      //{id: 1, label: '1.1'},
      //{id: 2, label: '100.1'},
      //{id: 3, label: '100.2'},
      //{id: 4, label: '192.54'},
      //{id: 5, label: '192.22'},
      //{id: 6, label: '200.1'},
      //{id: 7, label: '192.30'},
      //{id: 8, label: '200.2'},
      //{id: 9, label: '100.4'},
      //{id: 10, label: '100.3'}
    ];
    var edges = [
      //{id:1, from: 1, to: 2, label:'10|15', length:15},
      //{id:2, from: 2, to: 3, label:10, length:10},
      //{id:3, from: 2, to: 5, label:10, length:10},
      //{id:4, from: 2, to: 6, label:10, length:10},
      //{id:5, from: 3, to: 10, label:10, length:10},
      //{id:6, from: 4, to: 5, label:10, length:10},
      //{id:7, from: 5, to: 6, label:10, length:10},
      //{id:8, from: 5, to: 7, label:10, length:10},
      //{id:9, from: 6, to: 7, label:10, length:10},
      //{id:10, from: 6, to: 8, label:10, length:10},
      //{id:11, from: 7, to: 8, label:10, length:10},
      //{id:12, from: 8, to: 9, label:10, length:10},
      //{id:13, from: 9, to: 10, label:10, length:10}
    ];
    $scope.topologyData = {};

    //get nodes
    $(function () {
      apiFactory.getPeerNodes($scope.peerHashId).success(function (result) {
        var nodesData = result.v_ls_nodes.data;
        for (var i = 0; i < result.v_ls_nodes.size; i++) {
          var hash_id = nodesData[i].hash_id;
          var label;
          if (nodesData[i].protocol == "OSPFv2") {
            label = nodesData[i].IGP_RouterId;
            $scope.protocol = 'ospf';
          }
          else {
            label = nodesData[i].RouterId;
            $scope.protocol = 'isis';
          }

          nodes.push(
            {
              //     id: i,
              id: hash_id,
              label: label
            }
          );
        }
      }).error(function (error) {
        console.log(error.message);
      });
    })

    //get edges
    $(function () {
      apiFactory.getPeerLinks($scope.peerHashId).success(function (result) {
        var linksData = result.v_ls_links.data;
        for (var i = 0; i < result.v_ls_links.size; i++) {
          var from = linksData[i].local_node_hash_id;
          var to = linksData[i].remote_node_hash_id;
          var igp_metric = linksData[i].igp_metric;
          if (from < to) {
            edges.push(
              {
                id: i,
                from: from,
                to: to,
                label: igp_metric,
                length: igp_metric
              }
            );
          }
        }
      }).error(function (error) {
        console.log(error.message);
      });
    })

    $timeout(function () {
      $scope.topologyData = {
        nodes: nodes,
        edges: edges
      };
    })

  }]);
