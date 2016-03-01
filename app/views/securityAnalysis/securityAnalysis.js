'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:SecurityAnalysisController
 * @description
 * # SecurityAnalysisController
 * Controller of the Security Analysis page
 */
angular.module('bmpUiApp')
  .controller('SecurityAnalysisController', ['$scope', 'apiFactory', '$http', '$timeout', 'uiGridConstants', function ($scope, apiFactory, $http, $timeout, uiGridConstants) {

    $scope.securityGridInitHeight = 425;
    $scope.showCard = false;
    $scope.glassGridIsLoad = true;
    $scope.isViolationOn = false;
    $scope.violationOptions = {rpki: null, irr: null};

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
      columnDefs: [
        {name: "prefixWithLen", displayName: 'Prefix/Len', width: '*',
          cellClass: function(grid, row, col){
            if (grid.getCellValue(row, col) != $scope.lastPrefix){
              $scope.lastPrefix = grid.getCellValue(row, col);
              $scope.isGrey = !$scope.isGrey;
            }
            return $scope.isGrey ? 'grey' : '';
          },
          cellTemplate: '<div class="ui-grid-cell-contents" bmp-prefix-tooltip prefix="{{COL_FIELD}}"></div>'
        },
        {name: "recv_origin_as", displayName: 'Recv Origin AS', width: '*', cellClass: 'recv',
          cellTemplate: '<div class="ui-grid-cell-contents" bmp-asn-model asn="{{COL_FIELD}}"></div>'
        },
        {name: "rpki_origin_as", displayName: "RPKI Origin AS", width: "*",  cellClass: 'rpki',
          headerCellClass: function(grid, row, col){
            if ($scope.violationOptions.rpki && $scope.violationOptions.irr) {
              return 'both-header';
            } else if ($scope.violationOptions.rpki) {
              return 'rpki-header';
            } else {
              return '';
            }
          },
          cellTemplate: '<div class="ui-grid-cell-contents" bmp-asn-model asn="{{COL_FIELD}}"></div>'
        },
        {name: 'irr_origin_as', displayName: 'IRR Origin AS', width: "*", cellClass: 'irr',
          headerCellClass: function(grid, row, col) {
            if ($scope.violationOptions.rpki && $scope.violationOptions.irr) {
              return 'both-header';
            } else if ($scope.violationOptions.irr) {
              return 'irr-header';
            } else {
              return '';
            }
          },
          cellTemplate: '<div class="ui-grid-cell-contents" bmp-asn-model asn="{{COL_FIELD}}"></div>'
        },
        {name: 'irr_source', displayName: "IRR Source", width: "*", cellFilter: 'zeroNullFilter', cellClass: 'irr'}
      ],
      onRegisterApi: function(gridApi) {
        $scope.gridApi = gridApi;
        gridApi.pagination.on.paginationChanged($scope, function(newPage, pageSize) {
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
            paginationOptions.desc = (sortColumns[0].sort.direction == 'desc');
          }
          $scope.getMismatchPrefix(paginationOptions);
        });

        gridApi.selection.on.rowSelectionChanged($scope, function(row) {
          $scope.selectedRow = row.entity.prefixWithLen;
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
          cellTemplate: '<div class="ui-grid-cell-contents" bmp-prefix-tooltip prefix="{{ COL_FIELD }}"></div>'
        },
        {name: "Origin_AS", displayName: 'Origin AS', width: "10%",
          cellTemplate: '<div class="ui-grid-cell-contents" bmp-asn-model asn="{{COL_FIELD}}"></div>'
        },
        {name: "PeerName", displayName: 'Peer', width: "20%"},
        {name: "RouterName", displayName: 'Router', width: "15%"},
        {name: "AS_Path", displayName: 'AS Path', width: "*"}
      ]
    };

    $scope.getMismatchPrefix = function(paginationOptions, searchOptions) {
      if (paginationOptions == undefined || paginationOptions == null) {
        paginationOptions = {page: 1, pageSize: 1000};
      }
      if (searchOptions == undefined || searchOptions == null) {
        searchOptions = {asn: null, prefix: null, where: null}
      }
      $scope.lastPrefix = ""; // initialize
      $scope.isGrey = true;
      $scope.securityIsLoad = true;
      $scope.showViolations(searchOptions);
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
    };

    $scope.search = function(keyword) {
      $timeout(function(){
        var searchOptions = {};
        if($.isEmptyObject(keyword)) {

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
        $scope.getMismatchPrefix(null, searchOptions);
      }, 800);
    };

    $("[name='searchBox']").tooltip();

    $("[name='violationCheckbox']").bootstrapSwitch().on("switchChange.bootstrapSwitch", function(){
      $scope.toggleViolation();
    });

    $scope.toggleViolation = function(){
      $scope.isViolationOn = !$scope.isViolationOn;
      $scope.getMismatchPrefix();
    };

    $scope.showViolations = function(searchOptions) {
      if ($scope.violationOptions.rpki == null || $scope.violationOptions.irr == null) {
        searchOptions.where = $scope.isViolationOn ?
          'WHERE (rpki_origin_as IS NOT NULL and recv_origin_as != rpki_origin_as) OR (irr_origin_as IS NOT NULL and irr_origin_as != recv_origin_as)'
          : null;
      } else if ($scope.violationOptions.rpki && $scope.violationOptions.irr) {
        searchOptions.where = $scope.isViolationOn
          ? 'WHERE rpki_origin_as IS NOT null AND irr_origin_as IS NOT NULL AND (rpki_origin_as != recv_origin_as OR recv_origin_as != irr_origin_as)'
          : 'WHERE rpki_origin_as IS NOT null AND irr_origin_as IS NOT NULL';
      } else if ($scope.violationOptions.rpki) {
        searchOptions.where = $scope.isViolationOn
          ? 'WHERE rpki_origin_as IS NOT NULL AND rpki_origin_as != recv_origin_as'
          : 'WHERE rpki_origin_as IS NOT NULL';
      } else if ($scope.violationOptions.irr) {
        searchOptions.where = $scope.isViolationOn
          ? 'WHERE irr_origin_as IS NOT NULL AND irr_origin_as != recv_origin_as'
          : 'WHERE irr_origin_as IS NOT NULL';
      } else {
        searchOptions.where = 'WHERE irr_origin_as IS NULL and rpki_origin_as IS NULL';
      }
    };

    $scope.showAllPrefixes = function() {
      $scope.violationOptions = {rpki: null, irr: null};
      $scope.gridApi.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
      $scope.getMismatchPrefix();
    };

    $scope.getMismatchPrefix(paginationOptions, searchOptions);

  }])
  .filter('zeroNullFilter', function() {
    // display '-' instead of 0
    return function(value) {
      if (value == null || value == 0)
        return '-';
      else
        return value;
    }
  })
  .directive('statsBarChart', ['apiFactory', 'uiGridConstants', function(apiFactory, uiGridConstants){
    function link($scope, element) {
      var margin = 40 ;
      var duration = 500;
      var delay = 500;
      var svgWidth = $(".table-container").width();
      var totalWidth = svgWidth - 2 * margin;

      var tip = d3.tip()
        .offset([-10, 0])
        .attr('class', 'd3-tip');

      function draw(stats) {
        var rpkiInitX = margin;
        var rpkiWidth = totalWidth * stats.rpkiTotal/ stats.total;
        var irrInitX = margin + totalWidth * (1 - stats.neitherTotal / stats.total);
        var irrX = margin + totalWidth * (stats.rpkiTotal - stats.bothTotal) / stats.total;
        var irrWidth = totalWidth * stats.irrTotal / stats.total;
        var neitherInitX = irrInitX;
        var neitherWidth = totalWidth * stats.neitherTotal / stats.total;
        var bothInitX = irrX;
        var bothWidth = totalWidth * ((stats.neitherTotal + stats.irrTotal + stats.rpkiTotal) / stats.total - 1);

        var svg = d3.select(element[0])
          .append("svg")
          .attr('height', 85)
          .call(tip);  // svg height 100

        var rpkiRec = svg
          .append("rect")
          .style("fill", "36DBD4")
          .style("opacity", "0.7")
          .attr("x", rpkiInitX)
          .attr("y", 0)
          .attr("width", 0)
          .attr("height", 60)
          .on('click', function(d, i) {
            var searchOptions = {where: 'WHERE rpki_origin_as IS NOT null AND irr_origin_as IS NULL'};
            $scope.violationOptions = {rpki: true, irr: false};
            $scope.gridApi.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
            $scope.getMismatchPrefix(null, searchOptions);
          })
          .on('mouseover', function(d, i) {
            tip.attr('class', 'd3-tip').html(
              '<span class="rpkiTooltip">Prefixes in DB</span>' + ': ' + stats.total + '<br>' +
              '<span class="rpkiTooltip">Prefixes with RPKI Data</span>' + ': ' + stats.rpkiTotal + "<br>" +
              '<span class="rpkiTooltip">Ratio</span>' + ': ' + (100 * stats.rpkiTotal / stats.total).toFixed(2) + '%'
            ).show();
          })
          .on('mouseout', function(d, i){
            tip.destroy();
          })
          .transition()
          .attr("width", rpkiWidth)
          .duration(duration)
          .delay(delay);

        if (rpkiWidth - bothWidth > 180) {
          svg
            .append('text')
            .attr('x', rpkiInitX + (rpkiWidth - bothWidth) / 2 - 90)
            .attr('y', 35)
            .transition()
            .text('Prefixes with RPKI data: ' + stats.rpkiTotal)
            .delay(delay + duration);
        }

        var irrRec = svg.append('rect')
          .style('fill', 'ffe845')
          .style('opacity', '0.7')
          .attr('x', irrInitX)
          .attr('y', 0)
          .attr('width', 0)
          .attr('height', 60)
          .on('click', function(d, i) {
            var searchOptions = {where: 'WHERE irr_origin_as IS NOT null AND rpki_origin_as IS NULL'};
            $scope.violationOptions = {irr: true, rpki: false};
            $scope.gridApi.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
            $scope.getMismatchPrefix(null, searchOptions);
          })
          .on('mouseover', function(d, i) {
            tip.attr('class', 'd3-tip').html(
              '<span class="irrTooltip">Prefixes in DB</span>' + ': ' + stats.total + '<br>' +
              '<span class="irrTooltip">Prefixes with IRR Data</span>' + ': ' + stats.irrTotal + "<br>" +
              '<span class="irrTooltip">Ratio</span>' + ': ' + (100 * stats.irrTotal / stats.total).toFixed(2) + '%'
            ).show();
          })
          .on('mouseout', function(d, i){
            tip.destroy(d, i);
          })
          .transition()
          .attr('x', irrX)
          .attr('width', irrWidth)
          .duration(duration)
          .delay(delay + duration);

        if (irrWidth - bothWidth > 170) {
          svg
            .append('text')
            .attr('x', bothInitX + bothWidth + (irrWidth - bothWidth) / 2 - 85)
            .attr('y', 35)
            .transition()
            .text('Prefixes with IRR data: ' + stats.irrTotal)
            .delay(delay + duration*2);
        }

        var bothRec = svg.append('rect')
          .style('fill', 'a9d669')
          .attr('x', bothInitX)
          .attr('y', 0)
          .attr('width', 0)
          .attr('height', 60)
          .on('click', function () {
            var searchOptions = {where: 'WHERE rpki_origin_as IS NOT null AND irr_origin_as IS NOT null'};
            $scope.violationOptions = {rpki: true, irr: true};
            $scope.gridApi.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
            $scope.getMismatchPrefix(null, searchOptions);
          })
          .on('mouseover', function(d, i) {
            tip.attr('class', 'd3-tip').html(
              '<span class="bothTooltip">Prefixes in DB</span>' + ': ' + stats.total + '<br>' +
              '<span class="bothTooltip">Prefixes with IRR+RPKI Data</span>' + ': ' + stats.bothTotal + "<br>" +
              '<span class="bothTooltip">Ratio</span>' + ': ' + (100 * stats.bothTotal / stats.total).toFixed(2) + '%'
            ).show();
          })
          .on('mouseout', function(d, i){
            tip.destroy(d, i);
          })
          .transition()
          .attr('width', bothWidth)
          .delay(delay+duration*2)
          .duration(duration);

        if (bothWidth > 220) {
          svg
            .append('text')
            .attr('x', bothInitX + bothWidth / 2 - 110)
            .attr('y', 35)
            .transition()
            .text('Prefixes with IRR and RPKI data: ' + stats.bothTotal)
            .delay(delay + duration*3);
        }

        var neitherRec = svg.append('rect')
          .style('fill', '3F9183')
          .style('opacity', '0.7')
          .attr('x', neitherInitX)
          .attr('y', 0)
          .attr('width', 0)
          .attr('height', 60)
          .on('click', function(d, i) {
            var searchOptions = {where: 'WHERE rpki_origin_as IS null AND irr_origin_as IS null'};
            $scope.violationOptions = {rpki: false, irr: false};
            $scope.gridApi.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
            $scope.getMismatchPrefix(null, searchOptions);
          })
          .on('mouseover', function(d, i) {
            tip.attr('class', 'd3-tip').html(
              '<span class="neitherTooltip">Prefixes in DB</span>' + ': ' + stats.total + '<br>' +
              '<span class="neitherTooltip">Prefixes with no IRR/RPKI Data</span>' + ': ' + stats.neitherTotal + "<br>" +
              '<span class="neitherTooltip">Ratio</span>' + ': ' + (100 * stats.neitherTotal / stats.total).toFixed(2) + '%'
            ).show();
          })
          .on('mouseout', function(d, i){
            tip.destroy(d, i);
          })
          .transition()
          .attr('width', neitherWidth)
          .duration(duration)
          .delay(delay + duration * 3);

        if (neitherWidth > 230) {
          svg
            .append('text')
            .attr('x', neitherInitX + neitherWidth / 2 - 115)
            .attr('y', 35)
            .transition()
            .text('Prefixes with no IRR/RPKI data: ' + stats.neitherTotal)
            .delay(delay + duration*4);
        }

      }

      apiFactory.getStats()
        .success(function(res){
          var data = res.table.data;
          var data = {
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
          draw(data);
        });

    }

    return {
      restrict: 'E',
      link: link
    }
  }]);
