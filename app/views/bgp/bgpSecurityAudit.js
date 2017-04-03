'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:BGPSecurityAuditController
 * @description
 * # BGPSecurityAuditController
 * Controller for the BGP Security Audit page
 */
angular.module('bmpUiApp').controller('BGPSecurityAuditController',
  function($scope, $stateParams, $location, $filter, bgpDataService, ConfigService, socket, uiGridConstants, apiFactory, $timeout) {

    $scope.views = [
    ];

    const viewNames = {
      martians: "Martian anomalies",
      prefix_length: "Prefix length anomalies"
    };
    const lineColors = {
      martians: "red",
      prefix_length: "blue"
    };

    function loadAnomalies() {
      $scope.loadingAnomalies = true;
      bgpDataService.getAnomaliesTypes().promise.then(function(result) {
        console.debug("anomalies types", result);
//        var parameters = {
//          anomaliesType: "overview",
//          overviewTypes: result
//        };
//        var request = bgpDataService.getAnomalies(parameters);
//        request.promise.then(function(result) {
//          console.debug("anomalies", result);
//
//          $scope.views = [];
//          for (var key in result) {
//            if (result.hasOwnProperty(key)) {
//              var newView = {
//                name: viewNames[key] !== undefined ? viewNames[key] : key,
//                occurrences: Math.ceil(Math.random() * 10)
//              }
//              $scope.views.push(newView);
//            }
//          }
//
//          loadPreviewGraphData(result);
//
//          $scope.loadingAnomalies = false;
//        }, function(error) {
//          console.warn(error);
//          $scope.loadingAnomalies = false;
//        });

        $scope.views = [];
        $scope.previewGraphData = [];
        angular.forEach(result, function(anomaly) {
          var request = bgpDataService.getAnomalyOverview(anomaly);
          request.promise.then(function(result) {
            console.debug("anomalies for", anomaly, result);
            // find the selected timestamp in the data
            var occurrences = -1;
            for (var i = 0 ; i < result.length ; i++) {
              var timestamp = result[i].hourtimestamp;//parseInt(result[i].hourtimestamp, 10) * 1000;
              console.log("result", (i+1)+"/"+result.length, "timestamp=", timestamp, $scope.selectedTime, result[i].value);
              if (timestamp === $scope.selectedTime) {
                occurrences = result[i].value;//parseInt(result[i].value, 10);
                break;
              }
            }
            var newView = {
              name: anomaly,
              occurrences: occurrences
            }
            $scope.views.push(newView);
            console.log("$scope.views", $scope.views);


            // find the graph lines in the data
            var gData = [];
            angular.forEach(result, function(record) {
              var timestamp = record.hourtimestamp;//parseInt(record.hourtimestamp, 10) * 1000;
              gData.push([new Date(timestamp).getTime(), record.value/*parseInt(record.value, 10)*/]);
            });
            var newGraphLine = {
              id: anomaly,
              key: viewNames[anomaly] !== undefined ? viewNames[anomaly] : anomaly,
              values: gData
            };
            $scope.previewGraphData.push(newGraphLine);

            console.log("previewGraphData", $scope.previewGraphData);

//            $scope.views = [];
//            for (var key in result) {
//              if (result.hasOwnProperty(key)) {
//                var newView = {
//                  name: viewNames[key] !== undefined ? viewNames[key] : key,
//                  occurrences: Math.ceil(Math.random() * 10)
//                }
//                $scope.views.push(newView);
//              }
//            }
//
//            loadPreviewGraphData(result);

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

    $scope.anomalyDetails = {};
    $scope.displayFields = {
      martians: [ "as_path", "origin_as", "peer_as", "who_is", "prefix", "router_ip", "still_active", "timestamp", "type" ]
    }
    $scope.loadAnomalyDetails = function(anomaly) {
      console.log("Loading anomaly details for", anomaly);
      var request = bgpDataService.getAnomalies({ anomaliesType: anomaly });
      request.promise.then(function(result) {
        console.debug("anomaly details for", anomaly, result);
        $scope.anomalyDetails[anomaly] = result;
        $scope.anomalyDetails[anomaly].show = true;
      });
    };
    $scope.toggleAnomalyDetails = function(anomaly) {
      if ($scope.anomalyDetails[anomaly] !== undefined) {
        $scope.anomalyDetails[anomaly].show = !$scope.anomalyDetails[anomaly].show;
      } else {
        $scope.loadAnomalyDetails(anomaly);
      }
    };

    function loadPreviewGraphData(data) {
      $scope.previewGraphData = [];

      // find the graph lines in the data
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          var gData = [];
          angular.forEach(data[key], function(record) {
            gData.push([new Date(record.timestamp).getTime(), parseInt(record.value, 10)]);
          });
          var newGraphLine = {
            id: key,
            key: viewNames[key] !== undefined ? viewNames[key] : key,
            values: gData
          };
          $scope.previewGraphData.push(newGraphLine);
        }
      }
      console.log("previewGraphData", $scope.previewGraphData);
    }

    // init, changedDates, lineColor
    var callbacks = {
      lineColor: function (d) {
        if (lineColors[d.id] !== undefined) {
          return lineColors[d.id];
        }
        return "#777";
      }
    }
    setUpTimeSlider($scope, $timeout, callbacks, { showLegend: true });


    var uiServer = ConfigService.bgpDataService;
    const SOCKET_IO_SERVER = "bgpDataServiceSocket";
    socket.connect(SOCKET_IO_SERVER, uiServer);
    socket.on(SOCKET_IO_SERVER, 'dataUpdate', function(data) {
      console.log("dataUpdate", data);
    });

    // initialisation
    $(function () {
      loadAnomalies();
    });
  }
);
