'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:WhoIsController
 * @description
 * # WhoIsController
 * Controller of the Login page
 */
angular.module('bmpUiApp')
  .controller('CardController', ['$scope', 'apiFactory', '$http', '$timeout', '$interval', function ($scope, apiFactory, $http, $timeout, $interval) {

//    $scope.cards = [];
//
//    //DEBUG
//    window.SCOPE = $scope;
//
//    //Redraw Tables when menu state changed
//    $scope.$on('menu-toggle', function (thing, args) {
//      $timeout(function () {
//        resize();
//      }, 550);
//    });
//
//    var resize = function() {
//      $scope.whoIsGridApi.core.handleWindowResize();
//    };
//
//    $scope.whoIsGridOptions = {
//      enableRowSelection: true,
//      enableRowHeaderSelection: false
//    };
//
//<<<<<<< HEAD
//    $scope.whoIsGridOptions.columnDefs = [
//      {name: "asn", displayName: 'ASN', maxWidth: 10},
//      {name: "as_name", displayName: 'AS Name'},
//      {name: "org_name", displayName: 'ORG Name'},
//      {name: "country", displayName: 'Country', maxWidth: 10},
//      {name: "symbTransit", displayName: 'Transit', maxWidth: 10},
//      {name: "symbOrigin", displayName: 'Origin', maxWidth: 10}
//    ];
//
//=======
//>>>>>>> bb7dc6ce2cb806081e080f57e125e5923dba66fe
//    $scope.whoIsGridOptions.multiSelect = false;
//    $scope.whoIsGridOptions.noUnselect = true;
//    $scope.whoIsGridOptions.modifierKeysToMultiSelect = false;
//    $scope.whoIsGridOptions.rowTemplate = '<div ng-click="grid.appScope.routerSelection();" ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>';
//    $scope.whoIsGridOptions.onRegisterApi = function (gridApi) {
//      $scope.whoIsGridApi = gridApi;
//    };
//
//<<<<<<< HEAD
//    //Loop through data selecting and altering relevant data.
//    var searchValue = function (value, init) {
//      if (value == "" || value == " ")
//        return;
//      var numberRegex = /^\d+$/;
//
//      if (numberRegex.exec(value) == null) {
//        //  not a number do string search
//        apiFactory.getWhoIsName(value).
//          success(function (result) {
//            $scope.whoIsGridOptions.data = $scope.whoIsData = result.w.data;
//            createWhoIsDataGrid();
//            if (init) {
//              initSelect();
//            }
//          }).
//          error(function (error) {
//            console.log(error.message);
//          });
//      } else {
//        // do a asn search
//        apiFactory.getWhoIsWhereASN(value).
//          success(function (result) {
//            $scope.whoIsGridOptions.data = $scope.whoIsData = result.w.data;
//            createWhoIsDataGrid();
//          }).
//          error(function (error) {
//            console.log(error.message);
//          });
//      }
//    };
//
//    var initSelect = function () {
//      $timeout(function () {
//        if ($scope.whoIsGridApi.selection.selectRow) {
//          $scope.whoIsGridApi.selection.selectRow($scope.whoIsGridOptions.data[0]);
//        }
//      });
//      $timeout(function () {
//        $scope.changeSelected();
//      });
//    };
//
//    //Waits a bit for user to contiune typing.
//    $scope.enterValue = function (value) {
//      $scope.currentValue = value;
//
//      $timeout(function () {
//        if (value == $scope.currentValue) {
//          searchValue(value);
//        }
//      }, 500);
//    };
//
//    var createWhoIsDataGrid = function () {
//      for (var i = 0; i < $scope.whoIsData.length; i++) {
//        $scope.whoIsData[i].symbTransit = ($scope.whoIsData[i].isTransit == 1) ? "✔" : "✘";
//        $scope.whoIsData[i].symbOrigin = ($scope.whoIsData[i].isOrigin == 1) ? "✔" : "✘";
//      }
//    };
//
//    var resize = function () {
//      $scope.whoIsGridApi.core.handleWindowResize();
//    };
//
//    //cardTest DELETE \w CLICK
//    $scope.cardRemove = function (card) {
//      var index = $scope.cards.indexOf(card);
//      $scope.cards.splice(index, 1);
//    };
//
//    var cardChange = function (value) {
//      if ($scope.cards.indexOf(value) == -1) {
//        $scope.cards.push(value);
//        if ($scope.cards.length > 3)
//          $scope.cards.shift();
//      }
//    };
//
//    //Decided to put the data into a table in the pre to align it
//    $scope.changeSelected = function () {
//      var values = $scope.whoIsGridApi.selection.getSelectedRows()[0];
//
//      cardChange(values);
//    };
//
//    //Init table data
//    searchValue("Cisco", true);
//=======
//    apiFactory.getRouters().
//      success(function (result){
//        $scope.whoIsGridOptions.data = $scope.whoIsData = result.routers.data;
//        createWhoIsDataGrid();
//        $timeout(function () {
//          if ($scope.whoIsGridApi.selection.selectRow) {
//            $scope.whoIsGridApi.selection.selectRow($scope.whoIsGridOptions.data[0]);
//            $scope.routerSelection();
//          }
//        });
//      }).
//      error(function (error){
//        console.log(error.message);
//      });
//
//    var createWhoIsDataGrid = function () {
//      //for(var i = 0; i <  $scope.whoIsData.length; i++) {
//      //  $scope.whoIsData[i].symbTransit = ($scope.whoIsData[i].isTransit == 1)? "✔":"✘";
//      //  $scope.whoIsData[i].symbOrigin = ($scope.whoIsData[i].isOrigin == 1)? "✔":"✘";
//      //}
//    };
//
//    //Decided to put the data into a table in the pre to align it
//    $scope.routerSelection = function() {
//      $scope.chosenRouter = $scope.whoIsGridApi.selection.getSelectedRows()[0];
//      apiFactory.getPeersByIp($scope.chosenRouter.RouterIP).
//        success(function (result){
//          $scope.peersGridOptions.data = $scope.peersData = result.v_peers.data;
//          //console.dir($scope.peersGridOptions);
//          //createWhoIsDataGrid();
//        }).
//        error(function (error){
//          console.log(error.message);
//        });
//      changeRouterCard($scope.chosenRouter);
//      clearPeersCard();
//    };
//
//    //Old way for only one card
//    ////cardTest DELETE \w CLICK
//    //$scope.cardRemove = function(card){
//    //  var index = $scope.cards.indexOf(card);
//    //  $scope.cards.splice(index,1);
//    //};
//    //
//    //var cardChange = function(value) {
//    //  if ($scope.cards.indexOf(value) == -1) {
//    //    $scope.cards.push(value);
//    //    if ($scope.cards.length > 3)
//    //      $scope.cards.shift();
//    //  }
//    //};
//    //
//
//    $scope.cards = ["",[]];
//
//    //router card DELETE \w CLICK
//    $scope.removeRouterCard = function(){
//      $scope.cards[0] = "";
//    };
//
//    //peer card DELETE \w CLICK
//    $scope.removePeerCard = function (card) {
//      var index = $scope.cards.indexOf(card);
//      $scope.cards[1].splice(index, 1);
//    };
//
//    var changeRouterCard = function(value){
//      $scope.cards[0] = value;
//    };
//
//    var changePeerCard = function(value) {
//      if ($scope.cards[1].indexOf(value) == -1) {
//        $scope.cards[1].push(value);
//        if ($scope.cards[1].length > 3) {
//          $scope.cards[1].shift();
//        }
//      }
//    };
//
//    //For when router is changed
//    var clearPeersCard = function() {
//      $scope.cards[1] = [];
//    };
//
//    $scope.peersGridOptions = {
//      enableRowSelection: true,
//      enableRowHeaderSelection: false
//    };
//
//    $scope.peersGridOptions.multiSelect = false;
//    $scope.peersGridOptions.noUnselect = true;
//    $scope.peersGridOptions.modifierKeysToMultiSelect = false;
//    $scope.peersGridOptions.rowTemplate = '<div ng-click="grid.appScope.peerSelection();" ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>';
//    $scope.peersGridOptions.onRegisterApi = function (gridApi) {
//      $scope.peersGridApi = gridApi;
//    };
//
//    //Decided to put the data into a table in the pre to align it
//    $scope.peerSelection = function() {
//      //$scope.chosenRouter = $scope.peersGridApi.selection.getSelectedRows()[0];
//      changePeerCard($scope.peersGridApi.selection.getSelectedRows()[0]);
//    };
//>>>>>>> bb7dc6ce2cb806081e080f57e125e5923dba66fe
  }]);
