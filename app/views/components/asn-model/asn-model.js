angular.module('bmp.components.asnModel', [])

.controller('ModalDemoCtrl', function($scope, $modal, $log, apiFactory) {

  $scope.$watch('asn', function(newVal, oldVal) {
    if (newVal == '-') {
      $scope.hoverFound = false;
    } else {
      // 0
      if ($scope.asn == 0 || $scope.asn == '' || $scope.asn == '-') {
        $scope.asn = "-";
        $scope.open = function(size) {
          var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'myModalContent.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
              items: function() {
                return {
                  "UNAVAILABLE": "0 is not a valid AS number!"
                };
              }
            }
          });
        };
        //64512 - 65534     4200000000 - 4294967294
      } else if (($scope.asn > 64512 && $scope.asn <= 65534) ||
        ($scope.asn > 4200000000 && $scope.asn <= 4294967294)) {
        //$scope.asn = "Private AS";
        $scope.open = function(size) {
          var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'myModalContent.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
              items: function() {
                return {
                  "UNAVAILABLE": "This is a private AS"
                };
              }
            }
          });
        };

      } else {
        //api call with asn
        apiFactory.getWhoIsASN($scope.asn.trim()).success(function(result) {
          if (result.gen_whois_asn.data.length > 0) {
            $scope.hoverFound = true;

            //build the modal
            $scope.modelData = result.gen_whois_asn.data[0];
            delete $scope.modelData.raw_output;

            $scope.open = function(size) {
              var modalInstance = $modal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'myModalContent.html',
                controller: 'ModalInstanceCtrl',
                size: size,
                resolve: {
                  items: function() {

                    if (Object.keys($scope.modelData).length === 0) {
                      return {"UNAVAILABLE": "No information found for the AS " + $scope.asn};
                    }

                    return $scope.modelData;
                  }
                }
              });
            };
          } else {
            $scope.hoverFound = false;
            $scope.modelData = [];
          }
        }).error(function(error) {
          console.log(error.message);
        });

      }
      $scope.noModal = false;
    }
  });
})

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

.controller('ModalInstanceCtrl', function($scope, $modalInstance, items) {

  for (var key in items) {
    if (items[key] == null) {
      items[key] = "-";
    }
  }

  $scope.items = items;
  $scope.noAsInfo = "";

  $scope.ok = function() {
    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
})

.directive('bmpAsnModel', function() {
  return {
    templateUrl: "views/components/asn-model/asn-model.html",
    restrict: 'AE',
    //replace: false,
    //transclude: true,
    controller: 'ModalDemoCtrl',
    scope: {
      asn: "@"
    },
    link: function($scope) {
      $scope.noModal = true;
    }
  }
});
