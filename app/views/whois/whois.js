'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:WhoIsController
 * @description
 * # WhoIsController
 * Controller of the Whois page
 */
angular.module('bmpUiApp')
  .controller('WhoIsController', ['$scope', 'apiFactory', '$http', '$timeout', '$interval', '$stateParams', function ($scope, apiFactory, $http, $timeout, $interval, $stateParams) {

    //DEBUG
    window.SCOPE = $scope;

    //Redraw Tables when menu state changed
    //$scope.$on('menu-toggle', function (thing, args) {
    //  $timeout(function () {
    //    resize();
    //  }, 550);
    //});

    $scope.whoIsGridOptions = {
      enableRowSelection: true,
      enableRowHeaderSelection: false,
      enableColumnResizing: true,
      rowHeight: 25,
      multiSelect: false,
      noUnselect: true,
      modifierKeysToMultiSelect: false,
      rowTemplate:
        '<div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',

      onRegisterApi: function (gridApi) {
        $scope.whoIsGridApi = gridApi;
        $scope.whoIsGridApi.selection.on.rowSelectionChanged($scope,function(row) {
          changeSelected();
        });
      },

    columnDefs : [
      {name: "asn", displayName: 'ASN', width: '*'},
      {name: "as_name", displayName: 'AS Name', width: '18%'},
      {name: "org_name", displayName: 'ORG Name', width: '35%'},
      {name: "country", displayName: 'Country', width: '8%'},
      {
        name: "transit_v4_prefixes", displayName: 'transit v4', width: '*',
        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
          if (grid.getCellValue(row, col) > 0) {
            return 'highlight';
          }
        }
      },
      {
        name: "transit_v6_prefixes", displayName: 'transit v6', width: '*',
        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
          if (grid.getCellValue(row, col) > 0) {
            return 'highlight';
          }
        }
      },
      {
        name: "origin_v4_prefixes", displayName: 'origin v4', width: '*',
        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
          if (grid.getCellValue(row, col) > 0) {
            return 'highlight';
          }
        }
      },
      {
        name: "origin_v6_prefixes", displayName: 'origin v6', width: '*',
        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
          if (grid.getCellValue(row, col) > 0) {
            return 'highlight';
          }
        }
      }
    ]
    };

    $scope.calGridHeight = function(grid, gridapi){
      gridapi.core.handleWindowResize();

      var height;
      var dataLength = 10;
      if(grid.data.length > dataLength){
        height = ((dataLength * 30) + 30);
      }else{
        height = ((grid.data.length * 30) + 50);
      }
      grid.changeHeight = height;
      gridapi.grid.gridHeight = grid.changeHeight;
    };

    // $scope.peerViewPeerOptions.onRegisterApi = function (height){
    //   $scope.whoIsPeerApi = height;
    // }

    //Loop through data selecting and altering relevant data.
    var searchValue = function (value) {
      if (value == "" || value == " ")
        return;
      var numberRegex = /^\d+$/;

      if (numberRegex.exec(value) == null) {
        //  not a number do string search
        apiFactory.getWhoIsName(value).
          success(function (result) {
            $scope.whoIsGridOptions.data = result.w.data;
            initSelect();
            setTimeout(function(){
              $scope.calGridHeight($scope.whoIsGridOptions, $scope.whoIsGridApi);
            },10);
          }).
          error(function (error) {
            alert("Sorry, it seems that there is some problem with the server. :(\nWait a moment, then try again.");
            console.log(error.message);
          });
      } else {
        // do a asn search
        apiFactory.getWhoIsASN(value).
          success(function (result) {
            $scope.whoIsGridOptions.data = result.gen_whois_asn.data;
            initSelect();
            $scope.calGridHeight($scope.whoIsGridOptions, $scope.whoIsGridApi);
          }).
          error(function (error) {
            alert("Sorry, it seems that there is some problem with the server. :(\nWait a moment, then try again.");
            console.log(error.message);
          });
      }
    };

    var initSelect = function () {
      $timeout(function () {
        $scope.whoIsGridApi.selection.selectRow($scope.whoIsGridOptions.data[0]);
      });
    };

    //Waits a bit for user to contiune typing.
    $scope.enterValue = function (value) {
      $timeout(function () {
        if (value == $scope.searchValue) {
          searchValue(value);
        }
      }, 500);
    };

    //var resize = function () {
    //  $scope.whoIsGridApi.core.handleWindowResize();
    //};

    //Decided to put the data into a table in the pre to align it
    function changeSelected () {
      var noShow = ["$$hashKey", "symbOrigin", "symbTransit"];
      var values = $scope.whoIsGridApi.selection.getSelectedRows()[0];
      var showValues = '<table class="tableStyle">';

      angular.forEach(values, function (value, key) {
        if (noShow.indexOf(key) == -1) { //doesnt show certain fields
          if (key == "raw_output") {
            //Process each raw output field
            var raw_data = value.split("\n");
            showValues += '<tr><td> </td></tr>'; //br from top

            for (var i = 0; i < raw_data.length; i++) {
              showValues += '<tr>';
              if (raw_data[i] == "") { //was a newline
                showValues += '<td> </td>';
              } else {
                var s = raw_data[i].split(": "); //split on :<space> cause of http:// links

                if(s.length>1) {
                  showValues += (
                  '<td>' +
                  s[0].trim() + ' ' +
                  '</td>' +

                  '<td>' +
                  s[1].trim() +
                  '</td>'
                  );
                }
                else{
                  showValues += (
                  '<td>' +
                  '</td>' +

                  '<td>' +
                  s[0].trim() +
                  '</td>'
                  );
                }
              }
              showValues += '</tr>';
            }
          } else {
            showValues += (
            '<tr>' +
            '<td>' +
            key + ' ' +
            '</td>' +

            '<td>' +
            value +
            '</td>' +
            '</tr>'
            );
          }
        }
      });
      showValues += '</table>';

      $scope.selectedItem = showValues;
    };

    //Init table data
    if($stateParams.as){
      searchValue($stateParams.as);
    }
    else{
      searchValue("Cisco");
    }
  }]);
