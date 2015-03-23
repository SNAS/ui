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

    $scope.whoIsGridOptions = {
      enableRowSelection: true,
      enableRowHeaderSelection: false
    };

    $scope.whoIsGridOptions.columnDefs = [
      { name: "asn", displayName: 'ASN', maxWidth: 10 },
      { name: "as_name", displayName: 'AS Name' },
      { name: "org_name", displayName: 'ORG Name' },
      { name: "country", displayName: 'Country', maxWidth: 10 },
      { name: "symbTransit", displayName: 'Transit', maxWidth: 10 },
      { name: "symbOrigin", displayName: 'Origin', maxWidth: 10 }
    ];

    $scope.whoIsGridOptions.multiSelect = false;
    $scope.whoIsGridOptions.noUnselect = true;
    $scope.whoIsGridOptions.modifierKeysToMultiSelect = false;
    $scope.whoIsGridOptions.rowTemplate = '<div ng-click="grid.appScope.changeSelected();" ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>';
    $scope.whoIsGridOptions.onRegisterApi = function (gridApi) {
      $scope.whoIsGridApi = gridApi;
    };

    //Loop through data selecting and altering relevant data.
    var searchValue = function(value,init) {
      if(value == "" || value == " ")
        return;
      var numberRegex = /^\d+$/;

      if(numberRegex.exec(value) == null){
        //  not a number do string search
        apiFactory.getWhoIsName(value).
          success(function (result){
            $scope.whoIsGridOptions.data = $scope.whoIsData = result.w.data;
            createWhoIsDataGrid();
            if(init){
              initSelect();
            }
          }).
          error(function (error){
            console.log(error.message);
          });
      }else{
        // do a asn search
        apiFactory.getWhoIsWhereASN(value).
          success(function (result){
            $scope.whoIsGridOptions.data = $scope.whoIsData = result.w.data;
            createWhoIsDataGrid();
          }).
          error(function (error){
            console.log(error.message);
          });
      }
    };

    var initSelect = function(){
      $timeout(function () {
        if ($scope.whoIsGridApi.selection.selectRow) {
          $scope.whoIsGridApi.selection.selectRow($scope.whoIsGridOptions.data[0]);
        }
      });
      $timeout(function () {
        $scope.changeSelected();
      });
    };

    //Waits a bit for user to contiune typing.
    $scope.enterValue = function(value) {
      $scope.currentValue = value;

      $timeout( function() {
        if(value == $scope.currentValue){
          searchValue(value);
        }
      }, 500);
    };

    var createWhoIsDataGrid = function () {
      for(var i = 0; i <  $scope.whoIsData.length; i++) {
        $scope.whoIsData[i].symbTransit = ($scope.whoIsData[i].isTransit == 1)? "✔":"✘";
        $scope.whoIsData[i].symbOrigin = ($scope.whoIsData[i].isOrigin == 1)? "✔":"✘";
      }
    };

    var resize = function() {
      $scope.whoIsGridApi.core.handleWindowResize();
    };

    //cardTest DELETE \w CLICK
    $scope.cardRemove = function(card){
      var index = $scope.cards.indexOf(card);
      $scope.cards.splice(index,1);
    };

    var cardChange = function(values){
      //card test
      if($scope.cards.length > 2)
        $scope.cards.shift();
      if($scope.cards.indexOf(values.asn)==-1)
        $scope.cards.push(values);
    };

    //Decided to put the data into a table in the pre to align it
    $scope.changeSelected = function() {
      var values = $scope.whoIsGridApi.selection.getSelectedRows()[0];

      cardChange(values);
    };

    //Init table data
    searchValue("Cisco",true);
  }]);
