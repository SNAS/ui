'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:PrefixAnalysisController
 * @description
 * # PrefixAnalysisController
 * Controller of the Login page
 */
angular.module('bmpUiApp')
  .controller('PrefixAnalysisController',['$scope', 'apiFactory', '$http', '$timeout', '$interval','$location', '$window','$anchorScroll',function ($scope, apiFactory, $http, $timeout,$window, $location, $anchorScroll) {
    //DEBUG
    window.SCOPE = $scope;
    $scope.$on('menu-toggle', function (thing, args) {
      $timeout(function () {
        resize();
      }, 550);
    });

    $scope.hideGrid = true;

    //populate prefix data into Grid
    $scope.AllPrefixOptions = {
      enableRowSelection: true,
      enableRowHeaderSelection: false
    };

    $scope.AllPrefixOptions.columnDefs = [
      {name: "router_name", displayName: 'RouterName',width: 110},
      {name: "peer_name", displayName: 'PeerName',width: 100},
      {name: "nh", displayName: 'NH',width: 100},
      {name: "as_path", displayName: 'AS_Path', width: 200},
      {name: "peer_asn", displayName: 'Peer_ASN', width: 130},
      {name: "med", displayName: 'MED', width: 60},
      {name: "communities", displayName: 'Communities'},
      {name: "last_modified", displayName: 'Last_Modified', width: 150},

    ];


    //Waits a bit for user to continue typing.
    $scope.enterValue = function (value) {
      $scope.currentValue = value;

      $timeout(function () {
        if (value == $scope.currentValue) {
          getPrefixDataGrid(value);
        }
      }, 500);
    };

    //$scope.searchPrefix = "176.105.176.0/24";

    var getPrefixDataGrid = function (searchPrefix){
      apiFactory.getPrefix(searchPrefix)
        .success(function(data) {
          $scope.AllPrefixOptions.data = $scope.PrefixData = data.v_routes.data;
          createPrefixDataGrid()
        });
    };
    var createPrefixDataGrid = function () {
      for (var i = 0; i < $scope.PrefixData.length; i++) {
        $scope.PrefixData[i].router_name = $scope.PrefixData[i].RouterName;
        $scope.PrefixData[i].peer_name = $scope.PrefixData[i].PeerName;
        $scope.PrefixData[i].nh = $scope.PrefixData[i].NH;
        $scope.PrefixData[i].as_path = $scope.PrefixData[i].AS_Path;
        $scope.PrefixData[i].peer_asn = $scope.PrefixData[i].PeerASN;
        $scope.PrefixData[i].communities = $scope.PrefixData[i].Communities;
        $scope.PrefixData[i].med = $scope.PrefixData[i].MED;
        $scope.PrefixData[i].last_modified = $scope.PrefixData[i].LastModified;
      }
      $scope.Origin_AS = $scope.PrefixData[0].Origin_AS
    };

    //get Origin_AS infomation from PrefixData
    $scope.getASInfo = function () {
      //$scope.showValues = '<table>';

      var url = apiFactory.getWhoIsWhereASNSync($scope.Origin_AS);

      console.log(url);

      //synchronization
      var request = $http({
        method: "get",
        url: url
      });
      request.success(function (result) {
        $scope.showValues = '<table>';
        //console.log(result);
          $scope.values = result.w.data[0];
          angular.forEach($scope.values , function (value, key) {

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


    //  this function is for getting peer information and return a drop-down list
    var getPeers = function(){
      apiFactory.getPeers()
        .success(function(result) {
          $scope.peerData = result.v_peers.data;

        });
    }

    getPeers();



    //deal with the data from History of prefix
    $scope.HistoryPrefixOptions = {
      enableRowSelection: false,
      enableRowHeaderSelection: false
    };

    $scope.HistoryPrefixOptions.columnDefs = [
      {name: "router_name", displayName: 'RouterName',width: 110},
      {name: "peer_name", displayName: 'PeerName',width: 100},
      {name: "nh", displayName: 'NH',width: 100},
      {name: "as_path", displayName: 'AS_Path'},
      {name: "peer_asn", displayName: 'Peer_ASN', width: 130},
      {name: "med", displayName: 'MED', width: 60},
      {name: "communities", displayName: 'Communities'},
      {name: "last_modified", displayName: 'Last_Modified', width: 150}
    ];
    var createPrefixHisGrid = function () {
      console.log($scope.HisData);
      for (var i = 0; i < $scope.HisData.length; i++) {
        $scope.HistoryPrefixOptions.data[i].router_name = $scope.HisData[i].RouterName;
        $scope.HistoryPrefixOptions.data[i].peer_name = $scope.HisData[i].PeerName;
        $scope.HistoryPrefixOptions.data[i].nh = $scope.HisData[i].NH;
        $scope.HistoryPrefixOptions.data[i].as_path = $scope.HisData[i].AS_Path;
        $scope.HistoryPrefixOptions.data[i].peer_asn = $scope.HisData[i].PeerASN;
        $scope.HistoryPrefixOptions.data[i].communities = $scope.HisData[i].Communities;
        $scope.HistoryPrefixOptions.data[i].med = $scope.HisData[i].MED;
        $scope.HistoryPrefixOptions.data[i].last_modified = $scope.HisData[i].LastModified;
      }
    };
    var getPrefixHisGrid = function (searchPrefix) {
      //console.log(searchPrefix);
      debugger
      if ("All peers" == searchPrefix)
      {
        apiFactory.getHistoryPrefix(searchPrefix)
        .success(function(data) {
          $scope.HisData = data.v_routes_history.data;
          createPrefixHisGrid();
        });
      }
      else
      {
        $scope.peerHashId = $scope.peerData.selectPeer.peer_hash_id;
        apiFactory.getPeerHistoryPrefix(searchPrefix,$scope.peerHashId)
          .success(function(data) {
            //console.log(searchPrefix+' '+$scope.peerHashId);
            $scope.HistoryPrefixOptions.data = $scope.HisData = data.v_routes_history.data;
            createPrefixHisGrid();
          });
      }
    };   //create a new grid

    var getPrefixHisData = function (searchPrefix) {
      //console.log(searchPrefix);
      debugger
      if ("All peers" == searchPrefix)
      {
        apiFactory.getHistoryPrefix(searchPrefix)
          .success(function(data) {
            $scope.HisData = data.v_routes_history.data;
            //console.log(data.v_routes_history.data);
          });
      }
      else
      {
        $scope.peerHashId = $scope.peerData.selectPeer.peer_hash_id;
        apiFactory.getPeerHistoryPrefix(searchPrefix,$scope.peerHashId)
          .success(function(data) {
            console.log(searchPrefix+' '+$scope.peerHashId);
            $scope.HisData = data.v_routes_history.data;
            console.log("$scope.HisData:");
            //console.log($scope.HisData);
          });
      }
    };
    $scope.getPrefixHisDataHour = function(index)
    {
      getPrefixHisData($scope.currentValue);
      console.log("$scope.currentValue"+$scope.currentValue)

      var allDataHis = $scope.HisData;

      console.log(allDataHis);

      allDataHis.sort(function compare(a,b)
      {
        return a.LastModified > b.LastModified;
      });

      var dataHour=[];


      for (var i= 0,j= 0;i<allDataHis.length;i++)
      {

        allDataHis[i].hour = allDataHis[i].LastModified.substring(11,13);
        if (index == allDataHis[i].hour) {
          dataHour[j] = allDataHis[i];
          //console.log(dataHour);
          j++;
        }
      }

      $scope.HistoryPrefixOptions.data = $scope.HisData = dataHour;
      createPrefixHisGrid();
    }


    $scope.getAsPathChanged = function(allHisData)
    {
      var asPathChange = [];//store what time is change and the how many it changed

      var j = 0;
      while(j<24)
      {
        for (var i= 0;i<allHisData.length;i++)
        {
          console.log("allHisData[i].LastModified.substring(11,13)");
          console.log(allHisData[i].LastModified.substring(11,13));

          if((allHisData[i].LastModified.substring(11,13)=='0'+j)||(allHisData[i].LastModified.substring(11,13)== j.toString()))
          {
            if(asPathChange[j])
            {
              asPathChange[j]= asPathChange[j] + 1;
            }
            else
            {
              asPathChange[j] = 0;
            }
          }
        }
        j++;
      }

      console.log("asPathChange");
      console.log(asPathChange);
    }

    //$scope.getAsPathChanged($scope.HisData);

    $scope.selectChange = function(){
      debugger
      getPrefixHisGrid($scope.currentValue);
    }
  }
  ])

  .directive('d3Directive',function(){
    function link($scope,element){
      var w = 600;
      var h = 20;
      var datasetAs = [5, 10, 13, 19, 21, 25, 22, 18, 15, 13, 11, 12, 15, 20, 18, 17, 16, 18, 23, 25, 21, 22, 23, 24];

//create the AS PATH part
      var div0 = d3.select(element[0])
        .append("div");

      var text0 = div0
        .append("text")
        .text("As path")
        .style("text-anchor", "middle")
        .attr("x",10);

      var svg0 = div0
        .append("svg")
        .attr("width", w)
        .attr("height", h);

      svg0.selectAll("rect")
        .data(datasetAs)
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
          //console.log(i);
          return (i%24) * 23 + 10;	//Bar width of 20 plus 1 for padding
        })
        .attr("width", 20)
        .attr("y", 0)
        .attr("height", 20)
        .attr("style","fill:#CCFFFF")
        .on("click",function(){
          d3.select(this)
            .attr("style","fill:green");
        })
        .on("mouseover",function(d,i){
          d3.select(this)
            .attr("style","fill:blue");
        })
        .on("mouseout",function(d,i){
          d3.select(this)
            .transition()
            .duration(500)
            .attr("style","fill:#CCFFFF");
        });

//create the Communities part
      var div1 = d3.select(element[0])
        .append("div");

      var text1 = div1
        .append("text")
        .text("Communities")
        .style("text-anchor", "middle")
        .attr("x",10);

      var svg1 = div1
        .append("svg")
        .attr("width", w)
        .attr("height", h);

      svg1.selectAll("rect")
        .data(datasetAs)
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
          //console.log(i);
          return (i%24) * 23 + 10;	//Bar width of 20 plus 1 for padding
        })
        .attr("width", 20)
        .attr("y", 0)
        .attr("height", 20)
        .attr("style","fill:rgb(166,217,106)");

//create the last modified time

      var div2 = d3.select(element[0])
        .append("div");

      var text2 = div2
        .append("text")
        .text("Peer ASN")
        .style("text-anchor", "middle")
        .attr("x",10);

      var svg2 = div2
        .append("svg")
        .attr("width", w)
        .attr("height", h);

      svg2.selectAll("rect")
        .data(datasetAs)
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
          //console.log(i);
          return (i%24) * 23 + 10;	//Bar width of 20 plus 1 for padding
        })
        .attr("width", 20)
        .attr("y", 0)
        .attr("height", 20)
        .attr("style","fill:#FADF56")
        .on("click",function(d,i){
          $scope.hideGrid = false;
          //console.log($scope.hideGrid);
          //$scope.selectChange();

          d3.select(this)
            .attr("style","fill:green");

          var iString = i.toString();

          if(2 == iString.length)
          {
            $scope.string = iString;
            $scope.getPrefixHisDataHour($scope.string);  //chose which hour data should be shown
            //$scope.selectChange();
            console.log('length:'+iString+' '+iString.length);
            console.log(iString);
            $scope.getAsPathChanged($scope.HisData);
          }
          else if(1 == iString.length)
          {
            $scope.string = '0'+iString;
            $scope.getPrefixHisDataHour($scope.string);
            debugger
            //$scope.selectChange();
            console.log('length:'+iString+' '+iString.length);
            console.log('0'+iString);
          }
        })
        .on("mouseover",function(d,i){
          d3.select(this)
            .attr("style","fill:blue");
        })
        .on("mouseout",function(d,i){
          d3.select(this)
            .transition()
            .duration(500)
            .attr("style","fill:#FADF56");
        });
//create the last modified time

      var div3 = d3.select(element[0])
        .append("div");

      var text3 = div3
        .append("text")
        .text("Next Hop")
        .style("text-anchor", "middle")
        .attr("x",10);

      var svg3 = div3
        .append("svg")
        .attr("width", w)
        .attr("height", h);

      svg3.selectAll("rect")
        .data(datasetAs)
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
          //console.log(i);
          return (i%24) * 23 + 10;	//Bar width of 20 plus 1 for padding
        })
        .attr("width", 20)
        .attr("y", 0)
        .attr("height", 20)
        .attr("style","fill:#FE2E64");
    }
    return {
      link: link,
      restrict: 'E'
    }
  });






