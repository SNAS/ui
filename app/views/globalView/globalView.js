'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:DashboardController
 * @description
 * # DashboardController
 * Controller of the Dashboard page
 */
angular.module('bmpUiApp')
    .controller('GlobalViewController', function ($scope, $q, $http, $timeout, apiFactory, uiGmapGoogleMapApi) {
        window.SCOPE = $scope;

        var peers;
        $scope.chosenRouter;
        $scope.loading = true;
        $scope.selected = false;

        $scope.markers = [];
        $scope.peers = [];

        $scope.map = {
            center: {
                latitude: 40.1451,
                longitude: -99.6680
            },
            show: false,
            zoom: 1,
            control: {}
        };

        var styleArray = [
        {
            "featureType": "administrative.province",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "landscape",
            "elementType": "geometry",
            "stylers": [
                {
                    "saturation": -100
                },
                {
                    "lightness": 45
                },
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [
                {
                    "saturation": -100
                },
                {
                    "lightness": 51
                },
                {
                    "visibility": "simplified"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [
                {
                    "saturation": -100
                },
                {
                    "visibility": "simplified"
                }
            ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [
                {
                    "saturation": -100
                },
                {
                    "lightness": 30
                },
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [
                {
                    "saturation": -100
                },
                {
                    "lightness": 40
                },
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "transit",
            "elementType": "geometry",
            "stylers": [
                {
                    "saturation": -100
                },
                {
                    "visibility": "simplified"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [
                {
                    "hue": "#ffff00"
                },
                {
                    "lightness": 25
                },
                {
                    "saturation": -97
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "lightness": -25
                },
                {
                    "saturation": -100
                }
            ]
        }
        ];

        //Map control options
        $scope.options = {
            scrollwheel: false,
            streetViewControl: false,
            panControl: false,
            mapTypeControl: false,
            styles: styleArray
        };

        $scope.markers.events = {
            click: function(marker, event, model, args){
                showRouter(marker);
                clearPeersCard();
                changeRouterCard(model);
            }
        };

        $scope.peers.events = {
            click: function(marker, event, model, args) {
              changePeerCard(model);
            }
        };

        function showRouter(marker) {
          $scope.selected = true;

          for (var i = 0; i < $scope.markers.length; i++)
            if ($scope.markers[i].id === marker.key) {
              $scope.chosenRouter = $scope.markers[i];
              $scope.index = i;
            }else {
              $scope.markers[i].options.visible = false;
            }

            getChosenPeers();
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

        $scope.$watch($scope.map.control, function() {
            $scope.mapObject = $scope.map.control.getGMap();
            $scope.$on('menu-toggle', function(thing, args) {
                $timeout( function(){ google.maps.event.trigger($scope.mapObject, "resize"); }, 500);
            });
       });

        var setBounds = function (array){
            var bounds = new google.maps.LatLngBounds();
            for (var i=0; i<array.length; i++) {
              var latlng = new google.maps.LatLng(array[i].latitude, array[i].longitude);
              bounds.extend(latlng);
            }
            if($scope.chosenRouter != undefined)
                bounds.extend(new google.maps.LatLng($scope.chosenRouter.latitude, $scope.chosenRouter.longitude))
            //$scope.mapObject.setCenter(bounds.getCenter());
            $scope.mapObject.fitBounds(bounds);
            if($scope.mapObject.getZoom()> 15){
              $scope.mapObject.setZoom(15);
            }
        };

        getRouters();

        function getRouters() {
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
                        var geodata = requests[i].data.v_geo_ip.data[0];
                        $scope.markers.push({
                            id: namesWithIP[i].name,
                            latitude: geodata.latitude,
                            longitude: geodata.longitude,
                            show: false,
                            icon: '../images/marker.png',
                            ip: namesWithIP[i].ip,
                            data: data[i],
                            clear: function(){
                                $scope.peers = [];
                                $scope.chosenRouter = undefined;
                                setBounds($scope.markers);
                            },
                            options:{
                                visible: true
                            }
                        });
                    }
                    $scope.loading = false;
                    setBounds($scope.markers);
                })
            }).
            error(function (error){
                console.log(error.message);
            })
        }

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
