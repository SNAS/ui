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
        $scope.loading = false;
        $scope.suggest = true;

        $scope.$watch('search', function (val) {

            if(!$scope.suggest){
                $scope.suggest = !$scope.suggest;
                return;
            }

            if(val === undefined || val.length < 4){
                $scope.suggestions = [];
                return;
            }

            if(timer){
                // Ignore this change
                $timeout.cancel(timer)
            }
            timer= $timeout(function(){
                $scope.loading = true;

                if(ip.test(val)){
                    getSuggestedPeers(val);
                }
                else if(string.test(val)){
                    console.log(val);
                    getSuggestedName(val);
                }
                else{
                    $scope.loading = false;
                }
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

        $scope.suggestions = [];

        function getSuggestedPeers(ip){
            $scope.suggestions = [];
            $scope.suggest = false;

            apiFactory.getRoutersByIp(ip).
            success(function (result){
                console.log(result.v_peers.data);
                if(result.v_peers.data.length === 0){
                    $scope.loading = false;
                    return;
                }
                angular.forEach(result.v_peers.data, function (value, key){
                    $scope.suggestions.push({type: 'ip', content: value.RouterIP});
                });
                $scope.loading = false;
            }).
            error(function (error){
                console.log(error);
            })
        }

        function getSuggestedName(name){
            apiFactory.getWhoIsName(name, 3).
            success(function (result){
                console.log(result.w.data);

                angular.forEach(result.w.data, function (value, key){
                    $scope.suggestions.push({type: 'name', content: value.org_name + ' - ' + key});
                });
                $scope.loading = false;
            }).
            error(function (error){
                console.log(error);
            })
        }

        $scope.getData = function(type, content){
            if(type === 'ip')
                getChosenPeers(content);
        }

        $scope.peers = [];
        $scope.peerLayer;
        $scope.chosen;

        getChosenPeers($stateParams.RouterIP);

        //Populate map with chosen router's peers
        function getChosenPeers(ip){
            if($scope.chosen === ip){
                $scope.search = ip;
                $scope.suggestions = [];
                return;
            }
            else{
                $scope.search = ip;
                $scope.chosen = ip;
                clearPeers();
            }

            if(ip === "")
                return;

            $scope.suggestions = [];
            apiFactory.getPeersByIp(ip).
            success(function (result){
                console.log(result.v_peers.data);
                if(result.v_peers.data.length === 0){
                    $scope.loading = false;
                    return;
                }
                var data = [];
                var temp = [];
                angular.forEach(result.v_peers.data, function (value, key){
                    console.log('it');
                    temp.push(apiFactory.getRouterLocation(value.PeerIP));
                    data.push({
                        PeerIP: value.PeerIP,
                        PeerName: value.PeerName,
                        PeerASN: value.PeerASN,
                        LastDownTimestamp: value.LastDownTimestamp
                    });
                });
                $q.all(temp).then(function (requests){
                    for(var i = 0; i < requests.length; i++)
                    {
                        var result = requests[i].data.v_geo_ip.data[0];
                        console.log(result);

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
                            City: result.city
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
                        $scope.loading = false;
                        $scope.peers.push(marker);

                        $scope.peerLayer = new L.FeatureGroup($scope.peers);
                        $scope.fitMap();
                    }
                })
            }).
            error(function (error){
                console.log(error);
            })
        }

        function clearPeers(){
            for(var i = 0; i < $scope.peers.length; i++){
                $scope.map.removeLayer($scope.peers[i]);
            }
            $scope.peers = [];
        }

        $scope.fitMap = function() {
          $scope.map.fitBounds($scope.peerLayer.getBounds());
        };

        //|---------------------------- Peer Card -----------------------------|\\
        $scope.cards = [];

        //peer card DELETE \w CLICK
        $scope.removePeerCard = function (card) {
          var index = $scope.cards.indexOf(card);
          $scope.cards.splice(index, 1);
        };

        var changePeerCard = function(value) {
          if ($scope.cards.indexOf(value) == -1) {
            $scope.cards.push(value);
            if ($scope.cards.length > 10) {
              $scope.cards.shift();
            }
          }
        };

        //Not need here yet!!
        var clearPeersCard = function() {
          $scope.cards = [];
        };

        //|---------------------------- End Peer Card -----------------------------|\\


    });
