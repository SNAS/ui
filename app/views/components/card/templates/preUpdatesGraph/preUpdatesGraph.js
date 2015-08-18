'use strict';

angular.module('bmp.components.card')

  .controller('BmpCardPreUpdatesGraphController', ["$scope", "apiFactory", function ($scope, apiFactory) {
    $scope.loading = true;
    $scope.preUpdatesGraph = {
        chart: {
          type: "stackedAreaChart",
          height: 450,
          margin: {
            top: 20,
            right: 20,
            bottom: 90,
            left: 80
          },
          color: function (d, i) {
            return "#EAA546"
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
            tickFormat: function(d) {
              var date = new Date(d);
                return date.getDay() + "/" +
                  date.getMonth() + "/" +
                  date.getFullYear() + ", " +
                  date.getHours() + ":" +
                  date.getMinutes() + ":" +
                  date.getSeconds() + " UTC";
            }
          },
          yAxis: {
            axisLabel: 'Updates',
            tickFormat:d3.format('d')
          }
        }
      };

    $scope.preUpdatesConfig = {
      visible: $scope.data.visible // default: true
    };

    $scope.preUpdatesData = [
      {
        key: "Updates",
        values:[[]]
      }
    ];

    apiFactory.getUpdatesOverTime($scope.data.peer_hash_id)
      .success(function (result){
        var len = result.table.data.length;
        var data = result.table.data;
        var gData = [];
        for(var i = len -1; i > 0 ; i--){

          // var timestmp = Date.parse(data[i].IntervalTime); //"2015-03-22 22:23:06"
          // Modified by Jason. Date.parse returns nothing
          var timestmpArray = data[i].IntervalTime.split(/-| |:|\./); //"2015-03-22 22:23:06"
          var date = new Date(timestmpArray[0], timestmpArray[1], timestmpArray[2], timestmpArray[3], timestmpArray[4], timestmpArray[5]);
          var timestmp = date.getTime();

          gData.push([
            timestmp, parseInt(data[i].Count)
          ]);
        }
        $scope.preUpdatesData[0].values = gData;
        $scope.loading = false;
      })
      .error(function (error){
        console.log(error.message);
      });

  }]);
