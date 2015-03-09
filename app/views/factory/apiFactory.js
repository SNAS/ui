'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.factory:apiFactory
 * @description
 * # apiFactory
 * Factory for API calls
 */
angular.module('bmpUiApp')
    .factory('apiFactory', function ($http) {

    var urlBase = 'http://odl-dev.openbmp.org:8001/db_rest/v1/';
    var apiFactory = {};

    apiFactory.getRouters = function () {
        return $http.get(urlBase + 'routers');
    };

    apiFactory.getRouterLocation = function (ip) {
        return $http.get(urlBase + "geoip/" + ip);
    };

    apiFactory.getRouterStatus = function () {
      return $http.get(urlBase + "routers/status/up");
    };

    apiFactory.getPeers = function () {
      return $http.get(urlBase + "peer");
    };

    apiFactory.getPeersByIp = function (ip) {
      return $http.get(urlBase + "peer?where=routerip=%27" + ip + "%27");
    };

    apiFactory.getWhoIsASN = function (asn) {
      return $http.get(urlBase + "whois/asn/" + asn);
    };

    apiFactory.getWhoIsWhereASN = function (asn) {
      return $http.get(urlBase + "whois/asn?where=w.asn=" + asn);
    };

    apiFactory.getWhoIsName = function (name) {
      return $http.get(urlBase + "whois/asn?where=" +
      "w.as_name%20like%20%27%" + name + "%%27%20"+
      "or%20w.org_name%20like%20%27%" + name + "%%27"
      );
    };

    return apiFactory;
});
