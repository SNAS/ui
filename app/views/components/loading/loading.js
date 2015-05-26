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
      link: function(scope) {
        scope.loadingVar = true;
      }
    }
  });
