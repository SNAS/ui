'use strict';

angular.module('bmpUiApp')
  .controller('AdminViewController', ['$scope', 'apiFactory', function ($scope, apiFactory) {

    var clearIPTimer,clearLocationTimer,resultDisappearTime=3000;

    $scope.geoIPGridOptions = {
      enableColumnResizing: true,
      paginationPageSize: 1000,
      useExternalPagination: true,
      useExternalSorting: true,
      height: 650,
      rowHeight: 32,
      columnDefs: [
        {
          name: "ip_start", displayName: 'IP_START', width: '10%', enableCellEdit: false
        },
        {
          name: "ip_end", displayName: 'IP_END', width: '10%', enableCellEdit: false
        },
        {
          name: "country", displayName: 'Country', width: '10%', enableCellEdit: true
        },
        {
          name: "stateprov", displayName: 'State/Prov', width: '20%', enableCellEdit: true
        },
        {
          name: "city", displayName: 'City', width: '20%', enableCellEdit: true
        },
        {
          name: "latitude", displayName: 'Latitude', width: '10%', enableCellEdit: true
        },
        {
          name: "longitude", displayName: 'Longitude', width: '10%', enableCellEdit: true
        }
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
        $scope.gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
          if (sortColumns.length == 0) {
            GeoIPPaginationOptions.sort = null;
          } else {
            GeoIPPaginationOptions.sort = sortColumns[0];
          }
          getGeoIPPage();
        });
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
          GeoIPPaginationOptions.pageNumber = newPage;
          GeoIPPaginationOptions.pageSize = pageSize;
          getGeoIPPage();
        });
        gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef) {
          apiFactory.updateGeoIP(rowEntity.ip_start, colDef.name, rowEntity[colDef.name]).success(function (affectedRows) {
            $("#IPResult")[0].innerHTML = affectedRows > 0 ? "Commit Successful. " : "Commit Failed. ";
            $("#IPResult").css('color',affectedRows > 0 ? "green" : "red");
            $("#IPResult").show();
            clearTimeout(clearIPTimer);
            clearIPTimer = setTimeout(function () {
              $("#IPResult").hide();
            }, resultDisappearTime);
          });
        })
      }
    };

    var GeoIPPaginationOptions = {
      pageNumber: 1,
      pageSize: 1000,
      sort: null
    };

    apiFactory.getGeoIPCount().success(function (result) {
      $scope.geoIPGridOptions.totalItems = result.table.data[0]['COUNT'];
    });

    var getGeoIPPage = function () {
      apiFactory.getGeoIPList(GeoIPPaginationOptions.pageNumber, GeoIPPaginationOptions.pageSize, GeoIPPaginationOptions.sort).success(function (result) {
        $scope.geoIPGridOptions.data = result.v_geo_ip.data;
      });
    };

    getGeoIPPage();


    $scope.geoLocationGridOptions = {
      enableColumnResizing: true,
      paginationPageSize: 1000,
      useExternalPagination: true,
      useExternalSorting: true,
      height: 650,
      rowHeight: 32,
      columnDefs: [
        {
          name: "country", displayName: 'Country', width: '20%', enableCellEdit: false
        },
        {
          name: "city", displayName: 'City', width: '30%', enableCellEdit: false
        },
        {
          name: "latitude", displayName: 'Latitude', width: '25%', enableCellEdit: true
        },
        {
          name: "longitude", displayName: 'Longitude', width: '25%', enableCellEdit: true
        }
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
        $scope.gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
          if (sortColumns.length == 0) {
            geoLocationPaginationOptions.sort = null;
          } else {
            geoLocationPaginationOptions.sort = sortColumns[0];
          }
          getGeoLocationPage();
        });
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
          geoLocationPaginationOptions.pageNumber = newPage;
          geoLocationPaginationOptions.pageSize = pageSize;
          getGeoLocationPage();
        });
        gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef) {
          apiFactory.updateGeoLocation(rowEntity.country, rowEntity.city, colDef.name, rowEntity[colDef.name]).success(function (affectedRows) {
            $("#LocationResult")[0].innerHTML = affectedRows > 0 ? "Commit Successful. " : "Commit Failed. ";
            $("#LocationResult").css('color', affectedRows > 0 ? "green" : "red");
            $("#LocationResult").show();
            clearTimeout(clearLocationTimer);
            clearLocationTimer = setTimeout(function () {
              $("#LocationResult").hide();
            }, resultDisappearTime);
          });
        })
      }
    };

    var geoLocationPaginationOptions = {
      pageNumber: 1,
      pageSize: 1000,
      sort: null
    };

    apiFactory.getGeoLocationCount().success(function (result) {
      $scope.geoLocationGridOptions.totalItems = result.table.data[0]['COUNT'];
    });

    var getGeoLocationPage = function () {
      apiFactory.getGeoLocationList(geoLocationPaginationOptions.pageNumber, geoLocationPaginationOptions.pageSize, geoLocationPaginationOptions.sort).success(function (result) {
        $scope.geoLocationGridOptions.data = result.geo_location.data;
      });
    };

    getGeoLocationPage();

  }]);





