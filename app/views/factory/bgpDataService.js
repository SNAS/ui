'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.factory:bgpDataService
 * @description
 * # bgpDataService
 * Factory for BGP Data Service API calls
 */
angular.module('bmpUiApp').factory('bgpDataService', ['$http', '$q', 'ConfigService', function($http, $q, ConfigService) {

  var host = ConfigService.bgpDataService.host;
  var port = ConfigService.bgpDataService.port;
  var bgpAPI = "http://" + host + ":" + port;

  return {
    getASList: function(start, end) {
      // get the AS list from the BGP data service
      return $http.get(bgpAPI + "/as?start="+start+"&end="+end);
    },
    getASLinks: function(start, end) {
      // get the AS links from the BGP data service
      return $http.get(bgpAPI + "/links?start="+start+"&end="+end);
    },
    getASNodesAndIndexedLinks: function(start, end) {
      var startAndEnd = "?start="+start+"&end="+end;
      // $q.all will wait for an array of promises to resolve,
      // then will resolve its own promise (which it returns)
      // with an array of results in the same order.
      return $q.all([
        $http.get(bgpAPI + "/as" + startAndEnd),
        $http.get(bgpAPI + "/links" + startAndEnd)
      ])

      // process all of the results from the two promises
      // above, and join them together into a single result.
      // since then() returns a promise that resolves to the
      // return value of its callback, this is all we need
      // to return from our service method.
      .then(function(results) {
        var nodes = results[0].data;
        // TODO: choose which element of the nodes array we want. For now, let's take the latest one
        nodes = nodes[nodes.length-1].asList;
        var links = results[1].data;
          console.log("nodes", nodes);
          console.log("links", links);

        var nodeIndexes = {};
        for (var i = 0 ; i < nodes.length ; i++) {
          nodeIndexes[nodes[i].as] = i;
        }

        for (var i = 0 ; i < links.length ; i++) {
          links[i].sourceASN = links[i].source;
          links[i].source = nodeIndexes[links[i].source];
          links[i].targetASN = links[i].target;
          links[i].target = nodeIndexes[links[i].target];
        }
        return { nodes: nodes, links: links };
      });
    }
  };
}]);