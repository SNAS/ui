'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:PrefixAnalysisController
 * @description
 * # PrefixAnalysisController
 * Controller of the Login page
 */
angular.module('bmpUiApp')
  .controller('PrefixAnalysisController',['$scope', 'apiFactory', '$http', '$timeout', '$interval', function ($scope, apiFactory, $http, $timeout) {
    //DEBUG
    window.SCOPE = $scope;

    //control if show the table
    //$scope.hideHisGrid = true;
    //$scope.hideAsInfo = true;

    //$scope.hidePrefixGrid = true;
    //Redraw Tables when menu state changed
    $scope.$on('menu-toggle', function (thing, args) {
      $timeout(function () {
        resize();
      }, 550);
    });

    //populate prefix data into Grid
    $scope.AllPrefixOptions = {
      enableRowSelection: true,
      enableRowHeaderSelection: false
    };

    $scope.AllPrefixOptions.columnDefs = [
      {name: "router_name", displayName: 'RouterName', width: '*'},
      {name: "peer_name", displayName: 'PeerName', width: '*'},
      {name: "nh", displayName: 'NH', width: '*'},
      {name: "as_path", displayName: 'AS_Path', width: '*'},
      {name: "peer_asn", displayName: 'Peer_ASN', width: '*'},
      {name: "med", displayName: 'MED', width: '*'},
      {name: "communities", displayName: 'Communities', width: '*'},
      {name: "last_modified", displayName: 'Last_Modified', width: '*'},

    ];


    //Waits a bit for user to contiune typing.
    $scope.enterValue = function (value) {
      $scope.currentValue = value;

      $timeout(function () {
        if (value == $scope.currentValue) {
          getPrefixDataGrid(value);
        }
      }, 500);
    };

    //$scope.searchPrefix = "176.105.176.0/24";

    var getPrefixDataGrid = function (searchPrefix){
      apiFactory.getPrefix(searchPrefix)
        .success(function(data) {
          $scope.AllPrefixOptions.data = $scope.PrefixData = data.v_routes.data;
          createPrefixDataGrid()
        });
    };
    var createPrefixDataGrid = function () {
      for (var i = 0; i < $scope.PrefixData.length; i++) {
        $scope.PrefixData[i].router_name = $scope.PrefixData[i].RouterName;
        $scope.PrefixData[i].peer_name = $scope.PrefixData[i].PeerName;
        $scope.PrefixData[i].nh = $scope.PrefixData[i].NH;
        $scope.PrefixData[i].as_path = $scope.PrefixData[i].AS_Path;
        $scope.PrefixData[i].peer_asn = $scope.PrefixData[i].PeerASN;
        $scope.PrefixData[i].communities = $scope.PrefixData[i].Communities;
        $scope.PrefixData[i].med = $scope.PrefixData[i].MED;
        $scope.PrefixData[i].last_modified = $scope.PrefixData[i].LastModified;
      }
      $scope.Origin_AS = $scope.PrefixData[0].Origin_AS
    };

    //get Origin_AS infomation from PrefixData
    $scope.getASInfo = function () {
      //$scope.showValues = '<table>';

      var url = apiFactory.getWhoIsWhereASNSync($scope.Origin_AS);

      console.log(url);

      var request = $http({
        method: "get",
        url: url
      });
      request.success(function (result) {
        $scope.showValues = '<table>';
        console.log(result);
          $scope.values = result.w.data[0];
          angular.forEach($scope.values , function (value, key) {

            if (key != "raw_output") {
              $scope.showValues += (
              '<tr>' +
              '<td>' +
              key + ': ' +
              '</td>' +

              '<td>' +
              value +
              '</td>' +
              '</tr>'
              );
            }

          });
        $scope.showValues += '</table>';
        //$scope.hideAsInfo = false;
        //$scope.getAsInfoValues = $scope.showValues;

      });
    };


    //  this function is for getting peer information and return a drop-down list
    var getPeers = function(){
      apiFactory.getPeers()
        .success(function(result) {
          $scope.peerData = result.v_peers.data;

        });
    }

    getPeers();



    //deal with the data from History of prefix
    $scope.HistoryPrefixOptions = {
      enableRowSelection: false,
      enableRowHeaderSelection: false
    };

    $scope.HistoryPrefixOptions.columnDefs = [
      {name: "router_name", displayName: 'RouterName', width: '*'},
      {name: "peer_name", displayName: 'PeerName', width: '*'},
      {name: "nh", displayName: 'NH', width: '*'},
      {name: "as_path", displayName: 'AS_Path', width: '*'},
      {name: "peer_asn", displayName: 'Peer_ASN', width: '*'},
      {name: "med", displayName: 'MED', width: '*'},
      {name: "communities", displayName: 'Communities', width: '*'},
      {name: "last_modified", displayName: 'Last_Modified', width: '*'},
    ];
    var createPrefixHisGrid = function () {
      for (var i = 0; i < $scope.HisData.length; i++) {
        $scope.HisData[i].router_name = $scope.HisData[i].RouterName;
        $scope.HisData[i].peer_name = $scope.HisData[i].PeerName;
        $scope.HisData[i].nh = $scope.HisData[i].NH;
        $scope.HisData[i].as_path = $scope.HisData[i].AS_Path;
        $scope.HisData[i].peer_asn = $scope.HisData[i].PeerASN;
        $scope.HisData[i].communities = $scope.HisData[i].Communities;
        $scope.HisData[i].med = $scope.HisData[i].MED;
        $scope.HisData[i].last_modified = $scope.HisData[i].LastModified;
      }
    };
    var getPrefixHisGrid = function (searchPrefix) {
      if ("All peers" == searchPrefix)
      {
        apiFactory.getHistoryPrefix(searchPrefix)
        .success(function(data) {
          $scope.HistoryPrefixOptions.data = $scope.HisData = data.v_routes_history.data;
          createPrefixHisGrid();
        });

      }
      else
      {
        $scope.peerHashId = $scope.peerData.selectPeer.peer_hash_id;
        apiFactory.getPeerHistoryPrefix(searchPrefix,$scope.peerHashId)
          .success(function(data) {
            $scope.HistoryPrefixOptions.data = $scope.HisData = data.v_routes_history.data;
            createPrefixHisGrid();
          });
      }
    };


    $scope.selectChange = function(){
      //$scope.peerName = $scope.peerData.selectPeer.peer_hash_id;
      getPrefixHisGrid($scope.currentValue);
    }

  }]);


