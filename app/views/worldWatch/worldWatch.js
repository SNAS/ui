'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:DashboardController
 * @description
 * # DashboardController
 * Controller of the Dashboard page
 */
angular.module('bmpUiApp')
    .controller('WorldWatchController', function ($scope, $http, apiFactory) {
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
        getRouters();

        function getRouters() {
            apiFactory.getRouters().
            success(function (result){
                $scope.BMPRouters = result.routers.data;
                getRouterLocations();
            }).
            error(function (error){
                console.log(error.message);
            })
        }

        $scope.markers = [];
        function getRouterLocations() {
            angular.forEach($scope.BMPRouters, function (value, key){
                apiFactory.getRouterLocation(value.RouterIP).
                success(function (data){
                    if(data.loc != undefined){
                        $scope.markers.push({
                            id: value.RouterName,
                            coords: {
                                latitude: data.loc.split(',')[0],
                                longitude: data.loc.split(',')[1]
                            }
                        });
                    }
                }).
                error(function (error){
                    console.log(error.message);
                })
            })
        }
    });