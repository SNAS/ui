'use strict';

angular.module('bmpUiApp')
  .controller('TopsViewController', ["$scope", "apiFactory", '$timeout', '$state', '$stateParams', function ($scope, apiFactory, $timeout, $state, $stateParams) {

    var updateColor = "#89DA59";
    var withdrawColor = "#FF420E";

    $scope.hours = 2;
    var timeNow = new Date();
    $scope.timestamp = timeNow.getFullYear() + "-" + (timeNow.getMonth() + 1) + "-" + timeNow.getDate() + " " + timeNow.getHours() + ":" + timeNow.getMinutes();

    $scope.nodata = false;
    $scope.filterPeerText = null;
    $scope.filterPrefixText = null;

    $scope.clearOneVisible = false;
    $scope.clearTwoVisible = false;

    $scope.peerText = "Top 20 Peers By";
    $scope.prefixText = "Top 20 Prefixes By";

    $scope.searchPeer = null;
    $scope.searchPrefix = null;

    $('#datetimepicker').datetimepicker({
      sideBySide: true,
      showTodayButton: true,
      format: 'YYYY-MM-DD HH:mm'
    });


    $scope.clearFilter = function (type) {
      switch (type) {
        case "peer":
        {
          $scope.searchPeer = null;
          $scope.peerText = "Top 20 Peers By";
          $scope.filterPeerText = null;
          break;
        }
        case "prefix":
        {
          $scope.searchPrefix = null;
          $scope.prefixText = "Top 20 Prefixes By";
          $scope.filterPrefixText = null;
          break;
        }
      }
      loadAll();
    };

    $scope.keypress = function (keyEvent) {
      if (keyEvent.which === 13)
        loadAll();
    };

    var updatesTrendData, withdrawsTrendData;

    //load All the graphs
    var loadAll = function () {
      $scope.topUpdatesByPeerLoading = true;
      $scope.topWithdrawsByPeerLoading = true;
      $scope.topUpdatesByPrefixLoading = true;
      $scope.topWithdrawsByPrefixLoading = true;
      $scope.trendGraphLoading = true;

      $scope.topUpdatesByPeerData = [
        {
          key: "Updates"
        }
      ];
      $scope.topWithdrawsByPeerData = [
        {
          key: "Withdraws"
        }
      ];
      $scope.topUpdatesByPrefixData = [
        {
          key: "Updates"
        }
      ];
      $scope.topWithdrawsByPrefixData = [
        {
          key: "Withdraws"
        }
      ];
      $scope.trendGraphData = [];

      apiFactory.getTopUpdates($scope.searchPeer, $scope.searchPrefix, "peer", $scope.hours, $scope.timestamp)
        .success(function (result) {

          if (result.log != undefined) {
            var data = result.log.data;
            var len = data.length;
            var gData = [];
            for (var i = 0; i < len; i++) {
              gData.push({
                label: data[i].PeerAddr, value: parseInt(data[i].Count), hash: data[i].peer_hash_id
              });
            }
            $scope.topUpdatesByPeerData[0].values = gData;
            $scope.topUpdatesByPeerLoading = false;
          }
          else {
            $scope.topUpdatesByPeerData[0].values = null;
            $scope.topUpdatesByPeerLoading = false;
          }
        })
        .error(function (error) {
          console.log(error.message);
        });

      apiFactory.getTopWithdraws($scope.searchPeer, $scope.searchPrefix, "peer", $scope.hours, $scope.timestamp)
        .success(function (result) {

          if (result.log != undefined) {
            var data = result.log.data;
            var len = data.length;
            var gData = [];
            for (var i = 0; i < len; i++) {
              gData.push({
                label: data[i].PeerAddr, value: parseInt(data[i].Count), hash: data[i].peer_hash_id
              });
            }
            $scope.topWithdrawsByPeerData[0].values = gData;
            $scope.topWithdrawsByPeerLoading = false;
          }
          else {
            $scope.topWithdrawsByPeerData[0].values = [];
            $scope.topWithdrawsByPeerLoading = false;
          }

        })
        .error(function (error) {
          console.log(error.message);
        });

      apiFactory.getTopUpdates($scope.searchPeer, $scope.searchPrefix, "prefix", $scope.hours, $scope.timestamp)
        .success(function (result) {

          if (result.log != undefined) {
            var data = result.log.data;
            var len = data.length;
            var gData = [];
            for (var i = 0; i < len; i++) {
              gData.push({
                label: data[i].Prefix + "/" + data[i].PrefixLen, value: parseInt(data[i].Count)
              });
            }
            $scope.topUpdatesByPrefixData[0].values = gData;
            $scope.topUpdatesByPrefixLoading = false;
          }
          else {
            $scope.topUpdatesByPrefixData[0].values = [];
            $scope.topUpdatesByPrefixLoading = false;
          }
        })
        .error(function (error) {
          console.log(error.message);
        });

      apiFactory.getTopWithdraws($scope.searchPeer, $scope.searchPrefix, "prefix", $scope.hours, $scope.timestamp)
        .success(function (result) {

          if (result.log != undefined) {
            var data = result.log.data;
            var len = data.length;
            var gData = [];
            for (var i = 0; i < len; i++) {
              gData.push({
                label: data[i].Prefix + "/" + data[i].PrefixLen, value: parseInt(data[i].Count)
              });
            }
            $scope.topWithdrawsByPrefixData[0].values = gData;
            $scope.topWithdrawsByPrefixLoading = false;
          }
          else {
            $scope.topWithdrawsByPrefixData[0].values = [];
            $scope.topWithdrawsByPrefixLoading = false;
          }
        })
        .error(function (error) {
          console.log(error.message);
        });

      //Trend Graph
      apiFactory.getUpdatesOverTime($scope.searchPeer, $scope.searchPrefix, 5, $scope.timestamp)
        .success(function (result) {
          var len = result.table.data.length;
          var data = result.table.data;
          var gData = [];
          for (var i = len - 1; i > 0; i--) {

            // var timestmp = Date.parse(data[i].IntervalTime); //"2015-03-22 22:23:06"
            // Modified by Jason. Date.parse returns nothing
            var timestmpArray = data[i].IntervalTime.split(/-| |:|\./); //"2015-03-22 22:23:06"
            var date = new Date(timestmpArray[0], timestmpArray[1], timestmpArray[2], timestmpArray[3], timestmpArray[4], timestmpArray[5]);
            var timestmp = date.getTime();

            gData.push([
              timestmp, parseInt(data[i].Count)
            ]);
          }
          updatesTrendData = gData;
          $scope.trendGraphLoading = false;

          $scope.trendGraphData.push({
            key: "Updates",
            values: updatesTrendData
          });
        })
        .error(function (error) {
          console.log(error.message);
        });
      apiFactory.getWithdrawsOverTime($scope.searchPeer, $scope.searchPrefix, 5, $scope.timestamp)
        .success(function (result) {
          var len = result.table.data.length;
          var data = result.table.data;
          var gData = [];
          for (var i = len - 1; i > 0; i--) {

            // var timestmp = Date.parse(data[i].IntervalTime); //"2015-03-22 22:23:06"
            // Modified by Jason. Date.parse returns nothing
            var timestmpArray = data[i].IntervalTime.split(/-| |:|\./); //"2015-03-22 22:23:06"
            var date = new Date(timestmpArray[0], timestmpArray[1], timestmpArray[2], timestmpArray[3], timestmpArray[4], timestmpArray[5]);
            var timestmp = date.getTime();

            gData.push([
              timestmp, parseInt(data[i].Count)
            ]);
          }
          withdrawsTrendData = gData;

          $scope.trendGraphData.push({
            key: "Withdraws",
            values: withdrawsTrendData
          });
        })
        .error(function (error) {
          console.log(error.message);
        });

      // ------------------ used for GRAPHS ---------- binding click function-----------------------------//
      function bindGraphOneClick() {
        if ($scope.topUpdatesByPeerData[0].values != undefined) {
          d3.selectAll("#topUpdatesByPeer .nv-bar").on('click', function (d) {
            $scope.searchPeer = d.hash;
            $scope.filterPeerText = d.label;
            $scope.peerText = "Peer -- " + d.label + " :";
            loadAll();
          });
        }
        else {
          setTimeout(function () {
            bindGraphOneClick();
          }, 250);
        }
      }

      function bindGraphTwoClick() {
        if ($scope.topWithdrawsByPeerData[0].values != undefined) {
          d3.selectAll("#topWithdrawsByPeer .nv-bar").on('click', function (d) {
            $scope.searchPeer = d.hash;
            $scope.filterPeerText = d.label;
            $scope.peerText = "Peer -- " + d.label + " :";
            loadAll();
          });
        }
        else {
          setTimeout(function () {
            bindGraphTwoClick();
          }, 250);
        }
      }

      function bindGraphThreeClick() {
        if ($scope.topUpdatesByPrefixData[0].values != undefined) {
          d3.selectAll("#topUpdatesByPrefix .nv-bar").on('click', function (d) {
            $scope.searchPrefix = d.label;
            $scope.filterPrefixText = d.label;
            $scope.prefixText = "Prefix -- " + d.label + " :";
            loadAll();
          });
        }
        else {
          setTimeout(function () {
            bindGraphThreeClick();
          }, 250);
        }
      }

      function bindGraphFourClick() {
        if ($scope.topUpdatesByPrefixData[0].values != undefined) {
          d3.selectAll("#topWithdrawsByPrefix .nv-bar").on('click', function (d) {
            $scope.searchPrefix = d.label;
            $scope.filterPrefixText = d.label;
            $scope.prefixText = "Prefix -- " + d.label + " :";
            loadAll();
          });
        }
        else {
          setTimeout(function () {
            bindGraphFourClick();
          }, 250);
        }
      }

      bindGraphOneClick();
      bindGraphTwoClick();
      bindGraphThreeClick();
      bindGraphFourClick();

    };

    /* Top 20 Updates By Peer Graph START*/

    $scope.topUpdatesByPeerLoading = true;
    $scope.topUpdatesByPeerGraph = {
      chart: {
        type: 'discreteBarChart',
        height: 500,
        margin: {
          top: 20,
          right: 20,
          bottom: 80,
          left: 70
        },
        color: function (d, i) {
          return updateColor;
        },
        x: function (d) {
          return d.label;
        },
        y: function (d) {
          return d.value;
        },
        showValues: true,
        valueFormat: function (d) {
          return d3.format('')(d);
        },
        transitionDuration: 500,
        tooltipContent: function (key, x, y, e, graph) {
          //hover = y;
          hoverValue(x);
          return '<h3>' + key + '</h3>' +
            '<p>' + y + ' on ' + x + '</p>';
        },
        xAxis: {
          rotateLabels: -25,
          rotateYLabel: true
        },
        yAxis: {
          axisLabel: 'Number of Updates',
          axisLabelDistance: 30,
          tickFormat: d3.format('d')
        }
      }
    };

    var hoverValue = function (y) {
      $scope.hover = y;
      $scope.$apply();
    };

    /*Top 20 Updates By Peer Graph END*/


    /*Top 20 Withdraws By Peer Graph START*/

    $scope.topWithdrawsByPeerLoading = true;
    $scope.topWithdrawsByPeerGraph = {
      chart: {
        type: 'discreteBarChart',
        height: 500,
        margin: {
          top: 20,
          right: 20,
          bottom: 80,
          left: 55
        },
        color: function (d, i) {
          return withdrawColor
        },
        x: function (d) {
          return d.label;
        },
        y: function (d) {
          return d.value;
        },
        showValues: true,
        valueFormat: function (d) {
          return d3.format('')(d);
        },
        transitionDuration: 500,
        tooltipContent: function (key, x, y, e, graph) {
          hoverValue(x);
          return '<h3>' + key + '</h3>' +
            '<p>' + y + ' on ' + x + '</p>';
        },
        xAxis: {
          rotateLabels: -25,
          rotateYLabel: true
        },
        yAxis: {
          axisLabel: 'Number of Withdraws',
          axisLabelDistance: 30,
          tickFormat: d3.format('d')
        }
      }
    };

    var hoverValue = function (y) {
      $scope.hover = y;
      $scope.$apply();
    };

    /*Top 20 Withdraws By Peer Graph END*/


    /* Top 20 Updates By Peer Graph START*/

    $scope.topUpdatesByPrefixLoading = true;
    $scope.topUpdatesByPrefixGraph = {
      chart: {
        type: 'discreteBarChart',
        height: 500,
        margin: {
          top: 20,
          right: 20,
          bottom: 80,
          left: 70
        },
        color: function (d, i) {
          return updateColor;
        },
        x: function (d) {
          return d.label;
        },
        y: function (d) {
          return d.value;
        },
        showValues: true,
        valueFormat: function (d) {
          return d3.format('')(d);
        },
        transitionDuration: 500,
        tooltipContent: function (key, x, y, e, graph) {
          //hover = y;
          hoverValue(x);
          return '<h3>' + key + '</h3>' +
            '<p>' + y + ' on ' + x + '</p>';
        },
        xAxis: {
          rotateLabels: -25,
          rotateYLabel: true
        },
        yAxis: {
          axisLabel: 'Number of Updates',
          axisLabelDistance: 30,
          tickFormat: d3.format('d')
        }
      }
    };

    var hoverValue = function (y) {
      $scope.hover = y;
      $scope.$apply();
    };

    /*Top 20 Updates By Peer Graph END*/


    /*Top 20 Withdraws By Peer Graph START*/

    $scope.topWithdrawsByPrefixLoading = true;
    $scope.topWithdrawsByPrefixGraph = {
      chart: {
        type: 'discreteBarChart',
        height: 500,
        margin: {
          top: 20,
          right: 20,
          bottom: 80,
          left: 55
        },
        color: function (d, i) {
          return withdrawColor
        },
        x: function (d) {
          return d.label;
        },
        y: function (d) {
          return d.value;
        },
        showValues: true,
        valueFormat: function (d) {
          return d3.format('')(d);
        },
        transitionDuration: 500,
        tooltipContent: function (key, x, y, e, graph) {
          hoverValue(x);
          return '<h3>' + key + '</h3>' +
            '<p>' + y + ' on ' + x + '</p>';
        },
        xAxis: {
          rotateLabels: -25,
          rotateYLabel: true
        },
        yAxis: {
          axisLabel: 'Number of Withdraws',
          axisLabelDistance: 30,
          tickFormat: d3.format('d')
        }
      }
    };

    var hoverValue = function (y) {
      $scope.hover = y;
      $scope.$apply();
    };

    /*Top 20 Withdraws By Peer Graph END*/

    /*Trend Graph START*/
    $scope.trendGraph = {
      chart: {
        type: "stackedAreaChart",
        height: 450,
        margin: {
          top: 20,
          right: 20,
          bottom: 90,
          left: 80
        },
        color: [withdrawColor, updateColor],
        x: function (d) {
          return d[0];
        },
        y: function (d) {
          return d[1];
        },
        useVoronoi: true,
        clipEdge: true,
        transitionDuration: 500,
        useInteractiveGuideline: true,
        showLegend: false,
        showControls: false,
        xAxis: {
          showMaxMin: false,
          rotateLabels: -20,
          rotateYLabel: true,
          tickFormat: function (d) {
            var date = new Date(d);
            return date.getFullYear() + "-" +
              date.getMonth() + "-" +
              date.getDate() + " " +
              date.getHours() + ":" +
              date.getMinutes();
          }
        },
        yAxis: {
          axisLabel: 'Count',
          tickFormat: d3.format('d')
        }
      }
    };

    /*Trend Graph END*/

    loadAll();


  }]);
