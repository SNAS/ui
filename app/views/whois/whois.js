'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:WhoIsController
 * @description
 * # WhoIsController
 * Controller of the Whois page
 */
angular.module('bmpUiApp')
  .controller('WhoIsController', ['$scope', 'apiFactory', '$http', '$timeout', '$interval', '$stateParams', 'uiGridFactory',
    function ($scope, apiFactory, $http, $timeout, $interval, $stateParams, uiGridFactory) {

    //DEBUG
    window.SCOPE = $scope;

    var whoIsGridInitHeight = 300;
    $scope.nodata = false;
    $scope.modalContent = "";

    function updateWhoisModal(asn) {

      $scope.modalContent = "";

      // *** Set API call modal dialog for whois ***

      // *
      var linkWhoisAsnWhois = "whois/asn/" + asn;

      var textWhoisAsnWhois = "Whois Info - AS " + asn;
      $scope.modalContent += apiFactory.createApiCallHtml(linkWhoisAsnWhois, textWhoisAsnWhois);

      // *
      var numberRegex = /^\d+$/;

      if (numberRegex.exec($scope.searchValue) == null) {

        var linkWhoisSearchResult = "whois/asn?where=w.as_name like '%" + $scope.searchValue +
                                            "%' or w.org_name like '%" + $scope.searchValue + "%'&limit=1000";

        var textWhoisSearchResult = "Search Result - '" + $scope.searchValue + "'";
        $scope.modalContent += apiFactory.createApiCallHtml(linkWhoisSearchResult, textWhoisSearchResult);
      }

      else {

        var linkWhoisSearchResult = "whois/asn/" + $scope.searchValue;

        var textWhoisSearchResult = "Search Result - '" + $scope.searchValue + "'";
        $scope.modalContent += apiFactory.createApiCallHtml(linkWhoisSearchResult, textWhoisSearchResult);
      }



    };

    $scope.whoIsGridOptions = {
      enableRowSelection: true,
      enableRowHeaderSelection: false,
      enableColumnResizing: true,
      rowHeight: 25,
      height: whoIsGridInitHeight,
      width: 1200,
      gridFooterHeight: 0,
      showGridFooter: true,
      multiSelect: false,
      noUnselect: true,
      modifierKeysToMultiSelect: false,
      enableHorizontalScrollbar: 0,
      enableVerticalScrollbar: 1,
      rowTemplate: '<div class="hover-row-highlight"><div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div></div>',
      onRegisterApi: function (gridApi) {
        $scope.whoIsGridApi = gridApi;
        $scope.whoIsGridApi.selection.on.rowSelectionChanged($scope,function(row) {
          changeSelected();
        });
      },

    columnDefs : [
      {
        name: "asn", displayName: 'ASN', width: '7%',
        cellTemplate: '<div class="ui-grid-cell-contents asn-clickable"><div bmp-asn-model asn="{{ COL_FIELD }}"></div></div>'
      },
      {name: "as_name", displayName: 'AS Name', width: '18%'},
      {name: "org_name", displayName: 'Organization Name', width: '35%'},
      {name: "country", displayName: 'Country', width: '8%'},
      {
        name: "transit_v4_prefixes", displayName: 'Transit IPv4', width: '*',
        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
          if (grid.getCellValue(row, col) > 0) {
            return 'highlight';
          }
        }
      },
      {
        name: "transit_v6_prefixes", displayName: 'Transit IPv6', width: '*',
        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
          if (grid.getCellValue(row, col) > 0) {
            return 'highlight';
          }
        }
      },
      {
        name: "origin_v4_prefixes", displayName: 'Origin IPv4', width: '*',
        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
          if (grid.getCellValue(row, col) > 0) {
            return 'highlight';
          }
        }
      },
      {
        name: "origin_v6_prefixes", displayName: 'Origin IPv6', width: '*',
        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
          if (grid.getCellValue(row, col) > 0) {
            return 'highlight';
          }
        }
      }
    ]
    };

    //Loop through data selecting and altering relevant data.
    var searchValue = function (value) {
      if (value == "" || value == " ")
        return;
      $scope.whoIsLoad = true;
      var numberRegex = /^\d+$/;

      if (numberRegex.exec(value) == null) {
        //  not a number do string search
        apiFactory.getWhoIsName(value).
          success(function (result) {
            processData(result.w.data);
          }).
          error(function (error) {

            console.log(error.message);
          });
      } else {
        // do a asn search
        apiFactory.getWhoIsASN(value).
          success(function (result) {
            processData(result.gen_whois_asn.data);
          }).
          error(function (error) {

            console.log(error.message);
          });
      }
    };

    function processData(data){
      if(data.length != 0){
        $scope.whoIsGridOptions.data = data;
        initSelect();
        setTimeout(function(){
          uiGridFactory.calGridHeight($scope.whoIsGridOptions, $scope.whoIsGridApi);
        },10);
        $scope.whoIsLoad=false;
        $scope.nodata = false;
      }
      else{
        $scope.nodata = true;

        // Show whois modal as black modal.
        $scope.modalContent = 'No API service is available for <b>"' + $scope.searchValue + '"</b>';
      }
    }

    var initSelect = function () {
      $timeout(function () {
        $scope.whoIsGridApi.selection.selectRow($scope.whoIsGridOptions.data[0]);
      });
    };

    //Waits a bit for user to contiune typing.
    $scope.enterValue = function (value) {
      $timeout(function () {
        if (value == $scope.searchValue) {
          searchValue(value);
        }
      }, 300);
    };

    //Decided to put the data into a table in the pre to align it
    function changeSelected () {
      var noShow = ["$$hashKey", "symbOrigin", "symbTransit"];
      var values = $scope.whoIsGridApi.selection.getSelectedRows()[0];

      // Show whois modal with corresponding asn data.
      updateWhoisModal(values['asn']);

      var showValues = '<table class="tableStyle">';

      angular.forEach(values, function (value, key) {
        if (noShow.indexOf(key) == -1) { //doesnt show certain fields
          if (key == "raw_output") {
            //Process each raw output field
            var raw_data = value.split("\n");
            showValues += '<tr><td> </td></tr>'; //br from top

            for (var i = 0; i < raw_data.length; i++) {
              showValues += '<tr>';
              if (raw_data[i] == "") { //was a newline
                showValues += '<td> </td>';
              } else {
                var s = raw_data[i].split(": "); //split on :<space> cause of http:// links

                if(s.length>1) {
                  showValues += (
                  '<td>' +
                  s[0].trim() + ' ' +
                  '</td>' +

                  '<td>' +
                  s[1].trim() +
                  '</td>'
                  );
                }
                else{
                  showValues += (
                  '<td>' +
                  '</td>' +

                  '<td>' +
                  s[0].trim() +
                  '</td>'
                  );
                }
              }
              showValues += '</tr>';
            }
          } else {
            showValues += (
            '<tr>' +
            '<td>' +
            key + ' ' +
            '</td>' +

            '<td>' +
            value +
            '</td>' +
            '</tr>'
            );
          }
        }
      });
      showValues += '</table>';

      $scope.selectedItem = showValues;
    };

    //Init table data
    if($stateParams.as){
      $scope.searchValue = $stateParams.as
      searchValue($stateParams.as);
    }
    else{
      $scope.searchValue = "Cisco"
      searchValue("Cisco");
    }
  }]);
