'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:DashboardController
 * @description
 * # DashboardController
 * Controller of the Dashboard page
 */
angular.module('bmpUiApp')
    .controller('PeerViewController', function ($scope, $stateParams, $q, $http, $timeout, apiFactory, leafletData) {
        window.SCOPE = $scope;

        $scope.search;
        var ip = /^(?:[0-9]{1,3}\.){1,3}[0-9]{1,3}$/;
        var string = /^[a-zA-Z][a-zA-Z0-9]*$/;

        var timer;

        $scope.$watch('search', function (val) {

            if(val === undefined || val.length < 4)
                return;            

            if(timer){
                // Ignore this change
                $timeout.cancel(timer)
            }  
            timer= $timeout(function(){
                console.log('doin ma ting');
                if(ip.test(val))
                    console.log('ip address');
                else if(string.test(val))
                    console.log('string');
            }, 500)
        });

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

        $scope.peers = [];
        $scope.peerLayer;

        getChosenPeers();

        //Populate map with chosen router's peers
        function getChosenPeers(){
            console.log($stateParams);
            apiFactory.getPeersByIp($stateParams.RouterIP).
            success(function (result){
                var data = result.v_peers.data;
                var temp = [];
                angular.forEach(data, function (value, key){
                    temp.push({
                        req: apiFactory.getRouterLocation(value.PeerIP), 
                        PeerIP: value.PeerIP,
                        PeerName: value.PeerName,
                        PeerASN: value.PeerASN
                    });
                });
                $q.all(temp).then(function (requests){
                    for(var i = 0; i < requests.length; i++)
                    {
                        //var geodata = requests[i].req.data.v_geo_ip.data[0];
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
                            icon: myIcon,
                            PeerName: requests[i].PeerName,
                            PeerIP: requests[i].PeerIP,
                            PeerASN: requests[i].PeerASN
                        };

                        var marker = new L.Marker(latlng, options);

                        var popup = L.popup({type: 'peer', minWidth: 210})
                        .setLatLng(latlng)
                        .setContent('<p class="page-header"><strong>' + options.PeerName + '</strong><br><small><strong>Uptime: </strong><span class="text-success">22D 14H</span></small></p><p><small><a href="#">' + options.PeerIP + '</a></small></p><p><small><strong>AS Number:</strong> ' + options.PeerASN + '</small></p>');

                        marker.bindPopup(popup);
                        marker.addTo($scope.map);

                        $scope.peers.push(marker);
                        $scope.peerLayer = L.featureGroup($scope.peers);
                    }
                    $scope.fitMap();
                })
            }).
            error(function (error){
                console.log(error);
            })
        }

        $scope.fitMap = function() {
          $scope.map.fitBounds($scope.peerLayer.getBounds());
        };
    });