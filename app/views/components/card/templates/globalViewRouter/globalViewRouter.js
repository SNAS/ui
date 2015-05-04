'use strict';

angular.module('bmp.components.card')

  .controller('BmpCardGlobalRouterController', ["$scope", "apiFactory", function ($scope, apiFactory) {

      console.log($scope.data);

      if($scope.data.RouterName === " " || $scope.data.RouterName === ""){
        $scope.data.RouterName = $scope.data.RouterIP;
      }

      $scope.wordCheck = function(word){
        if(word.length > 13){
          return word.slice(0,10) + " ...";
        }else{
          return word;
        }
      };

      var createLocationTable = function(){
        if ($scope.data.stateprov !== undefined || $scope.data.city !== undefined || $scope.data.country !== undefined) {
          var type;
          if ($scope.data.type === "Router") {
            type = "BMP Router";
          } else if ($scope.data.type === "Peer") {
            type = "Peer";
          } else {
            type = "None";
          }
          $scope.locationInfo = (
          '<table class="table">' +
          ' <tr>' +
          '   <th>' + $scope.data.RouterName + '</th>' +
          ' </tr>' +
          ' <tr>' +
          '   <td>Type</td>' +
          '   <td>' + type + '</td>' +
          ' </tr>' +
          ' <tr>' +
          '   <td>Location</td>' +
          '   <td>' + $scope.data.city + '</td>' +
          ' </tr>' +
          ' <tr>' +
          '   <td>State</td>' +
          '   <td>' + $scope.data.stateprov + '</td>' +
          ' </tr>' +
          ' <tr>' +
          '   <td>Country</td>' +
          '   <td>' + $scope.data.country + '</td>' +
          ' </tr>' +
          '</table>'
          );
        } else {
          //DEFAULT Data
          $scope.locationInfo = "<table class='routerLoc noRouterLoc'><tr><td>There is no Location Data ...</td></tr></table>";
        }
      };

      //ROUTER DATA
      //{
      //  "RouterName":"csr1.openbmp.org",
      //  "RouterIP":"173.39.209.78",
      //  "RouterAS":0,
      //  "description":"",
      //  "isConnected":1,
      //  "isPassive":0,
      //  "LastTermCode":65535,
      //  "LastTermReason":"Error while reading BMP data into buffer",
      //  "InitData":"",
      //  "LastModified":"2015-04-01 18:36:36"
      // }

      //get peers data
      var peersData;
      apiFactory.getPeersByIp($scope.data.RouterIP).
        success(function (result){
          $scope.peersAmount = result.v_peers.size;
          peersData = result.v_peers.data;
          peersTableCreate();
        }).
        error(function (error){
          console.log(error.message);
        });


      $scope.ipAmountData = [
        {
          key:'ips',
          values:[
            {label: "IPv4",value: 0},
            {label: "IPv6",value: 0},
            {label: "Total",value: 0}
          ]
        }
      ];

      //<!--IP's Graph-->
      var whichip = ['v4','v6'];


      var ipTotal = 0;
      var graphPoint = [0];
      angular.forEach(whichip, function(obj,index){
        var ipAmount = 0;
        apiFactory.getRouterIpType($scope.data.RouterIP, whichip[index]).
          success(function (result) {
            ipAmount = result.v_peers.size;
            ipTotal+=ipAmount;

            //if(ipAmount > graphPoint[0]) //for changing graph axis
            //  graphPoint[0] = ipAmount;
            //
            $scope.ipAmountData[0].values[index].value = ipAmount;
            $scope.ipAmountData[0].values[$scope.ipAmountData[0].values.length-1].value = ipTotal;
            console.log("test");
            console.dir($scope.ipAmountData);
          }).
          error(function (error) {
            console.log(error.message);
          });
      });

      $scope.ipAmountOptions = {
        chart: {
          type: 'discreteBarChart',
          height: 250,
          width: 300,
          margin : {
            top: 20,
            right: 20,
            bottom: 80,
            left: 55
          },
          x: function(d){return d.label;},
          y: function(d){return d.value;},
          showValues: true,
          valueFormat: function(d){
            return d3.format('')(d);
          },
          transitionDuration: 500,
          tooltipContent: function (key, x, y, e, graph) {
            return '<h5>' + x + " Peers: " +  y + '</h5>'
          },
          "yAxis": {
            tickFormat:d3.format('d'),
            tickValues: [0]
          }
          //xAxis: {
          //  axisLabel: 'Ips',
          //  rotateLabels: -25,
          //  rotateYLabel: true
          //},
          //yAxis: {
          //  axisLabel: 'Quantity(Ip Count)',
          //  axisLabelDistance: 30,
          //  tickFormat:d3.format('d')
          //}
        }
        //chart: {
        //  type: "multiBarChart",
        //  height: 250,
        //  width: 300,
        //  showControls: false,
        //  showLegend: false,
        //  showValues: true,
        //  margin: {
        //    top: 20,
        //    right: 20,
        //    bottom: 60,
        //    left: 45
        //  },
        //  clipEdge: true,
        //  staggerLabels: false,
        //  transitionDuration: 500,
        //  tooltipContent: function (key, x, y, e, graph) {
        //    return '<h5>' + x + " Peers: " +  y + '</h5>'
        //  },
        //  "yAxis": {
        //    tickFormat:d3.format('d')
        //  }
        //}
      };


      //END <!--IP's Graph-->

      //ROUTER UP TIME GRAPH
      //used line graph
      $scope.upTimeOptions = {
        "chart": {
          "showYAxis":false,
          "showLegend": false,
          "type": "lineChart",
          "height": 100,
          "margin": {
            "top": 20,
            "right": 20,
            "bottom": 40,
            "left": 55
          },
          "useInteractiveGuideline": false,
          "tooltips": false,
          "dispatch": {},
          "xAxis": {
            "axisLabel": "Time (ms)"
          },
          "yAxis": {
            "axisLabelDistance": 30
          }
        },
        "title": {
          "enable": true,
          "text": "Router Up Time"
        }
      };


      $scope.upTimeConfig = {
        visible: false // default: true
      };

      //Router up time DATA
      $scope.upTimeData = [
        {
          "key": "UpTime",
          color: '#1F7D1F',
          "values": [
            //static data
            {"x": 0,"y": 0},
            {"x": 3,"y": 0},
            {"x": 3,"y": 3},
            {"x": 12,"y": 3},
            {"x": 12,"y": 0},
            {"x": 15,"y": 0},
            {"x": 15,"y": 3},
            {"x": 21,"y": 3},
            {"x": 21,"y": 0},
            {"x": 27,"y": 0}
          ]
        }
      ];

      //<!--Router Up Time-->
      var calUpTime = function () {
        //This works out uptime from data.LastModified
        //Displays two largest results.
        var timestmp = Date.parse($scope.data.LastModified); //"2015-03-22 22:23:06"
        var timeNow = Date.now();

        var d = new Date();
        var offset = d.getTimezoneOffset() * 60000;
        timeNow += offset;

        var diff = timeNow - timestmp;

        var timeStrings = ["Years, ", "Months, ", " Days, ", "h", "m"];
        var times = [31622400000, 2592000000, 86400000, 3600000, 60000];
        var timeAmount = [0, 0, 0, 0, 0];

        var timeString = "";
        var show = 4; //show 2 largest
        for (var i = 0; i < times.length; i++) {
          var val = diff / times[i];
          if (val > 1) {
            var round = Math.floor(val);
            timeAmount[i] = round;
            diff = diff - (round * times[i]);
            if (show == 0)
              break;
            timeString += timeAmount[i] + timeStrings[i];
            show--;
          }
        }
        console.log("the time is ", timeString);
        $scope.upTime = timeString;
      };
      calUpTime();

      //AS Number	AS Name	Organization
      //PeerASN, PeerName, org_name


      $scope.globalViewPeerOptions = {
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        columnDefs: [
          {name: "PeerASN", displayName: 'AS Number', width: '*'},
          {name: "PeerName", displayName: 'AS Name', width: '*'},
          {name: "org_name", displayName: 'Organization', width: '*'}
        ]
      };
      $scope.globalViewPeerOptions.multiSelect = false;
      $scope.globalViewPeerOptions.noUnselect = false;
      $scope.globalViewPeerOptions.modifierKeysToMultiSelect = false;

      var peerViewPeerDefaultData = [{"as_name":"NO DATA"}];
      $scope.globalViewPeerOptions.onRegisterApi = function (gridApi) {
        $scope.globalViewPeerApi= gridApi;
      };

      $scope.calGridHeight = function(grid, gridapi){
        gridapi.core.handleWindowResize();

        var height;
        if(grid.data.length > 10){
          height = ((10 * 30) + 30);
        }else{
          height = ((grid.data.length * 30) + 50);
        }
        grid.changeHeight = height;
        gridapi.grid.gridHeight = grid.changeHeight;
      };

      if($scope.cardExpand){
        $scope.upTimeConfig.visible = true;
      }

      //Listen for card expand to resize the graph and table
      $scope.$watch('cardExpand', function() {
        if ($scope.cardExpand == true) {
          //resize
          $scope.upTimeConfig.visible = true;
          setTimeout(function(){
            //$scope.peerViewPeerApi.core.handleWindowResize();
            $scope.calGridHeight($scope.globalViewPeerOptions, $scope.globalViewPeerApi);
          },10)
        }
      });
      //End Router up time Graph

      var peersTableCreate = function() {
        //<!--R/Peers info table-->
        $scope.peerSummaryTable = [];
        angular.forEach(peersData, function(obj,index){
          apiFactory.getWhoIsWhereASN(peersData[index].PeerASN).
            success(function (result) {
              var data = result.w.data;
              var orgName = '-';

              try{
                if(data[0].org_name != ""){
                  orgName = data[0].org_name;
                }
              }catch(err) {
                //Just to catch unfined exception
              }
              $scope.peerSummaryTable.push({
                PeerASN: peersData[index].PeerASN,
                PeerName: peersData[index].PeerName,
                org_name: orgName
              });
              $scope.calGridHeight($scope.globalViewPeerOptions, $scope.globalViewPeerApi);
            }).
            error(function (error) {
              console.log(error.message);
            });
        });
        $scope.globalViewPeerOptions.data = $scope.peerSummaryTable;
      };

      $scope.isUP = ($scope.data.isConnected=='1')? '⬆':'⬇';
      createLocationTable();

      console.dir($scope);
  }]);
