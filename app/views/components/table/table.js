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
            else if ((row.entity.isUp === 0 || row.entity.isBMPConnected == 0) || (row.entity.isConnected == 0)) {
              return 'down-icon bmp-down';
            }
          }
        },
        {field: 'RouterName', displayName: 'Router Name'},
        {field: 'RouterIP', displayName: 'Router IP'},
        {field: 'PeerName', displayName: 'Peer Name'},
        {field: 'PeerIP', displayName: 'Peer IP', width: '18%'},
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
        $scope.routerTableOptionsApi = gridApi;
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
          } else if (row.entity.hasOwnProperty("$$treeLevel") && row.entity.$$treeLevel == 0) {
            //apiFactory.getRoutersAndLocations().
            //  success(function (result){
            //    var data = result.routers.data;
            //    for(var i = 0; i < data.length; i++){
            //      if (data[i]['RouterIP'] == row.entity['RouterIP']) {
            //        break;
            //      }
            //    }
            //    data[i].type = 'Router';
            //    $scope.cardApi.changeCard(data[i]);
            //  });
          } // end of else
        });
      }
    };

    $scope.toggleFiltering = function(){
      $scope.routerTableOptions.enableFiltering = !$scope.routerTableOptions.enableFiltering;
      $scope.routerTableOptionsApi.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
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
