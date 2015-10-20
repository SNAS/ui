'use strict';

/**
 * Created by junbao on 10/16/15.
 * @ngdoc function
 * @name bmpUiApp.controller:TableController
 * @description
 *  used for Table View in Global/Peer tabs
 */

angular.module('bmp.components.table', ['ui.bootstrap', 'ui.grid.grouping'])
.controller('TableController', ["$scope", "$rootScope", "$timeout", "apiFactory", "uiGridConstants", function ($scope, $rootScope, $timeout, apiFactory, uiGridConstants) {
    //$scope.routerGridInitHeight = 300;
    //
    //$scope.routerTableOptions = {
    //  enableFiltering: false,
    //  enableRowSelection: true,
    //  enableRowHeaderSelection: false,
    //  enableColumnResizing: true,
    //  treeRowHeaderAlwaysVisible: false,
    //  multiSelect: false,
    //  noUnselect: true,
    //  height: $scope.routerGridInitHeight,
    //  selectionRowHeaderWidth: 35,
    //  rowHeight: 25,
    //  gridFooterHeight: 0,
    //  showGridFooter: true,
    //  enableHorizontalScrollbar: 0,
    //  enableVerticalScrollbar: 1,
    //  rowTemplate: '<div class="hover-row-highlight"><div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div></div>',
    //  columnDefs: [
    //    {
    //      field: 'Status', displayName: 'Status', width: '6%',
    //      cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
    //
    //        if ((row.entity.isUp === 1) && (row.entity.isBMPConnected === 1)) {
    //          return 'up-icon bmp-up';
    //        }
    //        else if ((row.entity.isUp === 0) || (row.entity.isBMPConnected === 0)) {
    //          return 'down-icon bmp-down';
    //        }
    //      }
    //    },
    //    {field: 'RouterName', displayName: 'Router Name'},
    //    {field: 'RouterIP', displayName: 'Router IP', grouping: { groupPriority: 1 }, sort: {priority:1, direction:"asc"}},
    //    {field: 'PeerName', displayName: 'Peer Name'},
    //    {field: 'PeerIP', displayName: 'Peer IP'}
    //  ],
    //
    //  onRegisterApi: function (gridApi) {
    //    $scope.gridApi = gridApi;
    //    gridApi.selection.on.rowSelectionChanged($scope, function (row) {
    //      console.log(row);
    //      $rootScope.selectPanelPeer(row.entity);
    //    });
    //  }
    //};
    //
    //$scope.toggleFiltering = function(){
    //  $scope.routerTableOptions.enableFiltering = !$scope.routerTableOptions.enableFiltering;
    //  $scope.gridApi.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
    //};
    //
    ////$rootScope.$on('tableRouters', function(event, data){
    ////  $scope.routerTableOptions.data = data;
    ////});
    //
    //$rootScope.$on('tablePeers', function(event, data) {
    //  $scope.routerTableOptions.data = data;
    //})

  }]);

//.directive('t', function(){
//    //return {
//    //  templateUrl: "views/components/table/table.html",
//    //  restrict: 'AE',
//    //  controller: 'TableController',
//    //  scope: {
//    //    location: '=',
//    //    ip: '=?',
//    //    cardApi: '=',
//    //    id: '=name'
//    //  }
//    //}
//  });
