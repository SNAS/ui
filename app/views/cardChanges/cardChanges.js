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

    $scope.routerList = [];
    $scope.routerPeers = [];

    apiFactory.getRouters().
      success(function (result){
        $scope.routerList = result.routers.data;
        $scope.routerPeers = new Array($scope.routerList.length);
      }).
      error(function (error){
        console.log(error);
      });


    $scope.getRouterPeers = function(index,routerip) {
      apiFactory.getPeersByIp(routerip).
        success(function (result) {
          $scope.routerPeers[index] = result.v_peers.data;
        }).
        error(function (error) {
          console.log(error);
        });
    };

    $scope.cards = [[],[]];

    //router card DELETE \w CLICK
    $scope.removeRouterCard = function(){
      $scope.cards[0]= [];
      $scope.cards[1]= [];//empty peers also
    };

    //peer card DELETE \w CLICK
    $scope.removePeerCard = function (card) {
      var index = $scope.cards.indexOf(card);
      $scope.cards[1].splice(index, 1);
    };

    $scope.changeRouterCard = function(value){
      $scope.cards[0][0] = value;
    };

    $scope.changePeerCard = function(value) {
      if ($scope.cards[1].indexOf(value) == -1) {
        $scope.cards[1].push(value);
        if ($scope.cards[1].length > 4) {
          $scope.cards[1].shift();
        }
      }
    };

    //For when router is changed
    var clearPeersCard = function() {
      $scope.cards[1] = [];
    };

  }]);
