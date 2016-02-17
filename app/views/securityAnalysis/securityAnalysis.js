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
    $scope.showCard = false;
    $scope.glassGridIsLoad = true;
    $scope.isViolationOn = false;
    $scope.violationOptions = {rpki: true, irr: true};
    $scope.filterOptions = {rpki: false, irr: false, incomplete: false};

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

    var rowTemplate = ' \
    <div class="tableRow" \
      ng-class="grid.appScope.gridRowClass(row)">  \
      <div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell> \
      </div> \
    </div> \
    ';

    $scope.lastPrefix = "";
    $scope.isGrey = true;
    // calculate row class, add 'red' if it's violation
    $scope.gridRowClass = function(row) {
      // mark violation prefix as red
      var isViolation = '';
      if (row.entity.rpki_origin_as != 0
        && row.entity.rpki_origin_as != null
        && row.entity.recv_origin_as != row.entity.rpki_origin_as) {
        isViolation = 'rpki-vio';
      } else if (row.entity.irr_origin_as !=0
        && row.entity.irr_origin_as != null
        && row.entity.recv_origin_as != row.entity.irr_origin_as) {
        isViolation = 'irr-vio';
      }
      return isViolation;
    };


    $scope.securityGridOptions = {
      rowHeight: 25,
      showGridFooter: true,
      height: $scope.securityGridInitHeight,
      enableHorizontalScrollbar: 0,
      paginationPageSize: paginationOptions.pageSize,
      paginationPageSizes: [1000, 2000, 3000],
      enablePaginationControls: true,
      useExternalPagination: true,
      useExternalSorting: true,
      enableRowSelection: true,
      enableRowHeaderSelection: false,
      enableFiltering: true,
      multiSelect: false,
      rowTemplate: rowTemplate,
      columnDefs: [
        {name: "prefixWithLen", displayName: 'Prefix/Len', width: '*',
          cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex){
            if (grid.getCellValue(row, col) != $scope.lastPrefix){
              $scope.lastPrefix = grid.getCellValue(row, col);
              $scope.isGrey = !$scope.isGrey;
            }
            return $scope.isGrey ? 'grey' : '';
          }
        },
        {name: "recv_origin_as", displayName: 'Recv Origin AS', width: '*', cellFilter: 'zeroNullFilter', cellClass: 'recv'},
        {name: "rpki_origin_as", displayName: "RPKI Origin AS", width: "*", cellFilter: 'zeroNullFilter', cellClass: 'rpki'},
        {name: 'irr_origin_as', displayName: 'IRR Origin AS', width: "*", cellFilter: 'zeroNullFilter', cellClass: 'irr'},
        {name: 'irr_source', displayName: "IRR Source", width: "*", cellFilter: 'zeroNullFilter', cellClass: 'irr'}
      ],
      onRegisterApi: function(gridApi) {
        $scope.gridApi = gridApi;
        gridApi.pagination.on.paginationChanged($scope, function(newPage, pageSize) {
          paginationOptions.page = newPage;
          paginationOptions.pageSize = pageSize;
          getMismatchPrefix();
        });

        gridApi.core.on.sortChanged($scope, function(grid, sortColumns) {
          if (sortColumns.length == 0) {
            paginationOptions.sort = null;
          } else {
            paginationOptions.sort = sortColumns[0].name;
            paginationOptions.desc = (sortColumns[0].sort.direction == 'desc');
          }
          getMismatchPrefix();
        });

        gridApi.selection.on.rowSelectionChanged($scope, function(row) {
          apiFactory.getPrefix(row.entity.prefixWithLen)
          .success(function(res){
            $scope.showCard = true;
            var resultData = res.v_routes.data;
            for(var i = 0; i < resultData.length; i++) {
              resultData[i].wholePrefix = resultData[i].Prefix + "/" + resultData[i].PrefixLen;
            }
            $scope.glassGridOptions.data = resultData;
            $scope.glassGridIsLoad = false;
          });
        });
      }
    };

    $scope.glassGridOptions = {
      height: 300,
      showGridFooter: true,
      enableFiltering: true,
      enableRowSelection: true,
      enableRowHeaderSelection: false,
      enableVerticalScrollbar: 1,
      enableHorizontalScrollbar: 0,
      multiSelect: false,
      columnDefs: [
        {name: "wholePrefix", displayName: 'Prefix', width: "10%",
          cellTemplate: '<div class="ui-grid-cell-contents prefix-clickable"><div bmp-prefix-model prefix="{{ COL_FIELD }}"></div></div>'
        },
        {name: "Origin_AS", displayName: 'Origin AS', width: "10%"},
        {name: "RouterName", displayName: 'Router', width: "15%"},
        {name: "PeerName", displayName: 'Peer', width: "20%"},
        {name: "AS_Path", displayName: 'AS Path', width: "*"}
      ]
    };

    function getMismatchPrefix() {
      $scope.lastPrefix = ""; // initialize
      $scope.isGrey = true;
      $scope.securityIsLoad = true;
      apiFactory.getMisMatchPrefix(paginationOptions.page, paginationOptions.pageSize,
        paginationOptions.sort, paginationOptions.desc, searchOptions.asn, searchOptions.prefix, searchOptions.where)
        .success(function(res) {
          var data = res.gen_prefix_validation.data;
          data.forEach(function(value){
            value.prefixWithLen = value.prefix + '/' + value.prefix_len;
            value.prefixClass = value.prefix.replace(/\./g, '-') + '-' + value.prefix_len;
          });
          $scope.securityGridOptions.data = data;
          $scope.securityIsLoad = false;
          // jump to first page
          if ($scope.gridApi.pagination.getPage() > $scope.securityGridOptions.totalItems / paginationOptions.pageSize + 1)
            $scope.gridApi.pagination.seek(1);
        })
        .error(function(err){
          console.log(err.message);
        });
      apiFactory.getTotalCount(searchOptions.asn, searchOptions.prefix, searchOptions.where)
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
      // initial clean
      searchOptions.asn = null;
      searchOptions.prefix = null;
      searchOptions.where = null;
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

    $scope.getAllMismatch = function(){
      $scope.isViolationOn = !$scope.isViolationOn;
      if ($scope.isViolationOn) {
        if ($scope.violationOptions.rpki && $scope.violationOptions.irr) {
          searchOptions.where = 'WHERE (irr_origin_as IS NOT NULL and irr_origin_as != recv_origin_as) or (rpki_origin_as IS NOT null and rpki_origin_as != recv_origin_as)';
        } else if ($scope.violationOptions.rpki) {
          searchOptions.where = 'WHERE rpki_origin_as IS NOT null and rpki_origin_as != recv_origin_as';
        } else if ($scope.violationOptions.irr) {
          searchOptions.where = 'WHERE irr_origin_as IS NOT NULL and irr_origin_as != recv_origin_as';
        }
      } else {
        searchOptions.where = null;
      }
      getMismatchPrefix();
    };

    $scope.getRpki = function() {
      $scope.filterOptions.rpki = !$scope.filterOptions.rpki;
      if ($scope.filterOptions.rpki)
        searchOptions.where = 'WHERE rpki_origin_as IS NOT null';
      else
        searchOptions.where = null;
      getMismatchPrefix();
    };

    $scope.getIrr = function() {
      $scope.filterOptions.irr = !$scope.filterOptions.irr;
      if ($scope.filterOptions.irr)
        searchOptions.where = 'WHERE irr_origin_as IS NOT null';
      else
        searchOptions.where = null;
      getMismatchPrefix();
    };

    $scope.getIncomplete = function() {
      $scope.filterOptions.incomplete = !$scope.filterOptions.incomplete;
      if ($scope.filterOptions.incomplete)
        searchOptions.where = 'WHERE rpki_origin_as IS null or irr_origin_as IS null';
      else
        searchOptions.where = null;
      getMismatchPrefix();
    };

    getMismatchPrefix();

  }])
  .filter('zeroNullFilter', function() {
    // display '-' instead of 0
    return function(value) {
      if (value == null || value == 0)
        return '-';
      else
        return value;
    }
  });
