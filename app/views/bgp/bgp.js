'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:BGPController
 * @description
 * # BGPController
 * Controller of the BGP page
 */
angular.module('bmpUiApp').controller('BGPController', //["$scope", "bgpDataService", "ConfigService", "socket",
  function($scope, bgpDataService, ConfigService, socket, uiGridConstants) {
    // TODO: have a widget to choose the start and end dates/times
    var start = 1483463232000;
    var end = 1483549631000;

    // AS list table options
    const asListGridInitHeight = 450;
    $scope.asListGridOptions = {
      enableColumnResizing: true,
      rowHeight: 32,
      gridFooterHeight: 0,
      showGridFooter: true,
      height: asListGridInitHeight,
      enableHorizontalScrollbar: 0,
      enableVerticalScrollbar: 1,
      columnDefs: [
        {
          name: "as", displayName: 'ASN', width: '*', type: 'number',
          cellTemplate: '<div class="ui-grid-cell-contents asn-clickable"><div bmp-asn-model asn="{{ COL_FIELD }}"></div></div>'
        },
        {
          name: "origins", displayName: 'Origins', width: '25%',
          type: 'number', cellClass: 'align-right', headerCellClass: 'header-align-right'
        },
        {
          name: "routes", displayName: 'Routes', width: '25%',
          type: 'number', cellClass: 'align-right', headerCellClass: 'header-align-right',
          sort: { direction: uiGridConstants.DESC }
        }
      ]//,
//      onRegisterApi: function (gridApi) {
//        $scope.upstreamGridApi = gridApi;
//      }
    };

    function updateData(result) {
      // TODO: have a way to choose which result to display
      $scope.asList = result.length > 0 ? result[0].asList : [];
      $scope.data = transformToGraphData($scope.asList);
      console.log("$scope.data", $scope.data);

      $scope.loadingASList = false; //stop loading
      $scope.asListGridOptions.data = $scope.asList;
    }

    function getData() {
      $scope.loadingASList = true; // begin loading
      $scope.asListGridOptions.data = [];
      bgpDataService.getASList(start, end).success(function(result) {
          updateData(result);
        }
      ).error(function(error) {
          console.log("Failed to retrieve AS list", error);
          $scope.error = error;
        }
      );
    }

    getData();

    $scope.barChartOptions = {
      chart: {
        type: 'multiBarChart',
        height: 450,
        margin : {
          top: 20,
          right: 20,
          bottom: 70,
          left: 35
        },
        clipEdge: true,
        duration: 500,
        stacked: true,
        reduceXTicks: false,
        rotateLabels: 90,
        useInteractiveGuideline: true,
//        refreshDataOnly: true,
        xAxis: {
          axisLabel: '',
          showMaxMin: false,
          tickFormat: function(d){
//              return "AS " + d3.format(',f')(d);
            return $scope.asList[d].as;
          }
        },
        yAxis: {
          axisLabel: '',
          tickFormat: function(d){
            return d3.format(',.f')(d);
          }
        }
      }
    };

    function transformToGraphData(asList) {
      var prefixesOriginated = [];
      var prefixesTransitted = [];
      for (var i = 0 ; i < asList.length ; i++) {
        prefixesOriginated.push(asList[i].origins);
        prefixesTransitted.push(asList[i].routes - asList[i].origins);
      }
      return [
        {
          key: "Prefixes Originated",
          values: prefixesOriginated.map(stream_index)
        },
        {
          key: "Prefixed Transitted",
          values: prefixesTransitted.map(stream_index)
        }
      ];
    }

    function stream_index(d, i) {
      return {x: i, y: Math.max(0, d)};
    }

    var uiServer = ConfigService.bgpDataService;
    const SOCKET_IO_SERVER = "bgpDataServiceSocket";
    socket.connect(SOCKET_IO_SERVER, uiServer);
    socket.on(SOCKET_IO_SERVER, 'dataUpdate', function(data) {
      console.log("dataUpdate", data);
      updateData(data);
    });

    // this function is for testing purposes, to trigger a socket.io update from the server
    // this is TEMPORARY and will be removed once the server gets real-time OpenTSDB updates
    $scope.triggerDataUpdate = function() {
      socket.emit(SOCKET_IO_SERVER, "updateData");
    };
  }
);
