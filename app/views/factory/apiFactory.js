'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.factory:apiFactory
 * @description
 * # apiFactory
 * Factory for API calls
 */
angular.module('bmpUiApp')
  .factory('apiFactory', function ($http, $q, $location) {

    //http://demo.openbmp.org:8001/db_rest/v1/
    //If other host and port for db_rest is desired, change below.
    var host = $location.host();
    var port = $location.port();
    var urlBase = 'http://' + host + ':' + port + '/db_rest/v1/';
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

    apiFactory.getRouterIpType = function (routerIp, ipType) {
      return $http.get(urlBase + "peer/router/" +
        routerIp + //10.22.165.14
        "/type/" +
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

    apiFactory.getPeersAndLocationsGrouped = function () {
      return $http.get(urlBase + "peer/map");
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
      if (lim != undefined) lim = "&limit=" + lim;
      return $http.get(urlBase + "whois/asn?where=w.asn%20like%20%27" + asn + "%%27" + lim);
    };

    apiFactory.getWhoIsWhereASNLikeCOUNT = function (asn) {
      return $http.get(urlBase + "whois/asn/count?where=w.asn%20like%20%27" + asn + "%%27");
    };

    apiFactory.getWhoIsASNameList = function (list) {
      return $http.get(urlBase + "whois/asn?where=w.asn%20in%20(" + list.toString() + ")");
    };

    apiFactory.getWhoIsName = function (name, lim) {
      if (lim === undefined) lim = limit;

      var uri = urlBase + "whois/asn?where=w.as_name like '%" + name + "%' or w.org_name like '%" + name + "%'&limit=" + lim;
      var res = encodeURI(uri);
      return $http.get(res);
    };

    apiFactory.getWhoIsASName = function (name) {
      var uri = urlBase + "whois/asn?where=w.as_name='" + name + "'";
      var res = encodeURI(uri);
      return $http.get(res);
    };

    apiFactory.getWhoIsASNameLike = function (name, lim) {
      if (lim === undefined) lim = limit;

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

    apiFactory.getRIBbyASN = function (asn) {
      return $http.get(urlBase + "rib/asn/" + asn + "?distinct&brief");
    };

    //Peer Analysis
    apiFactory.getPeerByHashId = function (peerHashId) {
      return $http.get(urlBase + "peer/" + peerHashId);
    };

    apiFactory.getPeerPrefix = function () {
      return $http.get(urlBase + "peer/prefix");
    };

    apiFactory.getPeerPrefixByHashId = function (peerHashId) {
      return $http.get(urlBase + "peer/prefix/" + peerHashId);
    };

    apiFactory.getPeerHistory = function (peerHashId, amount_of_entries) {
      return $http.get(urlBase + "peer/prefix/" + peerHashId + '?last=' + amount_of_entries);
    };

    apiFactory.getPeerDownStream = function (peer_hash_id) {
      return $http.get(urlBase + "downstream/peer/" + peer_hash_id);
    };

    apiFactory.getPeerRib = function (peer_hash_id) {
      return $http.get(urlBase + "rib/peer/" + peer_hash_id);
    };

    apiFactory.getPeerRibLookup = function (peer_hash_id, ip) {
      return $http.get(urlBase + "rib/peer/" + peer_hash_id + "/lookup/" + ip);
    };

    apiFactory.getPeerRibPrefix = function (peer_hash_id, ip) {
      return $http.get(urlBase + "rib/peer/" + peer_hash_id + "/prefix/" + ip);
    };

    apiFactory.getPeerRibLookupIp = function (ip) {
      return $http.get(urlBase + "rib/lookup/" + ip);
    };


    //For the Graphs in Card
    apiFactory.getUpdatesOverTimeByPeer = function (peer_hash_id) {
      return $http.get(urlBase + "updates/peer/" + peer_hash_id + "/top/interval/5");
    };

    apiFactory.getTopPrefixUpdatesByPeer = function (peer_hash_id) {
      return $http.get(urlBase + "updates/peer/" + peer_hash_id + "/top");
    };

    apiFactory.getWithdrawsOverTimeByPeer = function (peer_hash_id) {
      return $http.get(urlBase + "withdrawns/peer/" + peer_hash_id + "/top/interval/5");
    };

    apiFactory.getTopPrefixWithdrawsByPeer = function (peer_hash_id) {
      return $http.get(urlBase + "withdrawns/peer/" + peer_hash_id + "/top");
    };

    //For Tops view
    apiFactory.getTopUpdates = function (searchPeer, searchPrefix, groupBy, startTimestamp, endTimestamp, joinWhoisPrefix) {
      joinWhoisPrefix = joinWhoisPrefix || false;
      return $http.get(urlBase + "updates/top?searchPeer=" + searchPeer + "&searchPrefix=" + searchPrefix + "&groupBy=" + groupBy + "&joinWhoisPrefix=" + joinWhoisPrefix + "&startTs=" + startTimestamp + "&endTs=" + endTimestamp)
    };

    apiFactory.getTopWithdraws = function (searchPeer, searchPrefix, groupBy, startTimestamp, endTimestamp, joinWhoisPrefix) {
      joinWhoisPrefix = joinWhoisPrefix || false;
      return $http.get(urlBase + "withdrawns/top?searchPeer=" + searchPeer + "&searchPrefix=" + searchPrefix + "&groupBy=" + groupBy + "&joinWhoisPrefix=" + joinWhoisPrefix + "&startTs=" + startTimestamp + "&endTs=" + endTimestamp)
    };

    apiFactory.getUpdatesOverTime = function (searchPeer, searchPrefix, seconds, startTimestamp, endTimestamp) {
      return $http.get(urlBase + "updates/trend/interval/" + seconds + "?searchPeer=" + searchPeer + "&searchPrefix=" + searchPrefix + "&startTs=" + startTimestamp + "&endTs=" + endTimestamp)
    };

    apiFactory.getWithdrawsOverTime = function (searchPeer, searchPrefix, seconds, startTimestamp, endTimestamp) {
      return $http.get(urlBase + "withdrawns/trend/interval/" + seconds + "?searchPeer=" + searchPeer + "&searchPrefix=" + searchPrefix + "&startTs=" + startTimestamp + "&endTs=" + endTimestamp)
    };


    //orr view
    apiFactory.getORRospf = function (peerHashId, routerId) {
      return $http.get(urlBase + "orr/peer/" + peerHashId + "/ospf/" + routerId);
    };

    apiFactory.getORRisis = function (peerHashId, routerId) {
      return $http.get(urlBase + "orr/peer/" + peerHashId + "/isis/" + routerId);
    };

    //link state view
    apiFactory.getLinkStatePeers = function () {
      return $http.get(urlBase + "linkstate/peers/");
    };

    apiFactory.getLinkStatePeersWithGeo = function () {
      return $http.get(urlBase + "linkstate/peers/?withGeo");
    };

    apiFactory.getPeerNodes = function (peerHashId, mt_id) {
      return $http.get(urlBase + "linkstate/nodes/peer/" + peerHashId + "/" + mt_id + "?withGeo");
    };

    apiFactory.getPeerLinks = function (peerHashId, mt_id) {
      return $http.get(urlBase + "linkstate/links/peer/" + peerHashId + "/" + mt_id);
    };

    apiFactory.getSPFospf = function (peerHashId, routerId) {
      return $http.get(urlBase + "linkstate/spf/peer/" + peerHashId + "/ospf/" + routerId);
    };

    apiFactory.getSPFisis = function (peerHashId, routerId, mt_id) {
      return $http.get(urlBase + "linkstate/spf/peer/" + peerHashId + "/isis/" + routerId + "/" + mt_id);
    };

    // prefix analysis
    apiFactory.getPrefix = function (prefix) {
      return $http.get(urlBase + "rib/prefix/" + prefix);
    };

    //deprecated
    apiFactory.getPrefixWLen = function (prefix, len) {
      return $http.get(urlBase + "rib/prefix/" + prefix + "/" + len);
    };

    apiFactory.getHistoryPrefix = function (prefix) {
      return $http.get(urlBase + "rib/history/" + prefix);
    };

    apiFactory.getPeerHistoryPrefix = function (prefix, hashId) {
      //return $http.get(urlBase + "rib/history/" + prefix);
      return $http.get(urlBase + "rib/peer/" + hashId + "/history/" + prefix)
    };


    apiFactory.getWhoIsWhereASNSync = function (asn) {
      //fix it later . now this is a Sync API
      return urlBase + "whois/asn?where=w.asn=" + asn;
    };

    apiFactory.getWhoisPrefix = function (prefix) {
      return $http.get(urlBase + "whois/prefix/" + prefix);
    };

    // Aggregation analysis
    apiFactory.getAsnCount = function (asn) {
      return $http.get(urlBase + "rib/asn/" + asn + "/count");
    };

    apiFactory.getAsnInfoPeer = function (asn, hashId) {
      return $http.get(urlBase + "rib/peer/" + hashId + "/asn/" + asn);
    };

    apiFactory.getAsnInfo = function (asn, prefix_amount) {
      return $http.get(urlBase + "rib/asn/" + asn + "?limit=" + prefix_amount);
    };

    //AS View
    apiFactory.getUpstream = function (asn) {
      return $http.get(urlBase + "upstream/" + asn + "?limit=" + limit);
    };

    apiFactory.getDownstream = function (asn) {
      return $http.get(urlBase + "downstream/" + asn);
    };

    apiFactory.getUpstreamCount = function (asn) {
      return $http.get(urlBase + "upstream/" + asn + "/count");
    };

    apiFactory.getDownstreamCount = function (asn) {
      return $http.get(urlBase + "downstream/" + asn + "/count");
    };

    // Looking Glass
    apiFactory.lookupDNS = function (hostname) {
      return $http.get(urlBase + "dns/" + hostname);
    };

    apiFactory.getCommP2ByP1 = function (part1) {
      return $http.get(urlBase + "community/part2/" + part1);
    };

    apiFactory.getCommP1Suggestions = function (part1) {
      return $http.get(urlBase + "community/part1/" + part1);
    };

    apiFactory.getPrefixByCommunity = function (community) {
      return $http.get(urlBase + "community?community=" + community);
    };

    //ATLAS
    apiFactory.getAllAS = function () {
      return $http.get(urlBase + "whois/asn/all");
    };

    apiFactory.getRelatedAS = function(asn){
      return $http.get(urlBase + "whois/asn/"+asn+"/related");
    };

    apiFactory.getPrefixesOriginingFrom = function (asn) {
      return $http.get(urlBase + "whois/prefix/from/" + asn);
    };

    apiFactory.getGeoLocation = function (countryCode, city) {
      return $http.get(urlBase + "geolocation/" + countryCode + "/" + city);
    };

    //Admin Page
    apiFactory.getGeoIPList = function (page, limit, whereClause, sort) {
      return $http.get(urlBase + "geoip/get/" + page + "/" + limit + "?where=" + whereClause + (sort ? ("&sort=" + sort.name + "&sortDirection=" + sort.sort.direction) : ""));
    };

    apiFactory.getGeoIPCount = function (whereClause) {
      return $http.get(urlBase + "geoip/getcount" + "?where=" + whereClause);
    };

    apiFactory.insertGeoIP = function (suffix) {
      return $http.post(urlBase + "geoip/insert?" + suffix);
    };

    apiFactory.updateGeoIP = function (ip_start, col, value) {
      return $http.get(urlBase + "geoip/update/" + ip_start + "/" + col + "/" + value);
    };

    apiFactory.deleteGeoIP = function (ip_start) {
      return $http.get(urlBase + "geoip/delete/" + ip_start);
    };

    apiFactory.describeGeoIP = function () {
      return $http.get(urlBase + "geoip/describe");
    };

    apiFactory.importGeoIPFromFile = function (formData) {
      return $http.post(urlBase + "geoip/import", formData, {
        headers: {'Content-Type': undefined},
        transformRequest: angular.identity
      });
    };

    apiFactory.getGeoLocationList = function (page, limit, whereClause, sort) {
      return $http.get(urlBase + "geolocation/get/" + page + "/" + limit + "?where=" + whereClause + (sort ? ("sort=" + sort.name + "&sortDirection=" + sort.sort.direction) : ""));
    };

    apiFactory.getGeoLocationCount = function (whereClause) {
      return $http.get(urlBase + "geolocation/getcount" + "?where=" + whereClause);
    };

    apiFactory.insertGeoLocation = function (suffix) {
      return $http.post(urlBase + "geolocation/insert?" + suffix);
    };

    apiFactory.updateGeoLocation = function (country, city, col, value) {
      return $http.get(urlBase + "geolocation/update/" + country + "/" + city + "/" + col + "/" + value);
    };

    apiFactory.deleteGeoLocation = function (country, city) {
      return $http.get(urlBase + "geolocation/delete/" + country + "/" + city);
    };

    apiFactory.describeGeoLocation = function () {
      return $http.get(urlBase + "geolocation/describe");
    };

    apiFactory.importGeoLocationFromFile = function (formData) {
      return $http.post(urlBase + "geolocation/import", formData, {
        headers: {'Content-Type': undefined},
        transformRequest: angular.identity
      });
    };
    // security analysis
    apiFactory.getMisMatchPrefix = function (page, limit, sort, desc, asn, prefix, where) {
      var url = urlBase + "security/" + page + '/' + limit;
      if (sort || desc || asn || prefix || where)
        url += "?";
      var keyval = [];
      if (sort) {
        if (sort == 'prefixWithLen') sort = 'prefix';  // if sort by first column, sort by prefix
        keyval.push("sort=" + sort + '&desc=' + desc);
      }
      if (prefix)
        keyval.push("prefix=" + prefix);
      if (where)
        keyval.push("where=" + where);
      if (asn)
        keyval.push("asn=" + asn);
      url += keyval.join("&");
      return $http.get(url);
    };

    apiFactory.getTotalCount = function (asn, prefix, where) {
      var url = urlBase + "security/total";
      if (asn != null || prefix != null || where != null)
        url += "?";
      var keyval = [];
      if (prefix)
        keyval.push("prefix=" + prefix);
      if (where)
        keyval.push("where=" + where);
      if (asn)
        keyval.push("asn=" + asn);
      url += keyval.join('&');
      return $http.get(url);
    };

    return apiFactory;
  });
