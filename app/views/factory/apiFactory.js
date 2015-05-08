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

    //http://demo.openbmp.org:8001/db_rest/v1/
    var urlBase = 'http://odl-dev.openbmp.org:8001/db_rest/v1/';
    var limit = 1000;
    var apiFactory = {};

    apiFactory.getRouters = function () {
      return $http.get(urlBase + 'routers');
    };

    apiFactory.getRoutersAndLocations = function () {
      return $http.get(urlBase + "routers?withgeo");
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

    apiFactory.getPeerGeo = function (ip) {
      return $http.get(urlBase + "geoip/" + ip);
    };

    apiFactory.getPeersByIp = function (ip) {
      return $http.get(urlBase + "peer?where=routerip%20like%20%27" + ip + "%%27");
    };

    apiFactory.getPeersAndLocationsByIp = function (ip) {
      return $http.get(urlBase + "peer?where=routerip%20like%20%27" + ip + "%%27&withgeo");
    };

    apiFactory.getPeersByLocalIp = function (ip) {
      return $http.get(urlBase + "peer/localip/" + ip + "?limit=5");
    };

    apiFactory.getWhoIsASN = function (asn) {
      return $http.get(urlBase + "whois/asn/" + asn);
    };

    apiFactory.getWhoIsWhereASN = function (asn) {
      return $http.get(urlBase + "whois/asn?where=w.asn=" + asn);
      //return urlBase + "whois/asn?where=w.asn=" + asn;
    };

    apiFactory.getWhoIsWhereASNLike = function (asn, lim) {
      if(lim != undefined) lim = "&limit=" + lim;
      return $http.get(urlBase + "whois/asn?where=w.asn%20like%20%27" + asn + "%%27" + lim);
    };

    apiFactory.getWhoIsWhereASNLikeCOUNT = function (asn) {
      return $http.get(urlBase + "whois/asn/count?where=w.asn%20like%20%27" + asn + "%%27");
    };

    apiFactory.getWhoIsName = function (name, lim) {
      if(lim === undefined) lim = limit;

      var uri = urlBase + "whois/asn?where=w.as_name like '%" + name + "%' or w.org_name like '%" + name + "%'&limit=" + lim;
      var res = encodeURI(uri);
      return $http.get(res);
    };

    apiFactory.getWhoIsASName = function (name, lim) {
      if(lim === undefined) lim = limit;

      var uri = urlBase + "whois/asn?where=w.as_name like '%" + name + "%'&limit=" + lim;
      var res = encodeURI(uri);
      return $http.get(res);
    };

    apiFactory.getWhoIsASNameCOUNT = function (name) {
      var uri = urlBase + "whois/asn/count?where=w.as_name like '%" + name + "%' or w.org_name like '%" + name + "%'";
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

    apiFactory.getPeerPrefixByHashId = function (peerHashId){
      return $http.get(urlBase + "peer/prefix/" + peerHashId);
    };

    apiFactory.getPeerHistory = function (peerHashId, amount_of_entries){
      return $http.get(urlBase + "peer/prefix/" + peerHashId + '?last=' + amount_of_entries);
    };

    apiFactory.getPeerDownStream = function (peer_hash_id){
      return $http.get(urlBase + "downstream/peer/" + peer_hash_id);
    };

    apiFactory.getPeerRib = function (peer_hash_id){
      return $http.get(urlBase + "rib/peer/" + peer_hash_id);
    };

    apiFactory.getPeerRibLookup = function (peer_hash_id,ip){
      return $http.get(urlBase + "rib/peer/" + peer_hash_id + "/lookup/" + ip);
    };

    apiFactory.getPeerRibPrefix = function (peer_hash_id,ip){
      return $http.get(urlBase + "rib/peer/" + peer_hash_id + "/prefix/" + ip);
    };


    //For the Graphs in Card
    apiFactory.getUpdatesOverTime = function (peer_hash_id){
      return $http.get(urlBase + "updates/peer/" + peer_hash_id + "/top/interval/5");
    };

    apiFactory.getTopPrefixUpdates = function (peer_hash_id){
      return $http.get(urlBase + "updates/peer/" + peer_hash_id + "/top");
    };

    apiFactory.getWithdrawsOverTime = function (peer_hash_id){
      return $http.get(urlBase + "withdrawns/peer/" + peer_hash_id + "/top/interval/5");
    };

    apiFactory.getWithdrawnPrefixOverTime = function (peer_hash_id){
      return $http.get(urlBase + "withdrawns/peer/" + peer_hash_id + "/top");
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

    // prefix analysis
    apiFactory.getPrefix = function (prefix) {
      return $http.get(urlBase + "rib/prefix/" + prefix);
    };

    apiFactory.getHistoryPrefix = function (prefix) {
      return $http.get(urlBase + "rib/history/" + prefix);
    };

    apiFactory.getPeerHistoryPrefix = function (prefix,hashId) {
      //return $http.get(urlBase + "rib/history/" + prefix);
      return $http.get(urlBase + "rib/peer/" + hashId +"/history/" + prefix)
    };


    apiFactory.getWhoIsWhereASNSync = function (asn) {
      //fix it later . now this is a Sync API
      return urlBase + "whois/asn?where=w.asn=" + asn;
    };

    // Aggregation analysis
    apiFactory.getAsnCount = function (asn) {
      return $http.get(urlBase + "rib/asn/" + asn + "/count");
    };

    apiFactory.getAsnInfoPeer = function (asn,hashId) {
      return $http.get(urlBase + "rib/peer/" + hashId + "/asn/" + asn);
    };

    apiFactory.getAsnInfo = function (asn,prefix_amount) {
      return $http.get(urlBase + "rib/asn/" + asn + "?limit=" + prefix_amount);
    };

    //AS View
    apiFactory.getUpstreamCount = function (asn) {
      return $http.get(urlBase + "upstream/" + asn + "/count");
    };

    apiFactory.getDownstreamCount = function (asn) {
      return $http.get(urlBase + "downstream/" + asn + "/count");
    };

    return apiFactory;
});
