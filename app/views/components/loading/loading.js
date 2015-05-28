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

        //alert($element.height());
        //alert($element.width());

        scope.fontWidth = width * (10/100); //10%
      }
    }
  });
