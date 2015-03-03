'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:CollectionServerController
 * @description
 * # CollectionServerController
 * Controller of the Login page
 */
angular.module('bmpUiApp')
  .controller('CollectionServerController', function ($scope) {

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
    }

    $scope.active_routers = api_call("http://odl-dev.openbmp.org:8001/db_rest/v1/routers/status/up").routers.size;

    $scope.routers = api_call("http://odl-dev.openbmp.org:8001/db_rest/v1/routers").routers.data;

    for(var i = 0; i < $scope.routers.length; i++) {
      if ($scope.routers[i].isConnected == 1) {
        $scope.routers[i].status = "Up";
      }
      else {
        $scope.routers[i].status = "Down";
      }
      //DOESNT WORK OUT ALL OF THE PEERS
      //EXISTING CODE DOES
      //var h = 0;
      //var arr1 = [];
      //var amount1 = 0;
      //while (h < peers.length) {
      //  if (peers[h].RouterIP == row.RouterIP) {
      //    amount1++;
      //    arr1.push(peers[h]);
      //  }
      //  h++;
      //}
      //console.log(peers);
      //console.log("DEBUG:" + amount1 + arr1);
      //router_peer_distribution[row.RouterIP] = arr1;
      //return amount1;
      $scope.routers[i].peers = api_call("http://demo.openbmp.org:8001/db_rest/v1/peer/localip/"+$scope.routers[i].RouterIP).v_peers.size;
    }

  });
