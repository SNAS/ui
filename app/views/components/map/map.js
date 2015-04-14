'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:DashboardController
 * @description
 * # DashboardController
 * Controller of the Dashboard page
 */
angular.module('bmp.components.map', [])
.controller('MapController', function ($scope, $state, $q, $http, $timeout, apiFactory, leafletData) {

    /************** START MAP **************/

    $scope.chosenRouter;
    $scope.chosenIndex;
    $scope.loading = true;
    $scope.selected = false;

    $scope.routers = [];
    $scope.peers = [];

    //IDs for mapbox
    //TODO: make constant in app.js
    var accessToken =   'pk.eyJ1IjoicGlja2xlZGJhZGdlciIsImEiOiJaTG1RUmxJIn0.HV-5_hj6_ggR32VZad4Xpg';
    var mapID =         'pickledbadger.lkfb3epb';

    //Extend leaflet to use our mapbox details
    angular.extend($scope, {
        defaults: {
            tileLayer: 'https://{s}.tiles.mapbox.com/v4/' + mapID + '/{z}/{x}/{y}.png?access_token=' + accessToken,
            minZoom: 1
        }
    });

    //Use a promise to grab a copy of the map when available
    leafletData.getMap().then(function(map) {
        $scope.map = map;   
        $scope.init();
    });

    //Listen for a menu toggle broadcast to resize the map
    $scope.$on('menu-toggle', function() {
        $timeout( function(){
            $scope.map.invalidateSize();
        }, 500);
    });

    $scope.init = function(){
        if($scope.type === 'peers'){
            $scope.getPeers($scope.ip);
            $scope.map.addLayer($scope.peerLayer);
        }
        else if($scope.type === 'routers'){
            $scope.getRouters();
            $scope.map.addLayer($scope.routerLayer);
        }        
    }

    //Populate map with routers
    $scope.getRouters = function() {
        $scope.routerLayer = new L.MarkerClusterGroup({
            selected: false,
            iconCreateFunction: function(cluster) {
                $scope.cluster = cluster;
                return L.mapbox.marker.icon({
                  'marker-symbol': cluster.getChildCount(),
                  'marker-color': '#364C69',
                  'marker-size': 'large'
                });
            }
        });

        var temp = [];
        var markers = [];

        apiFactory.getRoutersAndLocations().
        success(function (result){
            var data = result.routers.data;

            for(var i = 0; i < data.length; i++){
                var latlng = [data[i].latitude, data[i].longitude];

                var options = {
                    RouterName: data[i].RouterName,
                    RouterIP: data[i].RouterIP,
                    LastModified: data[i].LastModified,
                    isConnected: data[i].isConnected,
                    Country: data[i].country,
                    State: data[i].stateprov,
                    City: data[i].city,
                    selected: false,

                    icon:   L.mapbox.marker.icon({
                                'marker-color': '#758CAB',
                                'marker-size': 'medium'
                            })
                }

                var marker = createMarker(latlng, options, 'router');
                $scope.routerLayer.addLayer(marker);
                $scope.routers.push(marker);
            }
            $scope.loading = false;
            $scope.fitMap('routers');            
        }).
        error(function (error){
            console.log(error);
        })
    }

    //Populate map with chosen router's peers
    $scope.getPeers = function (ip, withRouter){
        $scope.peerLayer = new L.MarkerClusterGroup({
            iconCreateFunction: function(cluster) {
                return L.mapbox.marker.icon({
                  'marker-symbol': cluster.getChildCount(),
                  'marker-color': '#C59948',
                  'marker-size': 'large'
                });
            }
        });
        apiFactory.getPeersAndLocationsByIp(ip).
        success(function (result){
            var data = result.v_peers.data;

            for(var i = 0; i < data.length; i++){
                var latlng = [data[i].latitude, data[i].longitude];

                var options = {
                    PeerName: data[i].PeerName,
                    PeerIP: data[i].PeerIP,
                    PeerASN: data[i].PeerASN,
                    LastDownTimestamp: data[i].LastDownTimestamp,
                    LastModified: data[i].LastModified,
                    Country: data[i].country,
                    State: data[i].stateprov,
                    City: data[i].city,
                    RouterName: data[i].RouterName,
                    RouterIP: data[i].RouterIP,
                    RouterAS: data[i].RouterAS,
                    LocalASN: data[i].LocalASN,
                    PeerPort: data[i].PeerPort,
                    isPeerIPv4: data[i].isPeerIPv4,
                    peer_hash_id: data[i].peer_hash_id,

                    icon:   L.mapbox.marker.icon({
                                'marker-color': '#DFC089',
                                'marker-size': 'medium'
                            })
                };

                var marker = createMarker(latlng, options, 'peer');
                $scope.peerLayer.addLayer(marker);
                $scope.peers.push(marker);
            }                
            $scope.loading = false;

            if(withRouter){
                $scope.fitMap('both');
                $scope.map.addLayer($scope.peerLayer);
            }
            else{
                $scope.fitMap('peers');
            }
        }).
        error(function (error){
            console.log(error);
        })
    }

    var createMarker = function(latlng, options, type){
        var openTimer;
        var closeTimer;

        var marker = new L.Marker(latlng, options);

        if(type === 'router')
        {
             var popup = L.popup({type: 'router', minWidth: 200, className: 'routerPopup'})
            .setLatLng(latlng)
            .setContent('<p class="page-header"><strong>' + options.RouterName + '</strong></p><p><small><strong>Uptime: </strong><span class="text-success">' + options.LastModified + '</span></small></p><p><small><strong>IP Address: </strong>' + options.RouterIP + '</small></p><p><small><strong>Peers:</strong> 20</small></p><small><a href="#">View Detail</a></small>');
        
            marker.on('click', function (e){
                $scope.selectRouter(e.target);
            })
        } 
        else 
        {
            var popup = L.popup({type: 'peer', minWidth: 210})
            .setLatLng(latlng)
            .setContent('<p class="page-header"><strong>' + options.PeerName + '</strong><br><small><strong>Uptime: </strong><span class="text-success">' + options.LastModified + '</span></small></p><p><small><a href="#">' + options.PeerIP + '</a></small></p><p><small><strong>AS Number:</strong> ' + options.PeerASN + '</small></p>');
        
            marker.on('click', function(e){
                changePeerCard(e.target.options);
            });
        }
       
        marker.bindPopup(popup);
        
        marker.on('mouseover', function (e) {
            $timeout.cancel(closeTimer);

            if(openTimer){
                $timeout.cancel(openTimer)
            }
            openTimer= $timeout(function(){
                e.target.openPopup();
            }, 500)
        });
        marker.on('mouseout', function (e) {
            $timeout.cancel(openTimer);

            if(closeTimer){
                $timeout.cancel(closeTimer)
            }
            closeTimer= $timeout(function(){
                e.target.closePopup();
            }, 1000)
        });

        return marker;
    }

    //Called when a router is selected
    $scope.selectRouter = function(router){
        if($scope.chosenRouter != undefined){
            if(router.options.RouterIP === $scope.routers[$scope.chosenIndex].options.RouterIP){
                return;
            }
            else{
                $scope.routers[$scope.chosenIndex].options.selected = false;
                $scope.routers[$scope.chosenIndex].setIcon(L.mapbox.marker.icon({
                    'marker-color': '#758CAB',
                    'marker-size': 'medium'
                }));

                $scope.clearPeers();
            }
        }

        $scope.selected = true;

        for (var i = 0; i < $scope.routers.length; i++){
            if ($scope.routers[i].options.RouterIP === router.options.RouterIP) {
                $scope.chosenRouter = $scope.routers[i];
                $scope.chosenIndex = i;

                $scope.routers[$scope.chosenIndex].options.selected = true;                
                $scope.routers[$scope.chosenIndex].setIcon(L.mapbox.marker.icon({
                    'marker-color': '#3491df',
                    'marker-size': 'large'
                }));
            }
        }
        //Adding Router Card
        changeRouterCard($scope.chosenRouter.options);
        clearPeersCard();

        $scope.getPeers($scope.chosenRouter.options.RouterIP, true);
    }

    $scope.clearPeers = function(button) {
        if($scope.peerLayer)
            $scope.map.removeLayer($scope.peerLayer);

        if(button)
            $scope.map.closePopup();

        $scope.chosenRouter = undefined;
        $scope.selected = false;
    }

    //Fit map to the bounds of the router layer
    $scope.fitMap = function(type) {
        if(type === 'both'){
            var temp = $scope.peerLayer;
            temp.addLayer($scope.chosenRouter);
            $scope.map.fitBounds(temp.getBounds());
            temp.removeLayer($scope.chosenRouter);
            temp = undefined;
        }
        else if(type === 'peers'){
            $scope.map.fitBounds($scope.peerLayer.getBounds());
        }
        else{
            $scope.map.fitBounds($scope.routerLayer.getBounds());
        }
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
})
.directive('map', function () {
    return  {
      templateUrl: "views/components/map/map.html",
      restrict: 'AE',
      replace: 'true',
      controller: 'MapController',
      scope: {
        type: '@',
        ip: '='
      }
    }
});