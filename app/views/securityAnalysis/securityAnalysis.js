'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:SecurityAnalysisController
 * @description
 * # SecurityAnalysisController
 * Controller of the Security Analysis page
 */
angular.module('bmpUiApp')
  .controller('SecurityAnalysisController', ['$scope', 'apiFactory', '$http', '$timeout', function ($scope, apiFactory, $http, $timeout) {

    $scope.securityGridInitHeight = 350;

    $scope.securityGridOptions = {
      rowHeight: 25,
      gridFooterHeight: 15,
      showGridFooter: true,
      height: $scope.securityGridInitHeight,
      enableHorizontalScrollbar: 0,
      enableVerticalScrollbar: 0,
      columnDefs: [
        {name: "prefixWithLen", displayName: 'Prefix/Len', width: '*'},
        //{name: "org_name", displayName: 'Organization', width: '*'},
        {name: "asn1", displayName: 'Origin AS Received', width: '*'},
        //{name: "org_name1", displayName: 'AS Name Learned', width: '*'},
        {name: "asn2", displayName: 'Origin As Registered', width: '*'}
        //{name: "org_name2", displayName: 'AS Name Registered', width: '*'}
      ]
    };

    $timeout(function(){
      $scope.securityIsLoad = false;
    },100);
  }]);
