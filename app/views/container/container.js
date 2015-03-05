'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:LoginController
 * @description
 * # LoginController
 * Simple user login
 */
angular.module('bmpUiApp')
    .controller('MainController', function ($location, $scope, $cookies, $state) {
        $scope.username = $cookies.username;

        $scope.logout = function (){
            delete $cookies.username;
            $state.transitionTo('login');
        };
    })

    .directive('activeItem', function ($location) {
    return {
      restrict: 'A',
      link: function($scope, element, attrs, controller) {
        var path = element.context.children[0].href;
        path = path.match('\#(.*)')[1]; //loose everything up to the hash

        $scope.location = $location;
        $scope.$watch('location.path()', function(newPath) {
          if (path === newPath) {
            element.addClass('active');
          } else {
            element.removeClass('active');
          }
        });
      }
    };
  });