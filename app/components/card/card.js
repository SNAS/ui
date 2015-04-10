'use strict';

angular.module('bmp.components.card', [])

  .directive('bmpCard', function () {
    return  {
      templateUrl: "components/card/card.html",
      restrict: 'AE',
      replace: 'true',
      scope: {
        data: '=',
        template: '@'//,
        //removecard: '&'
      },
      link: function(scope, $rootScope) {
        scope.cardExpand=false;//default false = closed

        scope.changeCardState = function() {
          scope.cardExpand = !scope.cardExpand;
          //$rootScope.$broadcast('cardExpand');
        };

        scope.getCardState = function(){
          return scope.cardExpand;
        }
      }
    }
  });
