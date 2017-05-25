angular.module('bmp.components.timeSelector', [])
  .factory('DateTimeRangeService', function() {
    const nbHoursToDisplayByDefault = 6;
    const hourInMs = 3600000;

    function now() {
      return moment().minute(0).second(0).millisecond(0);
    }

    var callbacks = [];

    return {
      now: now,
      getDefaultRange: function() {
        return {
          start: now() - nbHoursToDisplayByDefault * hourInMs,
          end: now().utc().valueOf()
        }
      },
      selectedTimestamp: moment().utc().valueOf(),
      selectTimestamp: function(timestamp) {
        this.selectedTimestamp = timestamp;
        this.notifyListeners();
      },
      registerUpdateListener: function(callback) {
        callbacks.push(callback);
      },
      notifyListeners: function() {
        angular.forEach(callbacks, function(callback) {
          callback();
        })
      }
    };
  })
  .controller('LineGraphTimeSelectorCtrl', ['$rootScope', '$scope', '$timeout', 'DateTimeRangeService', '$stateParams',
  function($rootScope, $scope, $timeout, DateTimeRangeService, $stateParams) {
    var dateRangePicker;

    $scope.selectedTimestamp = DateTimeRangeService.selectedTimestamp;
    $scope.blurTimestampStyle = {
      background: "transparent"
    };
    const circleRadius = 48;
    const color = 'black';
    DateTimeRangeService.registerUpdateListener(function() {
      //console.log("got selected timestamp update notification");
      $scope.selectedTimestamp = DateTimeRangeService.selectedTimestamp;
      $scope.selectedTimestampPosition = x($scope.selectedTimestamp);
      var transparentLeft = 'calc(' + $scope.selectedTimestampPosition + '% - ' + circleRadius*1.5 + 'px)';
      var transparentRight = 'calc(' + $scope.selectedTimestampPosition + '% + ' + circleRadius*1.5 + 'px)';
      var left = 'calc(' + $scope.selectedTimestampPosition + '% - ' + circleRadius/2 + 'px)';
      var right = 'calc(' + $scope.selectedTimestampPosition + '% + ' + circleRadius/2 + 'px)';
      var linearGradient = 'linear-gradient(90deg, transparent 0%, transparent ' + transparentLeft + ',' + color + ' ' + left + ', ' + color + ' ' + right + ', transparent ' + transparentRight + ', transparent 100%)';
      $scope.blurTimestampStyle = {
        background: '-webkit-'+linearGradient, /* For Safari 5.1 to 6.0 */
        background: '-o-'+linearGradient, /* For Opera 11.1 to 12.0 */
        background: '-moz-'+linearGradient, /* For Firefox 3.6 to 15 */
        background: linearGradient
      };
    });

    var dateRangeLabel = "Last 6 Hours";
    function setTimestamps(start, end) {
      if (dateRangePicker === undefined) return;
      dateRangePicker.setStartDate(moment(start));
      dateRangePicker.setEndDate(moment(end));
      var newDates = {
        start: dateRangePicker.startDate.utc().valueOf(),
        end: dateRangePicker.endDate.utc().valueOf()
      };

      $scope.selectedTimestampPosition = undefined;

//      console.log("setTimestamps", start, end, newDates);
      computeTimeLines(dateRangeLabel, start, end);
      $rootScope.dateTimeRange = newDates;
      $scope.changedDatesCallback({newDates: newDates});

      var newText = dateRangeFormat(dateRangeLabel, dateRangePicker.startDate, dateRangePicker.endDate);
      setDateRangeInTextField(newText);
    }
    // returns [start, end]
    function getTimestamps() {
      return [
        dateRangePicker.startDate.utc().valueOf(),
        dateRangePicker.endDate.utc().valueOf()
      ];
    }

    $scope.timeLines = [];
    const hourInMs = 3600000;
    const dayInMs = 24*hourInMs;
    const weekInMs = 7*dayInMs;
    const monthInMs = 4*weekInMs;
    function stripMinutesAndSeconds(timestamp) {
      // console.log("stripMinutesAndSeconds", timestamp, moment(timestamp).format('MM/DD/YYYY HH:mm:ss'), (timestamp%hourInMs)/hourInMs, moment(timestamp - (timestamp%hourInMs)).format('MM/DD/YYYY h:mma'));
      return timestamp - (timestamp%hourInMs);
    }
    function beginningOfTheDay(timestamp) {
      var beginningOfDayStringLocal = moment(timestamp).format("YYYY-MM-DDT00:00:00");
      var res = moment(beginningOfDayStringLocal).utc().valueOf();
      // console.log("beginning of day", timestamp, moment(timestamp).format("MM/DD/YYYY HH:mm:ss"), beginningOfDayStringLocal, res, moment(res).format("MM/DD/YYYY HH:mm"), moment(res).utc().format("MM/DD/YYYY HH:mm"));
      return res;
    }

    var fullHours = [];
    var x = d3.time.scale().range([0, 100]); // percentages of the container width
    function computeTimeLines(label, start, end) {
//      var minMaxTimestamps = [getTimestamp("start"), getTimestamp("end")];
      var minMaxTimestamps = getTimestamps();
      if (!minMaxTimestamps[0] || !minMaxTimestamps[1]) return;
//      console.log("computeTimeLines", minMaxTimestamps, minMaxTimestamps.map(function(t) { return moment(t).format("MM/DD/YYYY HH:mm"); }));

      var gapInHours = tickGapsInHours[label];
      $scope.timelineTicksGapType = label.endsWith("Hours") ? 'hours' : 'days';
      if (label === "Custom Range") {
        var duration = end - start;
        gapInHours = duration < 12 * hourInMs ? 1 : duration < dayInMs ? 2 : duration < 2*dayInMs ? 6 : duration < weekInMs ? 24 : 24*7;
        $scope.timelineTicksGapType = duration < 2*dayInMs ? 'hours' : 'days';
      }
      else if (gapInHours === undefined) {
        gapInHours = 1;
      }
      var gap = gapInHours * hourInMs;
      var start = stripMinutesAndSeconds(minMaxTimestamps[0]);
      if ($scope.timelineTicksGapType === "days") {
        start = beginningOfTheDay(start);
        if (minMaxTimestamps[0] > start) {
          start += dayInMs;
        }
      }
      else if (minMaxTimestamps[0] > start) {
        start += hourInMs;
      }
    //  console.log("start", start, moment(start).format("MM/DD/YYYY HH:mm"));
      fullHours = d3.range(start, minMaxTimestamps[1]+1, gap); // +1 to include the last hour
//      console.log("fullHours", fullHours, fullHours.map(function(t) { return moment(t).format("MM/DD/YYYY HH:mm"); }));
      // edge case: when there's only one timestamp, we need it to be centered
      if (fullHours.length === 1) {
        x = d3.time.scale().range([50, 50]);
      }
      x.domain(minMaxTimestamps);
      $timeout(function() {
        // first calculate the position (left, in percentage) for each timestamp
        $scope.timeLines = fullHours.map(function(h) {
          return { timestamp: h, left: x(h) };
        })
        // then filter out the values outside of the [0-100]% range
        .filter(function(t) {
          return t.left >= 0 && t.left <= 100;
        });
      });
    }

    $scope.leftArrow = function() {
      var currentTimestamps = getTimestamps();
      var currentStart = currentTimestamps[0];
      var currentEnd = currentTimestamps[1];
      setTimestamps(currentStart - (currentEnd-currentStart), currentStart);
    };

    $scope.rightArrow = function() {
      var currentTimestamps = getTimestamps();
      var currentStart = currentTimestamps[0];
      var currentEnd = currentTimestamps[1];
      setTimestamps(currentEnd, currentEnd + (currentEnd-currentStart));
    };

    var tickGapsInHours = {
      'Last 6 Hours': 1,
      'Last 12 Hours': 2,
      'Last 24 Hours': 3,
      'Last 7 Days': 24,
      'Last 30 Days': 7*24
    }
    function dateRangeFormat(label, start, end) {
      var duration = end - start;
      // if (duration <= 24 * hourInMs) {
      //   return start.format('MM/DD/YYYY h:mma') + " - " + end.format('MM/DD/YYYY h:mma');
      // }
      
      if (label === 'Last 6 Hours' || label === 'Last 12 Hours') {
        return start.format('MM/DD/YYYY');
      }
//      if (label === 'Last 12 Hours') {
//        return;
//      }
//      if (label === 'Last 7 Days') {
//        return;
//      }
//      if (label === 'Last 30 Days') {
//        return;
//      }
      if (label === "Custom Range") {
        var res = start.format('MM/DD/YYYY');
        res += duration > 24*hourInMs ? ' - ' + end.format('MM/DD/YYYY') : '';
        return res;
      }
      return start.format('MM/DD/YYYY') + ' - ' + end.format('MM/DD/YYYY');
    }
    function now() {
      return moment().minute(0).second(0).millisecond(0);
    }
    function getRanges() {
      return {
        'Last 6 Hours': [now().subtract(6, 'hours'), now()],
        'Last 12 Hours': [now().subtract(12, 'hours'), now()],
        'Last 24 Hours': [now().subtract(24, 'hours'), now()],
        'Last 7 Days': [now().subtract(6, 'days'), now()],
        'Last 30 Days': [now().subtract(29, 'days'), now()]
      };
    }
    // const dateRangeWidgetSelector = 'input[name="daterange"]';
    const dateRangeWidgetSelector = 'button[name="daterange"]';
    function setDateRangeInTextField(value) {
      // $(dateRangeWidgetSelector).val(value);
      $(dateRangeWidgetSelector).html(value + " <span class='caret'></span>");
    }
    $(dateRangeWidgetSelector).daterangepicker({
      timePicker: true,
      timePicker24Hour: true,
      timePickerIncrement: 30,
      locale: {
        format: 'MM/DD/YYYY h:mm A'
      },
//      showCustomRangeLabel: false,
      alwaysShowCalendars: false,
      startDate: new Date(),
      endDate: new Date(),
      ranges: getRanges()
    }, function(start, end, label) {
      // console.log("New date range selected: " + start.format('YYYY-MM-DD') + " to " + end.format('YYYY-MM-DD') + " (predefined range: " + label + ")");
      dateRangeLabel = label;
      setTimestamps(start, end);
    });

    dateRangePicker = $(dateRangeWidgetSelector).data('daterangepicker');
    $(dateRangeWidgetSelector).on('apply.daterangepicker', function(ev, picker) {
      // $(this).val(dateRangeFormat(dateRangeLabel, picker.startDate, picker.endDate));
      // var oldText = $(this).html();
      var newText = dateRangeFormat(dateRangeLabel, picker.startDate, picker.endDate);
      // console.log("oldText newText", oldText, typeof(oldText), newText, typeof(newText));
      // var newHtml = oldText.replace(/^.*(<span.*)$/, newText + ' $1'); 
      // console.log("should become", newHtml);
      // $(this).html(newText + " <span class='caret'></span>");
      setDateRangeInTextField(newText);
    });
//    console.log("dateRangePicker", dateRangePicker);

    $scope.verticalLineHeight = $scope.graphHeight !== undefined ? $scope.graphHeight - 45 : 200;

    // initialise start & end times
    if ($stateParams.start && $stateParams.end) {
      var start = parseInt($stateParams.start, 10);
      var end = parseInt($stateParams.end, 10);
      setTimestamps(start, end);
    }
    else {
      var defaultRange = DateTimeRangeService.getDefaultRange();
      $scope.timelineTicksGapType = 'hours';
      setTimestamps(defaultRange.start, defaultRange.end);
    }
  }])
  .directive('lineGraphTimeSelector', function() {
    return {
      templateUrl: "views/components/timeSelector/line-graph-time-selector.html",
      restrict: 'AE',
      controller: 'LineGraphTimeSelectorCtrl',
      transclude: true,
      scope: {
        previewGraph: '=graph',
        previewGraphData: '=graphData',
        changedDatesCallback: '&',
        graphHeight: '=',
        loadingGraph: '='
      }
    }
  });