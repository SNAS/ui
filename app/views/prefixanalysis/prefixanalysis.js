'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:PrefixAnalysisController
 * @description
 * # PrefixAnalysisController
 * Controller of the Login page
 */
angular.module('bmpUiApp')
  .controller('PrefixAnalysisController', ['$scope', 'apiFactory', '$http', '$timeout', '$interval', '$location', '$window', '$anchorScroll','$compile', 'modal', '$stateParams','$rootScope', 'uiGridConstants',function ($scope, apiFactory, $http, $timeout, $interval, $location,$window, $anchorScroll,$compile,modal, $stateParams,$rootScope,uiGridConstants) {
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
          $scope.oneRowSelected = true; // set the bool value to show buttons
          $scope.peerData.selectPeer = row.entity;
        });
      }
    };

    //define the columns
    $scope.AllPrefixOptions.columnDefs = [
      {name: "RouterName", displayName: 'RouterName'},
      {name: "PeerName", displayName: 'PeerName'},
      {name: "PeerAddress", displayName: 'PeerAddress'},
      {name: "PeerASN", displayName: 'Peer_ASN',
        cellTemplate:'<div class="ui-grid-cell-contents"><div bmp-asn-model asn="{{ COL_FIELD }}"></div></div>'
      }
    ];

    $scope.toggleFiltering = function(){
      $scope.AllPrefixOptions.enableFiltering = !$scope.AllPrefixOptions.enableFiltering;
      $scope.AllPrefixGridApi.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
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

    var filterUnique = function(input, key) {
      var unique = {};
      var uniqueList = [];
      //console.log("unique:" + unique);

      for(var i = 0; i < input.length; i++){
        if(typeof unique[input[i][key]] == "undefined"){
          unique[input[i][key]] = "";
          uniqueList.push(input[i]);
          //console.log("uniqueList:" + uniqueList);
        }
      }
      return uniqueList;
    };

    // get the prefix grid and table data ,call createPrefixGridTable() to create a table
    var getPrefixDataGrid = function (value) {
      var prefix = value.split("/")[0];
      apiFactory.getPrefix(prefix)
        .success(function (data) {
          // execute the function and get data successfully.
          $scope.PrefixData = data.v_routes.data;
          $scope.AllPrefixOptions.data = data.v_routes.data;
          var peerDataOriginal = data.v_routes.data;
          $scope.peerData =  filterUnique(peerDataOriginal,"PeerName");
          createPrefixGridTable();
          createOriginASGridTable();
          $scope.allPreLoad=false;
          $timeout(function() {
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
        }
      ).error(function(data, status, headers, config){
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
            if(result.gen_whois_route.data.length>0) {
              $scope.values = result.gen_whois_route.data[0];
              $scope.values['prefix'] = $scope.values['prefix'] + '/' + $scope.values['prefix_len'];
              delete $scope.values['prefix_len'];
            }
            else{
              $scope.values = { "Sorry" :"Didn't find whois information for this prefix!"};
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
          }).error(function (error){
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
          request.success(function (result) {
            $scope.showValues = '<table>';
            $scope.values = result.w.data[0];
            angular.forEach($scope.values, function (value, key) {

              if (key != "raw_output") {
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
        }
      } else {
        $scope.nodata = true;  // nodata
      }
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

    $scope.timeranges.forEach(function(row){
      row.value = row.range * 60 / NUMBER_OF_RECTS;
    });

    var changeTimeRange = function() {
      $scope.loading = true;
      var setDate = $('#endTimePicker').data('DateTimePicker').date();
      $scope.currentSetTime = setDate;
      var searchPrefix = $scope.currentValue + '?hours=' + $scope.timeRange.range + '&ts=' + moment.utc(setDate).format("YYYY-MM-DD HH:mm:ss");
      getPrefixHisData(searchPrefix);
      if(!$scope.$$phase) {
        //$digest or $apply
        $scope.$apply();
      }
    };

    $scope.selectTimeRange = function() {
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
    $scope.setHour = function(hours){
      $scope.timeranges[3].range = hours;
      $scope.timeranges[3].value = hours * 60 / NUMBER_OF_RECTS;
      changeTimeRange();
    };

    $("#endTimePicker").on('dp.hide', function(){
      changeTimeRange();
    });

    $("#endTimePicker").datetimepicker({
      sideBySide: true,
      format: 'MM/DD/YYYY HH:mm:ss',
      defaultDate: moment()
    });

    $scope.setToNow = function(){
      $scope.currentSetTime = moment();
      $("#endTimePicker").data("DateTimePicker").date($scope.currentSetTime);
      changeTimeRange();
    };

    //deal with the data from History of prefix
    $scope.HistoryPrefixOptions = {
      showGridFooter: true,
      enableRowSelection: true,
      enableRowHeaderSelection: false,
      multiSelect: true,
      modifierKeysToMultiSelect: true,
      enableHorizontalScrollbar: 0,
      enableVerticalScrollbar: 1,
      rowHeight: 25,
      height:300,
      gridFooterHeight: 0,
      rowTemplate: '<div class="hover-row-highlight"><div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div></div>'
    };

    // here to get the intemValue , use this  to create table
    $scope.HistoryPrefixOptions.onRegisterApi = function( gridApi ) {
      $scope.HistoryPrefixGridApi = gridApi;

      gridApi.selection.on.rowSelectionChanged($scope,function(row){
        $scope.itemValue = row.entity; //how can i get data from one row before
        console.log($scope.itemValue);
        $scope.showModal();
        //$scope.$apply()
      });
      // test for the sort change
      $scope.HistoryPrefixGridApi.core.notifyDataChange( uiGridConstants.dataChange.EDIT );
    };
    //define the history gird columns

    $scope.HistoryPrefixOptions.columnDefs = [
      {name: "RouterName", displayName: 'RouterName', width: 110, cellClass:'background'},
      {name: "NH", displayName: 'NH', width: 100,cellClass:'background'},
      {name: "AS_Path_list", displayName: 'AS_Path', cellClass:'background',cellTemplate: '<div ng-class="{ \'green greenbar\': !AS_Path_list.flag, whitebar: AS_Path_list.flag,}" ng-repeat="AS_Path_list in row.entity.AS_Path_list">{{AS_Path_list.path}}</div>'},
      {name: "PeerASN", displayName: 'Peer_ASN', width: 130,cellClass:'background'},
      {name: "MED", displayName: 'MED', width: 60,cellClass:'background'},
      {name: "Communities", displayName: 'Communities',cellClass:'background',cellTemplate: '<div ng-class="{\'green greenbarCommunities\': !Communities_list.flag, whitebarCommunities: Communities_list.flag,}" ng-repeat="Communities_list in row.entity.Communities_list">{{Communities_list.path}}</div>'},
      {name: "LastModified", displayName: 'Last_Modified', width: 180,cellClass:'background',

        sort: {
          direction: uiGridConstants.DESC,
          priority: 1
        }

      }
    ];

    // the only Function is creating a history prefix gird , inject data should be $scope.HisData
    $scope.createPrefixHisGrid = function (i) {
      if (typeof $scope.HisData != "undefined") {
        $scope.HistoryPrefixOptions.data = [];
        $scope.HistoryPrefixOptions.data = $scope.HisData[i];
        $scope.showGrid = true;
        $scope.$apply();
      }
    };

    var getPrefixHisData = function (searchPrefix) {
      $scope.peerHashId = $scope.peerData.selectPeer.peer_hash_id;
      apiFactory.getPeerHistoryPrefix(searchPrefix, $scope.peerHashId)
        .success(function (data) {
          $scope.originHisData = data.v_routes_history.data;

          if($scope.originHisData.length == 0)
          {
            $scope.showTip = "true";
          }
          else
          {
            $scope.showTip = "false";
          }
          getPrefixHisDataHour();
        });
      if(!$scope.$$phase) {
        $scope.$apply();
      }
    };

    var getPrefixHisDataHour = function () {

      var allHisData = $scope.originHisData.reverse();
      $scope.asPathList = new Array();

      $scope.asPathChangeNumber = new Array(NUMBER_OF_RECTS);
      $scope.asPathChangeRate = new Array(NUMBER_OF_RECTS);
      $scope.HisData = new Array(NUMBER_OF_RECTS);

      $scope.asPathChangeAS_PATH = new Array(NUMBER_OF_RECTS).fill(0);//this is for AS_PATH
      $scope.asPathChangeNH = new Array(NUMBER_OF_RECTS).fill(0);//this is for next hop
      $scope.asPathChangeCommunites = new Array(NUMBER_OF_RECTS).fill(0);//this is for Communites
      $scope.asPathChangeMED = new Array(NUMBER_OF_RECTS).fill(0);

      for(var i = 0; i < NUMBER_OF_RECTS; i++) {
        $scope.HisData[i] = new Array();
      }

      //contain method:Determine whether an array contains a value
      Array.prototype.contains = function(obj) {
        var i = this.length;
        while (i--) {
          if (this[i] == obj) {
            return true;
          }
        }
        return false;
      };

      for (i = 0; i < allHisData.length; i++) {

        if(0 == i) {
          allHisData[i].preData = "";
        } else {
          allHisData[i].preData = allHisData[i-1];
        }

        var offsetInMin = ($scope.currentSetTime - moment.utc(allHisData[i].LastModified).local())/1000/60;

        // ********* the following code is to create two field to record the As Path changing
        if(typeof(allHisData[i].AS_Path) == "string") {
          allHisData[i].AS_Path = allHisData[i].AS_Path.split(" ");
          allHisData[i].AS_Path =  allHisData[i].AS_Path.slice(1); // remove the first blank
        }

        //split two rows into list
        // split AS_Path into list
        if(i < allHisData.length-1) {
          if(typeof(allHisData[i+1].AS_Path) == "string")
          {
            allHisData[i+1].AS_Path = allHisData[i+1].AS_Path.split(" ");
            allHisData[i+1].AS_Path =  allHisData[i+1].AS_Path.slice(1); // remove the first blank
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

          allHisData[i].AS_Path_list_flag[j] = allHisData[i-1].AS_Path.contains(allHisData[i].AS_Path[j]);

          if(allHisData.length-1 == i) {
            allHisData[i].AS_Path_list_flag_last[j] = true;
          } else {
            allHisData[i].AS_Path_list_flag_last[j] = allHisData[i+1].AS_Path.contains(allHisData[i].AS_Path[j]);
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
        if(typeof(allHisData[i].Communities) == "string") {
          allHisData[i].Communities = allHisData[i].Communities.split(" ");
          //allHisData[i].Communities =  allHisData[i].Communities.slice(1);
        }
        if(i < allHisData.length-1) {
          if(typeof(allHisData[i+1].Communities) == "string") {
            allHisData[i+1].Communities = allHisData[i+1].Communities.split(" ");
            allHisData[i+1].Communities =  allHisData[i+1].Communities.slice(1);
          }
        }

        //to record all the last flag and the last line
        allHisData[i].Communities_list = new Array();
        allHisData[i].Communities_list_flag = [];
        allHisData[i].Communities_list_flag_last = [];

        //initialize all the information
        for (j = 0; j < allHisData[i].Communities.length; j++) {
          if (0 == i){
            allHisData[i].Communities_list_flag[j] = true;
            continue;
          }
          allHisData[i].Communities_list_flag[j] = allHisData[i-1].Communities.contains(allHisData[i].Communities[j]);
          if(allHisData.length-1 == i) {
            allHisData[i].Communities_list_flag_last[j] = true;
          } else {
            allHisData[i].Communities_list_flag_last[j] = allHisData[i+1].Communities.contains(allHisData[i].Communities[j]);
          }
        }

        for (j = 0; j < allHisData[i].Communities.length; j++) {
          allHisData[i].Communities_list[j] = new Array();
          allHisData[i].Communities_list[j]["path"] = allHisData[i].Communities[j];
          allHisData[i].Communities_list[j]["flag"] = allHisData[i].Communities_list_flag[j];
          allHisData[i].Communities_list[j]["last_flag"] = allHisData[i].Communities_list_flag_last[j];
        }
// ********* the  above code is to create two field to record the Communities changing
        if (offsetInMin/$scope.timeRange.value <= NUMBER_OF_RECTS)
          $scope.HisData[NUMBER_OF_RECTS-Math.ceil(offsetInMin/$scope.timeRange.value)].push(allHisData[i]);
      }

      Array.prototype.compare = function (array) {
        // if the other array is a falsy value, return
        if (!array)
          return false;

        // compare lengths - can save a lot of time
        if (this.length != array.length)
          return false;

        for (var i = 0, l=this.length; i < l; i++) {
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
      for(i = 0; i < NUMBER_OF_RECTS; i++) {
        $scope.asPathChangeNumber[i] = $scope.HisData[i].length;

        for(var j = 1;j < $scope.HisData[i].length; j++) {
          if(!$scope.HisData[i][j-1].AS_Path.compare($scope.HisData[i][j].AS_Path)){
            $scope.asPathChangeAS_PATH[i] = $scope.asPathChangeAS_PATH[i] + 1;
          }
          if(!($scope.HisData[i][j-1].NH === $scope.HisData[i][j].NH)){
            $scope.asPathChangeNH[i] = $scope.asPathChangeNH[i] + 1;
          }
          if(!(angular.equals($scope.HisData[i][j-1].Communities,$scope.HisData[i][j].Communities))){
          //if(!($scope.HisData[i][j-1].Communities === $scope.HisData[i][j].Communities)){
            $scope.asPathChangeCommunites[i] = $scope.asPathChangeCommunites[i] + 1;
          }
          if(!($scope.HisData[i][j-1].MED === $scope.HisData[i][j].MED)){
            $scope.asPathChangeMED[i] = $scope.asPathChangeMED[i] + 1;
          }
        }

        $scope.asPathChange = [];
        $scope.asPathChange[0] = $scope.asPathChangeMED ;
        $scope.asPathChange[1] = $scope.asPathChangeAS_PATH;
        $scope.asPathChange[2] = $scope.asPathChangeNH;
        $scope.asPathChange[3] = $scope.asPathChangeCommunites;
      }
      if(!$scope.$$phase) {
        //$digest or $apply
        $scope.$apply();
      }
      $scope.loading = false;
    };

    //should be put into init()
    var init = function() {
      $scope.showTip = "false";
      $scope.value = "209.212.8.0/24";
      getPrefixDataGrid($scope.value);
    };

    if($stateParams.p != 'defaultPrefix'){
      $scope.value = $stateParams.p;
      getPrefixDataGrid($scope.value);
    } else {
      init();
    }

    $scope.selectChange = function(){
      //getPrefixHisGrid($scope.currentValue);

      if(typeof($scope.currentValue) == "undefined"){
        $scope.currentValue = $scope.value;
      }
      getPrefixHisData($scope.currentValue+"?hours=2"); //default fetch data in the past two hours

      if(!$scope.$$phase) {
        //$digest or $apply
        $scope.$apply();
      }
    };

    $scope.selectUpdates = function() {
      $scope.loading = true;
      $scope.showGrid = false;
      $scope.isUpdatesSelected = true;
      if ($scope.currentSetTime == null) {
        $scope.currentSetTime = moment();
      }
      $scope.selectChange();
    };

    /**************** For Withdraws part *************************/

    $scope.selectWithdraws = function() {
      $scope.isWithdrawsSelected = true;
      apiFactory.getTopPrefixWithdrawsByPeer($scope.peerData.selectPeer['peer_hash_id'])
        .success(function(data) {
          var records = data.log.data;
          $scope.WithdrawsOptions.data = records;
        });
    };

    /************** For withdrawn table ***********/
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
      //rowTemplate: '<div class="hover-row-highlight"><div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div></div>'
    };

    $scope.WithdrawsOptions.columnDefs = [
      {name: "PeerAddr", displayName: 'Peer Address', cellClass:'background'},
      {name: "Prefix", displayName: 'NH', cellClass:'background'},
      {name: "RouterName", displayName: 'Router Name', cellClass:'background'},
      {name: "Count", displayName: 'Count', cellClass:'background'}
    ];

    /************************ END for withdraws part *********************/

    var myModal = new modal();

    $scope.showModal = function() {
      $scope.createShowTable();
      myModal.open();
    };

    // createShowTable function is to add a table in showDetails modal.
    $scope.createShowTable = function()
    {
      $scope.showItems = '<table class="modal-table">';
      $scope.itemValueLast = $scope.itemValue.preData;
      console.log($scope.itemValue);
      var keys = [
        'RouterName', 'PeerName', 'Prefix', 'Origin_AS', 'Current_AS_Path', 'Previous_AS_Path', 'ASPath_Count', 'Current_Communities',
        'ExtCommunities', 'ClusterList', 'Aggregator', 'PeerAddress', 'PeerASN', 'IsPeerIPv4', 'IsPeerVPN', 'Id', 'LastModified'
      ]

      angular.forEach($scope.itemValue, function (value,key) {


        if(key == "Prefix")
        {
          $scope.showItems += (
          '<tr>' +
          '<td>' +
          'Prefix: ' +
          '</td>' +

          '<td>'  + $scope.itemValue.Prefix  + '/' + $scope.itemValue.PrefixLen +
          '</td>' +
          '</tr>'
          );
        }
        else if (key == "Origin")
        {
            if((typeof($scope.itemValueLast.Origin)!= "undefined")&&(!angular.equals($scope.itemValueLast.Origin, $scope.itemValue.Origin)))
            {
              $scope.showItems += (
              '<tr>' +
              '<td>' +
              'Current_Origin: ' +
              '</td>' +

              '<td>' + "<span class='green'>" + $scope.itemValue.Origin  + "</span>" +
              '</td>' +
              '</tr>'
              );

              $scope.showItems += (
              '<tr>' +
              '<td>' +
              'Previous_Origin: ' +
              '</td>' +

              '<td>' + "<span class='red'>" +
              $scope.itemValueLast.Origin + "</span>" +
              '</td>' +
              '</tr>'
              );
            }
        }
        else if (key == "AS_Path")
        {

          var valueAs = "";
          var valusAsLast = "";

          angular.forEach($scope.itemValue.AS_Path,function(value,key)
          {
            if($scope.itemValue.AS_Path_list[key].flag){
              valueAs += value + " ";
            }
            else{
              valueAs += "<span class='green'>" + value + " " + "</span>";
            }
          });

          $scope.showItems += (
          '<tr>' +
          '<td>' +
          'Current_AS_Path: ' +
          '</td>' +

          '<td>' +
          valueAs +
          '</td>' +
          '</tr>'
          );

          // this part to insert last path as , the same .
          if(!angular.equals($scope.itemValueLast.AS_Path, $scope.itemValue.AS_Path))
          {

              angular.forEach($scope.itemValueLast.AS_Path,function(value,key)
              {

                if($scope.itemValueLast.AS_Path_list[key].last_flag)
                {
                  valusAsLast += value + " ";
                }
                else
                {
                  valusAsLast += "<span class='red'>" + value + " " +"</span>";
                }
              })


            $scope.showItems += (
            '<tr>' +
            '<td>' +
            'Previous_AS_Path: ' +
            '</td>' +

            '<td>' +
            valusAsLast +
            '</td>' +
            '</tr>'
            );
          }
        }
        else if (key == "MED")
        {
            if((typeof($scope.itemValueLast.MED)!= "undefined")&&(!angular.equals($scope.itemValueLast.MED, $scope.itemValue.MED)))
            {
              $scope.showItems += (
              '<tr>' +
              '<td>' +
              'Current_MED: ' +
              '</td>' +

              '<td>' + "<span class='green'>" +
              $scope.itemValue.MED + "</span>" +
              '</td>' +
              '</tr>'
              );

              $scope.showItems += (
              '<tr>' +
              '<td>' +
              'Previous_MED: ' +
              '</td>' +

              '<td>' +  "<span class='red'>" +
              $scope.itemValueLast.MED + "</span>" +
              '</td>' +
              '</tr>'
              );
            }

        }
        else if (key == "NH")
        {
          if((typeof($scope.itemValueLast.NH)!= "undefined")&&(!angular.equals($scope.itemValueLast.NH, $scope.itemValue.NH)))
          {
            $scope.showItems += (
            '<tr>' +
            '<td>' +
            'Current_NH: ' +
            '</td>' +

            '<td>' + "<span class='green'>" +
            $scope.itemValue.NH + "</span>" +
            '</td>' +
            '</tr>'
            );

            $scope.showItems += (
            '<tr>' +
            '<td>' +
            'Previous_NH: ' +
            '</td>' +

            '<td>' +  "<span class='red'>" +
            $scope.itemValueLast.NH + "</span>" +
            '</td>' +
            '</tr>'
            );
          }
        }
        else if (key == "LocalPref")
        {
          if((typeof($scope.itemValueLast.LocalPref)!= "undefined")&&(!angular.equals($scope.itemValueLast.LocalPref, $scope.itemValue.LocalPref)))
          {
            $scope.showItems += (
            '<tr>' +
            '<td>' +
            'Current_LocalPref: ' +
            '</td>' +

            '<td>' +  "<span class='green'>" +
            $scope.itemValue.LocalPref +  "</span>" +
            '</td>' +
            '</tr>'
            );

            $scope.showItems += (
            '<tr>' +
            '<td>' +
            'Previous_LocalPref: ' +
            '</td>' +

            '<td>' +  "<span class='red'>" +
            $scope.itemValueLast.LocalPref + "</span>" +
            '</td>' +
            '</tr>'
            );
          }
        }
        else if (key == "Communities")
        {
          var valueAs = "";
          var valusAsLast = "";

          angular.forEach($scope.itemValue.Communities,function(value,key)
          {
            if($scope.itemValue.Communities_list[key].flag)
            {
              valueAs += value + " ";
            }
            else
            {
              valueAs = valueAs + "<span class='green'>" + value + " " +"</span>";
            }
          })

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

          if(!angular.equals($scope.itemValueLast.Communities, $scope.itemValue.Communities))
          {

            angular.forEach($scope.itemValueLast.Communities,function(value,key)
            {

              if($scope.itemValueLast.Communities_list[key].last_flag)
              {
                valusAsLast += value + " ";
              }
              else
              {
                valusAsLast += "<span class='red'>" + value + " " +"</span>";
              }
            })


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
        else if(keys.contains(key)) {
          $scope.showItems += (
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

      if($scope.showItems==="<table>"){$scope.showItems = $scope.showItems + "There is no data right now ,please choose a row first!"}
      $scope.showItems += '</table>';
      $rootScope.showItems = $scope.showItems;
    }

  }])
  .directive("updateHistory", ['$compile', function($compile){
    function link($scope, element) {
      var drawCircles = function (data) {
        var NUMBER_OF_RECTS = 30;
        var margin = {top: 0, right: 20, bottom: 0, left: 20},
          width = 800,
          height = 200;
        var start_time = moment.utc($scope.currentSetTime - $scope.timeRange.range*60*60000).local();
        var end_time = $scope.currentSetTime;
        var x = d3.time.scale().range([0, width]).domain([start_time, end_time]);
        var xAxis = d3.svg.axis().scale(x).orient("bottom")
          .tickFormat(d3.time.format("%m/%d %H:%M"));
        var xScale = d3.scale.linear().domain([0, NUMBER_OF_RECTS]).range([0, width]);
        var textchoser = function(number){
          if (0 == number){return "MED"}
          else if(1 == number){return "As Path"}
          else if(2 == number){return "Next Hop"}
          else if(3 == number){return "Communities"}
        };
        var color = [];
        color[0] = d3.scale.linear().range(['#E3F2FD','#0D47A1']);
        color[1] = d3.scale.linear().range(['#E0F2F1','#004D40']);
        color[2] = d3.scale.linear().range(['#FFF3E0','#a691c6']);
        color[3] = d3.scale.linear().range(['#FFEBEE','#B71C1C']);
        var colorPicker = function(index, r) {
          if (r != 0) {
            return color[index](r);
          } else {
            return "white";
          }
        };

        var strokePicker = function(index, r) {
          if (r != 0) {
            return 'none';
          } else {
            return 'grey';
          }
        };

        var tip = d3.tip()
          .html(function(d,i) {
            if (d != 0) d += 1;
            var time = $scope.currentSetTime;
            var content = moment.utc(time - (NUMBER_OF_RECTS-parseInt(i))*$scope.timeRange.value*60000).local().format("MM/DD HH:mm")
              +"~"+ moment.utc(time - (NUMBER_OF_RECTS-1-parseInt(i))* $scope.timeRange.value*60000).local().format("MM/DD HH:mm")
              +"<br/><strong>Changes:</strong>" + d;
            return content;
          });

        var svg = d3.select(element[0])
          .append("svg")
          .attr("width", width)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(" + 7 + "," + 50 + ")")
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
          var radiusCal = function(d) {
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
            .attr("cx", function(d, i) { return xScale(i) + margin.left; })
            .attr("cy", j*50 + 100)
            .attr("r", function(d) { return radiusCal(d); })
            .style("fill", function(d) { return colorPicker(j, d); })
            .style("stroke", function(d) {return strokePicker(j, d); })
            .style("opacity",.8)
            .call(tip)
            .on("click",function(d, i) {
              $scope.createPrefixHisGrid(i);
            })
            .on("mouseout",function(d,i){
              tip.destroy(d);
            })
            .on('mouseover', function(d,i) {
              tip.attr("class", "d3-tip").show(d,i);
            });

          text
            .attr("y", j*50 + 100)
            .attr("x", function(d, i) { return xScale(i) + margin.left; })
            .attr("class", "value")
            .text(function(d) { return d; })
            .style("fill", function(d) { return color[j](d); })
            .style("display", "none");

          g.append("text")
            .attr("y", j*50 + 103)
            .attr("x", width + margin.left + margin.right)
            .attr("class", "label")
            .style("font-size", "18px")
            .text(textchoser(j))
            .style("fill", function(d) { return color[j](d3.max(data[j]) == 0 ? 1 : d3.max(data[j])); })
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
          d3.select(g).selectAll("circle").style("display","block");
          d3.select(g).selectAll("text.value").style("display","none");
        }

        if(!$scope.$$phase) {
          //$digest or $apply
          $scope.$apply();
        }
      }; // end of drawCircles

      var removeSvg = function() {
        d3.selectAll("svg").remove();
      };

      $scope.$watch('asPathChange',function(newVal, oldVal) {
        if (typeof(newVal) != "undefined") {
          removeSvg();
          drawCircles(newVal);
          if (!$scope.$$phase) {
            //$digest or $apply
            $scope.$apply();
          }
        }
      });


    }
    return {
      link: link,
      restrict: 'E'
    }
  }])
.factory('modal', ['$compile', '$rootScope', function ($compile, $rootScope) {
  return function() {
    var elm;
    var modal = {
      open: function() {

        var html = '<div class="modal" ng-style="modalStyle"><div class="modal-dialog"><div class="modal-content"><div class="modal-body">' + $rootScope.showItems + '</div><div class="modal-footer"><button id="buttonClose" class="cust-btn btn btn-primary" ng-click="close()">Close</button></div></div></div></div>';
        elm = angular.element(html);
        angular.element(document.body).prepend(elm);

        $rootScope.close = function() {
          modal.close();
        };

        $rootScope.modalStyle = {"display": "block"};

        $compile(elm)($rootScope);
      },
      close: function() {
        if (elm) {
          elm.remove();
        }
      }
    };

    return modal;
  };
}]);





