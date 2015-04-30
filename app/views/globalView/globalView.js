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

    $scope.location = "globalView";

    $scope.routerList = [];
    $scope.routerPeers = [];

    //This does mean that the API will get called
    //twice once by map and here for the router List
    apiFactory.getRoutersAndLocations().
      success(function (result){
        $scope.routerList = result.routers.data;
        $scope.routerPeers = new Array($scope.routerList.length);
      }).
      error(function (error){
        console.log(error);
      });


    $scope.getRouterPeers = function(index,routerip) {
      apiFactory.getPeersAndLocationsByIp(routerip).
        success(function (result) {
          $scope.routerPeers[index] = result.v_peers.data;
        }).
        error(function (error) {
          console.log(error);
        });
    };

});
