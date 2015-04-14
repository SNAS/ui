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

        $scope.parameterIP = $stateParams.RouterIP;

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
                $scope.getChosenPeers(content);
        }
    });
