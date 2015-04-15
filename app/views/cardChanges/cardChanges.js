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

    //$scope.addCard = function(card){
    //  //setTimeout(function(){
    //    $scope.cardApi.changeCard(card);
    //  //},30);
    //};
    //
    //$scope.removeCard = function(card){
    //  setTimeout(function(){
    //    $scope.cardApi.removeCard(card);
    //  },30);
    //};

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

    //$scope.carder = [[],[]];
    //
    ////router card DELETE \w CLICK
    //$scope.removeRouterCard = function(){
    //  $scope.carder[0]= [];
    //  $scope.carder[1]= [];//empty peers also
    //};
    //
    ////peer card DELETE \w CLICK
    //$scope.removePeerCard = function (card) {
    //  var index = $scope.carder.indexOf(card);
    //  $scope.carder[1].splice(index, 1);
    //};
    //
    //$scope.changeRouterCard = function(value){
    //  $scope.carder[0][0] = value;
    //};
    //
    //$scope.changePeerCard = function(value) {
    //  if ($scope.carder[1].indexOf(value) == -1) {
    //    $scope.carder[1].push(value);
    //    if ($scope.carder[1].length > 4) {
    //      $scope.carder[1].shift();
    //    }
    //  }
    //};
    //
    ////For when router is changed
    //var clearPeersCard = function() {
    //  $scope.carder[1] = [];
    //};

  }]);
