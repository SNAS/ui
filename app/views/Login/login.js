'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:LoginController
 * @description
 * # LoginController
 * Simple user login
 */
angular.module('bmpUiApp')
    .controller('LoginController', function ($rootScope, $scope, $state) {
        $scope.login = function(){
            if($scope.username === 'demo' && $scope.password === 'demo'){
                $rootScope.currentUser = $scope.username;
                $state.transitionTo('app.admin.collectionServer');
            } else {
                $scope.error = 'Incorrect username or password';
            }
        };
    });