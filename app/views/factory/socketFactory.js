'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.factory:socket
 * @description
 * # socket
 * Factory for socket.io connections for handling real-time notifications
 */
angular.module('bmpUiApp').factory('socket', ['$rootScope', 'ConfigService',
  function ($rootScope) {
    var socket = {};
    return {
      // pass a socket ID and an object containing fields named 'host' and 'port'
      connect: function(id, conf) {
        socket[id] = io.connect('http://' + conf.host + ':' + conf.port);
        socket[id].on('connect_error', function(err) {
          // handle server error here
          console.error('Error connecting to socket.io server');
        });
      },
      on: function (id, eventName, callback) {
        socket[id].on(eventName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (id, eventName, data, callback) {
        socket[id].emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        });
      }
    };
  }
]);
