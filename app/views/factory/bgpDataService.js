'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.factory:bgpDataService
 * @description
 * # bgpDataService
 * Factory for BGP Data Service API calls
 */
angular.module('bmpUiApp').factory('bgpDataService', ['$http', 'ConfigService', function($http, ConfigService) {

  var host = ConfigService.bgpDataService.host;
  var port = ConfigService.bgpDataService.port;
  var bgpAPI = "http://" + host + ":" + port + "/as";

  return {
    getASList: function() {
      // get the AS list from the BGP data service
      return $http.get(bgpAPI);
    }
  };
}]);