'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:CollectionServerController
 * @description
 * # CollectionServerController
 * Controller of the Login page
 */
angular.module('bmpUiApp')
  .controller('SummaryController', ['$scope','apiFactory', function ($scope, apiFactory) {

    var createBmpRouterGrid = function() {
      $scope.bmpRouterGrid = [];
      for (var i = 0; i < $scope.routers.size; i++) {
        $scope.bmpRouterGrid.push({});

        $scope.bmpRouterGrid[i].routerName = $scope.routers[i].RouterName;
        $scope.bmpRouterGrid[i].routerIp = $scope.routers[i].RouterIP;
        $scope.bmpRouterGrid[i].peers = 0;

        if ($scope.routers[i].isConnected == 1) {
          $scope.bmpRouterGrid[i].status = "Up";
        }else {
          $scope.bmpRouterGrid[i].status = "Down";
        }

        apiFactory.getPeersByIp($scope.routers[i].RouterIP).
          success(function (result) {
            $scope.bmpRouterGrid[i].peers = result.v_peers.size;
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

      for (var i = 0; i < peersData.v_peers.size; i++) {

        var item = peersData.v_peers.data[i];

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
        item = {};
        item[""] = keys[i];
        item.IPv4 = ips[0][i];
        item.IPv6 = ips[1][i];
        item.Total = ips[0][i] + ips[1][i];
        $scope.bgpPeersGrid.push(item);
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

    //var peersData;
    //apiFactory.getPeers().
    //  success(function (result){
    //    peersData = result.v_peers.data;
    //    createBgpPeersGrid();
    //  }).
    //  error(function (error){
    //    console.log(error.message);
    //  });

    $scope.bmpRouterGridOptions = {data: 'bmpRouterGrid'};
    $scope.bgpPeersGridOptions = {data: 'bgpPeersGrid'};
  }]);
