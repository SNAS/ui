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
        "w.as_name%20like%20%27%" + name + "%%27%20" +
        "or%20w.org_name%20like%20%27%" + name + "%%27"
      );
    };

    //AS Analysis
    apiFactory.getTopTransitIpv4Data = function () {
      return $http.get(urlBase + "as_stats/ipv4?topTransit=5");
    };

    apiFactory.getTopTransitIpv6Data = function () {
      return $http.get(urlBase + "as_stats/ipv6?topTransit=5");
    };

    apiFactory.getTopOriginIpv4Data = function () {
      return $http.get(urlBase + "as_stats/ipv4?topOrigin=5");
    };

    apiFactory.getTopOriginIpv6Data = function () {
      return $http.get(urlBase + "as_stats/ipv6?topOrigin=5");
    };

    //Peer Analysis
    apiFactory.getPeerPrefix = function () {
      return $http.get(urlBase + "peer/prefix");
    };

    return apiFactory;
});
