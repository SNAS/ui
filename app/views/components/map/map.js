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

    window.SCOPEMAP = $scope;

    /************** START MAP **************/
    $scope.chosenIndex = -1;
    $scope.loading = true;
    $scope.selected = false;
    $scope.error;

    $scope.activeMarker;

    $scope.panelTitle = "Router List";

    $scope.locations = [];
    $scope.peers = [];


    /****************************************
        Set and store map credentials
    *****************************************/
    var accessToken =   'pk.eyJ1IjoicGlja2xlZGJhZGdlciIsImEiOiJaTG1RUmxJIn0.HV-5_hj6_ggR32VZad4Xpg';
    var mapID =         'pickledbadger.lkfb3epb';
    angular.extend($scope, {
        defaults: {
            tileLayer: 'https://{s}.tiles.mapbox.com/v4/' + mapID + '/{z}/{x}/{y}.png?access_token=' + accessToken,
            minZoom: 2,
            zoomControl: false
        }
    });


    /****************************************
        Store map object when available
    *****************************************/
    leafletData.getMap($scope.id).then(function(map) {
        $scope.map = map;
        L.control.zoomslider().addTo(map);
        map.scrollWheelZoom.disable();
        $scope.init();
    });


    /****************************************
        Listen for menu toggle
    *****************************************/
    $scope.$on('menu-toggle', function() {
        $timeout( function(){
            $scope.map.invalidateSize();
        }, 500);
    });


    /****************************************
        Initialise map based on location
    *****************************************/
    $scope.init = function(){
        if($scope.location === 'peerView'){
            $scope.getPeers($scope.ip);
            $scope.map.addLayer($scope.peerLayer);
        }
        else if($scope.location === 'globalView'){
            $scope.getRouters();
            $scope.map.addLayer($scope.routerLayer);
            //update icons to show selection
            $scope.routerLayer.on('animationend', function (e) {
                e.target._featureGroup.eachLayer(function (l){
                    l._iconNeedsUpdate = true;
                })
            });
        }
        else if($scope.location === 'peerCard'){
            if($scope.plotMarker != undefined){
                $scope.map.invalidateSize();
                $scope.loading = false;
                var latlng = [$scope.plotMarker.latitude, $scope.plotMarker.longitude];
                var options = {
                    icon:   L.mapbox.marker.icon({
                        'marker-color': '#758CAB',
                        'marker-size': 'medium'
                    })
                }
                var marker = new L.Marker(latlng, options);
                $scope.map.addLayer(marker);
            }
        }
    }


    /*******************************
        Populate map with routers
    *******************************/
    //Array of current marker points
    $scope.allLocations = [];
    $scope.getRouters = function() {
        $scope.routerLayer = new L.FeatureGroup({
            selected: false
        });

        var data;
        apiFactory.getRoutersAndLocations().
        success(function (result){
            try {
                data = result.routers.data;
            } catch(e) {
                console.log(e);
                $scope.error = e;
                $scope.loading = false;
                return false;
            }

            if(data.length < 1){
                $scope.error = "Error: no results from server";
                $scope.loading = false;
                return false;
            }

            for(var i = 0; i < data.length; i++){
                //current location
                var latlng = [data[i].latitude, data[i].longitude];
                //current router data
                var currData = {
                    RouterName: data[i].RouterName,
                    RouterIP: data[i].RouterIP,
                    LastModified: data[i].LastModified,
                    isConnected: data[i].isConnected,
                    type: 'Router'
                };

                //concat of latlng for value (not an array)
                var pos = $scope.allLocations.indexOf(data[i].latitude + data[i].longitude);

                //we already have a marker at this location
                if(pos >= 0){
                    var curr = $scope.locations[pos];
                    curr.options.routers.push(currData);
                    //update icon to show the new router length
                    curr.setIcon(new L.mapbox.marker.icon({
                            'marker-symbol': curr.options.routers.length,
                            'marker-color': '#758CAB',
                            'marker-size': 'medium'
                        }));
                    //update popup content
                    curr = setPopup(curr);
                    $scope.locations[pos] = curr;
                }
                //we do not have a marker at this location
                else{
                    $scope.allLocations.push(data[i].latitude + data[i].longitude);
                    var options = 
                    {
                        country: data[i].country,
                        stateprov: data[i].stateprov,
                        city: data[i].city,
                        routers: [currData],
                        peers: [],
                        selected: false,
                        expandRouters: false,
                        expandPeers: true,
                        type: 'Router',
                        icon:   L.mapbox.marker.icon({
                                'marker-symbol': '1',
                                'marker-color': '#758CAB',
                                'marker-size': 'medium'})
                    };

                    var marker = new L.Marker(latlng, options);
                    marker = setPopup(marker);
                    $scope.routerLayer.addLayer(marker);
                    $scope.locations.push(marker);
                }
            }

            $scope.loading = false;
            $scope.fitMap('routers');
        }).
        error(function (error){
            $scope.error = "Error: API error";
            $scope.loading = false;
            return false;
        });
    }


    /*******************************
        Populate map with peers
    *******************************/
    $scope.selectedPeerLocations= [];
    $scope.getPeers = function (ip){
        $scope.peerLayer = new L.FeatureGroup({
            selected: false
        });
        //empty out the old location list
        $scope.allLocations = [];
        var data;
        apiFactory.getPeersAndLocationsByIp(ip).
        success(function (result){
            try {
                data = result.v_peers.data;
            } catch(e) {
                console.log(e);
                $scope.error = e;
                $scope.loading = false;
                return false;
            }

            if(data.length < 1){
                $scope.error = "Error: no results from server";
                $scope.loading = false;
                return false;
            }

            for(var i = 0; i < data.length; i++){
                //current location
                var latlng = [data[i].latitude, data[i].longitude];
                //current router data
                var currData = {
                    RouterIP: data[i].RouterIP,
                    RouterName: data[i].RouterName,
                    RouterAS: data[i].RouterAS,
                    PeerName: data[i].PeerName,
                    PeerIP: data[i].PeerIP,
                    PeerASN: data[i].PeerASN,
                    PeerASName: data[i].as_name,
                    LastDownTimestamp: data[i].LastDownTimestamp,
                    LastModified: data[i].LastModified,
                    LocalASN: data[i].LocalASN,
                    PeerPort: data[i].PeerPort,
                    isPeerIPv4: data[i].isPeerIPv4,
                    peer_hash_id: data[i].peer_hash_id,
                    isUp: data[i].isUp,
                    type: 'Peer'
                };

                //concat of latlng for value (not an array)
                var pos = $scope.allLocations.indexOf(data[i].latitude + data[i].longitude);

                //we already have a marker at this location
                if(pos >= 0){
                    var curr = $scope.selectedPeerLocations[pos];
                    //Add this peer to the router's peer list
                    curr.options.peers.push(currData);

                    //Peers and Routers
                    if(curr.options.routers.length > 0)
                        //Array too large to have numbers
                        if(curr.options.routers.length + curr.options.peers.length > 99)
                            curr.setIcon(new L.mapbox.marker.icon({
                                    'marker-symbol': 'danger',
                                    'marker-color': '#000',
                                    'marker-size': 'medium'
                                }));
                        else
                            curr.setIcon(new L.mapbox.marker.icon({
                                    'marker-symbol': curr.options.routers.length + curr.options.peers.length,
                                    'marker-color': '#000',
                                    'marker-size': 'medium'
                                }));
                    //Peers only
                    else
                        //Array too large to have numbers
                        if(curr.options.peers.length > 99)
                            curr.setIcon(new L.mapbox.marker.icon({
                                    'marker-symbol': 'danger',
                                    'marker-color': '#DFC089',
                                    'marker-size': 'medium'
                                }));
                        else
                            curr.setIcon(new L.mapbox.marker.icon({
                                    'marker-symbol': curr.options.peers.length,
                                    'marker-color': '#DFC089',
                                    'marker-size': 'medium'
                                }));
                    //update popup content
                    curr = setPopup(curr);
                    $scope.selectedPeerLocations[pos] = curr;
                }
                //we do not have a marker at this location
                else{
                    $scope.allLocations.push(data[i].latitude + data[i].longitude);
                    var options = 
                    {
                        country: data[i].country,
                        stateprov: data[i].stateprov,
                        city: data[i].city,
                        routers: [],
                        peers: [currData],
                        selected: false,
                        expandRouters: false,
                        expandPeers: true,
                        type: 'Peer',
                        icon:   L.mapbox.marker.icon({
                                'marker-symbol': '1',
                                'marker-color': '#DFC089',
                                'marker-size': 'medium'})
                    };

                    var marker = new L.Marker(latlng, options);
                    marker = setPopup(marker);

                    $scope.peerLayer.addLayer(marker);

                    $scope.selectedPeerLocations.push(marker);
                }
            }

            if($scope.routerLayer)
                $scope.map.removeLayer($scope.routerLayer);
            $scope.map.addLayer($scope.peerLayer);
            $scope.loading = false;
            $scope.fitMap('peers');
        }).
        error(function (error){
            $scope.error = "Error: API error";
            $scope.loading = false;
            return false;
        });
    }


    /************************************
        Set marker's popup content
    *************************************/
    var openTimer;
    var closeTimer;
    var target;
    function setPopup(marker){
        //contents of popup window
        var content =   '<span><p><strong>Routers: </strong>' + marker.options.routers.length + 
                        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong> Peers: </strong>' + marker.options.peers.length + 
                        "</p><p><strong>Location:</strong><br>" + marker.options.country + 
                        "<br>" + marker.options.stateprov + 
                        "<br>" + marker.options.city + "</p></span>";

        //compile the html into angular-ready HTML
        var linkFunction = $compile(angular.element(content));
        //bind the compiled HTML to the popup
        var popup = L.popup({type: 'router', minWidth: 200, className: 'router-popup'})
        .setContent(linkFunction($scope)[0]);
        marker.bindPopup(popup);

        //marker mouse events
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

        if(marker.options.type === 'Router')
            marker.on('click', function(e){
                $scope.selectMapLocation(e.target);
            });
        else
            marker.on('click', function(e){
                $scope.selectMapPeerLocation(e.target);
            });

        return marker;
    }


    /*******************************
        Update card
    *******************************/
    $scope.updateSelected = function(){
        $scope.cardApi.changeCard($scope.activeMarker.options);
    }


    /*******************************
        Fit map to marker bounds
    *******************************/
    $scope.fitMap = function(type, marker) {
        //keep the chosen router in view with peers
        if(type === 'both'){
            //create temp layer to add peers and router to
            var temp = $scope.peerLayer;
            temp.addLayer($scope.chosenRouter);
            $scope.map.fitBounds(temp.getBounds());
            temp.removeLayer($scope.chosenRouter);
            //clear temp
            temp = undefined;
        }
        //only keep peers in view
        else if(type === 'peers'){
            $scope.map.fitBounds($scope.peerLayer.getBounds());
        }
        //only keep routers in view
        else if(type === 'routers'){
            $scope.map.fitBounds($scope.routerLayer.getBounds());
        }
    };


    /****************************************
        Called when a location is selected
    *****************************************/
    $scope.selectMapLocation = function(location){
        $scope.expandList = true;
        $scope.selectedRouter = undefined;

        for(var i = 0; i < $scope.locations.length; i++){
            $scope.locations[i].expandRouters = false;
        }
        location.expandRouters = true;
        
        if($scope.selectedLocation != undefined)
            $scope.selectedLocation.setIcon(new L.mapbox.marker.icon({
                'marker-symbol': $scope.selectedLocation.options.routers.length,
                'marker-color': '#758CAB',
                'marker-size': 'medium'
            }));

        $scope.selectedLocation = location;
        location.setIcon(new L.mapbox.marker.icon({
            'marker-symbol': $scope.selectedLocation.options.routers.length,
            'marker-color': '#0386D2',
            'marker-size': 'large'
        }));
    }


    /****************************************
        Called when a peer is selected
    *****************************************/
    $scope.selectMapPeerLocation = function(location){
        $scope.expandList = true;
        $scope.selectedPeer = undefined;

        for(var i = 0; i < $scope.selectedPeerLocations.length; i++){
            $scope.selectedPeerLocations[i].options.expandPeers = false;
        }
        location.options.expandPeers = true;
        
        if($scope.selectedLocation != undefined){
            var len = $scope.selectedLocation.options.peers.length
            var oversize = len > 99;
            $scope.selectedLocation.setIcon(new L.mapbox.marker.icon({
                'marker-symbol': oversize ? 'danger' : len,
                'marker-color': '#DFC089',
                'marker-size': 'medium'
            }));
        }

        $scope.selectedLocation = location;
        var len = $scope.selectedLocation.options.peers.length
        var oversize = len > 99;
        location.setIcon(new L.mapbox.marker.icon({
            'marker-symbol': oversize ? 'danger' : len,
            'marker-color': '#F7C875',
            'marker-size': 'large'
        }));
    }


    /****************************************
        Selected a panel router
    *****************************************/
    $scope.selectPanelRouter = function(location, router){
        $scope.panelTitle = 'Router List - Peers';
        var cardData = router;
        cardData.country = location.options.country;
        cardData.stateprov = location.options.stateprov;
        cardData.city = location.options.stateprov;
        
        $scope.cardApi.changeCard(router);
        $scope.panelSearch = '';
        $scope.selectedRouter = router;
        if($scope.selectedLocation != undefined){
            $scope.selectedLocation.setIcon(new L.mapbox.marker.icon({
                'marker-symbol': $scope.selectedLocation.options.routers.length,
                'marker-color': '#758CAB',
                'marker-size': 'medium'
            }));
            $scope.selectedLocation = undefined;
        }
        $scope.getPeers(router.RouterIP);
        $scope.map.addLayer($scope.peerLayer);
    };


    /****************************************
        Close router selection
    *****************************************/
    $scope.deselectPanelRouter = function(){
        $scope.panelTitle = 'Router List';
        if($scope.selectedRouter != undefined){
            $scope.cardApi.removeCard($scope.selectedRouter);
            $scope.selectedRouter.expandRouters = false;
            $scope.selectedRouter = undefined;
        }
        if($scope.selectedLocation != undefined){
            $scope.selectedLocation.setIcon(new L.mapbox.marker.icon({
                'marker-symbol': $scope.selectedLocation.options.routers.length,
                'marker-color': '#758CAB',
                'marker-size': 'medium'
            }));
            $scope.selectedLocation.expandRouters = false;
            $scope.selectedLocation.options.expandPeers = false;

            $scope.selectedLocation = undefined;
        }
        $scope.selectedPeerLocations = [];
        $scope.map.removeLayer($scope.peerLayer);
        $scope.map.addLayer($scope.routerLayer);
        $scope.fitMap('routers');
    }


    /****************************************
        Selected a panel peer
    *****************************************/
    $scope.selectPanelPeer = function(location, peer){
        var temp = new L.featureGroup();
        temp.addLayer(location);
        $scope.map.fitBounds(temp.getBounds());
        console.log(peer);

        var cardData = peer;
        cardData.country = location.options.country;
        cardData.stateprov = location.options.stateprov;
        cardData.city = location.options.city;
        $scope.cardApi.changeCard(cardData);
    };


    /****************************************
        Location show/hide select
    *****************************************/
    $scope.selectPanelLocation = function(location){
        location.expandRouters = !location.expandRouters;
        if($scope.selectedLocation != undefined)
            $scope.selectedLocation.setIcon(new L.mapbox.marker.icon({
                'marker-symbol': $scope.selectedLocation.options.routers.length,
                'marker-color': '#758CAB',
                'marker-size': 'medium'
            }));
        $scope.selectedLocation = undefined;
    }


    /****************************************
        Peer location show/hide select
    *****************************************/
    $scope.selectPanelPeerLocation = function(location){
        location.options.expandPeers = !location.options.expandPeers;
        if($scope.selectedLocation != undefined)
            $scope.selectedLocation.setIcon(new L.mapbox.marker.icon({
                'marker-symbol': $scope.selectedLocation.options.peers.length,
                'marker-color': '#DFC089',
                'marker-size': 'medium'
            }));
        $scope.selectedLocation = undefined;
    }


    /****************************************
        Expand show/hide for searches
    *****************************************/
    $scope.expandPanelLocations = function(){
        if($scope.selectedRouter != undefined)
            for(var i = 0; i < $scope.selectedPeerLocations.length; i++){
                $scope.selectedPeerLocations[i].options.expandPeers = true;
            }
        else
            for(var i = 0; i < $scope.locations.length; i++){
                $scope.locations[i].expandRouters = true;
            }
    }
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
        plotMarker: "=?",
        cardApi: '=',
        id: "@name"
      }
    }
});
