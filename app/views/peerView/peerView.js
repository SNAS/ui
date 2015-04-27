'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:DashboardController
 * @description
 * # DashboardController
 * Controller of the Dashboard page
 */
angular.module('bmpUiApp')
    .controller('PeerViewController', function ($scope, $stateParams, $q, $http, $timeout, apiFactory, leafletData) {
        window.SCOPE = $scope;

        $scope.location = "peerView";
        $scope.parameterIP = $stateParams.RouterIP;
    });
