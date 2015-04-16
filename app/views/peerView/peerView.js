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

        $scope.location = "peerView";
        $scope.parameterIP = $stateParams.RouterIP;

        //LOGIC FOR WATCHING THE MAP SELECTED MARKER
        $scope.$watch('peer', function (current){
          if(current !== undefined){
            var cardData = current.options;
            console.log(cardData);
            cardData.template = "peerViewPeer";
            $scope.cardApi.changeCard(cardData);
          }
        });


        // $scope.search;
        // var dot = '.';
        // var colon = ':';


        // var timer;
        // $scope.loading = false;
        // $scope.suggest = true;

        // $scope.$watch('search', function (val) {
        //     if(!$scope.suggest){
        //         $scope.suggest = !$scope.suggest;
        //         return;
        //     }

        //     if(val === undefined){
        //         $scope.suggestions = [];
        //         return;
        //     }

        //     if(timer){
        //         $timeout.cancel(timer)
        //     }
        //     timer= $timeout(function(){
        //         $scope.loading = true;

        //         if(val.indexOf('.') > -1){
        //             console.log('ipv4');
        //             getSuggestedPeers(val);
        //         }
        //         else if(val.indexOf(':') > -1){
        //             console.log('ipv6');
        //             //getSuggestedName(val);
        //         }
        //         else if(typeOf(val) === 'string'){
        //             console.log('string');
        //             //$scope.loading = false;
        //         }
        //         else if(typeOf(val) === 'number'){
        //             console.log('number');
        //         }
        //     }, 500)
        // });

        // $scope.suggestions = [];

        // function getSuggestedPeers(ip){
        //     $scope.suggestions = [];
        //     $scope.suggest = false;

        //     apiFactory.getRoutersByIp(ip).
        //     success(function (result){
        //         console.log(result.v_peers.data);
        //         if(result.v_peers.data.length === 0){
        //             $scope.loading = false;
        //             return;
        //         }
        //         angular.forEach(result.v_peers.data, function (value, key){
        //             $scope.suggestions.push({type: 'ip', content: value.RouterIP});
        //         });
        //         $scope.loading = false;
        //     }).
        //     error(function (error){
        //         console.log(error);
        //     })
        // }

        // function getSuggestedName(name){
        //     apiFactory.getWhoIsName(name, 3).
        //     success(function (result){
        //         console.log(result.w.data);

        //         angular.forEach(result.w.data, function (value, key){
        //             $scope.suggestions.push({type: 'name', content: value.org_name + ' - ' + key});
        //         });
        //         $scope.loading = false;
        //     }).
        //     error(function (error){
        //         console.log(error);
        //     })
        // }

        // $scope.getData = function(type, content){
        //     if(type === 'ip')
        //         $scope.getChosenPeers(content);
        // }
    });
