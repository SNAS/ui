'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:BGPController
 * @description
 * # BGPController
 * Controller of the BGP page
 */
angular.module('bmpUiApp').controller('BGPController', //["$scope", "bgpDataService", "ConfigService", "socket",
  function($scope, $filter, bgpDataService, ConfigService, socket, uiGridConstants) {
    // TODO: have a widget to choose the start and end dates/times
    var start = 1483463232000;
    var end = 1483549631000;
//    var start = 1484665200000;
//    var end = start + 10;

    // AS list table options
    const asListGridInitHeight = 449;
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
          name: "origins", displayName: 'Origins', width: '*',
          type: 'number', cellClass: 'align-right', headerCellClass: 'header-align-right'
        },
        {
          name: "routes", displayName: 'Routes', width: '*',
          type: 'number', cellClass: 'align-right', headerCellClass: 'header-align-right',
          sort: { direction: uiGridConstants.DESC }
        }
      ],
      onRegisterApi: function (gridApi) {
        gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
          console.log("grid sort changed", sortColumns);
          if (sortColumns.length > 0) {
            var c = sortColumns[0];
            console.log("sort ", c.field, c.sort);
            sortASList(c.field, c.sort.direction==="desc");
          }
          else {
            // disable sorting
            sortASList();
          }
        });
      }
    };

    var color = d3.scale.category20();
    var minRadius = 4;
    var maxRadius = 30;
    // the domains for both scales below need to be updated when we receive the data
    // TODO: add a slider to change the exponent
    var exponent = .5;
    var radiusLinearScale = d3.scale.pow().exponent(exponent)
      .domain([0,10000])
      .range([minRadius, maxRadius]);
    var minLinkWidth = 1;
    var maxLinkWidth = 4;
    var linkWidthLinearScale = d3.scale.linear()
      .domain([0,10000])
      .range([minLinkWidth, maxLinkWidth]);
    var minLinkLength = 20;
    var maxLinkLength = 150;
    var linkLengthLinearScale = d3.scale.linear()
      .domain([0,10000])
      .range([minLinkLength, maxLinkLength]);

    function getDataFromArray(result, key) {
      // TODO: have a way to choose which result to display
      return result.length > 0 ? result[0][key] : [];
    }

    function stream_index(d, i) {
      return {x: i, y: Math.max(0, d)};
    }

    function transformToGraphData(asList) {
      var prefixesOriginated = [];
      var prefixesTransitted = [];
      var routes = [];
      for (var i = 0 ; i < asList.length ; i++) {
        prefixesOriginated.push(asList[i].origins);
        prefixesTransitted.push(asList[i].routes - asList[i].origins);
        routes.push(asList[i].routes);
      }

      // update the scales' domain for the force directed graph
//      radiusLinearScale.domain([0, d3.max(prefixesOriginated)]);
//      radiusLinearScale.domain([0, d3.max(prefixesTransitted)]);
      radiusLinearScale.domain([0, Math.max(d3.max(prefixesOriginated), d3.max(routes))]);
      console.log("max origins", d3.max(prefixesOriginated), "max routes", d3.max(routes));
      console.log("radius scale", radiusLinearScale.domain());

      return [
        {
          key: "Prefixes Originated",
          values: prefixesOriginated.map(stream_index)
        },
        {
          key: "Prefixed Transitted",
          values: prefixesTransitted.map(stream_index)
        }//,
//        {
//          key: "Routes",
//          values: routes.map(stream_index)
//        }
      ];
    }

    // sort AS list to use for the multi bar chart
    function sortASList(field, reverse) {
      if (field === undefined) {
        $scope.asList = angular.copy($scope.asListBeforeSorting);
      } else {
        $scope.asList = $filter('orderBy')($scope.asListBeforeSorting, field, reverse);
        console.log("sorted", $scope.asList);
      }
      $scope.barChartData = transformToGraphData($scope.asList);
      console.log("$scope.barChartData", $scope.barChartData);
    }

    function updateNodeData(result) {
      console.log("updateNodeData");
      $scope.asListBeforeSorting = getDataFromArray(result, "asList");
      console.log("asListBeforeSorting", $scope.asListBeforeSorting);

      sortASList("routes", true);

      // AS List table (already sorted as this is the widget controlling the sorting)
      $scope.loadingASList = false; // stop loading
      $scope.asListGridOptions.data = $scope.asList;
    }

    function updateForceDirectedGraphData(data) {
      $scope.forceDirectedGraph.data = data;
      console.log("forceDirectedGraph data", $scope.forceDirectedGraph.data);
      var linkWeight = function(link) { return link.weight; };
      var minWeight = d3.min(data.links.map(linkWeight));
      var maxWeight = d3.max(data.links.map(linkWeight));
      linkWidthLinearScale.domain([0, maxWeight]);
      linkLengthLinearScale.domain([maxWeight, minWeight]);
      console.log("minWeight %s maxWeight %s", minWeight, maxWeight);
    }

    function getData() {
      $scope.loadingASList = true; // begin loading
      $scope.asListGridOptions.data = [];
      bgpDataService.getASList(start, end).success(function(result) {
          updateNodeData(result);
        }
      ).error(function(error) {
          console.error("Failed to retrieve AS list", error);
          $scope.error = error;
        }
      );

      bgpDataService.getASNodesAndIndexedLinks(start, end).then(function(data) {
        updateForceDirectedGraphData(data);
      });
    }

    /* bar chart */

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
            return "AS " + $scope.asList[d].as;
//            return "";
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

    /* end of bar chart */

    /* force-directed graph */

    // stability is a value between 0 and 1. A value over 1 will be mapped to 1
    // colors (red to green) checked for color blindness
    $scope.stabilityColors = ["#9e1313", "#e60000", "#f07d02", "#84ca50"];
    function linkStabilityColor(stability) {
//      var colors = ["#ca0020", "#f4a582", "#92c5de", "#0571b0"];
      var index = 0;
      if (stability >= .8) {
        index = 3;
      } else if (stability >= 0.5) {
        index = 2;
      } else if (stability >= 0.2) {
        index = 1;
      }
      return $scope.stabilityColors[index];
    }

    function getParentWidth() {
      var parentDiv = $("#forceDirectedGraph");
      var defaultScrollbarWidth = 15;
      return parentDiv.width() - defaultScrollbarWidth;
    }
    $scope.tooltipFields = [ "as", "routes", "origins", "weight" ];
//    var customForceDirectedGraphSvg;
    $scope.forceDirectedGraph = {
      options: {
        chart: {
          type: 'customForceDirectedGraph',
          height: Math.min($(window).height()-85, Math.max(500, getParentWidth() * 0.75)),
          width: getParentWidth(),
          margin:{top: 20, right: 20, bottom: 20, left: 20},
          color: function(d){
            return color(d.num_of_prefixes)
          },
          nodeExtras: function(node) {
            node && node
              .append("text")
              .attr("dx", function(d) { return radiusLinearScale(d.origins) + 2; })
              .attr("dy", ".35em")
              .text(function(d) { return d.as })
              .style('font-size', '10px');
          },
          linkExtras: function(link) {
            link && link
              .style("stroke-width", function(d) { return linkWidthLinearScale(d.weight); })
              .style("stroke", function(d) { return linkStabilityColor(d.stability); })
          },
          linkColor: function(d) {
            return linkStabilityColor(d.stability);
          },
          linkDist: function(link) {
            return linkLengthLinearScale(link.weight);
          },
          linkStrength: 0.8,
          charge: -200,
//          initCallback: function(svgContainer) {
//            customForceDirectedGraphSvg = svgContainer;
//          },
          radius: function(d) {
            return radiusLinearScale(d.origins);
          },
          nodeCircles: [
            {
              color: "#aec7e8",
              cssClass: "routes",
              radius: function(d) { return radiusLinearScale(d.routes); },
              displayNode: function(d) { return d.routes > 0; }
            },
            {
              color: "#1f77b4",
              cssClass: "origins",
              radius: function(d) { return radiusLinearScale(d.origins); },
              displayNode: function(d) { return d.origins > 0; }
            }
          ],
          nvTooltipFields: $scope.tooltipFields,
          useNVTooltip: false,
          tooltipCallback: function(hideTooltip, tooltipData) {
//            console.debug("tooltipData", tooltipData);
            var nodeTooltip = $("#nodeTooltips");
            if (!hideTooltip) {
              for (var i = 0 ; i < $scope.tooltipFields.length ; i++) {
                var field = $scope.tooltipFields[i];
                $("#field-"+field+" .value").text(tooltipData[field]);
                nodeTooltip.removeClass("hideTooltip")
              }
            } else {
              nodeTooltip.addClass("hideTooltip")
            }
          }
        }
      }
    };

    $scope.controlZoom = function(direction) {
      window.customForceDirectedGraph.dispatch.zoomControl(direction);
    };

    /* end of force-directed graph */

    /* time slider */

    // load UTC timezone
    moment.tz.add("Etc/UTC|UTC|0|0|");
    moment.tz.link("Etc/UTC|UTC");

    var timeFormat = 'YYYY-MM-DD HH:mm';

    var startTimestamp, endTimestamp;

    endTimestamp = moment().toDate();
    startTimestamp = moment().subtract(30, 'minutes').toDate();

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

    /* end of time slider */

    // initialisation
    getData();

    var uiServer = ConfigService.bgpDataService;
    const SOCKET_IO_SERVER = "bgpDataServiceSocket";
    socket.connect(SOCKET_IO_SERVER, uiServer);
    socket.on(SOCKET_IO_SERVER, 'dataUpdate', function(data) {
      console.log("dataUpdate", data);
      updateNodeData(data);
    });

    // this function is for testing purposes, to trigger a socket.io update from the server
    // this is TEMPORARY and will be removed once the server gets real-time OpenTSDB updates
    var lastStart = start;
    $scope.triggerDataUpdate = function() {
      console.debug("triggerDataUpdate");
      socket.emit(SOCKET_IO_SERVER, "updateData");

      // TODO: remove this temporary hack too
      // get some new data for the force directed graph
      var newStart = (lastStart%2 === 0 ? lastStart+1 : lastStart-1);
      console.log("newStart", newStart);
      bgpDataService.getASNodesAndIndexedLinks(newStart, end).then(function(data) {
        updateForceDirectedGraphData(data);
        lastStart = newStart;
      });
    };
  }
);
