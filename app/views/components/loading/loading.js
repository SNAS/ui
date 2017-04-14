'use strict';

angular.module('bmp.components.loading',[])

  .directive('bmpLoading', function () {
    return  {
      templateUrl: "views/components/loading/loading.html",
      restrict: 'A',
      replace: false,
      transclude: true,
      scope: {
        loadingVar: "=?",  //variable name to be used in parent
        fontWidth: "=?"   //optional set width
      },
      link: function(scope, $element) {
        scope.loadingVar = true;

        var width = $element.width();

        if(scope.fontWidth == undefined)
          scope.fontWidth = width * (10/100); //10%
      }
    }
  });
