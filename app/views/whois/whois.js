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

    //$scope.$watch('asnOrName', debounce(function() {
    //  $scope.selectedItem = $scope.typing;
    //  $scope.$apply();
    //}, 500));

    //Loop through data selecting and altering relevant data.
    $scope.searchValue = function(value) {
      //$timeout( function(){
      //}, 500);
      if(value == "" || value == " ")
        return;
      var numberRegex = /^\d+$/;

      if(numberRegex.exec(value) == null){
        //  not a number do string search
        apiFactory.getWhoIsName(value).
          success(function (result){
            $scope.whoIsGridOptions.data = $scope.whoIsData = result.w.data;
            //createWhoIsDataGrid();
          }).
          error(function (error){
            console.log(error.message);
          });
      }else{
        // do a asn search
        apiFactory.getWhoIsWhereASN(value).
          success(function (result){
            $scope.whoIsGridOptions.data = $scope.whoIsData = result.w.data;
            //createWhoIsDataGrid();
          }).
          error(function (error){
            console.log(error.message);
          });
      }
    };
    //Init
    $scope.searchValue("Cisco");
    //$interval( function() {$scope.gridApi.selection.selectRow($scope.gridOptions.data[0]);}, 0, 1);

    //Not used
    var createWhoIsDataGrid = function () {
      $scope.whoIsGrid = [];
      for(var i = 0; i <  $scope.whoIsData.length; i++) {
        $scope.whoIsGrid.push({
            "asn":  $scope.whoIsData[i].asn,
            "isTransit": $scope.whoIsData[i].isTransit,
            "isOrigin": $scope.whoIsData[i].isOrigin,
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
      $scope.selectedItem = $scope.whoIsGridApi.selection.getSelectedRows();
    };
  }]);
