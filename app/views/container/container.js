'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:LoginController
 * @description
 * # LoginController
 * Simple user login
 */
angular.module('bmpUiApp')
  .controller('MainController', function ($rootScope, $scope, $cookies, $state, $location, $timeout) {
      $scope.username = $cookies.username;

      $scope.logout = function (){
          delete $cookies.username;
          $state.transitionTo('login');
      };

      $scope.dualState = "Activate";

      $scope.toggleMenu = function(){
          $("#wrapper").toggleClass("toggled");
          $("#menu-toggle").toggleClass("menu-close");
          $rootScope.$broadcast('menu-toggle');
      }

      $scope.submit = function(){
        if($scope.iiaa){
          $state.transitionTo('app.aggregationAnalysis', {'as': $scope.iiaa});
          $scope.iiaa = '';
        }
        else if($scope.iipa){
          $state.transitionTo('app.prefixAnalysis', {'prefix': $scope.iipa});
          $scope.iipa = '';
        }
        else if($scope.iiwi){
          $state.transitionTo('app.whoIs', {'as': $scope.iiwi});
          $scope.iiwi = '';
        }
        else if($scope.iias){
          $state.transitionTo('app.asView', {'as': $scope.iias});
          $scope.iias = '';
        }
      }

      $scope.toggleDualWindows = function(){
        if($rootScope.dualWindow.active){
          $scope.dualState = "Activate";
          $state.transitionTo('app.' + $rootScope.dualWindow.a);
          $rootScope.dualWindow = {'active': false, 'a': undefined, 'b': undefined, 'map-top': false, 'map-bottom': false};
        }
        else{
          $scope.dualState = "Deactivate";
          var curr = $state.current.name.substr($state.current.name.indexOf(".") + 1);
          $rootScope.dualWindow = {'active': true, 'a': curr, 'b': 'globalView', 'map-top': false, 'map-bottom': false};
          $state.transitionTo('app.dualWindow.contents', {a: curr, b: 'globalView'});
        }
      }

      $scope.setTopWindow = function(page){
        $rootScope.dualWindow.a = page;
        $state.transitionTo('app.dualWindow.contents', {a: $rootScope.dualWindow.a, b: $rootScope.dualWindow.b});
      }

      $scope.setBottomWindow = function(page){
        $rootScope.dualWindow.b = page;
        $state.transitionTo('app.dualWindow.contents', {a: $rootScope.dualWindow.a, b: $rootScope.dualWindow.b});
      }

      $rootScope.dualWindow = {'active': false, 'a': undefined, 'b': undefined, 'map-top': false, 'map-bottom': false};

      $scope.location = $location;
      $scope.$watch('location.path()', function(newPath) {
        if($state.current.name === "app.dualWindow.contents" && !$rootScope.dualWindow.active){
          $state.transitionTo('app.globalView');
          $timeout(function(){
            $state.reload();
          }, 100);
          return;
        }

        var path = newPath.substr(1);
        if(path.indexOf('/') > -1 && !$rootScope.dualWindow.active){
          $state.transitionTo('app.globalView');
          $timeout(function(){
            $state.reload();
          }, 100);
        }
      });
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
})
.controller('DualControlController', function ($scope, $rootScope, $state){
  $scope.setTopWindow = function(page){
    $rootScope.dualWindow.a = page;
    $rootScope.dualWindow['map-top'] = false;
    $rootScope.dualWindow['map-bottom'] = false;
    $state.transitionTo('app.dualWindow.contents', {a: $rootScope.dualWindow.a, b: $rootScope.dualWindow.b});
  }

  $scope.setBottomWindow = function(page){
    $rootScope.dualWindow.b = page;
    $rootScope.dualWindow['map-top'] = false;
    $rootScope.dualWindow['map-bottom'] = false;
    $state.transitionTo('app.dualWindow.contents', {a: $rootScope.dualWindow.a, b: $rootScope.dualWindow.b});
  }
})
.directive('dualControl', function(){
  return{
    restrict: 'AE',
    scope: {
      l: "@",
      d: "="
    },
    controller: 'DualControlController',
    templateUrl: 'views/container/dualControl.html'
  }
});
