'use strict';

angular.module('bmp.components.asnModel',[])

  .controller('ModalDemoCtrl', function ($scope, $modal, $log, apiFactory) {

    //api call with asn
    apiFactory.getWhoIsASN($scope.asn.trim()).
      success(function (result){

        if(result.gen_whois_asn.data.length > 0){

          //build the modal
          $scope.modelData = result.gen_whois_asn.data[0];

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

      }).
      error(function (error){
        console.log(error.message);
      });

  })

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

.controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

  $scope.items = items;

  console.dir($scope.items);

  $scope.ok = function () {
    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
})


.directive('bmpAsnModel', function () {
  return  {
    templateUrl: "views/components/asn-model/asn-model.html",
    restrict: 'AE',
    replace: false,
    transclude: true,
    scope: {
      asn: "@"
    },
    link: function(scope){
      scope.noModal = true;
    }
  }
});
