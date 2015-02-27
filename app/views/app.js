'use strict';

/**
 * @ngdoc overview
 * @name bmpUiApp
 * @description
 * # bmpUiApp
 *
 * Main module of the application.
 */
angular
  .module('bmpUiApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/dashboard/dashboard.html',
        controller: 'DashboardController'
      })
      .when('/about', {
        //templateUrl: 'views/about.html',
        //controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });