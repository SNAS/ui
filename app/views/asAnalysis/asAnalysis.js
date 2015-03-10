'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:AnalysisController
 * @description
 * # AnalysisController
 * Controller of the login page
 */
angular.module('bmpUiApp')
  .controller('ASAnalysisController', function ($scope, $http) {

    /* Chart options */
    $scope.options = {
      chart: {
        type: 'discreteBarChart',
        height: 450,
        margin : {
          top: 20,
          right: 20,
          bottom: 60,
          left: 55
        },
        x: function(d){ return d.label; },
        y: function(d){ return d.value; },
        showValues: true,
        valueFormat: function(d){
          return d3.format(',.4f')(d);
        },
        transitionDuration: 500,
        xAxis: {
          axisLabel: 'X Axis'
        },
        yAxis: {
          axisLabel: 'Y Axis',
          axisLabelDistance: 30
        }
      }
    };

    /* Chart data */
    $scope.transit_ipv4_data = [];

    getData();

    function getData(){
      $http.get('http://demo.openbmp.org:8001/db_rest/v1/as_stats/ipv4?topTransit=5').success(
        function (results){
          var ipv4 = results.s.data;
          var values=[];

          //create array with amount of prefixes
          for (var i = ipv4.length-1; i >=0; i--) {
            var st = "";
            if (typeof ipv4[i].as_name != 'undefined') {
              st += ipv4[i].as_name;
            }
            st += ' (AS' + ipv4[i].asn + ')';
            values.push({
              "label":st,
              "value":ipv4[i].transit_v4_prefixes
            });
          }
          console.log(values);

         $scope.transit_ipv4_data=[{
            key: "Cumulative Return",
            values: values
          }];
        }
      ).
        error(function (error){
          console.log(error.message);
        })
    }

  });
