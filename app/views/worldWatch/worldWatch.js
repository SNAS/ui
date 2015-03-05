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
        //Map control options
        $scope.options = {
            scrollwheel: false, 
            streetViewControl: false,
            zoomControl: false,
            panControl: false,
            mapTypeControl: false
        };

        /* Examplar http get code
        $http.get("http://odl-dev.openbmp.org:8001/db_rest/v1/routers").
            success(function(data, status, headers, config) {                
                $scope.BMPRouters = data.routers.data;
            }.
            error(function(data, status, headers, config) {
                console.log('failed', status);
            });
        */

        //List of router locations
        $scope.desired = [];

        $http.get("http://odl-dev.openbmp.org:8001/db_rest/v1/routers").
            success(function(data, status, headers, config) {
                //All routers retrieved from API call
                $scope.BMPRouters = data.routers.data;
                //Keeping count initialisation outside of for
                var num = 0;
                for(var i = 0; i < $scope.BMPRouters.length; i++)
                {
                    //Add router name
                    $scope.desired.push({'name' : $scope.BMPRouters[i].RouterName});
                    //Third party IP geocoding service
                    $http.get("http://ipinfo.io/" + $scope.BMPRouters[i].RouterIP + '/geo').
                        success(function(data, status, headers, config) {
                            if(data.loc != undefined){
                                //Add latitude and longitude
                                $scope.desired[num].lat = data.loc.split(',')[0];
                                $scope.desired[num].lng = data.loc.split(',')[1];
                            }
                            //num index is temp solution to async issues
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
        
        //Marker initialisation
        $scope.marker = {
                id: 0,
                coords: {
                    latitude: 40.1451,
                    longitude: -99.6680
                }
            }

        //If the user selects a link, move the marker to that location
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

// $scope.BMPRouters = [];
        // var prom = [];
        // $scope.getRouterNames(function (data) {
        //     angular.forEach(data, function (item) {
        //         $scope.BMPRouters.push({
        //             'name': item.RouterName,
        //             'ip': item.RouterIP
        //         });
        //     })            

        //     $scope.BMPRouters.forEach(function() {
        //         prom.push($scope.getRouterLocation()
        //     });

        //     $scope.getRouterLocations($scope.BMPRouters)
        // });

        // $scope.BMProuters.forEach(function (obj, i) {
        //     prom.push($scope.getAlbum(user, obj.id, function(value){
        //         $scope.albums.push(value);
        //     }));
        // });
        // $q.all(prom).then(function () {
        //     callback();
        // });

        // // $scope.locations.push({
        // //                     'lat': data.loc.split(',')[0],
        // //                     'lng': data.loc.split(',')[1]
        // //                 });

        // $scope.getRouterNames = function(callback) {
        //     return $http.get("http://odl-dev.openbmp.org:8001/db_rest/v1/routers").
        //     success(function(data) {
        //         //All routers retrieved from API call
        //         return callback(data.routers.data);
        //     });
        // }

        // $scope.getRouterLocation = function(router, callback) {
        //     $http.get("http://ipinfo.io/" + router + '/geo').
        //     success(function(data, status, headers, config) {
        //         if(data.loc != undefined){
        //             return callback(data.loc);                    
        //         }
        //     }).
        //     error(function(data, status, headers, config) {
        //         console.log('failed', status);
        //     });
        // }

        

        //         for(var i = 0; i < $scope.BMPRouters.length; i++)
        //         {
        //             //Third party IP geocoding service
                    
        //         }                
        //     }).
        //     error(function(data, status, headers, config) {
        //         console.log('failed', status);
        //     });