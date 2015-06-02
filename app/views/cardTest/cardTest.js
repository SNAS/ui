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

    $scope.whoIsGridOptions = {
      enableRowSelection: true,
      enableRowHeaderSelection: false
    };

    $scope.whoIsGridOptions.columnDefs = [
      {name: "RouterName", width: '*'},
      {name: "RouterIP", width: '*'},
      {name: "PeerName", width: '*'},
      {name: "PeerIP", width: '*'},
      {name: "PeerASN", width: '*'}
    ];

    $scope.whoIsGridOptions.multiSelect = false;
    $scope.whoIsGridOptions.noUnselect = true;
    $scope.whoIsGridOptions.modifierKeysToMultiSelect = false;
    $scope.whoIsGridOptions.rowTemplate = '<div ng-click="grid.appScope.selection();" ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>';
    $scope.whoIsGridOptions.onRegisterApi = function (gridApi) {
      $scope.whoIsGridApi = gridApi;
    };

    apiFactory.getPeers().
      success(function (result){
        $scope.whoIsGridOptions.data = result.v_peers.data;
        $timeout(function () {
          if ($scope.whoIsGridApi.selection.selectRow) {
            $scope.whoIsGridApi.selection.selectRow($scope.whoIsGridOptions.data[3]);
            changePeerCard($scope.whoIsGridOptions.data[3]);
          }
        });
      }).
      error(function (error){
        console.log(error.message);
      });

    $scope.selection = function(){
      var values = $scope.whoIsGridApi.selection.getSelectedRows()[0];
      changePeerCard(values);
    };

    $scope.cards = [];

    //peer card DELETE \w CLICK
    $scope.removePeerCard = function (card) {
      var index = $scope.cards.indexOf(card);
      $scope.cards.splice(index, 1);
    };

    var changePeerCard = function(value) {
      if ($scope.cards.indexOf(value) == -1) {
        $scope.cards.push(value);
        if ($scope.cards.length > 10) {
          $scope.cards.shift();
        }
      }
    };

    //Not need here yet!!
    var clearPeersCard = function() {
      $scope.cards = [];
    };

  }]);
