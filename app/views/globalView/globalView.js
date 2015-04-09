'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:DashboardController
 * @description
 * # DashboardController
 * Controller of the Dashboard page
 */
angular.module('bmpUiApp')
    .controller('GlobalViewController', function ($scope, $state, $q, $http, $timeout, apiFactory, leafletData) {
        window.SCOPE = $scope;

        /************** START MAP **************/

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

            $scope.routerLayer = new L.MarkerClusterGroup();
        });

        //Listen for a menu toggle broadcast to resize the map
        $scope.$on('menu-toggle', function() {
            $timeout( function(){
                $scope.map.invalidateSize();
            }, 500);
        });

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
                // $scope.routerData = result.routers.data;
                var data = [];
                var temp = [];
                angular.forEach(result.routers.data, function (value, key){
                    temp.push(apiFactory.getRouterLocation(value.RouterIP));
                    data.push({
                        RouterIP: value.RouterIP,
                        RouterName: value.RouterName,
                        LastModified: value.LastModified
                    });
                });
                $q.all(temp).then(function (requests){
                    for(var i = 0; i < requests.length; i++)
                    {
                        var result = requests[i].data.v_geo_ip.data[0];

                        var latlng = [result.latitude, result.longitude];

                        var options = {
                            RouterName: data[i].RouterName,
                            RouterIP: data[i].RouterIP,
                            LastModified: data[i].LastModified,
                            Country: result.country,
                            State: result.stateprov,
                            City: result.city
                            //,storedOpacity: 1
                        }

                        var marker = new L.Marker(latlng, options);

                        var popup = L.popup({type: 'router', minWidth: 200, className: 'routerPopup'})
                        .setLatLng(latlng)
                        .setContent('<p class="page-header"><strong>' + options.RouterName + '</strong></p><p><small><strong>Uptime: </strong><span class="text-success">22D 14H</span></small></p><p><small><strong>IP Address: </strong>' + options.RouterIP + '</small></p><p><small><strong>Peers:</strong> 20</small></p><small><a href="#">View Detail</a></small>');

                        marker.bindPopup(popup);

                        var openTimer;
                        var closeTimer;

                        marker.on('click', function (e){
                            $scope.selectRouter(e.target);
                        })
                        marker.on('mouseover', function (e) {
                            $timeout.cancel(closeTimer);

                            if(e.target.options.opacity < 1)
                                e.target.setOpacity(0.7);

                            if(openTimer){
                                // Ignore this change
                                $timeout.cancel(openTimer)
                            }
                            openTimer= $timeout(function(){
                                //console.log(e.originalEvent.toElement);
                                e.target.openPopup();
                            }, 500)
                        });
                        marker.on('mouseout', function (e) {
                            $timeout.cancel(openTimer);

                            if(e.target.options.opacity < 1)
                                e.target.setOpacity(0.5);

                            if(closeTimer){
                                // Ignore this change
                                $timeout.cancel(closeTimer)
                            }
                            closeTimer= $timeout(function(){
                                //console.log(e.originalEvent.toElement);
                                e.target.closePopup();
                            }, 1000)
                        });

                        $scope.routerLayer.addLayer(marker);
                        $scope.routers.push(marker);
                    }
                    $scope.map.addLayer($scope.routerLayer);
                    $scope.routerLayer.on('spiderfied', function (a) {
                        //console.log(a);
                    });

                    $scope.loading = false;
                    $scope.fitMap();
                })
            }).
            error(function (error){
                console.log(error);
            })
        }

        //Called when a router is selected
        $scope.selectRouter = function(router){
            if($scope.chosenRouter != undefined && router.options.RouterIP === $scope.chosenRouter.RouterIP){
                console.log('returning');
                return;
            }

            $scope.clearPeers();

            $scope.selected = true;

            for (var i = 0; i < $scope.routers.length; i++){
                //router.options.storedOpacity = 0.5;
                $scope.routers[i].setOpacity(0.5);
                if ($scope.routers[i].options.RouterIP === router.options.RouterIP) {
                    //router.options.storedOpacity = 1;
                    router.setOpacity(1);
                    $scope.chosenRouter = $scope.routers[i];
                }
            }
            //Adding Router Card
            changeRouterCard($scope.chosenRouter.options);
            clearPeersCard();

            getChosenPeers();
        }

        $scope.clearPeers = function(button) {
            for(var i = 0; i < $scope.peers.length; i++){
                $scope.map.removeLayer($scope.peers[i]);
            }
            for(var i = 0; i < $scope.routers.length; i++){
                //$scope.routers[i].options.storedOpacity = 1;
                $scope.routers[i].setOpacity(1);
            }

            if(button)
                $scope.map.closePopup();

            $scope.chosenRouter = undefined;
            $scope.selected = false;
        }

        //Populate map with chosen router's peers
        function getChosenPeers(){
            apiFactory.getPeersByIp($scope.chosenRouter.options.RouterIP).
            success(function (result){
                var data = [];
                var temp = [];
                angular.forEach(result.v_peers.data, function (value, key){
                    temp.push(apiFactory.getRouterLocation(value.PeerIP));
                    data.push({
                        PeerIP: value.PeerIP,
                        PeerName: value.PeerName,
                        PeerASN: value.PeerASN,
                        LastDownTimestamp: value.LastDownTimestamp,
                        RouterName: value.RouterName,
                        RouterIP: value.RouterIP,
                        RouterAS: value.RouterAS,
                        LocalASN: value.LocalASN,
                        peer_hash_id: value.peer_hash_id
                    });
                });
                $q.all(temp).then(function (requests){
                    for(var i = 0; i < requests.length; i++)
                    {
                        var result = requests[i].data.v_geo_ip.data[0];

                        var latlng = [result.latitude, result.longitude];

                        var myIcon = L.icon({
                            iconUrl: '../images/marker-small.png'
                        });
                        var options = {
                            icon: myIcon,
                            PeerName: data[i].PeerName,
                            PeerIP: data[i].PeerIP,
                            PeerASN: data[i].PeerASN,
                            LastDownTimestamp: data[i].LastDownTimestamp,
                            Country: result.country,
                            State: result.stateprov,
                            City: result.city,
                            RouterName: data[i].RouterName,
                            RouterIP: data[i].RouterIP,
                            RouterAS: data[i].RouterAS,
                            LocalASN: data[i].LocalASN,
                            peer_hash_id: data[i].peer_hash_id
                        };

                        var marker = new L.Marker(latlng, options);

                        var popup = L.popup({type: 'peer', minWidth: 210})
                        .setLatLng(latlng)
                        .setContent('<p class="page-header"><strong>' + options.PeerName + '</strong><br><small><strong>Uptime: </strong><span class="text-success">22D 14H</span></small></p><p><small><a href="#">' + options.PeerIP + '</a></small></p><p><small><strong>AS Number:</strong> ' + options.PeerASN + '</small></p>');

                        marker.bindPopup(popup);

                        marker.on('click', function(e){
                          changePeerCard(e.target.options);
                          //$state.go('app.peerView', {RouterIP: $scope.chosenRouter.RouterIP});
                        })

                        marker.on('mouseover', function (e) {
                            e.target.openPopup();
                            if(e.target.options.opacity < 1)
                                e.target.setOpacity(0.8);
                        });
                        marker.on('mouseout', function (e) {
                            e.target.closePopup();
                            if(e.target.options.opacity < 1)
                                e.target.setOpacity(0.5);
                        });

                        marker.addTo($scope.map);
                        $scope.peers.push(marker);
                    }
                })
            }).
            error(function (error){
                console.log(error);
            })
        }

        //Fit map to the bounds of the router layer
        $scope.fitMap = function() {
          $scope.map.fitBounds($scope.routerLayer.getBounds());
        };

        /************** END MAP **************/

        $scope.cards = [[],[]];

        //router card DELETE \w CLICK
        $scope.removeRouterCard = function(){
          $scope.cards[0]= [];
          $scope.cards[1]= [];//empty peers also
        };

        //peer card DELETE \w CLICK
        $scope.removePeerCard = function (card) {
          var index = $scope.cards.indexOf(card);
          $scope.cards[1].splice(index, 1);
        };

        var changeRouterCard = function(value){
          $scope.cards[0][0] = value;
        };

        var changePeerCard = function(value) {
          if ($scope.cards[1].indexOf(value) == -1) {
            $scope.cards[1].push(value);
            if ($scope.cards[1].length > 4) {
              $scope.cards[1].shift();
            }
          }
        };

        //For when router is changed
        var clearPeersCard = function() {
          $scope.cards[1] = [];
        };
  });
