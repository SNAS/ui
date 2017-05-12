angular.module('bmpUiApp').controller('BGPHeaderCtrl',
  function($scope, $rootScope, $stateParams, $location, $timeout, apiFactory) {
    //used for getting suggestions
    $rootScope.getSuggestions = function(val) {
      if (isNaN(val)) {
        return apiFactory.getWhoIsASNameLike(val, 10).then(function(response) {
//          console.debug(response.data.w.data);
          return response.data.w.data.map(function(item) {
            return item.as_name + " (ASN: "+item.asn+")";
          });
        });
      } else {
        return [];
      }
    };

    if ($stateParams.search) {
//      console.log("search", $stateParams.search);
      $rootScope.headerSearchValue = $stateParams.search;
    }

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

    function isASN(s) {
      return s.match(/^[0-9]+$/) !== null;
    }
    // returns true is string s is a partial or full prefix
    function isPrefix(s) {
      return s.match(/^[0-9]+\.[0-9*]*\.?[0-9]*\.?[0-9*]*\/?[0-9*]*$/) !== null;
    }
    function extractASNumberFromASName(s) {
      return s.replace(/^.*ASN:\s([0-9]+).*/, '$1');
    }
    $rootScope.onSearchKeyDown = function(input, keyEvent) {
      // if the user presses the delete key
//      if (keyEvent.keyCode === 8) {}

      // don't do anything if the user presses the left or right arrow
      if (keyEvent.keyCode === 37 || keyEvent.keyCode === 39) return;

      // if the user presses Enter or Tab, validate the entry
      // and focus on the other input if it hasn't been filled in, or on the search button
      if (keyEvent.which === 13 || keyEvent.keyCode === 9) {
        console.log("Enter or Tab", $rootScope.headerSearchValue);
        if (!isASN($rootScope.headerSearchValue) && !isPrefix($rootScope.headerSearchValue)) {
          $rootScope.headerSearchValue = extractASNumberFromASName($rootScope.headerSearchValue);
        }
        changeLocation($rootScope.headerSearchValue);
      }
    };
  }
);