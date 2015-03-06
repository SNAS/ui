'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:CollectionServerController
 * @description
 * # CollectionServerController
 * Controller of the Login page
 */
angular.module('bmpUiApp')
  .controller('SummaryController', ['$scope','apiFactory', '$http', function ($scope, apiFactory, $http) {

    var createBmpRouterGrid = function() {
      $scope.bmpRouterGrid = [];

      for (var i = 0; i < $scope.routers.length; i++) {
        //grab our peers
        apiFactory.getPeersByIp($scope.routers[i].RouterIP).
          success(function (result) {
            //use the current size to match routers array asynchronously
            var size = $scope.bmpRouterGrid.length;
            var status = $scope.routers[size].isConnected;
            if (status == 1)
              status = "Up";
            else
              status = "Down";
            //push all elements together
            $scope.bmpRouterGrid.push({
              'routerName': $scope.routers[size].RouterName,
              'routerIp': $scope.routers[size].RouterIP,
              'peers':  result.v_peers.size,
              'status': status
            });
          }).
          error(function (error) {
            console.log(error.message);
          });
      }
    };

    var createBgpPeersGrid = function() {
      //ips = [ Up-ColDwn, Dwn-ColDwn, Up, Dwn ]
      var ips = [[0, 0, 0, 0], //ipv4
                 [0, 0, 0, 0]]; //ipv6

      for (var i = 0; i < $scope.peersData.v_peers.size; i++) {

        var item = $scope.peersData.v_peers.data[i];

        var whichIp = 1;
        if (item.isPeerIPv4 == 1) {
          whichIp = 0;
        }

        if (item.isBMPConnected == 0) {
          //Count Down-collected up || down
          if (item.isUp == 1) {
            //Up
            ips[whichIp][0]++;
          } else {
            //Down
            ips[whichIp][1]++;
          }
        }
        //count up and downs
        if (item.isUp == 1) {
          //Up
          ips[whichIp][2]++;
        } else {
          //Down
          ips[whichIp][3]++;
        }
      }

      //build data for the Peers table
      var keys = ["Up, BMP Down", "Dwn, BMP Down", "Up", "Down"];
      $scope.bgpPeersGrid = [];
      for (var i = 0; i < ips[0].length; i++) {
        //item[""] = keys[i];
        //item.IPv4 = ips[0][i];
        //item.IPv6 = ips[1][i];
        //item.Total = ips[0][i] + ips[1][i];
        $scope.bgpPeersGrid.push({
          " ": keys[i],
          "ipv4": ips[0][i],
          "ipv6": ips[1][i],
          "Total": ips[0][i] + ips[1][i]
        });
      }
    };

    apiFactory.getRouters().
      success(function (result){
        $scope.routers = result.routers.data;
        createBmpRouterGrid();
      }).
      error(function (error){
        console.log(error.message);
      });


    apiFactory.getPeers().
      success(function (result){
        $scope.peersData = result;
        createBgpPeersGrid();
      }).
      error(function (error){
        console.log(error.message);
      });

    $scope.bmpRouterGridOptions = {data: 'bmpRouterGrid'};
    $scope.bgpPeersGridOptions = {data: 'bgpPeersGrid'};
  }]);
