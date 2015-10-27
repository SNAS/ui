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
    /*************************************
     * Used for table view
     ************************************/
    $scope.routerTableOptions = {
      enableFiltering: false,
      enableRowSelection: true,
      enableRowHeaderSelection: false,
      enableColumnResizing: true,
      treeRowHeaderAlwaysVisible: false,
      //enableGroupHeaderSelection: true,
      multiSelect: false,
      noUnselect: true,
      height: $scope.routerGridInitHeight,
      selectionRowHeaderWidth: 35,
      rowHeight: 25,
      gridFooterHeight: 0,
      //showGridFooter: true,
      enableHorizontalScrollbar: 0,
      enableVerticalScrollbar: 1,
      rowTemplate: '<div class="hover-row-highlight"><div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div></div>',
      columnDefs: [
        {
          field: 'Status', displayName: 'Status', width: '6%',
          cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {

            if ((row.entity.isUp === 1) && (row.entity.isBMPConnected === 1)) {
              return 'up-icon bmp-up';
            }
            else if ((row.entity.isUp === 0) || (row.entity.isBMPConnected === 0)) {
              return 'down-icon bmp-down';
            }
          }
        },
        {field: 'RouterName', displayName: 'Router Name'},
        {field: 'RouterIP', displayName: 'Router IP', grouping: { groupPriority: 1 }, sort: {priority:1, direction:"asc"}},
        {field: 'PeerName', displayName: 'Peer Name'}
      ],

      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {

          apiFactory.getPeersAndLocationsByIp(row.entity['RouterIP']).
            success(function (result) {
              var data = result.v_peers.data;
              var i =0, len = data.length;
              for (; i < len; i++) {
                var curr = data[i];
                if (data[i]['PeerIP'] == row.entity['PeerIP']) {
                  var latlng = [curr.latitude, curr.longitude];
                  var options = {
                    country: curr.country,
                    stateprov: curr.stateprov,
                    city: curr.city,
                    routers: [],
                    peers: [curr],
                    expandRouters: false,
                    expandPeers: false,
                    type: 'Peer'
                  };
                  var marker = new L.Marker(latlng, options);
                  break;
                }
              }  // end for loop
              $rootScope.peerPanel(marker, data[i]);
            });  // end
        });
      }
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
