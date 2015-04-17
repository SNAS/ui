'use strict';

angular.module('bmp.components.card',['ui.bootstrap'])

  .directive('bmpCard', function () {
    return  {
      templateUrl: "views/components/card/card.html",
      restrict: 'AE',
      replace: 'true',
      scope: {
        data: '=',
        removable: '=?', //optional
        template: '=',
        removecard: '&'
      },
      link: function(scope, $rootScope) {
        scope.templateLoc = 'views/components/card/templates/'+scope.template+'/'+scope.template+'.html';
        scope.cardExpand = false; //default false = closed

        scope.changeCardState = function() {
          scope.cardExpand = !scope.cardExpand;
        };

        scope.getCardState = function(){
          return scope.cardExpand;
        }
      }
    }
  });
