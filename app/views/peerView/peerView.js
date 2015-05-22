'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:DashboardController
 * @description
 * # DashboardController
 * Controller of the Dashboard page
 */
angular.module('bmpUiApp')
    .controller('PeerViewController', function ($scope, $rootScope) {

    	if($rootScope.dualWindow.active){
	        if($rootScope.dualWindow.a === "peerView" && !$rootScope.dualWindow['map-top']){
	        	$rootScope.dualWindow['map-top'] = true;
	            $scope.name = 'dual-peer-view-map-a';
	        }
	        else if($rootScope.dualWindow.b === "peerView" && !$rootScope.dualWindow['map-bottom']){
	        	$rootScope.dualWindow['map-bottom'] = true;
	            $scope.name = 'dual-peer-view-map-b';
	        }
	    }
	    else{
	    	$scope.name = 'global-view-map';
	    }

        $scope.location = "peerView";
    });
