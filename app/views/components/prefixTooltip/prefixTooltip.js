angular.module('bmp.components.prefixTooltip', [])
  .directive('bmpPrefixTooltip', ['apiFactory', '$location', function (apiFactory, $location) {

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
      element.on('click', function() {
        if ($scope.changeUrlOnClick !== undefined) {
          $location.url($scope.changeUrlOnClick);
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
