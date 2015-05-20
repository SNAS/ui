'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:aggregationanalysisController
 * @description
 * # aggregationanalysisController
 * Controller of the Login page
 */
angular.module('bmpUiApp')
  .controller('aggregationanalysisController',['$scope', 'apiFactory', '$http', '$timeout', function ($scope, apiFactory, $http, $timeout) {
    //DEBUG
    window.SCOPE = $scope;

     $scope.searchPrefix = "";

    $scope.$on('menu-toggle', function (thing, args) {
      $timeout(function () {
        resize();
      }, 550);
    });

    //populate prefix data into ShowPrefixsOptions Grid
    $scope.ShowPrefixsOptions = {
      enableRowSelection: false,
      enableRowHeaderSelection: false,
      flatEntityAccess: true
    };

    $scope.ShowPrefixsOptions.columnDefs = [
      {name: "RouterName", displayName: 'RouterName', width: '*'},
      {name: "PeerName", displayName: 'PeerName', width: '*'},
      {name: "Prefix", displayName: 'Prefix', width: '*'},
    ];

    $scope.getsShowPrefixInfo = function(){

      $scope.ShowPrefixsOptions.data = [];

      apiFactory.getAsnCount($scope.searchPrefix)
        .success(function(data) {
        $scope.prefix_amount= data.table.data[0].PrefixCount;
          apiFactory.getAsnInfo(109,$scope.prefix_amount)
            .success(function(result) {
              $scope.ShowPrefixsOptions.data = result.v_routes.data;

              var peerDataOriginal = $scope.ShowPrefixsOptions.data;

              $scope.peerData =  filterUnique(peerDataOriginal,"PeerName");

              $scope.apply();
            });
      });
    };

    var filterUnique = function(input, key) {
      var unique = {};
      var uniqueList = [];
      console.log("unique:" + unique);

      for(var i = 0; i < input.length; i++){
        if(typeof unique[input[i][key]] == "undefined"){
          unique[input[i][key]] = "";
          uniqueList.push(input[i]);
          console.log("uniqueList:" + uniqueList);
        }
      }
      return uniqueList;
    };


    $scope.selectChange = function(){
      $scope.peerHashId = $scope.peerData.selectPeer.peer_hash_id;
      showaggregatePrefixes();
    }

    //calculate redundant route information.
    var  aggregatePrefixes = function(data) {
      $scope.aggregated_prefixes = [];
      $scope.auxiliary_array = [];
      $scope.reduced_prefix_amount = 0;

      for (var i = 0; i < data.length; i++) $scope.auxiliary_array[i] = false; // init auxiliary_array,make it all false

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
    }

    function compare(a, b, j) {
      var element;
      if (ipToBinary(a.Prefix).substring(0, a.PrefixLen) == ipToBinary(b.Prefix).substring(0, a.PrefixLen)) {
        if ((a.Origin == b.Origin) & (a.AS_Path == b.AS_Path) & (a.Communities == b.Communities) & (a.ExtCommunities == b.ExtCommunities) & (a.MED == b.MED)) {
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
            }
            $scope.aggregated_prefixes.push(element);
          }
          $scope.auxiliary_array[j] = true;

          console.log(ipToBinary(a.Prefix) + " and " + ipToBinary(b.Prefix));
          console.log(element);
          console.log($scope.reduced_prefix_amount);
        }
      }
    }

    //Transform string ip adress to binary view
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

    var showaggregatePrefixes = function()
    {
      apiFactory.getAsnInfoPeer($scope.searchPrefix,$scope.peerHashId)
        .success(function(data) {
          var prefixes_of_as_and_peer = data.v_routes.data;
          $scope.prefix_amount = data.v_routes.size; // for calculating, store the length of prefixes
          aggregatePrefixes(prefixes_of_as_and_peer);
          createShowRedundantOptions();
          //createChartOptions();
          if ("" != prefixes_of_as_and_peer)
          {
            createChartOptions();

            $scope.efficiency = (($scope.prefix_amount - $scope.reduced_prefix_amount)/$scope.prefix_amount)*100 + "%"
          }
          else
          {
            $scope.efficiency = "No data avalible"
          }
        });
    }


    // show redundant prefix
    $scope.ShowRedundantOptions = {
      enableRowSelection: false,
      enableRowHeaderSelection: false
    };
    $scope.ShowRedundantOptions.columnDefs = [
      {name: "Prefix", displayName: 'Prefix', width: '30%'},
      {name: "Covers", displayName: 'Covered Prefix', width: '*'},
    ];

    var createShowRedundantOptions = function () {
        $scope.ShowRedundantOptions.data = $scope.aggregated_prefixes;
    };

  //get data for the efficiency chart
    var createChartOptions = function()
    {    $scope.chartOptions = {
      chart: {
        type: 'pieChart',
        height: 500,
        x: function(d){return d.key;},
        y: function(d){return d.y;},
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
    }

  }]);


