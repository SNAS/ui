'use strict';

angular.module('bmpUiApp')
  .controller('AdminViewController', ['$scope', 'apiFactory', function ($scope, apiFactory) {

    var timer, searchTimer, resultDisappearTime = 2500;

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
      enableFiltering: true,
      useExternalFiltering: true,
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
          name: "country", displayName: 'Country', width: '10%'
        },
        {
          name: "stateprov", displayName: 'State/Prov', width: '20%'
        },
        {
          name: "city", displayName: 'City', width: '20%'
        },
        {
          name: "latitude", displayName: 'Latitude', width: '10%', enableFiltering: false
        },
        {
          name: "longitude", displayName: 'Longitude', width: '10%', enableFiltering: false
        }
      ],
      onRegisterApi: function (gridApi) {
        $scope.IPGridApi = gridApi;
        gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
          if (sortColumns.length == 0) {
            geoIPGetOptions.sort = null;
          } else {
            geoIPGetOptions.sort = sortColumns[0];
          }
          getGeoIPPage();
        });
        gridApi.core.on.filterChanged($scope, function () {
          var grid = this.grid;
          clearTimeout(searchTimer);
          searchTimer = setTimeout(function () {
            geoIPGetOptions.whereClause = "";
            angular.forEach(grid.columns, function (column) {
              if (column.filters[0].term != undefined)
                geoIPGetOptions.whereClause += column.field + " LIKE '%25" + column.filters[0].term + "%25' AND ";
            });
            if (geoIPGetOptions.whereClause.length > 0)
              geoIPGetOptions.whereClause = "WHERE " + geoIPGetOptions.whereClause.substring(0, geoIPGetOptions.whereClause.length - 5);
            getGeoIPPagination();
            getGeoIPPage();
          }, 777);
        });
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
          geoIPGetOptions.pageNumber = newPage;
          geoIPGetOptions.pageSize = pageSize;
          getGeoIPPage();
        });
        gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef) {
          apiFactory.updateGeoIP(rowEntity.ip_start, colDef.name, rowEntity[colDef.name]).success(function (affectedRows) {
            showResult(affectedRows, 'IP');
          });
        });
      }
    };

    var geoIPGetOptions = {
      pageNumber: 1,
      pageSize: 1000,
      whereClause: "",
      sort: null
    };

    var getGeoIPPagination = function () {
      apiFactory.getGeoIPCount(geoIPGetOptions.whereClause).success(function (result) {
        $scope.geoIPGridOptions.totalItems = result.table.data[0]['COUNT'];
      });
    };
    var getGeoIPPage = function () {
      apiFactory.getGeoIPList(geoIPGetOptions.pageNumber, geoIPGetOptions.pageSize, geoIPGetOptions.whereClause, geoIPGetOptions.sort).success(function (result) {
        $scope.geoIPGridOptions.data = result.v_geo_ip.data;
      });
    };

    getGeoIPPagination();
    getGeoIPPage();

    $scope.geoLocationGridOptions = {
      enableColumnResizing: true,
      paginationPageSize: 1000,
      useExternalPagination: true,
      useExternalSorting: true,
      enableRowSelection: true,
      multiSelect: false,
      enableRowHeaderSelection: false,
      enableFiltering: true,
      useExternalFiltering: true,
      rowHeight: 32,
      columnDefs: [
        {
          name: "country_code", displayName: 'Country Code', width: '20%', enableCellEdit: false
        },
        {
          name: "city", displayName: 'City', width: '30%', enableCellEdit: false
        },
        {
          name: "latitude", displayName: 'Latitude', width: '25%', enableFiltering: false
        },
        {
          name: "longitude", displayName: 'Longitude', width: '25%', enableFiltering: false
        }
      ],
      onRegisterApi: function (gridApi) {
        $scope.locationGridApi = gridApi;
        gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
          if (sortColumns.length == 0) {
            geoLocationGetOptions.sort = null;
          } else {
            geoLocationGetOptions.sort = sortColumns[0];
          }
          getGeoLocationPage();
        });
        gridApi.core.on.filterChanged($scope, function () {
          var grid = this.grid;
          clearTimeout(searchTimer);
          searchTimer = setTimeout(function () {
            geoLocationGetOptions.whereClause = "";
            angular.forEach(grid.columns, function (column) {
              if (column.filters[0].term != undefined)
                geoLocationGetOptions.whereClause += column.field + " LIKE '%25" + column.filters[0].term + "%25' AND ";
            });
            if (geoLocationGetOptions.whereClause.length > 0)
              geoLocationGetOptions.whereClause = "WHERE " + geoLocationGetOptions.whereClause.substring(0, geoLocationGetOptions.whereClause.length - 5);
            getGeoLocationPagination();
            getGeoLocationPage();
          }, 777);
        });
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
          geoLocationGetOptions.pageNumber = newPage;
          geoLocationGetOptions.pageSize = pageSize;
          getGeoLocationPage();
        });
        gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef) {
          apiFactory.updateGeoLocation(rowEntity.country_code, rowEntity.city, colDef.name, rowEntity[colDef.name]).success(function (affectedRows) {
            showResult(affectedRows, 'Location');
          });
        });
      }
    };

    var geoLocationGetOptions = {
      pageNumber: 1,
      pageSize: 1000,
      whereClause: "",
      sort: null
    };

    var getGeoLocationPagination = function () {
      apiFactory.getGeoLocationCount(geoLocationGetOptions.whereClause).success(function (result) {
        $scope.geoLocationGridOptions.totalItems = result.table.data[0]['COUNT'];
      });
    };
    var getGeoLocationPage = function () {
      apiFactory.getGeoLocationList(geoLocationGetOptions.pageNumber, geoLocationGetOptions.pageSize, geoLocationGetOptions.whereClause, geoLocationGetOptions.sort).success(function (result) {
        $scope.geoLocationGridOptions.data = result.geo_location.data;
      });
    };

    $scope.showGeoLocation = function () {
      getGeoLocationPagination();
      getGeoLocationPage();
    };

    $scope.readyModal = function (type, action) {
      switch (type) {
        case 'IP':
          switch (action) {
            case 'import':
              //var fieldArray = [], typeArray = [];
              $('#modal-title')[0].innerText = "Import GeoIP data file";
              $('#modal-body')[0].innerHTML = "<h3><span class='label label-danger col-sm-12' style='margin-bottom:20px'>This function is coming soon!</span></h3>";
              //  "<h3><span class='label label-danger col-sm-12' style='margin-bottom:20px'>Warning: upon import, the original data will be erased</span></h3> \
              //<form id='ipForm' class='form-horizontal' role='form' enctype='multipart/form-data' method='post'> \
              //  <div class='form-group'> \
              //    <div class='input-group col-lg-8 col-lg-offset-2'> \
              //    <span class='btn btn-primary btn-file input-group-addon'> \
              //      Browse<input type='file' name='file' id='file'/>\
              //    </span> \
              //    <input type='text' class='form-control' id='file-indicator' readonly> \
              //    </div> \
              //  </div> \
              //  <div id='delimiterDiv' class='form-group'> \
              //  <label class='control-label col-sm-2' for='delimiter'>Delimiter:</label> \
              //<div class='col-sm-10'> \
              //  <input type='text' class='form-control' id='delimiter' name='delimiter'> \
              //  </div> \
              //  </div> \
              //  <h3><span class='label label-warning col-sm-12' style='margin-bottom:20px'>Please input order of fields</span></h3> \
              //  <div id='columnDef'></div> \
              //</form>";
              //apiFactory.describeGeoIP().success(function (result) {
              //  angular.forEach(result.COLUMNS.data, function (column) {
              //    if (column.Field != "addr_type") {
              //      fieldArray.push(column.Field);
              //      typeArray.push(column.Type);
              //      $('#columnDef').append("<div class='form-group'> \
              //        <label class='control-label col-sm-8'>" + (column.Null == "NO" ? "Required field " : "Field ") + "\'" + column.Field + "\'(" + column.Type + ") is column:" + "</label> \
              //        <div class='col-sm-4'> \
              //          <input type='text' class='form-control' id='" + column.Field + "' placeholder='Starting from 0'> \
              //          </div> \
              //        </div>");
              //    }
              //  });
              //});
              //$('#save-button')[0].innerText = "Save Changes";
              //$('#save-button').on('click', function () {
              //  var indexArray = [];
              //
              //  angular.forEach($('#columnDef input'), function (dom) {
              //    var value = parseInt(dom.value);
              //    if (value > -1)
              //      indexArray.push(value);
              //    else
              //      indexArray.push(-1);
              //  });
              //
              //  var formData = new FormData();
              //
              //  formData.append("file", $('#file')[0].files[0]);
              //  formData.append("indexes", indexArray);
              //  formData.append("fields", fieldArray);
              //  formData.append("types", typeArray);
              //  formData.append("delimiter", $('#delimiter').val());
              //
              //  $('#modal-body').append("<h4>Working... You'll get your result or exception below.</h4><h5>This usually takes 5-10 minutes, But you don't have to wait here.</h5>");
              //  apiFactory.importGeoIPFromFile(formData).success(function (result) {
              //    $('#modal-body').append("<h3><span class='label "+(result.indexOf('Success')>-1?"label-success":"label-danger")+" col-sm-12' style='margin-bottom:20px'>" + result + "</span></h3>");
              //  })
              //});
              //$('#file').on('change', function () {
              //  var input = $(this),
              //    label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
              //  $('#file-indicator').val(label);
              //  switch (label.split('.')[1]) {
              //    case 'txt':
              //    case 'csv':
              //      $('#delimiterDiv').show();
              //      break;
              //    default:
              //      $('#delimiterDiv').show();
              //      break;
              //  }
              //});
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
              $('#modal-body')[0].innerHTML = "<h3><span class='label label-danger col-sm-12' style='margin-bottom:20px'>Warning: upon import, the original data will be erased</span></h3> \
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
              <label class='control-label col-sm-8'>" + (column.Null == "NO" ? "Required field " : "Field ") + "\'" + column.Field + "\'(" + column.Type + ") is column:" + "</label> \
              <div class='col-sm-4'> \
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

                $('#modal-body').append("<h4>Working... You'll get your result or exception below.</h4><h5>This usually takes 5-10 minutes, But you don't have to wait here.</h5>");
                apiFactory.importGeoLocationFromFile(formData).success(function (result) {
                  $('#modal-body').append("<h3><span class='label " + (result.indexOf('Success') > -1 ? "label-success" : "label-danger") + " col-sm-12' style='margin-bottom:20px'>" + result + "</span></h3>");
                })
              });
              $('#file').on('change', function () {
                var input = $(this),
                  label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
                $('#file-indicator').val(label);
                switch (label.split('.')[1]) {
                  case 'txt':
                  case 'csv':
                    $('#delimiterDiv').show();
                    break;
                  default:
                    $('#delimiterDiv').show();
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
                  apiFactory.deleteGeoLocation(row.country_code, row.city).success(function (affectedRows) {
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
                  <label class='control-label col-sm-4' for='country_code'>Country Code:</label> \
                <div class='col-sm-8'> \
                  <input type='text' class='form-control' id='country_code' name='country_code' placeholder='Country Code'> \
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





