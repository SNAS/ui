'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:WhoIsController
 * @description
 * # WhoIsController
 * Controller of the Login page
 */
angular.module('bmpUiApp')
  .controller('CardChangesController', ['$scope','apiFactory', '$http', '$timeout', '$interval', function ($scope, apiFactory, $http, $timeout, $interval) {

    window.SCOPERS = $scope;

    $scope.routerList = [];
    $scope.routerPeers = [];

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

  }]);
