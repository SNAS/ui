'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:LoginController
 * @description
 * # LoginController
 * Simple user login
 */
angular.module('bmpUiApp')
    .controller('MainController', ['$scope', '$cookies', '$state', function ($scope, $cookies, $state) {
        $scope.logout = function (){
            delete $cookies.username;
            $state.transitionTo('login');
        };
    }])

    .directive('mainMenu', ['$location', '$rootScope', '$cookies', function ($location, $rootScope, $cookies) {
        return {
            restrict: 'E',
            templateUrl: '/views/container/container.html',
            link: function($scope, $rootScope) {
                $scope.username = $cookies.username;
                console.log('after login', $rootScope.currentUser);
                $scope.location = $location;
                $scope.$watch('location.path()', function(currentPath) {

                });
            }
        };
    }]);