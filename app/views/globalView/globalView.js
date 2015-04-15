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
    $scope.router;
    $scope.peer;

    $scope.$watch('router', function (val){
        //console.log(val);
    });

    $scope.$watch('peer', function (val){
        //console.log(val);
    });
});
