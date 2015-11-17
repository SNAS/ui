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
        var prefix = $scope.PrefixData[0].Prefix+"/"+$scope.PrefixData[0].PrefixLen;

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

          apiFactory.getWhoisPrefix(prefix).success(function (result) {
            $scope.showPrefixInfo = '<table>';
            $scope.values = result.gen_whois_route.data[0];
            $scope.values['prefix'] = $scope.values['prefix'] + '\\' + $scope.values['prefix_len'];
            delete $scope.values['prefix_len'];
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
          });
        }
        else {
          $scope.showPrefixInfo = '</table>there are not enough information</table>';
        }
      } else {
        $scope.nodata = true;  // nodata
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
        var msg = 'row selected ' + row.isSelected;
        var rowMsg = row.entity.PeerASN;
        $scope.itemValue = row.entity; //how can i get data from one row before
        $scope.createShowTable();
        $scope.$apply()
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
     $scope.createPrefixHisGrid = function (hour) {
      if (typeof $scope.HisData != "undefined") {
        $scope.HistoryPrefixOptions.data = [];
        $scope.HistoryPrefixOptions.data = $scope.HisData[hour];
        $scope.showGrid = true;
        $scope.$apply();
      }
    };

    var getPrefixHisData = function (searchPrefix) {
      if ("All peers" == searchPrefix) {
        apiFactory.getHistoryPrefix(searchPrefix)
          .success(function (data) {

            // still don't know why we need $scope.HistoryPrefixOptions.data here
            $scope.HistoryPrefixOptions.data =  $scope.originHisData = data.v_routes_history.data;

            if($scope.HistoryPrefixOptions.data.length == 0)
            {
              $scope.showTip = "true";
            }
            //prepared the data to put into grid
            getPrefixHisDataHour();
            //createPrefixHisGrid(7);
          });
      }
      else {
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
          //$digest or $apply
          $scope.$apply();
        }
        //$scope.$apply();
      }
    };


    var getPrefixHisDataHour = function () {

      var allHisData = $scope.originHisData.reverse();
      $scope.asPathList = new Array();

      $scope.asPathChangeNumber = new Array(24);
      $scope.asPathChangeRate = new Array(24);
      $scope.HisData = new Array(24);

      $scope.asPathChangeAS_PATH = new Array(24).fill(0);//this is for AS_PATH
      $scope.asPathChangeNH = new Array(24).fill(0);//this is for next hop
      $scope.asPathChangeCommunites = new Array(24).fill(0);//this is for Communites
      $scope.asPathChangeMED = new Array(24).fill(0);

      for(var i = 0; i < 24; i++) {
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

        var hour = parseInt(allHisData[i].LastModified.substring(11, 13));

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
        $scope.HisData[hour].push(allHisData[i]);
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
      for(i = 0; i < 24; i++) {
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

        if(!$scope.$$phase) {
          //$digest or $apply
          $scope.$apply();
        }
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
      getPrefixHisData($scope.currentValue);

      if(!$scope.$$phase) {
        //$digest or $apply
        $scope.$apply();
      }
    };

    $scope.selectUpdates = function() {
      $scope.loading = true;
      $scope.showGrid = false;
      $scope.isUpdatesSelected = true;
      $scope.selectChange();
    };

    $scope.selectWithdraws = function() {
      $scope.isWithdrawsSelected = true;
      console.log($scope.peerData.selectPeer);
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

      angular.forEach($scope.itemValue, function (value,key) {

        //console.log("in the top");
        //console.log("$scope.itemValue",$scope.itemValue);
        //console.log("in the top");
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
        else if(key != "Prefix" && key!= "PrefixLen" && key != "AS_Path_list_flag" && key != "AS_Path_list" && key != "Communities_list" && key != "Communities_list"
          && key != "preData" && key != "AS_Path_list_flag_last" && key != "Communities_list_flag" && key != "Communities_list_flag_last") {
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
  .directive('d3Directive',['$compile', function($compile){
    function link($scope,element,scope){
      var w = 600;
      var h = 20;
      var data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      var colorPicker = function(number,x){
        var color = new Array();
        color[0] = d3.scale.linear().domain([0,50]).range(['#e9ebf1','#848ba9']);
        color[1] = d3.scale.linear().domain([0,50]).range(['#e9f8ff','#5ec7fd']);
        color[2] = d3.scale.linear().domain([0,50]).range(['#e7e2ef','#a691c6']);
        color[3] = d3.scale.linear().domain([0,50]).range(['#f2e2f4','#c65ed8']);
        return "fill:" + color[number](x);
      };

      var textchoser = function(number){
        if (0 == number){return "MED"}
        else if(1 == number){return "As Path"}
        else if(2 == number){return "Next Hop"}
        else if(3 == number){return "Communites"}
      };

      var drawRect = function(index) {

        var number = index;

        var div2 = d3.select(element[0])
          .append("div");

        div2.append("text")
          .text(function(){ return textchoser(number);})
          .style("text-anchor", "middle")
          .attr("x",10);

        var svg2 = div2
          .append("svg")
          .attr("width", w)
          .attr("height", h);

        var tip = d3.tip()
          .html(function(d,i) {
            var content = i + ":00~" + (parseInt(i)+1).toString() + ":00" + " " + "<strong>Number:</strong>" + d ;
            return content;
          });

        svg2.selectAll("rect")
          .data(data)
          .enter()
          .append("rect")
          .attr("x", function(d, i) {
            return (i%24) * 23 + 10;	//Bar width of 20 plus 1 for padding
          })
          .attr("width", 20)
          .attr("y", 0)
          .attr("height", 20)
          //.attr("title","hello world")
          .attr("style",function(d, i){ return colorPicker(number,d);})
          .call(tip)
          .on("click",function(d,i) {
            d3.select(this)
              .attr("style","fill:green");
            $scope.createPrefixHisGrid(i);
          })
          .on("mouseout",function(d,i){
            tip.destroy(d);
            d3.select(this)
              .attr("style",function(){ return colorPicker(number,d);})
          })
          .on("mouseenter",function(d,i){
            d3.select(this)
              .attr("style","fill:#F59AE9")
          })
          .on('mouseover', function(d,i) {
            tip.attr("class", "d3-tip").show(d,i)
          });

        if(!$scope.$$phase) {
          //$digest or $apply
          $scope.$apply();
        }
      };

      // draw four lines of rectangles
      drawRect(0);  // MED
      drawRect(1);  // AS Path
      drawRect(2);  // Communities
      drawRect(3);  // NH

      var removeSvg = function() {
        d3.selectAll("svg").remove();
        d3.selectAll("text").remove();
      };

      $scope.$watch('asPathChange',function(newVal, oldVal) {

        if(typeof(newVal)!="undefined") {
          removeSvg();

          data = newVal[0];
          drawRect(0);

          data = newVal[1];
          drawRect(1);

          data = newVal[3];
          drawRect(3);

          data = newVal[2];
          drawRect(2);

          if (!$scope.$$phase) {
            //$digest or $apply
            $scope.$apply();
          }
        }
      },true)
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





