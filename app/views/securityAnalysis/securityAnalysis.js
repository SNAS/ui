'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:SecurityAnalysisController
 * @description
 * # SecurityAnalysisController
 * Controller of the Security Analysis page
 */
angular.module('bmpUiApp')
  .controller('SecurityAnalysisController', ['$scope', 'apiFactory', '$http',
    '$timeout', 'uiGridConstants',
    function($scope, apiFactory, $http, $timeout, uiGridConstants) {

      $scope.securityGridInitHeight = 425;
      $scope.showCard = false;
      $scope.glassGridIsLoad = true;

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

      var rowTemplate =
        ' \
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
        if (row.entity.rpki_origin_as != 0 && row.entity.rpki_origin_as !=
          null && row.entity.recv_origin_as != row.entity.rpki_origin_as) {
          isViolation = 'rpki-vio';
        } else if (row.entity.irr_origin_as != 0 && row.entity.irr_origin_as !=
          null && row.entity.recv_origin_as != row.entity.irr_origin_as) {
          isViolation = 'irr-vio';
        }
        return isViolation;
      };


      $scope.securityGridOptions = {
        rowHeight: 25,
        showGridFooter: true,
        height: $scope.securityGridInitHeight,
        enableHorizontalScrollbar: 0,
        paginationPageSize: 1000,
        paginationPageSizes: [1000, 2000, 3000],
        enablePaginationControls: true,
        useExternalPagination: true,
        useExternalSorting: true,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        enableFiltering: true,
        multiSelect: false,
        rowTemplate: rowTemplate,
        columnDefs: [{
          name: "prefixWithLen",
          displayName: 'Prefix/Len',
          width: '*',
          cellClass: function(grid, row, col) {
            if (grid.getCellValue(row, col) != $scope.lastPrefix) {
              $scope.lastPrefix = grid.getCellValue(row, col);
              $scope.isGrey = !$scope.isGrey;
            }
            return $scope.isGrey ? 'grey' : '';
          },
          cellTemplate: '<div class="ui-grid-cell-contents" bmp-prefix-tooltip prefix="{{COL_FIELD}}"></div>'
        }, {
          name: "recv_origin_as",
          displayName: 'Recv Origin AS',
          width: '*',
          cellClass: 'recv',
          cellTemplate: '<div class="ui-grid-cell-contents" bmp-asn-model asn="{{COL_FIELD}}"></div>'
        }, {
          name: "rpki_origin_as",
          displayName: "RPKI Origin AS",
          width: "*",
          cellClass: 'rpki',
          cellTemplate: '<div class="ui-grid-cell-contents" bmp-asn-model asn="{{COL_FIELD}}"></div>'
        }, {
          name: 'irr_origin_as',
          displayName: 'IRR Origin AS',
          width: "*",
          cellClass: 'irr',
          cellTemplate: '<div class="ui-grid-cell-contents" bmp-asn-model asn="{{COL_FIELD}}"></div>'
        }, {
          name: 'irr_source',
          displayName: "IRR Source",
          width: "*",
          cellFilter: 'zeroNullFilter',
          cellClass: 'irr'
        }],
        onRegisterApi: function(gridApi) {
          $scope.gridApi = gridApi;
          gridApi.pagination.on.paginationChanged($scope, function(
            newPage, pageSize) {
            var paginationOptions = {
              page: newPage,
              pageSize: pageSize
            };
            $scope.getMismatchPrefix(paginationOptions);
          });

          gridApi.core.on.sortChanged($scope, function(grid, sortColumns) {
            var paginationOptions = {};
            if (sortColumns.length == 0) {
              paginationOptions.sort = null;
            } else {
              paginationOptions.sort = sortColumns[0].name;
              paginationOptions.desc = (sortColumns[0].sort.direction ==
                'desc');
            }
            $scope.getMismatchPrefix(paginationOptions);
          });

          gridApi.selection.on.rowSelectionChanged($scope, function(row) {
            $scope.selectedRow = row.entity.prefixWithLen;
            apiFactory.getPrefix(row.entity.prefixWithLen)
              .success(function(res) {
                $scope.showCard = true;
                var resultData = res.v_all_routes.data;
                for (var i = 0; i < resultData.length; i++) {
                  resultData[i].wholePrefix = resultData[i].Prefix +
                    "/" + resultData[i].PrefixLen;
                }
                $scope.glassGridOptions.data = resultData;
                $scope.glassGridIsLoad = false;
              });
            if (!$scope.noMoreBTN) {
              $('#more-button').show()
                .click(function(e) {
                  $scope.noMoreBTN = true;
                  $('html, body').animate({
                    scrollTop: $('#prefix-ad').offset().top + $("#prefix-ad").outerHeight() - $(window).height()
                  }, '500');
                  $(this).hide();
                })
            }
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
        columnDefs: [{
          name: "wholePrefix",
          displayName: 'Prefix',
          width: "10%",
          cellTemplate: '<div class="ui-grid-cell-contents" bmp-prefix-tooltip prefix="{{ COL_FIELD }}"></div>'
        }, {
          name: "Origin_AS",
          displayName: 'Origin AS',
          width: "10%",
          cellTemplate: '<div class="ui-grid-cell-contents" bmp-asn-model asn="{{COL_FIELD}}"></div>'
        }, {
          name: "PeerName",
          displayName: 'Peer',
          width: "20%"
        }, {
          name: "RouterName",
          displayName: 'Router',
          width: "15%"
        }, {
          name: "AS_Path",
          displayName: 'AS Path',
          width: "*"
        }]
      };

      $scope.getMismatchPrefix = function(paginationOptions, searchOptions) {
        if (paginationOptions == undefined || paginationOptions == null) {
          paginationOptions = {
            page: 1,
            pageSize: 1000
          };
        }
        if (!paginationOptions.page) {
          paginationOptions.page = 1;
          paginationOptions.pageSize = 1000;
        }
        if (searchOptions == undefined || searchOptions == null) {
          searchOptions = {
            asn: null,
            prefix: null,
            where: null
          }
        }
        $scope.lastPrefix = ""; // initialize
        $scope.isGrey = true;
        $scope.securityIsLoad = true;
        apiFactory.getMisMatchPrefix(paginationOptions.page,
            paginationOptions.pageSize,
            paginationOptions.sort, paginationOptions.desc, searchOptions.asn,
            searchOptions.prefix, searchOptions.where)
          .success(function(res) {
            var data = res.gen_prefix_validation.data;
            data.forEach(function(value) {
              value.prefixWithLen = value.prefix + '/' + value.prefix_len;
              value.prefixClass = value.prefix.replace(/\./g, '-') +
                '-' + value.prefix_len;
            });
            $scope.securityGridOptions.data = data;
            $scope.securityIsLoad = false;
            // jump to first page
            if ($scope.gridApi.pagination.getPage() > $scope.securityGridOptions
              .totalItems / paginationOptions.pageSize + 1)
              $scope.gridApi.pagination.seek(1);
          })
          .error(function(err) {
            console.log(err.message);
          });
        apiFactory.getTotalCount(searchOptions.asn, searchOptions.prefix,
            searchOptions.where)
          .success(function(data) {
            if (!$.isEmptyObject(data)) {
              $scope.securityGridOptions.totalItems = data['table'][
                'data'
              ][0]['total'];
            }
          })
          .error(function(err) {
            console.log(err.message);
          });
      };

      $scope.search = function(keyword) {
        $timeout(function() {
          var searchOptions = {};
          if ($.isEmptyObject(keyword)) {

          } else if (keyword.indexOf('.') != -1 || keyword.indexOf(':') !=
            -1) {
            // search for prefix
            searchOptions.prefix = keyword;
          } else if (keyword.toLowerCase().indexOf('where') != -1) {
            // where clause
            searchOptions.where = keyword;
          } else if (!isNaN(keyword)) {
            // asn
            searchOptions.asn = keyword;
          }
          $scope.getMismatchPrefix(null, searchOptions);
        }, 800);
      };

      $("[name='searchBox']").tooltip();

      $scope.getMismatchPrefix(paginationOptions, searchOptions);

    }
  ])
  .filter('zeroNullFilter', function() {
    // display '-' instead of 0
    return function(value) {
      if (value == null || value == 0)
        return '-';
      else
        return value;
    }
  })
  .directive('statsBarChart', ['apiFactory', 'uiGridConstants', function(
    apiFactory, uiGridConstants) {

    function link($scope, element) {

      var div = d3.select(element[0])
        .append("div")
        .attr('id', 'highchart')
        .style('position', 'relative')
        .style('margin', '0 40px');

      apiFactory.getStats()
        .success(function(res) {
          var data = res.table.data;
          var data_dict = {
            total: data[0].total,
            rpkiTotal: data[1].total,
            irrTotal: data[2].total,
            neitherTotal: data[3].total,
            bothTotal: data[4].total,
            totalVio: data[5].total,
            rpkiVio: data[6].total,
            irrVio: data[7].total,
            bothVio: data[8].total
          };

          $('#highchart').highcharts({
            chart: {
              type: 'pie',
              events: {
                drillup: function() {
                  $scope.securityGridOptions.columnDefs[2].headerCellClass =
                    '';
                  $scope.securityGridOptions.columnDefs[3].headerCellClass =
                    '';
                  $scope.getMismatchPrefix(null, {
                    where: ''
                  });
                  $scope.gridApi.core.notifyDataChange(
                    uiGridConstants.dataChange.COLUMN);
                }
              }
            },
            exporting: {
              enabled: false
            },
            title: {
              text: 'Prefixes Distribution'
            },
            subtitle: {
              text: 'Click the slices to view violations.'
            },
            plotOptions: {
              series: {
                dataLabels: {
                  enabled: true,
                  format: '{point.name}: {point.y} ({point.ratio:.2f}%)'
                },
                cursor: 'pointer',
                events: {
                  click: function(event) {
                    switch (event.point.id) {
                      case 'rpki':
                        $scope.securityGridOptions.columnDefs[3].headerCellClass =
                          '';
                        $scope.securityGridOptions.columnDefs[2].headerCellClass =
                          'rpki-header';
                        break;
                      case 'rpki-con':
                        $scope.securityGridOptions.columnDefs[3].headerCellClass =
                          '';
                        $scope.securityGridOptions.columnDefs[2].headerCellClass =
                          'rpki-con-header';
                        break;
                      case 'rpki-vio':
                        $scope.securityGridOptions.columnDefs[3].headerCellClass =
                          '';
                        $scope.securityGridOptions.columnDefs[2].headerCellClass =
                          'rpki-vio-header';
                        break;
                      case 'irr':
                        $scope.securityGridOptions.columnDefs[2].headerCellClass =
                          '';
                        $scope.securityGridOptions.columnDefs[3].headerCellClass =
                          'irr-header';
                        break;
                      case 'irr-con':
                        $scope.securityGridOptions.columnDefs[2].headerCellClass =
                          '';
                        $scope.securityGridOptions.columnDefs[3].headerCellClass =
                          'irr-con-header';
                        break;
                      case 'irr-vio':
                        $scope.securityGridOptions.columnDefs[2].headerCellClass =
                          '';
                        $scope.securityGridOptions.columnDefs[3].headerCellClass =
                          'irr-vio-header';
                        break;
                      case 'both':
                        $scope.securityGridOptions.columnDefs[2].headerCellClass =
                          'both-header';
                        $scope.securityGridOptions.columnDefs[3].headerCellClass =
                          'both-header';
                        break;
                      case 'both-con':
                        $scope.securityGridOptions.columnDefs[2].headerCellClass =
                          'both-con-header';
                        $scope.securityGridOptions.columnDefs[3].headerCellClass =
                          'both-con-header';
                        break;
                      case 'both-vio':
                        $scope.securityGridOptions.columnDefs[2].headerCellClass =
                          'both-vio-header';
                        $scope.securityGridOptions.columnDefs[3].headerCellClass =
                          'both-vio-header';
                        break;
                    }
                    var searchOptions = {
                      where: event.point.searchOption
                    };
                    $scope.getMismatchPrefix(null, searchOptions);
                    $scope.gridApi.core.notifyDataChange(
                      uiGridConstants.dataChange.COLUMN);
                  }
                }
              }
            },
            tooltip: {
              headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
              pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y} ({point.ratio:.2f}%)</b> <br/>'
            },
            colors: ["#058DC7", "#ED561B", "#50B432", "#492970"],
            series: [{
              name: 'Prefixes in database: ' + data_dict.total,
              colorByPoint: true,
              data: [{
                name: 'Prefixes with RPKI data',
                id: 'rpki',
                y: data_dict.rpkiTotal,
                ratio: 100 * data_dict.rpkiTotal / data_dict.total,
                drilldown: 'RPKI',
                searchOption: 'WHERE rpki_origin_as IS NOT null AND irr_origin_as IS NULL'
              }, {
                name: 'Prefixes with both RPKI and IRR data',
                id: 'both',
                y: data_dict.bothTotal,
                ratio: 100 * data_dict.bothTotal / data_dict.total,
                drilldown: 'BOTH',
                searchOption: 'WHERE rpki_origin_as IS NOT null AND irr_origin_as IS NOT NULL'
              }, {
                name: 'Prefixes with IRR data',
                id: 'irr',
                y: data_dict.irrTotal,
                ratio: 100 * data_dict.irrTotal / data_dict.total,
                drilldown: 'IRR',
                searchOption: 'WHERE rpki_origin_as IS null AND irr_origin_as IS NOT NULL'
              }, {
                name: 'Prefixes with no PRKI/IRR data',
                id: 'neither',
                y: data_dict.neitherTotal,
                ratio: 100 * data_dict.neitherTotal /
                  data_dict.total,
                drilldown: null,
                searchOption: 'WHERE rpki_origin_as IS null AND irr_origin_as IS NULL'
              }]
            }],
            drilldown: {
              series: [{
                name: 'Prefixes with RPKI data: ' + data_dict.rpkiTotal,
                id: 'RPKI',
                data: [{
                  name: 'Violations',
                  id: 'rpki-vio',
                  y: data_dict.rpkiVio,
                  ratio: 100 * data_dict.rpkiVio / data_dict.rpkiTotal,
                  searchOption: 'WHERE rpki_origin_as IS NOT NULL and irr_origin_as IS NULL and recv_origin_as != rpki_origin_as',
                  color: '#c42525'
                }, {
                  name: 'Consistent',
                  id: 'rpki-con',
                  y: data_dict.rpkiTotal - data_dict.rpkiVio,
                  ratio: 100 * (data_dict.rpkiTotal -
                    data_dict.rpkiVio) / data_dict.rpkiTotal,
                  searchOption: 'WHERE rpki_origin_as IS NOT NULL and irr_origin_as IS NULL and recv_origin_as = rpki_origin_as',
                  color: "#24CBE5"
                }]
              }, {
                name: 'Prefixes with both RPKI and IRR data: ' +
                  data_dict.bothTotal,
                id: 'BOTH',
                data: [{
                  name: 'Violations',
                  id: 'both-vio',
                  y: data_dict.bothVio,
                  ratio: 100 * data_dict.bothVio / data_dict.bothTotal,
                  searchOption: 'WHERE rpki_origin_as IS NOT NULL and irr_origin_as IS NOT NULL and (recv_origin_as != rpki_origin_as OR recv_origin_as != irr_origin_as)',
                  color: '#c42525'
                }, {
                  name: 'Consistent',
                  id: 'both-con',
                  y: data_dict.bothTotal - data_dict.bothVio,
                  ratio: 100 * (data_dict.bothTotal -
                    data_dict.bothVio) / data_dict.bothTotal,
                  searchOption: 'WHERE rpki_origin_as IS NOT NULL and irr_origin_as IS NOT NULL and (recv_origin_as = rpki_origin_as OR recv_origin_as = irr_origin_as)',
                  color: "#FF9655"
                }]
              }, {
                name: 'Prefixes with IRR data: ' + data_dict.irrTotal,
                id: 'IRR',
                data: [{
                  name: 'Violations',
                  id: 'irr-vio',
                  y: data_dict.irrVio,
                  ratio: 100 * data_dict.irrVio / data_dict.irrTotal,
                  searchOption: 'WHERE rpki_origin_as IS NULL and irr_origin_as IS NOT NULL and irr_origin_as != recv_origin_as',
                  color: '#c42525'
                }, {
                  name: 'Consistent',
                  id: 'irr-con',
                  y: data_dict.irrTotal - data_dict.irrVio,
                  ratio: 100 * (data_dict.irrTotal -
                    data_dict.irrVio) / data_dict.irrTotal,
                  searchOption: 'WHERE rpki_origin_as IS NULL and irr_origin_as IS NOT NULL and irr_origin_as = recv_origin_as',
                  color: "#64E572"
                }]
              }]
            }
          });
        }); // end of apiFactory

    }
    return {
      restrict: 'E',
      link: link
    }
  }]);
