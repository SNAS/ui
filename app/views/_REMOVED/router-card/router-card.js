'use strict';

angular.module('bmp.components.routerCard',[])

  .controller('BmpRouterCardController', ["$scope", "apiFactory", "$timeout", function ($scope, apiFactory, $timeout) {
    //<!--<div bmp-router-card-->
    //<!--data="routerCard"-->
    //<!--removeCard="removeRouterCard()"-->
    //<!--card-type="global.router">-->
    //<!--</div>-->

    //<!--<div bmp-router-card-->
    //<!--data="peerCard"-->
    //<!--removeCard="removePeerCard(card)"-->
    //<!--card-type="global.peer">-->
    //<!--</div>-->

    window.SCOPER = $scope;

      var createLocationTable = function(){
        if ($scope.data.State !== undefined || $scope.data.City !== undefined || $scope.data.Country !== undefined) {
          var type;
          if ($scope.cardType == "global.router") {
            type = "BMP Router";
          } else if ($scope.cardType == "global.peer") {
            type = "Peer";
          } else {
            type = "None";
          }
          $scope.locationInfo = (
          '<table class="routerLoc">' +
          ' <tr>' +
          '   <td>Type</td>' +
          '   <td>' + type + '</td>' +
          ' </tr>' +
          ' <tr>' +
          '   <td>Location</td>' +
          '   <td>' + $scope.data.City + '</td>' +
          ' </tr>' +
          ' <tr>' +
          '   <td>State</td>' +
          '   <td>' + $scope.data.State + '</td>' +
          ' </tr>' +
          ' <tr>' +
          '   <td>Country</td>' +
          '   <td>' + $scope.data.Country + '</td>' +
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
      if($scope.cardType == "global.router") {

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

        //<!--IP's Graph-->
        var whichip = ['v4','v6'];

        //DEFAULT values
        $scope.ipAmountData = [
          {key:'ipv4Amount',values:[
            {x: 1,y: 0},
            {x: 2,y: 0}
          ]},
          {key:'ipv6Amount',values:[
            {x: 1,y: 0},
            {x: 2,y: 0}
          ]}
        ];

        var graphPoint = [0];
        angular.forEach($scope.ipAmountData, function(obj,index){
          var ipAmount = 0;
          apiFactory.getRouterIpType($scope.data.RouterIP, whichip[index]).
            success(function (result) {
              ipAmount = result.v_peers.size;

              if(ipAmount > graphPoint[0]) //for changing graph axis
                graphPoint[0] = ipAmount;

              $scope.ipAmountData[index].values =(
                [
                  {x: 1,y: ipAmount},
                  {x: 2,y: ipAmount}
                ]
              );
            }).
            error(function (error) {
              console.log(error.message);
            });
        });

        $scope.ipAmountOptions = {
          "chart": {
            "type": "stackedAreaChart",
            "showControls": false,
            "showXAxis": false,
            "height": 200,
            "width": 120,
            "margin": {
              "top": 20,
              "right": 20,
              "bottom": 50,
              "left": 50
            },
            "useVoronoi": false,
            "clipEdge": true,
            "transitionDuration": 500,
            "useInteractiveGuideline": false,
            "tooltips": false,
            //tickvalues
            "yAxis": {
              "showMaxMin": true,
              "tickValues": graphPoint
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

        //Listen for card expand to resize the graph
        $scope.$watch('cardExpand', function() {
          if ($scope.cardExpand == true) {
            //resize
            $scope.upTimeConfig.visible = true;
          }
        });
        //End Router up time Graph

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

          var timeStrings = ["Years:", " Months:", " Days:", " Hours:", " Minutes:"];
          var times = [31622400000, 2592000000, 86400000, 3600000, 60000];
          var timeAmount = [0, 0, 0, 0, 0];

          var timeString = "";
          var show = 2; //show 2 largest
          for (var i = 0; i < times.length; i++) {
            var val = diff / times[i];
            if (val > 1) {
              var round = Math.floor(val);
              timeAmount[i] = round;
              diff = diff - (round * times[i]);
              if (show == 0)
                break;
              timeString += timeStrings[i] + timeAmount[i];
              show--;
            }
          }
          console.log("the time is ", timeString);
          $scope.upTime = timeString;
        };
        calUpTime();

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
              }).
              error(function (error) {
                console.log(error.message);
              });
          })
        };

        $scope.isUP = ($scope.data.isConnected=='1')? '⬆':'⬇';
        createLocationTable();

        console.dir($scope);
      }
      else if($scope.cardType == "global.peer" || $scope.cardType == "peer.peer"){
        //  PEER DATA
        //  {
        //  "RouterName":"csr1.openbmp.org",     //  "RouterIP":"173.39.209.78",
        //  "LocalIP":"192.168.255.32",          //  "LocalPort":17404,
        //  "LocalASN":65000,                    //  "LocalBGPId":"192.168.255.32",
        //  "PeerName":"lo-0.edge5.Washington1.Level3.net",
        //  "PeerIP":"4.68.1.197",               //  "PeerPort":179,
        //  "PeerASN":3356,                      //  "PeerBGPId":"4.68.1.197",
        //  "LocalHoldTime":180,                 //  "PeerHoldTime":90,
        //  "isUp":1,                            //  "isBMPConnected":1,
        //  "isPeerIPv4":1,                      //  "isPeerVPN":0,
        //  "isPrePolicy":1,                     //  "LastBMPReasonCode":null,
        //  "LastDownCode":0,                    //  "LastdownSubCode":0,
        //  "LastDownMessage":null,              //  "LastDownTimestamp":null,
        //  "SentCapabilities":"MPBGP (1) : afi=1 safi=1 : Unicast IPv4, Route Refresh Old (128), Route Refresh (2), Route Refresh Enhanced (70), 4 Octet ASN (65)",
        //  "RecvCapabilities":"MPBGP (1) : afi=1 safi=1 : Unicast IPv4, Route Refresh (2), Route Refresh Old (128), Graceful Restart (64), 4 Octet ASN (65)",
        //  "peer_hash_id":"c33f36c12036e98d89ae3ea54cce0be2",
        //  "router_hash_id":"0314f419a33ec8819e78724f51348ef9"
        // }

        //peer stuff here
        var peerPrefix;
        $scope.ribData = [
          ["Pre Rib", 0],
          ["Post Rib", 0]
        ];
        apiFactory.getPeerByIp($scope.data.PeerName).
          success(function (result){
            peerPrefix = result.v_peer_prefix_report_last.data;
            //atm this grabs first data item (may not be correct)
            $scope.ribData[0][1] = peerPrefix[0].Pre_RIB;
            $scope.ribData[1][1] = peerPrefix[0].Post_RIB;
          }).
          error(function (error){
            console.log(error.message);
          });

        //DownstreamAS, as_name, and org_name
        $scope.peerDownData = [];
        apiFactory.getPeerDownStream($scope.data.peer_hash_id).
          success(function (result){
            var peerDown = result.peerDownstreamASN.data;

            for(var i = 0; i<peerDown.length; i++) {
              var data = peerDown[i];
              if (data.org_name == "" || data.org_name === null) {
                data.org_name = "-";
              }
              $scope.peerDownData.push({
                DownstreamAS: data.DownstreamAS,
                as_name: data.as_name,
                org_name: data.org_name
              });
            }
            if($scope.peerDownData.length < 1){
              //  No data
              $scope.peerDownData.push({
                DownstreamAS: "None",
                as_name: "None",
                org_name: "None"
              });
            }

          }).
          error(function (error){
            console.log(error.message);
          });

        $scope.downTime = ($scope.data.LastDownTimestamp === null)? "Up":$scope.data.LastDownTimestamp;
        createLocationTable();
      }
      else if($scope.cardType == "peer.peer"){

      }else {
        //shouldnt go into this
        console.log("error with choosing card type")
      }
  }])

  .directive('bmpRouterCard', function () {
    return  {
      templateUrl: "views/components/router-card/router-card.html",
      restrict: 'AE',
      replace: 'true',
      scope: {
        data: '=',
        cardType: '@',
        removecard: '&'
      },
      controller: 'BmpRouterCardController',
      link: function(scope) {
        scope.cardExpand=false;//default false = closed

        scope.changeCardState = function() {
          scope.cardExpand = !scope.cardExpand;
        };

        scope.getCardState = function(){
          return scope.cardExpand;
        }
      }
    }
  });
