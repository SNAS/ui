'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:ASAnalysisController
 * @description
 * # ASAnalysisController
 * Controller of the AS Analysis page
 */
angular.module('bmpUiApp')
  .controller('ASAnalysisController',['$scope', 'apiFactory', '$timeout', function ($scope, apiFactory, $timeout) {

    var ipv4yDomain = 0, ipv6yDomain = 0;

    /* Chart options */
    $scope.ipv4Options = {
      chart: {
        type: 'discreteBarChart',
        height: 450,
        margin : {
          top: 20,
          right: 20,
          bottom: 130,
          left: 55
        },
        x: function(d){ return d.label; },
        y: function(d){ return d.value; },
        showValues: true,
        staggerLabels:false,
        color:["#4ec0f1"],
        valueFormat: function(d){
          return d3.format('d')(d);
        },
        transitionDuration: 500,
        xAxis: {
          axisLabel: '',
          rotateLabels:-45
        },
        yAxis: {
          axisLabel: '',
          axisLabelDistance: 30,
          tickFormat:function(d){
            return d/1000+'k';
          }
        },
        yDomain:[0,600000]
      },

      "title": {
        "enable": true,
        "text": "ipv4"
      }
    };

    $scope.ipv6Options = {
      chart: {
        type: 'discreteBarChart',
        height: 450,
        margin : {
          top: 20,
          right: 20,
          bottom: 130,
          left: 55
        },
        x: function(d){ return d.label; },
        y: function(d){ return d.value; },
        showValues: true,
        staggerLabels:false,
        color:["#9ec654"],
        valueFormat: function(d){
          return d3.format('d')(d);
        },
        transitionDuration: 500,
        xAxis: {
          axisLabel: '',
          rotateLabels:-45
        },
        yAxis: {
          axisLabel: '',
          axisLabelDistance: 30,
          tickFormat:d3.format('d')
        },
        yDomain:[0,10]
      },


      "title": {
        "enable": true,
        "text": "ipv6"
      }
    };

    /* Chart data */
    $scope.top_transit_ipv4_data = [];
    $scope.top_transit_ipv6_data = [];
    $scope.top_origin_ipv4_data = [];
    $scope.top_origin_ipv6_data = [];

    getData();

    /* Get the data of charts */
    function getData(){
      apiFactory.getTopTransitIpv4Data().success(
        function(results){
          var processedData = processData(results,"transit_v4_prefixes");
          if(processedData.maxPrefixes > ipv4yDomain){
            ipv4yDomain = processedData.maxPrefixes;
            $scope.ipv4Options.chart.yDomain = [0, ipv4yDomain];
          }
          $scope.top_transit_ipv4_data = processedData.chart_data;
          $scope.ipv4TransitGraphIsLoad = false; // stop loading
        }
      ).
        error(function (error){
          console.log(error.message);
        });

      apiFactory.getTopTransitIpv6Data().success(
        function(results){
          var processedData = processData(results,"transit_v6_prefixes");
          if(processedData.maxPrefixes > ipv6yDomain){
            ipv6yDomain = processedData.maxPrefixes;
            $scope.ipv6Options.chart.yDomain = [0, ipv6yDomain];
          }
          $scope.top_transit_ipv6_data = processedData.chart_data;
          $scope.ipv6TransitGraphIsLoad = false; // stop loading
        }
      ).
        error(function (error){
          console.log(error.message);
        });

      apiFactory.getTopOriginIpv4Data().success(
        function(results){
          var processedData = processData(results,"origin_v4_prefixes");
          if(processedData.maxPrefixes > ipv4yDomain){
            ipv4yDomain = processedData.maxPrefixes;
            $scope.ipv4Options.chart.yDomain = [0, ipv4yDomain];
          }
          $scope.top_origin_ipv4_data = processedData.chart_data;
          $scope.ipv4OriginGraphIsLoad = false; // stop loading
        }
      ).
        error(function (error){
          console.log(error.message);
        });

      apiFactory.getTopOriginIpv6Data().success(
        function(results){
          var processedData = processData(results,"origin_v6_prefixes");
          if(processedData.maxPrefixes > ipv6yDomain){
            ipv6yDomain = processedData.maxPrefixes;
            $scope.ipv6Options.chart.yDomain = [0, ipv6yDomain];
          }
          $scope.top_origin_ipv6_data = processedData.chart_data;
          $scope.ipv6OriginGraphIsLoad = false; // stop loading
        }
      ).
        error(function (error){
          console.log(error.message);
        });

    }

    /* Process the data get from the APIs */
    function processData(results,option){
      var ip = results.s.data;
      var values=[];
      var prefixes;
      var maxPrefixes = 0;

      //create array with amount of prefixes
      for (var i = ip.length-1; i >=0; i--) {

        if(option == "transit_v4_prefixes" ) {
          prefixes = ip[i].transit_v4_prefixes;
        }else if(option == "transit_v6_prefixes" ) {
          prefixes = ip[i].transit_v6_prefixes;
        }else if(option == "origin_v4_prefixes" ) {
          prefixes = ip[i].origin_v4_prefixes;
        }else if(option == "origin_v6_prefixes" ) {
          prefixes = ip[i].origin_v6_prefixes;
        }

        if(prefixes != 0) {
          values.push({
            "label": ip[i].as_name == null? 'NULL' : ip[i].as_name,
            "value": prefixes
          });
        }

        if(prefixes > maxPrefixes){
          maxPrefixes = prefixes;
        }
      }

      var chart_data=[{
        title: "Cumulative Return",
        values: values
      }];

      var result = {
        chart_data: chart_data,
        maxPrefixes: maxPrefixes
      };

      return result;
    }

  }]);
