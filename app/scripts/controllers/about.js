'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the bmpUiApp
 */
angular.module('bmpUiApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
