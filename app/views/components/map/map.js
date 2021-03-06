'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:DashboardController
 * @description
 * # DashboardController
 * Controller of the Dashboard page
 */
angular.module('bmp.components.map', ['ui.bootstrap'])
  .controller('MapController', ["$scope", "$rootScope", "$timeout", "apiFactory", "leafletData", "$compile", "$window", "$route", "$q", "toolsFactory",
    function ($scope, $rootScope, $timeout, apiFactory, leafletData, $compile, $window, $route, $q, toolsFactory) {

    window.SCOPEMAP = $scope;

    $scope.chosenIndex = -1;
    //$scope.loading = true;
    $scope.selected = false;
    $scope.error;
    $scope.info;

    $scope.showBottomPane = false;
    $scope.selectionMade = false;
    $scope.mapWidth = "72%";

    $scope.locations = [];
    $scope.peers = [];
    $scope.routerDict = {};
    $scope.peerDictionary = {};

    $scope.halfHeight = $('.half-height').height() - 50;

    /****************************************
     Set and store map credentials
     *****************************************/
    var accessToken = 'pk.eyJ1IjoicGlja2xlZGJhZGdlciIsImEiOiJaTG1RUmxJIn0.HV-5_hj6_ggR32VZad4Xpg';
    var mapID = 'pickledbadger.mbkpbek5';
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
    leafletData.getMap($scope.id).then(function (map) {
      console.log(map)
      $scope.map = map;
      //L.control.zoomslider().addTo(map);
      map.scrollWheelZoom.disable();
      $scope.init();
      L.control.zoomslider().addTo(map);
    });

    /****************************************
     Listen for menu toggle
     *****************************************/
    $scope.$on('menu-toggle', function () {
      $timeout(function () {
        $scope.map.invalidateSize();
      }, 500);
    });

    var plotMarker =
      $scope.$watch('plotMarker', function (val) {
        if (val != undefined) {
          $scope.init();
          plotMarker();
        }
      });

    $scope.$watch('selectionMade', function (val) {
      if ($rootScope.dualWindow.active) {
        $scope.mapHeight = 350;
        if (val === true) {
          $scope.panelHeight = 'calc(100% - 100px)'
        }
        else {
          $scope.panelHeight = 'calc(100% - 58px)'
        }
        $timeout(function () {
          $scope.map.invalidateSize();
        }, 1000);
        return;
      }
      if (val === true) {
        $scope.mapHeight = 400 - 50;
        $scope.panelHeight = 'calc(100% - 100px)'
      }
      else {
        return;
      }
      $timeout(function () {
        $scope.map.invalidateSize();
      }, 1000);
    });

    /****************************************
     Initialise map based on location
     *****************************************/
    $scope.dualWindow = false;
    $scope.init = function () {
      if ($rootScope.dualWindow.active) {
        $scope.dualWindow = true;
      }

      if ($scope.location === 'peerView') {
        $scope.panelTitle = "Peer List";
        $scope.selectedRouter = true;
        $scope.map.invalidateSize();
        $scope.getPeers();
        loadBottomPane();

        $scope.modalContent = "";

        // Set API call modal dialog for peer list.
        var linkPeerList = 'peer';
        var textPeerList = "Peers - All";
        $scope.modalContent += apiFactory.createApiCallHtml(linkPeerList, textPeerList);

        var linkPeerTypeCount = 'peer/type/count';
        var textPeerTypeCount = "Peers - Type Count";
        $scope.modalContent += apiFactory.createApiCallHtml(linkPeerTypeCount, textPeerTypeCount);

        var linkIPv4Peers = 'peer/type/v4';
        var textIPv4Peers = "Peers - IPv4";
        $scope.modalContent += apiFactory.createApiCallHtml(linkIPv4Peers, textIPv4Peers);

        var linkIPv6Peers = 'peer/type/v6';
        var textIPv6Peers = "Peers - IPv6";
        $scope.modalContent += apiFactory.createApiCallHtml(linkIPv6Peers, textIPv6Peers);

        var linkPeerCountsByStatus = 'peer/status/count';
        var textPeerCountsByStatus = "Peers - Counts by Status";
        $scope.modalContent += apiFactory.createApiCallHtml(linkPeerCountsByStatus, textPeerCountsByStatus);

        var linkPeerListUp = 'peer/status/up';
        var textPeerListUp = "Peers - Up";
        $scope.modalContent += apiFactory.createApiCallHtml(linkPeerListUp, textPeerListUp);

        var linkPeerListDown = 'peer/status/down';
        var textPeerListDown = "Peers - Down";
        $scope.modalContent += apiFactory.createApiCallHtml(linkPeerListDown, textPeerListDown);

        var linkPeerPolicyCounts = 'peer/prefix';
        var textPeerPolicyCounts = "Peers - Pre-Policy and Post-Policy RIB Counts";
        $scope.modalContent += apiFactory.createApiCallHtml(linkPeerPolicyCounts, textPeerPolicyCounts);

      }
      else if ($scope.location === 'globalView') {
        $scope.panelTitle = "Router List";
        $scope.showBottomPane = true;
        $scope.map.invalidateSize();
        $scope.getRouters();
        loadBottomPane();

        $scope.modalContent = "";

        // Set API call modal dialog for router list.
        var linkRouterList = 'routers';
        var textRouterList = "Routers - All";
        $scope.modalContent += apiFactory.createApiCallHtml(linkRouterList, textRouterList);

        var linkRouterListGeo = 'routers?withgeo';
        var textRouterListGeo = "Routers - All Geo";
        $scope.modalContent += apiFactory.createApiCallHtml(linkRouterListGeo, textRouterListGeo);

        var linkRouterListAllCount = 'routers/status/count';
        var textRouterListAllCount = "Routers - All Count";
        $scope.modalContent += apiFactory.createApiCallHtml(linkRouterListAllCount, textRouterListAllCount);

        var linkRouterListUpCount = 'routers/status/up';
        var textRouterListUpCount = "Routers - Up";
        $scope.modalContent += apiFactory.createApiCallHtml(linkRouterListUpCount, textRouterListUpCount);

        var linkRouterListDownCount = 'routers/status/down';
        var textRouterListDownCount = "Routers - Down";
        $scope.modalContent += apiFactory.createApiCallHtml(linkRouterListDownCount, textRouterListDownCount);

        var linkPeerCountType = 'peer/type/count/router';
        var textPeerCountType = "Routers - Count of Peers by IP Type";
        $scope.modalContent += apiFactory.createApiCallHtml(linkPeerCountType, textPeerCountType);

        leafletData.getMap($scope.id).then(function (map) {
          //console.log(map.getContent())
        });
      }
      else if ($scope.location === 'peerCard') {
        $scope.mapWidth = "100%";
        $scope.selectionMade = true;
        if ($scope.plotMarker != undefined) {
          if ($scope.singlePoint != undefined) {
            $scope.map.removeLayer($scope.singlePoint);
          }
          $scope.map.invalidateSize();
          $scope.loading = false;
          var latlng = [$scope.plotMarker.latitude, $scope.plotMarker.longitude];
          var options = {
            icon: L.mapbox.marker.icon({
              'marker-color': '#758CAB',
              'marker-size': 'medium'
            })
          }
          $scope.singlePoint = new L.Marker(latlng, options);
          $scope.map.addLayer($scope.singlePoint);
          $scope.fitMap('single');
        }
      }

      //Reset map view to avoid 'blank map' error
      $timeout(function () {

        $scope.map._resetView($scope.map.getCenter(), $scope.map.getZoom(), true);
      }, 100);
    }


    /*******************************
     Populate map with routers
     *******************************/
      //Array of current marker points
    $scope.allLocations = [];
    $scope.getRouters = function () {
      $scope.loading = true;
      $scope.routerLayer = new L.FeatureGroup({
        selected: false
      });

      var data;
      apiFactory.getRoutersAndLocations().
      success(function (result) {

        try {
          data = result.routers.data;
        } catch (e) {
          console.log(e);
          $scope.error = typeof e !== undefined ? e : 'Generic Server Error';
          $scope.loading = false;
          return false;
        }

        if (data.length < 1) {
          $scope.error = "Error: no results from server";
          $scope.loading = false;
          return false;
        }

        for (var i = 0; i < data.length; i++) {
          toolsFactory.addDefaultInfo(data[i]);

          var latlng = [data[i].latitude, data[i].longitude];

          //current router data
          var currData = {
            RouterName: data[i].RouterName,
            RouterIP: data[i].RouterIP,
            LastModified: data[i].LastModified,
            isConnected: data[i].isConnected,
            type: 'Router',
            RouterHashId: data[i].RouterHashId
          };

          //alert(data[i].RouterHashId)

          //concat of latlng for value (not an array)
          var pos = $scope.allLocations.indexOf(data[i].latitude + data[i].longitude);

          //we already have a marker at this location
          if (pos >= 0) {
            var curr = $scope.locations[pos];
            curr.options.routers.push(currData);
            setIcon(curr, 'default');
            //update popup content
            curr = setPopupContent(curr);
            $scope.locations[pos] = curr;
          }
          //we do not have a marker at this location
          else {
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
              type: 'Router'
            };

                    var marker = new L.Marker(latlng, options);
                    setIcon(marker, 'default');
                    marker = setPopup(marker);
                    $scope.routerLayer.addLayer(marker);
                    $scope.locations.push(marker);
                }
            }

        $scope.map.addLayer($scope.routerLayer);
        $scope.loading = false;
        $scope.$broadcast('routers-loaded');
        $scope.fitMap('routers');
        $scope.map.invalidateSize();
      }).
      error(function (error) {
        $scope.error = "Error: API error";
        $scope.loading = false;
        return false;
      });
    };


    function distance(obj) {
      var R = 6371; // km
      var dLat = (obj.lat2 - obj.lat1) * Math.PI / 180;
      var dLon = (obj.lon2 - obj.lon1) * Math.PI / 180;
      var lat1 = obj.lat1 * Math.PI / 180;
      var lat2 = obj.lat2 * Math.PI / 180;

      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
    $scope.selectedPeerLocations = [];
    $scope.getPeers = function (ip) {
      $scope.loading = true;
      if (ip === undefined)
        ip = '';
      if ($scope.routerLayer)
        $scope.map.removeLayer($scope.routerLayer);
      $scope.peerLayer = new L.FeatureGroup();
      var peerCount = 0;

      var data;
      apiFactory.getPeersAndLocationsByIp(ip).
      success(function (result) {
        var data = result.v_peers.data;
        for (var i = 0, len = data.length; i < len; i++) {
          var curr = data[i];

          if (curr.latitude == null && curr.longitude == null) {
            curr.latitude = 37.3639;
            curr.longitude = -121.929;
          }

          if (curr.country == null) {
            curr.country = 'US';
          }

          if (curr.city == null) {
            curr.city = 'San Jose';
          }

          if (curr.stateprov == null) {
            curr.stateprov = "CA";
          }

          var latlng = [curr.latitude, curr.longitude];
          var temp = curr.latitude + ',' + curr.longitude;

          var dist = {km: 99999, m: 999999};
          for (var key in $scope.peerDictionary) {
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

          if (dist.km < 100)
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
        for (var key in $scope.peerDictionary) {
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

    function setPopup(marker) {
      //marker mouse events
      if (marker.options.type === 'Router')
        marker.on('click', function (e) {
          $scope.selectMapLocation(e.target);
        });
      else
        marker.on('click', function (e) {
          $scope.selectMapPeerLocation(e.target);
        });
      marker.on('mouseover', function (e) {
        target = e.target;
        $timeout.cancel(closeTimer);
        if (openTimer) {
          $timeout.cancel(openTimer)
        }
        openTimer = $timeout(function () {
          target.openPopup();
        }, 500)
      });
      marker.on('mouseout', function (e) {
        target = e.target;
        $timeout.cancel(openTimer);
        if (closeTimer) {
          $timeout.cancel(closeTimer)
        }
        closeTimer = $timeout(function () {
          target.closePopup();
        }, 1000);
      });

      marker = setPopupContent(marker);
      return marker;
    }


    /************************************
     Set marker's popup content
     *************************************/
    function setPopupContent(marker) {
      //contents of popup window
      if (marker.options.type === "Router")
        var content = '<span><p><strong>Location:</strong><br>' + marker.options.city +
          ', ' + marker.options.stateprov +
          ', ' + marker.options.country + '</p>' +
          '</span>';
      else {
        var content = '<span><p><strong>Location:</strong><br>' + marker.options.city +
          ', ' + marker.options.stateprov +
          ', ' + marker.options.country + '</p>' +
          '</span>';
      }
      //compile the html into angular-ready HTML
      var linkFunction = $compile(angular.element(content));
      marker.bindPopup(linkFunction($scope)[0], {offset: new L.Point(0, -10)});

      return marker;
    }


    /************************************
     Set marker's icon
     *************************************/
    function setIcon(marker, state) {
      if (marker.options.type === 'Peer')
        if (state === 'default')
          marker.setIcon(new L.divIcon({
            html: '<div><span>' + marker.options.peers.length + '</span><img src="images/new-peer-default.png" width="40px"/></div>',
            className: 'marker',
            iconSize: [40, 40]
          }));
        else
          marker.setIcon(new L.divIcon({
            html: '<div><span>' + marker.options.peers.length + '</span><img src="images/new-peer-active.png" width="40px"/></div>',
            className: 'marker',
            iconSize: [40, 40]
          }));
      else if (marker.options.type === 'Router')
        if (state === 'default')
          marker.setIcon(new L.divIcon({
            html: '<div><span>' + marker.options.routers.length + '</span><img src="images/new-router-default.png" width="40px"/></div>',
            className: 'marker',
            iconSize: [40, 40]
          }));
        else
          marker.setIcon(new L.divIcon({
            html: '<div><span>' + marker.options.routers.length + '</span><img src="images/new-router-active.png" width="40px"/></div>',
            className: 'marker',
            iconSize: [40, 40]
          }));
      //Reset popup content for offset calculation
      marker = setPopupContent(marker);
    }


    /************************************
     Briefly set info content on map
     *************************************/
    function setInfo(message) {
      $scope.info = message;
      $scope.activeInfo = true;
      $timeout(function () {
        $scope.activeInfo = false;
      }, 2000);
    }


    /*******************************
     Pan map to location
     *******************************/
    $scope.goto = function (location) {
      $scope.map.setView(location.getLatLng());
      if (location.options.type === 'Router') {
        location.expandRouters = true;
        if ($scope.selectedLocation != undefined) {
          $scope.selectedLocation.closePopup();
          $scope.selectedLocation.options.zIndexOffset = 0;
          setIcon($scope.selectedLocation, 'default');
        }
        $scope.selectedLocation = location;
        $scope.selectedLocation.options.zIndexOffset = 1000;
        setIcon($scope.selectedLocation, 'active');
        $scope.selectedLocation.openPopup();
      }
      else {
        location.options.expandPeers = true;
        if ($scope.selectedLocation != undefined) {
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
    $scope.fitMap = function (type) {
      //keep the chosen router in view with peers
      if (type === 'both') {
        //create temp layer to add peers and router to
        var temp = $scope.peerLayer;
        temp.addLayer($scope.chosenRouter);
        $scope.map.fitBounds(temp.getBounds());
        temp.removeLayer($scope.chosenRouter);
        //clear temp
        temp = undefined;
      }
      //only keep peers in view
      else if (type === 'peers') {
        $scope.map.fitBounds($scope.peerLayer.getBounds());
      }
      //only keep routers in view
      else if (type === 'routers') {
        $scope.map.fitBounds($scope.routerLayer.getBounds());
      }
      else if (type === 'single') {
        var temp = L.featureGroup();
        temp.addLayer($scope.singlePoint);
        $scope.map.fitBounds(temp.getBounds(), {maxZoom: 10});
      }
    };


    /****************************************
     Called when a location is selected
     *****************************************/
    $scope.selectMapLocation = function (location) {
      $scope.selectedRouter = undefined;

      for (var i = 0; i < $scope.locations.length; i++) {
        $scope.locations[i].expandRouters = false;
      }
      location.expandRouters = true;

      if ($scope.selectedLocation != undefined)
        setIcon($scope.selectedLocation, 'default');

      $scope.selectedLocation = location;
      setIcon($scope.selectedLocation, 'active');
    }


    /****************************************
     Called when a peer is selected
     *****************************************/
    $scope.selectMapPeerLocation = function (location) {
      if ($scope.selectedLocation != undefined) {
        setIcon($scope.selectedLocation, 'default');
      }
      $scope.selectedLocation = location;
      setIcon($scope.selectedLocation, 'active');


      for (var key in $scope.peerDictionary) {
        $scope.peerDictionary[key].options.expandPeers = false;
      }
      angular.element('.main').scrollTop(0);
      location.options.expandPeers = true;
      // $scope.panelSearch = location.options.city;

    };


    /****************************************
     Selected a panel router
     *****************************************/
    $scope.selectPanelRouter = function (location, router) {
      $scope.panelTitle = 'Peer List';
      $scope.showBottomPane = false;
      var cardData = router;
      cardData.country = location.options.country;
      cardData.stateprov = location.options.stateprov;
      cardData.city = location.options.stateprov;
      cardData.type = 'Router';

      $scope.selectionMade = true;
      $scope.map.invalidateSize();

      $scope.cardApi.changeCard(router);
      $scope.panelSearch = '';
      $scope.selectedRouter = router;
      if ($scope.selectedLocation != undefined) {
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
    $scope.deselectPanelRouter = function () {
      $scope.panelTitle = 'Router List';
      $scope.showBottomPane = true;
      $scope.panelSearch = '';
      $scope.selectionMade = false;
      //force map resize
      $scope.forceResize();
      if ($scope.selectedRouter != undefined) {
        $scope.cardApi.removeCard($scope.selectedRouter);
        $scope.selectedRouter = false;
        $scope.selectedRouter = undefined;
      }
      if ($scope.selectedLocation != undefined) {
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
    $scope.selectPanelPeer = function (location, peer) {
      var temp = new L.featureGroup();
      temp.addLayer(location);
      $scope.map.fitBounds(temp.getBounds());
      if ($scope.selectedLocation != undefined) {
        $scope.selectedLocation.closePopup();
      }

      if (!$scope.selectionMade) {
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
    $scope.selectPanelLocation = function (location) {
      location.expandRouters = !location.expandRouters;
      $scope.$broadcast('location-click');
      if ($scope.selectedLocation != undefined)
        setIcon($scope.selectedLocation, 'default');
      $scope.selectedLocation = undefined;
    }


    /****************************************
     Peer location show/hide select
     *****************************************/
    $scope.selectPanelPeerLocation = function (location) {
      location.options.expandPeers = !location.options.expandPeers;
      $scope.$broadcast('peer-location-click');
      if ($scope.selectedLocation != undefined) {
        $scope.selectedLocation.closePopup();
        setIcon($scope.selectedLocation, 'default');
      }
      $scope.selectedLocation = undefined;
    }


    /****************************************
     Expand show/hide for searches
     *****************************************/
    $scope.expandPanelLocations = function () {
      if ($scope.selectedRouter != undefined) {
        for (var i = 0; i < $scope.selectedPeerLocations.length; i++) {
          $scope.selectedPeerLocations[i].options.expandPeers = true;
        }
        for (var key in $scope.peerDictionary) {
          $scope.peerDictionary[key].options.expandPeers = true;
        }
      }
      else
        for (var i = 0; i < $scope.locations.length; i++) {
          $scope.locations[i].expandRouters = true;
        }
    };

    /****************************************
     Bottom Pane - setup
     *****************************************/

      //ATM this increase loading time could be made to load
      //this after page loads so when loading = false;

    $scope.bottomPaneState = true; //is closed

    var loadBottomPane = function () {
      $scope.peerIpChartOptions = {
        chart: {
          type: "pieChart",
          height: 130,
          width: 130,
          margin: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          },
          donut: true,
          donutRatio: 0.74,
          showLabels: false,
          showLegend: false,
          pie: {
            startAngle: function (d) {
              return d.startAngle
            },
            endAngle: function (d) {
              return d.endAngle
            }
          },
          valueFormat: function (d) {
            return d3.format('')(d);
          },
          color: function (d, i) {
            return d.color;
//            return d.data.color
          },
          tooltipContent: function (key, y, e, graph) {
            return '<h4>' + y + ' <span class="count">' + e.point.key + '</span></h4>';
          },
          transitionDuration: 500
        }
      };

      $scope.routerChartOptions = {
        chart: {
          type: "pieChart",
          height: 130,
          width: 130,
          margin: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          },
          donut: true,
          donutRatio: 0.74,
          showLabels: false,
          showLegend: false,
          pie: {
            startAngle: function (d) {
              return d.startAngle
            },
            endAngle: function (d) {
              return d.endAngle
            }
          },
          valueFormat: function (d) {
            return d3.format('')(d);
          },
          color: function (d, i) {
            return d.color;
//            return d.data.color
          },
          tooltipContent: function (key, y, e, graph) {
            return '<h4>' + y + ' <span class="count">' + e.point.key + '</span></h4>';
          },
          transitionDuration: 500
        }
      };

      $scope.showChartsConfig = {
        //visible: false // default: true
      };

      $scope.$watch('bottomPaneState', function () {
        if ($scope.bottomPaneState == false) {
          //resize
          $scope.showChartsConfig.visible = true;
        }
      });

      $scope.chartData = [];

      $scope.routerTotals = [0, 0, 0]; //up,down,total

      var loadPeersFromRouters = function (router) {
        var deferred = $q.defer();
        var urlCalls = [];
        angular.forEach(router, function (value, key) {
          if (value.isConnected) {
            $scope.routerTotals[0]++;
          } else {
            $scope.routerTotals[1]++;
          }
          $scope.routerTotals[2]++;
          //console.log("Value: "+JSON.stringify(value));
          urlCalls.push(apiFactory.getPeersByHashId(value.RouterHashId));
        });
        $rootScope.routersTotals = $scope.routerTotals;

        $scope.routerChartData = [
          {
            key: "Up",
            color: "#7bad85",
            y: $scope.routerTotals[0]
          },
          {
            key: "Down",
            color: "#ad7b7b",
            y: $scope.routerTotals[1]
          }
        ];

        $q.all(urlCalls)
          .then(
            function (results) {
              deferred.resolve(
                results
              )
            });
        return deferred.promise;

      };

      apiFactory.getRouters()
        .success(function (result) {
          var routers = result.routers.data;

          var upRouterNames = [];
          var downRouterNames = [];

          for(var i = 0; i < routers.length; i++) {
            if (routers[i].isConnected == 1) {
              routers[i].Status = 1;
              upRouterNames.push(routers[i].RouterName !== '' ? routers[i].RouterName : routers[i].RouterIP);
            } else {
              routers[i].Status = 0;
              downRouterNames.push(routers[i].RouterName !== '' ? routers[i].RouterName : routers[i].RouterIP);
            }
            routers[i].$$treeLevel = 0;
            $scope.routerDict[routers[i].RouterHashId] = [routers[i]];
          }

          $scope.routerCount = result.routers.data.length;
          $rootScope.routerCount = $scope.routerCount;
          //Loop through routers selecting and altering relevant data.

          loadPeersFromRouters(routers).then(function (results) {
            for (var i = 0; i < results.length; i++) {
              $scope.chartData.push({
                label: routers[i].RouterIP,
                value: results[i].data.v_peers.size
              });
            }
            $scope.chartData.sort(function (a, b) {
              return b.value - a.value
            });
            $scope.chartData = $scope.chartData.slice(0, 3);

            return results
          });

          var routerContents = '<ul class="list-group">';
          angular.forEach(downRouterNames, function (name) {
            routerContents += '<li class="list-group-item"><span class="circle-down"></span>' + name + '</li>'
          });
          angular.forEach(upRouterNames, function (name) {
            routerContents += '<li class="list-group-item"><span class="circle-up"></span>' + name + '</li>'
          });
          routerContents += '</ul>';

          $('#routers').webuiPopover({title: 'Routers', content: routerContents});

        })
        .error(function (result) {
          console.log("api routers bottom pannel error")
        });


      apiFactory.getPeers()
        .success(function (result) {

          var peersData = result;

          //[ Up-ColDwn, Dwn-ColDwn, Up, Dwn, total ]
          var ips = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];

          var upPeerNames = [];
          var downPeerNames = [];

          $scope.peerCount = peersData.v_peers.size;
          $rootScope.peerCount = $scope.peerCount;
          var j = 0;
          $rootScope.rp = {};
          for (var i = 0; i < peersData.v_peers.size; i++) {

            var item = peersData.v_peers.data[i];
            //console.log(JSON.stringify(item));

            var whichIp = 1;
            if (item.isPeerIPv4 == 1) {
              whichIp = 0;
            }

            //if (item.isBMPConnected == 0) {
            //  //Count Down-collected up || down
            //  if (item.isUp == 1) {
            //    //Up
            //    ips[whichIp][0]++;
            //  } else {
            //    //Down
            //    ips[whichIp][1]++;
            //  }
            //}
            //count up and downs
            if (item.isUp == 1 && item.isBMPConnected == 1) {
              //Up  if and only if router is connected and peer is up
              ips[whichIp][2]++;
              item.Status = 1;
              upPeerNames.push(item.PeerName !== '' ? item.PeerName : item.PeerIP);
            } else {
              //Down
              item.Status = 0;
              ips[whichIp][3]++;
              downPeerNames.push(item.PeerName !== '' ? item.PeerName : item.PeerIP);
            }

            //add item to correct total
            ips[whichIp][4]++;
            if ($rootScope.rp.hasOwnProperty(item.RouterIP)) {
              $rootScope.rp[item.router_hash_id].push(i);
            } else {
              $rootScope.rp[item.router_hash_id] = [i];
            }
            //console.log(item.peer_hash_id);
            if ($scope.routerDict[item.router_hash_id])
              $scope.routerDict[item.router_hash_id].push(item);
          }
          $scope.peerIpChartData = [
            {
              key: "Up",
              color: "#7bad85",
              y: ips[0][2] + ips[1][2]
            },
            {
              key: "Down",
              color: "#ad7b7b",
              y: ips[0][3] + ips[1][3]
            }
          ];
          $scope.ips = ips;
          $rootScope.ips = ips;
          if ($rootScope.hasOwnProperty('routerTableOptions')) {
            for (var router in $scope.routerDict) {
              $rootScope.routerTableOptions.data = $rootScope.routerTableOptions.data.concat($scope.routerDict[router]);
            }
          }

          var peerContents = '<ul class="list-group">';
          angular.forEach(downPeerNames, function (name) {
            peerContents += '<li class="list-group-item"><span class="circle-down"></span>' + name + '</li>'
          });
          angular.forEach(upPeerNames, function (name) {
            peerContents += '<li class="list-group-item"><span class="circle-up"></span>' + name + '</li>'
          });
          peerContents += '</ul>';

          $('#peers').webuiPopover({title: 'Peers', content: peerContents});

        })
        .error(function (result) {
          console.log("api routers up bottom panel error")
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
      scope.forceResize = function () {
        scope.mapHeight = (w.height() - 87);
        scope.panelHeight = scope.mapHeight - 55;
        $timeout(function () {
          scope.map.invalidateSize();
        }, 1000);
      };
      scope.getWindowDimensions = function () {
        return {'h': w.height() - 50};  // for tab height
      };
      scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
        if ($rootScope.dualWindow.active) {
          scope.mapHeight = '100%';
          return;
        }
        if (!scope.selectionMade) {
          scope.mapHeight = (newValue.h - 87);
          scope.panelHeight = scope.mapHeight - 55;
          $timeout(function () {
            scope.map.invalidateSize();
          }, 1000);
        }
      }, true);

      w.bind('resize', function () {
        scope.$apply();
      });
    }
  }]);
