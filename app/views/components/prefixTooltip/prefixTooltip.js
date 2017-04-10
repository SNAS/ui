angular.module('bmp.components.prefixTooltip', [])
  .directive('bmpPrefixTooltip', ['apiFactory', '$location', 'ConfigService', '$timeout',
    function (apiFactory, $location, ConfigService, $timeout) {

    function link($scope, element, attr) {
      element.on('mouseover', function(){
        apiFactory.getWhoisPrefix($scope.prefix.trim())
          .success(function(response){
            if (response.gen_whois_route.data.length > 0) {
              $scope.items = response.gen_whois_route.data[0];
              $scope.hoverFound = true;
            } else {
              $scope.hoverFound = false;
            }
          });
      });
      element.on('click', function(event) {
        if ($scope.changeUrlOnClick !== undefined) {
          $timeout(function() {
            if (ConfigService.preferences.alwaysOpenLinkInNewTab || event.ctrlKey || event.metaKey || event.shiftKey) {
              window.open("/#" + $scope.changeUrlOnClick, "_blank"); // in a new tab
            } else {
              $location.url($scope.changeUrlOnClick);
            }
          });
        }
      });
    }

    return {
      templateUrl: "views/components/prefixTooltip/prefixTooltip.html",
      restrict: 'AE',
      scope: {
        prefix: "@",
        changeUrlOnClick: "@"
      },
      link: link
    }
  }]);
