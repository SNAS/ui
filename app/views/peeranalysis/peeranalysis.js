'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:PeerAnalysisController
 * @description
 * # PeerAnalysisController
 * Controller of the Login page
 */
angular.module('bmpUiApp')
  .controller('PeerAnalysisController', ['$scope', 'apiFactory','$timeout', function ($scope, apiFactory, $timeout) {

    var peers;

    // Table with peers
    $scope.peerTableOptions = {
      enableRowSelection: true,
      enableRowHeaderSelection: false,
      multiSelect:false,
      noUnselect:true,

      columnDefs: [
        {field: 'Status'},
        {field: 'RouterName'},
        {field: 'PeerName'},
        {field: 'PeerIP'},
        {field: 'LocalASN'},
        {field: 'PeerASN'},
        {field: 'IPv'},
        {
          field: 'Pre_RIB',
          displayName: 'Pre-RIB'
        },
        {
          field: 'Post_RIB',
          displayName: 'Post-RIB'
        }
      ],

      rowTemplate :
        '<div ng-click="grid.appScope.changeSelected();" ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',
      onRegisterApi : function (gridApi) {
        $scope.gridApi = gridApi;
      }
    };

    function getPrefix(i, peers, peer_prefix) {
      for (var idx in peer_prefix) {
        if ((peer_prefix[idx].PeerName == peers[i].PeerName) && (peer_prefix[idx].RouterName == peers[i].RouterName)) {
          return peer_prefix[idx];
        }
      }
      return null;
    }

    $(function getTable() {
      apiFactory.getPeerPrefix().success(
        function (result) {
          var peer_prefix;
          peer_prefix = result.v_peer_prefix_report_last.data;
          console.log(peer_prefix);

          apiFactory.getPeers().success(
            function (result) {
              peers = result.v_peers.data;
              //keys = Object.keys(peers[0]);
              console.log(peers);
              var data = [];

              // load peers in combo box
              for (var i = 0; i < peers.length; i++) {
                var row = {};
                var prefix = getPrefix(i, peers, peer_prefix);

                row.Status = ((peers[i].isUp === "1") && (peers[i].isBMPConnected === "1")) ? "✔Up" : "✘Down";
                row.RouterName = peers[i].RouterName;
                row.PeerName = peers[i].PeerName;
                row.PeerIP = peers[i].PeerIP;
                row.LocalASN = peers[i].LocalASN;
                row.PeerASN = peers[i].PeerASN;
                row.IPv = (peers[i].isPeerIPv4 === "1") ? '4' : '6';
                row.Pre_RIB = (prefix == null ) ? 'null' : prefix.Pre_RIB;
                row.Post_RIB = (prefix == null ) ? 'null' : prefix.Post_RIB;

                data.push(row);
              }

              $scope.peerTableOptions.data = data;

              $timeout(function () {
                $scope.gridApi.selection.selectRow($scope.peerTableOptions.data[0]);
                $scope.changeSelected();
              });
              // Click on row in Peers table
              // $('#peertable tbody').on('click', 'tr', function () {
              //   var  keys;
              //   var peername = $('td', this).eq(2).text();
              //   var routername = $('td', this).eq(1).text();
              //   console.log(peername + " & " + routername);
              //   var found = 0;
              //   var i = 0;
              //   while ((!found) && (i < peers.length)) {
              //     if ((peers[i].PeerName === peername) && (peers[i].RouterName === routername)) {
              //       found = 1;
              //     }
              //     i++;
              //   }
              //   i--;
              //
              //   /*for(var t=0; t<peers.length; t++) {
              //    console.log(peers[t].isUp + " -> " + peers[t].PeerName);
              //    }*/
              //
              //   console.log(peers[i].isBMPConnected);
              //   console.log(peers[i].isUp);
              //
              //   $("#peer_modal_table").html('<thead><tr><th>Parameter</th><th class="text-left">Status</th></tr></thead>');
              //
              //   var status = '<table><col width="160"><col width="100"><tr><th>';
              //
              //   if ((peers[i].isUp == "1") && (peers[i].isBMPConnected == "1")) {
              //     $("#peer_modal_label").html('<span style="color:green">' + peername + '</span>');
              //   } else {
              //     $("#peer_modal_label").html('<span style="color:darkred">' + peername + '</span>');
              //     console.log("red");
              //   }
              //
              //   if (peers[i].isBMPConnected == "1") {
              //     status += 'Connection to BMP:</th><th class="text-left"><span style="color:lawngreen">Connected</span></th></tr><tr><th>'
              //   } else {
              //     status += 'Connection to BMP:</th><th class="text-left"><span style="color:darkred">Disconnected</span></th></tr><tr><th>'
              //   }
              //
              //   if (peers[i].isUp == "1") {
              //     status += 'Status:</th><th class="text-left"><span style="color:lawngreen">UP</span></th></tr>'
              //   } else {
              //     status += 'Status:</th><th class="text-left"><span style="color:darkred">Down</span></th></tr>'
              //   }
              //   status += '</table>'
              //
              //
              //   $("#peer_modal_status").html(status);
              //
              //   for (var j = 0; j < keys.length; j++) {
              //     $('#peer_modal_table').append(
              //       '<tr>' +
              //       '<td>' + keys[j] + '</td>' +
              //       '<td class="text-left">' + peers[i][keys[j]] + '</td>' +
              //       '</tr>'
              //     );
              //   }
              //
              //   $('#peer_modal').modal('show');
              // });

            }
          ).
            error(function (error) {
              console.log(error.message);
            });
        }
      );
    });

    //gridApi.selection.on.rowSelectionChanged($scope,function(){
    //});

    $scope.changeSelected = function() {
      var row = $scope.gridApi.selection.getSelectedGridRows()[0].entity;
      var amount_of_entries = 1000;

      apiFactory.getPeerHistory(row.PeerIP, amount_of_entries).success(
        function (result) {

          var peer_history = result.v_peer_prefix_report.data;
          var pre_rib_values = [], post_rib_values = [];

          for (var i = 0; i < peer_history.length; i++) {
            var format = d3.time.format("%Y-%m-%d %H:%M:%S");
            var date = +format.parse(peer_history[i].TS);

            pre_rib_values.push({
              x:date,
              y:peer_history[i].Pre_RIB
            });
            post_rib_values.push({
              x:date,
              y:peer_history[i].Post_RIB}
            );
          }

          var pre_rib_min = d3.min(pre_rib_values, function (d) { return d.y; })*0.999;
          var pre_rib_max = d3.max(pre_rib_values, function (d) { return d.y; });
          var post_rib_min = d3.min(post_rib_values, function (d) { return d.y; })*0.999;
          var post_rib_max = d3.max(post_rib_values, function (d) { return d.y; });

          $scope.options = {
            chart: {
              type: 'linePlusBarWithFocusChart',
              height: 450,
              margin: {
                top: 20,
                right: 100,
                bottom: 60,
                left: 100
              },
              color: ['#9ec654' ,'#f7a031'],

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
                tickFormat: function(d){
                  return d3.format('d')(d);
                }
              },
              y3Axis: {
                tickFormat: function(d) {
                  return d3.format('d')(d);
                }
              },
              y4Axis: {
                tickFormat: function(d) {
                  return d3.format('d')(d);
                }
              },

              bars: { // for bar chart 1
                yDomain: [pre_rib_min, pre_rib_max]
              },
              bars2: { // for bar chart 2
                yDomain: [pre_rib_min, pre_rib_max]
              },
              lines: { // for line chart 1
                yDomain: [post_rib_min, post_rib_max]
              },
              lines2: { // for line chart 2
                yDomain: [post_rib_min, post_rib_max]
              }
            }
          };

          $scope.data = [
            {
              key: "Pre-RIB",
              values: pre_rib_values,
              bar: true
            },
            {
              key: "Post-RIB",
              values: post_rib_values
            }
          ]
        }
      );
    }
    //});
  }]);
