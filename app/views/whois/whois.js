'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:WhoIsController
 * @description
 * # WhoIsController
 * Controller of the Login page
 */
angular.module('bmpUiApp')
  .controller('WhoIsController', ['$scope','apiFactory', '$http', '$timeout', '$interval', function ($scope, apiFactory, $http, $timeout, $interval) {

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
      { name: "asn", displayName: 'ASN' },
      { name: "isTransit", displayName: 'Transit' },
      { name: "isOrigin", displayName: 'Origin' },
      { name: "as_name", displayName: 'AS Name' },
      { name: "org_name", displayName: 'ORG Name' },
      { name: "country", displayName: 'Country' }
    ];

    $scope.whoIsGridOptions.multiSelect = false;
    $scope.whoIsGridOptions.modifierKeysToMultiSelect = false;
    $scope.whoIsGridOptions.noUnselect = true;
    $scope.whoIsGridOptions.rowTemplate = '<div ng-click="grid.appScope.changeSelected();" ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>';
    $scope.whoIsGridOptions.onRegisterApi = function (gridApi) {
      $scope.whoIsGridApi = gridApi;
    };

    //Loop through data selecting and altering relevant data.
    var searchValue = function(value) {
      if(value == "" || value == " ")
        return;
      var numberRegex = /^\d+$/;

      if(numberRegex.exec(value) == null){
        //  not a number do string search
        apiFactory.getWhoIsName(value).
          success(function (result){
            $scope.whoIsData = result.w.data;
            createWhoIsDataGrid();
          }).
          error(function (error){
            console.log(error.message);
          });
      }else{
        // do a asn search
        apiFactory.getWhoIsWhereASN(value).
          success(function (result){
            $scope.whoIsData = result.w.data;
            createWhoIsDataGrid();
          }).
          error(function (error){
            console.log(error.message);
          });
      }
    };
    //Init
    searchValue("Cisco");
    //$interval( function() {$scope.gridApi.selection.selectRow($scope.gridOptions.data[0]);}, 0, 1);

    //Waits a bit for user to contiune typing.
    $scope.enterValue = function(value) {
      $scope.currentValue = value;

      $timeout( function() {
        if(value == $scope.currentValue){
          searchValue(value);
        }
      }, 500);
    };

    //Not used
    var createWhoIsDataGrid = function () {
      $scope.whoIsGrid = [];
      for(var i = 0; i <  $scope.whoIsData.length; i++) {
        if($scope.whoIsData[i].isTransit == 1){
          $scope.symbTransit = "✔";
        }else{
          $scope.symbTransit = "✘";
        }
        if($scope.whoIsData[i].isOrigin == 1){
          $scope.symbOrigin = "✔";
        }else{
          $scope.symbOrigin = "✘";
        }
        $scope.whoIsGrid.push({
            "asn":  $scope.whoIsData[i].asn,
            "isTransit": $scope.symbTransit,
            "isOrigin": $scope.symbOrigin,
            "as_name": $scope.whoIsData[i].as_name,
            "org_name": $scope.whoIsData[i].org_name,
            "country": $scope.whoIsData[i].country
        });
      }
      $scope.whoIsGridOptions.data = $scope.whoIsGrid;
      //$interval( function() {$scope.whoIsGridApi.selection.selectRow($scope.whoIsGridOptions.data[0]);}, 0, 1);
    };

    var resize = function() {
      $scope.whoIsGridApi.core.handleWindowResize();
    };

    $scope.changeSelected = function() {
      var values = $scope.whoIsGridApi.selection.getSelectedRows()[0];
      console.dir(values);
      var showValues = "";

      angular.forEach(values, function(value, key) {
        console.dir(value + ": " + key);
        showValues+= "" + value + ": " + key;
      });
      $scope.selectedItem = showValues;
      console.dir(showValues);
    };
  }]);
