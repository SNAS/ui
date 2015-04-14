'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:DashboardController
 * @description
 * # DashboardController
 * Controller of the Dashboard page
 */
angular.module('bmpUiApp')
.controller('GlobalViewController', function ($scope, $state, $q, $http, $timeout, apiFactory, leafletData) {
    window.SCOPE = $scope;
});
