'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:PrefixAnalysisController
 * @description
 * # PrefixAnalysisController
 * Controller of the Login page
 */
angular.module('bmpUiApp')
  .controller('PrefixAnalysisController', ['$scope', 'apiFactory', '$http', '$timeout', '$interval', '$location', '$window', '$anchorScroll','$compile', 'modal', '$stateParams','$rootScope', function ($scope, apiFactory, $http, $timeout, $interval, $location,$window, $anchorScroll,$compile,modal, $stateParams,$rootScope) {
    //DEBUG

    // resize the window
    window.SCOPE = $scope;

    //Create the  prefix data grid
    $scope.AllPrefixOptions = {
      showGridFooter: true,
      enableRowSelection: true,
      enableRowHeaderSelection: false,
      enableHorizontalScrollbar: 0,
      enableVerticalScrollbar: 1,
      rowHeight: 25
    };

    //define the columns
    $scope.AllPrefixOptions.columnDefs = [
      {name: "RouterName", displayName: 'RouterName', width: 110},
      {name: "PeerName", displayName: 'PeerName', width: 100},
      {name: "NH", displayName: 'NH', width: 100},
      {name: "AS_Path", displayName: 'AS_Path'},
      {name: "PeerASN", displayName: 'Peer_ASN', width: 80},
      {name: "MED", displayName: 'MED', width: 60},
      {name: "Communities", displayName: 'Communities'},
      {name: "LastModified", displayName: 'Last_Modified', width: 150}
    ];

    //Waits a bit for user to continue typing.
    $scope.enterValue = function (value) {
      $scope.currentValue = value;
      console.log(value);
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
      apiFactory.getPrefix(value)
        .success(function (data) {
          // execute the function and get data successfully.
          $scope.AllPrefixOptions.data = $scope.PrefixData = data.v_routes.data;
          //$scope.PrefixData = data.v_routes.data;
          //console.log($scope.PrefixData);
          var peerDataOriginal = data.v_routes.data;
          $scope.peerData =  filterUnique(peerDataOriginal,"PeerName");
          createPrefixGridTable();
          $scope.allPreLoad=false;
        });
    };

    if($stateParams.prefix){
      $scope.value = $stateParams.prefix;
      getPrefixDataGrid($stateParams.prefix);
    }

    // define the Prefix Data create function
    var createPrefixGridTable = function () {
      $scope.AllPrefixOptions.data = $scope.PrefixData;
      //$scope.$apply();

      var Origin_AS = $scope.PrefixData[0].Origin_AS;

      // create the table
      var url = apiFactory.getWhoIsWhereASNSync(Origin_AS);

      console.log(url);

      //notice : synchronization
      var request = $http({
        method: "get",
        url: url
      });
      request.success(function (result) {
        $scope.showValues = '<table>';
        //console.log(result);
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
    };

    //deal with the data from History of prefix
    $scope.HistoryPrefixOptions = {
      enableRowSelection: true,
      enableRowHeaderSelection: false,
      multiSelect: true,
      modifierKeysToMultiSelect: true,
      enableHorizontalScrollbar: 0,
      enableVerticalScrollbar: 1,
      rowHeight: 25
    };

    // here to get the intemValue , use this  to create table
    $scope.HistoryPrefixOptions.onRegisterApi = function( gridApi ) {
      $scope.gridApi = gridApi;

      gridApi.selection.on.rowSelectionChanged($scope,function(row){
        var msg = 'row selected ' + row.isSelected;
        var rowMsg = row.entity.PeerASN;

        $scope.itemValue = row.entity; //how can i get data from one row before

        //$scope.gridApi.selection.selectRow(row);
        //rowColSelectIndex(row);
        //console.log("$scope.itemValue",msg,$scope.itemValue );
        //console.log(rowMsg);
        //console.log("now it 's time to exectute create show table function")
        $scope.createShowTable();
        $scope.$apply()
      });

    };
    //define the history gird columns
    $scope.HistoryPrefixOptions.columnDefs = [
      {name: "RouterName", displayName: 'RouterName', width: 110, cellClass:'background'},
      {name: "NH", displayName: 'NH', width: 100,cellClass:'background'},
      {name: "AS_Path_list", displayName: 'AS_Path', cellClass:'background',cellTemplate: '<div ng-class="{greenbar: !AS_Path_list.flag, whitebar: AS_Path_list.flag,}" ng-repeat="AS_Path_list in row.entity.AS_Path_list">{{AS_Path_list.path}}</div>'},
      {name: "PeerASN", displayName: 'Peer_ASN', width: 130,cellClass:'background'},
      {name: "MED", displayName: 'MED', width: 60,cellClass:'background'},
      {name: "Communities", displayName: 'Communities',cellClass:'background',cellTemplate: '<div ng-class="{greenbarCommunities: !Communities_list.flag, whitebarCommunities: Communities_list.flag,}" ng-repeat="Communities_list in row.entity.Communities_list">{{Communities_list.path}}</div>'},
      {name: "LastModified", displayName: 'Last_Modified', width: 180,cellClass:'background'}
    ];

    // the only Function is creatinga history prefix gird , inject data should be $scope.HisData
     $scope.createPrefixHisGrid = function (hour) {
      console.log($scope.HisData);
      if (typeof $scope.HisData != "undefined") {
        $scope.HistoryPrefixOptions.data = [];
        $scope.HistoryPrefixOptions.data = $scope.HisData[hour];

        //console.log("$scope.HistoryPrefixOptions.data",$scope.HistoryPrefixOptions.data);
        $scope.$apply();
        //$location.hash('bottom');
        //$anchorScroll();

      }
      ;
    };

    var getPrefixHisData = function (searchPrefix) {
      if ("All peers" == searchPrefix) {
        apiFactory.getHistoryPrefix(searchPrefix)
          .success(function (data) {
            console.log("here is for all peers");

            // still dont know why we need $scope.HistoryPrefixOptions.data here
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
        console.log(searchPrefix+" "+$scope.peerHashId);
        apiFactory.getPeerHistoryPrefix(searchPrefix, $scope.peerHashId)
          .success(function (data) {
            console.log("getPrefixHisData has been executed:" + searchPrefix + ' ' + $scope.peerHashId);
            console.log("http://odl-dev.openbmp.org:8001/db_rest/v1/" + "rib/peer/" + $scope.peerHashId +"/history/"+ searchPrefix);
            $scope.originHisData = data.v_routes_history.data;

            //console.log("$scope.originHisData:" + $scope.originHisData);

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

      //console.log(allHisData);
      $scope.asPathChangeNumber = new Array(24);
      $scope.asPathChangeRate = new Array(24);
      $scope.HisData = new Array(24);

      $scope.asPathChangeAS_PATH = new Array(24);//this is for AS_PATH
      $scope.asPathChangeHP = new Array(24);//this is for HP
      $scope.asPathChangeCommunites = new Array(24);//this is for Communites
      $scope.asPathChangeMED = new Array(24);

      for(var i = 0; i < 24; i++)
      {
        $scope.asPathChangeAS_PATH[i] = 0;
        $scope.asPathChangeHP[i] = 0;
        $scope.asPathChangeCommunites[i] = 0;
        $scope.asPathChangeMED[i] = 0;
      }

      //console.log($scope.asPathChangeHP);


      for(var i = 0; i < 24; i++)
      {
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
      }

      for (i = 0; i < allHisData.length; i++) {

        if(0 == i)
        {
          allHisData[i].preData = "";
        }
        else
        {
          allHisData[i].preData = allHisData[i-1];
        }

        var hour = parseInt(allHisData[i].LastModified.substring(11, 13));


        // ********* the following code is to create two field to record the As Path changing
        if(typeof(allHisData[i].AS_Path) == "string")
        {
          allHisData[i].AS_Path = allHisData[i].AS_Path.split(" ");
          allHisData[i].AS_Path =  allHisData[i].AS_Path.slice(1);
        }

        //split two rows into list
        if(i < allHisData.length-1)
        {
          if(typeof(allHisData[i+1].AS_Path) == "string")
          {
            allHisData[i+1].AS_Path = allHisData[i+1].AS_Path.split(" ");
            allHisData[i+1].AS_Path =  allHisData[i+1].AS_Path.slice(1);
          }
        }


        //to record all the last flag and the last line

        allHisData[i].AS_Path_list = new Array();

        allHisData[i].AS_Path_list_flag = [];

        allHisData[i].AS_Path_list_flag_last = [];

        //initialize all the information
        for (j = 0; j < allHisData[i].AS_Path.length; j++)
        {
          //console.log("Hi i am here");
          if (0 == i){ allHisData[i].AS_Path_list_flag[j] = true;console.log("hi , it's true");continue; }

          allHisData[i].AS_Path_list_flag[j] = allHisData[i-1].AS_Path.contains(allHisData[i].AS_Path[j]);

          if(allHisData.length-1 == i)
          {
            console.log("has this been executed ?!!!!!");
            allHisData[i].AS_Path_list_flag_last[j] = true;
          }
          else
          {
            allHisData[i].AS_Path_list_flag_last[j] = allHisData[i+1].AS_Path.contains(allHisData[i].AS_Path[j]);
          }
        }

        for (j = 0; j < allHisData[i].AS_Path.length; j++)
        {
          allHisData[i].AS_Path_list[j] = new Array();
          allHisData[i].AS_Path_list[j]["path"] = allHisData[i].AS_Path[j];
          allHisData[i].AS_Path_list[j]["flag"] = allHisData[i].AS_Path_list_flag[j];
          allHisData[i].AS_Path_list[j]["last_flag"] = allHisData[i].AS_Path_list_flag_last[j];
        }
        // ********* the  above code is to create two field to record the As Path changing



// ********* the following code is to create two field to record the Communities changing
//        console.log("#################################");
//        console.log("allHisData[i]",allHisData[i]);
//        console.log("allHisData[i].Communities",allHisData[i].Communities);
//        console.log("#################################");

        if(typeof(allHisData[i].Communities) == "string")
        {
          allHisData[i].Communities = allHisData[i].Communities.split(" ");
          allHisData[i].Communities =  allHisData[i].Communities.slice(1);
        }

//split two rows into list
        if(i < allHisData.length-1)
        {
          if(typeof(allHisData[i+1].Communities) == "string")
          {
            allHisData[i+1].Communities = allHisData[i+1].Communities.split(" ");
            allHisData[i+1].Communities =  allHisData[i+1].Communities.slice(1);
          }
        }


//to record all the last flag and the last line

        allHisData[i].Communities_list = new Array();

        allHisData[i].Communities_list_flag = [];

        allHisData[i].Communities_list_flag_last = [];

//initialize all the information
        for (j = 0; j < allHisData[i].Communities.length; j++)
        {
          //console.log("Hi i am here");
          if (0 == i){ allHisData[i].Communities_list_flag[j] = true;console.log("hi , it's true");continue; }

          allHisData[i].Communities_list_flag[j] = allHisData[i-1].Communities.contains(allHisData[i].Communities[j]);

          if(allHisData.length-1 == i)
          {
            console.log("has this been executed ?!!!!!");
            allHisData[i].Communities_list_flag_last[j] = true;
          }
          else
          {
            allHisData[i].Communities_list_flag_last[j] = allHisData[i+1].Communities.contains(allHisData[i].Communities[j]);
          }
        }

        for (j = 0; j < allHisData[i].Communities.length; j++)
        {
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
      }

      // to caculate the data color
      for(i = 0; i < 24; i++)
      {
        $scope.asPathChangeNumber[i] = $scope.HisData[i].length;

        //$scope.asPathChangeRate[i] = $scope.asPathChangeNumber[i]/$scope.originHisData.length;

        for(var j = 1;j < $scope.HisData[i].length;j++)
        {
          //console.log(i,j);

          if(!$scope.HisData[i][j-1].AS_Path.compare($scope.HisData[i][j].AS_Path)){
            //console.log($scope.asPathChangeAS_PATH[i]);
            //console.log($scope.HisData[i][j-1].AS_Path,$scope.HisData[i][j].AS_Path)
            //console.log($scope.HisData[i][j-1].AS_Path == $scope.HisData[i][j].AS_Path)

            $scope.asPathChangeAS_PATH[i] = $scope.asPathChangeAS_PATH[i] + 1;
          }
          if(!($scope.HisData[i][j-1].NH === $scope.HisData[i][j].NH)){
            $scope.asPathChangeHP[i] = $scope.asPathChangeHP[i] + 1;
          }

          if(!(angular.equals($scope.HisData[i][j-1].Communities,$scope.HisData[i][j].Communities))){
          //if(!($scope.HisData[i][j-1].Communities === $scope.HisData[i][j].Communities)){
            $scope.asPathChangeCommunites[i] = $scope.asPathChangeCommunites[i] + 1;
          }

          if(!($scope.HisData[i][j-1].MED === $scope.HisData[i][j].MED)){
            $scope.asPathChangeMED[i] = $scope.asPathChangeMED[i] + 1;
        }
      }

      $scope.asPathChange = new Array();
      $scope.asPathChange[0] = $scope.asPathChangeMED ;
      $scope.asPathChange[1] = $scope.asPathChangeAS_PATH;
      $scope.asPathChange[2] = $scope.asPathChangeHP;
      $scope.asPathChange[3] = $scope.asPathChangeCommunites;

      if(!$scope.$$phase) {
        //$digest or $apply
        $scope.$apply();
      }
    }
    }

    //should be put into init()
    var init = function()
    {
      //$scope.showGrid = 'true';
      $scope.showGrid = "false";
      $scope.showTip = "false";
      $scope.value = "202.70.64.0/21";
      getPrefixDataGrid($scope.value);
    }

    init();

    $scope.selectChange = function(){
      //getPrefixHisGrid($scope.currentValue);
      $scope.showGrid = "false";

      console.log("selectChange has been executed")
      console.log("show the currentValue",$scope.currentValue);
      if(typeof($scope.currentValue) == "undefined"){$scope.currentValue = $scope.value;console.log("show the Value",$scope.value);}
      getPrefixHisData($scope.currentValue);

      if(!$scope.$$phase) {
        //$digest or $apply
        $scope.$apply();
      }
    }

    var myModal = new modal();

    $scope.showModal = function() {
      $scope.createShowTable();
      myModal.open();
    };


    // createShowTable function is to add a table in showDetails modal.
    $scope.createShowTable = function()
    {
      $scope.showItems = '<table class="modalTable">';
      $scope.itemValueLast = $scope.itemValue.preData;

      angular.forEach($scope.itemValue, function (value,key) {

        //console.log("in the top");
        //console.log("$scope.itemValue",$scope.itemValue);
        //console.log("in the top");
        if (key == "Origin")
        {
          {
            if(!angular.equals($scope.itemValueLast.Origin, $scope.itemValue.Origin))
            {
              $scope.showItems += (
              '<tr>' +
              '<td>' +
              'Current_Origin: ' +
              '</td>' +

              '<td>' + "<div class='singleWordGreen'>" + $scope.itemValue.Origin  + "</div>" +
              '</td>' +
              '</tr>'
              );

              $scope.showItems += (
              '<tr>' +
              '<td>' +
              'Previous_Origin: ' +
              '</td>' +

              '<td>' + "<div class='singleWordRed'>" +
              $scope.itemValueLast.Origin + "</div>" +
              '</td>' +
              '</tr>'
              );
            }
          }

        }
        else if (key == "AS_Path")
        {

          //$scope.itemValueTemp = $scope.itemValue;
          //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%");
          //console.log("$scope.itemValueLast", $scope.itemValueLast);
          console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
          console.log("$scope.itemValue",$scope.itemValue);
          console.log("##################################");
          //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%");
          //
          //console.log(typeof(value),value);

          var valueAs = "";
          var valusAsLast = "";

          angular.forEach($scope.itemValue.AS_Path,function(value,key)
          {
            if($scope.itemValue.AS_Path_list[key].flag)
            {
              valueAs = valueAs + "<div class='whitebar'>" + value +"</div>";
            }
            else
            {
              valueAs = valueAs + "<div class='greenbar'>" + value +"</div>";
            }
          })

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
                  valusAsLast = valusAsLast + "<div class='whitebar'>" + value +"</div>";
                }
                else
                {
                  valusAsLast = valusAsLast + "<div class='redbar'>" + value +"</div>";
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
            if(!angular.equals($scope.itemValueLast.MED, $scope.itemValue.MED))
            {
              $scope.showItems += (
              '<tr>' +
              '<td>' +
              'Current_MED: ' +
              '</td>' +

              '<td>' + "<div class='singleWordGreen'>" +
              $scope.itemValue.MED + "</div>" +
              '</td>' +
              '</tr>'
              );

              $scope.showItems += (
              '<tr>' +
              '<td>' +
              'Previous_MED: ' +
              '</td>' +

              '<td>' +  "<div class='singleWordRed'>" +
              $scope.itemValueLast.MED + "</div>" +
              '</td>' +
              '</tr>'
              );
            }

        }
        else if (key == "NH")
        {
          if(!angular.equals($scope.itemValueLast.NH, $scope.itemValue.NH))
          {
            $scope.showItems += (
            '<tr>' +
            '<td>' +
            'Current_NH: ' +
            '</td>' +

            '<td>' + "<div class='singleWordGreen'>" +
            $scope.itemValue.NH + "</div>" +
            '</td>' +
            '</tr>'
            );

            $scope.showItems += (
            '<tr>' +
            '<td>' +
            'Previous_NH: ' +
            '</td>' +

            '<td>' +  "<div class='singleWordRed'>" +
            $scope.itemValueLast.NH + "</div>" +
            '</td>' +
            '</tr>'
            );
          }
        }
        else if (key == "LocalPref")
        {
          if(!angular.equals($scope.itemValueLast.LocalPref, $scope.itemValue.LocalPref))
          {
            $scope.showItems += (
            '<tr>' +
            '<td>' +
            'Current_LocalPref: ' +
            '</td>' +

            '<td>' +  "<div class='singleWordGreen'>" +
            $scope.itemValue.LocalPref +  "</div>" +
            '</td>' +
            '</tr>'
            );

            $scope.showItems += (
            '<tr>' +
            '<td>' +
            'Previous_LocalPref: ' +
            '</td>' +

            '<td>' +  "<div class='singleWordRed'>" +
            $scope.itemValueLast.LocalPref + "</div>" +
            '</td>' +
            '</tr>'
            );
          }
        }
        else if (key == "Communities")
        {
          //$scope.itemValueTemp = $scope.itemValue;
          //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%");
          //console.log("$scope.itemValueLast", $scope.itemValueLast);
          console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
          console.log("$scope.itemValue",$scope.itemValue);
          console.log("##################################");
          //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%");

          //console.log(typeof(value),value);

          var valueAs = "";
          var valusAsLast = "";

          angular.forEach($scope.itemValue.Communities,function(value,key)
          {
            if($scope.itemValue.Communities_list[key].flag)
            {
              valueAs = valueAs + "<div class='whitebarCommunities'>" + value +"</div>";
            }
            else
            {
              valueAs = valueAs + "<div class='greenbarCommunities'>" + value +"</div>";
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
                valusAsLast = valusAsLast + "<div class='whitebarCommunities'>" + value +"</div>";
              }
              else
              {
                valusAsLast = valusAsLast + "<div class='redbarCommunities'>" + value +"</div>";
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
        else if(key != "AS_Path_list_flag" && key != "AS_Path_list" && key != "Communities_list" && key != "Communities_list"
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
      var data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      var colorPicker = function(number,x){

        //var color = d3.scale.linear().domain([0,100]).range(['#848AA8','#855EF9']);
        var color = new Array();
        color[0] = d3.scale.linear().domain([0,50]).range(['#e9ebf1','#848ba9']);
        color[1] = d3.scale.linear().domain([0,50]).range(['#e9f8ff','#5ec7fd']);
        color[2] = d3.scale.linear().domain([0,50]).range(['#e7e2ef','#a691c6']);
        color[3] = d3.scale.linear().domain([0,50]).range(['#f2e2f4','#c65ed8']);

        return "fill:" + color[number](x);
      }
      var textchoser = function(number){
        if (0 == number){return "MED"}
        else if(1 == number){return "As Path"}
        else if(2 == number){return "Next Hop"}
        else if(3 == number){return "Communites"}
      }



      var drawRect = function(index)
      {

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
            //console.log(i);

            var content = "<strong>Number:</strong> " + d;
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
          .on("click",function(d,i){
            d3.select(this)
              .attr("style","fill:green");

            $scope.createPrefixHisGrid(i);
            $scope.showGrid = "true";

            //$location.hash('bottom');
            //$anchorScroll();
          })
          .on("mouseout",function(d,i){
            tip.destroy(d);
            d3.select(this)
              .attr("style",function(){ return colorPicker(number,d);})

          })
          .on("mouseenter",function(d,i){
            d3.select(this)
              .attr("style","fill:#F59AE9")
            //d3.selectAll(".d3-tip")
            //  .attr("style",null)
          })
          .on('mouseover', function(d) {
            tip.attr("class", "d3-tip").show(d)
          });

        if(!$scope.$$phase) {
          //$digest or $apply
          $scope.$apply();
        }
      }

      drawRect(0);
      drawRect(1);
      drawRect(2);
      drawRect(3);

      //$compile(element)(scope);

      var removeSvg = function()
      {
        d3.selectAll("svg").remove();
        d3.selectAll("text").remove();
      }

      $scope.$watch('asPathChange',function(newVal,oldVal) {
        //$scope.asPathChangeMED[0] = $scope.asPathChangeMED;
        //$scope.asPathChange[1] = $scope.asPathChangeAS_PATH;
        //$scope.asPathChange[2] = $scope.asPathChangeHP;
        //$scope.asPathChange[3] = $scope.asPathChangeCommunites;

        console.log(newVal,oldVal);
        //if(typeof(newVal)!="undefined")
        //{
          data = newVal[0];
          removeSvg();
          drawRect(0);

          data = newVal[1];
          drawRect(1);

          data = newVal[3];
          drawRect(3);

          data = newVal[2];
          drawRect(2);

          if(!$scope.$$phase) {
            //$digest or $apply
            $scope.$apply();
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

        var html = '<div class="modal" ng-style="modalStyle"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"></div><div class="modal-body">' + $rootScope.showItems + '</div><div class="modal-footer"><button id="buttonClose" class="btn btn-primary" ng-click="close()">Close</button></div></div></div></div>';
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





