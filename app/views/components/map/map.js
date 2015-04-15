'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:DashboardController
 * @description
 * # DashboardController
 * Controller of the Dashboard page
 */
angular.module('bmp.components.map', [])
.controller('MapController', function ($scope, $state, $q, $http, $timeout, apiFactory, leafletData, $compile) {
    window.SCOPE = $scope;

    /************** START MAP **************/

    $scope.chosenRouter = undefined;
    $scope.chosenPeer = undefined;

    $scope.chosenIndex = -1;
    $scope.loading = true;
    $scope.selected = false;

    $scope.activePopup = false;

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
                return $scope.clusterIcon(cluster);
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
                    country: data[i].country,
                    stateprov: data[i].stateprov,
                    city: data[i].city,

                    selected: false,
                    type: 'router',
                    icon:   L.mapbox.marker.icon({
                                'marker-color': '#758CAB',
                                'marker-size': 'medium'
                            })
                }

                var marker = createMarker(latlng, options, 'router');
                $scope.routerLayer.addLayer(marker);
                $scope.routers.push(marker);
            }

            $scope.routerLayer.on('animationend', function (e) {
                e.target._featureGroup.eachLayer(function (l){
                    l._iconNeedsUpdate = true;
                })
            });

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
                    country: data[i].country,
                    stateprov: data[i].stateprov,
                    city: data[i].city,
                    RouterName: data[i].RouterName,
                    RouterIP: data[i].RouterIP,
                    RouterAS: data[i].RouterAS,
                    LocalASN: data[i].LocalASN,
                    PeerPort: data[i].PeerPort,
                    isPeerIPv4: data[i].isPeerIPv4,
                    peer_hash_id: data[i].peer_hash_id,

                    type: 'peer',
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

    var openTimer;
    var closeTimer;
    var target;
    var createMarker = function(latlng, options, type){
        var marker = new L.Marker(latlng, options);

        if(type === 'router')
        {
            var content = '<p class="page-header"><strong>' +
            options.RouterName +
            '</strong></p><p><small><strong>Uptime: </strong><span class="text-success">' +
            options.LastModified +
            '</span></small></p><p><small><strong>IP Address: </strong>' +
            options.RouterIP +
            '</small></p><p><small><strong>Peers:</strong> 20</small></p><small><a ng-click="viewDetails()">View Detail</a></small>';

            marker.on('click', function (e){
                $scope.selectMarker(e.target);
            })
        }
        else
        {
            var content = '<p class="page-header"><strong>' +
            options.PeerName +
            '</strong><br><small><strong>Uptime: </strong><span class="text-success">' +
            options.LastModified +
            '</span></small></p><p><small><a href="#">' +
            options.PeerIP +
            '</a></small></p><p><small><strong>AS Number:</strong> ' +
            options.PeerASN +
            '</small></p>';

            marker.on('click', function(e){
                $scope.selectMarker(e.target);
            });
        }

        //var linkFunction = $compile(angular.element(content));
        //console.log(linkFunction($scope));

        var popup = L.popup({type: 'router', minWidth: 200, className: 'routerPopup'})
        .setLatLng(latlng)
        .setContent(content);
        marker.bindPopup(popup);

        marker.on('mouseover', function (e) {
            target = e.target;
            $timeout.cancel(closeTimer);
            if(openTimer){
                $timeout.cancel(openTimer)
            }
            openTimer= $timeout(function(){
                target.openPopup();
            }, 500)
        });
        marker.on('mouseout', function (e) {
            target = e.target;
            $timeout.cancel(openTimer);
            if(closeTimer){
                $timeout.cancel(closeTimer)
            }
            closeTimer= $timeout(function(){
                target.closePopup();
            }, 1000);
        });

        return marker;
    }

    $scope.viewDetails = function(){
        console.log('ooft');
    }

    $("map").mouseover(function(event) {
        if($scope.activePopup)
            if(event.target.classList[0] === "leaflet-tile"){
                $scope.activePopup = false;
                closeTimer= $timeout(function(){
                    target.closePopup();
                }, 1000);
            }

        if(event.target.classList[0] === "leaflet-popup-content" ||
           event.target.classList[0] === "leaflet-popup-content-wrapper"){
            $scope.activePopup = true;
            $timeout.cancel(closeTimer)
        }
    });

    //Called when a marker is selected
    $scope.selectMarker = function(marker){
        if(marker.options.type === 'router'){
            if($scope.chosenRouter != undefined){
                if(marker.options.RouterIP === $scope.routers[$scope.chosenIndex].options.RouterIP){
                    //Same router - do nothing
                    return;
                }
                else{
                    $scope.clearPeers();
                }
            }
            //Updates the router remove button
            $scope.selected = true;

            for (var i = 0; i < $scope.routers.length; i++){
                if ($scope.routers[i].options.RouterIP === marker.options.RouterIP) {
                    $scope.chosenRouter = $scope.routers[i];
                    $scope.chosenIndex = i;

                    $scope.routers[$scope.chosenIndex].options.selected = true;
                    $scope.routers[$scope.chosenIndex].setIcon(L.mapbox.marker.icon({
                        'marker-color': '#3491df',
                        'marker-size': 'large'
                    }));
                }
            }
            $scope.getPeers($scope.chosenRouter.options.RouterIP, true);
        }
        else {
            $scope.chosenPeer = marker;
        }

    }

    $scope.clearPeers = function(button) {
        if($scope.peerLayer)
            $scope.map.removeLayer($scope.peerLayer);

        if(button)
            $scope.map.closePopup();

        if($scope.chosenRouter){
            $scope.routers[$scope.chosenIndex].options.selected = false;
            $scope.routers[$scope.chosenIndex].setIcon(L.mapbox.marker.icon({
                'marker-color': '#758CAB',
                'marker-size': 'medium'
            }));

            //Dirty way to redraw the icons. Please don't look at this
            //TODO: Make it not rubbish
            $scope.map.removeLayer($scope.routerLayer);
            $scope.map.addLayer($scope.routerLayer);
        }

        $scope.chosenRouter = undefined;
        $scope.selected = false;
    }

    $scope.clusterIcon = function(cluster){
       var cmarkers = cluster.getAllChildMarkers();
        var cselected = false;
        for(var i =0; i < cmarkers.length; i++)
        {
          if(cmarkers[i].options.selected === true)
          {
            return L.mapbox.marker.icon({
              'marker-symbol': cluster.getChildCount(),
              'marker-color': '#3491df',
              'marker-size': 'large'
            });
          }
        }

        return L.mapbox.marker.icon({
          'marker-symbol': cluster.getChildCount(),
          'marker-color': '#364C69',
          'marker-size': 'large'
        });
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
})
.directive('map', function () {
    return  {
      templateUrl: "views/components/map/map.html",
      restrict: 'AE',
      controller: 'MapController',
      scope: {
        type: '@',
        ip: '=',
        chosenRouter: '=router',
        chosenPeer: '=peer'
      }
    }
});
