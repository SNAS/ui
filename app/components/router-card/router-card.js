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
      controller: function ($scope, apiFactory) { //BmpRouterCardController
        window.SCOPES = $scope;

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
        if($scope.cardType == "router") {

          $scope.datas = [];


          var ips = ['v4', 'v6'];
          for (var i = 0; i < ips.length; i++) {
            apiFactory.getRouterIpType($scope.data.RouterIP, ips[i]).
              success(function (result) {
                var ipPeers = result.v_peers;
                var ipAmount = ipPeers.size;
                var key = "ip"+ips[i]+"Amount";
                var item = {
                  values: [
                    {
                      x: 2,
                      y: ipAmount
                    },
                    {
                      x: 3,
                      y: ipAmount
                    }
                  ]
                };
                item.key = key;
                $scope.datas.push(item);
              }).
              error(function (error) {
                console.log(error.message);
              });
          }

          $scope.options = {
            "chart": {
              "type": "stackedAreaChart",
              //"type": "multiBarChart",
              "showLegend": true,
              "showControls": false,
              "height": 200,
              "width": 120,
              "margin": {
                "top": 20,
                "right": 20,
                "bottom": 60,
                "left": 40
              },
              "useVoronoi": false,
              "clipEdge": true,
              "transitionDuration": 500,
              "useInteractiveGuideline": false,
              "xAxis": {
                "showMaxMin": false
              },
              "yAxis": {}
            }
          };

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
                {
                  "x": 0,
                  "y": 0
                },
                {
                  "x": 3,
                  "y": 0
                },
                {
                  "x": 3,
                  "y": 3
                },
                {
                  "x": 12,
                  "y": 3
                },
                {
                  "x": 12,
                  "y": 0
                },
                {
                  "x": 15,
                  "y": 0
                },
                {
                  "x": 15,
                  "y": 3
                },
                {
                  "x": 21,
                  "y": 3
                },
                {
                  "x": 21,
                  "y": 0
                },
                {
                  "x": 27,
                  "y": 0
                }
              ]
            }
          ];


          var calUpTime = function () {

            //var today = new Date();
            //var day = today.getUTCDate();
            //console.log("UTC day:",day);

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
            $scope.peersAmount = 0;

            apiFactory.getPeersByIp($scope.data.RouterIP).
              success(function (result){
                $scope.peersAmount = result.v_peers.size;
                $scope.peersData = result.v_peers.data;
              }).
              error(function (error){
                console.log(error.message);
              });
          };
          calUpTime();
          $scope.isUP = ($scope.data.isConnected=='1')? '⬆':'⬇';
        }
        else if($scope.cardType == "peer"){
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

          //$scope.whoIsData[i].symbTransit = ($scope.whoIsData[i].isTransit == 1)? "✔":"✘";
          //peer stuff here
          $scope.downTime = ($scope.data.LastDownTimestamp === null)? "Up":$scope.data.LastDownTimestamp;
          //$scope.location = $scope.data.description;
        }else {
          //shouldnt go into this
          console.log("error with choosing card type")
        }
        //Constuct the generic data.

        //default data
        $scope.RouterName = $scope.data.RouterName;
        $scope.RouterAS = $scope.data.RouterAS;

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
      link: function(scope) {
        // console.log(scope.options);
        scope.cardExpand=false;

        scope.changeCardState = function(){
          scope.cardExpand=!scope.cardExpand;
        };

        scope.getCardState = function(){
          return scope.cardExpand;
        }
      }
    }
  });
