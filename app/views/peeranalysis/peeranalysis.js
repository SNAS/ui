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

    // Table with peers
    $scope.peerTableOptions = {
   //   enableSorting: true,
      columnDefs: [
        { field: 'Status' },
        { field: 'RouterName' },
        { field: 'PeerName' },
        { field: 'PeerIP' },
        { field: 'LocalASN' },
        { field: 'PeerASN' },
        { field: 'IPv'},
        { field: 'Pre_RIB',
          displayName:'Pre-RIB'
        },
        { field: 'Post_RIB',
          displayName:'Post-RIB'
        }
      ]
    };

    function getPrefix(i, peers, peer_prefix){
      for (var idx in peer_prefix) {
        if ((peer_prefix[idx].PeerName == peers[i].PeerName) && (peer_prefix[idx].RouterName == peers[i].RouterName)) {
          return peer_prefix[idx];
        }
      }
      return null;
    }

    getTable();

    function getTable() {
      apiFactory.getPeerPrefix().success(
        function (result) {
          var peers, peer_prefix;
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

                var row={};
                var prefix = getPrefix(i, peers, peer_prefix);

                row.Status = ((peers[i].isUp === "1") && (peers[i].isBMPConnected === "1")) ?  '✔️Up' : '✖️Down';
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

              $scope.peerTableOptions.data=data;

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
    }

    $("#peer_submit").click(function () {
      var time_period = "";
      var amount_of_entries = 0;

      switch($('#time_selector').val()) {
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

      var request = 'http://odl-dev.openbmp.org:8001/db_rest/v1/peer/prefix/' +
        peers[$('#peer_selector').val()].PeerIP + '?last=' + amount_of_entries;
      console.log(request);


      $.getJSON(request, function (json) {

        var peerhistory = json.v_peer_prefix_report.data;

        if ((peerhistory.length == 0)) {
          $("#preposthistory_error").show(500);
        } else {
          $("#preposthistory_container").show(500);
          setTimeout(
            function () {
              var pre_rib_array = [], post_rib_array = [], ts = [];

              for (var i = 0; i < peerhistory.length; i++) {
                pre_rib_array[peerhistory.length - 1 - i] = peerhistory[i].Pre_RIB;
                post_rib_array[peerhistory.length - 1 - i] = peerhistory[i].Post_RIB;
                ts[i] = peerhistory[i].TS;
              }

              console.log("Pre RIB" + pre_rib_array);
              console.log("Post RIB: " + post_rib_array);

              var data_arr_start = peerhistory[peerhistory.length - 1].TS.split(/[: \-]+/);
              var data_arr_end = peerhistory[0].TS.split(/[: \-]+/);

              var year_start = data_arr_start[0];

              var month_start = data_arr_start[1];

              var day_start = data_arr_start[2];

              var hour_start = data_arr_start[3];

              var minute_start = data_arr_start[4];

              var second_start = data_arr_start[5];

              console.log(year_start + "-" + month_start + "-" + day_start + " and " + hour_start + ":" + minute_start + ":" + second_start);


              var year_end = data_arr_end[0];

              var month_end = data_arr_end[1];

              var day_end = data_arr_end[2];

              var hour_end = data_arr_end[3];

              var minute_end = data_arr_end[4];

              var second_end = data_arr_end[5];

              console.log(year_end + "-" + month_end + "-" + day_end + " and " + hour_end + ":" + minute_end + ":" + second_end);

              $(function () {

                // chart 2
                $('#preposthistory2').highcharts({
                  chart: {
                    zoomType: 'x'
                  },
                  title: {
                    text: 'Pre-RIB history for peer ' + peers[$('#peer_selector').val()].PeerName + ' of router ' + peers[$('#peer_selector').val()].RouterName
                  },
                  subtitle: {
                    text: document.ontouchstart === undefined ?
                      'Click and drag in the plot area to zoom in' :
                      'Pinch the chart to zoom in'
                  },
                  xAxis: {
                    title: {
                      text: 'Time'
                    },
                    type: 'datetime',
                    minRange: 15 * 5 * 1000 // five minutes
                  },
                  yAxis: {
                    title: {
                      text: 'Prefix Amount'
                    }
                  },
                  legend: {
                    enabled: false
                  },
                  plotOptions: {
                    area: {
                      fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                        stops: [
                          [0, Highcharts.getOptions().colors[0]],
                          [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                      },
                      marker: {
                        radius: 2
                      },
                      lineWidth: 1,
                      states: {
                        hover: {
                          lineWidth: 1
                        }
                      },
                      threshold: null
                    }
                  },

                  series: [
                    {
                      type: 'area',
                      name: 'Prefixes',
                      pointInterval: 89 * 1000,
                      pointStart: Date.UTC(year_start, month_start - 1, day_start, hour_start, minute_start, second_start),
                      data: pre_rib_array
                    }
                  ]
                });


                // chart 3
                $('#preposthistory3').highcharts({
                  chart: {
                    zoomType: 'x'
                  },
                  title: {
                    text: 'Post-RIB history for peer ' + peers[$('#peer_selector').val()].PeerName + ' of router ' + peers[$('#peer_selector').val()].RouterName
                  },
                  subtitle: {
                    text: document.ontouchstart === undefined ?
                      'Click and drag in the plot area to zoom in' :
                      'Pinch the chart to zoom in'
                  },
                  xAxis: {
                    title: {
                      text: 'Time'
                    },
                    type: 'datetime',
                    minRange: 15 * 5 * 1000 // five minutes
                  },
                  yAxis: {
                    title: {
                      text: 'Prefix Amount'
                    }
                  },
                  legend: {
                    enabled: false
                  },
                  plotOptions: {
                    area: {
                      fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                        stops: [
                          [0, Highcharts.getOptions().colors[0]],
                          [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                      },
                      marker: {
                        radius: 2
                      },
                      lineWidth: 1,
                      states: {
                        hover: {
                          lineWidth: 1
                        }
                      },
                      threshold: null
                    }
                  },

                  series: [
                    {
                      type: 'area',
                      name: 'Prefixes',
                      pointInterval: 89 * 1000,
                      pointStart: Date.UTC(year_start, month_start - 1, day_start, hour_start, minute_start, second_start),
                      data: post_rib_array
                    }
                  ]
                });

                // chart 1
                $('#preposthistory').highcharts({
                  title: {
                    text: 'Pre-RIB & Post-RIB History of ' + peers[$('#peer_selector').val()].PeerName + ' peer',
                    x: -20 //center
                  },
                  subtitle: {
                    text: time_period,
                    x: -20
                  },
                  xAxis: {
                    title: {
                      text: 'Time'
                    }
                    //   categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    //       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                  },
                  yAxis: {
                    title: {
                      text: 'Amount of prefixes'
                    },
                    plotLines: [
                      {
                        value: 0,
                        width: 1,
                        color: '#808080'
                      }
                    ]
                  },
                  tooltip: {
                    valueSuffix: ' prefixes'
                  },
                  legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle',
                    borderWidth: 0
                  },
                  series: [
                    {
                      name: 'Pre-RIB',
                      data: pre_rib_array
                    },
                    {
                      name: 'Post-RIB',
                      data: post_rib_array
                    }
                  ]
                });

              });
            }, 1000);
        }
      });
    })

  }]);
