'use strict';

angular.module('bmp.components.card')

.controller('BmpCardGlobalPeerInsertController', ["$scope", "apiFactory", function ($scope, apiFactory) {

    ////  PEER DATA
    ////  {
    ////  "RouterName":"csr1.openbmp.org",     //  "RouterIP":"173.39.209.78",
    ////  "LocalIP":"192.168.255.32",          //  "LocalPort":17404,
    ////  "LocalASN":65000,                    //  "LocalBGPId":"192.168.255.32",
    ////  "PeerName":"lo-0.edge5.Washington1.Level3.net",
    ////  "PeerIP":"4.68.1.197",               //  "PeerPort":179,
    ////  "PeerASN":3356,                      //  "PeerBGPId":"4.68.1.197",
    ////  "LocalHoldTime":180,                 //  "PeerHoldTime":90,
    ////  "isUp":1,                            //  "isBMPConnected":1,
    ////  "isPeerIPv4":1,                      //  "isPeerVPN":0,
    ////  "isPrePolicy":1,                     //  "LastBMPReasonCode":null,
    ////  "LastDownCode":0,                    //  "LastdownSubCode":0,
    ////  "LastDownMessage":null,              //  "LastDownTimestamp":null,
    ////  "SentCapabilities":"MPBGP (1) : afi=1 safi=1 : Unicast IPv4, Route Refresh Old (128), Route Refresh (2), Route Refresh Enhanced (70), 4 Octet ASN (65)",
    ////  "RecvCapabilities":"MPBGP (1) : afi=1 safi=1 : Unicast IPv4, Route Refresh (2), Route Refresh Old (128), Graceful Restart (64), 4 Octet ASN (65)",
    ////  "peer_hash_id":"c33f36c12036e98d89ae3ea54cce0be2",
    ////  "router_hash_id":"0314f419a33ec8819e78724f51348ef9"
    //// }

}]);
