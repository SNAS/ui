'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:aggregationanalysisController
 * @description
 * # aggregationanalysisController
 * Controller of the Login page
 */
angular.module('bmpUiApp')
  .controller('aggregationanalysisController', ['$scope', 'apiFactory', '$http', '$timeout', "$stateParams", function ($scope, apiFactory, $http, $timeout, $stateParams) {
    //DEBUG
    window.SCOPE = $scope;

    $scope.showGraphTable = false;
    $scope.showGrid = false;
    $scope.isInputValid = true;

    //populate prefix data into ShowPrefixesOptions Grid
    $scope.ShowPrefixesOptions = {
      showGridFooter: true,
      gridFooterHeight: 0,
      enableRowSelection: true,
      enableRowHeaderSelection: false,
      enableHorizontalScrollbar: 0,
      enableVerticalScrollbar: 1,
      rowHeight: 25,
      rowTemplate: '<div class="hover-row-highlight"><div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div></div>'
    };

    $scope.ShowPrefixesOptions.columnDefs = [
      {name: "router_name", displayName: 'RouterName', width: '*'},
      {name: "peer_name", displayName: 'PeerName', width: '*'},
      {name: "prefix", displayName: 'Prefix', width: '*'}
    ];

    $scope.getASNInfo = function () {

      $scope.isInputValid = true;
      $scope.showGraphTable = false;

      if (isNaN($scope.searchASN)) {
        $scope.ShowPrefixesOptions.data = [];
        $scope.PrefixTableIsLoad = false; //stop loading
        $scope.ShowPrefixesOptions.showGridFooter = false;
        $scope.peerData = [];
        $scope.isInputValid = false;
        return;
      }

      apiFactory.getAsnInfo($scope.searchASN)
        .success(function (result) {
          if (!$.isEmptyObject(result) && result.v_routes.data.length != 0) {
            $scope.ShowPrefixesOptions.data = $scope.PrefixData = result.v_routes.data;
            $scope.PrefixTableIsLoad = false; //stop loading
            $scope.ShowPrefixesOptions.showGridFooter = true;
            var peerDataOriginal = result.v_routes.data;
            $scope.peerData = filterUnique(peerDataOriginal, "PeerName");
            createShowPrefixesOptions();
          } else {
            $scope.ShowPrefixesOptions.data = [];
            $scope.PrefixTableIsLoad = false; //stop loading
            $scope.ShowPrefixesOptions.showGridFooter = false;
            $scope.peerData = [];
          }
        }).error(function (error) {
          $scope.ShowPrefixesOptions.data = [];
          $scope.PrefixTableIsLoad = false; //stop loading
          $scope.ShowPrefixesOptions.showGridFooter = false;
          $scope.peerData = [];
        });
    };

    if ($stateParams.as) {
      $scope.searchASN = $stateParams.as;
      $scope.getASNInfo();
    }

    var createShowPrefixesOptions = function () {
      for (var i = 0; i < $scope.PrefixData.length; i++) {
        $scope.PrefixData[i].router_name = $scope.PrefixData[i].RouterName + "/" + $scope.PrefixData[i].PrefixLen;
        $scope.PrefixData[i].peer_name = $scope.PrefixData[i].PeerName;
        $scope.PrefixData[i].prefix = $scope.PrefixData[i].Prefix;
      }
    };

    var filterUnique = function (input, key) {
      var unique = {};
      var uniqueList = [];

      for (var i = 0; i < input.length; i++) {
        if (typeof unique[input[i][key]] == "undefined") {
          unique[input[i][key]] = "";
          uniqueList.push(input[i]);
        }
      }
      return uniqueList;
    };

    $scope.selectChange = function () {
      if ($scope.peerData.selectPeer != null) {
        $scope.peerHashId = $scope.peerData.selectPeer.peer_hash_id;
        showAggregatePrefixes();
      } else {
        $scope.showGraphTable = false;
        $scope.showGrid = false;
      }
    };

    //calculate redundant route information.
    var aggregatePrefixes = function (data) {
      $scope.aggregated_prefixes = [];
      $scope.auxiliary_array = new Array(data.length).fill(false);
      $scope.reduced_prefix_amount = 0;

      // for (var i = 0; i < data.length; i++) $scope.auxiliary_array[i] = false; // init auxiliary_array,make it all false

      data.sort(function (a, b) {
        return a.PrefixLen - b.PrefixLen
      });

      for (var i = 0; i < data.length - 1; i++) {
        if ((!$scope.auxiliary_array[i]) && (data[i].isPeerIPv4 == 1)) {
          for (var j = i + 1; j < data.length; j++) {
            if ((data[j].isPeerIPv4 == 1) && (!$scope.auxiliary_array[j])) {
              compare(data[i], data[j], j); //Compare two addresses
            }
          }
        }
      }
    };

    function compare(a, b, j) {
      var element;
      if (ipToBinary(a.Prefix).substring(0, a.PrefixLen) == ipToBinary(b.Prefix).substring(0, a.PrefixLen)) {
        if ((a.Origin == b.Origin) & (a.AS_Path == b.AS_Path) & (a.Communities == b.Communities) & (a.ExtCommunities == b.ExtCommunities) & (a.MED == b.MED) & (a.Prefix + '/' + a.PrefixLen != b.Prefix + '/' + b.PrefixLen) ) {
          $scope.reduced_prefix_amount++;
          var key = a.Prefix + '/' + a.PrefixLen;
          var value = b.Prefix + '/' + b.PrefixLen;
          var t = 0, found = 0;
          while (( !found ) && ( t < $scope.aggregated_prefixes.length )) {
            if ($scope.aggregated_prefixes[t].Prefix == key) {
              $scope.aggregated_prefixes[t].Covers = $scope.aggregated_prefixes[t].Covers + "; " + value;
              found = true;
            }
            t++;
          }
          if (!found) {
            element = {
              "Prefix": key,
              "Covers": value
            };
            $scope.aggregated_prefixes.push(element);
          }
          $scope.auxiliary_array[j] = true;
        }
      }
    }

    //Transform string ip address to binary view
    function ipToBinary(ip) {
      var d = ip.split('.');
      return toBinaryStr(d[0]) + toBinaryStr(d[1]) + toBinaryStr(d[2]) + toBinaryStr(d[3]);
    }

    function toBinaryStr(d) {
      var y = parseInt(d).toString(2);
      while (y.length < 8) {
        y = "0" + y;
      }
      return y;
    }

    var showAggregatePrefixes = function () {
      apiFactory.getAsnInfoPeer($scope.searchASN, $scope.peerHashId)
        .success(function (data) {
          var prefixes_of_as_and_peer = data.v_routes.data;
          $scope.prefix_amount = data.v_routes.size; // for calculating, store the length of prefixes
          aggregatePrefixes(prefixes_of_as_and_peer);
          $scope.ShowRedundantOptions.data = $scope.aggregated_prefixes;
          // createShowRedundantOptions();
          //createChartOptions();
          if ("" != prefixes_of_as_and_peer) {
            createChartOptions();
            $scope.efficiency = 100 - (Math.round(($scope.reduced_prefix_amount / $scope.prefix_amount) * 10000) / 100) + "%"
          }
          else {
            $scope.efficiency = "No data available"
          }
          $scope.showGraphTable = true;
          $scope.showGrid = true;

           $scope.ShowSummaryOptions.data = [
            {"Parameter": "Prefixes", "Count": $scope.prefix_amount},
            {"Parameter": "Suppressable", "Count": $scope.reduced_prefix_amount},
            {"Parameter": "Unsuppressable", "Count": $scope.prefix_amount - $scope.reduced_prefix_amount}
           ]
        });
    };

    // show redundant prefix
    $scope.ShowRedundantOptions = {
      showGridFooter: true,
      enableRowSelection: false,
      enableRowHeaderSelection: false,
      enableHorizontalScrollbar: 0,
      enableVerticalScrollbar: 1,
      rowHeight: 25,
      height: 300,
      rowTemplate: '<div class="hover-row-highlight"><div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div></div>'
    };
    $scope.ShowRedundantOptions.columnDefs = [
      {name: "Prefix", displayName: 'Aggregate', width: '30%'},
      {name: "Covers", displayName: 'Prefixes that can be suppressed', width: '*'}
    ];

    // show summary table next to the efficiency chart
   $scope.ShowSummaryOptions = {
        showGridFooter: false,
        enableRowSelection: false,
        enableRowHeaderSelection: false,
        enableHorizontalScrollbar: 0,
        enableVerticalScrollbar: 0,
        enableSorting: false,
        rowHeight: 50,
        rowTemplate: undefined
      };
      $scope.ShowSummaryOptions.columnDefs = [
        {name: "Parameter", displayName: '', width: '55%', enableHiding: false},
        {name: "Count", displayName: 'Count', width: '45%', enableHiding: false}
      ];

    //get data for the efficiency chart
    var createChartOptions = function () {
      $scope.chartOptions = {
        chart: {
          type: 'pieChart',
          height: 500,
          x: function (d) {
            return d.key;
          },
          y: function (d) {
            return d.y;
          },
          showLabels: true,
          transitionDuration: 500,
          labelThreshold: 0.01,
          legend: {
            margin: {
              top: 5,
              right: 35,
              bottom: 5,
              left: 0
            }
          }
        }
      };
      $scope.data = [
        {
          key: "Aggregatable Prefixes",
          y: $scope.reduced_prefix_amount
        },
        {
          key: "Unaggregatable Prefixes",
          y: $scope.prefix_amount - $scope.reduced_prefix_amount
        }
      ];
    };

    //initialize the first view
    $scope.searchASN = "109";
    $scope.getASNInfo();
  }]);


