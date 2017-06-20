'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:BGPSecurityAuditController
 * @description
 * # BGPSecurityAuditController
* Controller for the BGP Security Audit page
 */
angular.module('bmpUiApp').controller('BGPSecurityAuditController',
  function($scope, $rootScope, $controller, $stateParams, bgpDataService, ConfigService, socket, uiGridConstants, $timeout, DateTimeRangeService, BGPHeaderService) {
    $rootScope.dualWindow.noTitleBar = true;
    $rootScope.dualWindow.header = {
      controller: $controller('BGPHeaderCtrl', {$scope: $scope}),
      html: 'views/bgp/bgp-header.html'
    };
    $scope.api_errors = [];

    const viewNames = {
      martians: "Martian anomalies",
      prefix_length: "Prefix length anomalies",
      moas: "Multi Origin AS",
      submoas: "Sub Multi Origin AS"
    };
    const lineColors = {
      martians: "#e46f7b",
      prefix_length: "#85bccc",
      moas: "#00FF00",
      submoas: "#FF0000"
    };

    // console.log("(root)dateTimeRange", $rootScope.dateTimeRange);
    // console.log("(scope)dateTimeRange", $scope.dateTimeRange);

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

    // returns the index of the selected time, or -1 if not found
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
      return index;
    }
    
    function selectTimestampIfWeHaveAllTheData(lastTimestamp, gotData) {
      $timeout(function() {
        var gotAllData = true;
        Object.keys(gotData).map(function(key) {
          gotAllData = gotAllData && gotData[key];
        });
        if (gotAllData && lastTimestamp > -1) {
          DateTimeRangeService.selectTimestamp(lastTimestamp);
        }
      });
    }

    function loadAnomalies(start, end) {
      $scope.loadingAnomalies = true;
      $scope.api_errors = [];
      bgpDataService.getAnomaliesTypes().promise.then(function(result) {
//        console.debug("anomalies types", result);

        $scope.previewGraphData = [];
        const minuteInMs = 60000;
        const endTimestampPlusAdditionalMinutes = end + 20 * minuteInMs;
        var gotData = {};
        var lastTimestamp = -1;
        result.map(function(anomaly) {
          gotData[anomaly] = false;
        });
        angular.forEach(result, function(anomaly) {
          var parameters = {
            anomaliesType: anomaly,
            start: start,
            end: endTimestampPlusAdditionalMinutes
          };
          if (BGPHeaderService.peerAS !== undefined) {
            parameters.peer_as = BGPHeaderService.peerAS
          }

          var newGraphLine = {
            id: anomaly,
            key: viewNames[anomaly] !== undefined ? viewNames[anomaly] : anomaly,
            occurrences: "No data",
            trend: 0,
            values: [],
            loading: true
          };
          $scope.previewGraphData.push(newGraphLine);

          var request = bgpDataService.getAnomalyOverview(parameters);
          request.promise.then(function(result) {
            // find the graph lines in the data
            var gData = [];
            angular.forEach(result, function(record) {
              var timestamp = record.hourtimestamp;
              gData.push([new Date(timestamp).getTime(), record.value]);
            });

            var newGraphLine = {
              id: anomaly,
              key: viewNames[anomaly] !== undefined ? viewNames[anomaly] : anomaly,
              values: gData,
              area: true,
              occurrences: "No data",
              trend: 0,
              loading: false
            };
            if (computeValuesAtSelectedTime(newGraphLine) === -1) {
              // console.log("no data for selected time", $scope.selectedTime, gData);
              if (gData.length > 0) {
                // console.log("selected time should be", gData[gData.length-1][0]);
                lastTimestamp = Math.max(lastTimestamp, gData[gData.length-1][0]);
              }
            }

            var index = findIndexOfAnomaly(anomaly, $scope.previewGraphData, "id");
            if (index === -1) {
              $scope.previewGraphData.push(newGraphLine);
            } else {
              $scope.previewGraphData[index] = newGraphLine;
            }

            $scope.loadingAnomalies = false;
            gotData[anomaly] = true;
            selectTimestampIfWeHaveAllTheData(lastTimestamp, gotData);
          }, function(error) {
            console.warn(error);
            $scope.api_errors.push(error);

            var newGraphLine = {
              id: anomaly,
              key: viewNames[anomaly] !== undefined ? viewNames[anomaly] : anomaly,
              values: [],
              occurrences: "Error",
              trend: 0,
              loading: false
            };

            var index = findIndexOfAnomaly(anomaly, $scope.previewGraphData, "id");
            if (index === -1) {
              $scope.previewGraphData.push(newGraphLine);
            } else {
              $scope.previewGraphData[index] = newGraphLine;
            }

            $scope.loadingAnomalies = false;
            gotData[anomaly] = true;
            selectTimestampIfWeHaveAllTheData(lastTimestamp, gotData);
          });
        });
      }, function(error) {
        console.warn(error);
        $scope.loadingAnomalies = false;
        $scope.api_errors.push(error);
      });
    }

    $scope.newPathLocation = function(parameter) {
      var path = "/bgp";
      var urlParameters = [];
      if (parameter !== undefined) {
        urlParameters.push("search="+parameter);
      }
      urlParameters.push("start=" + $scope.minMaxTimestamps[0]);
      urlParameters.push("end=" + $scope.minMaxTimestamps[1]);
      return path + "?" + urlParameters.join("&");
    };

    $scope.anomalyDetails = {};
    $scope.anomalyGridSettings = {
      martians: {
        displayFields: [
          { name: "prefix", displayName: "Prefix", width: '120',
            cellTemplate: '<div class="ui-grid-cell-contents clickable" bmp-prefix-tooltip prefix="{{ COL_FIELD }}" change-url-on-click="grid.appScope.newPathLocation(COL_FIELD)"></div>' },
          { name: "origin_as", displayName: "Origin AS", type: 'number', width: '100',
            cellTemplate: '<div class="ui-grid-cell-contents asn-clickable">' +
              '<div bmp-asn-model asn="{{ COL_FIELD }}" change-url-on-click="grid.appScope.newPathLocation(COL_FIELD)"></div></div>' },
          { name: "peer_as", displayName: "Peer AS", type: 'number', width: '100',
            cellTemplate: '<div class="ui-grid-cell-contents asn-clickable">' +
              '<div bmp-asn-model asn="{{ COL_FIELD }}" change-url-on-click="grid.appScope.newPathLocation(COL_FIELD)"></div></div>' },
          { name: "as_path", displayName: "AS Path" },
          { name: "router_ip", displayName: "Advertising Router", width: '143' },
          { name: "type", width: '60' },
          { name: "timestamp", sort: { direction: uiGridConstants.DESC }, width: '140',
            cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.getCellValue(row, col) | utcToLocalTime }}</div>'
          },
          { name: "last_seen", width: '140',
            cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.getCellValue(row, col) | utcToLocalTime }}</div>' },
          { name: "still_active", displayName: "Active", width: '68' },
          { name: 'category', width: '112' }
        ],
        preferredSortOrder: {
          "timestamp": "desc",
          "last_seen": "desc"
        },
        currentSortColumns: [
          { field: "timestamp", sort: { priority: 0, direction: "desc" } }
        ]
      },
      prefix_length: {
        displayFields: [
          { name: "prefix", displayName: "Prefix", width: '120',
            cellTemplate: '<div class="ui-grid-cell-contents clickable" bmp-prefix-tooltip prefix="{{ COL_FIELD }}" change-url-on-click="grid.appScope.newPathLocation(COL_FIELD)"></div>' },
          { name: "origin_as", displayName: "Origin AS", type: 'number', width: '100',
            cellTemplate: '<div class="ui-grid-cell-contents asn-clickable">' +
              '<div bmp-asn-model asn="{{ COL_FIELD }}" change-url-on-click="grid.appScope.newPathLocation(COL_FIELD)"></div></div>' },
          { name: "peer_as", displayName: "Peer AS", type: 'number', width: '100',
            cellTemplate: '<div class="ui-grid-cell-contents asn-clickable">' +
              '<div bmp-asn-model asn="{{ COL_FIELD }}" change-url-on-click="grid.appScope.newPathLocation(COL_FIELD)"></div></div>' },
          { name: "as_path", displayName: "AS Path" },
          { name: "router_ip", displayName: "Advertising Router", width: '143' },
          { name: "type", width: '60' },
          { name: "timestamp", sort: { direction: uiGridConstants.DESC }, width: '140',
            cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.getCellValue(row, col) | utcToLocalTime }}</div>' }
        ],
        preferredSortOrder: {
          "timestamp": "desc"
        },
        currentSortColumns: [
          { field: "timestamp", sort: { priority: 0, direction: "desc" } }
        ]
      },
      moas: {
        displayFields: [
          { name: "prefix", displayName: "Prefix", sort: { direction: uiGridConstants.DESC }, width: '120',
            cellTemplate: '<div class="ui-grid-cell-contents clickable" bmp-prefix-tooltip prefix="{{ COL_FIELD }}" change-url-on-click="grid.appScope.newPathLocation(COL_FIELD)"></div>' },
          { name: "origin_as", displayName: "Origin AS", type: 'number', width: '100',
            cellTemplate: '<div class="ui-grid-cell-contents asn-clickable">' +
              '<div bmp-asn-model asn="{{ COL_FIELD }}" change-url-on-click="grid.appScope.newPathLocation(COL_FIELD)"></div></div>' },
          { name: "peer_as", displayName: "Peer AS", type: 'number', width: '100',
            cellTemplate: '<div class="ui-grid-cell-contents asn-clickable">' +
              '<div bmp-asn-model asn="{{ COL_FIELD }}" change-url-on-click="grid.appScope.newPathLocation(COL_FIELD)"></div></div>' },
          { name: "as_path", displayName: "AS Path" },
          { name: "router_ip", displayName: "Advertising Router", width: '143' },
          { name: "timestamp", width: '140',
            cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.getCellValue(row, col) | utcToLocalTime }}</div>' }
        ],
        preferredSortOrder: {
          "prefix": "desc"
        },
        currentSortColumns: [
          { field: "prefix", sort: { priority: 0, direction: "desc" } }
        ]
      },
      submoas: {
        displayFields: [
          { name: "s_prefix", displayName: "Suspect Prefix", width: '120',
            cellTemplate: '<div class="ui-grid-cell-contents clickable" bmp-prefix-tooltip prefix="{{ COL_FIELD }}" change-url-on-click="grid.appScope.newPathLocation(COL_FIELD)"></div>' },
          { name: "v_prefix", displayName: "Victim Prefix", width: '120',
            cellTemplate: '<div class="ui-grid-cell-contents clickable" bmp-prefix-tooltip prefix="{{ COL_FIELD }}" change-url-on-click="grid.appScope.newPathLocation(COL_FIELD)"></div>' },
          { name: "s_asn", displayName: "Suspect ASN", type: 'number', width: '100',
            cellTemplate: '<div class="ui-grid-cell-contents asn-clickable">' +
              '<div bmp-asn-model asn="{{ COL_FIELD }}" change-url-on-click="grid.appScope.newPathLocation(COL_FIELD)"></div></div>' },
          { name: "v_asn", displayName: "Victim ASN", type: 'number', width: '100',
            cellTemplate: '<div class="ui-grid-cell-contents asn-clickable">' +
              '<div bmp-asn-model asn="{{ COL_FIELD }}" change-url-on-click="grid.appScope.newPathLocation(COL_FIELD)"></div></div>' },
          { name: "peer_as", displayName: "Peer AS", type: 'number', width: '100',
            cellTemplate: '<div class="ui-grid-cell-contents asn-clickable">' +
              '<div bmp-asn-model asn="{{ COL_FIELD }}" change-url-on-click="grid.appScope.newPathLocation(COL_FIELD)"></div></div>' },
          { name: "s_as_path", displayName: "Suspect AS Path" },
          { name: "v_as_path", displayName: "Victim AS Path" },
          { name: "timestamp", sort: { direction: uiGridConstants.DESC }, width: '140',
            cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.getCellValue(row, col) | utcToLocalTime }}</div>' }
        ],
        preferredSortOrder: {
          "timestamp": "desc"
        },
        currentSortColumns: [
          { field: "timestamp", sort: { priority: 0, direction: "desc" } }
        ]
      }
    }
    $scope.anomalyGridHeight = 300;
    $scope.loadAnomalyDetails = function(anomaly) {
//      console.log("Loading anomaly details for", anomaly);
      // load the details for the last hour from selectedTime
      var parameters = {
        anomaliesType: anomaly,
        start: $scope.selectedTime - 3600000, // select the last hour from the selected time
        end: $scope.selectedTime
      }
      if (BGPHeaderService.peerAS !== undefined) {
        parameters.peer_as = BGPHeaderService.peerAS
      }
      $scope.anomalyDetails[anomaly] = {
        show: true,
        loadingAnomalyDetails: true,
        gridReady: false,
        displayTitle: viewNames[anomaly] !== undefined ? viewNames[anomaly] : anomaly
      };

      if (anomaly === "martians") {
        getMartiansGroundTruth($scope.anomalyDetails[anomaly], $scope.selectedTime);
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
          columnDefs: $scope.anomalyGridSettings[anomaly].displayFields,
          preferredSortOrder: $scope.anomalyGridSettings[anomaly].preferredSortOrder,
          currentSortColumns: $scope.anomalyGridSettings[anomaly].currentSortColumns,
          data: result
        };
        $scope.anomalyDetails[anomaly].grid = grid;
        $scope.anomalyDetails[anomaly].gridReady = true;
        $scope.anomalyDetails[anomaly].loadingAnomalyDetails = false;
        $scope.anomalyDetails[anomaly].json = bgpDataService.getAnomaliesAPI(parameters);
        $scope.anomalyDetails[anomaly].csv = bgpDataService.getAnomaliesAPI(parameters, "csv");

        $scope.anomalyDetails[anomaly].grid.onRegisterApi = function(gridApi) {
          // disable the 'no sorting' option and prioritise 'desc' over 'asc'
          gridApi.core.on.sortChanged($scope, function(grid, sortColumns) {
            if (sortColumns.length === 1) {
              // if there is a preferred sort order for this column, apply it
              if ($scope.anomalyDetails[anomaly].grid.preferredSortOrder[sortColumns[0].field] !== undefined) {
                // was this column sorted previously?
                var previouslySorted = false;
                for (var i = 0 ; i < $scope.anomalyDetails[anomaly].grid.currentSortColumns.length ; i++) {
                  var col = $scope.anomalyDetails[anomaly].grid.currentSortColumns[i];
                  if (col.field === sortColumns[0].field) {
                    previouslySorted = true;
                    break;
                  }
                }
                // if it wasn't sorted previously, apply the preferred sorting order
                if (!previouslySorted) {
                  sortColumns[0].sort.direction = $scope.anomalyDetails[anomaly].grid.preferredSortOrder[sortColumns[0].field];
                }
              }
            }
            // instead of removing sorting, invert the last sort direction
            else if (sortColumns.length === 0) {
              if ($scope.anomalyDetails[anomaly].grid.currentSortColumns.length === 1) {
                var col = $scope.anomalyDetails[anomaly].grid.currentSortColumns[0];
                col.sort.direction = col.sort.direction === "asc" ? "desc" : "asc";
                sortColumns.push(col);
              }
            }
            $scope.anomalyDetails[anomaly].grid.currentSortColumns = sortColumns;
          });
        };

        console.debug("anomaly details for", anomaly, $scope.anomalyDetails);
      }, function(error) {
        console.error("failed to load anomaly details for", anomaly);
        $scope.anomalyDetails[anomaly].loadingAnomalyDetails = false;
      });
    };

    function getMartiansGroundTruth(dataObject, timestamp) {
      var request = bgpDataService.getGroundTruthHash(timestamp);
      request.promise.then(function(result) {
        dataObject.groundTruthLink = ConfigService.bogonListURL + result.hash;
      });
    }

    $scope.toggleAnomalyDetails = function(anomaly) {
      // don't do anything if it's still loading
      if (anomaly.loading) return;

      if ($scope.anomalyDetails[anomaly.id] !== undefined) {
        $scope.anomalyDetails[anomaly.id].show = !$scope.anomalyDetails[anomaly.id].show;
      } else {
        $scope.loadAnomalyDetails(anomaly.id);
      }
    };

    function reloadAnomalyDetails() {
      // reload anomaly details that have been saved if they're being shown
      // or just remove the saved details if they're hidden
      for (var anomaly in $scope.anomalyDetails) {
        if ($scope.anomalyDetails.hasOwnProperty(anomaly)) {
          var previouslyShown = ($scope.anomalyDetails[anomaly] === undefined ? false : $scope.anomalyDetails[anomaly].show);
          $scope.anomalyDetails[anomaly] = undefined;
          if (previouslyShown) {
            $scope.loadAnomalyDetails(anomaly);
          }
        }
      }
    }

    $scope.changedDates = function(dates) {
      // console.log("changed dates", dates, Object.keys(dates).map(function(key, index) { return moment(dates[key]).format('MM/DD/YYYY h:mma')}));
      $timeout(function() {
        loadAnomalies(dates.start, dates.end);
        reloadAnomalyDetails();

        $scope.minMaxTimestamps=[dates.start, dates.end];
      });
    };

    $scope.graphHeight = 250;
    $scope.overviewGraph = {
      chart: {
        type: "lineChartWithSelectionEnabled",
        height: $scope.graphHeight,
        margin: {
          top: 20,
          right: 26,
          bottom: 67,
          left: 26
        },
        color: function(d) {
          if (lineColors[d.id] !== undefined) {
            return lineColors[d.id];
          }
          return "#777";
        },
        x: function(d) {
          return d !== undefined ? d[0] : 0;
        },
        y: function(d) {
          return d !== undefined ? d[1] : 0;
        },
        useVoronoi: true,
        clipEdge: true,
        transitionDuration: 500,
        useInteractiveGuideline: true,
        showLegend: true,
        showControls: false,
        showXAxis: false,
        showYAxis: true,
        xDomain: $scope.minMaxTimestamps,
        xAxis: {
          tickFormat: function(d) {
            return moment(d).format("MM/DD/YYYY HH:mm");
          }
        },
        onTimeSelectedCallback: function timeSelectedChangedFromGraph(selectedTimestamp) {
          // console.log("SELECTED TIME updated from graph", selectedTimestamp);
          $timeout(function() {
            $scope.selectedTime = selectedTimestamp;
            DateTimeRangeService.selectTimestamp(selectedTimestamp);
            for (var i = 0 ; i < $scope.previewGraphData.length ; i++) {
              computeValuesAtSelectedTime($scope.previewGraphData[i]);
            }
            reloadAnomalyDetails();
          });
        },
        onHoverCallback: function(hoverTimestamp) {
          DateTimeRangeService.previewTimestamp(hoverTimestamp);
        }
      }
    };

    DateTimeRangeService.registerUpdateListener(function timeSelectedChangedFromDateTimeRangeService() {
      var selectedTimestamp = DateTimeRangeService.selectedTimestamp;
      // console.log("SELECTED TIME updated from DateTimeRangeService", selectedTimestamp);
      $timeout(function() {
        $scope.selectedTime = selectedTimestamp;
        for (var i = 0 ; i < $scope.previewGraphData.length ; i++) {
          computeValuesAtSelectedTime($scope.previewGraphData[i]);
        }
        reloadAnomalyDetails();
      });
    });

    var uiServer = ConfigService.bgpDataService;
    const SOCKET_IO_SERVER = "bgpDataServiceSocket";
    socket.connect(SOCKET_IO_SERVER, uiServer);
    socket.on(SOCKET_IO_SERVER, 'dataUpdate', function(data) {
      console.log("dataUpdate", data);
    });

    // initialisation
    $scope.$watch('minMaxTimestamps', refreshChart);

    function refreshChart() {
      if ($scope.minMaxTimestamps === undefined) return;
      // console.log("refreshing chart", $scope.minMaxTimestamps, $scope.minMaxTimestamps.map(function(t) { return moment(t).format("MM/DD/YYYY HH:mm"); }));
      $scope.overviewGraph.chart.xDomain = $scope.minMaxTimestamps;
    }
    $scope.refreshGraph = function() {
      refreshChart();
    }

    // initialisation
    $(function() {
      // initialise the scroll bar for the middle column
      var scrollbarParameters = {
        setHeight: 740,
        theme: "minimal-dark",
        callbacks: {
          // if the content is long enough and the vertical scrollbar is added
          onOverflowY: function() {
//            $scope.thereIsMoreData = true;
          },
          // if the content is short enough and the vertical scrollbar is removed
          onOverflowYNone: function() {
//            $scope.thereIsMoreData = false;
          },
          alwaysTriggerOffsets: false
        }
      };
      $timeout(function() {
//        $(".scrollable").mCustomScrollbar(scrollbarParameters);
      }, 0);
    });
  }
);
