'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:DashboardController
 * @description
 * # DashboardController
 * Controller of the Dashboard page
 */
angular.module('bmpUiApp')
    .controller('WorldWatchController', function ($scope, $http) {
        $scope.map = {center: {latitude: 40.1451, longitude: -99.6680 }, zoom: 3 };
        $scope.options = {
            scrollwheel: false, 
            streetViewControl: false,
            zoomControl: false,
            panControl: false,
            mapTypeControl: false
        };


        $scope.desired = [];
        $http.get("http://odl-dev.openbmp.org:8001/db_rest/v1/routers").
            success(function(data, status, headers, config) {
                
                $scope.BMPRouters = data.routers.data;
                var num = 0;
                for(var i = 0; i < $scope.BMPRouters.length; i++)
                {
                    $scope.desired.push({'name' : $scope.BMPRouters[i].RouterName});
                    $http.get("http://ipinfo.io/" + $scope.BMPRouters[i].RouterIP + '/geo').
                        success(function(data, status, headers, config) {
                            if(data.loc != undefined){
                                $scope.desired[num].lat = data.loc.split(',')[0];
                                $scope.desired[num].lng = data.loc.split(',')[1];
                                // $scope.desired.push({'lat': data.loc.split(',')[0], 'lng': data.loc.split(',')[1]});
                            }
                            num ++;
                        }).
                        error(function(data, status, headers, config) {
                            console.log('failed', status);
                        });
                }                
            }).
            error(function(data, status, headers, config) {
                console.log('failed', status);
            });
        
        $scope.marker = {
                id: 0,
                coords: {
                    latitude: 40.1451,
                    longitude: -99.6680
                }
            }

        $scope.select = function(router){
            $scope.marker = {
                id: 0,
                coords: {
                    latitude: router.lat,
                    longitude: router.lng
                },
                options: { 
                    labelContent: router.name,
                    labelAnchor: "0 0",
                    labelClass: "marker-labels" 
                }
            }
        };
    });