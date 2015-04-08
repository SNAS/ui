'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.factory:apiFactory
 * @description
 * # apiFactory
 * Factory for API calls
 */
angular.module('bmpUiApp')
    .factory('apiFactory', function ($http, $q) {

    var urlBase = 'http://odl-dev.openbmp.org:8001/db_rest/v1/';
    var limit = 1000;
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

    apiFactory.getRouterIpType = function(routerIp, ipType){
      return $http.get(urlBase + "peer/router/" +
      routerIp + //10.22.165.14
      "/type/"+
      ipType); //v4 | v6
    };

    apiFactory.getPeers = function () {
      return $http.get(urlBase + "peer");
    };

    apiFactory.getPeersByIp = function (ip) {
      return $http.get(urlBase + "peer?where=routerip%20like%20%27" + ip + "%%27");
    };

    apiFactory.getRoutersByIp = function (ip) {
      return $http.get(urlBase + "peer?where=routerip%20like%20%27" + ip + "%%27");
    };

    apiFactory.getWhoIsASN = function (asn) {
      return $http.get(urlBase + "whois/asn/" + asn);
    };

    apiFactory.getWhoIsWhereASN = function (asn) {
      return $http.get(urlBase + "whois/asn?where=w.asn=" + asn);
    };

    apiFactory.getWhoIsName = function (name, lim) {
      if(lim === undefined) lim = limit;

      var uri = urlBase + "whois/asn?where=w.as_name like '%" + name + "%' or w.org_name like '%" + name + "%'&limit=" + lim;
      var res = encodeURI(uri);
      return $http.get(res);
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

    apiFactory.getPeerHistory = function (peerIP, amount_of_entries){
      return $http.get(urlBase + "peer/prefix/" + peerIP + '?last=' + amount_of_entries);
    };

    //topology
    apiFactory.getPeerNodes = function (peerHashId){
      return $http.get(urlBase + "linkstate/nodes/peer/" + peerHashId);
    };

    apiFactory.getPeerLinks = function (peerHashId){
      return $http.get(urlBase + "linkstate/links/peer/" + peerHashId);
    };

    apiFactory.getSPFospf = function (peerHashId,routerId){
      return $http.get(urlBase + "linkstate/spf/peer/" + peerHashId + "/ospf/" + routerId);
    };

    apiFactory.getSPFisis = function (peerHashId,routerId){
      return $http.get(urlBase + "linkstate/spf/peer/" + peerHashId + "/isis/" + routerId);
    };

    return apiFactory;
});
