'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:LoginController
 * @description
 * # LoginController
 * Simple user login
 */
angular.module('bmpUiApp')
  .controller('LoginController', ['AuthenticationService', '$scope', '$state', function (AuthenticationService, $scope, $state) {
    $scope.login = function () {
      $scope.error = null;

      var formData = new FormData();
      formData.append('username', $scope.username);
      formData.append('password', $scope.password);
      AuthenticationService.login(formData)
        .success(function (result) {
          if (result.users.data.length > 0) {
            AuthenticationService.setCredentials($scope.username, $scope.password, result.users.data[0].type);
            $state.transitionTo('app.globalView');
          }
          else
            $scope.error = 'Incorrect username or password';
        })
        .error(function (err) {
          // $scope.error = 'Something went wrong ' +
          $scope.error = 'Authentication service is unreachable'
        });
    };
  }]);
