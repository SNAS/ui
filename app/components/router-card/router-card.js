'use strict';

angular.module('bmp.components.routerCard', [])

  .directive('bmpRouterCard', function () {
    return  {
      templateUrl: "components/router-card/router-card.html",
      restrict: 'AE',
      replace: 'true',
      scope: {
        data: '=',
        cardType: '@',
        removecard: '&'
      },
      controller: function ($scope, apiFactory, $timeout) { //BmpRouterCardController
        window.SCOPER = $scope;

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
          angular.forEach($scope.ipAmountData, function(obj,index){
            var ipAmount = 0;
            apiFactory.getRouterIpType($scope.data.RouterIP, whichip[index]).
              success(function (result) {
                ipAmount = result.v_peers.size;
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
              "xAxis": {
                "showMaxMin": false
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


          var peersTableCreate = function() {
            //<!--R/Peers info table-->
            $scope.peerSummaryTable = (
            '<table class="tableSummary">' +
            ' <tr>' +
            '   <th>AS Number</th>' +
            '   <th>AS Name</th>' +
            '   <th>Organization</th>' +
            ' </tr>');
            $q.all(peersData.length).then(function (requests){
            for (var i = 0; i < requests.length; i++) {
              $scope.peerSummaryTable += (
              '<tr>' +
              ' <td>' + peersData[i].PeerASN + '</td>' +
              ' <td>' + peersData[i].PeerName + '</td>');
              apiFactory.getWhoIsWhereASN(peersData[i].PeerASN).
                success(function (result) {
                  var data = result.w.data;
                  if (data.org_name === undefined || data.org_name == "") {
                    $scope.peerSummaryTable += '<td> - </td>';
                  } else {
                    $scope.peerSummaryTable += '<td>' + data.org_name + '</td>';
                  }
                  $scope.peerSummaryTable += '</tr>';
                }).
                error(function (error) {
                  console.log(error.message);
                });
            }
            $scope.peerSummaryTable += '</table>';
          }
          };

          $scope.isUP = ($scope.data.isConnected=='1')? '⬆':'⬇';

          //TEST::to get chart to resize to container width
          //$scope.test = function() {
          //  if ($scope.cardExpand == true) {
          //    setTimeout(function () {
          //      $scope.api.refresh();
          //      $scope.api.update();
          //    })
          //  }
          //};
          //$scope.test();



          console.dir($scope);
        }
        else if($scope.cardType == "global.peer"){
          //  PEER DATA
          //  {
          //  "RouterName":"csr1.openbmp.org",
          //  "RouterIP":"173.39.209.78",
          //  "LocalIP":"192.168.255.32",
          //  "LocalPort":17404,
          //  "LocalASN":65000,
          //  "LocalBGPId":"192.168.255.32",
          //  "PeerName":"lo-0.edge5.Washington1.Level3.net",
          //  "PeerIP":"4.68.1.197",
          //  "PeerPort":179,
          //  "PeerASN":3356,
          //  "PeerBGPId":"4.68.1.197",
          //  "LocalHoldTime":180,
          //  "PeerHoldTime":90,
          //  "isUp":1,
          //  "isBMPConnected":1,
          //  "isPeerIPv4":1,
          //  "isPeerVPN":0,
          //  "isPrePolicy":1,
          //  "LastBMPReasonCode":null,
          //  "LastDownCode":0,
          //  "LastdownSubCode":0,
          //  "LastDownMessage":null,
          //  "LastDownTimestamp":null,
          //  "SentCapabilities":"MPBGP (1) : afi=1 safi=1 : Unicast IPv4, Route Refresh Old (128), Route Refresh (2), Route Refresh Enhanced (70), 4 Octet ASN (65)",
          //  "RecvCapabilities":"MPBGP (1) : afi=1 safi=1 : Unicast IPv4, Route Refresh (2), Route Refresh Old (128), Graceful Restart (64), 4 Octet ASN (65)",
          //  "peer_hash_id":"c33f36c12036e98d89ae3ea54cce0be2",
          //  "router_hash_id":"0314f419a33ec8819e78724f51348ef9"
          // }

          //peer stuff here
          $scope.downTime = ($scope.data.LastDownTimestamp === null)? "Up":$scope.data.LastDownTimestamp;
        }else {
          //shouldnt go into this
          console.log("error with choosing card type")
        }
        //Constuct the generic data.
        if($scope.data.State !== undefined || $scope.data.City !== undefined || $scope.data.Country !== undefined) {
          $scope.locationInfo = (
          '<table class="routerLoc">'+
            '<tr>'+
              '<td>Type</td>'+
              '<td>'+$scope.cardType+'</td>'+
            '</tr>'+
            '<tr>'+
              '<td>Location</td>'+
              '<td>'+$scope.data.City+'</td>'+
            '</tr>'+
            '<tr>'+
              '<td>State</td>'+
              '<td>'+$scope.data.State+'</td>'+
            '</tr>'+
            '<tr>'+
              '<td>Country</td>'+
              '<td>'+$scope.data.Country+'</td>'+
            '</tr>'+
          '</table>'
          );
        }else{
          //DEFAULT Data
          $scope.locationInfo = "<table class='routerLoc noRouterLoc'><tr><td>There is no Location Data ...</td></tr></table>";
        }
      },
      link: function(scope, $timeout) {
        scope.cardExpand=true;//default false = closed

        scope.changeCardState = function() {
          scope.cardExpand = !scope.cardExpand;
        };

        scope.getCardState = function(){
          return scope.cardExpand;
        }
      }
    }
  });
