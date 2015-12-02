'use strict';

angular.module('bmp.components.card')
  .controller('BmpCardPrefixTrendGraphController', ["$scope", "apiFactory", function ($scope, apiFactory) {

    $scope.loading = true;

    $scope.peerGridInitHeight = 300;

    $scope.prefixTrendGraphConfig = {
      visible: $scope.data.visible // default: true
    };

    d3.rebind('clipVoronoi');

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
        clipVoronoi: false,

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

    var amount_of_entries = 1000;
    var peer_hash_id = $scope.data.peer_hash_id;

    $scope.peerHistoryData = [];

    apiFactory.getPeerHistory(peer_hash_id, amount_of_entries).success(
      function (result) {

        var peer_history = result.v_peer_prefix_report.data;
        var pre_rib_values = [], post_rib_values = [];

        for (var i = 0; i < peer_history.length; i++) {
          var format = d3.time.format("%Y-%m-%d %H:%M:%S");
          var date = +format.parse(moment.utc(peer_history[i].TS, 'YYYY-MM-DD HH:mm:ss.SSSSSS').local().format('YYYY-MM-DD HH:mm:ss'));

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
        $scope.loading = false;
      }
    );

  }]);
