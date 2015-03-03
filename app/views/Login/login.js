'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:LoginController
 * @description
 * # LoginController
 * Controller of the Login page
 */
angular.module('bmpUiApp')
  .controller('LoginController', function ($scope) {

    $scope.login = function() {
      if ($scope.username == "demo" && $scope.password == "demo") {
        alert("Logged in.");
        //redirect to the dashboard state.
      }else{
        alert("No login");
      }
    };

  });
