'use strict';

angular.module('bmp.components.card')

  .controller('BmpCardPreWithdrawsGraphController', ["$scope", "apiFactory", function ($scope, apiFactory) {
      $scope.loading = true;
      $scope.preWithdrawsGraph = {
        chart: {
          type: "stackedAreaChart",
          height: 450,
          margin: {
            top: 20,
            right: 20,
            bottom: 100,
            left: 80
          },
          color: function (d, i) {
            return "#4b84ca"
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
            tickFormat:d3.format('d'),
            axisLabel: 'Withdraws'
          }
        }
      };

    $scope.preWithdrawsConfig = {
      visible: $scope.data.visible // default: true
    };


    $scope.preWithdrawsData = [
      {
        key: "Withdraws",
        values:[[]],
        area: true
      }
    ];

    apiFactory.getWithdrawsOverTimeByPeer($scope.data.peer_hash_id)
      .success(function (result){
        var data = result.table.data;
        var len = data.length;
        var gData = [];
        for(var i = len -1; i >= 0; i--){
          var timestmp = moment.utc(data[i].IntervalTime, "YYYY-MM-DD HH:mm:ss").local().toDate().getTime();

          gData.push([
            timestmp, parseInt(data[i].Count)
          ]);
        }
        $scope.preWithdrawsData[0].values = gData;
        $scope.loading = false;
      })
      .error(function (error){
        console.log(error.message);
      });

  }]);
