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

  function cancel(canceller) {
    return function() {
      canceller.resolve();
    }
  };

  return {
    getASList: function(orderBy, orderDir, limit, offset) {
      var canceller = $q.defer();
      // get the AS list from the BGP data service
      var promise = $http.get(bgpAPI + "/as?orderBy="+orderBy+"&orderDir="+orderDir+"&limit="+limit+"&offset="+offset, { timeout: canceller.promise })
        .then(function(response) {
          return response.data;
        }, function(response) {
          console.error("Failed to get AS list", response);
          return $q.reject("Failed to get AS list (request might have been cancelled)");
        })
        .catch(function(e) {
          console.error("Failed to get AS list", e);
          return $q.reject("Failed to get AS list (request might have been cancelled)");
        });
      return { promise: promise, cancel: cancel(canceller) };
    },
    getASInfo: function(asn, start, end) {
      var parameters = "";
      if (start !== undefined) {
        parameters = "?start=" + start;
      }
      if (end !== undefined) {
        parameters += (parameters.length === 0 ? "?" : "&") + "end=" + end;
      }

      var canceller = $q.defer();
      var promise = $http.get(bgpAPI + "/as/"+asn+parameters, { timeout: canceller.promise })
        .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject("Failed to get AS info (request might have been cancelled) - as="+asn);
        });
      return { promise: promise, cancel: cancel(canceller) };
    },
    getASLinks: function(asn, end) {
      var canceller = $q.defer();
      var promise = $http.get(bgpAPI + "/links/"+asn+(end !== undefined ? "?end="+end : ""), { timeout: canceller.promise })
        .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject("Failed to get AS links (request might have been cancelled) - as="+asn);
        });
      return { promise: promise, cancel: cancel(canceller) };
    },
//    getASStats: function(asn, end) {
//      return $http.get(bgpAPI + "/as/stats/"+asn+(end !== undefined ? "?end="+end : ""));
//    },
//    // unfinished
//    getLinkStats: function(asn, end) {
//      return $http.get(bgpAPI + "/link/stats/"+asn+(end !== undefined ? "?end="+end : ""));
//    },
    getASPaths: function(asn, start, end) {
      var parameters = "";
      if (start !== undefined) {
        parameters = "?start=" + start;
      }
      if (end !== undefined) {
        parameters += (parameters.length === 0 ? "?" : "&") + "end=" + end;
      }

      var canceller = $q.defer();
      var promise = $http.get(bgpAPI + "/aspaths/"+asn+parameters, { timeout: canceller.promise })
        .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject("Failed to get AS paths (request might have been cancelled) - as="+asn);
        });

      return { promise: promise, cancel: cancel(canceller) };
    },
    getASPathsHistory: function(asn, start, end) {
      var parameters = "";
      if (start !== undefined) {
        parameters = "?start=" + start;
      }
      if (end !== undefined) {
        parameters += (parameters.length === 0 ? "?" : "&") + "end=" + end;
      }

      var canceller = $q.defer();
      var promise = $http.get(bgpAPI + "/aspaths/hist/"+asn+parameters, { timeout: canceller.promise })
        .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject("Failed to get AS paths history (request might have been cancelled) - as="+asn);
        });

      return { promise: promise, cancel: cancel(canceller) };
    },
    getPrefixInfo: function(prefix, start, end) {
      var parameters = "";
      if (start !== undefined) {
        parameters = "?start=" + start;
      }
      if (end !== undefined) {
        parameters += (parameters.length === 0 ? "?" : "&") + "end=" + end;
      }
      var canceller = $q.defer();
      var promise = $http.get(bgpAPI + "/prefixes/"+prefix+parameters, { timeout: canceller.promise })
        .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject("Failed to get AS paths history (request might have been cancelled) - prefix="+prefix);
        });

      return { promise: promise, cancel: cancel(canceller) };
    }
  };
}]);