'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:DashboardController
 * @description
 * # DashboardController
 * Controller of the Dashboard page
 */
angular.module('bmpUiApp')
    .controller('GlobalViewController', function ($scope, $q, $http, $timeout, apiFactory, leafletData) {
        window.SCOPE = $scope;

        /************** START MAP **************/

        //Create a custom marker for router info
        //TODO: one for peers
        var BMPMarker = L.Marker.extend({
            options: {
                RouterIP: '',
                RouterName: '',
                description: '',
                isConnected: '',
                isPassive: '',
                RouterAS: '',
                LastModified: ''
            }
        })

        //IDs for mapbox
        //TODO: make constant in app.js
        var accessToken = 'pk.eyJ1IjoicGlja2xlZGJhZGdlciIsImEiOiJaTG1RUmxJIn0.HV-5_hj6_ggR32VZad4Xpg';
        var mapID = 'pickledbadger.lkfb3epb';

        //Extend leaflet to use our mapbox details
        angular.extend($scope, {
            defaults: {
                tileLayer: 'https://{s}.tiles.mapbox.com/v4/' + mapID + '/{z}/{x}/{y}.png?access_token=' + accessToken,
            }
        });

        //Use a promise to grab a copy of the map when available
        leafletData.getMap().then(function(map) {
            $scope.map = map;

            //listen on popup closure to reset peers
            $scope.map.on('popupclose', function (e){
                //console.log(e.options.type);
                //$scope.clearPeers();
            });
        });

        //Listen for a menu toggle broadcast to resize the map
        $scope.$on('menu-toggle', function() {
            $timeout( function(){ 
                $scope.map.invalidateSize();
            }, 500);
        });

        $scope.routerLayer;
        $scope.peerLayer;

        $scope.chosenRouter;
        $scope.loading = true;
        $scope.selected = false;

        $scope.routers = [];
        $scope.peers = [];

        getRouters();

        //Populate map with routers
        function getRouters() {
            //feature layer to find the bounds of the routers
            $scope.routerLayer = L.mapbox.featureLayer();

            var temp = [];
            var markers = [];
            apiFactory.getRouters().
            success(function (result){
                $scope.routerData = result.routers.data;

                var temp = [];
                var namesWithIP = [];
                angular.forEach($scope.routerData, function (value, key){
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

                        /******* TEMPORARY CODE WHILE GEOIP IS DOWN *******/
                        var latlng = [parseInt('5' + (i+3)), parseInt('3' + (i+3))];
                        /******* TEMPORARY CODE WHILE GEOIP IS DOWN *******/

                        var options = {
                            RouterName: namesWithIP[i].name,
                            RouterIP: namesWithIP[i].ip,
                        }

                        var marker = new BMPMarker(latlng, options);

                        var popup = L.popup({type: 'router', minWidth: 200})
                        .setLatLng(latlng)
                        .setContent('<p class="page-header"><strong>' + options.RouterName + '</strong></p><p><small><strong>Uptime: </strong><span class="text-success">22D 14H</span></small></p><p><small><strong>IP Address: </strong>' + options.RouterIP + '</small></p><p><small><strong>Peers:</strong> 20</small></p><small><a href="#">View Detail</a></small>');

                        marker.bindPopup(popup);

                        marker.on('click', function (e){
                            $scope.selectRouter(e.target);
                        })

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

        //Called when a router is selected
        $scope.selectRouter = function(router){
            if($scope.chosenRouter != undefined && router.options.RouterIP === $scope.chosenRouter.RouterIP)
                return;

            $scope.clearPeers();

            $scope.selected = true;

            for (var i = 0; i < $scope.routerData.length; i++){
                $scope.routers[i].setOpacity(0.5);
                if ($scope.routerData[i].RouterIP === router.options.RouterIP) {
                    router.setOpacity(1);
                    $scope.chosenRouter = $scope.routerData[i];              
                }
            }
            getChosenPeers();
        }

        $scope.clearPeers = function(button) {
            for(var i = 0; i < $scope.peers.length; i++){
                $scope.map.removeLayer($scope.peers[i]);
            }
            for(var i = 0; i < $scope.routers.length; i++){
                $scope.routers[i].setOpacity(1);
            }

            if(button)
                $scope.map.closePopup();

            $scope.chosenRouter = undefined;
            $scope.selected = false;

        }

        //Populate map with chosen router's peers
        function getChosenPeers(){
            apiFactory.getPeersByIp($scope.chosenRouter.RouterIP).
            success(function (result){
                var data = result.v_peers.data;
                var temp = [];
                angular.forEach(data, function (value, key){
                    temp.push(apiFactory.getRouterLocation(value.PeerIP));
                });
                $q.all(temp).then(function (requests){
                    for(var i = 0; i < requests.length; i++)
                    {
                        //var geodata = requests[i].data.v_geo_ip.data[0];
                        // $scope.peers.push({
                        //     id: geodata.ip_start + ' - ' + data.ip_end,
                        //     latitude: geodata.latitude,
                        //     longitude: geodata.longitude,
                        //     show: false,
                        //     icon: '../images/marker-small.png',
                        //     data: data[i]
                        // });

                        /******* TEMPORARY CODE WHILE GEOIP IS DOWN *******/
                        var latlng = [parseInt('5' + (i+2)), parseInt('3' + (i+3))];
                        /******* TEMPORARY CODE WHILE GEOIP IS DOWN *******/

                        var myIcon = L.icon({
                            iconUrl: '../images/marker-small.png'
                        });
                        var options = {
                            icon: myIcon
                        };

                        var marker = new BMPMarker(latlng, options);

                        var popup = L.popup({type: 'peer'})
                        .setLatLng(latlng)
                        .setContent('<p>I am a peer!</p>');

                        marker.bindPopup(popup);
                        marker.addTo($scope.map);

                        $scope.peers.push(marker);
                    }
                })
            }).
            error(function (error){
                console.log(error.message);
            })
        }

        //Fit map to the bounds of the router layer
        $scope.fitMap = function() {
          $scope.map.fitBounds($scope.routerLayer.getBounds());
        };

        /************** END MAP **************/

        //$scope.cards = ["",[]];
        //
        ////router card DELETE \w CLICK
        //$scope.removeRouterCard = function(){
        //  $scope.cards[0] = "";
        //};
        //
        ////peer card DELETE \w CLICK
        //$scope.removePeerCard = function (card) {
        //  var index = $scope.cards.indexOf(card);
        //  $scope.cards[1].splice(index, 1);
        //};
        //
        //var changeRouterCard = function(value){
        //  $scope.cards[0] = value;
        //};
        //
        //var changePeerCard = function(value) {
        //  if ($scope.cards[1].indexOf(value) == -1) {
        //    $scope.cards[1].push(value);
        //    if ($scope.cards[1].length > 3) {
        //      $scope.cards[1].shift();
        //    }
        //  }
        //};
        //
        ////For when router is changed
        //var clearPeersCard = function() {
        //  $scope.cards[1] = [];
        //};
  });
