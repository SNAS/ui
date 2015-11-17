'use strict';

angular.module('bmp.components.prefixModel', [])
  .controller('ModalPrefixCtrl', function ($scope, $modal, $log, apiFactory) {

    //api call with prefix
    apiFactory.getWhoisPrefix($scope.prefix.trim())
      .success(function (result) {

        if (result.gen_whois_route.data.length > 0) {

          //build the modal
          $scope.modelData = result.gen_whois_route.data[0];
          $scope.modelData['prefix'] = $scope.modelData['prefix'] + '/' + $scope.modelData['prefix_len'];
          delete $scope.modelData['prefix_len'];

          $scope.open = function (size) {

            var modalInstance = $modal.open({
              animation: $scope.animationsEnabled,
              templateUrl: 'myModalContent.html',
              controller: 'ModalInstanceCtrl',
              size: size,
              resolve: {
                items: function () {
                  return $scope.modelData;
                }
              }
            });
          };

          $scope.noModal = false;
        }
        else {
          $scope.open = function (size) {

            var modalInstance = $modal.open({
              animation: $scope.animationsEnabled,
              templateUrl: 'myModalContent.html',
              controller: 'ModalInstanceCtrl',
              size: size,
              resolve: {
                items: function () {
                  return {"Sorry": "Didn't find whois information for this prefix!"};
                }
              }
            });
          };
        }

        $scope.noModal = false;

      }).error(function (error) {
      console.log(error.message);
    });

  })

  // Please note that $modalInstance represents a modal window (instance) dependency.
  // It is not the same as the $modal service used above.

  .controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

    $scope.items = items;

    $scope.ok = function () {
      $modalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  })

  .directive('bmpPrefixModel', function () {
    return {
      templateUrl: "views/components/prefix-model/prefix-model.html",
      restrict: 'AE',
      replace: false,
      transclude: true,
      controller: 'ModalPrefixCtrl',
      scope: {
        prefix: "@"
      },
      link: function (scope) {
        scope.noModal = true;
      }
    }
  });
