'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:PrefixAnalysisController
 * @description
 * # PrefixAnalysisController
 * Controller of the Login page
 */
angular.module('bmpUiApp')
  .controller('PrefixAnalysisController', ['$scope', 'apiFactory', '$http', '$timeout', '$interval', '$location', '$window', '$anchorScroll','$compile', function ($scope, apiFactory, $http, $timeout, $interval, $location,$window, $anchorScroll,$compile) {
    //DEBUG

    // resize the window
    window.SCOPE = $scope;

    $scope.$on('menu-toggle', function (thing, args) {
      $timeout(function () {
        resize();
      }, 550);
    })

    //Create the  prefix data grid
    $scope.AllPrefixOptions = {
      enableRowSelection: true,
      enableRowHeaderSelection: false
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
      console.log("unique:" + unique);

      for(var i = 0; i < input.length; i++){
        if(typeof unique[input[i][key]] == "undefined"){
          unique[input[i][key]] = "";
          uniqueList.push(input[i]);
          console.log("uniqueList:" + uniqueList);
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
        });
    };

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
      enableRowSelection: false,
      enableRowHeaderSelection: false
    };

    //define the history gird columns
    $scope.HistoryPrefixOptions.columnDefs = [
      {name: "RouterName", displayName: 'RouterName', width: 110},
      //{name: "PeerName", displayName: 'PeerName', width: 100},
      {name: "NH", displayName: 'NH', width: 100},
      {name: "AS_Path", displayName: 'AS_Path'},
      {name: "PeerASN", displayName: 'Peer_ASN', width: 130},
      {name: "MED", displayName: 'MED', width: 60},
      {name: "Communities", displayName: 'Communities'},
      {name: "LastModified", displayName: 'Last_Modified', width: 150}
    ];

    // the only Function is creatinga history prefix gird , inject data should be $scope.HisData
     $scope.createPrefixHisGrid = function (hour) {
      console.log($scope.HisData);
      if (typeof $scope.HisData != "undefined") {
        $scope.HistoryPrefixOptions.data = [];
        $scope.HistoryPrefixOptions.data = $scope.HisData[hour];

        //if(!$scope.$$phase) {
        //  //$digest or $apply
        //  $scope.$apply();
        //}
        $scope.$apply();

        $location.hash('bottom');
        $anchorScroll();

      }
      ;
    };


    var getPrefixHisData = function (searchPrefix) {
      if ("All peers" == searchPrefix) {
        apiFactory.getHistoryPrefix(searchPrefix)
          .success(function (data) {

            // still dont know why we need $scope.HistoryPrefixOptions.data here
            $scope.HistoryPrefixOptions.data =  $scope.originHisData = data.v_routes_history.data;

            //prepared the data to put into grid
            getPrefixHisDataHour();
            //createPrefixHisGrid(7);
          });
      }
      else {
        $scope.peerHashId = $scope.peerData.selectPeer.peer_hash_id;
        apiFactory.getPeerHistoryPrefix(searchPrefix, $scope.peerHashId)
          .success(function (data) {
            console.log("getPrefixHisData has been executed:" + searchPrefix + ' ' + $scope.peerHashId);
            //$scope.HistoryPrefixOptions.data = $scope.originHisData = data.v_routes_history.data;
            $scope.originHisData = data.v_routes_history.data;
            //prepared the data to put into grid
            getPrefixHisDataHour();
            //createPrefixHisGrid(7);
          });
      }
    };


    var getPrefixHisDataHour = function () {

      var allHisData = $scope.originHisData;
      console.log(allHisData);
      $scope.asPathChangeNumber = new Array(24);
      $scope.asPathChangeRate = new Array(24);
      $scope.HisData = new Array(24);

      $scope.asPathChangeAS_PATH = new Array(24);//this is for AS_PATH
      $scope.asPathChangeHP = new Array(24);//this is for HP
      $scope.asPathChangeCommunites = new Array(24);//this is for Communites
      $scope.asPathChangeMED = new Array(24);

      //init the data of asPathChangeNumber
      for(var i = 0; i < 24; i++)
      {
        $scope.asPathChangeAS_PATH[i] = 0;
        $scope.asPathChangeHP[i] = 0;
        $scope.asPathChangeCommunites[i] = 0;
        $scope.asPathChangeMED[i] = 0;
      }

      console.log($scope.asPathChangeHP);

      for(var i = 0; i < 24; i++)
      {
        $scope.HisData[i] = new Array();
      }

      for (i = 0; i < allHisData.length; i++) {
        var hour = parseInt(allHisData[i].LastModified.substring(11, 13));
        //$scope.HisData[hour] = new Array();
        $scope.HisData[hour].push(allHisData[i]);
        //$scope.asPathChangeNumber[0]
      }

      //console.log("$scope.HisData:"+$scope.HisData);
      for(i = 0; i < 24; i++)
      {
        $scope.asPathChangeNumber[i] = $scope.HisData[i].length;

        //$scope.asPathChangeRate[i] = $scope.asPathChangeNumber[i]/$scope.originHisData.length;

        for(var j = 1;j < $scope.HisData[i].length;j++)
        {
          debugger
          if($scope.HisData[i][j-1].AS_Path != $scope.HisData[i][j].AS_Path){

            console.log($scope.asPathChangeAS_PATH[i]);

            $scope.asPathChangeAS_PATH[i] = $scope.asPathChangeAS_PATH[i] + 1;
          }
          if($scope.HisData[i][j-1].NH != $scope.HisData[i][j].NH){
            $scope.asPathChangeHP[i] = $scope.asPathChangeHP[i] + 1;
          }
          if($scope.HisData[i][j-1].Communities != $scope.HisData[i][j].Communities){
            $scope.asPathChangeCommunites[i] = $scope.asPathChangeCommunites[i] + 1;
          }
          if($scope.HisData[i][j-1].MED != $scope.HisData[i][j].MED){
            $scope.asPathChangeMED[i] = $scope.asPathChangeMED[i] + 1;
        }
      }
      //console.log($scope.asPathChangeAS_PATH);
      //console.log($scope.asPathChangeHP);
      //console.log($scope.asPathChangeCommunites);
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
    }

    init();

    $scope.selectChange = function(){
      //getPrefixHisGrid($scope.currentValue);
      $scope.showGrid = "false";

      console.log("selectChange has been executed")
      getPrefixHisData($scope.currentValue);

      if(!$scope.$$phase) {
        //$digest or $apply
        $scope.$apply();
      }

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

        svg2.selectAll("rect")
          .data(data)
          .enter()
          .append("rect")
          .attr("x", function(d, i) {
            //console.log(i);
            console.log("i draw the "+i+" rect,and the data is " + d);
            return (i%24) * 23 + 10;	//Bar width of 20 plus 1 for padding
          })
          .attr("width", 20)
          .attr("y", 0)
          .attr("height", 20)
          .attr("tooltip-append-to-body", true)
          .attr("tooltip", function(d){
            return d;
          })
          .attr("style",function(d, i){ return colorPicker(number,d);})
          .on("click",function(d,i){
            d3.select(this)
              .attr("style","fill:green");
            $scope.createPrefixHisGrid(i);
            $scope.showGrid = "true";

            $location.hash('bottom');
            $anchorScroll();
          })
          .on("mouseout",function(d,i){
            d3.select(this)
              .attr("style",function(){ return colorPicker(number,d);})
          })
          .on("mouseenter",function(d,i){
            d3.select(this)
              .attr("style","fill:red")
          })
          .call(function(){
            $compile(this)(scope);
          })


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

        //// Remove the directive, so $compile doesn't reset it
        //
        //$element.removeAttr("d3-directive");
        //
        // // Compile d3 code so that tooltip shows
        // $compile($element)(scope);
        //
        // // Re-add directive
        // $element.attr("d3-directive");

      },true)


    }
    return {
      link: link,
      restrict: 'E'
    }
  }]);






