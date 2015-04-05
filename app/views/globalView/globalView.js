'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:DashboardController
 * @description
 * # DashboardController
 * Controller of the Dashboard page
 */
angular.module('bmpUiApp')
    .controller('GlobalViewController', function ($scope, $q, $http, $timeout, apiFactory, mapboxService) {
        window.SCOPE = $scope;
        //mine: 'pk.eyJ1IjoiaGFyam9uZXMiLCJhIjoibFNzSDV5OCJ9.TuozTWKZlJ4hwhxt2cA4CQ'
        mapboxService.init({ accessToken: 'pk.eyJ1IjoibGljeWV1cyIsImEiOiJuZ1gtOWtjIn0.qaaGvywaJ_kCmwmlTSNyVw' });

        $scope.chosenRouter;
        $scope.loading = true;
        $scope.selected = false;

        $scope.routers = [];
        $scope.peers = [];

        // $scope.markers.events = {
        //     click: function(marker, event, model, args){
        //         showRouter(marker);
        //     }
        // }

        $scope.$on('marker:open', function (e, data) {
            console.log('ooft');

          });

        $scope.showRouter = function(marker){
            console.log('hello');
            $scope.selected = true;

          for (var i = 0; i < $scope.routers.length; i++)
            if ($scope.routers[i].id === marker.key) {
              $scope.chosenRouter = $scope.routers[i];
              $scope.index = i;
            }else {
              $scope.routers[i].options.visible = false;
            }

          changeRouterCard($scope.chosenRouter);

            getChosenPeers();
        }

        function getChosenPeers(){
            apiFactory.getPeersByIp($scope.chosenRouter.ip).
            success(function (result){
                var data = result.v_peers.data;
                var temp = [];
                angular.forEach(data, function (value, key){
                    temp.push(apiFactory.getRouterLocation(value.PeerIP));
                });
                $q.all(temp).then(function (requests){
                    for(var i = 0; i < requests.length; i++)
                    {
                        var geodata = requests[i].data.v_geo_ip.data[0];
                        $scope.peers.push({
                            id: geodata.ip_start + ' - ' + data.ip_end,
                            latitude: geodata.latitude,
                            longitude: geodata.longitude,
                            show: false,
                            icon: '../images/marker-small.png',
                            data: data[i]
                        });
                    }
                    setBounds($scope.peers);
                })
            }).
            error(function (error){
                console.log(error.message);
            })
        }

       //  $scope.$watch($scope.map.control, function() {
       //      $scope.mapObject = $scope.map.control.getGMap();
       //      $scope.$on('menu-toggle', function(thing, args) {
       //          $timeout( function(){ google.maps.event.trigger($scope.mapObject, "resize"); }, 500);
       //      });
       // });

        // var setBounds = function (array){
        //     var bounds = new google.maps.LatLngBounds();
        //     for (var i=0; i<array.length; i++) {
        //       var latlng = new google.maps.LatLng(array[i].latitude, array[i].longitude);
        //       bounds.extend(latlng);
        //     }
        //     if($scope.chosenRouter != undefined)
        //         bounds.extend(new google.maps.LatLng($scope.chosenRouter.latitude, $scope.chosenRouter.longitude))
        //     $scope.mapObject.fitBounds(bounds);
        //     if($scope.mapObject.getZoom()> 15){
        //       $scope.mapObject.setZoom(15);
        //     }
        // }

        getRouters();

        function getRouters() {
            var temp = [];
            var routers = [];
            apiFactory.getRouters().
            success(function (result){

                var data = result.routers.data;
                var temp = [];
                var namesWithIP = [];
                angular.forEach(data, function (value, key){
                    temp.push(apiFactory.getRouterLocation(value.RouterIP));
                    namesWithIP.push({ip: value.RouterIP, name: value.RouterName});
                });
                $q.all(temp).then(function (requests){
                    for(var i = 0; i < requests.length; i++)
                    {
                        var data = requests[i].data.v_geo_ip.data[0];
                        $scope.routers.push({
                            id: namesWithIP[i].name,
                            lat: data.latitude,
                            lng: data.longitude,
                            ip: namesWithIP[i].ip
                        });
                    }
                    $scope.loading = false;
                    //setBounds($scope.routers);
                })
            }).
            error(function (error){
                console.log(error.message);
            })
        }

        $scope.cards = ["",[]];

        //router card DELETE \w CLICK
        $scope.removeRouterCard = function(){
          $scope.cards[0] = "";
        };

        //peer card DELETE \w CLICK
        $scope.removePeerCard = function (card) {
          var index = $scope.cards.indexOf(card);
          $scope.cards[1].splice(index, 1);
        };

        var changeRouterCard = function(value){
          $scope.cards[0] = value;
        };

        var changePeerCard = function(value) {
          if ($scope.cards[1].indexOf(value) == -1) {
            $scope.cards[1].push(value);
            if ($scope.cards[1].length > 3) {
              $scope.cards[1].shift();
            }
          }
        };

        //For when router is changed
        var clearPeersCard = function() {
          $scope.cards[1] = [];
        };

        //Test function to be called from within marker popup
        $scope.test = function(){
          alert("clicked view detailsasdfadfdsf");
        };
  });
