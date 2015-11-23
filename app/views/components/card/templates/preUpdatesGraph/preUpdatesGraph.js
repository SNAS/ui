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
            tickFormat: function (d) {
              return moment(d).format("MM/DD/YYYY HH:mm");
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

    apiFactory.getUpdatesOverTimeByPeer($scope.data.peer_hash_id)
      .success(function (result){
        var len = result.table.data.length;
        var data = result.table.data;
        var gData = [];
        for(var i = len -1; i >= 0 ; i--){
          var timestmp = moment.utc(data[i].IntervalTime, "YYYY-MM-DD HH:mm:ss").local().toDate().getTime();

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
