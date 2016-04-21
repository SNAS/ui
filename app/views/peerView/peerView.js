'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:DashboardController
 * @description
 * # DashboardController
 * Controller of the Dashboard page
 */
angular.module('bmpUiApp')
    .controller('PeerViewController', ["$scope", "$rootScope", 'apiFactory', 'uiGridConstants', function ($scope, $rootScope, apiFactory, uiGridConstants) {

    if ($rootScope.dualWindow.active) {
      if ($rootScope.dualWindow.a === "peerView" && !$rootScope.dualWindow['map-top']) {
        $rootScope.dualWindow['map-top'] = true;
        $scope.name = 'dual-peer-view-map-a';
      }
      else if ($rootScope.dualWindow.b === "peerView" && !$rootScope.dualWindow['map-bottom']) {
        $rootScope.dualWindow['map-bottom'] = true;
        $scope.name = 'dual-peer-view-map-b';
      }
    }
    else {
      $scope.name = 'peer-view-map';
    }

    $scope.location = "peerView";

    var peerPrefixPromise, peersPromise;
    var peers, peer_prefix;
    // Table with peers
    $scope.peerTableOptions = {
      enableFiltering: false,
      enableRowSelection: true,
      enableRowHeaderSelection: false,
      enableColumnResizing: true,
      multiSelect: false,
      noUnselect: true,
      height: $scope.peerGridInitHeight,
      selectionRowHeaderWidth: 35,
      rowHeight: 25,
      gridFooterHeight: 0,
      showGridFooter: true,
      enableHorizontalScrollbar: 0,
      enableVerticalScrollbar: 1,
      rowTemplate: '<div class="hover-row-highlight"><div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div></div>',
      columnDefs: [
        {
          field: 'Status', displayName: 'Status', width: '6%',
          type: 'number',
          cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {

            if (row.entity.isUp == 1 && row.entity.isBMPConnected == 1) {
              return 'up-icon bmp-up';
            }
            else {
              return 'down-icon bmp-down';
            }
          }
        },
        {field: 'RouterName', displayName: 'Router Name', width: '15%', type: 'string'},
        {field: 'PeerName', displayName: 'Peer Name', width: '22%', type: 'string'},
        {field: 'PeerIP', displayName: 'Peer IP', width: '18%', type: 'string'},
        {
          field: 'LocalASN', displayName: 'Local ASN', width: '9%', type: 'string',
          cellTemplate: '<div class="ui-grid-cell-contents asn-clickable"><div bmp-asn-model asn="{{ COL_FIELD }}"></div></div>'
        },
        {
          field: 'PeerASN', displayName: 'Peer ASN', width: '8%', type: 'string',
          cellTemplate: '<div class="ui-grid-cell-contents asn-clickable"><div bmp-asn-model asn="{{ COL_FIELD }}"></div></div>'
        },
        {field: 'IPv', displayName: 'IPv', width: '5%', type: 'string'},
        {field: 'Pre_RIB', displayName: 'Pre RIB', width: '10%', type: 'number'},
        {field: 'Post_RIB', displayName: 'Post RIB', width: '10%', type: 'number'}
      ],

      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
        $scope.gridApi.grid.registerRowsProcessor( $scope.singleFilter, 200 );
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
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
        });
      }
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

    $scope.singleFilter = function (renderableRows) {
      if ($scope.ipv4Up || $scope.ipv4Down || $scope.ipv6Down || $scope.ipv6Up) {
        renderableRows.forEach(function (row) {
          var match = false;
          if ($scope.ipv4Down && row.entity['Status'] == 0 && row.entity['IPv'] == 4
            || $scope.ipv4Up && row.entity['Status'] == 1 && row.entity['IPv'] == 4
            || $scope.ipv6Down && row.entity['Status'] == 0 && row.entity['IPv'] == 6
            || $scope.ipv6Up && row.entity['Status'] == 1 && row.entity['IPv'] == 6) {
            match = true;
          }
          if (!match) {
            row.visible = false;
          }
        });
        $scope.ipv4Down = $scope.ipv4Up = $scope.ipv6Down = $scope.ipv6Up = false;
      }
      return renderableRows;
    };

    $scope.toggleFiltering = function () {
      $scope.peerTableOptions.enableFiltering = !$scope.peerTableOptions.enableFiltering;
      $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
    };

    $(function getTable() {
      getPeerPrefix();
      getPeers();

      peersPromise.success(function () {
        peerPrefixPromise.success(function () {
          for (var i = 0; i < peers.length; i++) {
            var prefix = getPrefix(i, peers, peer_prefix);
            if (peers[i].isUp == 1 && peers[i].isBMPConnected == 1) {
              peers[i].Status = 1;
            } else {
              peers[i].Status = 0;
            }
            peers[i].IPv = (peers[i].isPeerIPv4 === 1) ? '4' : '6';
            peers[i].Pre_RIB = (prefix == null ) ? 0 : prefix.Pre_RIB;
            peers[i].Post_RIB = (prefix == null ) ? 0 : prefix.Post_RIB;
          }
          $scope.peerTableOptions.data = peers;
          $scope.peerTableIsLoad = false; //stop loading

          //$timeout(function () {
          //  $scope.gridApi.selection.selectRow($scope.peerTableOptions.data[0]);
          //});
        });
      });
    });

    function getPeerPrefix() {
      peerPrefixPromise = apiFactory.getPeerPrefix();
      peerPrefixPromise.success(
        function (result) {
          peer_prefix = result.v_peer_prefix_report_last.data;
        }).
        error(function (error) {
          console.log(error.message);
        });
    }

    function getPeers() {
      peersPromise = apiFactory.getPeers();
      peersPromise.success(
        function (result) {
          peers = result.v_peers.data;
        }).
        error(function (error) {
          console.log(error.message);
        });
    }

    function getPrefix(i, peers, peer_prefix) {
      for (var idx in peer_prefix) {
        if ((peer_prefix[idx].peer_hash_id == peers[i].peer_hash_id) && (peer_prefix[idx].RouterName == peers[i].RouterName)) {
          return peer_prefix[idx];
        }
      }
      return null;
    }

    }])
  .directive('pt', function(){
    return {
      templateUrl: "views/peerView/peerTableView.html",
      restrict: 'AE',
      controller: 'PeerViewController'
    }
  });
