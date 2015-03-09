'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:DashboardController
 * @description
 * # DashboardController
 * Controller of the Dashboard page
 */
angular.module('bmpUiApp')
    .controller('GlobalViewController', function ($scope, $http, $timeout, apiFactory, uiGmapGoogleMapApi) {
        window.SCOPE = $scope;
        $scope.loading = true;

        $scope.map = {
            center: {
                latitude: 40.1451, 
                longitude: -99.6680 
            }, 
            show: false,
            zoom: 3,
            control: {}
        };

        //Map control options
        $scope.options = {
            scrollwheel: false, 
            streetViewControl: false,
            panControl: false,
            mapTypeControl: false
        };

        $scope.events = {
            mouseover: function(marker, event, model, args){
                model.show = true;
            },
            mouseout: function(marker, event, model, args){
               $timeout( function(){ model.show = false }, 500);
            }        
        }

        $scope.$watch($scope.map.control, function() {
            $scope.mapObject = $scope.map.control.getGMap();

            $scope.$on('menu-toggle', function(thing, args) {
                $timeout( function(){ google.maps.event.trigger($scope.mapObject, "resize"); }, 500);
            });   
       });

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
                    data = data.v_geo_ip.data[0];
                    if(data.latitude != undefined && data.longitude != undefined){
                        $scope.markers.push({
                            id: value.RouterName,
                                latitude: data.latitude,
                                longitude: data.longitude,
                            show: false,
                            icon: '../images/marker.png'
                        });
                    }
                    $scope.loading = false;
                }).
                error(function (error){
                    console.log(error.message);
                })
            })
        } 
    });