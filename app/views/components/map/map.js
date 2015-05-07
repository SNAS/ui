'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:DashboardController
 * @description
 * # DashboardController
 * Controller of the Dashboard page
 */
angular.module('bmp.components.map', ['ui.bootstrap'])
.controller('MapController', function ($scope, $state, $q, $http, $timeout, apiFactory, leafletData, $compile, $filter) {

    window.SCOPEMAP = $scope;

    $scope.chosenIndex = -1;
    $scope.loading = true;
    $scope.selected = false;
    $scope.error;
    $scope.info;

    $scope.activeMarker;

    /************************************
        Change panel based on location
    *************************************/
    if($scope.location === 'globalView')
        $scope.panelTitle = "Router List";
    else{
        $scope.panelTitle = "Peer List";
        $scope.selectedRouter = true;
    }

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


    $scope.$watch('plotMarker', function(val) {
        if(val != undefined)
            $scope.init();
    });


    /****************************************
        Initialise map based on location
    *****************************************/
    $scope.init = function(){
        if($scope.location === 'peerView'){
            $scope.getPeers();
        }
        else if($scope.location === 'globalView'){
            $scope.getRouters();
        }
        else if($scope.location === 'peerCard'){
            if($scope.plotMarker != undefined){
                if($scope.singlePoint != undefined){
                    $scope.map.removeLayer($scope.singlePoint);
                }
                $scope.map.invalidateSize();
                $scope.loading = false;
                var latlng = [$scope.plotMarker.latitude, $scope.plotMarker.longitude];
                var options = {
                    icon:   L.mapbox.marker.icon({
                        'marker-color': '#758CAB',
                        'marker-size': 'medium'
                    })
                }
                $scope.singlePoint = new L.Marker(latlng, options);
                $scope.map.addLayer($scope.singlePoint);
                $scope.fitMap('single');
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
                $scope.error = typeof e !== undefined ? e : 'Generic Server Error';
                $scope.loading = false;
                return false;
            }

            if(data.length < 1){
                $scope.error = "Error: no results from server";
                $scope.loading = false;
                return false;
            }

            for(var i = 0; i < data.length; i++){
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
                    setIcon(curr, 'default');
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
                        expandRouters: false,
                        expandPeers: false,
                        type: 'Router',
                        icon: L.divIcon({
                            html: '<div><span>1</span><img src="http://a.tiles.mapbox.com/v3/marker/pin-m+758CAB.png"/></div>',
                            className: 'marker',
                            iconSize: [30, 70]
                        })
                    };

                    var marker = new L.Marker(latlng, options);
                    marker = setPopup(marker);
                    $scope.routerLayer.addLayer(marker);
                    $scope.locations.push(marker);
                }
            }

            $scope.map.addLayer($scope.routerLayer);
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
        if(ip === undefined)
            ip = '';
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
                $scope.error = typeof e !== undefined ? e : 'Generic Server Error';
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
                    setIcon(curr, 'default');
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
                        expandRouters: false,
                        expandPeers: false,
                        type: 'Peer',
                        icon: L.divIcon({
                            html: '<div><span>1</span><img src="http://a.tiles.mapbox.com/v3/marker/pin-m+DFC089.png"/></div>',
                            className: 'marker',
                            iconSize: [30, 70]
                        })
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
        Set marker's click events
    *************************************/
    var openTimer;
    var closeTimer;
    var target;
    function setPopup(marker){
        //marker mouse events
        if(marker.options.type === 'Router')
            marker.on('click', function(e){
                $scope.selectMapLocation(e.target);
            });
        else
            marker.on('click', function(e){
                $scope.selectMapPeerLocation(e.target);
            });
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

        marker = setPopupContent(marker);
        return marker;
    }


    /************************************
        Set marker's popup content
    *************************************/
    function setPopupContent(marker){
        //contents of popup window
        if(marker.options.type === "Router")
            var content =   '<span><p><strong>Location:</strong><br>' + marker.options.city + 
                            ', ' + marker.options.stateprov + 
                            ', ' + marker.options.country + '</p>' + 
                            '<p><strong>Routers at location: </strong>' + marker.options.routers.length +
                            '</p></span>';
        else{
            var content =   '<span><p><strong>Location:</strong><br>' + marker.options.city + 
                            ', ' + marker.options.stateprov + 
                            ', ' + marker.options.country + '</p>' + 
                            '<p><strong>Peers at location: </strong>' + marker.options.peers.length +
                            '</p></span>';
        }
        //compile the html into angular-ready HTML
        var linkFunction = $compile(angular.element(content));
        marker.bindPopup(linkFunction($scope)[0], {offset: new L.Point(0, -26)});

        return marker;
    }


    /************************************
        Set marker's icon
    *************************************/
    function setIcon(marker, state){
        if(marker.options.type === 'Peer')
            if(state === 'default')
                marker.setIcon(new L.divIcon({
                    html: '<div><span>' + marker.options.peers.length + '</span><img src="http://a.tiles.mapbox.com/v3/marker/pin-m+DFC089.png"/></div>',
                    className: 'marker',
                    iconSize: [30, 70]
                }));
            else
                marker.setIcon(new L.divIcon({
                    html: '<div><span>' + marker.options.peers.length + '</span><img src="http://a.tiles.mapbox.com/v3/marker/pin-m+F7C875.png"/></div>',
                    className: 'marker',
                    iconSize: [30, 70]
                }));
        else if(marker.options.type === 'Router')
            if(state === 'default')
                marker.setIcon(new L.divIcon({
                    html: '<div><span>' + marker.options.routers.length + '</span><img src="http://a.tiles.mapbox.com/v3/marker/pin-m+758CAB.png"/></div>',
                    className: 'marker',
                    iconSize: [30, 70]
                }));
            else
                marker.setIcon(new L.divIcon({
                    html: '<div><span>' + marker.options.routers.length + '</span><img src="http://a.tiles.mapbox.com/v3/marker/pin-m+0386D2.png"/></div>',
                    className: 'marker',
                    iconSize: [30, 70]
                }));
        //Reset popup content for offset calculation
        marker = setPopupContent(marker);
    }


    /************************************
        Briefly set info content on map
    *************************************/
    function setInfo(message){
        $scope.info = message;
        $scope.activeInfo = true;
        $timeout(function(){
            $scope.activeInfo = false;
        }, 2000);
    }


    /*******************************
        Pan map to location
    *******************************/
    $scope.goto = function(location){
        $scope.map.setView(location.getLatLng());
        if(location.options.type === 'Router'){
            location.expandRouters = true;
            if($scope.selectedLocation != undefined){
                $scope.selectedLocation.closePopup();
                $scope.selectedLocation.options.zIndexOffset = 0;
                setIcon($scope.selectedLocation, 'default');
            } 
            $scope.selectedLocation = location;
            $scope.selectedLocation.options.zIndexOffset = 1000;
            setIcon($scope.selectedLocation, 'active');
            $scope.selectedLocation.openPopup();
        }
        else{
            location.options.expandPeers = true;
            if($scope.selectedLocation != undefined){
                $scope.selectedLocation.closePopup();
                $scope.selectedLocation.options.zIndexOffset = 0;
                setIcon($scope.selectedLocation, 'default');
            } 
            $scope.selectedLocation = location;
            $scope.selectedLocation.options.zIndexOffset = 1000;
            setIcon($scope.selectedLocation, 'active');
            $scope.selectedLocation.openPopup();
        }
    }


    /*******************************
        Fit map to marker bounds
    *******************************/
    $scope.fitMap = function(type) {
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
        else if(type === 'single'){
            var temp = L.featureGroup();
            temp.addLayer($scope.singlePoint);
            $scope.map.fitBounds(temp.getBounds(), {maxZoom: 10});
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
            setIcon($scope.selectedLocation, 'default');

        $scope.selectedLocation = location;
        setIcon($scope.selectedLocation, 'active');
    }


    /****************************************
        Called when a peer is selected
    *****************************************/
    $scope.selectMapPeerLocation = function(location){
        $scope.expandList = true;

        for(var i = 0; i < $scope.selectedPeerLocations.length; i++){
            $scope.selectedPeerLocations[i].options.expandPeers = false;
        }
        location.options.expandPeers = true;
        if($scope.selectedLocation != undefined){
            setIcon($scope.selectedLocation, 'default');
        }
        $scope.selectedLocation = location;
        setIcon($scope.selectedLocation, 'active');
    }


    /****************************************
        Selected a panel router
    *****************************************/
    $scope.selectPanelRouter = function(location, router){
        $scope.panelTitle = 'Peer List';
        var cardData = router;
        cardData.country = location.options.country;
        cardData.stateprov = location.options.stateprov;
        cardData.city = location.options.stateprov;
        
        $scope.cardApi.changeCard(router);
        $scope.panelSearch = '';
        $scope.selectedRouter = router;
        if($scope.selectedLocation != undefined){
            $scope.selectedLocation.closePopup();
            setIcon($scope.selectedLocation, 'default');
            $scope.selectedLocation = undefined;
        }
        $scope.expandList = false;
        $scope.getPeers(router.RouterIP);
        setInfo('Router added to card list');
    };


    /****************************************
        Close router selection
    *****************************************/
    $scope.deselectPanelRouter = function(){
        $scope.panelTitle = 'Router List';
        if($scope.selectedRouter != undefined){
            $scope.cardApi.removeCard($scope.selectedRouter);
            $scope.selectedRouter = false;
            $scope.selectedRouter = undefined;
        }
        if($scope.selectedLocation != undefined){
            console.log($scope.selectedLocation);
            $scope.selectedLocation.closePopup();
            setIcon($scope.selectedLocation, 'default');
            $scope.selectedLocation.expandRouters = false;
            $scope.selectedLocation.options.expandPeers = false;
            /*********************************************************************************
                BUG - THIS CODE CAUSES THE PANEL TO STILL SHOW A SELECTED ROUTER ON DESELECT
            *********************************************************************************/
            //$scope.selectedLocation = undefined;
        }
        $scope.selectedPeerLocations = [];
        $scope.map.removeLayer($scope.peerLayer);
        $scope.map.addLayer($scope.routerLayer);
        setInfo('Card list cleared');
        $scope.fitMap('routers');
    }


    /****************************************
        Selected a panel peer
    *****************************************/
    $scope.selectPanelPeer = function(location, peer){
        var temp = new L.featureGroup();
        temp.addLayer(location);
        $scope.map.fitBounds(temp.getBounds());
        if($scope.selectedLocation != undefined){
            $scope.selectedLocation.closePopup();
        }
        var cardData = peer;
        cardData.country = location.options.country;
        cardData.stateprov = location.options.stateprov;
        cardData.city = location.options.city;
        $scope.cardApi.changeCard(cardData);
        setInfo('Peer added to card list');
    };


    /****************************************
        Location show/hide select
    *****************************************/
    $scope.selectPanelLocation = function(location){
        location.expandRouters = !location.expandRouters;
        if($scope.selectedLocation != undefined)
            setIcon($scope.selectedLocation, 'default');
        $scope.selectedLocation = undefined;
    }


    /****************************************
        Peer location show/hide select
    *****************************************/
    $scope.selectPanelPeerLocation = function(location){
        location.options.expandPeers = !location.options.expandPeers;
        if($scope.selectedLocation != undefined){
            $scope.selectedLocation.closePopup();
            setIcon($scope.selectedLocation, 'default');
        }
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
