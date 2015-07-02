'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:LoginController
 * @description
 * # LoginController
 * Simple user login
 */
angular.module('bmpUiApp')
    .controller('LoginController', function ($scope, $cookies, $state) {
        $scope.login = function(){
            if($scope.username === 'openbmp' && $scope.password === 'CiscoRA'){
                $cookies.username = 'openbmp Account';
                $state.transitionTo('app.globalView');
            } else {
                $scope.error = 'Incorrect username or password';
            }
        };
    });
