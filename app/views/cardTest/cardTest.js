'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:WhoIsController
 * @description
 * # WhoIsController
 * Controller of the Login page
 */
angular.module('bmpUiApp')
  .controller('CardController', ['$scope','apiFactory', '$http', '$timeout', '$interval', function ($scope, apiFactory, $http, $timeout, $interval) {

    $scope.cards = [];

    //DEBUG
    window.SCOPE = $scope;

    //Redraw Tables when menu state changed
    $scope.$on('menu-toggle', function(thing, args) {
      $timeout( function(){
        resize();
      }, 550);
    });

    var resize = function() {
      $scope.whoIsGridApi.core.handleWindowResize();
    };

    $scope.whoIsGridOptions = {
      enableRowSelection: true,
      enableRowHeaderSelection: false
    };

    $scope.whoIsGridOptions.multiSelect = false;
    $scope.whoIsGridOptions.noUnselect = true;
    $scope.whoIsGridOptions.modifierKeysToMultiSelect = false;
    $scope.whoIsGridOptions.rowTemplate = '<div ng-click="grid.appScope.routerSelection();" ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>';
    $scope.whoIsGridOptions.onRegisterApi = function (gridApi) {
      $scope.whoIsGridApi = gridApi;
    };

    apiFactory.getRouters().
      success(function (result){
        $scope.whoIsGridOptions.data = $scope.whoIsData = result.routers.data;
        createWhoIsDataGrid();
        $timeout(function () {
          if ($scope.whoIsGridApi.selection.selectRow) {
            $scope.whoIsGridApi.selection.selectRow($scope.whoIsGridOptions.data[0]);
            $scope.routerSelection();
          }
        });
      }).
      error(function (error){
        console.log(error.message);
      });

    var createWhoIsDataGrid = function () {
      //for(var i = 0; i <  $scope.whoIsData.length; i++) {
      //  $scope.whoIsData[i].symbTransit = ($scope.whoIsData[i].isTransit == 1)? "✔":"✘";
      //  $scope.whoIsData[i].symbOrigin = ($scope.whoIsData[i].isOrigin == 1)? "✔":"✘";
      //}
    };

    //Decided to put the data into a table in the pre to align it
    $scope.routerSelection = function() {
      $scope.chosenRouter = $scope.whoIsGridApi.selection.getSelectedRows()[0];
      apiFactory.getPeersByIp($scope.chosenRouter.RouterIP).
        success(function (result){
          $scope.peersGridOptions.data = $scope.peersData = result.v_peers.data;
          //console.dir($scope.peersGridOptions);
          //createWhoIsDataGrid();
        }).
        error(function (error){
          console.log(error.message);
        });
      changeRouterCard($scope.chosenRouter);
      clearPeersCard();
    };

    //Old way for only one card
    ////cardTest DELETE \w CLICK
    //$scope.cardRemove = function(card){
    //  var index = $scope.cards.indexOf(card);
    //  $scope.cards.splice(index,1);
    //};
    //
    //var cardChange = function(value) {
    //  if ($scope.cards.indexOf(value) == -1) {
    //    $scope.cards.push(value);
    //    if ($scope.cards.length > 3)
    //      $scope.cards.shift();
    //  }
    //};
    //

    $scope.cards = [[],[]];

    //router card DELETE \w CLICK
    $scope.removeRouterCard = function(){
      $scope.cards[0]= [];
    };

    //peer card DELETE \w CLICK
    $scope.removePeerCard = function (card) {
      var index = $scope.cards.indexOf(card);
      $scope.cards[1].splice(index, 1);
    };

    var changeRouterCard = function(value){
      $scope.cards[0][0] = value;
    };

    var changePeerCard = function(value) {
      if ($scope.cards[1].indexOf(value) == -1) {
        $scope.cards[1].push(value);
        if ($scope.cards[1].length > 3) {
          $scope.cards[1].shift();
        }
      }
    };

    //For when router is changed
    var clearPeersCard = function() {
      $scope.cards[1] = [];
    };

    $scope.peersGridOptions = {
      enableRowSelection: true,
      enableRowHeaderSelection: false
    };

    $scope.peersGridOptions.multiSelect = false;
    $scope.peersGridOptions.noUnselect = true;
    $scope.peersGridOptions.modifierKeysToMultiSelect = false;
    $scope.peersGridOptions.rowTemplate = '<div ng-click="grid.appScope.peerSelection();" ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>';
    $scope.peersGridOptions.onRegisterApi = function (gridApi) {
      $scope.peersGridApi = gridApi;
    };

    //Decided to put the data into a table in the pre to align it
    $scope.peerSelection = function() {
      //$scope.chosenRouter = $scope.peersGridApi.selection.getSelectedRows()[0];
      changePeerCard($scope.peersGridApi.selection.getSelectedRows()[0]);
    };
  }]);
