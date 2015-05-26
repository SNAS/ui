'use strict';

angular.module('bmp.components.loading',[])

  .directive('bmpLoading', function () {
    return  {
      templateUrl: "views/components/loading/loading.html",
      restrict: 'A',
      replace: false,
      transclude: true,
      scope: {
        loadingVar: "="
      },
      link: function(scope, $element) {
        scope.loadingVar = true;

        var width = $element.width();

        scope.fontWidth = width * (40/100); //40%
      }
    }
  });
