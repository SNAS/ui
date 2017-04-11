'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:BGPSecurityAuditController
 * @description
 * # BGPSecurityAuditController
 * Controller for the BGP Security Audit page
 */
angular.module('bmpUiApp').controller('BGPSecurityAuditController',
  function($scope, $stateParams, bgpDataService, ConfigService, socket, uiGridConstants, $timeout) {

    const viewNames = {
      martians: "Martian anomalies",
      prefix_length: "Prefix length anomalies"
    };
    const lineColors = {
      martians: "red",
      prefix_length: "blue"
    };

    function findIndexOfAnomaly(anomaly, array, field) {
      return array.findIndex(function(el) {
        return el[field] === anomaly;
      });
    }

    // returns -1 if not found
    function findIndexOfSelectedTime(array, selectedTime) {
      for (var i = 0 ; i < array.length ; i++) {
        var timestamp = array[i][0];
        if (timestamp === selectedTime) {
          return i;
        }
        // the data is ordered by timestamp ascending
        // so if we've already passed the selected time, we can stop now
        else if (timestamp > selectedTime) {
          break;
        }
      }
      return -1;
    }

    function computeValuesAtSelectedTime(dataObject) {
      var gData = dataObject.values;
      var index = findIndexOfSelectedTime(gData, $scope.selectedTime);
        if (index !== -1) {
        dataObject.occurrences = gData[index][1];
        dataObject.difference = "";
        if (index === 0) {
          dataObject.trend = "stable";
        }
        if (index > 0) {
          dataObject.trend = gData[index-1][1] < gData[index][1] ? "up" :
            gData[index-1][1] > gData[index][1] ? "down" : "stable";
          dataObject.difference = Math.abs(gData[index-1][1]-gData[index][1]);
        }
      }
    }

    function loadAnomalies() {
      $scope.loadingAnomalies = true;
      bgpDataService.getAnomaliesTypes().promise.then(function(result) {
//        console.debug("anomalies types", result);

        $scope.previewGraphData = [];
        angular.forEach(result, function(anomaly) {
          var parameters = {
            anomaliesType: anomaly,
            start: getTimestamp("start"),
            end: getTimestamp("end")
          };
          var request = bgpDataService.getAnomalyOverview(parameters);
          request.promise.then(function(result) {
            // find the graph lines in the data
            var gData = [];
            angular.forEach(result, function(record) {
              var timestamp = record.hourtimestamp;//parseInt(record.hourtimestamp, 10) * 1000;
              gData.push([new Date(timestamp).getTime(), record.value/*parseInt(record.value, 10)*/]);
            });

            var newGraphLine = {
              id: anomaly,
              key: viewNames[anomaly] !== undefined ? viewNames[anomaly] : anomaly,
              values: gData,
              occurrences: "No data",
              trend: 0
            };
            computeValuesAtSelectedTime(newGraphLine);

            var index = findIndexOfAnomaly(anomaly, $scope.previewGraphData, "id");
            if (index === -1) {
              $scope.previewGraphData.push(newGraphLine);
            } else {
              $scope.previewGraphData[index] = newGraphLine;
            }

//            console.log("previewGraphData", $scope.previewGraphData);

            $scope.loadingAnomalies = false;
          }, function(error) {
            console.warn(error);
            $scope.loadingAnomalies = false;
          });
        });
      }, function(error) {
        console.warn(error);
        $scope.loadingAnomalies = false;
      });
    }

    $scope.newPathLocation = function(parameter) {
      var path = "/bgp";
      var urlParameters = [];
      if (parameter !== undefined) {
        urlParameters.push("search="+parameter);
      }
      urlParameters.push("start=" + getTimestamp("start"));
      urlParameters.push("end=" + getTimestamp("end"));
      return path + "?" + urlParameters.join("&");
    };

    $scope.anomalyDetails = {};
    $scope.displayFields = {
      martians: [
        { name: "prefix", displayName: "Prefix", width: '120',
          cellTemplate: '<div class="ui-grid-cell-contents clickable" bmp-prefix-tooltip prefix="{{ COL_FIELD }}" change-url-on-click="grid.appScope.newPathLocation(COL_FIELD)"></div>' },
        { name: "origin_as", displayName: "Origin AS", type: 'number', width: '100',
          cellTemplate: '<div class="ui-grid-cell-contents asn-clickable">' +
            '<div bmp-asn-model asn="{{ COL_FIELD }}" change-url-on-click="grid.appScope.newPathLocation(COL_FIELD)"></div></div>' },
        { name: "peer_as", displayName: "Peer AS", type: 'number', width: '100',
          cellTemplate: '<div class="ui-grid-cell-contents asn-clickable">' +
            '<div bmp-asn-model asn="{{ COL_FIELD }}" change-url-on-click="grid.appScope.newPathLocation(COL_FIELD)"></div></div>' },
        { name: "as_path", displayName: "AS Path" },
        { name: "router_ip", displayName: "Advertising Router", width: '132' },
        { name: "type", width: '60' },
        { name: "timestamp", sort: { direction: uiGridConstants.DESC }, width: '140',
          cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.getCellValue(row, col) | utcToLocalTime }}</div>'
        },
        { name: "last_seen", width: '140',
          cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.getCellValue(row, col) | utcToLocalTime }}</div>' },
        { name: "still_active", width: '50' },
        { name: 'category', width: '100' }
      ],
      prefix_length: [
        { name: "prefix", displayName: "Prefix", width: '120',
          cellTemplate: '<div class="ui-grid-cell-contents clickable" bmp-prefix-tooltip prefix="{{ COL_FIELD }}" change-url-on-click="grid.appScope.newPathLocation(COL_FIELD)"></div>' },
        { name: "origin_as", displayName: "Origin AS", type: 'number', width: '100',
          cellTemplate: '<div class="ui-grid-cell-contents asn-clickable">' +
            '<div bmp-asn-model asn="{{ COL_FIELD }}" change-url-on-click="grid.appScope.newPathLocation(COL_FIELD)"></div></div>' },
        { name: "peer_as", displayName: "Peer AS", type: 'number', width: '100',
          cellTemplate: '<div class="ui-grid-cell-contents asn-clickable">' +
            '<div bmp-asn-model asn="{{ COL_FIELD }}" change-url-on-click="grid.appScope.newPathLocation(COL_FIELD)"></div></div>' },
        { name: "as_path", displayName: "AS Path" },
        { name: "router_ip", displayName: "Advertising Router", width: '132' },
        { name: "type", width: '60' },
        { name: "timestamp", sort: { direction: uiGridConstants.DESC }, width: '140',
          cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.getCellValue(row, col) | utcToLocalTime }}</div>' }
      ]
    };
    $scope.anomalyGridHeight = 300;
    $scope.loadAnomalyDetails = function(anomaly) {
//      console.log("Loading anomaly details for", anomaly);
      // load the details for the last hour from selectedTime
      var parameters = {
        anomaliesType: anomaly,
        start: $scope.selectedTime - 3600000, // select the last hour from the selected time
        end: $scope.selectedTime
      }
      $scope.anomalyDetails[anomaly] = {
        show: true,
        loadingAnomalyDetails: true,
        gridReady: false,
        displayTitle: viewNames[anomaly] !== undefined ? viewNames[anomaly] : anomaly
      };

      if (anomaly === "martians") {
        getMartiansGroundTruth($scope.anomalyDetails[anomaly]);
      }

      var request = bgpDataService.getAnomalies(parameters);
      request.promise.then(function(result) {
//        console.debug("anomaly details for", anomaly, result);
//        $scope.loadingAnomalyDetails = false;
        var grid = {
          rowHeight: 32,
          gridFooterHeight: 0,
          showGridFooter: true,
          enableFiltering: true,
          height: $scope.prefixGridInitHeight,
          enableHorizontalScrollbar: 0,
          enableVerticalScrollbar: 1,
          columnDefs: $scope.displayFields[anomaly],
          data: result
        };
        $scope.anomalyDetails[anomaly].grid = grid;
        $scope.anomalyDetails[anomaly].gridReady = true;
        $scope.anomalyDetails[anomaly].loadingAnomalyDetails = false;
        $scope.anomalyDetails[anomaly].json = bgpDataService.getAnomaliesAPI(parameters);
        console.debug("anomaly details for", anomaly, $scope.anomalyDetails);
      });
    };

    function getMartiansGroundTruth(dataObject) {
      var request = bgpDataService.getGroundTruthHash();
      request.promise.then(function(result) {
        dataObject.groundTruthLink = ConfigService.bogonListURL + result.hash;
      });
    }

    $scope.toggleAnomalyDetails = function(anomaly) {
      if ($scope.anomalyDetails[anomaly] !== undefined) {
        $scope.anomalyDetails[anomaly].show = !$scope.anomalyDetails[anomaly].show;
      } else {
        $scope.loadAnomalyDetails(anomaly);
      }
    };

    function reloadAnomalyDetails() {
      // reload anomaly details that have been saved if they're being shown
      // or just remove the saved details if they're hidden
      for (var anomaly in $scope.anomalyDetails) {
        if ($scope.anomalyDetails.hasOwnProperty(anomaly)) {
          var previouslyShown = $scope.anomalyDetails[anomaly].show;
          $scope.anomalyDetails[anomaly] = undefined;
          if (previouslyShown) {
            $scope.loadAnomalyDetails(anomaly);
          }
        }
      }
    }

    // init, changedDates, lineColor
    var timeSliderCallbacks = {
      changedDates: function() {
        $timeout(function() {
          loadAnomalies();
          reloadAnomalyDetails();
        });
      },
      lineColor: function (d) {
        if (lineColors[d.id] !== undefined) {
          return lineColors[d.id];
        }
        return "#777";
      },
      changedSelectedTime: function() {
        for (var i = 0 ; i < $scope.previewGraphData.length ; i++) {
          computeValuesAtSelectedTime($scope.previewGraphData[i]);
        }
        reloadAnomalyDetails();
      }
    };

    var uiServer = ConfigService.bgpDataService;
    const SOCKET_IO_SERVER = "bgpDataServiceSocket";
    socket.connect(SOCKET_IO_SERVER, uiServer);
    socket.on(SOCKET_IO_SERVER, 'dataUpdate', function(data) {
      console.log("dataUpdate", data);
    });

    // initialisation
    $(function () {
      var timeSliderParameters = { showLegend: true };
      if ($stateParams.start) {
        timeSliderParameters.startTimestamp = parseInt($stateParams.start, 10);
      }
      if ($stateParams.end) {
        timeSliderParameters.endTimestamp = parseInt($stateParams.end, 10);
      }
      setUpTimeSlider($scope, $timeout, timeSliderCallbacks, timeSliderParameters);
    });
  }
);
