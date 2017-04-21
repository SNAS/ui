'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:BGPASPathController
 * @description
 * # BGPASPathController
 * Controller for the BGP AS Path page
 */
angular.module('bmpUiApp').controller('BGPASPathController',
  function($scope, $rootScope, $stateParams, $location, $filter, bgpDataService, ConfigService, socket, uiGridConstants, apiFactory, $timeout) {

    var uiServer = ConfigService.bgpDataService;
    const SOCKET_IO_SERVER = "bgpDataServiceSocket";
    socket.connect(SOCKET_IO_SERVER, uiServer);
    socket.on(SOCKET_IO_SERVER, 'dataUpdate', function(data) {
      console.log("dataUpdate", data);
    });

    $rootScope.dualWindow.noTitleBar = true;

    // initialisation
    $(function () {
    });
  }
);
