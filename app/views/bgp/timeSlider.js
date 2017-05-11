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
function setTimestamp(startOrEnd, dateString) {
  var dateTimePicker = startOrEnd === "start" ? startDatetimePicker : endDatetimePicker;
  dateTimePicker.data('DateTimePicker').date(new Date(dateString));
}

/* set up time slider
 * callbacks is an object with callback functions for the following events: init, changedDates, lineColor
 */
function setUpTimeSlider($scope, $timeout, callbacks, parameters) {
  /* time slider */
//  console.debug("setUpTimeSlider", parameters);

  if (parameters === undefined) {
    parameters = {};
  }

  savedCallbacks = callbacks;
  callback("init");

  // load UTC timezone
  moment.tz.add("Etc/UTC|UTC|0|0|");
  moment.tz.link("Etc/UTC|UTC");

  var nbHoursToDisplayByDefault = 4;
  // if start is defined but not end, end = start + nbHoursToDisplayByDefault hours
  // if end is defined but not start, start = end - nbHoursToDisplayByDefault hours
  // if none are defined, end = now(), start = end - nbHoursToDisplayByDefault hours
  if (parameters.startTimestamp === undefined) {
    if (parameters.endTimestamp === undefined) {
      parameters.endTimestamp = moment().toDate().getTime();
    }
    parameters.startTimestamp = parameters.endTimestamp - nbHoursToDisplayByDefault * 3600000;
  }
  else {
    if (parameters.endTimestamp === undefined) {
      parameters.endTimestamp = parameters.startTimestamp + nbHoursToDisplayByDefault * 3600000;
    }
  }

  var duration, durationInMinutes;
  var sliderSettings = {
    start: [parameters.startTimestamp, parameters.endTimestamp], // Handle start position
    step: 60 * 1000, // Slider moves in increments of a minute
    margin: 60 * 1000, // Handles must be more than 1 minute apart
    limit: 3600 * 60 * 1000 * nbHoursToDisplayByDefault, // Maximum 2 hours
    connect: true, // Display a colored bar between the handles
    orientation: 'horizontal', // Orient the slider vertically
    behaviour: 'tap-drag', // Move handle on tap, bar is draggable
    range: {
      'min': parameters.endTimestamp - nbHoursToDisplayByDefault*3600000,//moment().subtract(12, 'hours').toDate().getTime(), // minus 12 hours
      'max': parameters.endTimestamp//moment().toDate().getTime()
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
        'max': moment(setDate).add(nbHoursToDisplayByDefault, 'hours').toDate().getTime()
      };
      sliderSettings.start = [moment(setDate).toDate().getTime(), moment(setDate).toDate().getTime() + (originalValues[1] - originalValues[0])];
      noUiSlider.create(timeSelector, sliderSettings);
      bindEvents();
    }
    else if (setDate > moment(sliderSettings.range['max']) && setDate <= moment()) {
      timeSelector.noUiSlider.destroy();
      sliderSettings.range = {
        'min': moment(setDate).toDate().getTime(),
        'max': moment(setDate).add(nbHoursToDisplayByDefault, 'hours').toDate().getTime()
      };
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
        'min': moment(setDate).subtract(nbHoursToDisplayByDefault, 'hours').toDate().getTime(),
        'max': moment(setDate).toDate().getTime()
      };
      sliderSettings.start = [moment(setDate).toDate().getTime() - (originalValues[1] - originalValues[0]), moment(setDate).toDate().getTime()];
      noUiSlider.create(timeSelector, sliderSettings);
      bindEvents();
    }
    else if (setDate > moment(sliderSettings.range['max']) && moment(setDate).subtract(nbHoursToDisplayByDefault, 'hours') <= moment()) {
      timeSelector.noUiSlider.destroy();
      sliderSettings.range = {
        'min': moment(setDate).subtract(nbHoursToDisplayByDefault, 'hours').toDate().getTime(),
        'max': moment(setDate).toDate().getTime()
      };
      sliderSettings.start = [moment(setDate).toDate().getTime() - (originalValues[1] - originalValues[0]), moment(setDate).toDate().getTime()];
      noUiSlider.create(timeSelector, sliderSettings);
      bindEvents();
    }
    else if (moment(setDate).subtract(nbHoursToDisplayByDefault, 'hours') > moment()) {
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
    sliderSettings.start = [sliderSettings.range['min'], sliderSettings.range['min'] + (originalValues[1] - originalValues[0])];
    noUiSlider.create(timeSelector, sliderSettings);
    bindEvents();
  };

  $scope.setToNow = function () {
    var originalValues = timeSelector.noUiSlider.get();
    timeSelector.noUiSlider.destroy();
    sliderSettings.range = {
      'min': moment().subtract(nbHoursToDisplayByDefault, 'hours').toDate().getTime(),
      'max': moment().toDate().getTime()
    };
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
      height: parameters.svgHeight !== undefined ? parameters.svgHeight : 100,
      margin: {
        top: 20,
        right: 26,
        bottom: 57,
        left: 26
      },
      color: function(d) {
        return callback("lineColor", d);
      },
      x: function (d) {
        return d !== undefined ? d[0] : 0;
      },
      y: function (d) {
        return d !== undefined ? d[1] : 0;
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
      xDomain: parameters.xDomain !== undefined ? parameters.xDomain : undefined,
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

//  $scope.previewGraph.chart.setXScaleRange([1493989200000, 1493989200000]);
//  console.log("chart", $scope.previewGraph.chart.forceX);

  /* end of time slider */

  return $scope.previewGraph;
}
//function loadGraphData($scope, data) {
//  $scope.previewGraphData = data;
//  console.log("previewGraphData", data, JSON.stringify(data));
//  // get the earliest and latest timestamps
////  d3.min
//}
function extractTimestamp(timestampValue) {
  return timestampValue[0];
}
function getMinOrMax(fn, data) {
  return fn(data.map(function(row) { return fn(row.values.map(extractTimestamp))}));
}
function computeMinMaxTimestamps(data) {
//  d3.max(data[0].values.map(getTimestamp))
  return [ d3.min, d3.max ].map(function(fn) { return getMinOrMax(fn, data); });

//  var minTimestamp = getMinOrMax(d3.min, data);
//  var maxTimestamp = getMinOrMax(d3.max, data);
////  var maxTimestamp = d3.max(data.map(function(row) { return d3.max(row.values.map(extractTimestamp))}));
//  console.log("min", minTimestamp, "max", maxTimestamp);
}