'use strict';

angular.module('bmp.components.card')

  .controller('BmpCardUpdatesGraphController', ["$scope", "apiFactory", function ($scope, apiFactory) {

      $scope.updatesGraph = {
        chart: {
          type: "stackedAreaChart",
          height: 450,
          margin: {
            top: 20,
            right: 20,
            bottom: 100,
            left: 80
          },
          x: function(d){return d[0];},
          y: function(d){return d[1];},
          useVoronoi: true,
          clipEdge: true,
          transitionDuration: 500,
          useInteractiveGuideline: true,
          showLegend: false,
          showControls: false,
          xAxis: {
            showMaxMin: false,
            rotateLabels: -20,
            rotateYLabel: true,
            axisLabel: 'Time',
            tickFormat: function(d) {
              return new Date(d).toLocaleString()
            }
          },
          yAxis: {
            tickFormat:d3.format('d'),
            axisLabel: 'Updates'
          }
        }
      };

    $scope.updatesDataConfig = {
      visible: $scope.data.visible // default: true
    };


    $scope.updatesData = [
      {
        key: "Withdrawns",
        values:[],
        area: true
      }
    ];

    apiFactory.getWithdrawsOverTime($scope.data.peer_hash_id)
      .success(function (result){
        var data = result.table.data;
        var len = data.length;
        var gData = [];
        for(var i = len -1; i > 0; i--){

          var timestmp = Date.parse(data[i].IntervalTime); //"2015-03-22 22:23:06"

          gData.push([
            timestmp, data[i].Count
          ]);
        }
        $scope.updatesData[0].values = gData;
      })
      .error(function (error){
        console.log(error.message);
      });

  }]);
