'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:DashboardController
 * @description
 * # DashboardController
 * Controller of the Dashboard page
 */
angular.module('bmpUiApp')
    .controller('GlobalViewController', function ($scope, $q, $http, $timeout, apiFactory, mapboxService, leafletData) {
        window.SCOPE = $scope;

        var accessToken = 'pk.eyJ1IjoicGlja2xlZGJhZGdlciIsImEiOiJaTG1RUmxJIn0.HV-5_hj6_ggR32VZad4Xpg';
        var mapID = 'pickledbadger.lkfb3epb';

        angular.extend($scope, {
            defaults: {
                tileLayer: 'https://{s}.tiles.mapbox.com/v4/' + mapID + '/{z}/{x}/{y}.png?access_token=' + accessToken,
            }
        });

        leafletData.getMap().then(function(map) {
            $scope.map = map;
        });

        $scope.routerLayer;

        $scope.chosenRouter;
        $scope.loading = true;
        $scope.selected = false;

        $scope.routers = [];
        $scope.peers = [];

        $scope.$on('marker:open', function (e, data) {
            console.log('ooft');

          });

        $scope.selectRouter = function(router){
             console.log('hello');
          //   $scope.selected = true;

          // for (var i = 0; i < $scope.markers.length; i++)
          //   if ($scope.markers[i].id === marker.key) {
          //     $scope.chosenRouter = $scope.markers[i];
          //     $scope.index = i;
          //   }else {
          //     $scope.markers[i].options.visible = false;
          //   }

          //   getChosenPeers();
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

        $scope.$on('menu-toggle', function() {
            $timeout( function(){ //call resize 
            }, 500);
        });

        getRouters();

        function getRouters() {
            $scope.routerLayer = L.mapbox.featureLayer();

            var temp = [];
            var markers = [];
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
                        // var data = requests[i].data.v_geo_ip.data[0];
                        // console.log(requests[i]);
                        // $scope.routers.push({
                        //     id: i, 
                        //     lat: data.latitude,
                        //     lng: data.longitude,
                        //     ip: namesWithIP[i].ip
                        // });
                        var latlng = [parseInt('5' + (i+3)), parseInt('3' + (i+3))];

                        var marker = new L.marker(latlng);

                        var popup = L.popup()
                        .setLatLng(latlng)
                        .setContent('<p>Hello world!<br />This is a nice popup.</p>');

                        marker.bindPopup(popup);
                        marker.addTo($scope.map);

                        $scope.routers.push(marker);
                    } 
                    $scope.loading = false; 

                    $scope.routerLayer = L.featureGroup($scope.routers);                    
                    $scope.fitMap();            
                })
            }).
            error(function (error){
                console.log(error.message);
            })
        }

        $scope.fitMap = function() {
          $scope.map.fitBounds($scope.routerLayer.getBounds());
        };

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
