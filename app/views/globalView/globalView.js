'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:DashboardController
 * @description
 * # DashboardController
 * Controller of the Dashboard page
 */
angular.module('bmpUiApp')
.controller('GlobalViewController', function ($scope, $rootScope) {
    window.VIEWSCOPE = $scope;
    if($rootScope.dualWindow.active){
        if($rootScope.dualWindow.a === "globalView" && !$rootScope.dualWindow['map-top']){
            $rootScope.dualWindow['map-top'] = true;
            $scope.name = 'dual-global-view-map-a';
        }
        else if($rootScope.dualWindow.b === "globalView" && !$rootScope.dualWindow['map-bottom']){
            $rootScope.dualWindow['map-bottom'] = true;
            $scope.name = 'dual-global-view-map-b';
        }
    }
    else{
    	$scope.name = 'global-view-map';
    }

    $scope.location = "globalView";

});
