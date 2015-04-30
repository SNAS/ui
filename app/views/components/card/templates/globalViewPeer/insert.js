'use strict';

angular.module('bmp.components.card')

.controller('BmpCardGlobalPeerInsertController', ["$scope", "apiFactory", function ($scope, apiFactory) {

    //console.log($scope.data);
    //
    //var createLocationTable = function(){
    //  if ($scope.data.stateprov !== undefined || $scope.data.city !== undefined || $scope.data.country !== undefined) {
    //    var type;
    //    if ($scope.cardType == "global.router") {
    //      type = "BMP Router";
    //    } else if ($scope.cardType == "global.peer") {
    //      type = "Peer";
    //    } else {
    //      type = "None";
    //    }
    //    $scope.locationInfo = (
    //    '<table class="routerLoc">' +
    //    ' <tr>' +
    //    '   <td>Type</td>' +
    //    '   <td>' + type + '</td>' +
    //    ' </tr>' +
    //    ' <tr>' +
    //    '   <td>Location</td>' +
    //    '   <td>' + $scope.data.city + '</td>' +
    //    ' </tr>' +
    //    ' <tr>' +
    //    '   <td>State</td>' +
    //    '   <td>' + $scope.data.stateprov + '</td>' +
    //    ' </tr>' +
    //    ' <tr>' +
    //    '   <td>Country</td>' +
    //    '   <td>' + $scope.data.country + '</td>' +
    //    ' </tr>' +
    //    '</table>'
    //    );
    //  } else {
    //    //DEFAULT Data
    //    $scope.locationInfo = "<table class='routerLoc noRouterLoc'><tr><td>There is no Location Data ...</td></tr></table>";
    //  }
    //};
    //
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
    //
    ////peer stuff here
    //var peerPrefix;
    //$scope.ribData = [
    //  ["Pre Rib", 0],
    //  ["Post Rib", 0]
    //];
    //apiFactory.getPeerPrefixByHashId($scope.data.peer_hash_id).
    //  success(function (result){
    //    peerPrefix = result.v_peer_prefix_report_last.data;
    //    //atm this grabs first data item (may not be correct)
    //    try{
    //      $scope.ribData[0][1] = peerPrefix[0].Pre_RIB;
    //      $scope.ribData[1][1] = peerPrefix[0].Post_RIB;
    //    }catch(err){
    //      //catch if RIB is undefined
    //    }
    //  }).
    //  error(function (error){
    //    console.log(error.message);
    //  });
    //
    ////Redraw Tables when menu state changed
    //$scope.$on('menu-toggle', function(thing, args) {
    //  $timeout( function(){
    //    $scope.peerViewPeerApi.core.handleWindowResize();
    //    $scope.ribGridApi.core.handleWindowResize();
    //  }, 550);
    //});
    //
    //$scope.globalViewPeerOptions = {
    //  "columnDefs":[
    //    {name: "DownstreamAS", displayName: 'AS Number', width: '*'},
    //    {name: "as_name", displayName: 'AS Name', width: '*'},
    //    {name: "org_name", displayName:'Organization', width: '*'}
    //  ]
    //};
    //var peerViewPeerDefaultData = [{"as_name":"-"},{"DownstreamAS":"-"},{"org_name":"-"}];
    //
    //$scope.globalViewPeerOptions.onRegisterApi = function (gridApi) {
    //  $scope.globalViewPeerApi= gridApi;
    //};
    //
    //$scope.$watch('cardExpand', function(val) {
    //  if($scope.cardExpand == true){
    //    setTimeout(function(){
    //      $scope.calGridHeight($scope.globalViewPeerOptions, $scope.globalViewPeerApi);
    //    },10)
    //  }
    //});
    //
    //$scope.calGridHeight = function(grid, gridapi){
    //  gridapi.core.handleWindowResize();
    //
    //  var height;
    //  if(grid.data.length > 10){
    //    height = ((10 * 30) + 30);
    //  }else{
    //    height = ((grid.data.length * 30) + 50);
    //  }
    //  grid.changeHeight = height;
    //  gridapi.grid.gridHeight = grid.changeHeight;
    //};
    //
    ////DownstreamAS, as_name, and org_name (working)
    //$scope.peerDownData = [];
    //apiFactory.getPeerDownStream($scope.data.peer_hash_id).
    //  success(function (result){
    //    //var peerDown
    //    if(result.peerDownstreamASN.data.length == 0){
    //      $scope.globalViewPeerOptions.data = peerViewPeerDefaultData;
    //    }else {
    //      $scope.globalViewPeerOptions.data = result.peerDownstreamASN.data;
    //    }
    //    $scope.globalViewPeerOptions.core.handleWindowResize();
    //  }).
    //  error(function (error){
    //    console.log(error.message);
    //  });
    //
    //
    //$scope.downTime = ($scope.data.LastDownTimestamp === null)? "Up":$scope.data.LastDownTimestamp;
    //
    //$scope.peerFullIp = $scope.data.PeerIP;
    //if($scope.data.isPeerIPv4 == "1"){
    //  //is ipv4 so add ' :<port'
    //  $scope.peerFullIp = $scope.data.PeerIP + " :" + $scope.data.PeerPort;
    //}
    //
    //createLocationTable();
}]);
