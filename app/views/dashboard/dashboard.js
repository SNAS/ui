'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:DashboardController
 * @description
 * # DashboardController
 * Controller of the Dashboard page
 */
angular.module('bmpUiApp')
  .controller('DashboardController', function ($scope) {
    // Active routers ( draw on BMP Server tab )
    jQuery.ajax({
      url: "http://odl-dev.openbmp.org:8001/db_rest/v1/routers/status/up",
      success: function (result) {
        $scope.active_routers = result.routers.size;
      },
      async: false
    });

    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma',
      'Badgers'
    ];
  });
