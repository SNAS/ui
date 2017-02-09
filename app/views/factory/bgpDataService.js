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
    getASList: function(orderBy, orderDir, limit, offset) {
      // get the AS list from the BGP data service
      return $http.get(bgpAPI + "/as?orderBy="+orderBy+"&orderDir="+orderDir+"&limit="+limit+"&offset="+offset);
    },
    getASNodesAndIndexedLinks: function(asn, start, end) {
      var i;
      var deferred = $q.defer();

      // get list of AS numbers linked to the asn parameter
      $http.get(bgpAPI + "/links/"+asn+(end !== undefined ? "?end="+end : "")).success(function(asLinks) {
          var asnToFindOutAbout = [];

          // ignore links between the same ASN, e.g. source=109, target=109
          for (i = 0 ; i < asLinks.length ; i++) {
            var src = asLinks[i].source;
            var tgt = asLinks[i].target;
            if (src !== tgt) {
              // add source and target to the list of ASN to get more info on
              if (asnToFindOutAbout.indexOf(src) === -1) {
                asnToFindOutAbout.push(src);
              }
              if (asnToFindOutAbout.indexOf(tgt) === -1) {
                asnToFindOutAbout.push(tgt);
              }
            }
          }

          console.debug("asnToFindOutAbout", asnToFindOutAbout);

          var parameters = "";
          if (start !== undefined) {
            parameters = "?start=" + start;
          }
          if (end !== undefined) {
            parameters += (parameters.length === 0 ? "?" : "&") + "end=" + end;
          }

          // get information about all AS numbers
          $http.get(bgpAPI + "/as/"+asnToFindOutAbout.join(',')+parameters).success(function(linkedASInfo) {
              console.debug("got info for all ASes", JSON.stringify(linkedASInfo));
              var nodes = linkedASInfo;

              var nodeIndexes = {};
              for (i = 0 ; i < nodes.length ; i++) {
                nodeIndexes[nodes[i].asn] = i;
              }

              for (i = 0 ; i < asLinks.length ; i++) {
                asLinks[i].sourceASN = asLinks[i].source;
                asLinks[i].source = nodeIndexes[asLinks[i].source];
                asLinks[i].targetASN = asLinks[i].target;
                asLinks[i].target = nodeIndexes[asLinks[i].target];
              }

              deferred.resolve({ nodes: nodes, links: asLinks });
            }
          ).error(function(error) {
              console.error("Failed to retrieve info for AS", asnToFindOutAbout.join(','), error);
              deferred.reject("Failed to retrieve info for AS " + asnToFindOutAbout.join(','));
            }
          );

        }
      ).error(function(error) {
          console.error("Failed to retrieve AS links", error);
          deferred.reject("Failed to retrieve links for AS ", asn);
        }
      );

      return deferred.promise;
    },
    getASInfo: function(asn, start, end) {
      var parameters = "";
      if (start !== undefined) {
        parameters = "?start=" + start;
      }
      if (end !== undefined) {
        parameters += (parameters.length === 0 ? "?" : "&") + "end=" + end;
      }

      return $http.get(bgpAPI + "/as/"+asn+parameters);
    },
    getASLinks: function(asn, end) {
      return $http.get(bgpAPI + "/links/"+asn+(end !== undefined ? "?end="+end : ""));
    },
    getASStats: function(asn, end) {
      return $http.get(bgpAPI + "/as/stats/"+asn+(end !== undefined ? "?end="+end : ""));
    },
    // unfinished
    getLinkStats: function(asn, end) {
      return $http.get(bgpAPI + "/link/stats/"+asn+(end !== undefined ? "?end="+end : ""));
    }
  };
}]);