'use strict';

angular.module('bmpUiApp')
  .controller('TopsViewController', ["$scope", "apiFactory", '$timeout', '$state', '$stateParams', function ($scope, apiFactory, $timeout, $state, $stateParams) {

    $scope.hours = 2;
    $scope.nodata = false;
    $scope.filterText = "None";
    $scope.filterClass = "label label-default";
    $scope.clearVisible = false;

    $scope.peerText = "Top 20 Peers By";
    $scope.prefixText = "Top 20 Prefixes By";

    $scope.searchTerm = null;
    $scope.searchBy = null;

    $scope.clearFilter=function(){
      $scope.filterText = "None";
      $scope.filterClass = "label label-default";
      $scope.tempClass=$scope.filterClass;
      $scope.searchTerm = null;
      $scope.searchBy = null;
      $scope.peerText = "Top 20 Peers By";
      $scope.prefixText = "Top 20 Prefixes By";
      loadAll();
    };

    $scope.keypress = function (keyEvent) {
      if (keyEvent.which === 13)
        loadAll();
    };

    //load All the graphs
    var loadAll = function () {
      $scope.topUpdatesByPeerLoading = true;
      $scope.topWithdrawsByPeerLoading = true;
      $scope.topUpdatesByPrefixLoading = true;
      $scope.topWithdrawsByPrefixLoading = true;

      apiFactory.getTopUpdates($scope.searchTerm, $scope.searchBy, "peer", $scope.hours)
        .success(function (result) {

          if (result.log != undefined) {
            var data = result.log.data;
            var len = data.length;
            var gData = [];
            for (var i = 0; i < len; i++) {
              gData.push({
                label: data[i].PeerAddr, value: parseInt(data[i].Count), hash: data[i].peer_hash_id
              });
            }
            $scope.topUpdatesByPeerData[0].values = gData;
            $scope.topUpdatesByPeerLoading = false;
          }
          else {
            $scope.topUpdatesByPeerData[0].values = null;
            $scope.topUpdatesByPeerLoading = false;
          }
        })
        .error(function (error) {
          console.log(error.message);
        });

      apiFactory.getTopWithdrawns($scope.searchTerm, $scope.searchBy, "peer", $scope.hours)
        .success(function (result) {

          if (result.log != undefined) {
            var data = result.log.data;
            var len = data.length;
            var gData = [];
            for (var i = 0; i < len; i++) {
              gData.push({
                label: data[i].PeerAddr, value: parseInt(data[i].Count), hash: data[i].peer_hash_id
              });
            }
            $scope.topWithdrawsByPeerData[0].values = gData;
            $scope.topWithdrawsByPeerLoading = false;
          }
          else {
            $scope.topWithdrawsByPeerData[0].values = [];
            $scope.topWithdrawsByPeerLoading = false;
          }

        })
        .error(function (error) {
          console.log(error.message);
        });

      apiFactory.getTopUpdates($scope.searchTerm, $scope.searchBy, "prefix", $scope.hours)
        .success(function (result) {

          if (result.log != undefined) {
            var data = result.log.data;
            var len = data.length;
            var gData = [];
            for (var i = 0; i < len; i++) {
              gData.push({
                label: data[i].Prefix + "/" + data[i].PrefixLen, value: parseInt(data[i].Count)
              });
            }
            $scope.topUpdatesByPrefixData[0].values = gData;
            $scope.topUpdatesByPrefixLoading = false;
          }
          else {
            $scope.topUpdatesByPrefixData[0].values = [];
            $scope.topUpdatesByPrefixLoading = false;
          }
        })
        .error(function (error) {
          console.log(error.message);
        });

      apiFactory.getTopWithdrawns($scope.searchTerm, $scope.searchBy, "prefix", $scope.hours)
        .success(function (result) {

          if (result.log != undefined) {
            var data = result.log.data;
            var len = data.length;
            var gData = [];
            for (var i = 0; i < len; i++) {
              gData.push({
                label: data[i].Prefix + "/" + data[i].PrefixLen, value: parseInt(data[i].Count)
              });
            }
            $scope.topWithdrawsByPrefixData[0].values = gData;
            $scope.topWithdrawsByPrefixLoading = false;
          }
          else {
            $scope.topWithdrawsByPrefixData[0].values = [];
            $scope.topWithdrawsByPrefixLoading = false;
          }
        })
        .error(function (error) {
          console.log(error.message);
        });

      // ------------------ used for GRAPHS ---------- binding click function-----------------------------//
      $timeout(function () {
        d3.selectAll("#topUpdatesByPeer .nv-bar").on('click', function (d) {
          $scope.searchTerm = d.hash;
          $scope.filterText = d.label;
          $scope.filterClass = "label label-info";
          $scope.searchBy = "peer";
          $scope.peerText = "Peer -- " + d.label + " :";
          $scope.prefixText = "Top 20 Prefixes By";
          loadAll();
        });
      }, 2000);
      $timeout(function () {
        d3.selectAll("#topWithdrawsByPeer .nv-bar").on('click', function (d) {
          $scope.searchTerm = d.hash;
          $scope.filterText = d.label;
          $scope.filterClass = "label label-info";
          $scope.searchBy = "peer";
          $scope.peerText = "Peer -- " + d.label + " :";
          $scope.prefixText = "Top 20 Prefixes By";
          loadAll();
        });
      }, 2000);
      $timeout(function () {
        d3.selectAll("#topUpdatesByPrefix .nv-bar").on('click', function (d) {
          $scope.searchTerm = d.label;
          $scope.filterText = d.label;
          $scope.filterClass = "label label-info";
          $scope.searchBy = "prefix";
          $scope.peerText = "Top 20 Peers By";
          $scope.prefixText = "Prefix -- " + d.label + " :";
          loadAll();
        });
      }, 2000);
      $timeout(function () {
        d3.selectAll("#topWithdrawsByPrefix .nv-bar").on('click', function (d) {
          $scope.searchTerm = d.label;
          $scope.filterText = d.label;
          $scope.filterClass = "label label-info";
          $scope.searchBy = "prefix";
          $scope.peerText = "Top 20 Peers By";
          $scope.prefixText = "Prefix -- " + d.label + " :";
          loadAll();
        });
      }, 2000);
    };

    /* Top 20 Updates By Peer Graph START*/

    $scope.topUpdatesByPeerLoading = true;
    $scope.topUpdatesByPeerGraph = {
      chart: {
        type: 'discreteBarChart',
        height: 500,
        margin: {
          top: 20,
          right: 20,
          bottom: 80,
          left: 70
        },
        color: function (d, i) {
          return "#89DA59";
        },
        x: function (d) {
          return d.label;
        },
        y: function (d) {
          return d.value;
        },
        showValues: true,
        valueFormat: function (d) {
          return d3.format('')(d);
        },
        transitionDuration: 500,
        tooltipContent: function (key, x, y, e, graph) {
          //hover = y;
          hoverValue(x);
          return '<h3>' + key + '</h3>' +
            '<p>' + y + ' on ' + x + '</p>';
        },
        xAxis: {
          rotateLabels: -25,
          rotateYLabel: true
        },
        yAxis: {
          axisLabel: 'Number of Updates',
          axisLabelDistance: 30,
          tickFormat: d3.format('d')
        }
      }
    };

    var hoverValue = function (y) {
      $scope.hover = y;
      $scope.$apply();
    };

    $scope.topUpdatesByPeerConfig = {
      //visible: $scope.data.visible // default: true
    };


    $scope.topUpdatesByPeerData = [
      {
        key: "Updates",
        values: [[]]
      }
    ];

    /*Top 20 Updates By Peer Graph END*/


    /*Top 20 Withdraws By Peer Graph START*/

    $scope.topWithdrawsByPeerLoading = true;
    $scope.topWithdrawsByPeerGraph = {
      chart: {
        type: 'discreteBarChart',
        height: 500,
        margin: {
          top: 20,
          right: 20,
          bottom: 80,
          left: 55
        },
        color: function (d, i) {
          return "#FF420E"
        },
        x: function (d) {
          return d.label;
        },
        y: function (d) {
          return d.value;
        },
        showValues: true,
        valueFormat: function (d) {
          return d3.format('')(d);
        },
        transitionDuration: 500,
        tooltipContent: function (key, x, y, e, graph) {
          hoverValue(x);
          return '<h3>' + key + '</h3>' +
            '<p>' + y + ' on ' + x + '</p>';
        },
        xAxis: {
          rotateLabels: -25,
          rotateYLabel: true
        },
        yAxis: {
          axisLabel: 'Number of Withdraws',
          axisLabelDistance: 30,
          tickFormat: d3.format('d')
        }
      }
    };

    var hoverValue = function (y) {
      $scope.hover = y;
      $scope.$apply();
    };

    $scope.topWithdrawsByPeerConfig = {
      //visible: $scope.data.visible // default: true
    };


    $scope.topWithdrawsByPeerData = [
      {
        key: "Withdraws",
        values: [[]]
      }
    ];


    /*Top 20 Withdraws By Peer Graph END*/


    /* Top 20 Updates By Peer Graph START*/

    $scope.topUpdatesByPrefixLoading = true;
    $scope.topUpdatesByPrefixGraph = {
      chart: {
        type: 'discreteBarChart',
        height: 500,
        margin: {
          top: 20,
          right: 20,
          bottom: 80,
          left: 70
        },
        color: function (d, i) {
          return "#89DA59";
        },
        x: function (d) {
          return d.label;
        },
        y: function (d) {
          return d.value;
        },
        showValues: true,
        valueFormat: function (d) {
          return d3.format('')(d);
        },
        transitionDuration: 500,
        tooltipContent: function (key, x, y, e, graph) {
          //hover = y;
          hoverValue(x);
          return '<h3>' + key + '</h3>' +
            '<p>' + y + ' on ' + x + '</p>';
        },
        xAxis: {
          rotateLabels: -25,
          rotateYLabel: true
        },
        yAxis: {
          axisLabel: 'Number of Updates',
          axisLabelDistance: 30,
          tickFormat: d3.format('d')
        }
      }
    };

    var hoverValue = function (y) {
      $scope.hover = y;
      $scope.$apply();
    };

    $scope.topUpdatesByPrefixConfig = {
      //visible: $scope.data.visible // default: true
    };


    $scope.topUpdatesByPrefixData = [
      {
        key: "Updates",
        values: [[]]
      }
    ];

    /*Top 20 Updates By Peer Graph END*/


    /*Top 20 Withdraws By Peer Graph START*/

    $scope.topWithdrawsByPrefixLoading = true;
    $scope.topWithdrawsByPrefixGraph = {
      chart: {
        type: 'discreteBarChart',
        height: 500,
        margin: {
          top: 20,
          right: 20,
          bottom: 80,
          left: 55
        },
        color: function (d, i) {
          return "#FF420E"
        },
        x: function (d) {
          return d.label;
        },
        y: function (d) {
          return d.value;
        },
        showValues: true,
        valueFormat: function (d) {
          return d3.format('')(d);
        },
        transitionDuration: 500,
        tooltipContent: function (key, x, y, e, graph) {
          hoverValue(x);
          return '<h3>' + key + '</h3>' +
            '<p>' + y + ' on ' + x + '</p>';
        },
        xAxis: {
          rotateLabels: -25,
          rotateYLabel: true
        },
        yAxis: {
          axisLabel: 'Number of Withdraws',
          axisLabelDistance: 30,
          tickFormat: d3.format('d')
        }
      }
    };

    var hoverValue = function (y) {
      $scope.hover = y;
      $scope.$apply();
    };

    $scope.topWithdrawsByPrefixConfig = {
      //visible: $scope.data.visible // default: true
    };


    $scope.topWithdrawsByPrefixData = [
      {
        key: "Withdraws",
        values: [[]]
      }
    ];


    /*Top 20 Withdraws By Peer Graph END*/


    loadAll();


  }]);
