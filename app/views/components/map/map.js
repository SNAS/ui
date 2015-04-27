'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:DashboardController
 * @description
 * # DashboardController
 * Controller of the Dashboard page
 */
angular.module('bmp.components.map', [])
.controller('MapController', function ($scope, $state, $q, $http, $timeout, apiFactory, leafletData, $compile, $filter) {

    window.SCOPE = $scope;

    /************** START MAP **************/
    $scope.chosenIndex = -1;
    $scope.loading = true;
    $scope.selected = false;

    $scope.activePopup = false;
    $scope.activeMarker;

    $scope.routers = [];
    $scope.peers = [];

    $scope.showSearch = true;
    $scope.usePopUps = true;

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
        if($scope.location === 'peerView'){
            $scope.getPeers($scope.ip);
            $scope.map.addLayer($scope.peerLayer);
        }
        else if($scope.location === 'globalView'){
            $scope.getRouters();
            $scope.map.addLayer($scope.routerLayer);
        }else if($scope.location === 'singlePoint'){
            //single marker stuff here
            $scope.map.invalidateSize();
            $scope.showSearch = false;
            $scope.usePopUps = false;
            $scope.loading = false;
            //new L.Marker(latlng, options)
            $scope.map.addLayer(new L.Marker([3,3]));
            window.SCOPERZ = $scope;
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
                    type: 'Router',
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
                    PeerASName: data[i].as_name,
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

                    type: 'Peer',
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
            $scope.map.addLayer($scope.peerLayer);

            if(withRouter){
                $scope.fitMap('both');
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
            var content =   '<span>' +
                                '<p class="page-header">' +
                                    '<strong>' +
                                        options.RouterName +
                                    '</strong>' +
                                '</p>' +
                                '<p>' +
                                    '<small>' +
                                        '<strong>IP Address: </strong> ' +
                                        options.RouterIP +
                                    '</small>' +
                                '</p>' +
                                '<p>' +
                                    '<small>' +
                                        '<strong>Peers: </strong> ' +
                                            '20' +
                                            //options.PeersCount +
                                    '</small>' +
                                '</p>' +
                                '<p>' +
                                    '<small>' +
                                        '<strong>Uptime: </strong>' +
                                        '<span class="text-success">' +
                                            options.LastModified +
                                        '</span>' +
                                    '</small>' +
                                '</p>' +
                                '<p>' +
                                    '<small>' +
                                        '<a ng-click="updateSelected(' + options.RouterIP + ')">View Detail</a>' +
                                    '</small>' +
                                '</p>' +
                            '</span>';
        }
        else
        {
            var content =   '<span>' +
                                '<p class="page-header">' +
                                    '<strong>' +
                                        options.PeerName +
                                    '</strong>' +
                                '</p>' +
                                '<p>' +
                                    '<small>' +
                                        '<strong>AS Number:</strong> ' +
                                        options.PeerASN +
                                    '</small>' +
                                '</p>' +
                                '<p>' +
                                    '<small>' +
                                        '<strong>Uptime: </strong>' +
                                        '<span class="text-success">' +
                                            options.LastModified +
                                        '</span>' +
                                    '</small>' +
                                '</p>' +
                                '<p>' +
                                    '<small>' +
                                        '<a ng-click="updateSelected()">View Detail</a>' +
                                    '</small>' +
                                '</p>' +
                            '</span>';
        }

        marker.on('click', function(e){
            $scope.selectMarker(e.target);
        });

        var linkFunction = $compile(angular.element(content));

        var popup = L.popup({type: 'router', minWidth: 200, className: 'router-popup'})
        .setLatLng(latlng)
        .setContent(linkFunction($scope)[0]);
        marker.bindPopup(popup);

        marker.on('mouseover', function (e) {
            target = e.target;
            $timeout.cancel(closeTimer);
            if(openTimer){
                $timeout.cancel(openTimer)
            }
            openTimer= $timeout(function(){
                target.openPopup();
                $scope.activeMarker = target;
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

    $scope.updateSelected = function(){
        $scope.cardApi.changeCard($scope.activeMarker.options);
    }

    $("map").mouseover(function(event) {
      if($scope.usePopUps) {
        if ($scope.activePopup)
          if (event.target.classList[0] === "leaflet-tile") {
            $scope.activePopup = false;
            closeTimer = $timeout(function () {
              target.closePopup();
            }, 1000);
          }

        if (event.target.classList[0] === "leaflet-popup-content" ||
          event.target.classList[0] === "leaflet-popup-content-wrapper") {
          $scope.activePopup = true;
          $timeout.cancel(closeTimer)
        }
      }
    });

    //Called when a marker is selected
    $scope.selectMarker = function(marker){
        if(marker.options.type === 'Router'){
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


    /*********** START SEARCH ************/
    $scope.peer;
    $scope.extra = undefined;

    $scope.search;
    $scope.filters = [];
    $scope.filteredPeers = [];
    $scope.suggestions = [];

    var timer;
    $scope.searchLoading = false;
    $scope.suggest = true;

    $scope.$watch('search', function (val) {
        if(!$scope.suggest){
            $scope.suggest = !$scope.suggest;
            return;
        }

        if(val === undefined || val.length == 0){
            $scope.suggestions = [];
            $scope.extra = undefined;
            $timeout.cancel(timer);
            return;
        }

        if(timer){
            $timeout.cancel(timer);
        }
        timer= $timeout(function(){
            $scope.searchLoading = true;
            var type = "";

            if(val.indexOf('.') > -1){
                type = 'PeerIP';
            }
            else if(val.indexOf(':') > -1){
                type = 'PeerIP';
            }
            else if(parseInt(val)){
                type = 'PeerASN';
            }
            else if(typeof(val) === 'string' && val.length >= 3){
                type = 'PeerASName';
            }
            else{
                $scope.suggestions = [];
                $scope.extra = undefined;
                $scope.searchLoading = false;
                return;
            }

            getSuggestedPeers(type, val);
        }, 500);
    });

    function getSuggestedPeers(type, val){
        $scope.suggestions = [];
        $scope.extra = undefined;
        var count = 0;
        val = val.toUpperCase();
        var array;

        if($scope.filtered){
            array = $scope.filteredPeers;
        }
        else{
            array = $scope.peers;
        }

        for(var i = 0; i < array.length; i++){
            if(array[i].options[type] === null)
                continue;
            var curr = array[i].options[type].toString();
            if(curr.toUpperCase().lastIndexOf(val, 0) === 0){
                count ++;

                var sugLength = $scope.suggestions.length;
                if(sugLength < 5){
                    var duplicate = false;
                    for(var j = 0; j < sugLength; j++){
                        if($scope.suggestions[j].content.toUpperCase() === curr.toUpperCase()){
                            //We already have this result in the autocomplete, add to the list
                            $scope.suggestions[j].object.push(array[i]);
                            var duplicate = true;
                            break;
                        }
                    }
                    if(!duplicate){
                        $scope.suggestions.push({'type': type, 'content': curr, 'object': [array[i]]});
                    }
                }
            }
        }
        if(count > 5)
            $scope.extra = count-5 + ' more result(s); refine search';
        else if(count === 0)
            $scope.extra = 'no results';

        $scope.searchLoading = false;
    }

    $scope.getData = function(type, object, content){
        $scope.loading = true;
        $scope.filteredPeers = [];

        for(var i = 0; i < object.length; i++){
             $scope.filteredPeers.push(object[i]);
        }

        $scope.loading = false;

        $scope.searchTerm = content;
        $scope.search = "";

        $scope.peerLayer.clearLayers();
        $scope.peerLayer.addLayers($scope.filteredPeers);
        $scope.fitMap('peers');

        $scope.filters.push(content);
        $scope.filtered = true;

        $scope.suggestions = [];
        $scope.extra = undefined;
    }

    $scope.clearSearch = function(){
        $scope.searchTerm = undefined;
        $scope.filters = [];
        $scope.filtered = false;
        $scope.peerLayer.clearLayers();
        $scope.peerLayer.addLayers($scope.peers);
        $scope.search = "";
        $scope.fitMap('peers');
    }
    /************** END SEARCH **************/
})
.directive('map', function () {
    return {
      templateUrl: "views/components/map/map.html",
      restrict: 'AE',
      controller: 'MapController',
      scope: {
        location: '=',
        ip: '=?',
        cardApi: '=',
        type: '@'
      }
    }
});
