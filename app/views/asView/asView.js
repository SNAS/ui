'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:ASViewController
 * @description
 * # ASViewController
 * Controller of the AS View page
 */
angular.module('bmpUiApp')
  .controller('ASViewController', ['$scope', 'apiFactory', '$timeout', function ($scope, apiFactory, $timeout) {

    //Waits a bit for user to contiune typing.
    $scope.enterValue = function (value) {
      $timeout(function () {
        if (value == $scope.searchValue) {
          searchValue(value);
        }
      }, 500);
    };

  }]);
