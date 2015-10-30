'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:DashboardController
 * @description
 * # DashboardController
 * Controller of the Dashboard page
 */
angular.module('bmpUiApp')
    .controller('PeerViewController', ["$scope", "$rootScope", 'apiFactory', '$timeout', function ($scope, $rootScope, apiFactory, $timeout) {

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
      $scope.name = 'global-view-map';
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

            if (row.entity.isUp === 1) {
              return 'up-icon bmp-up';
            }
            else {
              return 'down-icon bmp-down';
            }
          }
        },
        {field: 'RouterName', displayName: 'Router Name', width: '15%'},
        {field: 'PeerName', displayName: 'Peer Name', width: '22%'},
        {field: 'PeerIP', displayName: 'Peer IP', width: '18%'},
        {
          field: 'LocalASN', displayName: 'Local ASN', width: '9%',
          cellTemplate: '<div class="ui-grid-cell-contents asn-clickable"><div bmp-asn-model asn="{{ COL_FIELD }}"></div></div>'
        },
        {
          field: 'PeerASN', displayName: 'Peer ASN', width: '8%',
          cellTemplate: '<div class="ui-grid-cell-contents asn-clickable"><div bmp-asn-model asn="{{ COL_FIELD }}"></div></div>'
        },
        {field: 'IPv', displayName: 'IPv', width: '5%'},
        {field: 'Pre_RIB', displayName: 'Pre RIB', width: '10%', type: 'number'},
        {field: 'Post_RIB', displayName: 'Post RIB', width: '10%', type: 'number'}
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
            if (peers[i].isUp == 1) {
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
