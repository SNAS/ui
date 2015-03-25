'use strict';

angular.module('bmp.components.routerCard', [])

  .controller('RouterCardController', ['$scope', function ($scope) {
    //DEBUG
    window.SCOPES = $scope;

    $scope.options = {
      chart: {
        type: 'multiBarChart',
        height: 200,
        width: 100,
        showLegend: false,
        showControls: false,
          margin : {
          top: 20,
          right: 20,
          bottom: 60,
          left: 45
        },
        clipEdge: true,
        staggerLabels: true,
        transitionDuration: 500,
        stacked: true,
        xAxis: {
          axisLabel: 'Time (ms)',
          showMaxMin: false,
          tickFormat: function(d){
            return d3.format(',f')(d);
          }
        },
        yAxis: {
          axisLabel: 'Y Axis',
          axisLabelDistance: 40,
          tickFormat: function(d){
            return d3.format(',.1f')(d);
          }
        }
      }
    };

    $scope.options = {
      "chart": {
      "type": "stackedAreaChart",
      "showLegend": false,
      "showControls": false,
      "height": 200,
      "width": 100,
      "margin": {
        "top": 20,
        "right": 20,
        "bottom": 60,
        "left": 40
      },
      "useVoronoi": false,
        "clipEdge": true,
        "transitionDuration": 500,
        "useInteractiveGuideline": true,
        "xAxis": {
        "showMaxMin": false
      },
      "yAxis": {}
      }
    };

    $scope.datas = [
      {
        "key": "Stream0",
        "values": [
          {
            "x": 2,
            "y": 6
          },
          {
            "x": 3,
            "y": 6
          }
        ]
      },
      {
        "key": "Stream1",
        "values": [
          {
            "x": 2,
            "y": 4
          },
          {
            "x": 3,
            "y": 4
          }
        ]
      }
    ];


  }])

  .controller('PeerCardController', ['$scope', function ($scope) {
    $scope.testData = "from the controller";
  }])

  .directive('bmpRouterCard', function () {
      return  {
          templateUrl: "components/router-card/router-card.html",
          restrict: 'AE',
          replace: 'true',
          scope: {
              data: '=',
              cardType: '=',
              removecard: '&'
          },
          link: function(scope) {
            scope.cardExpand=false;

            scope.changeCardState = function(){
              scope.cardExpand=!scope.cardExpand;
            };

            scope.getCardState = function(){
              return scope.cardExpand;
            }
          }
      }
  })
