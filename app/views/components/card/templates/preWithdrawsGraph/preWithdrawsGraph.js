'use strict';

angular.module('bmp.components.card')

  .controller('BmpCardPreWithdrawsGraphController', ["$scope", "apiFactory", function ($scope, apiFactory) {

      $scope.preWithdrawsGraph = {
        chart: {
          type: 'discreteBarChart',
          height: 500,
          margin : {
            top: 20,
            right: 20,
            bottom: 80,
            left: 70
          },
          color: function (d, i) {
            return d.color
          },
          x: function(d){return d.label;},
          y: function(d){return d.value;},
          showValues: true,
          valueFormat: function(d){
            return d3.format('')(d);
          },
          transitionDuration: 500,
          tooltipContent: function (key, x, y, e, graph) {
            //hover = y;
            hoverValue(x);
            return '<h3>' + key + '</h3>' +
              '<p>' +  y + ' on ' + x + '</p>';
          },
          xAxis: {
            rotateLabels: -25,
            rotateYLabel: true
          },
          yAxis: {
            axisLabel: 'Number of Updates',
            axisLabelDistance: 30,
            tickFormat:d3.format('d')
          }
        }
      };

    var hoverValue = function(y){
      $scope.hover = y;
      $scope.$apply();
    };

    $scope.preWithdrawsConfig = {
      visible: $scope.data.visible // default: true
    };


    $scope.preWithdrawsData = [
      {
        key: "Updates",
        values:[]
      }
    ];

    apiFactory.getTopPrefixUpdates($scope.data.peer_hash_id)
      .success(function (result){

        var data = result.u.data;
        var len = data.length;
        var gData = [];
        for(var i = 0; i < len; i++){
          gData.push({
            color: "#EAA546",
            label:data[i].Prefix + "/" + data[i].PrefixLen, value:parseInt(data[i].Count)
          });
        }
        $scope.preWithdrawsData[0].values = gData;
      })
      .error(function (error){
        console.log(error.message);
      });

  }]);
