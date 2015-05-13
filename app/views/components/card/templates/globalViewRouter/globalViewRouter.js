'use strict';

angular.module('bmp.components.card')

  .controller('BmpCardGlobalRouterController', ["$scope", "apiFactory", "timeFactory", "cardFactory", function ($scope, apiFactory, timeFactory, cardFactory) {

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

      //1. move this api call so that it is under the table initilastion --> DONE
      //2. dont need the peersTableCreate() function --> DONE
      //3. make it so that data asignment is done in the peer api and
      //   not done in peersTableCreate
      //4. make it so the headings in table are changed to peeras, as_name
      //   and peer name
      //5. call the table resize method(calGridHeight) at end of success
      //   message inside the peer api.




      //get peers data
      /*var peersData;
      apiFactory.getPeersByIp($scope.data.RouterIP).
        success(function (result){
          $scope.peersAmount = result.v_peers.size;
          peersData = result.v_peers.data;
         // peersTableCreate();
        }).
        error(function (error){
          console.log(error.message);
        });*/


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
          }).
          error(function (error) {
            console.log(error.message);
          });
      });

      $scope.ipAmountOptions = {
        chart: {
          type: 'discreteBarChart',
          height: 170,
          width: 285,
          margin : {
            top: 20,
            right: 10,
            bottom: 40,
            left: 10
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
        }
      };


      //END <!--IP's Graph-->

      //ROUTER UP TIME GRAPH
      //used line graph
      $scope.upTimeOptions = {
        "chart": {
          "showYAxis":false,
          "showLegend": false,
          "type": "lineChart",
          "height": 180,
          "margin": {
            "top": 20,
            "right": 20,
            "bottom": 40,
            "left": 20
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
      $scope.upTime = timeFactory.calTimeFromNow($scope.data.LastModified);

      //AS Number	AS Name	Organization
      //PeerASN, PeerName, org_name


      $scope.globalViewPeerOptions = {
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        columnDefs: [
          {name: "PeerASN", displayName: 'AS Number', width: '*'},
          {name: "as_name", displayName: 'AS Name', width: '*'},
          {name: "PeerName", displayName: 'Peer', width: '*'}
        ]
      };
      $scope.globalViewPeerOptions.multiSelect = false;
      $scope.globalViewPeerOptions.noUnselect = false;
      $scope.globalViewPeerOptions.modifierKeysToMultiSelect = false;

      //get peers data
      var peersData;
      // $scope.peerSummaryTable = [];
      apiFactory.getPeersByIp($scope.data.RouterIP).
        success(function (result){
          $scope.peersAmount = result.v_peers.size;
           // peersData = result.v_peers.data;
          $scope.globalViewPeerOptions.data = result.v_peers.data;

          $scope.calGridHeight($scope.globalViewPeerOptions, $scope.globalViewPeerApi);
        }).
        error(function (error){
          console.log(error.message);
        });
       // $scope.calGridHeight($scope.globalViewPeerOptions, $scope.globalViewPeerApi);

      var peerViewPeerDefaultData = [{"as_name":"NO DATA"}];
      $scope.globalViewPeerOptions.onRegisterApi = function (gridApi) {
        $scope.globalViewPeerApi= gridApi;
      };

      $scope.calGridHeight = function(grid, gridapi){
        gridapi.core.handleWindowResize();

        var height;
        if(grid.data.length > 4){
          height = ((4 * 30) + 30);
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

    /*  var peersTableCreate = function() {
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
      };*/

      $scope.isUP = ($scope.data.isConnected=='1')? '⬆':'⬇';
      $scope.locationInfo =  cardFactory.createLocationTable({
        stateprov: $scope.data.stateprov,
        city: $scope.data.city,
        country: $scope.data.country,
        type: $scope.data.type
      });

  }]);
