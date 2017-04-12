'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:BGPController
 * @description
 * # BGPController
 * Controller of the BGP page
 */
angular.module('bmpUiApp').controller('BGPController',
  function($scope, $stateParams, $location, $filter, bgpDataService, ConfigService, socket, uiGridConstants, apiFactory, $timeout) {
    $scope.httpRequests = [];

    $scope.dateFilterOn = true;

    $scope.newPathLocation = function(parameter) {
      var path = $location.path();
      var urlParameters = [];
      if (parameter !== undefined) {
        urlParameters.push("search="+parameter);
      }
      if ($scope.dateFilterOn) {
        urlParameters.push("start=" + getTimestamp("start"));
        urlParameters.push("end=" + getTimestamp("end"));
      }
      return path + "?" + urlParameters.join("&");
    };

    $scope.changeLocation = function(parameter) {
      var currentUrl = $location.url();
      var newUrl = $scope.newPathLocation(parameter);
//      console.log("currentUrl %s, newUrl %s", currentUrl, newUrl);
      if (currentUrl !== newUrl) {
        $timeout(function() {
          $location.url(newUrl);
        });
      } else if (parameter === undefined) {
        $scope.searchValue = "";
        searchValueFn();
      } else {
        console.log("what to do?");
      }
    };

    var orderBy = "routes";
    var orderDir = "desc";
    $scope.limit = 30;
    $scope.offset = 0;

    $scope.previousData = function() {
      if ($scope.offset > 0) {
        $scope.offset -= $scope.limit;
        getASListData();
      }
    }
    $scope.nextData = function() {
      $scope.offset += $scope.limit;
      getASListData();
    }

    function displayAllASNodes() {
      getASListData();
      $scope.showDirectedGraph = false;
      $scope.displayASNInfo = false;
    }

    function loadPreviewASHist(result) {
      $scope.previewGraphData = [];

      var gData = [];

      angular.forEach(result, function(record) {
        gData.push([new Date(record.created_on).getTime(), parseInt(record.chg)]);
      });

      $scope.previewGraphData[0] = {
        key: "Change",
        values: gData
      };
    }

    // returns true if string s is a valid AS number
    function isASN(s) {
      return s.match(/^[0-9]+$/) !== null;
    }

    function refreshASInfo() {
      // retrieve information from the BGP data service even if there's no response from the WhoIs API
      getPrefixes();
      getASHistInfo();
//      getASNodeAndLinks($scope.searchValue);
    }

    $scope.showASGraph = false;
    $scope.loadASGraph = function() {
      $scope.showASGraph = true;
      getASNodeAndLinks($scope.searchValue);
    };

    //get all the information of this AS
    function searchValueFn() {
      $scope.cancelAllHttpRequests();
      $scope.forceDirectedGraph.data = {nodes: [], links: []};
      $scope.showASGraph = false;

      $scope.asInfo = {};
      $scope.displayASNInfo = false;
      $scope.showDirectedGraph = false;
      $scope.displayAllNodes = false;
      $scope.displayPrefixInfo = false;
      if ($scope.searchValue === "") {
        $scope.displayAllNodes = true;
        $scope.dateFilterOn = false;
        displayAllASNodes();
      }
      else if (isASN($scope.searchValue)) {
        $scope.dateFilterOn = true;
        $scope.asn = $scope.searchValue;
        $scope.displayASNInfo = false;
        $scope.loadingWhoIs = true;
        apiFactory.getWhoIsASN($scope.searchValue).success(function(result) {
          $scope.loadingWhoIs = false;
          var data = result.gen_whois_asn.data;
          $scope.asnDetails = [];
          if (getASWhoIsInfo(data)) {
            // if this is a known ASN, get other information
          }
        }).error(function (error) {
            console.log(error.message);
            $scope.loadingWhoIs = false;
          });
        // retrieve information from the BGP data service even if there's no response from the WhoIs API
        refreshASInfo();
        $scope.displayASNInfo = true;
        $scope.showDirectedGraph = true;
      }
      // if it's not a number, assume it's a prefix
      else {
        $scope.dateFilterOn = true;
        $scope.displayPrefixInfo = true;
        $scope.prefix = $scope.searchValue;
        getPrefixInfo($scope.searchValue);
      }
    }

    $scope.keypress = function (keyEvent) {
      if (keyEvent.which === 13)
        searchValueFn($scope.searchValue);
    };

    // AS list table options
    const firstRowHeight = 350;
    const asListGridInitHeight = firstRowHeight;
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
          name: "asn", displayName: 'ASN', width: '*', type: 'number',
          cellTemplate: '<div class="ui-grid-cell-contents asn-clickable">' +
            '<div bmp-asn-model asn="{{ COL_FIELD }}" change-url-on-click="grid.appScope.newPathLocation(COL_FIELD)"></div></div>'
        },
        {
          name: "origins", displayName: 'Origins', width: '*',
          type: 'number', cellClass: 'align-right', headerCellClass: 'header-align-right'
        },
        {
          name: "routes", displayName: 'Routes', width: '*',
          type: 'number', cellClass: 'align-right', headerCellClass: 'header-align-right',
          sort: { direction: uiGridConstants.DESC }
        },
        {
          name: "changes", displayName: 'Change count', width: '*',
          type: 'number', cellClass: 'align-right', headerCellClass: 'header-align-right'
        }
      ],
      preferredSortOrder: {
        origins: "desc",
        routes: "desc",
        changes: "desc"
      },
      currentSortColumns: [
        { field: "routes", sort: { priority: 0, direction: "desc" } }
      ],
      onRegisterApi: function (gridApi) {
        // disable the 'no sorting' option and prioritise 'desc' over 'asc'
        gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
          console.log("grid sort changed", sortColumns);
          if (sortColumns.length > 0) {
            var c = sortColumns[0];
//            console.log("sort ", c.field, c.sort);

            if ($scope.asListGridOptions.preferredSortOrder[c.field] !== undefined) {
              // was this column sorted previously?
              var previouslySorted = false;
              for (var i = 0 ; i < $scope.asListGridOptions.currentSortColumns.length ; i++) {
                var col = $scope.asListGridOptions.currentSortColumns[i];
                if (col.field === c.field) {
                  previouslySorted = true;
                  break;
                }
              }
              // if it wasn't sorted previously, apply the preferred sorting order
              if (!previouslySorted) {
                c.sort.direction = $scope.asListGridOptions.preferredSortOrder[c.field];
              }
            }

            // instead of simply sorting the current data, request new data from the BGP data service
            orderBy = c.field;
            orderDir = c.sort.direction;
            $scope.offset = 0;
            getASListData();
          }
          else {
            // always sort by one column
            if ($scope.asListGridOptions.currentSortColumns.length === 1) {
              var col = $scope.asListGridOptions.currentSortColumns[0];
              col.sort.direction = col.sort.direction === "asc" ? "desc" : "asc";
//            console.debug("new sort direction for", col.field, col.sort.direction);
              sortColumns.push(col);

              orderBy = col.field;
              orderDir = col.sort.direction;
              $scope.offset = 0;
              getASListData();
            }
            else {
              // disable sorting
              sortASList();
            }
          }
          $scope.asListGridOptions.currentSortColumns = sortColumns;
        });
      }
    };

    var color = d3.scale.category20();
    var minRadius = 4;
    var maxRadius = 30;
    // TODO: make minRadius and maxRadius dependent on the number of nodes to show
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
    var minLinkLength = 3 * maxRadius;
    var maxLinkLength = 4 * minLinkLength;
    var linkLengthLinearScale = d3.scale.linear()
      .domain([0,10000])
      .range([minLinkLength, maxLinkLength]);

    function getDataFromArray(result, index, key) {
      // TODO: have a way to choose which result to display
      return index < result.length ? result[index][key] : [];
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
      radiusLinearScale.domain([0, Math.max(d3.max(prefixesOriginated), d3.max(routes))]);
//      console.log("max origins", d3.max(prefixesOriginated), "max routes", d3.max(routes));
//      console.log("radius scale", radiusLinearScale.domain());

      return [
        {
          key: "Prefixes Originated",
          values: prefixesOriginated.map(stream_index)
        },
        {
          key: "Prefixes Transitted",
          values: prefixesTransitted.map(stream_index)
        }
      ];
    }

    // sort AS list to use for the multi bar chart
    function sortASList(field, reverse) {
      if (field === undefined) {
        $scope.asList = angular.copy($scope.asListBeforeSorting);
      } else {
        $scope.asList = $filter('orderBy')($scope.asListBeforeSorting, field, reverse);
//        console.log("sorted", $scope.asList);
      }
      $scope.barChartData = transformToGraphData($scope.asList);
//      console.log("$scope.barChartData", $scope.barChartData);
    }

    function updateNodeData(result) {
//      console.log("updateNodeData");
      $scope.asListBeforeSorting = result;//getDataFromArray(result, 0, "asList");
//      console.log("asListBeforeSorting", $scope.asListBeforeSorting);

      sortASList(orderBy, orderDir==="desc");

      // AS List table (already sorted as this is the widget controlling the sorting)
      $scope.loadingASList = false; // stop loading
      $scope.asListGridOptions.data = $scope.asList;
    }

    function updateForceDirectedGraphData(data) {
      // for a force directed graph, it's important for a node to have a weight
      // we'll use the number of origins as the weight factor for an AS node
      angular.forEach(data.nodes, function(node) {
        node.weight = node.origins;
      });
      $scope.forceDirectedGraph.data = data;
      console.log("forceDirectedGraph data", $scope.forceDirectedGraph.data);
      console.debug("links", JSON.stringify($scope.forceDirectedGraph.data.links));
      console.debug("nodes", JSON.stringify($scope.forceDirectedGraph.data.nodes));
      var linkWeight = function(link) { return link.sum_changes; };
      var minWeight = d3.min(data.links.map(linkWeight));
      var maxWeight = d3.max(data.links.map(linkWeight));
      linkWidthLinearScale.domain([0, maxWeight]);
      linkLengthLinearScale.domain([minWeight, maxWeight]);
      console.log("minWeight %d maxWeight %d", minWeight, maxWeight);
    }


    // Get detailed information of this AS
    function getASDetails(data) {
      var keysToFilterOut = ["raw_output", "remarks", "isTransit", "isOrigin",
        "transit_v4_prefixes", "transit_v6_prefixes", "origin_v4_prefixes", "origin_v6_prefixes"];

      for (var key in data) {
        if (data.hasOwnProperty(key) && keysToFilterOut.indexOf(key) === -1) {
          $scope.asnDetails.push({ key: key, value: data[key]||"null" });
        }
      }
    }

    function clearRequest(request) {
      $scope.httpRequests.splice($scope.httpRequests.indexOf(request), 1);
    }
    $scope.cancelAllHttpRequests = function() {
      console.debug("cancelAllHttpRequests", $scope.httpRequests.length);
      while ($scope.httpRequests.length > 0) {
        console.debug("cancelling request");
        var request = $scope.httpRequests[0];
        request.cancel();
        clearRequest(request);
      }
      console.debug("all done");
    }

    function loadNodes(nodes, asLinks, asn) {
      var nodeIndexes = {};
      for (i = 0 ; i < nodes.length ; i++) {
        nodeIndexes[nodes[i].asn] = i;
      }

      for (i = 0 ; i < asLinks.length ; i++) {
        asLinks[i].sourceASN = asLinks[i].source;
        asLinks[i].source = nodeIndexes[asLinks[i].source];
        asLinks[i].targetASN = asLinks[i].target;
        asLinks[i].target = nodeIndexes[asLinks[i].target];
        if (asLinks[i].source === undefined || asLinks[i].target === undefined) {
          console.warn("Could not find AS%s - removing link between AS%s and AS%s",
            asLinks[i].source === undefined ? asLinks[i].sourceASN : asLinks[i].targetASN, asLinks[i].sourceASN, asLinks[i].targetASN
          );
          asLinks.splice(i, 1);
          i--;
        }
        // remove link if source === destination
        else if (asLinks[i].source === asLinks[i].target) {
          console.warn("Ignoring 'self-link' between AS%s and AS%s", asLinks[i].sourceASN, asLinks[i].targetASN);
          asLinks.splice(i, 1);
          i--;
        }
      }

      var data = { nodes: nodes, links: asLinks };

      // find information about this particular AS
      var asNumber = parseInt(asn, 10);
      for (var i = 0 ; i < data.nodes.length ; i++) {
//          console.log("compare %s (%s) with %s (%s)", res.nodes[i].asn, typeof(res.nodes[i].asn), asn, typeof(asn));
        if (data.nodes[i].asn === asNumber) {
          $scope.asnDetails.push({ key: "Number of routes", value: data.nodes[i].routes });
          $scope.asnDetails.push({ key: "Number of origins", value: data.nodes[i].origins });
        }
      }

      updateForceDirectedGraphData(data);
    }

    function getASNodeAndLinks(asn) {
      $scope.loadingASNodesAndLinksData = true;

      var request = bgpDataService.getASLinks(asn);
      $scope.httpRequests.push(request);
      request.promise.then(function(asLinks) {
        clearRequest(request);

        var asnToFindOutAbout = [];
        var i;

        // ignore links between the same ASN, e.g. source=109, target=109
        for (i = 0 ; i < asLinks.length ; i++) {
          var src = asLinks[i].source;
          var tgt = asLinks[i].target;
          if (isNaN(src)) {
            console.warn("source=%s invalid in link", src, asLinks[i]);
          } else if (isNaN(tgt)) {
            console.warn("target=%s invalid in link", tgt, asLinks[i]);
          } else if (src !== tgt) {
            // add source and target to the list of ASN to get more info on
            if (asnToFindOutAbout.indexOf(src) === -1) {
              asnToFindOutAbout.push(src);
            }
            if (asnToFindOutAbout.indexOf(tgt) === -1) {
              asnToFindOutAbout.push(tgt);
            }
          }
        }

//        console.debug("asnToFindOutAbout", asnToFindOutAbout);

        var asInfoRequest = bgpDataService.getASInfo(asnToFindOutAbout.join(','));
        $scope.httpRequests.push(asInfoRequest);
        asInfoRequest.promise.then(function(linkedASInfo) {
          var nodes = linkedASInfo;

          loadNodes(nodes, asLinks, asn);

          $scope.loadingASNodesAndLinksData = false;

          clearRequest(asInfoRequest);
        }, function(error) {
          console.warn(error);
        });
      }, function(error) {
        console.warn(error);
      });
    }

    // Get information for a specific prefix
    function getPrefixInfo(prefix) {
      var start, end;
      if ($scope.dateFilterOn) {
        start = getTimestamp("start");
        end = getTimestamp("end");
      }
      $scope.loadingPrefixes = true; // begin loading
      var request = bgpDataService.getPrefixInfo(prefix, start, end);
      $scope.httpRequests.push(request);
      request.promise.then(function(data) {
          $scope.prefixViewGridOptions.data = data;
          $scope.asPathGraph.paths = [];
          for (var i = 0 ; i < data.length ; i++) {
            $scope.prefixViewGridOptions.data[i].length = $scope.prefixViewGridOptions.data[i].as_path.split(' ').length;

            // initial_index is the link between asPathGraph.paths and prefixViewGridOptions.data
            $scope.prefixViewGridOptions.data[i].initial_index = i;
            $scope.asPathGraph.paths.push({initial_index: i, rendering_index: i, visible: true, path: data[i].as_path, as_path: [], prefix: data[i].prefix, timestamp: data[i].created_on});
          }

          createASpaths($scope.asPathGraph.paths);

          $scope.loadingPrefixes = false; // stop loading
          clearRequest(request);
        }, function(error) {
          console.warn(error);
        }
      );
    }

    // Get information for a specific AS hist
    function getASHistInfo() {
      var start, end;

      $scope.loadingPreview = true;

      if ($scope.dateFilterOn) {
        start = getTimestamp("start");
        end = getTimestamp("end");

       // $scope.loadingPrefixes = true; // begin loading
        var request = bgpDataService.getASHistInfo($scope.asn, start, end);
        $scope.httpRequests.push(request);
        request.promise.then(function(result) {
//            console.debug("AS hist info", result);
            loadPreviewASHist(result);
            $scope.loadingPreview = false;
            clearRequest(request);
          }, function(error) {
            console.warn(error);
            $scope.loadingPreview = false;
          }
        );
      }
    }

    // Get prefixes information of this AS
    function getPrefixes() {
      var start, end; // show the last hour by default
      if ($scope.dateFilterOn) {
        start = getTimestamp("start");
        end = getTimestamp("end");
      } else {
        end = new Date().getTime();
        start = end - 3600000;
      }
      $scope.prefixGridOptions.data = [];
      $scope.loadingPrefixes = true; // begin loading
//      console.log("getting prefixes for AS", $scope.asn);
      var request = bgpDataService.getASPaths($scope.asn, start, end);
      $scope.httpRequests.push(request);
      request.promise.then(function(result) {
          $scope.prefixGridOptions.data = result;
          $scope.loadingPrefixes = false; // stop loading
          clearRequest(request);
        }, function(error) {
          console.warn(error);
          $scope.loadingPrefixes = false; // stop loading
        }
      );
    }

    // get AS data (details, prefixes)
    // returns a boolean indicating whether this ASN is known
    function getASWhoIsInfo(data) {
      if (data.length != 0) {
        $scope.asn = data[0].asn;
        getASDetails(data[0]);
        $scope.nodata = false;
      }
      else {
        $scope.nodata = true;
      }
      return !$scope.nodata;
    }

    function getASListData() {
      $scope.loadingASList = true; // begin loading
      $scope.asListGridOptions.data = [];
      var request = bgpDataService.getASList(orderBy, orderDir, $scope.limit, $scope.offset);
      request.promise.then(function(result) {
//          console.debug("got AS list", result);
          $scope.loadingASList = false;
          updateNodeData(result);

          clearRequest(request);
        }, function(error) {
          console.warn(error);
        }
      );
    }    

    /* bar chart */

    $scope.barChartOptions = {
      chart: {
        type: 'multiBarChart',
        height: firstRowHeight,
        margin : {
          top: 20,
          right: 20,
          bottom: 70,
          left: 45
        },
        clipEdge: true,
        duration: 500,
        stacked: true,
        reduceXTicks: false,
        rotateLabels: 90,
        useInteractiveGuideline: true,
        xAxis: {
          axisLabel: '',
          showMaxMin: false,
          tickFormat: function(d){
            return "AS " + $scope.asList[d].asn;
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

    /* prefix table */



    $scope.prefixGridInitHeight = 250;
    $scope.prefixGridOptions = {
      rowHeight: 32,
      gridFooterHeight: 0,
      showGridFooter: true,
      enableFiltering: true,
      height: $scope.prefixGridInitHeight,
      enableHorizontalScrollbar: 0,
      enableVerticalScrollbar: 1,
      columnDefs: [
        {
          name: "prefix", displayName: 'Prefix', width: '*',
          cellTemplate: '<div class="ui-grid-cell-contents clickable" bmp-prefix-tooltip prefix="{{ COL_FIELD }}" change-url-on-click="grid.appScope.newPathLocation(COL_FIELD)"></div>'
        },
        {
          name: "origin", displayName: 'Origin AS', width: '*', type: 'number',
          cellTemplate: '<div class="ui-grid-cell-contents asn-clickable">' +
            '<div bmp-asn-model asn="{{ COL_FIELD }}" change-url-on-click="grid.appScope.newPathLocation(COL_FIELD)"></div></div>'
        }
      ],
      onRegisterApi: function (gridApi) {
        $scope.prefixGridApi = gridApi;
      }
    };

    /* end of prefix table */

    /* prefix view table */

    $scope.asPathsOrderProp = "rendering_index";
    $scope.prefixViewGridOptions = {
      rowHeight: 32,
      gridFooterHeight: 0,
      showGridFooter: true,
      enableFiltering: true,
      height: $scope.prefixGridInitHeight,
      enableHorizontalScrollbar: 0,
      enableVerticalScrollbar: 1,
      columnDefs: [
        {
          name: "prefix", displayName: 'Prefix', width: '130',
          cellTemplate: '<div class="ui-grid-cell-contents clickable" bmp-prefix-tooltip prefix="{{ COL_FIELD }}" change-url-on-click="grid.appScope.newPathLocation(COL_FIELD)"></div>'
        },
        {
          name: "as_path", displayName: 'AS Path', width: '*'
        },
        {
          name: "length", displayName: 'Length', width: '90', cellClass: 'align-center', type: 'number'//, suppressRemoveSort: true
        },
        {
          name: "created_on", displayName: 'Timestamp', width: '140',
          sort: { direction: uiGridConstants.DESC },
          cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.getCellValue(row, col) | utcToLocalTime }}</div>'
        }
      ],
      preferredSortOrder: {
        "length": "desc",
        "created_on": "desc",
        "as_path": "asc"
      },
      currentSortColumns: [
        { field: "created_on", sort: { priority: 0, direction: "desc" } }
      ],
      onRegisterApi: function (gridApi) {
        gridApi.core.on.rowsRendered($scope, function(a) {
          // figure out which rows are now visible
          for (var i = 0 ; i < a.grid.rows.length ; i++) {
            var row = a.grid.rows[i];
            $scope.asPathGraph.paths[row.entity.initial_index].visible = row.visible;
          }

          // figure out the ordering of the rows from the rowCache
          for (var i = 0 ; i < a.grid.renderContainers.body.visibleRowCache.length ; i++) {
            var entity = a.grid.renderContainers.body.visibleRowCache[i].entity;
            $scope.asPathGraph.paths[entity.initial_index].rendering_index = i;
          }
        });

        // disable the 'no sorting' option and prioritise 'desc' over 'asc'
        gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
          if (sortColumns.length === 1) {
            // if there is a preferred sort order for this column, apply it
            if ($scope.prefixViewGridOptions.preferredSortOrder[sortColumns[0].field] !== undefined) {
              // was this column sorted previously?
              var previouslySorted = false;
              for (var i = 0 ; i < $scope.prefixViewGridOptions.currentSortColumns.length ; i++) {
                var col = $scope.prefixViewGridOptions.currentSortColumns[i];
                if (col.field === sortColumns[0].field) {
                  previouslySorted = true;
                  break;
                }
              }
              // if it wasn't sorted previously, apply the preferred sorting order
              if (!previouslySorted) {
                sortColumns[0].sort.direction = $scope.prefixViewGridOptions.preferredSortOrder[sortColumns[0].field];
              }
            }
          }
          // instead of removing sorting, invert the last sort direction
          else if (sortColumns.length === 0) {
            if ($scope.prefixViewGridOptions.currentSortColumns.length === 1) {
              var col = $scope.prefixViewGridOptions.currentSortColumns[0];
              col.sort.direction = col.sort.direction === "asc" ? "desc" : "asc";
//            console.debug("new sort direction for", col.field, col.sort.direction);
              sortColumns.push(col);
            }
          }
          $scope.prefixViewGridOptions.currentSortColumns = sortColumns;
        });
      }
    };

    /* end of prefix view table */

    /* force-directed graph */

    // stability is a value between 0 and 1. A value over 1 will be mapped to 1
    // colors (red to green) checked for color blindness
    $scope.stabilityColors = [
      {
        label: "stability-0",
        color: "#9e1313"
      },
      {
        label: "stability-1",
        color: "#e60000"
      },
      {
        label: "stability-2",
        color: "#f07d02"
      },
      {
        label: "stability-3",
        color: "#84ca50"
      }
    ];
    function linkStabilityIndex(stability) {
      var index = 0;
      // green
      if (stability <= 25) {
        index = 3;
      }
      // yellow
      else if (stability <= 50) {
        index = 2;
      }
      // orange
      else if (stability <= 100) {
        index = 1;
      }
      // else red
      return index;
    }
    function linkStabilityLabel(stability) {
      var index = linkStabilityIndex(stability);
      return $scope.stabilityColors[index].label;
    }
    function linkStabilityColor(stability) {
      var index = linkStabilityIndex(stability);
      return $scope.stabilityColors[index].color;
    }

    function getParentWidth() {
      var parentDiv = $("#forceDirectedGraph");
      var defaultScrollbarWidth = 15;
      return parentDiv.width() - defaultScrollbarWidth;
    }
    $scope.tooltipFields = [ "asn", "asName", "routes", "origins", "changes" ];
    $scope.forceDirectedGraph = {
      options: {
        chart: {
          type: 'customForceDirectedGraph',
          height: Math.min($(window).height()-85, Math.max(500, getParentWidth() * 0.75)),
          width: getParentWidth(),
          margin:{top: 20, right: 20, bottom: 20, left: 20},
          nodeExtras: function(node) {
            node && node
              .append("text")
              .attr("dx", function(d) { return radiusLinearScale(d.routes) + 2; })
              .attr("dy", ".35em")
              .text(function(d) { return d.asn })
              .style('font-size', '10px');
          },
          linkExtras: function(link) {
            link && link
              .style("stroke-width", function(d) { return linkWidthLinearScale(d.sum_changes); })
              .style("stroke", function(d) { return linkStabilityColor(d.sum_changes); })
              .attr("marker-end", function(d) {
                var stabilityLabel = linkStabilityLabel(d.sum_changes);
                return "url(#arrow-"+stabilityLabel+")";
              });
          },
          linkColorSet: $scope.stabilityColors,
          linkColor: function(d) {
            return linkStabilityColor(d.sum_changes);
          },
          linkDist: function(link) {
            return linkLengthLinearScale(link.sum_changes);
          },
          linkStrength: 0.5,
          charge: -300,
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
              // get the AS name if we don't already know it
              if (tooltipData.asName === undefined) {
                apiFactory.getWhoIsASN(tooltipData.asn).success(function(result) {
                  $scope.loadingWhoIs = false;
                  var data = result.gen_whois_asn.data;
                  tooltipData.asName = data[0].as_name;
                }).error(function (error) {
                  console.log(error.message);
                  tooltipData.asName = "unknown";
                });
              }

              for (var i = 0 ; i < $scope.tooltipFields.length ; i++) {
                var field = $scope.tooltipFields[i];
                $("#field-"+field+" .value").text(tooltipData[field]);
                nodeTooltip.removeClass("hideTooltip");
              }
            } else {
              nodeTooltip.addClass("hideTooltip")
            }
          },
          nodeIdField: "asn",
          onLongPress: function(d) {
            // delay changing the URL so that the progress animation can terminate
            $timeout(function() {
              $scope.changeLocation(d.asn);
            }, 300);
          }
        }
      }
    };

    $scope.controlZoom = function(direction) {
      window.customForceDirectedGraph.dispatch.zoomControl(direction);
    };

    /* end of force-directed graph */

    /* time slider */

    // init, changedDates, lineColor
    var timeSliderCallbacks = {
      init: function() {

      },
      changedDates: function() {
        $timeout(function() {
          if ($scope.searchValue === "") {
            displayAllASNodes();
          }
          else if (isASN($scope.searchValue)) {
            refreshASInfo();
          }
          // if it's not a number, assume it's a prefix
          else {
            getPrefixInfo($scope.searchValue);
          }
        });
      },
      lineColor: function(d) {
        return "#EAA546";
      }
    }

    /* end of time slider */

    /* prefix AS path graph */

    $scope.asPathGraph = {
    };

    function createASpaths(paths) {
      for (var i = 0 ; i < paths.length ; i++) {
        createASpath(paths[i]);
      }
    }
    function createASpath(path) {
      path.config = {};
      var iconWidth = 50;
      var lineWidth = 90;
      var nodeWidth = iconWidth + lineWidth;

      path.config.width = "100%";
      path.config.lineWidth = lineWidth + "px";
      path.config.iconWidth = iconWidth + "px";

      var pathArray = path.path.split(" ");
      var indexes = {};

      for (var i = 0 ; i < pathArray.length ; i++) {
        var as = pathArray[i];
        if (indexes[as] === undefined) {
          indexes[as] = {count: 0};
        } else {
          pathArray.splice(i, 1);
          i--;
        }
        indexes[as].count++;
      }

      //Router node
      var as_path = [];

      for (var i = 0; i < pathArray.length; i++) {
        //AS nodes "bmp-as_router10-17"
        as_path.push({
          icon: "bmp-as_router10-17",
          topVal: pathArray[i],
          botVal: pathArray[i],
          isEnd: true,
          addWidth: nodeWidth,
          leftPadding: 0,
          count: indexes[pathArray[i]].count
        });
      }

      //make last as not have connecting line
      as_path[as_path.length - 1].isEnd = false;

      path.as_path = [];
      apiFactory.getWhoIsASNameList(pathArray).success(function(
        result) {

        path.as_path = as_path;

        var asname = result.w.data;
        for (var i = 0; i < asname.length; i++) {
          var index = pathArray.indexOf((asname[i].asn).toString());

          //all fields/ info for popover.
          var popOutFields = ["asn", "as_name", "org_id", "org_name",
            "city", "state_prov", "postal_code", "country"
          ]; //etc
          var pcontent = "";
          for (var j = 0; j < popOutFields.length; j++) {
            if (asname[i][popOutFields[j]] != null) {
              pcontent += popOutFields[j] + " : <span class='thin'>" +
                asname[i][popOutFields[j]] + "</span><br>";
              pcontent = pcontent.replace(/ASN-|ASN/g, "");
            }
          }

          //changed the name of the as to name from results.
          path.as_path[index].topVal = asname[i].as_name; //+1 cause starting router node
          path.as_path[index].noTopText = false;
          path.as_path[index].popOut = pcontent; //+1 cause starting router node
        }

        path.as_path[0].icon = "bmp-ebgp_router10-17";
        path.as_path[0].noTopText = true;
        path.as_path[0].addWidth = nodeWidth + 28; //width of label from icon
        path.as_path[0].leftPadding = 28;

        path.as_path = [{
          icon: "bmp-bmp_router10-17",
          topVal: "",
          noTopText: true,
          botVal: "",
          isEnd: true,
          addWidth: nodeWidth,
          leftPadding: 0,
          count: 0,
          countColor: "#ff0000"
        }].concat(path.as_path);

        //set width of whole container depending on result size.
        //len + 1 for router     + 80 stop wrapping and padding
        path.config.width = nodeWidth * path.as_path.length + 80 + "px";
      }).error(function(error) {
        console.log(error);
      });
    }

    /* end of prefix AS path graph */

    var uiServer = ConfigService.bgpDataService;
    const SOCKET_IO_SERVER = "bgpDataServiceSocket";
    socket.connect(SOCKET_IO_SERVER, uiServer);
    socket.on(SOCKET_IO_SERVER, 'dataUpdate', function(data) {
      console.log("dataUpdate", data);
      updateNodeData(data);
    });

    // initialisation
    $(function () {
      //initial search
//      console.debug("stateParams", $stateParams);
      var timeSliderParameters = { forceY: [-2,2] };
      if ($stateParams.start) {
//        setTimestamp("start", $stateParams.start);
        timeSliderParameters.startTimestamp = parseInt($stateParams.start, 10);
      }
      if ($stateParams.end) {
//        setTimestamp("end", $stateParams.end);
        timeSliderParameters.endTimestamp = parseInt($stateParams.end, 10);
      }
      setUpTimeSlider($scope, $timeout, timeSliderCallbacks, timeSliderParameters);
      if ($stateParams.search) {
        $scope.searchValue = $stateParams.search;
        searchValueFn();
      }
      else {
        $scope.searchValue = "";
        $scope.displayAllNodes = true;
        $scope.dateFilterOn = false;
        displayAllASNodes();
      }
    });
  }
);
