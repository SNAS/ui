'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:CollectionServerController
 * @description
 * # CollectionServerController
 * Controller of the Login page
 */
angular.module('bmpUiApp')
  .controller('SummaryController', ['$scope','$http', function ($scope, $http) {

    function api_call(apiurl) {
      var res;

      jQuery.ajax({
        url: apiurl,
        success: function (result) {
          res = result;
        },
        async: false
      });
      return res;

      //$http.get(apiurl).
      //  then(function(result){
      //    console.dir(result.data);
      //    res = result.data;
      //  });
      //return res;
    }

    $scope.active_routers = api_call("http://odl-dev.openbmp.org:8001/db_rest/v1/routers/status/up").routers.size;
    $scope.routers = api_call("http://odl-dev.openbmp.org:8001/db_rest/v1/routers").routers.data;

    //Loop through routers selecting and altering relevant data.
    $scope.bmpRouterGrid = [];
    for(var i = 0; i < $scope.routers.length; i++) {
      var item = {};

      item.routerName = $scope.routers[i].RouterName;
      item.routerIp = $scope.routers[i].RouterIP
      item.peers = $scope.routers[i].peers

      if ($scope.routers[i].isConnected == 1) {
        item.status = "Up";
      }
      else {
        item.status = "Down";
      }
      item.peers = api_call("http://demo.openbmp.org:8001/db_rest/v1/peer?where=routerip=%27" + $scope.routers[i].RouterIP + "%27").v_peers.size;

      $scope.bmpRouterGrid.push(item);
    }
    $scope.bmpRouterGridOptions = { data: 'bmpRouterGrid' };
    //console.dir($scope.bmpRouterGridOptions);

    //"isUp": "1",
    //"isBMPConnected": "1",
    //"isPeerIPv4": "1",

    var peersData = api_call("http://odl-dev.openbmp.org:8001/db_rest/v1/peer");
    //[ Up-ColDwn, Dwn-ColDwn, Up, Dwn ]
    var ips = [[0,0,0,0], //ipv4
               [0,0,0,0]]; //ipv6

    for(var i =0;i<peersData.v_peers.size;i++){

      var item = peersData.v_peers.data[i];

      var whichIp = 1;
      if(item.isPeerIPv4 == 1){
        whichIp = 0;
      }

      if(item.isBMPConnected == 0){
        //Count Down-collected up || down
        if(item.isUp == 1){
          //Up
          ips[whichIp][0]++;
        }else{
          //Down
          ips[whichIp][1]++;
        }
      }
      //count up and downs
      if(item.isUp == 1){
        //Up
        ips[whichIp][2]++;
      }else{
        //Down
        ips[whichIp][3]++;
      }
    }

    //build data for the Peers table
    var keys = ["Up-ColDwn", "Dwn-ColDwn", "Up", "Dwn"];
    $scope.bgpPeersGrid = [];
    for(var i = 0; i < ips[0].length; i++){
      item={};
      item[""] = keys[i];
      item.IPv4 = ips[0][i];
      item.IPv6 = ips[1][i];
      item.Total = ips[0][i] + ips[1][i];
      $scope.bgpPeersGrid.push(item);
    }
    $scope.bgpPeersGridOptions = { data: 'bgpPeersGrid' };
  }]);
