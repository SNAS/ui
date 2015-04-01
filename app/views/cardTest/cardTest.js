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

    var nodes = [
      {id: 1, label: '1.1'},
      {id: 2, label: '100.1'},
      {id: 3, label: '100.2'},
      {id: 4, label: '192.54'},
      {id: 5, label: '192.22'},
      {id: 6, label: '200.1'},
      {id: 7, label: '192.30'},
      {id: 8, label: '200.2'},
      {id: 9, label: '100.4'},
      {id: 10, label: '100.3'}
    ];
    // create an array with edges
    var edges = [
      {id:1, from: 1, to: 2, label:'10|15', length:15},
      {id:2, from: 2, to: 3, label:10, length:10},
      {id:3, from: 2, to: 5, label:10, length:10},
      {id:4, from: 2, to: 6, label:10, length:10},
      {id:5, from: 3, to: 10, label:10, length:10},
      {id:6, from: 4, to: 5, label:10, length:10},
      {id:7, from: 5, to: 6, label:10, length:10},
      {id:8, from: 5, to: 7, label:10, length:10},
      {id:9, from: 6, to: 7, label:10, length:10},
      {id:10, from: 6, to: 8, label:10, length:10},
      {id:11, from: 7, to: 8, label:10, length:10},
      {id:12, from: 8, to: 9, label:10, length:10},
      {id:13, from: 9, to: 10, label:10, length:10}
    ];

    $scope.topologyOptions={
      height: '1000px',
   //   dragNodes:false,
      configurePhysics:true,

      physics:{
        barnesHut: {
          enabled: true,
          gravitationalConstant: -2000,
          centralGravity: 0.1,
          springLength: 95,
          springConstant: 0.04,
          damping: 0.09
        }
    //    hierarchicalRepulsion: {
          //centralGravity: 0.5,
          //springLength: 150,
          //springConstant: 0.01,
          //nodeDistance: 60,
          //damping: 0.09
  //      }
      },


      nodes: {
        color: {
          background: '#00cc00',
          border: 'red',
          highlight: {
            background: '#eeccee',
            border: 'red'
          }
        },
     //   shape: 'star',
        radius: 24
      }
    }
    $scope.topologyData={
      nodes: nodes,
      edges: edges
    };


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

    var cardChange = function(value) {
      if ($scope.cards.indexOf(value) == -1) {
        $scope.cards.push(value);
        if ($scope.cards.length > 3)
          $scope.cards.shift();
      }
    };

    //Decided to put the data into a table in the pre to align it
    $scope.changeSelected = function() {
      var values = $scope.whoIsGridApi.selection.getSelectedRows()[0];

      cardChange(values);
    };

    //Init table data
    searchValue("Cisco",true);
  }]);
