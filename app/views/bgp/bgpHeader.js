angular.module('bmpUiApp').controller('BGPHeaderCtrl',
  function($scope, $rootScope, $stateParams, $location, $timeout, apiFactory) {
    //used for getting suggestions
    $rootScope.getSuggestions = function(val) {
      if (isNaN(val)) {
        return apiFactory.getWhoIsASNameLike(val, 10).then(function(response) {
//          console.debug(response.data.w.data);
          return response.data.w.data.map(function(item) {
            return item.as_name;// + " (ASN: "+item.asn+")";
          });
        });
      } else {
        return [];
      }
    };

    if ($stateParams.search) {
//      $scope.searchValue = $stateParams.search;
//      searchValueFn();
      console.log("search", $stateParams.search);
      $rootScope.headerSearchValue = $stateParams.search;
    }

//    $scope.$on("testEvent", function(event, data) {
//      console.log("$scope testEvent", event, data);
//      console.log("headerSearchValue", $scope.headerSearchValue, $rootScope.headerSearchValue);
//    });

    function newPathLocation(parameter, path) {
      if (path === undefined) {
        path = $location.path();
      }
      var urlParameters = [];
      if (parameter !== undefined) {
        urlParameters.push("search="+parameter);
      }
//      if ($scope.dateFilterOn) {
//        urlParameters.push("start=" + getTimestamp("start"));
//        urlParameters.push("end=" + getTimestamp("end"));
//      }
      return path + "?" + urlParameters.join("&");
    }

    function changeLocation(parameter) {
      var currentUrl = $location.url();
      var newUrl = newPathLocation(parameter, "/bgp");
//      console.log("currentUrl %s, newUrl %s", currentUrl, newUrl);
      if (currentUrl !== newUrl) {
        $timeout(function() {
          $location.url(newUrl);
        });
      } else if (parameter === undefined) {
//        $scope.searchValue = "";
//        searchValueFn();
      } else {
        console.log("what to do?");
      }
    }

    $rootScope.onSearchKeyDown = function(input, keyEvent) {
      // if the user presses the delete key
//      if (keyEvent.keyCode === 8) {
//      }

      // don't do anything if the user presses the left or right arrow
      if (keyEvent.keyCode === 37 || keyEvent.keyCode === 39) return;

      // otherwise clear the AS number and check if the user pressed Enter or Tab
//      console.log("input", $scope.headerSearchValue, $rootScope.headerSearchValue);
//      $scope.$emit("testEvent", 'Data to send2');

      // if the user presses Enter or Tab, validate the entry
      // and focus on the other input if it hasn't been filled in, or on the search button
      if (keyEvent.which === 13 || keyEvent.keyCode === 9) {
//        if ($rootScope.headerSearchValue && $rootScope.headerSearchValue.length > 0) {
//          findInfoAboutASN(input, $scope[input+"_name"]);
          console.log("Enter or Tab", $rootScope.headerSearchValue);
          changeLocation($rootScope.headerSearchValue);
//        }
      }
      else {
//        $scope.readyToSearchConnections = false;
      }
    };
  }
);