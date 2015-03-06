'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:WhoIsController
 * @description
 * # WhoIsController
 * Controller of the Login page
 */
angular.module('bmpUiApp')
  .controller('WhoIsController', function ($scope) {

    //Loop through data selecting and altering relevant data.
    $scope.whoIsGrid = [];
    for(var i = 0; i < 10; i++) {
      //add item
      $scope.whoIsGrid.push({});
    }
    $scope.whoIsGridOptions = { data: 'whoIsGrid' };

  });
