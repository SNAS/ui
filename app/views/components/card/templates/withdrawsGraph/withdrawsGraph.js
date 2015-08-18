'use strict';

angular.module('bmp.components.card')

  .controller('BmpCardWithdrawsGraphController', ["$scope", "apiFactory", function ($scope, apiFactory) {

      window.GRAPHSC = $scope;
      $scope.loading = true;
      $scope.withdrawsGraph = {
        chart: {
          type: 'discreteBarChart',
          height: 500,
          margin : {
            top: 20,
            right: 20,
            bottom: 80,
            left: 55
          },
          color: function (d, i) {
            return "#4b84ca"
          },
          x: function(d){return d.label;},
          y: function(d){return d.value;},
          showValues: true,
          valueFormat: function(d){
            return d3.format('')(d);
          },
          transitionDuration: 500,
          tooltipContent: function (key, x, y, e, graph) {
            hoverValue(x);
            return '<h3>' + key + '</h3>' +
              '<p>' +  y + ' on ' + x + '</p>';
          },
          xAxis: {
            rotateLabels: -25,
            rotateYLabel: true
          },
          yAxis: {
            axisLabel: 'Withdrawals',
            axisLabelDistance: 30,
            tickFormat:d3.format('d')
          }
        }
      };

    var hoverValue = function(y){
      $scope.hover = y;
      $scope.$apply();
    };

    $scope.withdrawsConfig = {
      visible: $scope.data.visible // default: true
    };



    $scope.withdrawsData = [
      {
        key: "Withdrawals",
        values:[[]]
      }
    ];

    apiFactory.getWithdrawnPrefixOverTime($scope.data.peer_hash_id)
      .success(function (result){

        var data = result.log.data;
        var len = data.length;
        var gData = [];
        for(var i = 0; i < len; i++){
          gData.push({
            label:data[i].Prefix + "/" + data[i].PrefixLen, value:parseInt(data[i].Count)
          });
        }
        $scope.withdrawsData[0].values = gData;
        $scope.loading = false;
      })
      .error(function (error){
        console.log(error.message);
      });

  }]);
