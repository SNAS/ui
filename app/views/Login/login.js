'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:LoginController
 * @description
 * # LoginController
 * Simple user login
 */
angular.module('bmpUiApp')
    .controller('LoginController', ['$scope', '$cookies', '$state', function ($scope, $cookies, $state) {
        $scope.login = function(){
            if($scope.username === 'demo' && $scope.password === 'demo'){
                $cookies.username = $scope.username;
                $state.transitionTo('app.admin.collectionServer');
            } else {
                $scope.error = 'Incorrect username or password';
            }
        };
    }]);