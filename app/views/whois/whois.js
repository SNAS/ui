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

    function api_call(apiurl) {
      var res;

      jQuery.ajax({
        url: apiurl,
        success: function (result) {
          res = result;
        },
        async: false
      });
      return res;
    }

    //Loop through data selecting and altering relevant data.
    $scope.whoIsGrid = [];
    for(var i = 0; i < $scope.routers.length; i++) {
      var item = {};
      //alter item
      //HERE

      //add item
      $scope.whoIsGrid.push(item);
    }
    $scope.whoIsGridOptions = { data: 'whoIsGrid' };

  });
