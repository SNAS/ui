'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:BGPController
 * @description
 * # BGPController
 * Controller of the BGP page
 */
angular.module('bmpUiApp').controller('BGPController', //["$scope", "bgpDataService", "ConfigService", "socket",
  function($scope, bgpDataService, ConfigService, socket) {
    bgpDataService.getASList().success(function(result) {
        $scope.asList = result;
        $scope.data = transformToGraphData($scope.asList);
        console.log("$scope.data", $scope.data);
      }
    ).error(function(error) {
        console.log("Failed to retrieve AS list", error.message);
      });

    $scope.options = {
      chart: {
        type: 'multiBarChart',
        height: 450,
        margin : {
          top: 20,
          right: 20,
          bottom: 70,
          left: 35
        },
        clipEdge: true,
        duration: 500,
        stacked: true,
        reduceXTicks: false,
        rotateLabels: 90,
        useInteractiveGuideline: true,
//        refreshDataOnly: true,
        xAxis: {
          axisLabel: '',
          showMaxMin: false,
          tickFormat: function(d){
//              return "AS " + d3.format(',f')(d);
            return $scope.asList[d].as;
          }
        },
        yAxis: {
          axisLabel: '',
          tickFormat: function(d){
            return d3.format(',.f')(d);
          }
        }
      }
    };

    function transformToGraphData(asList) {
      var prefixesOriginated = [];
      var prefixesTransitted = [];
      for (var i = 0 ; i < asList.length ; i++) {
        prefixesOriginated.push(asList[i].origins);
        prefixesTransitted.push(asList[i].routes - asList[i].origins);
      }
      return [
        {
          key: "Prefixes Originated",
          values: prefixesOriginated.map(stream_index)
        },
        {
          key: "Prefixed Transitted",
          values: prefixesTransitted.map(stream_index)
        }
      ];
    }

    function stream_index(d, i) {
      return {x: i, y: Math.max(0, d)};
    }

    var uiServer = ConfigService.bgpDataService;
    const SOCKET_IO_SERVER = "bgpDataServiceSocket";
    socket.connect(SOCKET_IO_SERVER, uiServer);
    socket.on(SOCKET_IO_SERVER, 'dataUpdate', function(data) {
      $scope.asList = data;
      $scope.data = transformToGraphData($scope.asList);
    });

    // this function is for testing purposes, to trigger a socket.io update from the server
    // this is TEMPORARY and will be removed once the server gets real-time OpenTSDB updates
    $scope.triggerDataUpdate = function() {
      socket.emit(SOCKET_IO_SERVER, "updateData");
    };
  }
);
