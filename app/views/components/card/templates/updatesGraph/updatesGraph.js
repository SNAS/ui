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
            bottom: 60,
            left: 40
          },
          useVoronoi: false,
          clipEdge: true,
          transitionDuration: 500,
          useInteractiveGuideline: true,
          showLegend: false,
          showControls: false,
          xAxis: {
            showMaxMin: false,
            tickFormat: function(d) {
              return d3.time.format('%x')(new Date(d))
            }
          },
          yAxis: {
            tickFormat:d3.format('d')
          }
        }
      };

    $scope.updatesDataConfig = {
      visible: $scope.data.visible // default: true
    };


    $scope.updatesData = [
      {
        key: "test",
        values:[],
        area: true
      }
    ];

    apiFactory.getWithdrawsOverTime($scope.data.peer_hash_id)
      .success(function (result){
        var data = result.table.data;
        var len = data.length;
        var gData = [];
        for(var i = 0; i < len; i++){

          var timestmp = Date.parse(data[i].IntervalTime); //"2015-03-22 22:23:06"

          gData.push({
            x:parseInt(timestmp), y:parseInt(data[i].Count)
          });
        }
        $scope.updatesData[0].values = gData;
      })
      .error(function (error){
        console.log(error.message);
      });

  }]);
