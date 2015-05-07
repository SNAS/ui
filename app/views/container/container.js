'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:LoginController
 * @description
 * # LoginController
 * Simple user login
 */
angular.module('bmpUiApp')
    .controller('MainController', function ($rootScope, $scope, $cookies, $state) {
        $scope.username = $cookies.username;

        $scope.logout = function (){
            delete $cookies.username;
            $state.transitionTo('login');
        };

        $scope.toggleMenu = function(){
            $("#wrapper").toggleClass("toggled");
            $("#menu-toggle").toggleClass("menu-close");
            $rootScope.$broadcast('menu-toggle');
        }
    })

    .directive('activeItem', function ($location) {
    return {
      restrict: 'A',
      link: function($scope, element, attrs, controller) {
        var path = element.context.children[0].href;
        if(path === '')
          return;
        path = path.match('\#(.*)')[1]; //lose everything up to the hash

        $scope.location = $location;
        $scope.$watch('location.path()', function(newPath) {
          
          $scope.page = newPath.substring(1);
          $scope.title = $scope.page.replace(/-/g, ' ');

          if (path === newPath) {
            element.addClass('active');
          } else {
            element.removeClass('active');
          }
        });
      }
    };
  });
