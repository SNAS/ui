'use strict';

angular.module('bmp.components.routerCard', [])

  .controller('RouterCardController', ['$scope', function ($scope) {

  }])

  .controller('PeerCardController', ['$scope', function ($scope) {

  }])

  .directive('bmpRouterCard', function () {
      return  {
          templateUrl: "components/router-card/router-card.html",
          restrict: 'AE',
          replace: 'true',
          scope: {
              data: '=',
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
;
