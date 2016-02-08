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

    var paginationOptions = {
      page: 1,
      pageSize: 1000,
      sort: null,
      desc: null
    };

    var searchOptions = {
      asn: null,
      prefix: null,
      where: null
    };

    $scope.securityGridOptions = {
      rowHeight: 25,
      showGridFooter: true,
      height: $scope.securityGridInitHeight,
      enableHorizontalScrollbar: 0,
      paginationPageSize: paginationOptions.pageSize,
      enablePaginationControls: true,
      useExternalPagination: true,
      useExternalSorting: true,
      columnDefs: [
        {name: "prefixWithLen", displayName: 'Prefix/Len', width: '*', value: "prefix"},
        {name: "recv_origin_as", displayName: 'Recv Origin AS', width: '*'},
        {name: "rpki_origin_as", displayName: "RPKI Origin AS", width: "*"},
        {name: 'irr_origin_as', displayName: 'IRR Origin AS', width: "*"},
        {name: 'irr_source', displayName: "IRR Origin AS", width: "*"}
      ],
      onRegisterApi: function(gridApi) {
        $scope.gridApi = gridApi;
        gridApi.pagination.on.paginationChanged($scope, function(newPage, pageSize) {
          paginationOptions.page = newPage;
          paginationOptions.pageSize = pageSize;
          getMismatchPrefix();
        });

        $scope.gridApi.core.on.sortChanged($scope, function(grid, sortColumns) {
          if (sortColumns.length == 0) {
            paginationOptions.sort = null;
          } else {
            paginationOptions.sort = sortColumns[0].name;
            paginationOptions.desc = (sortColumns[0].sort.direction == 'desc');
          }
          getMismatchPrefix();
        });
      }
    };



    function getMismatchPrefix() {
      $scope.securityIsLoad = true;
      apiFactory.getMisMatchPrefix(paginationOptions.page, paginationOptions.pageSize,
        paginationOptions.sort, paginationOptions.desc, searchOptions.asn, searchOptions.prefix, searchOptions.where)
        .success(function(res) {
          var data = res.gen_prefix_validation.data;
          data.forEach(function(value){
            value.prefixWithLen = value.prefix + '/' + value.prefix_len;
          });
          $scope.securityGridOptions.data = data;
          $scope.securityIsLoad = false;
        })
        .error(function(err){
          console.log(err.message);
        });
      apiFactory.getTotalCount(searchOptions.asn, searchOptions.prefix)
        .success(function(data) {
          if (!$.isEmptyObject(data)) {
            $scope.securityGridOptions.totalItems = data['table']['data'][0]['total'];
          }
        })
        .error(function(err) {
          console.log(err.message);
        });
    }

    $scope.search = function(keyword) {
      $timeout(function(){
        if($.isEmptyObject(keyword)) {
          searchOptions.asn = null;
          searchOptions.prefix = null;
        } else if(keyword.indexOf('.') != -1 || keyword.indexOf(':') != -1) {
          // search for prefix
          searchOptions.prefix = keyword;
        } else if(keyword.toLowerCase().indexOf('where') != -1 ) {
          // where clause
          searchOptions.where = keyword;
        } else if(!isNaN(keyword)) {
          // asn
          searchOptions.asn = keyword;
        }
        getMismatchPrefix();
      }, 800);

    };

    getMismatchPrefix();

  }]);
