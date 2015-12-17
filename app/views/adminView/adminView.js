'use strict';

angular.module('bmpUiApp')
  .controller('AdminViewController', ['$scope', 'apiFactory', function ($scope, apiFactory) {

    var timer, resultDisappearTime = 2500;

    function showResult(affectedRows, type) {
      $("#" + type + "Result")[0].innerHTML = affectedRows > 0 ? "Commit Successful. " : "Commit Failed. ";
      $("#" + type + "Result").css('color', affectedRows > 0 ? "green" : "red");
      $("#" + type + "Result").show();
      clearTimeout(timer);
      timer = setTimeout(function () {
        $("#" + type + "Result").hide();
      }, resultDisappearTime);
    }

    $scope.geoIPGridOptions = {
      enableColumnResizing: true,
      paginationPageSize: 1000,
      useExternalPagination: true,
      useExternalSorting: true,
      enableRowSelection: true,
      enableRowHeaderSelection: false,
      multiSelect: false,
      rowHeight: 32,
      columnDefs: [
        {
          name: "ip_start", displayName: 'IP_START', width: '15%', enableCellEdit: false
        },
        {
          name: "ip_end", displayName: 'IP_END', width: '15%', enableCellEdit: false
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
        $scope.IPGridApi = gridApi;
        gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
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
            showResult(affectedRows, 'IP');
          });
        });
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
      enableRowSelection: true,
      multiSelect: false,
      enableRowHeaderSelection: false,
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
        $scope.locationGridApi = gridApi;
        gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
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
            showResult(affectedRows, 'Location');
          });
        });
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

    $scope.showGeoLocation = function () {
      getGeoLocationPage();
    };

    $scope.readyModal = function (type, action) {
      switch (type) {
        case 'IP':
          switch (action) {
            case 'import':
              var fieldArray = [], typeArray = [];
              $('#modal-title')[0].innerText = "Import GeoLocation data file";
              $('#modal-body')[0].innerHTML = "<h3><span class='label label-danger col-sm-12' style='margin-bottom:20px'>Warning: uppon import, the original data will be erased</span></h3> \
              <form id='ipForm' class='form-horizontal' role='form' enctype='multipart/form-data' method='post'> \
                <div class='form-group'> \
                  <div class='input-group col-lg-8 col-lg-offset-2'> \
                  <span class='btn btn-primary btn-file input-group-addon'> \
                    Browse<input type='file' name='file' id='file'/>\
                  </span> \
                  <input type='text' class='form-control' id='file-indicator' readonly> \
                  </div> \
                </div> \
                <div id='delimiterDiv' class='form-group'> \
                <label class='control-label col-sm-2' for='delimiter'>Delimiter:</label> \
              <div class='col-sm-10'> \
                <input type='text' class='form-control' id='delimiter' name='delimiter'> \
                </div> \
                </div> \
                <h3><span class='label label-warning col-sm-12' style='margin-bottom:20px'>Please input order of fields</span></h3> \
                <div id='columnDef'></div> \
              </form>";
              apiFactory.describeGeoIP().success(function (result) {
                angular.forEach(result.COLUMNS.data, function (column) {
                  fieldArray.push(column.Field);
                  typeArray.push(column.Type);
                  $('#columnDef').append("<div class='form-group'> \
              <label class='control-label col-sm-7'>" + (column.Null == "NO" ? "Required field " : "Field ") + "\'" + column.Field + "\'(" +column.Type + ") is column:" + "</label> \
              <div class='col-sm-5'> \
                <input type='text' class='form-control' id='" + column.Field + "' placeholder='Starting from 0'> \
                </div> \
              </div>");
                });
              });
              $('#save-button')[0].innerText = "Save Changes";
              $('#save-button').on('click', function () {
                var indexArray = [];

                angular.forEach($('#columnDef input'), function (dom) {
                  var value = parseInt(dom.value);
                  if (value > -1)
                    indexArray.push(value);
                  else
                    indexArray.push(-1);
                });

                var formData = new FormData();

                formData.append("file", $('#file')[0].files[0]);
                formData.append("indexes", indexArray);
                formData.append("fields", fieldArray);
                formData.append("types", typeArray);
                formData.append("delimiter", $('#delimiter').val());

                $('#modal-body').append("<h4>Working... You'll get your result or exception below.</h4><h5>This could take long, so go somewhere else or go make a coffee :)</h5>");
                apiFactory.importGeoIPFromFile(formData).success(function (result) {
                  $('#modal-body').append("<p>" + result + "</p>");
                })
              });
              $('#file').on('change', function () {
                var input = $(this),
                  label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
                $('#file-indicator').val(label);
                switch (label.split('.')[1]) {
                  case 'txt':
                    $('#delimiterDiv').show();
                    break;
                  default:
                    $('#delimiterDiv').hide();
                    break;
                }
              });
              break;
            case 'delete':
              var row = $scope.IPGridApi.selection.getSelectedRows()[0];
              $('#modal-title')[0].innerText = row ? "Delete GeoIP row" : "No row selected";
              $('#modal-body')[0].innerHTML = row ? "<p>Are you sure?</p>" : "Please select a row first";
              if (!row)
                $('#save-button').hide();
              else {
                $('#save-button').show();
                $('#save-button')[0].innerText = "Confirm";
                $('#save-button').on('click', function () {
                  apiFactory.deleteGeoIP(row.ip_start).success(function (affectedRows) {
                    showResult(affectedRows, 'IP');
                    getGeoIPPage();
                  })
                });
                $('#myModal').modal('hide');
              }
              break;
            case 'insert':
              $('#modal-title')[0].innerText = "Insert GeoIP data";
              var timezoneSelectHTML = "<select class='form-control' id='timezone'>";
              angular.forEach(timezones, function (timezone) {
                timezoneSelectHTML += "<option value='" + timezone.Name + "|" + timezone.Offset + "'>" + timezone.DisplayName + "</option>";
              });
              timezoneSelectHTML += "</select>";
              $('#modal-body')[0].innerHTML = "<form id='ipForm' class='form-horizontal' role='form'> \
              <div class='form-group'> \
              <label class='control-label col-sm-4' for='ip_start'>IP_START:</label> \
              <div class='col-sm-8'> \
                <input type='text' class='form-control' id='ip_start' name='ip_start' placeholder='IP Address'> \
                </div> \
                </div> \
                <div class='form-group'> \
                <label class='control-label col-sm-4' for='ip_end'>IP_END:</label> \
              <div class='col-sm-8'> \
                <input type='text' class='form-control' id='ip_end' name='ip_end' placeholder='IP Address'> \
                </div> \
                </div> \
                <div class='form-group'> \
                <label class='control-label col-sm-4' for='country'>Country:</label> \
              <div class='col-sm-8'> \
                <input type='text' class='form-control' id='country' name='country' placeholder='Country Code'> \
                </div> \
                </div> \
                <div class='form-group'> \
                <label class='control-label col-sm-4' for='stateprov'>State/Prov:</label> \
              <div class='col-sm-8'> \
                <input type='text' class='form-control' id='stateprov' name='stateprov' placeholder='State/Province...'> \
                </div> \
                </div> \
                <div class='form-group'> \
                <label class='control-label col-sm-4' for='city'>City:</label> \
              <div class='col-sm-8'> \
                <input type='text' class='form-control' id='city' name='city' placeholder='City...'> \
                </div> \
                </div> \
                <div class='form-group'> \
                <label class='control-label col-sm-4' for='latitude'>Latitude:</label> \
              <div class='col-sm-8'> \
                <input type='text' class='form-control' id='latitude' name='latitude' placeholder='Latitude'> \
                </div> \
                </div> \
                <div class='form-group'> \
                <label class='control-label col-sm-4' for='longitude'>Longitude:</label> \
              <div class='col-sm-8'> \
                <input type='text' class='form-control' id='longitude' name='longitude' placeholder='Longitude'> \
                </div> \
                </div> \
                <div class='form-group'> \
                <label class='control-label col-sm-4' for='timezone_offset'>Timezone:</label> \
              <div class='col-sm-8'>"
                + timezoneSelectHTML +
                "</div> \
                </div> \
                <div class='form-group'> \
                <label class='control-label col-sm-4' for='isp_name'>ISP_Name:</label> \
              <div class='col-sm-8'> \
                <input type='text' class='form-control' id='isp_name' name='isp_name' placeholder='isp_name'> \
                </div> \
                </div> \
              </form>";
              $('#save-button')[0].innerText = "Save Changes";
              $('#save-button').on('click', function () {
                var suffix = $('#ipForm').serialize();
                var timezoneValue = $('#timezone').val().split('|');
                suffix += "&timezone_name=" + timezoneValue[0] + "&timezone_offset=" + timezoneValue[1];
                apiFactory.insertGeoIP(suffix).success(function (result) {
                  showResult(result, 'IP');
                  getGeoIPPage();
                });
                $('#myModal').modal('hide');
              });
              break;
          }
          break;
        case 'location':
          switch (action) {
            case 'import':
              var fieldArray = [], typeArray = [];
              $('#modal-title')[0].innerText = "Import GeoLocation data file";
              $('#modal-body')[0].innerHTML = "<h3><span class='label label-danger col-sm-12' style='margin-bottom:20px'>Warning: uppon import, the original data will be erased</span></h3> \
              <form id='ipForm' class='form-horizontal' role='form' enctype='multipart/form-data' method='post'> \
                <div class='form-group'> \
                  <div class='input-group col-lg-8 col-lg-offset-2'> \
                  <span class='btn btn-primary btn-file input-group-addon'> \
                    Browse<input type='file' name='file' id='file'/>\
                  </span> \
                  <input type='text' class='form-control' id='file-indicator' readonly> \
                  </div> \
                </div> \
                <div id='delimiterDiv' class='form-group'> \
                <label class='control-label col-sm-2' for='delimiter'>Delimiter:</label> \
              <div class='col-sm-10'> \
                <input type='text' class='form-control' id='delimiter' name='delimiter'> \
                </div> \
                </div> \
                <h3><span class='label label-warning col-sm-12' style='margin-bottom:20px'>Please input order of fields</span></h3> \
                <div id='columnDef'></div> \
              </form>";
              apiFactory.describeGeoLocation().success(function (result) {
                angular.forEach(result.COLUMNS.data, function (column) {
                  fieldArray.push(column.Field);
                  typeArray.push(column.Type);
                  $('#columnDef').append("<div class='form-group'> \
              <label class='control-label col-sm-7'>" + (column.Null == "NO" ? "Required field " : "Field ") + "\'" + column.Field + "\'(" +column.Type + ") is column:" + "</label> \
              <div class='col-sm-5'> \
                <input type='text' class='form-control' id='" + column.Field + "' placeholder='Starting from 0'> \
                </div> \
              </div>");
                });
              });
              $('#save-button')[0].innerText = "Save Changes";
              $('#save-button').on('click', function () {
                var indexArray = [];

                angular.forEach($('#columnDef input'), function (dom) {
                  var value = parseInt(dom.value);
                  if (value > -1)
                    indexArray.push(value);
                  else
                    indexArray.push(-1);
                });

                var formData = new FormData();

                formData.append("file", $('#file')[0].files[0]);
                formData.append("indexes", indexArray);
                formData.append("fields", fieldArray);
                formData.append("types", typeArray);
                formData.append("delimiter", $('#delimiter').val());

                $('#modal-body').append("<h4>Working... You'll get your result or exception below.</h4><h5>This could take long, so go somewhere else or go make a coffee :)</h5>");
                apiFactory.importGeoLocationFromFile(formData).success(function (result) {
                  $('#modal-body').append("<p>" + result + "</p>");
                })
              });
              $('#file').on('change', function () {
                var input = $(this),
                  label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
                $('#file-indicator').val(label);
                switch (label.split('.')[1]) {
                  case 'txt':
                    $('#delimiterDiv').show();
                    break;
                  default:
                    $('#delimiterDiv').hide();
                    break;
                }
              });
              break;
            case 'delete':
              var row = $scope.locationGridApi.selection.getSelectedRows()[0];
              $('#modal-title')[0].innerText = row ? "Delete Geo Location row" : "No row selected";
              $('#modal-body')[0].innerHTML = row ? "<p>Are you sure?</p>" : "Please select a row first";
              if (!row)
                $('#save-button').hide();
              else {
                $('#save-button').show();
                $('#save-button')[0].innerText = "Confirm";
                $('#save-button').on('click', function () {
                  apiFactory.deleteGeoLocation(row.country, row.city).success(function (affectedRows) {
                    showResult(affectedRows, 'Location');
                    getGeoLocationPage();
                  });
                  $('#myModal').modal('hide');
                });
              }
              break;
            case 'insert':
              $('#modal-title')[0].innerText = "Insert Geo Location data";
              $('#modal-body')[0].innerHTML = "<form id='locationForm' class='form-horizontal' role='form'> \
                  <div class='form-group'> \
                  <label class='control-label col-sm-4' for='country'>Country:</label> \
                <div class='col-sm-8'> \
                  <input type='text' class='form-control' id='country' name='country' placeholder='Country Code'> \
                  </div> \
                  </div> \
                  <div class='form-group'> \
                  <label class='control-label col-sm-4' for='city'>City:</label> \
                <div class='col-sm-8'> \
                  <input type='text' class='form-control' id='city' name='city' placeholder='City...'> \
                  </div> \
                  </div> \
                  <div class='form-group'> \
                  <label class='control-label col-sm-4' for='latitude'>Latitude:</label> \
                <div class='col-sm-8'> \
                  <input type='text' class='form-control' id='latitude' name='latitude' placeholder='Latitude'> \
                  </div> \
                  </div> \
                  <div class='form-group'> \
                  <label class='control-label col-sm-4' for='longitude'>Longitude:</label> \
                <div class='col-sm-8'> \
                  <input type='text' class='form-control' id='longitude' name='longitude' placeholder='Longitude'> \
                  </div> \
                  </div> \
              </form>";
              $('#save-button')[0].innerText = "Save Changes";
              $('#save-button').on('click', function () {
                var suffix = $('#locationForm').serialize();
                apiFactory.insertGeoLocation(suffix).success(function (result) {
                  showResult(result, 'Location');
                  getGeoLocationPage();
                });
                $('#myModal').modal('hide');
              });
              break;
          }
          break;
      }
      $('#myModal').modal('show');
    }


  }]);





