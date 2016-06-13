'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:PrefixAnalysisController
 * @description
 * # PrefixAnalysisController
 * Controller of the Login page
 */
angular.module('bmpUiApp')
  .controller('PrefixAnalysisController', ['$scope', 'apiFactory', '$http', '$timeout', '$interval', '$location', '$window', '$anchorScroll', '$compile', 'modal', '$stateParams', '$rootScope', 'uiGridConstants', function ($scope, apiFactory, $http, $timeout, $interval, $location, $window, $anchorScroll, $compile, modal, $stateParams, $rootScope, uiGridConstants) {
    //DEBUG
    $scope.nodata = false;
    // resize the window
    window.SCOPE = $scope;
    //Create the  prefix data grid
    $scope.AllPrefixOptions = {
      showGridFooter: true,
      enableFiltering: false,
      enableRowSelection: true,
      enableRowHeaderSelection: false,
      enableHorizontalScrollbar: 0,
      enableVerticalScrollbar: 1,
      multiSelect: false,
      rowHeight: 25,
      gridFooterHeight: 0,
      rowTemplate: '<div class="hover-row-highlight"><div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div></div>',
      onRegisterApi: function (gridApi) {
        $scope.AllPrefixGridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          $scope.peerData.selectPeer = row.entity;
          getPrefixHistory($scope.value, $scope.peerData.selectPeer.peer_hash_id);
          // $scope.selectUpdates();
          $scope.fromRouter = 'FROM ' + $scope.peerData.selectPeer.RouterName;
          $scope.fromPeer = '-> ' + $scope.peerData.selectPeer.PeerName;
          $scope.selectedPeerCaption = $scope.peerData.selectPeer.PeerName + ' selected';
        });
      },
      columnDefs: [
        {name: "RouterName", displayName: 'RouterName'},
        {name: "PeerName", displayName: 'PeerName'},
        {name: "PeerAddress", displayName: 'PeerAddress'},
        {
          name: "PeerASN", displayName: 'Peer_ASN',
          cellTemplate: '<div class="ui-grid-cell-contents"><div bmp-asn-model asn="{{ COL_FIELD }}"></div></div>'
        }
      ]
    };

    // updates/history of prefixes after clicking 'update' button
    $scope.HistoryPrefixOptions = {
      showGridFooter: true,
      enableRowSelection: true,
      enableRowHeaderSelection: false,
      multiSelect: true,
      modifierKeysToMultiSelect: true,
      enableHorizontalScrollbar: 0,
      enableVerticalScrollbar: 1,
      rowHeight: 25,
      height: 300,
      gridFooterHeight: 0,
      rowTemplate: '<div class="hover-row-highlight"><div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div></div>',
      columnDefs: [
        {name: "RouterName", displayName: 'RouterName', width: 110, cellClass: 'background'},
        {name: "NH", displayName: 'NH', width: 100, cellClass: 'background'},
        {
          name: "AS_Path_list",
          displayName: 'AS_Path',
          cellClass: 'background',
          cellTemplate: '<div ng-class="{ \'green greenbar\': !AS_Path_list.flag, whitebar: AS_Path_list.flag,}" ng-repeat="AS_Path_list in row.entity.AS_Path_list">{{AS_Path_list.path}}</div>'
        },
        {name: "PeerASN", displayName: 'Peer_ASN', width: 130, cellClass: 'background'},
        {name: "MED", displayName: 'MED', width: 60, cellClass: 'background'},
        {
          name: "Communities",
          displayName: 'Communities',
          cellClass: 'background',
          cellTemplate: '<div ng-class="{\'green greenbarCommunities\': !Communities_list.flag, whitebarCommunities: Communities_list.flag,}" ng-repeat="Communities_list in row.entity.Communities_list">{{Communities_list.path}}</div>'
        },
        {
          name: "LastModified", displayName: 'Last_Modified', width: 180, cellClass: 'background',
          sort: {
            direction: uiGridConstants.DESC,
            priority: 1
          }
        }
      ],
      onRegisterApi: function (gridApi) {
        $scope.HistoryPrefixGridApi = gridApi;

        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          $scope.itemValue = row.entity; //how can i get data from one row before
          $scope.showModal();
          //$scope.$apply()
        });
        // test for the sort change
        $scope.HistoryPrefixGridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
      }
    };

    // withdrawn prefixes after clicking 'withdraw' button
    $scope.WithdrawsOptions = {
      showGridFooter: true,
      enableRowSelection: true,
      enableRowHeaderSelection: false,
      multiSelect: true,
      modifierKeysToMultiSelect: true,
      enableHorizontalScrollbar: 0,
      enableVerticalScrollbar: 1,
      rowHeight: 25,
      height: 300,
      gridFooterHeight: 0,
      columnDefs: [
        {name: "PeerAddress", displayName: 'Peer Address', cellClass: 'background'},
        // {name: "Prefix", displayName: 'NH', cellClass: 'background'},
        {name: "RouterName", displayName: 'Router Name', cellClass: 'background'},
        {name: "NH", displayName: 'Next Hop', width: 100, cellClass: 'background'},
        {
          name: "AS_Path",
          displayName: 'AS Path',
          cellClass: 'background',
          cellTemplate: '<div ng-class="{ \'green greenbar\': !AS_Path_list.flag, whitebar: AS_Path_list.flag,}" ng-repeat="AS_Path_list in row.entity.AS_Path_list">{{AS_Path_list.path}}</div>'
        },
        {name: "MED", displayName: 'MED', width: 100, cellClass: 'background'},
        {
          name: "Communities",
          displayName: 'Communities',
          cellClass: 'background',
          cellTemplate: '<div ng-class="{\'green greenbarCommunities\': !Communities_list.flag, whitebarCommunities: Communities_list.flag,}" ng-repeat="Communities_list in row.entity.Communities_list">{{Communities_list.path}}</div>'
        }
        // {name: "Count", displayName: 'Count', cellClass: 'background'}
      ]
    };

    $scope.allHistoryOptions = {
      showGridFooter: true,
      enableFiltering: false,
      enableRowSelection: true,
      enableRowHeaderSelection: false,
      enableHorizontalScrollbar: 0,
      enableVerticalScrollbar: 1,
      multiSelect: false,
      rowHeight: 25,
      gridFooterHeight: 0,
      rowTemplate: '<div class="hover-row-highlight"><div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div></div>',
      onRegisterApi: function (gridApi) {
        $scope.AllPrefixGridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          $scope.peerData.selectPeer = row.entity;
          // if ($scope.peerData.selectPeer.isWithdrawn) {
          //   $scope.selectWithdraws();
          // } else {
          //   $scope.selectUpdates();
          // }
        });
      },
      columnDefs: [
        {
          name: "LastModified", displayName: "Timestamp",
          sort: {priority: 0, direction: uiGridConstants.DESC},
          width: '20%'
        },
        {name: 'AS_Path', displayName: 'AS Path', width: '20%'},
        {name: 'LocalPref', displayName: 'Local Preference'},
        {name: 'Communities', displayName: 'Communities'},
        {name: 'MED', displayName: 'MED'},
        {name: 'NH', displayName: 'Next Hop'},
        {name: "Status", displayName: 'Status'},
      ]
    };

    $scope.toggleFiltering = function () {
      $scope.AllPrefixOptions.enableFiltering = !$scope.AllPrefixOptions.enableFiltering;
      $scope.AllPrefixGridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
    };

    //Waits a bit for user to continue typing.
    $scope.enterValue = function (value) {
      $scope.currentValue = value;
      $timeout(function () {
        if (value == $scope.currentValue) {
          getPrefixDataGrid(value);
        }
      }, 500);
    };

    var filterUnique = function (input, key) {
      var unique = {};
      var uniqueList = [];
      //console.log("unique:" + unique);

      for (var i = 0; i < input.length; i++) {
        if (typeof unique[input[i][key]] == "undefined") {
          unique[input[i][key]] = "";
          uniqueList.push(input[i]);
          //console.log("uniqueList:" + uniqueList);
        }
      }
      return uniqueList;
    };

    // get all entries for prefix, populate allPrefixOptions
    var getPrefixDataGrid = function (value) {
      $scope.allPreLoad = true;
      apiFactory.getPrefix(value)
        .success(function (data) {
          // execute the function and get data successfully.
          $scope.PrefixData = data.v_all_routes.data;
          $scope.AllPrefixOptions.data = data.v_all_routes.data;
          var peerDataOriginal = data.v_all_routes.data;
          $scope.peerData = filterUnique(peerDataOriginal, "PeerName");
          createPrefixGridTable();
          createOriginASGridTable();
          $scope.allPreLoad = false;
          $timeout(function () {
            if ($stateParams.p != 'defaultPrefix') {
              for (var i = 0, len = $scope.AllPrefixOptions.data.length; i < len; i++) {
                if ($stateParams.peer == $scope.AllPrefixOptions.data[i].peer_hash_id) {
                  $scope.AllPrefixGridApi.selection.selectRow($scope.AllPrefixOptions.data[i]);
                  if ($stateParams.type == "updates")
                    $('#updatesBtn').click();
                  else
                    $('#withdrawsBtn').click();
                  break;
                }
              }
            }
          });
        })
        .error(function (data, status, headers, config) {
          console.log("here is s error");
        });
    };

    // define the Prefix Data create function
    var createPrefixGridTable = function () {
      //$scope.AllPrefixOptions.data = $scope.PrefixData;
      if ($scope.PrefixData.length > 0) {
        var prefix = $scope.value.trim();

        apiFactory.getWhoisPrefix(prefix)
          .success(function (result) {
            $scope.showPrefixInfo = '<table>';
            if (result.gen_whois_route.data.length > 0) {
              $scope.values = result.gen_whois_route.data[0];
              $scope.values['prefix'] = $scope.values['prefix'] + '/' + $scope.values['prefix_len'];
              delete $scope.values['prefix_len'];
            }
            else {
              $scope.values = {"Sorry": "Didn't find whois information for this prefix!"};
            }
            angular.forEach($scope.values, function (value, key) {

              if (key != "raw_output") {
                $scope.showPrefixInfo += (
                  '<tr>' +
                  '<td>' +
                  key + ': ' +
                  '</td>' +

                  '<td>' +
                  value +
                  '</td>' +
                  '</tr>'
                );
              }

            });
            $scope.showPrefixInfo += '</table>';
          }).error(function (error) {
          console.log(error);
        });
      }
      else {
        $scope.showPrefixInfo = '</table>There are not enough information</table>';
      }
    };

    // define the Origin AS Data create function
    var createOriginASGridTable = function () {
      //$scope.AllPrefixOptions.data = $scope.PrefixData;
      if ($scope.PrefixData.length > 0) {
        var Origin_AS = $scope.PrefixData[0].Origin_AS;

        // create the table
        var url = apiFactory.getWhoIsWhereASNSync(Origin_AS);

        var flag = true;
        for (var i = 0; i < $scope.PrefixData.length - 1; i++) {
          if (angular.equals($scope.PrefixData[i].Origin_AS, $scope.PrefixData[i + 1].Origin_AS)) {
          }
          else {
            flag = false;
            break;
          }
        }

        if (flag) {

          //notice : synchronization
          var request = $http({
            method: "get",
            url: url
          });
          $scope.infoCard = {};
          request.success(function (result) {
            $scope.showValues = '<table>';
            $scope.values = result.w.data[0];
            angular.forEach($scope.values, function (value, key) {

              if (key != "raw_output") {
                switch (key) {
                  case 'asn':
                    $scope.infoCard.asn = value;
                    break;
                  case 'as_name':
                    $scope.infoCard.asName = value;
                    break;
                  case 'org_name':
                    $scope.infoCard.org = value;
                    break;
                }
                $scope.showValues += (
                  '<tr>' +
                  '<td>' +
                  key + ': ' +
                  '</td>' +

                  '<td>' +
                  value +
                  '</td>' +
                  '</tr>'
                );
              }

            });
            $scope.showValues += '</table>';
          });
        }
        else {
          $scope.showValues = '</table>there are not enough information</table>';
          $('.long').removeClass('long');
          $('.down-arrow').remove();
        }
        $scope.nodata = false;
      } else {
        $scope.nodata = true;  // nodata
      }
    };

    // $scope.findLastUpdates = function () {
    //   var searchPrefix = $scope.currentValue + '?ts=lastupdate';
    //   // getPrefixHisData(searchPrefix);
    //   getPrefixHistory($scope.currentValue);
    // };

    // get last 100 records of updates and withdrawns, populate allHistoryOptions
    var getPrefixHistory = function(prefix, peerHashID) {
      $scope.allHisLoad = true;
      $scope.loading = true;
      prefix += '?ts=lastupdate';
      var prefixHistoryData = [];
      var historyRequest, withdrawnRequest;

      if (!peerHashID) {
        historyRequest = apiFactory.getHistoryPrefix(prefix);
        withdrawnRequest = apiFactory.getWithdrawnPrefix(prefix)
      } else {
        historyRequest = apiFactory.getPeerHistoryPrefix(prefix, peerHashID);
        withdrawnRequest = apiFactory.getPeerWithdrawPrefix(prefix, peerHashID);
      }

      historyRequest
        .success(function(data1) {
          if (data1.hasOwnProperty('v_routes_history') && data1.v_routes_history.data.length != 0) {
            data1.v_routes_history.data.forEach(function(value) {
              value.Status = 'updated';
            });
            prefixHistoryData = prefixHistoryData.concat(data1.v_routes_history.data);
          }
          withdrawnRequest
            .success(function(data) {
              if (data.hasOwnProperty('v_routes_withdraws') && data.v_routes_withdraws.data.length != 0) {
                data.v_routes_withdraws.data.forEach(function(value) {
                  value.Status = 'withdrawn';
                });
                prefixHistoryData = prefixHistoryData.concat(data.v_routes_withdraws.data);
              }

              $scope.allHistoryOptions.data = prefixHistoryData;
              $scope.allHisLoad = false;
              $scope.PrefixData = prefixHistoryData;
              var peerDataOriginal = prefixHistoryData;
              $scope.peerData = filterUnique(peerDataOriginal, "PeerName");
              // createPrefixGridTable();
              // createOriginASGridTable();
              // $timeout(function () {
              //   if ($stateParams.p != 'defaultPrefix') {
              //     for (var i = 0, len = $scope.AllPrefixOptions.data.length; i < len; i++) {
              //       if ($stateParams.peer == $scope.AllPrefixOptions.data[i].peer_hash_id) {
              //         $scope.AllPrefixGridApi.selection.selectRow($scope.AllPrefixOptions.data[i]);
              //       }
              //     }
              //   }
              // });
              $scope.originHisData = data1.v_routes_history.data;
              angular.forEach($scope.originHisData, function (item) {
                item['LastModified'] = moment.utc(item['LastModified'], 'YYYY-MM-DD HH:mm:ss.SSSSSS').local().format('YYYY-MM-DD HH:mm:ss.SSSSSS');
              });

              if ($scope.originHisData.length == 0) {
                $scope.showTip = "true";
              } else {
                $scope.showTip = "false";
                $scope.currentSetTime = moment($scope.originHisData[0].LastModified);
                if (prefix.indexOf('lastupdate') > -1) {
                  $("#endTimePicker").data("DateTimePicker").date($scope.currentSetTime);
                  var oldestTime = moment($scope.originHisData[$scope.originHisData.length - 1].LastModified);
                  var interval_hour = Math.ceil(moment.duration($scope.currentSetTime.diff(oldestTime)).asHours());
                  var newRange = {
                    label: interval_hour + (interval_hour == 1 ? ' hour' : ' hours'),
                    range: interval_hour,
                    value: interval_hour * 60 / NUMBER_OF_RECTS
                  };
                  $scope.timeranges.push(newRange);
                  $scope.timeRange = newRange;
                }
              }
              getPrefixHisDataHour();
              $scope.loading = false;
            })
            .error(function(error) {
              console.log('error when fetching history data');
            });
        })
        .error(function(error) {
          console.log('error when fetching history data');
        });
    };

    /******************** Following is for updates button *****************/
    var NUMBER_OF_RECTS = 30;

    $scope.timeranges = [
      {label: '2 hours', range: 2},
      {label: '4 hours', range: 4},
      {label: '10 hours', range: 10},
      {label: 'set duration', range: 0}
    ];

    $scope.timeRange = $scope.timeranges[0];
    $scope.customisedTime = false;

    $scope.timeranges.forEach(function (row) {
      row.value = row.range * 60 / NUMBER_OF_RECTS;
    });

    var changeTimeRange = function () {
      $scope.timeranges = $scope.timeranges.slice(0, 4);
      var setDate = $('#endTimePicker').data('DateTimePicker').date();
      $scope.currentSetTime = setDate;
      var searchPrefix = $scope.currentValue + '?hours=' + $scope.timeRange.range + '&ts=' + moment.utc(setDate).format("YYYY-MM-DD HH:mm:ss");
      getPrefixHisData(searchPrefix);
      // getPrefixHistory(searchPrefix);
    };

    $scope.selectTimeRange = function () {
      if ($scope.timeRange.range == 2 || $scope.timeRange.range == 4 || $scope.timeRange.range == 10) {
        $scope.customisedTime = false;
        changeTimeRange();
      }
      else {
        $scope.customisedTime = true;
        $scope.timeranges[3].range = $scope.hours;
      }
    };

    $scope.hours = 0;
    $scope.setHour = function (hours) {
      $scope.timeranges[3].range = hours;
      $scope.timeranges[3].value = hours * 60 / NUMBER_OF_RECTS;
      changeTimeRange();
    };

    $("#endTimePicker").on('dp.hide', function () {
      changeTimeRange();
    });

    $("#endTimePicker").datetimepicker({
      sideBySide: true,
      format: 'MM/DD/YYYY HH:mm:ss',
      defaultDate: moment()
    });

    $scope.setToNow = function () {
      $scope.currentSetTime = moment();
      $("#endTimePicker").data("DateTimePicker").date($scope.currentSetTime);
      changeTimeRange();
    };

    // the only Function is creating a history prefix gird , inject data should be $scope.HisData
    $scope.createPrefixHisGrid = function (i) {
      if (typeof $scope.HisData != "undefined") {
        $scope.HistoryPrefixOptions.data = [];
        $scope.HistoryPrefixOptions.data = $scope.HisData[i];
        $scope.showGrid = true;
        $scope.$apply();
      }
    };

    $scope.createTimeline = function (i) {
      $scope.timelineData = $scope.HisData[i];
      $scope.timelineHtml = "";
      for (var index = $scope.timelineData.length - 1; index > -1; index--) {
        var row = $scope.timelineData[index];
        var ASPath = "";
        var ASPathChanged = "";
        var communities = "";
        var communitiesChanged = "";

        angular.forEach(row.AS_Path, function (value, key) {
          if (index > 0)
            if (!row.AS_Path_list[key].flag)
              if (value)
                ASPathChanged += "<span tooltip class='green' name='AS" + value + "'>" + "+" + value + " " + "</span>";
          ASPath += "<span tooltip name='AS" + value + "'>" + value + " " + "</span>";
        });
        if (index > 0)
          angular.forEach(row.preData.AS_Path, function (value, key) {
            if (!row.preData.AS_Path_list[key].last_flag) {
              if (value)
                ASPathChanged += "<span tooltip class='red' name='AS" + value + "'>" + "-" + value + " " + "</span>";
            }
          });

        angular.forEach(row.Communities, function (value, key) {
          if (index > 0)
            if (!row.Communities_list[key].flag)
              if (value)
                communitiesChanged += "<span class='green'>" + "+" + value + " " + "</span>";
          communities += value + " ";
        });
        if (index > 0)
          angular.forEach(row.preData.Communities, function (value, key) {
            if (!row.preData.Communities_list[key].last_flag) {
              if (value)
                communitiesChanged += "<span tooltip class='red' name='AS" + value + "'>" + "-" + value + " " + "</span>";
            }
          });

        $scope.timelineHtml += '<li><div class="timeline-left">' + '<h5>' + ASPathChanged + '</h5>' + '<h5>' + communitiesChanged + '</h5>' + '</div>'
          + '<div class="timeline-right">'
          + (ASPath.trim() != '' ? ('<h5>' + 'AS Path: ' + ASPath + '</h5>') : (''))
          + (communities.trim() != '' ? ('<h5>' + 'Communities: ' + communities + '</h5>') : (''))
          + '<p>' + moment(row.LastModified, "YYYY-MM-DD HH:mm:ss.SSSSSS").format("MM/DD/YYYY HH:mm:ss.SSS") + '</p>'
          + '</div>'
          + '</li>';
      }
      $scope.$apply();
    };

    // for history graph
    var getPrefixHisData = function (searchPrefix) {
      $scope.peerHashId = $scope.peerData.selectPeer.peer_hash_id;
      var req = apiFactory.getPeerHistoryPrefix(searchPrefix, $scope.peerHashId);
      // if ($scope.selectedType == 'update') {
      //   req =
      // } else if ($scope.selectedType == 'withdraw') {
      //   req = apiFactory.getPeerWithdrawPrefix(searchPrefix, $scope.peerHashId);
      // }
      req.success(function (data) {
        $scope.originHisData = data.v_routes_history.data;
        angular.forEach($scope.originHisData, function (item) {
          item['LastModified'] = moment.utc(item['LastModified'], 'YYYY-MM-DD HH:mm:ss.SSSSSS').local().format('YYYY-MM-DD HH:mm:ss.SSSSSS');
        });

        if ($scope.originHisData.length == 0) {
          $scope.showTip = "true";
        } else {
          $scope.showTip = "false";
          $scope.currentSetTime = moment($scope.originHisData[0].LastModified);
          if (searchPrefix.indexOf('lastupdate') > -1) {
            $("#endTimePicker").data("DateTimePicker").date($scope.currentSetTime);
            var oldestTime = moment($scope.originHisData[$scope.originHisData.length - 1].LastModified);
            var interval_hour = Math.ceil(moment.duration($scope.currentSetTime.diff(oldestTime)).asHours());
            var newRange = {
              label: interval_hour + (interval_hour == 1 ? ' hour' : ' hours'),
              range: interval_hour,
              value: interval_hour * 60 / NUMBER_OF_RECTS
            };
            $scope.timeranges.push(newRange);
            $scope.timeRange = newRange;
          }
        }
        getPrefixHisDataHour();
      });
    };

    var getPrefixHisDataHour = function () {
      $scope.loading = true;

      var allHisData = $scope.originHisData.reverse();
      $scope.asPathList = new Array();

      $scope.asPathChangeNumber = new Array(NUMBER_OF_RECTS);
      $scope.asPathChangeRate = new Array(NUMBER_OF_RECTS);
      $scope.HisData = new Array(NUMBER_OF_RECTS);

      $scope.asPathChangeAS_PATH = new Array(NUMBER_OF_RECTS).fill(0);//this is for AS_PATH
      $scope.asPathChangeNH = new Array(NUMBER_OF_RECTS).fill(0);//this is for next hop
      $scope.asPathChangeCommunites = new Array(NUMBER_OF_RECTS).fill(0);//this is for Communites
      $scope.asPathChangeMED = new Array(NUMBER_OF_RECTS).fill(0);

      for (var i = 0; i < NUMBER_OF_RECTS; i++) {
        $scope.HisData[i] = new Array();
      }

      //contain method:Determine whether an array contains a value
      Array.prototype.contains = function (obj) {
        var i = this.length;
        while (i--) {
          if (this[i] == obj) {
            return true;
          }
        }
        return false;
      };

      for (i = 0; i < allHisData.length; i++) {

        if (0 == i) {
          allHisData[i].preData = "";
        } else {
          allHisData[i].preData = allHisData[i - 1];
        }

        var offsetInMin = ($scope.currentSetTime - moment(allHisData[i].LastModified)) / 1000 / 60 || 0.1;

        // ********* the following code is to create two field to record the As Path changing
        if (typeof(allHisData[i].AS_Path) == "string") {
          allHisData[i].AS_Path = allHisData[i].AS_Path.split(" ");
          allHisData[i].AS_Path = allHisData[i].AS_Path.slice(1); // remove the first blank
        }

        //split two rows into list
        // split AS_Path into list
        if (i < allHisData.length - 1) {
          if (typeof(allHisData[i + 1].AS_Path) == "string") {
            allHisData[i + 1].AS_Path = allHisData[i + 1].AS_Path.split(" ");
            allHisData[i + 1].AS_Path = allHisData[i + 1].AS_Path.slice(1); // remove the first blank
          }
        }

        //to record all the last flag and the last line
        allHisData[i].AS_Path_list = [];
        allHisData[i].AS_Path_list_flag = [];
        allHisData[i].AS_Path_list_flag_last = [];

        //initialize all the information
        for (j = 0; j < allHisData[i].AS_Path.length; j++) {
          if (0 == i) {
            allHisData[i].AS_Path_list_flag[j] = true;
            continue;
          }

          allHisData[i].AS_Path_list_flag[j] = allHisData[i - 1].AS_Path.contains(allHisData[i].AS_Path[j]);

          if (allHisData.length - 1 == i) {
            allHisData[i].AS_Path_list_flag_last[j] = true;
          } else {
            allHisData[i].AS_Path_list_flag_last[j] = allHisData[i + 1].AS_Path.contains(allHisData[i].AS_Path[j]);
          }
        }

        for (j = 0; j < allHisData[i].AS_Path.length; j++) {
          allHisData[i].AS_Path_list[j] = new Array();
          allHisData[i].AS_Path_list[j]["path"] = allHisData[i].AS_Path[j];
          allHisData[i].AS_Path_list[j]["flag"] = allHisData[i].AS_Path_list_flag[j];
          allHisData[i].AS_Path_list[j]["last_flag"] = allHisData[i].AS_Path_list_flag_last[j];
        }
        // ********* the  above code is to create two field to record the As Path changing

        // ********* the following code is to create two field to record the Communities changing
        // split community string into list
        if (typeof(allHisData[i].Communities) == "string") {
          allHisData[i].Communities = allHisData[i].Communities.split(" ");
          //allHisData[i].Communities =  allHisData[i].Communities.slice(1);
        }
        if (i < allHisData.length - 1) {
          if (typeof(allHisData[i + 1].Communities) == "string") {
            allHisData[i + 1].Communities = allHisData[i + 1].Communities.split(" ");
            allHisData[i + 1].Communities = allHisData[i + 1].Communities.slice(1);
          }
        }

        //to record all the last flag and the last line
        allHisData[i].Communities_list = new Array();
        allHisData[i].Communities_list_flag = [];
        allHisData[i].Communities_list_flag_last = [];

        //initialize all the information
        for (j = 0; j < allHisData[i].Communities.length; j++) {
          if (0 == i) {
            allHisData[i].Communities_list_flag[j] = true;
            continue;
          }
          allHisData[i].Communities_list_flag[j] = allHisData[i - 1].Communities.contains(allHisData[i].Communities[j]);
          if (allHisData.length - 1 == i) {
            allHisData[i].Communities_list_flag_last[j] = true;
          } else {
            allHisData[i].Communities_list_flag_last[j] = allHisData[i + 1].Communities.contains(allHisData[i].Communities[j]);
          }
        }

        for (j = 0; j < allHisData[i].Communities.length; j++) {
          allHisData[i].Communities_list[j] = new Array();
          allHisData[i].Communities_list[j]["path"] = allHisData[i].Communities[j];
          allHisData[i].Communities_list[j]["flag"] = allHisData[i].Communities_list_flag[j];
          allHisData[i].Communities_list[j]["last_flag"] = allHisData[i].Communities_list_flag_last[j];
        }
        // ********* the  above code is to create two field to record the Communities changing
        if (offsetInMin / $scope.timeRange.value <= NUMBER_OF_RECTS)
          $scope.HisData[NUMBER_OF_RECTS - Math.ceil(offsetInMin / $scope.timeRange.value)].push(allHisData[i]);
      }

      Array.prototype.compare = function (array) {
        // if the other array is a falsy value, return
        if (!array)
          return false;

        // compare lengths - can save a lot of time
        if (this.length != array.length)
          return false;

        for (var i = 0, l = this.length; i < l; i++) {
          // Check if we have nested arrays
          if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].compare(array[i]))
              return false;
          }
          else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
          }
        }
        return true;
      };

      // to calculate the data color
      for (i = 0; i < NUMBER_OF_RECTS; i++) {
        $scope.asPathChangeNumber[i] = $scope.HisData[i].length;

        for (var j = 1; j < $scope.HisData[i].length; j++) {
          if (!$scope.HisData[i][j - 1].AS_Path.compare($scope.HisData[i][j].AS_Path)) {
            $scope.asPathChangeAS_PATH[i] = $scope.asPathChangeAS_PATH[i] + 1;
          }
          if (!($scope.HisData[i][j - 1].NH === $scope.HisData[i][j].NH)) {
            $scope.asPathChangeNH[i] = $scope.asPathChangeNH[i] + 1;
          }
          if (!(angular.equals($scope.HisData[i][j - 1].Communities, $scope.HisData[i][j].Communities))) {
            //if(!($scope.HisData[i][j-1].Communities === $scope.HisData[i][j].Communities)){
            $scope.asPathChangeCommunites[i] = $scope.asPathChangeCommunites[i] + 1;
          }
          if (!($scope.HisData[i][j - 1].MED === $scope.HisData[i][j].MED)) {
            $scope.asPathChangeMED[i] = $scope.asPathChangeMED[i] + 1;
          }
        }

        $scope.asPathChange = [];
        $scope.asPathChange[0] = $scope.asPathChangeMED;
        $scope.asPathChange[1] = $scope.asPathChangeAS_PATH;
        $scope.asPathChange[2] = $scope.asPathChangeNH;
        $scope.asPathChange[3] = $scope.asPathChangeCommunites;
      }
      $scope.loading = false;
    };

    //should be put into init()
    var init = function () {
      $scope.showTip = "false";
      $scope.value = "93.181.192.0/19";
      $scope.isCardExpand = false;
      $scope.isAllPeersExpanded = false;
      getPrefixDataGrid($scope.value);
      getPrefixHistory($scope.value);
      $scope.selectedPeerCaption = '';
    };

    if ($stateParams.p != 'defaultPrefix') {
      $scope.value = $stateParams.p;
      getPrefixDataGrid($scope.value);
      getPrefixHistory($scope.value);
    } else {
      init();
    }

    $scope.selectChange = function () {
      if (typeof($scope.currentValue) == "undefined") {
        $scope.currentValue = $scope.value;
      }
      changeTimeRange();
    };

    // following two select* methods are for two buttons
    $scope.selectUpdates = function () {
      $scope.timelineHtml = "";
      $scope.selectedType = 'update';
      if ($scope.currentSetTime == null) {
        $scope.currentSetTime = moment();
      }
      $scope.selectChange();
    };

    $scope.selectWithdraws = function () {
      $scope.selectedType = 'withdraws';
      apiFactory.getWithdrawnPrefix($scope.value)
        .success(function (data) {
          var records = data.v_routes_withdraws.data;
          $scope.WithdrawsOptions.data = records;
        });
    };

    // collapsable card
    $scope.expandCard = function () {
      $scope.isCardExpand = !$scope.isCardExpand;
    };


    // create detail modal after clicking on update/withdraw table rows
    var myModal = new modal();
    $scope.showModal = function () {
      $scope.createDetailModal();
      myModal.open();
    };

    $scope.createDetailModal = function () {
      $scope.showItems = '<table class="modal-table">';
      $scope.itemValueLast = $scope.itemValue.preData;
      console.log($scope.itemValue);
      var keys = [
        'RouterName', 'PeerName', 'Prefix', 'Origin_AS', 'Current_AS_Path', 'Previous_AS_Path', 'ASPath_Count', 'Current_Communities',
        'ExtCommunities', 'ClusterList', 'Aggregator', 'PeerAddress', 'PeerASN', 'IsPeerIPv4', 'IsPeerVPN', 'Id', 'LastModified'
      ];

      angular.forEach($scope.itemValue, function (value, key) {

        if (key == "Prefix") {
          $scope.showItems += ('<tr><td/>Prefix: </td><td>'
            + $scope.itemValue.Prefix + '/' + $scope.itemValue.PrefixLen
            + '</td></tr>'
          );
        }
        else if (key == "Origin") {
          if ((typeof($scope.itemValueLast.Origin) != "undefined")
            && (!angular.equals($scope.itemValueLast.Origin, $scope.itemValue.Origin))) {
            $scope.showItems += (
              '<tr><td>Current_Origin: </td><td>' +
              "<span class='green'>" + $scope.itemValue.Origin + "</span>" +
              '</td></tr>'
            );

            $scope.showItems += (
              '<tr><td>Previous_Origin: </td><td>' + "<span class='red'>" +
              $scope.itemValueLast.Origin + "</span></td></tr>"
            );
          }
        }
        else if (key == "AS_Path") {

          var valueAs = "";
          var valusAsLast = "";
          var ASArray = [];

          angular.forEach($scope.itemValue.AS_Path, function (value, key) {
            if ($scope.itemValue.AS_Path_list[key].flag) {
              valueAs += "<span name='AS" + value + "'>" + value + " " + "</span>";
              if (!ASArray.indexOf(value) > -1) {
                ASArray.push(value);
              }
            }
            else {
              valueAs += "<span class='green' name='AS" + value + "'>" + value + " " + "</span>";
              if (!ASArray.indexOf(value) > -1) {
                ASArray.push(value);
              }
            }
          });

          $scope.showItems += (
            '<tr><td>Current_AS_Path: </td><td>'
            + valueAs
            + '</td></tr>'
          );

          // this part to insert last path as , the same .
          if (!angular.equals($scope.itemValueLast.AS_Path, $scope.itemValue.AS_Path)) {
            angular.forEach($scope.itemValueLast.AS_Path, function (value, key) {
              if ($scope.itemValueLast.AS_Path_list[key].last_flag) {
                valusAsLast += "<span tooltip name='AS" + value + "'>" + value + " " + "</span>";
                if (!ASArray.indexOf(value) > -1) {
                  ASArray.push(value);
                }
              }
              else {
                valusAsLast += "<span tooltip class='red' name='AS" + value + "'>" + value + " " + "</span>";
                if (!ASArray.indexOf(value) > -1) {
                  ASArray.push(value);
                }
              }
            });

            $scope.showItems += (
              '<tr><td>Previous_AS_Path: </td><td>'
              + valusAsLast +
              '</td></tr>'
            );
          }

          // bindTooltipsForAS(ASArray);

        }
        else if (key == "MED") {
          if ((typeof($scope.itemValueLast.MED) != "undefined") && (!angular.equals($scope.itemValueLast.MED, $scope.itemValue.MED))) {
            $scope.showItems += (
              '<tr><td>Current_MED: </td><td>'
              + "<span class='green'>"
              + $scope.itemValue.MED
              + "</span></td></tr>"
            );

            $scope.showItems += (
              '<tr><td>Previous_MED: </td><td>'
              + "<span class='red'>"
              + $scope.itemValueLast.MED
              + "</span></td></tr>"
            );
          }

        }
        else if (key == "NH") {
          if ((typeof($scope.itemValueLast.NH) != "undefined") && (!angular.equals($scope.itemValueLast.NH, $scope.itemValue.NH))) {
            $scope.showItems += (
              '<tr><td>Current_NH: </td><td>'
              + "<span class='green'>"
              + $scope.itemValue.NH
              + "</span></td></tr>"
            );

            $scope.showItems += (
              '<tr><td>Previous_NH: </td><td>'
              + "<span class='red'>"
              + $scope.itemValueLast.NH
              + "</span></td></tr>"
            );
          }
        }
        else if (key == "LocalPref") {
          if ((typeof($scope.itemValueLast.LocalPref) != "undefined") && (!angular.equals($scope.itemValueLast.LocalPref, $scope.itemValue.LocalPref))) {
            $scope.showItems += (
              '<tr>' +
              '<td>' +
              'Current_LocalPref: ' +
              '</td>' +

              '<td>' + "<span class='green'>" +
              $scope.itemValue.LocalPref + "</span>" +
              '</td>' +
              '</tr>'
            );

            $scope.showItems += (
              '<tr>' +
              '<td>' +
              'Previous_LocalPref: ' +
              '</td>' +

              '<td>' + "<span class='red'>" +
              $scope.itemValueLast.LocalPref + "</span>" +
              '</td>' +
              '</tr>'
            );
          }
        }
        else if (key == "Communities") {
          var valueAs = "";
          var valusAsLast = "";

          angular.forEach($scope.itemValue.Communities, function (value, key) {
            if ($scope.itemValue.Communities_list[key].flag) {
              valueAs += value + " ";
            }
            else {
              valueAs = valueAs + "<span class='green'>" + value + " " + "</span>";
            }
          });

          $scope.showItems += (
            '<tr>' +
            '<td>' +
            'Current_Communities: ' +
            '</td>' +

            '<td>' +
            valueAs +
            '</td>' +
            '</tr>'
          );

          // this part to insert last path as , the same .

          if (!angular.equals($scope.itemValueLast.Communities, $scope.itemValue.Communities)) {

            angular.forEach($scope.itemValueLast.Communities, function (value, key) {

              if ($scope.itemValueLast.Communities_list[key].last_flag) {
                valusAsLast += value + " ";
              }
              else {
                valusAsLast += "<span class='red'>" + value + " " + "</span>";
              }
            });


            $scope.showItems += (
              '<tr>' +
              '<td>' +
              'Previous_Communities: ' +
              '</td>' +

              '<td>' +
              valusAsLast +
              '</td>' +
              '</tr>'
            );
          }
        }
        //wow this is super ugly , i will optimize it after cisco live
        else if (keys.contains(key)) {
          $scope.showItems += (
            '<tr>' +
            '<td>' +
            key + ': ' +
            '</td>' +

            '<td>' +
            (key.indexOf("AS" > -1) ? ("<span tooltip name='AS" + value + "'>" + value + " " + "</span>") : value) +
            '</td>' +
            '</tr>'
          );
        }
      });

      if ($scope.showItems === "<table>") {
        $scope.showItems = $scope.showItems + "There is no data right now ,please choose a row first!"
      }
      $scope.showItems += '</table>';
      $rootScope.showItems = $scope.showItems;
    }

  }])
  .directive("updateHistory", ['$compile', function ($compile) {
    function link($scope, element) {
      var drawCircles = function (data) {
        var NUMBER_OF_RECTS = 30;
        var margin = {top: 0, right: 20, bottom: 20, left: 25},
          width = 800,
          height = 200;
        var start_time = moment($scope.currentSetTime - $scope.timeRange.range * 60 * 60000);
        var end_time = $scope.currentSetTime;
        var x = d3.time.scale().range([0, width]).domain([start_time, end_time]);
        var xAxis = d3.svg.axis().scale(x).orient("bottom")
          .tickFormat(d3.time.format("%m/%d %H:%M"));
        var xScale = d3.scale.linear().domain([0, NUMBER_OF_RECTS]).range([0, width]);
        var textchoser = function (number) {
          if (0 == number) {
            return "MED"
          }
          else if (1 == number) {
            return "As Path"
          }
          else if (2 == number) {
            return "Next Hop"
          }
          else if (3 == number) {
            return "Communities"
          }
        };
        var color = [];
        color[0] = d3.scale.linear().range(['#E3F2FD', '#0D47A1']);
        color[1] = d3.scale.linear().range(['#E0F2F1', '#004D40']);
        color[2] = d3.scale.linear().range(['#FFF3E0', '#a691c6']);
        color[3] = d3.scale.linear().range(['#FFEBEE', '#B71C1C']);
        var colorPicker = function (index, r) {
          if (r != 0) {
            return color[index](r);
          } else {
            return "white";
          }
        };

        var strokePicker = function (index, r) {
          if (r != 0) {
            return 'none';
          } else {
            return 'grey';
          }
        };

        var tip = d3.tip()
          .html(function (d, i) {
            if (d != 0) d += 1;
            var time = $scope.currentSetTime;
            var content = moment(time - (NUMBER_OF_RECTS - parseInt(i)) * $scope.timeRange.value * 60000).format("MM/DD HH:mm")
              + "~" + moment(time - (NUMBER_OF_RECTS - 1 - parseInt(i)) * $scope.timeRange.value * 60000).format("MM/DD HH:mm")
              + "<br/><strong>Changes:</strong>" + d;
            return content;
          })
          .offset([-10, 0]);

        var svg = d3.select(element[0])
          .append("svg")
          .attr("width", width)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(" + 15 + "," + 50 + ")")
          .call(xAxis);

        for (var j = 0; j < data.length; j++) {
          var g = svg.append("g")
            .attr("class", "path_attribute")
            .attr("tranform", "translate(20, 0)");
          var circles = g.selectAll("circle")
            .data(data[j])
            .enter()
            .append("circle");
          var text = g.selectAll("text")
            .data(data[j])
            .enter()
            .append("text");
          var rScale = d3.scale.linear()
            .domain([0, d3.max(data[j])])
            .range([2, 12]);
          var radiusCal = function (d) {
            if (d != 0) {
              return rScale(d);
            } else {
              return 5;
            }
          };
          if (d3.max(data[j]) != 0)
            color[j].domain([0, d3.max(data[j])]);
          else
            color[j].domain([0, 1]);

          circles
            .attr("cx", function (d, i) {
              return xScale(i) + margin.left;
            })
            .attr("cy", j * 50 + 100)
            .attr("r", function (d) {
              return radiusCal(d);
            })
            .style("fill", function (d) {
              return colorPicker(j, d);
            })
            .style("stroke", function (d) {
              return strokePicker(j, d);
            })
            .style("cursor", "pointer")
            .style("opacity", .8)
            .call(tip)
            .on("click", function (d, i) {
              $scope.createPrefixHisGrid(i);
              $scope.createTimeline(i);
            })
            .on("mouseout", function (d, i) {
              tip.destroy(d);
            })
            .on('mouseover', function (d, i) {
              tip.attr("class", "d3-tip").show(d, i);
            });

          text
            .attr("y", j * 50 + 100)
            .attr("x", function (d, i) {
              return xScale(i) + margin.left;
            })
            .attr("class", "value")
            .text(function (d) {
              return d;
            })
            .style("fill", function (d) {
              return color[j](d);
            })
            .style("display", "none");

          g.append("text")
            .attr("y", j * 50 + 103)
            .attr("x", width + margin.left + margin.right)
            .attr("class", "label")
            .style("font-size", "18px")
            .text(textchoser(j))
            .style("fill", function (d) {
              return color[j](d3.max(data[j]) == 0 ? 1 : d3.max(data[j]));
            })
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

        }
        function mouseover(p) {
          var g = d3.select(this).node().parentNode;
          d3.select(g).selectAll("circle").style("display", "none");
          d3.select(g).selectAll("text.value").style("display", "block");
        }

        function mouseout(p) {
          var g = d3.select(this).node().parentNode;
          d3.select(g).selectAll("circle").style("display", "block");
          d3.select(g).selectAll("text.value").style("display", "none");
        }
      }; // end of drawCircles

      var removeSvg = function () {
        d3.selectAll("svg").remove();
      };

      $scope.$watch('asPathChange', function (newVal, oldVal) {
        if (typeof(newVal) != "undefined") {
          removeSvg();
          drawCircles(newVal);
        }
      });
    }

    return {
      link: link,
      restrict: 'E'
    }
  }])
  .factory('modal', ['$compile', '$rootScope', function ($compile, $rootScope) {
    return function () {
      var elm;
      var modal = {
        open: function () {

          var html = '<div class="modal" ng-style="modalStyle"><div class="modal-dialog"><div class="modal-content"><div class="modal-body">' + $rootScope.showItems + '</div><div class="modal-footer"><button id="buttonClose" class="cust-btn btn btn-primary" ng-click="close()">Close</button></div></div></div></div>';
          elm = angular.element(html);
          angular.element(document.body).prepend(elm);

          $rootScope.close = function () {
            modal.close();
          };

          $rootScope.modalStyle = {"display": "block"};

          $compile(elm)($rootScope);
        },
        close: function () {
          if (elm) {
            elm.remove();
          }
        }
      };

      return modal;
    };
  }]);
