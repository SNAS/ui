'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:DashboardController
 * @description
 * # DashboardController
 * Controller of the Dashboard page
 */
angular.module('bmp.components.map', ['ui.bootstrap'])
.controller('MapController', ["$scope", "$rootScope", "$timeout", "apiFactory", "leafletData", "$compile", "$window", "$q", function ($scope, $rootScope, $timeout, apiFactory, leafletData, $compile, $window, $q) {

    window.SCOPEMAP = $scope;

    $scope.chosenIndex = -1;
    //$scope.loading = true;
    $scope.selected = false;
    $scope.error;
    $scope.info;

    $scope.activeMarker;

    $scope.selectionMade = false;

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
    console.log($scope.id);
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

    $scope.$watch('selectionMade', function(val){
        if($rootScope.dualWindow.active){
            $scope.mapHeight = '100%';
            $scope.panelHeight = '80%';
            $timeout(function(){
                $scope.map.invalidateSize();
            }, 1000);
            return;
        }
        if(val === true){
            $scope.mapHeight = 400;
        }
        else{
            return;
        }
        $scope.panelHeight = $scope.mapHeight - 120;
        $timeout(function(){
            $scope.map.invalidateSize();
        }, 1000);
    });


    /****************************************
        Initialise map based on location
    *****************************************/
    $scope.dualWindow = false;
    $scope.init = function(){
        if($rootScope.dualWindow.active){
            $scope.dualWindow = true;
        }

        if($scope.location === 'peerView'){
            $scope.panelTitle = "Peer List";
            $scope.selectedRouter = true;
            $scope.getPeers();
        }
        else if($scope.location === 'globalView'){
            $scope.panelTitle = "Router List";
            $scope.getRouters();
            loadBottomPane();
        }
        else if($scope.location === 'peerCard'){
            $scope.selectionMade = true;
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
        $scope.loading = true;
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
                    curr = setPopupContent(curr);
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
            $scope.$broadcast('routers-loaded');
            $scope.fitMap('routers');
        }).
        error(function (error){
            $scope.error = "Error: API error";
            $scope.loading = false;
            return false;
        });
    }


    function distance(obj) {
        var R = 6371; // km
        var dLat = (obj.lat2 - obj.lat1) * Math.PI / 180;
        var dLon = (obj.lon2 - obj.lon1) * Math.PI / 180;
        var lat1 = obj.lat1 * Math.PI / 180;
        var lat2 = obj.lat2 * Math.PI / 180;

        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;
        var m = d * 0.621371;
        return {
            km: d,
            m: m
        }
    }

    /*******************************
        Populate map with peers
    *******************************/
    $scope.peerDictionary = {};
    $scope.selectedPeerLocations= [];
    $scope.getPeers = function (ip){
        $scope.loading = true;
        if(ip === undefined)
            ip = '';
        if($scope.routerLayer)
                $scope.map.removeLayer($scope.routerLayer);
        $scope.peerLayer = new L.FeatureGroup();
        var peerCount = 0;

        var data;
        apiFactory.getPeersAndLocationsByIp(ip).
        success(function (result){
            var data = result.v_peers.data;
            for (var i = 0, len = data.length; i < len; i++) {
                var curr = data[i];
                var latlng = [curr.latitude, curr.longitude];
                var temp = curr.latitude + ',' + curr.longitude;

                //
                var dist = {km: 99999, m : 999999};
                for(var key in $scope.peerDictionary){
                    var p = $scope.peerDictionary[key]._latlng;
                    dist = distance({
                        lat1: p.lat,
                        lon1: p.lng,
                        lat2: curr.latitude,
                        lon2: curr.longitude
                    });
                    if (dist.km < 100) {
                        $scope.peerDictionary[key].options.peers.push(curr);
                        break;
                    }
                }

                if(dist.km < 100)
                    continue;

                var options = {
                    country: curr.country,
                    stateprov: curr.stateprov,
                    city: curr.city,
                    routers: [],
                    peers: [curr],
                    expandRouters: false,
                    expandPeers: false,
                    type: 'Peer',
                    id: peerCount
                };
                peerCount++;
                var marker = new L.Marker(latlng, options);
                $scope.peerDictionary[temp] = marker;
                $scope.peerLayer.addLayer(marker);

            }
            for(var key in $scope.peerDictionary){
                setIcon($scope.peerDictionary[key], 'default');
                $scope.peerDictionary[key] = setPopup($scope.peerDictionary[key]);
            }

            $scope.loading = false;
            $scope.$broadcast('peers-loaded');
            $scope.map.addLayer($scope.peerLayer);
            $scope.fitMap('peers');
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

        if($scope.selectedLocation != undefined){
            setIcon($scope.selectedLocation, 'default');
        }
        $scope.selectedLocation = location;
        setIcon($scope.selectedLocation, 'active');


        for (var key in $scope.peerDictionary) {
            $scope.peerDictionary[key].options.expandPeers = false;
        }
        angular.element('.main').scrollTop(0);
        location.options.expandPeers = true;
        $scope.panelSearch = location.options.city;
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
        cardData.type = 'Router';

        $scope.selectionMade = true;
        $scope.$broadcast('router-click');
        $scope.height = 400;
        $scope.map.invalidateSize();

        $scope.cardApi.changeCard(router);
        $scope.panelSearch = '';
        $scope.selectedRouter = router;
        if($scope.selectedLocation != undefined){
            $scope.selectedLocation.closePopup();
            setIcon($scope.selectedLocation, 'default');
            $scope.selectedLocation = undefined;
        }
        $scope.getPeers(router.RouterIP);
        setInfo('Router added to card list');
    };


    /****************************************
        Close router selection
    *****************************************/
    $scope.deselectPanelRouter = function(){
        $scope.panelTitle = 'Router List';
        $scope.$broadcast('clear-router');
        $scope.panelSearch = '';
        $scope.selectionMade = false;
        //force map resize
        $scope.forceResize();
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
        $scope.selectionMade = false;
        // $scope.selectedPeerLocations = [];
        $scope.peerDictionary = {};
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

        if(!$scope.selectionMade){
            $scope.height = 400;
            $scope.map.invalidateSize();
            $scope.selectionMade = true;
        }

        var cardData = peer;
        cardData.country = location.options.country;
        cardData.stateprov = location.options.stateprov;
        cardData.city = location.options.city;
        cardData.type = 'Peer';
        $scope.cardApi.changeCard(cardData);
        setInfo('Peer added to card list');
    };


    /****************************************
        Location show/hide select
    *****************************************/
    $scope.selectPanelLocation = function(location){
        location.expandRouters = !location.expandRouters;
        $scope.$broadcast('location-click');
        if($scope.selectedLocation != undefined)
            setIcon($scope.selectedLocation, 'default');
        $scope.selectedLocation = undefined;
    }


    /****************************************
        Peer location show/hide select
    *****************************************/
    $scope.selectPanelPeerLocation = function(location){
        location.options.expandPeers = !location.options.expandPeers;
        $scope.$broadcast('peer-location-click');
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
        if($scope.selectedRouter != undefined){
            for(var i = 0; i < $scope.selectedPeerLocations.length; i++){
                $scope.selectedPeerLocations[i].options.expandPeers = true;
            }
            for (var key in $scope.peerDictionary) {
                $scope.peerDictionary[key].options.expandPeers = true;
            }
        }
        else
            for(var i = 0; i < $scope.locations.length; i++){
                $scope.locations[i].expandRouters = true;
            }
    }



    /****************************************
     Bottom Pane - setup
     *****************************************/

    //ATM this increase loading time could be made to load
    //this after page loads so when loading = false;

    //TODO:still need to make this only show on certain pages

    $scope.bottomPaneState = true; //is closed

    var loadBottomPane = function(){

      $scope.topChartOptions = {
        chart: {
          type: 'multiBarHorizontalChart',
          height: 100,
          width: 600,
          margin : {
            top: 0,
            right: 10,
            bottom: 20,
            left: 120
          },
          color: function (d, i) {
            return "#5e7309"
          },
          x: function(d){return d.label;},
          y: function(d){return d.value;},
          showControls: false,
          showLegend: false,
          showValues: true,
          transitionDuration: 500
        },
        title: {
          enable: true,
          text: "Top 3 BMP Routers by Peers Monitored",
          class: "h5",
          css: {
            width: "nullpx",
            textAlign: "center"
          }
        }
      };


      $scope.peerIpChartOptions = {
        chart: {
          type: "pieChart",
          height: 150,
          width: 150,
          margin : {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          },
          donut: true,
          donutRatio: 0.65,
          showLabels: false,
          showLegend: false,
          pie: {
            startAngle: function(d) { return d.startAngle -Math.PI/2 },
            endAngle: function(d) { return d.endAngle -Math.PI/2 }
          },
          color: function(d,i){
            return d.data.color
          },
          tooltipContent: function (key, y, e, graph) {
            return '<h3 style="background-color: '
              + e.color + '">' + e.point.key + '</h3>'
              + '<p>' +  y + '</p>';
          },
          transitionDuration: 500
        }
      };

      $scope.peerChartUpOptions = {
        chart: {
          type: "pieChart",
          height: 250,
          width: 250,
          donut: true,
          donutRatio: 0.8,
          showLabels: false,
          showLegend: false,
          pie: {
            startAngle: function(d) { return d.startAngle -Math.PI/2 },
            endAngle: function(d) { return d.endAngle -Math.PI/2 }
          },
          color: function(d,i){
            return d.data.color
          },
          tooltipContent: function (key, y, e, graph) {
            return '<h3 style="background-color: '
              + e.color + '">' + e.point.key + '</h3>'
              + '<p>' +  y + '</p>';
          },
          transitionDuration: 500
        }
      };

      $scope.routerChartOptions = {
        chart: {
          type: "pieChart",
          height: 150,
          width: 150,
          margin : {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          },
          donut: true,
          donutRatio: 0.65,
          showLabels: false,
          showLegend: false,
          pie: {
            startAngle: function(d) { return d.startAngle -Math.PI/2 },
            endAngle: function(d) { return d.endAngle -Math.PI/2 }
          },
          color: function(d,i){
            return d.data.color
          },
          tooltipContent: function (key, y, e, graph) {
            return '<h3 style="background-color: '
              + e.color + '">' + e.point.key + '</h3>'
              + '<p>' +  y + '</p>';
          },
          transitionDuration: 500
        }
      };

      $scope.showChartsConfig = {
        visible: false // default: true
      };

      $scope.$watch('bottomPaneState', function() {
        if ($scope.bottomPaneState == false) {
          //resize
          $scope.showChartsConfig.visible = true;
        }
      });

    $scope.chartData = [];

    $scope.routerTotals = [0,0,0]; //up,down,total

    var loadPeersFromRouters = function(router){
      var deferred = $q.defer();
      var urlCalls = [];
      angular.forEach(router, function(value, key) {
        if(value.isConnected){
          $scope.routerTotals[0]++;
        }else{
          $scope.routerTotals[1]++;
        }
        $scope.routerTotals[2]++;
        urlCalls.push(apiFactory.getPeersByIp(value.RouterIP));
      });

      $scope.routerChartData = [
        {
          key: "Up",
          color: "#5da571",
          y: $scope.routerTotals[0]
        },
        {
          key: "Down",
          color: "#a65151",
          y: $scope.routerTotals[1]
        }
      ];

      $q.all(urlCalls)
        .then(
        function(results) {
          deferred.resolve(
            results
          )
        });
      return deferred.promise;

    };

    apiFactory.getRouters()
      .success(function (result){
        var routers = result.routers.data;
        $scope.routerCount = result.routers.data.length;
        //Loop through routers selecting and altering relevant data.

        loadPeersFromRouters(routers).then(function(results){
          for(var i = 0; i < results.length; i++){
            $scope.chartData.push({
              label : routers[i].RouterIP,
              value : results[i].data.v_peers.size
            });
          }
          $scope.chartData.sort(function(a, b){return b.value - a.value});
          $scope.chartData = $scope.chartData.slice(0,3);

          $scope.topChartData = [
            {
              key: "Routers",
              color: "#5e7309",
              values: $scope.chartData
            }
          ];

          console.dir(results);
          return results
        });

      })
      .error(function(result){
        console.log("api routers bottom pannel error")
      });


    apiFactory.getPeers()
      .success(function (result){

        var peersData = result;

        //[ Up-ColDwn, Dwn-ColDwn, Up, Dwn, total ]
        var ips = [[0,0,0,0,0], //ipv4
                   [0,0,0,0,0]]; //ipv6

        $scope.peerCount = peersData.v_peers.size;

        for(var i =0;i<peersData.v_peers.size;i++){

          var item = peersData.v_peers.data[i];

          var whichIp = 1;
          if(item.isPeerIPv4 == 1){
            whichIp = 0;
          }

          if(item.isBMPConnected == 0){
            //Count Down-collected up || down
            if(item.isUp == 1){
              //Up
              ips[whichIp][0]++;
            }else{
              //Down
              ips[whichIp][1]++;
            }
          }
          //count up and downs
          if(item.isUp == 1){
            //Up
            ips[whichIp][2]++;
          }else{
            //Down
            ips[whichIp][3]++;
          }

          //add item to correct total
          ips[whichIp][4]++;
        }


        //build data for the Peers table
        $scope.bgpPeers = []; //init

        //ipv4,ipv6,total,type
        var keys = ["Up-ColDwn", "Dwn-ColDwn", "Up", "Down", "Total"];
        var colour = ["","","#5e7309","#a65e5e","#0266a0"];
        var ipType = ["V4","V6"];
        //start at 2 ignore the coldwn for now
        for(var i = 2; i < ips[0].length; i++){
          var ipMap = {ipv4:0,ipv6:0,total:0,type:"None",colour:"#FFFFFF"};
          ipMap.ipv4 = ips[0][i];
          ipMap.ipv6 = ips[1][i];
          ipMap.total = ips[0][i] + ips[1][i];
          ipMap.type = keys[i];
          ipMap.colour = colour[i];
          $scope.bgpPeers.push(ipMap);
        }

        $scope.peerIpChartData = [
          {
            key: "ipv4 Up",
            color: "#40744f",
            y: ips[0][2]
          },
          {
            key: "ipv4 Down",
            color: "#843737",
            y: ips[0][3]
          },
          {
            key: "ipv6 Down",
            color: "#a65151",
            y: ips[1][3]
          },
          {
            key: "ipv6 Up",
            color: "#5da571",
            y: ips[1][2]
          }
        ];

        $scope.peerChartUpData = [
          {
            key: "Up",
            color: "#40744f",
            y: ips[0][2] + ips[1][2]
          },
          {
            key: "Down",
            color: "#FF0000",
            y: ips[0][3] + ips[1][3]
          }
        ];

      })
      .error(function(result){
        console.log("api routers up bottom pannel error")
      });
    };
}])

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
        id: "=name"
      }
    }
})
.directive('resize', ["$rootScope", "$window", "$timeout", function ($rootScope, $window, $timeout) {
    return function (scope, element) {
        var w = angular.element($window);
        scope.forceResize = function() {
            console.log('forcing resize');
            scope.mapHeight =  (w.height() - 50) + 'px';
            scope.panelHeight =  (w.height() - 130) + 'px';
            console.log('forced:', scope.mapHeight);
            $timeout(function(){
                scope.map.invalidateSize();
            }, 1000);
        }
        scope.getWindowDimensions = function () {
            return { 'h': w.height()};
        };
        scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
            if($rootScope.dualWindow.active){
                scope.mapHeight = '100%';
                scope.panelHeight = '80%';
                return;
            }
            if(!scope.selectionMade){
                scope.mapHeight =  (newValue.h - 50) + 'px';
                scope.panelHeight =  (newValue.h - 130) + 'px';
                console.log('natural:', scope.mapHeight);
                $timeout(function(){
                    scope.map.invalidateSize();
                }, 1000);
            }
        }, true);

        w.bind('resize', function () {
            scope.$apply();
        });
    }
}]);
