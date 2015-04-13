'use strict';

angular.module('bmp.components.card')

.controller('BmpCardPeerPeerController', ["$scope", "apiFactory", function ($scope, apiFactory) {
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
        try{
          $scope.ribData[0][1] = peerPrefix[0].Pre_RIB;
          $scope.ribData[1][1] = peerPrefix[0].Post_RIB;
        }catch(err){
          //catch if RIB is undefined
        }
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


    $scope.peerFullIp = $scope.data.PeerIP;
    if($scope.data.isPeerIPv4 == "1"){
      //is ipv4 so add ' :<port'
      $scope.peerFullIp = $scope.data.PeerIP + " :" + $scope.data.PeerPort;
    }

    createLocationTable();
}]);
