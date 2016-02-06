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
      gridFooterHeight: 0,
      showGridFooter: true,
      height: $scope.securityGridInitHeight,
      enableHorizontalScrollbar: 0,
      enableVerticalScrollbar: 0,
      columnDefs: [
        {name: "prefixWithLen", displayName: 'Prefix/Len', width: '*'},
        {name: "recv_origin_as", displayName: 'Recv Origin AS', width: '*'},
        {name: "rpki_origin_as", displayName: "RPKI Origin AS", width: "*"},
        {name: 'irr_origin_as', displayName: 'IRR Origin AS', width: "*"},
        {name: 'irr_source', displayName: "IRR Origin AS", width: "*"}
      ]
    };

    $timeout(function(){
      $scope.securityIsLoad = false;
    },100);
  }]);
