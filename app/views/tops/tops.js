'use strict';

angular.module('bmpUiApp')
  .controller('TopsViewController', ["$scope", "apiFactory", '$timeout', '$state', '$stateParams', function ($scope, apiFactory, $timeout, $state, $stateParams) {

    var updateColor = "#EAA546";
    var withdrawColor = "#4B84CA";

    var timeFormat = 'YYYY-MM-DD HH:mm';

    var startTimestamp, endTimestamp;

    endTimestamp = moment().toDate();
    startTimestamp = moment().subtract('minutes', 15).toDate();
    var duration, durationInMinutes;


    $scope.filterPeerText = null;
    $scope.filterPrefixText = null;

    $scope.clearOneVisible = false;
    $scope.clearTwoVisible = false;

    $scope.peerText = "Top 20 Peers By";
    $scope.prefixText = "Top 20 Prefixes By";

    $scope.searchPeer = null;
    $scope.searchPrefix = null;

    var sliderSettings = {
      start: [startTimestamp.getTime(), endTimestamp.getTime()], // Handle start position
      step: 60 * 1000, // Slider moves in increments of a minute
      margin: 60 * 1000, // Handles must be more than 1 minute apart
      limit: 120 * 60 * 1000, // Maximum 2 hours
      connect: true, // Display a colored bar between the handles
      orientation: 'horizontal', // Orient the slider vertically
      behaviour: 'tap-drag', // Move handle on tap, bar is draggable
      range: {
        'min': moment().subtract(4, 'hours').toDate().getTime(),
        'max': moment().toDate().getTime()
      },
      format: {
        to: function (value) {
          return moment(parseInt(value));
        },
        from: function (value) {
          return parseInt(value);
        }
      },
      pips: {
        mode: 'count',
        values: 5,
        density: 4,
        format: {
          to: function (value) {
            return moment(parseInt(value)).format('MM/DD HH:mm');
          }
        }
      }
    };

    loadPreview();

    var timeSelector = $('#timeSelector')[0];

    noUiSlider.create(timeSelector, sliderSettings);

    $('#startDatetimePicker').datetimepicker({
      sideBySide: true,
      format: 'MM/DD/YYYY HH:mm'
    });

    $('#startDatetimePicker').on('dp.hide', function () {
      var setDate = $('#startDatetimePicker').data('DateTimePicker').date();
      var originalValues = timeSelector.noUiSlider.get();
      if (setDate < moment(sliderSettings.range['min'])) {
        timeSelector.noUiSlider.destroy();
        sliderSettings.range = {
          'min': moment(setDate).toDate().getTime(),
          'max': moment(setDate).add(4, 'hours').toDate().getTime()
        };
        loadPreview();
        sliderSettings.start = [moment(setDate).toDate().getTime(), moment(setDate).toDate().getTime() + (originalValues[1] - originalValues[0])];
        noUiSlider.create(timeSelector, sliderSettings);
        bindValues();
      }
      else if (setDate > moment(sliderSettings.range['max']) && setDate <= moment()) {
        timeSelector.noUiSlider.destroy();
        sliderSettings.range = {
          'min': moment(setDate).toDate().getTime(),
          'max': moment(setDate).add(4, 'hours').toDate().getTime()
        };
        loadPreview();
        sliderSettings.start = [moment(setDate).toDate().getTime(), moment(setDate).toDate().getTime() + (originalValues[1] - originalValues[0])];
        noUiSlider.create(timeSelector, sliderSettings);
        bindValues();
      }
      else if (setDate > moment()) {
        alert("You can't go to the future! But you can try to go to your past :)");
      }
      else {
        timeSelector.noUiSlider.set([moment(setDate).toDate().getTime(), moment(setDate).toDate().getTime() + (originalValues[1] - originalValues[0])]);
      }
    });

    $('#endDatetimePicker').datetimepicker({
      sideBySide: true,
      format: 'MM/DD/YYYY HH:mm'
    });

    $('#endDatetimePicker').on('dp.hide', function () {
      var setDate = $('#endDatetimePicker').data('DateTimePicker').date();
      var originalValues = timeSelector.noUiSlider.get();
      if (setDate <= moment(sliderSettings.range['min'])) {
        timeSelector.noUiSlider.destroy();
        sliderSettings.range = {
          'min': moment(setDate).subtract(4, 'hours').toDate().getTime(),
          'max': moment(setDate).toDate().getTime()
        };
        loadPreview();
        sliderSettings.start = [moment(setDate).toDate().getTime() - (originalValues[1] - originalValues[0]), moment(setDate).toDate().getTime()];
        noUiSlider.create(timeSelector, sliderSettings);
        bindValues();
      }
      else if (setDate > moment(sliderSettings.range['max']) && moment(setDate).subtract(4, 'hours') <= moment()) {
        timeSelector.noUiSlider.destroy();
        sliderSettings.range = {
          'min': moment(setDate).subtract(4, 'hours').toDate().getTime(),
          'max': moment(setDate).toDate().getTime()
        };
        loadPreview();
        sliderSettings.start = [moment(setDate).toDate().getTime() - (originalValues[1] - originalValues[0]), moment(setDate).toDate().getTime()];
        noUiSlider.create(timeSelector, sliderSettings);
        bindValues();
      }
      else if (moment(setDate).subtract(4, 'hours') > moment()) {
        alert("You can't go to the future! But you can try to go to your past :)");

      }
      else {
        timeSelector.noUiSlider.set([moment(setDate).toDate().getTime() - (originalValues[1] - originalValues[0]), moment(setDate).toDate().getTime()]);
      }
    });

    bindValues();

    function bindValues() {
      timeSelector.noUiSlider.on('update', function () {
        $('#startDatetimePicker').data("DateTimePicker").date(timeSelector.noUiSlider.get()[0]);
        $('#endDatetimePicker').data("DateTimePicker").date(timeSelector.noUiSlider.get()[1]);
        durationInMinutes = Math.round((timeSelector.noUiSlider.get()[1] - timeSelector.noUiSlider.get()[0]) / (1000 * 60));
        if (durationInMinutes > 60)
          duration = Math.floor(durationInMinutes / 60) + ' hrs ' + durationInMinutes % 60 + ' mins';
        else
          duration = durationInMinutes + ' Minutes';
        $('#duration').text(duration);
      });
    }

    $scope.leftArrow = function () {
      var originalValues = timeSelector.noUiSlider.get();
      timeSelector.noUiSlider.destroy();
      var originalRange = [sliderSettings.range['min'], sliderSettings.range['max']];
      sliderSettings.range = {
        'min': originalRange[0] - (originalRange[1] - originalRange[0]),
        'max': originalRange[0]
      };
      loadPreview();
      sliderSettings.start = [sliderSettings.range['max'] - (originalValues[1] - originalValues[0]), sliderSettings.range['max']];
      noUiSlider.create(timeSelector, sliderSettings);
      bindValues();
    };

    $scope.rightArrow = function () {
      var originalValues = timeSelector.noUiSlider.get();
      timeSelector.noUiSlider.destroy();
      var originalRange = [sliderSettings.range['min'], sliderSettings.range['max']];
      sliderSettings.range = {
        'min': originalRange[1],
        'max': originalRange[1] + (originalRange[1] - originalRange[0])
      };
      loadPreview();
      sliderSettings.start = [sliderSettings.range['min'], sliderSettings.range['min'] + (originalValues[1] - originalValues[0])];
      noUiSlider.create(timeSelector, sliderSettings);
      bindValues();
    };

    $scope.setToNow = function () {
      var originalValues = timeSelector.noUiSlider.get();
      timeSelector.noUiSlider.destroy();
      sliderSettings.range = {
        'min': moment().subtract(4, 'hours').toDate().getTime(),
        'max': moment().toDate().getTime()
      };
      loadPreview();
      sliderSettings.start = [moment().toDate().getTime() - (originalValues[1] - originalValues[0]), moment().toDate().getTime()];
      noUiSlider.create(timeSelector, sliderSettings);
      bindValues();
    };

    function loadPreview() {
      $scope.previewGraphData = [];

      //Load previewGraph updates
      apiFactory.getUpdatesOverTime($scope.searchPeer, $scope.searchPrefix, 60, moment(sliderSettings.range['min']).tz('UTC').format(timeFormat), moment(sliderSettings.range['max']).tz('UTC').format(timeFormat))
        .success(function (result) {
          var len = result.table.data.length;
          var data = result.table.data;
          var gData = [];
          for (var i = len - 1; i >= 0; i--) {
            var timestmp = moment.utc(data[i].IntervalTime, "YYYY-MM-DD HH:mm:ss").local().toDate().getTime();

            gData.push([
              timestmp, parseInt(data[i].Count)
            ]);
          }
          $scope.previewGraphData[0] = {
            key: "Updates",
            values: gData
          };
        })
        .error(function (error) {
          console.log(error.message);
        });

      //Load previewGraph withdraws
      apiFactory.getWithdrawsOverTime($scope.searchPeer, $scope.searchPrefix, 60, moment(sliderSettings.range['min']).tz('UTC').format(timeFormat), moment(sliderSettings.range['max']).tz('UTC').format(timeFormat))
        .success(function (result) {
          var len = result.table.data.length;
          var data = result.table.data;
          var gData = [];
          for (var i = len - 1; i >= 0; i--) {
            var timestmp = moment.utc(data[i].IntervalTime, "YYYY-MM-DD HH:mm:ss").local().toDate().getTime();

            gData.push([
              timestmp, parseInt(data[i].Count)
            ]);
          }
          $scope.previewGraphData[1] = {
            key: "Withdraws",
            values: gData
          };
        })
        .error(function (error) {
          console.log(error.message);
        });
    }

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
        case "both":
        {
          $scope.searchPeer = null;
          $scope.peerText = "Top 20 Peers By";
          $scope.filterPeerText = null;
          $scope.searchPrefix = null;
          $scope.prefixText = "Top 20 Prefixes By";
          $scope.filterPrefixText = null;
          break;
        }
      }
      loadPreview();
      loadAll();
    };

    //$scope.keypress = function (keyEvent) {
    //  if (keyEvent.which === 13)
    //    loadAll();
    //};

    $scope.$on('$locationChangeStart', function (event, next, current) {
      if ($scope.searchPrefix != null || $scope.searchPeer != null) {
        // Here you can take the control and call your own functions:
        $scope.clearFilter('both');
        // Prevent the browser default action (Going back):
        event.preventDefault();
      }
    });

    var updatesTrendData, withdrawsTrendData;

    //For Redirect On The Second Click on prefix bar

    var goPrefixAnaType, goPrefixPeer;

    $scope.goPrefixAnalysis = function () {
      $('#redirectModal').modal('hide');
      $('body').removeClass('modal-open');
      $('.modal-backdrop').remove();
      $state.go('app.prefixAnalysis', {
        p: $scope.filterPrefixText,
        peer: goPrefixPeer,
        type: goPrefixAnaType
      });
    };
    //load All the graphs
    var loadAll = $scope.loadAll = function () {
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

      startTimestamp = moment($('#startDatetimePicker').data("DateTimePicker").date()).tz('UTC').format(timeFormat);
      endTimestamp = moment($('#endDatetimePicker').data("DateTimePicker").date()).tz('UTC').format(timeFormat);

      apiFactory.getTopUpdates($scope.searchPeer, $scope.searchPrefix, "peer", startTimestamp, endTimestamp)
        .success(function (result) {

          if (result.l != undefined) {
            var data = result.l.data;
            var len = data.length;
            var gData = [];
            for (var i = 0; i < len; i++) {
              var index=1;
              for(var j = i + 1; j< len;j++){
                if(data[j].PeerAddr == data[i].PeerAddr)
                {
                  data[i].PeerAddr+="("+ index++ +")";
                  data[j].PeerAddr+="("+ index++ +")";
                }
              }
              gData.push({
                label: data[i].PeerAddr,
                value: parseInt(data[i].Count),
                hash: data[i].peer_hash_id,
                peerIP: data[i].PeerAddr,
                peerName: data[i].PeerName,
                routerIP: data[i].RouterAddr,
                routerName: data[i].RouterName,
                collectorIP: data[i].CollectorAddr,
                collectorName: data[i].CollectorName,
                collectorAdminID: data[i].CollectorAdminID
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

      apiFactory.getTopWithdraws($scope.searchPeer, $scope.searchPrefix, "peer", startTimestamp, endTimestamp)
        .success(function (result) {

          if (result.l != undefined) {
            var data = result.l.data;
            var len = data.length;
            var gData = [];
            for (var i = 0; i < len; i++) {
              var index=1;
              for(var j = i + 1; j< len;j++){
                if(data[j].PeerAddr == data[i].PeerAddr)
                {
                  data[i].PeerAddr+="("+ index++ +")";
                  data[j].PeerAddr+="("+ index++ +")";
                }
              }
              gData.push({
                label: data[i].PeerAddr,
                value: parseInt(data[i].Count),
                hash: data[i].peer_hash_id,
                peerIP: data[i].PeerAddr,
                peerName: data[i].PeerName,
                routerIP: data[i].RouterAddr,
                routerName: data[i].RouterName,
                collectorIP: data[i].CollectorAddr,
                collectorName: data[i].CollectorName,
                collectorAdminID: data[i].CollectorAdminID
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

      apiFactory.getTopUpdates($scope.searchPeer, $scope.searchPrefix, "prefix", startTimestamp, endTimestamp, true)
        .success(function (result) {

          if (result.l != undefined) {
            var data = result.l.data;
            var len = data.length;
            var gData = [];
            for (var i = 0; i < len; i++) {
              var index=1;
              for(var j = i + 1; j< len;j++){
                if(data[j].Prefix == data[i].Prefix && data[j].PrefixLen == data[i].PrefixLen)
                {
                  data[i].PrefixLen+="("+ index++ +")";
                  data[j].PrefixLen+="("+ index++ +")";
                }
              }
              gData.push({
                label: data[i].Prefix + "/" + data[i].PrefixLen,
                value: parseInt(data[i].Count),
                prefixDescr: data[i].PrefixDescr,
                originAS: data[i].OriginAS,
                peerHash: data[i].peer_hash_id,
                peerIP: data[i].PeerAddr,
                peerName: data[i].PeerName,
                routerIP: data[i].RouterAddr,
                routerName: data[i].RouterName,
                collectorIP: data[i].CollectorAddr,
                collectorName: data[i].CollectorName,
                collectorAdminID: data[i].CollectorAdminID
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

      apiFactory.getTopWithdraws($scope.searchPeer, $scope.searchPrefix, "prefix", startTimestamp, endTimestamp, true)
        .success(function (result) {

          if (result.l != undefined) {
            var data = result.l.data;
            var len = data.length;
            var gData = [];
            for (var i = 0; i < len; i++) {
              var index=1;
              for(var j = i + 1; j< len;j++){
                if(data[j].Prefix == data[i].Prefix && data[j].PrefixLen == data[i].PrefixLen)
                {
                  data[i].PrefixLen+="("+ index++ +")";
                  data[j].PrefixLen+="("+ index++ +")";
                }
              }
              gData.push({
                label: data[i].Prefix + "/" + data[i].PrefixLen,
                value: parseInt(data[i].Count),
                prefixDescr: data[i].PrefixDescr,
                originAS: data[i].OriginAS,
                peerHash: data[i].peer_hash_id,
                peerIP: data[i].PeerAddr,
                peerName: data[i].PeerName,
                routerIP: data[i].RouterAddr,
                routerName: data[i].RouterName,
                collectorIP: data[i].CollectorAddr,
                collectorName: data[i].CollectorName,
                collectorAdminID: data[i].CollectorAdminID
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

      var trendGraphUpdates = null, trendGraphWithdraws = null;

      //Trend Graph
      apiFactory.getUpdatesOverTime($scope.searchPeer, $scope.searchPrefix, ((durationInMinutes * 60) / 24), startTimestamp, endTimestamp)
        .success(function (result) {
          var len = result.table.data.length;
          var data = result.table.data;
          var gData = [];
          for (var i = len - 1; i >= 0; i--) {
            var timestmp = moment.utc(data[i].IntervalTime, "YYYY-MM-DD HH:mm:ss").local().toDate().getTime();

            gData.push([
              timestmp, parseInt(data[i].Count)
            ]);
          }
          updatesTrendData = gData;

          trendGraphUpdates = {
            key: "Updates",
            values: updatesTrendData
          };
        })
        .error(function (error) {
          console.log(error.message);
        });
      apiFactory.getWithdrawsOverTime($scope.searchPeer, $scope.searchPrefix, ((durationInMinutes * 60) / 24), startTimestamp, endTimestamp)
        .success(function (result) {
          var len = result.table.data.length;
          var data = result.table.data;
          var gData = [];
          for (var i = len - 1; i >= 0; i--) {
            var timestmp = moment.utc(data[i].IntervalTime, "YYYY-MM-DD HH:mm:ss").local().toDate().getTime();

            gData.push([
              timestmp, parseInt(data[i].Count)
            ]);
          }
          withdrawsTrendData = gData;

          trendGraphWithdraws = {
            key: "Withdraws",
            values: withdrawsTrendData
          };
        })
        .error(function (error) {
          console.log(error.message);
        });

      // For Trend Graph, avoid the bug of the areas stacked together
      function setTrendData() {
        if (trendGraphUpdates != null && trendGraphWithdraws != null) {
          var withdrawsLength = trendGraphWithdraws.values.length;
          var updatesLength = trendGraphUpdates.values.length;
          var match = false, index;

          if (withdrawsLength > 0) {
            if (updatesLength > 0) {
              trendGraphUpdates.values.forEach(function (u) {
                match = false;
                index = trendGraphUpdates.values.indexOf(u);
                trendGraphWithdraws.values.forEach(function (w) {
                  if (u[0] == w[0]) {
                    match = true;
                  }
                });
                if (!match) {
                  trendGraphWithdraws.values.splice(index, 0, [u[0], 0]);
                }
              });
            }
            $scope.trendGraphData.push(trendGraphWithdraws);
          }

          if (updatesLength > 0) {
            if (withdrawsLength > 0) {
              trendGraphWithdraws.values.forEach(function (w) {
                match = false;
                index = trendGraphWithdraws.values.indexOf(w);
                trendGraphUpdates.values.forEach(function (u) {
                  if (w[0] == u[0]) {
                    match = true;
                  }
                });
                if (!match) {
                  trendGraphUpdates.values.splice(index, 0, [w[0], 0]);
                }
              });
            }
            $scope.trendGraphData.push(trendGraphUpdates);
          }

          $scope.trendGraphLoading = false;
        }
        else {
          setTimeout(function () {
            setTrendData();
          }, 250);
        }
      }

      setTrendData();

      // ------------------ used for GRAPHS ---------- binding click function-----------------------------//
      function bindGraphOneClick() {
        if ($scope.topUpdatesByPeerData[0].values != undefined) {
          d3.selectAll("#topUpdatesByPeer .nv-bar").on('click', function (d) {
            $scope.searchPeer = d.hash;
            $scope.filterPeerText = d.label;
            $scope.peerText = "Peer -- " + d.label + " :";
            loadPreview();
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
            loadPreview();
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
            if ($scope.searchPrefix == null) {
              $scope.searchPrefix = d.label;
              $scope.filterPrefixText = d.label;
              $scope.prefixText = "Prefix -- " + d.label + " :";
              loadPreview();
              loadAll();
            }
            else {
              $('#redirectModal').modal('show');
              goPrefixPeer = d.peerHash;
              goPrefixAnaType = 'updates';
            }
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
            if ($scope.searchPrefix == null) {
              $scope.searchPrefix = d.label;
              $scope.filterPrefixText = d.label;
              $scope.prefixText = "Prefix -- " + d.label + " :";
              loadPreview();
              loadAll();
            }
            else {
              $('#redirectModal').modal('show');
              goPrefixPeer = d.peerHash;
              goPrefixAnaType = 'withdraws';
            }
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

    $scope.topUpdatesByPeerGraph = {
      chart: {
        type: 'discreteBarChart',
        height: 500,
        margin: {
          top: 20,
          right: 20,
          bottom: 95,
          left: 55
        },
        color: [updateColor],
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
        tooltipContent: function (key, x, y, e) {
          var data = e.point;
          hoverValue(x);
          return '<h3>' + x + '</h3>' +
            '<div style="line-height:1">' +
            '<p>' + 'Updated ' + y + ' times' + '</p>' +
            '<p>' + 'Peer Name - ' + data.peerName + '</p>' +
            '<p>' + 'Router - ' + data.routerIP + " " + data.routerName + '</p>' +
            '<p>' + 'Collector Admin ID - ' + data.collectorAdminID + '</p>'
            + '</div>';
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

    $scope.topWithdrawsByPeerGraph = {
      chart: {
        type: 'discreteBarChart',
        height: 500,
        margin: {
          top: 20,
          right: 20,
          bottom: 95,
          left: 55
        },
        color: [withdrawColor],
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
        tooltipContent: function (key, x, y, e) {
          var data = e.point;
          hoverValue(x);
          return '<h3>' + x + '</h3>' +
            '<div style="line-height:1">' +
            '<p>' + 'Withdrawn ' + y + ' times' + '</p>' +
            '<p>' + 'Peer Name - ' + data.peerName + '</p>' +
            '<p>' + 'Router - ' + data.routerIP + " " + data.routerName + '</p>' +
            '<p>' + 'Collector Admin ID - ' + data.collectorAdminID + '</p>'
            + '</div>';
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

    $scope.topUpdatesByPrefixGraph = {
      chart: {
        type: 'discreteBarChart',
        height: 500,
        margin: {
          top: 20,
          right: 20,
          bottom: 95,
          left: 65
        },
        color: [updateColor],
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
        tooltipContent: function (key, x, y, e) {
          var data = e.point;
          hoverValue(x);
          return '<h3>' + x + '</h3>' +
            '<div style="line-height:1">' +
            '<p>' + 'Updated ' + y + ' times' + '</p>' +
            (data.prefixDescr&&data.prefixDescr!='null'?('<p>' + 'Description - ' + data.prefixDescr + '</p>'):"") +
            (data.originAS>0?('<p>' + 'Origin AS - ' + data.originAS + '</p>'):"") +
            '<p>' + 'Peer - ' + data.peerIP + " " + data.peerName + '</p>' +
            '<p>' + 'Router - ' + data.routerIP + " " + data.routerName + '</p>' +
            '<p>' + 'Collector Admin ID - ' + data.collectorAdminID + '</p>'
            + '</div>';
        },
        xAxis: {
          rotateLabels: -30,
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

    $scope.topWithdrawsByPrefixGraph = {
      chart: {
        type: 'discreteBarChart',
        height: 500,
        margin: {
          top: 20,
          right: 20,
          bottom: 95,
          left: 65
        },
        color: [withdrawColor],
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
        tooltipContent: function (key, x, y, e) {
          var data = e.point;
          hoverValue(x);
          return '<h3>' + x + '</h3>' +
            '<div style="line-height:1">' +
            '<p>' + 'Updated ' + y + ' times' + '</p>' +
            (data.prefixDescr&&data.prefixDescr!='null'?('<p>' + 'Description - ' + data.prefixDescr + '</p>'):"") +
            (data.originAS>0?('<p>' + 'Origin AS - ' + data.originAS + '</p>'):"") +
            '<p>' + 'Peer - ' + data.peerIP + " " + data.peerName + '</p>' +
            '<p>' + 'Router - ' + data.routerIP + " " + data.routerName + '</p>' +
            '<p>' + 'Collector Admin ID - ' + data.collectorAdminID + '</p>'
            + '</div>';
        },
        xAxis: {
          rotateLabels: -30,
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
          bottom: 60,
          left: 80
        },
        color: function (d) {
          if (d.key == "Updates")
            return updateColor;
          if (d.key == "Withdraws")
            return withdrawColor;
        },
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
            if (d % 60 == 0)
              return moment(d).format(timeFormat);
            else
              return moment(d).format(timeFormat + ":ss");
          }
        },
        yAxis: {
          axisLabel: 'Count',
          tickFormat: d3.format('d')
        }
      }
    };
    $scope.previewGraph = {
      chart: {
        type: "lineChart",
        height: 120,
        margin: {
          top: 20,
          right: 0,
          bottom: 10,
          left: 0
        },
        color: function (d) {
          if (d.key == "Updates")
            return updateColor;
          if (d.key == "Withdraws")
            return withdrawColor;
        },
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
        showXAxis: false,
        showYAxis: false,
        xAxis: {
          tickFormat: function (d) {
            return moment(d).format("MM/DD/YYYY HH:mm");
          }
        }
      }
    };

    /*Trend Graph END*/

    loadAll();


  }

  ])
;
