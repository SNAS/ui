angular.module('bmp.components.timeSelector', [])
  .factory('DateTimeRangeService', function() {
    const nbHoursToDisplayByDefault = 6;
    const hourInMs = 3600000;

//    $scope.timelineTicksGapType = 'hours';
//    setTimestamps(now() - nbHoursToDisplayByDefault * hourInMs, now());

    function now() {
      return moment().minute(0).second(0).millisecond(0);
    }

    return {
      now: now,
      getDefaultRange: function() {
        return {
          start: now() - nbHoursToDisplayByDefault * hourInMs,
          end: now().utc().valueOf()
        }
      }
    };
  })
  .controller('LineGraphTimeSelectorCtrl', ['$rootScope', '$scope', '$timeout', 'DateTimeRangeService',
  function($rootScope, $scope, $timeout, DateTimeRangeService) {
//    var startDatetimePicker, endDatetimePicker, dateRangePicker;
//    startDatetimePicker = $('#startDatetimePicker');
//    endDatetimePicker = $('#endDatetimePicker');
    var dateRangePicker;

//    function getTimestamp(startOrEnd) {
//      var dateTimePicker = startOrEnd === "start" ? startDatetimePicker : endDatetimePicker;
//      return dateTimePicker.data('DateTimePicker').date();
//    }
//    function setTimestamp(startOrEnd, dateString) {
//      var dateTimePicker = startOrEnd === "start" ? startDatetimePicker : endDatetimePicker;
//      $scope[startOrEnd] = new Date(dateString);
//      dateTimePicker.data('DateTimePicker').date($scope[startOrEnd]);
//    }
    var dateRangeLabel = "Last 6 Hours";
    function setTimestamps(start, end) {
//      setTimestamp("start", start);
//      setTimestamp("end", end);
      if (dateRangePicker === undefined) return;
//      dateRangePicker.setStartDate(moment(start).format("MM/DD/YYYY h:mm a"));
//      dateRangePicker.setEndDate(moment(end).format("MM/DD/YYYY h:mm a"));
      dateRangePicker.setStartDate(moment(start));
      dateRangePicker.setEndDate(moment(end));
//      console.log("setTimestamps dateRangePicker", dateRangePicker, $("#dateRangePicker"));
      var newDates = {
        start: dateRangePicker.startDate.utc().valueOf(),
        end: dateRangePicker.endDate.utc().valueOf()
      };
//      console.log("setTimestamps", start, end, newDates);
      computeTimeLines(dateRangeLabel, start, end);
      $rootScope.dateTimeRange = newDates;
      $scope.changedDatesCallback({newDates: newDates});
    }
    // returns [start, end]
    function getTimestamps() {
      return [
        dateRangePicker.startDate.utc().valueOf(),
        dateRangePicker.endDate.utc().valueOf()
      ];
    }

//    function initialiseDateTimePicker(startOrEnd) {
//      var datePickerParameters = {
//        sideBySide: true,
//        format: 'MM/DD/YYYY HH:mm'
//      };
//      var dateTimePicker = startOrEnd === "start" ? startDatetimePicker : endDatetimePicker;
//      dateTimePicker.datetimepicker(datePickerParameters);
//      // when the date time picker disappears,
//      dateTimePicker.on('dp.hide', function() {
//        // use $timeout with a 0 delay just to force the scope to be re-evaluated
//        $timeout(function() {
//          // when $scope.start or $scope.end changes, the time lines will be recomputed thanks to a watcher
//          $scope[startOrEnd] = getTimestamp(startOrEnd);
//        });
//      });
//    }
//    ["start", "end"].map(function(startOrEnd) {
//      initialiseDateTimePicker(startOrEnd);
//    });

    $scope.timeLines = [];
    const hourInMs = 3600000;
    const dayInMs = 24*hourInMs;
    const weekInMs = 7*dayInMs;
    const monthInMs = 4*weekInMs;
    function stripMinutesAndSeconds(timestamp) {
      return timestamp - (timestamp%hourInMs);
    }
    function computeTimeLines(label, start, end) {
//      var minMaxTimestamps = [getTimestamp("start"), getTimestamp("end")];
      var minMaxTimestamps = getTimestamps();
      if (!minMaxTimestamps[0] || !minMaxTimestamps[1]) return;
      var fullHours = [];
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
      if (minMaxTimestamps[0] > start) {
        start += hourInMs;
      }
//      console.log("start", start, moment(start).format("MM/DD/YYYY HH:mm"));
      fullHours = d3.range(start, minMaxTimestamps[1]+1, gap); // +1 to include the last hour
//      console.log("fullHours", fullHours, fullHours.map(function(t) { return moment(t).format("MM/DD/YYYY HH:mm"); }));
      var x = d3.time.scale().range([0, 100]); // percentages of the container width
      // edge case: when there's only one timestamp, we need it to be centered
      if (fullHours.length === 1) {
        x = d3.time.scale().range([50, 50]);
      }
      x.domain(minMaxTimestamps);
      $timeout(function() {
        $scope.timeLines = fullHours.map(function(h) {
          return { timestamp: h, left: x(h) };
        });
      });
//      console.log("timelines", $scope.timeLines);
    }

//    $scope.$watchGroup(['start', 'end'], computeTimeLines);

//    function refreshChart() {
//      console.log("refreshing chart", $scope.minMaxTimestamps, $scope.minMaxTimestamps.map(function(t) { return moment(t).format("MM/DD/YYYY HH:mm"); }));
//      $scope.previewGraph.chart.xDomain = $scope.minMaxTimestamps;//[$scope.xminvalue,$scope.xmaxvalue];
//    }


    $scope.leftArrow = function() {
//      var currentStart = getTimestamp("start");
//      var currentEnd = getTimestamp("end");
      var currentTimestamps = getTimestamps();
      var currentStart = currentTimestamps[0];
      var currentEnd = currentTimestamps[1];
      setTimestamps(currentStart - (currentEnd-currentStart), currentStart);
      console.log("rootScope", $rootScope);
      console.log("scope", $scope);
    };

    $scope.rightArrow = function() {
//      var currentStart = getTimestamp("start");
//      var currentEnd = getTimestamp("end");
      var currentTimestamps = getTimestamps();
      var currentStart = currentTimestamps[0];
      var currentEnd = currentTimestamps[1];
      setTimestamps(currentEnd, currentEnd + (currentEnd-currentStart));
    };

//    var ranges = {
//      'Today': { range: [moment().subtract(12, 'hours'), moment()], tickGapInHours: 2 },
//      'Yesterday': { range: [moment().subtract(1, 'days').subtract(4, 'hours'), moment().subtract(1, 'days')], tickGapInHours: 1 },
//      'Last 7 Days': { range: [moment().subtract(6, 'days'), moment()], tickGapInHours: 6 },
//      'Last 30 Days': { range: [moment().subtract(29, 'days'), moment()], tickGapInHours: 24 }//,
////      'This Month': { range: [moment().startOf('month'), moment().endOf('month')], tickGapInHours: 2 },
////      'Last Month': { range: [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')], tickGapInHours: 2 }
//    };

    var tickGapsInHours = {
      'Last 6 Hours': 1,
      'Last 12 Hours': 2,
      'Last 24 Hours': 3,
      'Last 7 Days': 24,
      'Last 30 Days': 7*24
    }
    function dateRangeFormat(label, start, end) {
      if (label === 'Last 4 Hours' || label === 'Last 12 Hours') {
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
        var duration = end - start;
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
    $('input[name="daterange"]').daterangepicker({
      timePicker: true,
      timePicker24Hour: true,
      timePickerIncrement: 30,
      locale: {
        format: 'MM/DD/YYYY h:mm A'
      },
//      showCustomRangeLabel: false,
      alwaysShowCalendars: false,
      startDate: new Date(),//getTimestamp("start"),
      endDate: new Date(),//getTimestamp("end"),
      ranges: getRanges()
    }, function(start, end, label) {
      console.log("New date range selected: " + start.format('YYYY-MM-DD') + " to " + end.format('YYYY-MM-DD') + " (predefined range: " + label + ")");
      dateRangeLabel = label;
      setTimestamps(start, end);
    });

//      dateRangePicker = $('input[name="daterange"]');
//      console.log("dateRangePicker", dateRangePicker.data('daterangepicker'));
    dateRangePicker = $('input[name="daterange"]').data('daterangepicker');
    $('input[name="daterange"]').on('apply.daterangepicker', function(ev, picker) {
//      console.log("apply daterangepicker");
//      if (dateRangeLabel )
      $(this).val(dateRangeFormat(dateRangeLabel, picker.startDate, picker.endDate));
    });
//    console.log("dateRangePicker", dateRangePicker);

    $scope.verticalLineHeight = $scope.graphHeight !== undefined ? $scope.graphHeight - 57 : 200;

    // initialise start & end times
//    var nbHoursToDisplayByDefault = 6;
    var defaultRange = DateTimeRangeService.getDefaultRange();
    $scope.timelineTicksGapType = 'hours';
    setTimestamps(defaultRange.start, defaultRange.end);
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