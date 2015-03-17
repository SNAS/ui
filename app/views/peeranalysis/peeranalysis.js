'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:PeerAnalysisController
 * @description
 * # PeerAnalysisController
 * Controller of the Login page
 */
angular.module('bmpUiApp')
  .controller('PeerAnalysisController', ['$scope', 'apiFactory', function ($scope, apiFactory) {

    var peers;

    // Table with peers
    $scope.peerTableOptions = {
      //   enableSorting: true,
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
      ]
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
                $("#peer_selector").append('<option value="' + i + '">' + peers[i].RouterName + ' \t ' + peers[i].PeerName + '</option>');

                var row = {};
                var prefix = getPrefix(i, peers, peer_prefix);

                row.Status = ((peers[i].isUp === "1") && (peers[i].isBMPConnected === "1")) ? '✔️Up' : '✖️Down';
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

    $("#peer_submit").click(function () {
      var time_period = "";
      var amount_of_entries = 0;

      switch ($('#time_selector').val()) {
        case "day":
          amount_of_entries = 288;
          time_period += "Last Day"
          break;
        case "week":
          amount_of_entries = 2016;
          time_period += "Last Week"
          break;
        default:
          amount_of_entries = 288;
          time_period += "Last Day";
      }

      getPeerHistory(amount_of_entries, time_period);
    })

    function getPeerHistory(amount_of_entries, time_period) {
      apiFactory.getPeerHistory(peers[$('#peer_selector').val()].PeerIP, amount_of_entries).success(
        function (result) {

          var peer_history = result.v_peer_prefix_report.data;

          var pre_rib_values = [], post_rib_values = [];

          for (var i = 0; i < peer_history.length; i++) {
            var format = d3.time.format("%Y-%m-%d %H:%M:%S");
            var date = +format.parse(peer_history[i].TS);
            pre_rib_values.push([date, peer_history[i].Pre_RIB]);
            post_rib_values.push([date, peer_history[i].Post_RIB]);
          }

          $scope.options = {
            chart: {
              type: 'stackedAreaChart',
              height: 450,
              margin: {
                top: 20,
                right: 20,
                bottom: 60,
                left: 40
              },
              x: function (d) {
                return d[0];
              },
              y: function (d) {
                return d[1];
              },
              showVoronoi: true,
              useVoronoi: true,
              clipEdge: true,
              transitionDuration: 500,
              //   useInteractiveGuideline: true,
              showControls: false,
              xAxis: {
                axisLabel: 'Time',
                showMaxMin: true,
                tickFormat: function (d) {
                  return d3.time.format('%X')(new Date(d))
                }
              },
              yAxis: {
                axisLabel: 'Prefix Amount',
                tickFormat: function (d) {
                  return d3.format('d')(d);
                }
              }
            }
          };

          $scope.data = [
            {
              "key": "Pre-RIB",
              "values": pre_rib_values
            },
            {
              "key": "Post-RIB",
              "values": post_rib_values
            }
          ]
        }
      );
    }
  }]);
