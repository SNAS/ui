'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:PeerAnalysisController
 * @description
 * # PeerAnalysisController
 * Controller of the PeerAnalysis page
 */
angular.module('bmpUiApp')
  .controller('PeerAnalysisController', ['$scope', 'apiFactory', '$timeout', 'uiGridConstants', function ($scope, apiFactory, $timeout, uiGridConstants) {

    var peers, peer_prefix;
    var peerPrefixPromise, peersPromise;

    $scope.peerGridInitHeight = 300;

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

      columnDefs: [
        {
          field: 'Status', displayName: 'Status', width: '6%',
          cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {

            if ((row.entity.isUp === 1) && (row.entity.isBMPConnected === 1)) {
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
        {field: 'LocalASN', displayName: 'Local ASN', width: '8%',
          cellTemplate:'<div class="ui-grid-cell-contents"><div bmp-asn-model asn="{{ COL_FIELD }}"></div></div>'},
        {field: 'PeerASN', displayName: 'Peer ASN', width: '8%',
          cellTemplate:'<div class="ui-grid-cell-contents"><div bmp-asn-model asn="{{ COL_FIELD }}"></div></div>'},
        {field: 'IPv', displayName: 'IPv', width: '4%'},
        {field: 'Pre_RIB', displayName: 'Pre RIB', width: '10%'},
        {field: 'Post_RIB', displayName: 'Post RIB', width: '10%'}
      ],

      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          changeSelected(row.entity);
        });
      }
    };

    $scope.toggleFiltering = function(){
      $scope.peerTableOptions.enableFiltering = !$scope.peerTableOptions.enableFiltering;
      $scope.gridApi.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
    };

    $scope.peerHistoryOptions = {
      chart: {
        type: 'linePlusBarWithFocusChart',
        height: 450,
        margin: {
          top: 20,
          right: 100,
          bottom: 60,
          left: 100
        },
        color: ['#4ec0f1', '#9ec654'],
        //color: ['#9ec654' ,'#f7a031'],
        focusShowAxisY: true,
        interactive: false,

        xAxis: {
          axisLabel: 'Time',
          showMaxMin: true,
          tickFormat: function (d) {
            return d3.time.format('%X')(new Date(d))
          }
        },
        x2Axis: {
          tickFormat: function (d) {
            return d3.time.format('%m/%d-%I%p')(new Date(d))
          }
        },
        y1Axis: {
          axisLabel: 'Pre-RIB',
          tickFormat: function (d) {
            return d3.format('d')(d);
          }
        },
        y2Axis: {
          axisLabel: 'Post-RIB',
          tickFormat: function (d) {
            return d3.format('d')(d);
          }
        },
        y3Axis: {
          tickFormat: function (d) {
            return d3.format('d')(d);
          }
        },
        y4Axis: {
          tickFormat: function (d) {
            return d3.format('d')(d);
          }
        }
      }
    };

    $(function getTable() {
      getPeerPrefix();
      getPeers();

      peersPromise.success(function () {
        peerPrefixPromise.success(function () {
          for (var i = 0; i < peers.length; i++) {
            var prefix = getPrefix(i, peers, peer_prefix);
            peers[i].IPv = (peers[i].isPeerIPv4 === 1) ? '4' : '6';
            peers[i].Pre_RIB = (prefix == null ) ? 0 : prefix.Pre_RIB;
            peers[i].Post_RIB = (prefix == null ) ? 0 : prefix.Post_RIB;
          }
          $scope.peerTableOptions.data = peers;
          $scope.peerTableIsLoad = false; //stop loading

          $timeout(function () {
            $scope.gridApi.selection.selectRow($scope.peerTableOptions.data[0]);
          });
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

    // Click on row in Peers table
    function changeSelected(row) {
      getDetails(row);

      var amount_of_entries = 1000;
      var peer_hash_id = row.peer_hash_id;
      getPeerHistory(peer_hash_id, amount_of_entries);
    }

    function getDetails(row) {
      var detailsPanel = '<table class="tableStyle"><thead><tr><th>Parameter</th><th class="text-left">Status</th></tr></thead>';
      var noShow = ["$$hashKey", "Status", "IPv"];

      $scope.data = [];
      $scope.RouterName = row.RouterName;
      $scope.PeerName = row.PeerName;
      $scope.PeerStatus = ((row.isUp === 1) && (row.isBMPConnected === 1)) ? "uptext" : "downtext";

      angular.forEach(row, function (value, key) {
        if (noShow.indexOf(key) == -1) { //doesn't show certain fields
          detailsPanel += (
          '<tr>' +
          '<td>' +
          key +
          '</td>' +

          '<td>' +
          value +
          '</td>' +
          '</tr>'
          );
        }
      });
      detailsPanel += '</table>';

      $scope.detailsPanel = detailsPanel;
    }

    function getPeerHistory(peer_hash_id, amount_of_entries) {
      $scope.peerHistoryData = [];

      apiFactory.getPeerHistory(peer_hash_id, amount_of_entries).success(
        function (result) {

          var peer_history = result.v_peer_prefix_report.data;
          var pre_rib_values = [], post_rib_values = [];

          for (var i = 0; i < peer_history.length; i++) {
            var format = d3.time.format("%Y-%m-%d %H:%M:%S");
            var date = +format.parse(peer_history[i].TS);

            pre_rib_values.push({
              x: date,
              y: peer_history[i].Pre_RIB
            });
            post_rib_values.push({
                x: date,
                y: peer_history[i].Post_RIB
              }
            );
          }

          var pre_rib_min = d3.min(pre_rib_values, function (d) {
              return d.y;
            }) * 0.999;
          var pre_rib_max = d3.max(pre_rib_values, function (d) {
            return d.y;
          });
          var post_rib_min = d3.min(post_rib_values, function (d) {
              return d.y;
            }) * 0.999;
          var post_rib_max = d3.max(post_rib_values, function (d) {
            return d.y;
          });
          if (pre_rib_max == 0) {
            pre_rib_max = post_rib_max;
          }
          if (post_rib_max == 0) {
            post_rib_max = pre_rib_min;
          }

          $scope.peerHistoryOptions.chart.bars = { // for bar chart 1
            yDomain: [pre_rib_min, pre_rib_max]
          };
          $scope.peerHistoryOptions.chart.bars2 = { // for bar chart 1
            yDomain: [pre_rib_min, pre_rib_max]
          };
          $scope.peerHistoryOptions.chart.lines = { // for bar chart 1
            yDomain: [post_rib_min, post_rib_max]
          };
          $scope.peerHistoryOptions.chart.line2 = { // for bar chart 1
            yDomain: [post_rib_min, post_rib_max]
          };

          $scope.peerHistoryData = [
            {
              key: "Pre-RIB",
              values: pre_rib_values,
              bar: true
            },
            {
              key: "Post-RIB",
              values: post_rib_values
            }
          ];
        }
      );
    }

  }]);
