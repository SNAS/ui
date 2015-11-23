'use strict';

/**
 * Created by junbao on 10/16/15.
 * @ngdoc function
 * @name bmpUiApp.controller:TableController
 * @description
 *  used for Table View in Global/Peer tabs
 */

angular.module('bmp.components.table', ['ui.grid.treeView'])
.controller('TableController', ["$scope", "$rootScope", "$timeout", "apiFactory", "uiGridConstants", function ($scope, $rootScope, $timeout, apiFactory, uiGridConstants) {
    /*************************************
     * Used for table view
     ************************************/
    $scope.routerTableOptions = {
      enableFiltering: false,
      enableRowSelection: true,
      enableRowHeaderSelection: false,
      enableColumnResizing: true,
      showTreeExpandNoChildren: false,
      multiSelect: false,
      noUnselect: true,
      height: 300,
      selectionRowHeaderWidth: 35,
      rowHeight: 25,
      gridFooterHeight: 0,
      //showGridFooter: true,
      enableHorizontalScrollbar: 0,
      enableVerticalScrollbar: 1,
      rowTemplate: '<div class="hover-row-highlight"><div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div></div>',
      columnDefs: [
        {
          field: 'Status', displayName: 'Status', width: '6%', type: 'number',
          cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {

            if ((row.entity.isUp == 1 && row.entity.isBMPConnected == 1) || (row.entity.isConnected == 1)) {
              return 'up-icon bmp-up';
            }
            else if ((row.entity.isUp == 0 || row.entity.isBMPConnected == 0) || (row.entity.isConnected == 0)) {
              return 'down-icon bmp-down';
            }
          }
        },
        {field: 'RouterName', displayName: 'Router Name'},
        {field: 'RouterIP', displayName: 'Router IP'},
        {field: 'PeerName', displayName: 'Peer Name'},
        {field: 'PeerIP', displayName: 'Peer IP', width: '18%'},
        {field: 'isPeerIPv4', displayName: 'isIPv4', width: '4%', visible: false},
        {
          field: 'LocalASN', displayName: 'Local ASN', width: '9%',
          cellTemplate: '<div class="ui-grid-cell-contents asn-clickable"><div bmp-asn-model asn="{{ COL_FIELD }}"></div></div>'
        },
        {
          field: 'PeerASN', displayName: 'Peer ASN', width: '8%',
          cellTemplate: '<div class="ui-grid-cell-contents asn-clickable"><div bmp-asn-model asn="{{ COL_FIELD }}"></div></div>'
        }
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
        $scope.gridApi.grid.registerRowsProcessor( $scope.singleFilter, 200 );
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          if (!row.entity.hasOwnProperty('$$treeLevel')) {
            apiFactory.getPeersAndLocationsByIp(row.entity['RouterIP']).
              success(function (result) {
                var data = result.v_peers.data;
                for (var i = 0; i < data.length; i++) {
                  if (data[i]['PeerIP'] == row.entity['PeerIP']) {
                    break;
                  }
                }  // end for loop
                data[i].type = 'Peer';
                $scope.cardApi.changeCard(data[i]);
              });  // end
          }
        });
      }
    };

    $scope.clickRouters = function () {
      $scope.ipv4Down = $scope.ipv4Up = $scope.ipv6Down = $scope.ipv6Up = $scope.disconnected = false;
      $scope.routerTableOptions.enableFiltering = false;
      $scope.gridApi.grid.refresh();
    };

    $scope.clickIpv4Down = function() {
      $scope.ipv4Down = true;
      $scope.gridApi.grid.refresh();
    };

    $scope.clickIpv4Up = function() {
      $scope.ipv4Up = true;
      $scope.gridApi.grid.refresh();
    };

    $scope.clickIpv6Down = function() {
      $scope.ipv6Down = true;
      $scope.gridApi.grid.refresh();
    };

    $scope.clickIpv6Up = function() {
      $scope.ipv6Up = true;
      $scope.gridApi.grid.refresh();
    };

    $scope.clickDisconnected = function() {
      $scope.disconnected = true;
      $scope.gridApi.grid.refresh();
    };

    $scope.singleFilter = function (renderableRows) {
      if ($scope.ipv4Up || $scope.ipv4Down || $scope.ipv6Down || $scope.ipv6Up || $scope.disconnected) {
        renderableRows.forEach(function (row) {
          var match = false;
          if (($scope.ipv4Down && row.entity['Status'] == 0 && row.entity['isPeerIPv4'] == 1)
            || ($scope.ipv4Up && row.entity['Status'] == 1 && row.entity['isPeerIPv4'] == 1)
            || ($scope.ipv6Down && row.entity['Status'] == 0 && row.entity['isPeerIPv4'] == 0)
            || ($scope.ipv6Up && row.entity['Status'] == 1 && row.entity['isPeerIPv4'] == 0)
            || ($scope.disconnected && row.entity['Status'] == 0 && row.entity.$$treeLevel == 0)) {
            match = true;
          }
          if (!match) {
            row.visible = false;
          }
        });
        $scope.ipv4Down = $scope.ipv4Up = $scope.ipv6Down = $scope.ipv6Up = $scope.disconnected = false;
      }

      return renderableRows;
    };

    $scope.toggleFiltering = function(){
      $scope.routerTableOptions.enableFiltering = !$scope.routerTableOptions.enableFiltering;
      $scope.gridApi.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
    };

    $rootScope.routerTableOptions = $scope.routerTableOptions;
  }])

.directive('t', function(){
    return {
      templateUrl: "views/components/table/table.html",
      restrict: 'AE',
      controller: 'TableController',
      scope: {
        location: '=',
        ip: '=?',
        cardApi: '=',
        id: '=name'
      }
    }
  });
