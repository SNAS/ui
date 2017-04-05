var savedCallbacks = {};
function callback(key, d) {
  if (savedCallbacks[key] === undefined) return;
  return savedCallbacks[key](d);
}

var startDatetimePicker, endDatetimePicker;

function getTimestamp(startOrEnd) {
  var dateTimePicker = startOrEnd === "start" ? startDatetimePicker : endDatetimePicker;
  return dateTimePicker.data('DateTimePicker').date();
}

/* set up time slider
 * callbacks is an object with callback functions for the following events: init, changedDates, lineColor
 */
function setUpTimeSlider($scope, $timeout, callbacks, parameters) {
  /* time slider */

  if (parameters === undefined) {
    parameters = {};
  }

  savedCallbacks = callbacks;
  callback("init");

  // load UTC timezone
  moment.tz.add("Etc/UTC|UTC|0|0|");
  moment.tz.link("Etc/UTC|UTC");

  var timeFormat = 'YYYY-MM-DD HH:mm';

  var startTimestamp, endTimestamp;

//  var latestTimestamp = 1490720400000; // 2017-03-28 17:00:00
  var latestTimestamp = moment().toDate().getTime();

  endTimestamp = latestTimestamp;
//  console.log("moment", moment(), endTimestamp, 1490720400000);
//  startTimestamp = moment().subtract(60, 'minutes').toDate().getTime();
  var nbHoursToDisplayByDefault = 5;
  startTimestamp = endTimestamp - nbHoursToDisplayByDefault * 3600000; // end timestamp - a few hours
  var duration, durationInMinutes;

  var sliderSettings = {
    start: [startTimestamp, endTimestamp], // Handle start position
    step: 60 * 1000, // Slider moves in increments of a minute
    margin: 60 * 1000, // Handles must be more than 1 minute apart
    limit: 3600 * 60 * 1000 * 4, // Maximum 2 hours
    connect: true, // Display a colored bar between the handles
    orientation: 'horizontal', // Orient the slider vertically
    behaviour: 'tap-drag', // Move handle on tap, bar is draggable
    range: {
      'min': endTimestamp - 12*3600000,//moment().subtract(12, 'hours').toDate().getTime(), // minus 12 hours
      'max': endTimestamp//moment().toDate().getTime()
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

  var timeSelector = $('#timeSelector')[0];

  noUiSlider.create(timeSelector, sliderSettings);

  startDatetimePicker = $('#startDatetimePicker');
  endDatetimePicker = $('#endDatetimePicker');

  startDatetimePicker.datetimepicker({
    sideBySide: true,
    format: 'MM/DD/YYYY HH:mm'
  });

  startDatetimePicker.on('dp.hide', function () {
    var setDate = startDatetimePicker.data('DateTimePicker').date();
    var originalValues = timeSelector.noUiSlider.get();
    if (setDate < moment(sliderSettings.range['min'])) {
      timeSelector.noUiSlider.destroy();
      sliderSettings.range = {
        'min': moment(setDate).toDate().getTime(),
        'max': moment(setDate).add(12, 'hours').toDate().getTime()
      };
      console.log("changedDates");
//      callback("changedDates");
      sliderSettings.start = [moment(setDate).toDate().getTime(), moment(setDate).toDate().getTime() + (originalValues[1] - originalValues[0])];
      noUiSlider.create(timeSelector, sliderSettings);
      bindEvents();
    }
    else if (setDate > moment(sliderSettings.range['max']) && setDate <= moment()) {
      timeSelector.noUiSlider.destroy();
      sliderSettings.range = {
        'min': moment(setDate).toDate().getTime(),
        'max': moment(setDate).add(12, 'hours').toDate().getTime()
      };
//      callback("changedDates");
      sliderSettings.start = [moment(setDate).toDate().getTime(), moment(setDate).toDate().getTime() + (originalValues[1] - originalValues[0])];
      noUiSlider.create(timeSelector, sliderSettings);
      bindEvents();
    }
    else if (setDate > moment()) {
      alert("You can't go to the future! But you can try to go to your past :)");
    }
    else {
      timeSelector.noUiSlider.set([moment(setDate).toDate().getTime(), moment(setDate).toDate().getTime() + (originalValues[1] - originalValues[0])]);
    }
  });

  endDatetimePicker.datetimepicker({
    sideBySide: true,
    format: 'MM/DD/YYYY HH:mm'
  });

  endDatetimePicker.on('dp.hide', function () {
    var setDate = endDatetimePicker.data('DateTimePicker').date();
    var originalValues = timeSelector.noUiSlider.get();
    if (setDate <= moment(sliderSettings.range['min'])) {
      timeSelector.noUiSlider.destroy();
      sliderSettings.range = {
        'min': moment(setDate).subtract(12, 'hours').toDate().getTime(),
        'max': moment(setDate).toDate().getTime()
      };
//      callback("changedDates");
      sliderSettings.start = [moment(setDate).toDate().getTime() - (originalValues[1] - originalValues[0]), moment(setDate).toDate().getTime()];
      noUiSlider.create(timeSelector, sliderSettings);
      bindEvents();
    }
    else if (setDate > moment(sliderSettings.range['max']) && moment(setDate).subtract(12, 'hours') <= moment()) {
      timeSelector.noUiSlider.destroy();
      sliderSettings.range = {
        'min': moment(setDate).subtract(12, 'hours').toDate().getTime(),
        'max': moment(setDate).toDate().getTime()
      };
//      callback("changedDates");
      sliderSettings.start = [moment(setDate).toDate().getTime() - (originalValues[1] - originalValues[0]), moment(setDate).toDate().getTime()];
      noUiSlider.create(timeSelector, sliderSettings);
      bindEvents();
    }
    else if (moment(setDate).subtract(12, 'hours') > moment()) {
      alert("You can't go to the future! But you can try to go to your past :)");

    }
    else {
      timeSelector.noUiSlider.set([moment(setDate).toDate().getTime() - (originalValues[1] - originalValues[0]), moment(setDate).toDate().getTime()]);
    }
  });

  // load all graphs
  var loadAll = $scope.loadAll = function() {
  };

  function bindEvents() {
    timeSelector.noUiSlider.on('update', function () {
      $timeout.cancel($scope.timeSliderUpdateTimer);
      startDatetimePicker.data("DateTimePicker").date(timeSelector.noUiSlider.get()[0]);
      endDatetimePicker.data("DateTimePicker").date(timeSelector.noUiSlider.get()[1]);
      durationInMinutes = Math.round((timeSelector.noUiSlider.get()[1] - timeSelector.noUiSlider.get()[0]) / (1000 * 60));

      if (durationInMinutes > 60)
        duration = Math.floor(durationInMinutes / 60) + ' hrs ' + durationInMinutes % 60 + ' mins';
      else
        duration = durationInMinutes + ' Minutes';
      $('#duration').text(duration);

      $scope.timeSliderUpdateTimer = $timeout(function() {
        callback("changedDates");
      }, 500);
    });
    timeSelector.noUiSlider.on('set', function () {
      loadAll();
    });
    loadAll();
  }

  $scope.leftArrow = function () {
    var originalValues = timeSelector.noUiSlider.get();
    timeSelector.noUiSlider.destroy();
    var originalRange = [sliderSettings.range['min'], sliderSettings.range['max']];
    sliderSettings.range = {
      'min': originalRange[0] - (originalRange[1] - originalRange[0]),
      'max': originalRange[0]
    };
//    callback("changedDates");
    sliderSettings.start = [sliderSettings.range['max'] - (originalValues[1] - originalValues[0]), sliderSettings.range['max']];
    noUiSlider.create(timeSelector, sliderSettings);
    bindEvents();
  };

  $scope.rightArrow = function () {
    var originalValues = timeSelector.noUiSlider.get();
    timeSelector.noUiSlider.destroy();
    var originalRange = [sliderSettings.range['min'], sliderSettings.range['max']];
    sliderSettings.range = {
      'min': originalRange[1],
      'max': originalRange[1] + (originalRange[1] - originalRange[0])
    };
//    callback("changedDates");
    sliderSettings.start = [sliderSettings.range['min'], sliderSettings.range['min'] + (originalValues[1] - originalValues[0])];
    noUiSlider.create(timeSelector, sliderSettings);
    bindEvents();
  };

  $scope.setToNow = function () {
    var originalValues = timeSelector.noUiSlider.get();
    timeSelector.noUiSlider.destroy();
    sliderSettings.range = {
      'min': moment().subtract(12, 'hours').toDate().getTime(),
      'max': moment().toDate().getTime()
    };
//    callback("changedDates");
    sliderSettings.start = [moment().toDate().getTime() - (originalValues[1] - originalValues[0]), moment().toDate().getTime()];
    noUiSlider.create(timeSelector, sliderSettings);
    bindEvents();
  };

  function loadPreview() {
    $scope.previewGraphData = [];
  }

  $scope.previewGraph = {
    chart: {
      type: "lineChartWithSelectionEnabled",
      height: 100,
      margin: {
        top: 20,
        right: 0,
        bottom: 10,
        left: 0
      },
      color: function(d) {
        return callback("lineColor", d);
      },
      x: function (d) {
        return d[0];
      },
      y: function (d) {
        return d[1];
      },
      useVoronoi: parameters.useVoronoi !== undefined ? parameters.useVoronoi : true,
      clipEdge: parameters.clipEdge !== undefined ? parameters.clipEdge : true,
      transitionDuration: 500,
      useInteractiveGuideline: parameters.useInteractiveGuideline !== undefined ? parameters.useInteractiveGuideline : true,
      showLegend: parameters.showLegend !== undefined ? parameters.showLegend : false,
      showControls: parameters.showControls !== undefined ? parameters.showControls : false,
      showXAxis: parameters.showXAxis !== undefined ? parameters.showXAxis : false,
      showYAxis: parameters.showYAxis !== undefined ? parameters.showYAxis : false,
      forceY : parameters.forceY !== undefined ? parameters.forceY : undefined,
      xAxis: {
        tickFormat: function (d) {
          return moment(d).format("MM/DD/YYYY HH:mm");
        }
      },
      onTimeSelectedCallback: function(selectedTimestamp) {
        $timeout(function() {
          $scope.selectedTime = selectedTimestamp;
          callback("changedSelectedTime");
        });
      }
    }
  };

  bindEvents();

  /* end of time slider */
}