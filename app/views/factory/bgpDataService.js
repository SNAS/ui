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

  function stringifyParameters(parameters) {
    var options = [];
    for (var key in parameters) {
      if (parameters.hasOwnProperty(key)) {
        options.push(key + "=" + parameters[key]);
      }
    }
    return options.length === 0 ? "" : "?" + options.join("&");
  }

  return {
    getASList: function(orderBy, orderDir, limit, offset) {
      var canceller = $q.defer();
      // get the AS list from the BGP data service
      var promise = $http.get(bgpAPI + "/as?orderBy="+orderBy+"&orderDir="+orderDir+"&limit="+limit+"&offset="+offset, { cache: true }, { timeout: canceller.promise })
        .then(function(response) {
          return response.data;
        }, function(response) {
          //          console.error("Failed to get AS list", response);
          return $q.reject("Failed to get AS list");
        })
        .catch(function(e) {
          //          console.error("Failed to get AS list", e);
          return $q.reject("Failed to get AS list");
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
      var promise = $http.get(bgpAPI + "/as/" + asn + parameters, { cache: true }, { timeout: canceller.promise })
        .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject("Failed to get AS info - as=" + asn);
        });
      return { promise: promise, cancel: cancel(canceller) };
    },
    getASLinks: function(asn, end) {
      var canceller = $q.defer();
      var promise = $http.get(bgpAPI + "/links/" + asn + (end !== undefined ? "?end=" + end : ""), { timeout: canceller.promise })
        .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject("Failed to get AS links - as=" + asn);
        });
      return { promise: promise, cancel: cancel(canceller) };
    },
    getASStats: function(asn, start, end) {
      return $http.get(bgpAPI + "/as/stats/" + asn + "?start=" + start + "&end=" + end);
    },
    getLinkStats: function(source, target, end) {
      return $http.get(bgpAPI + "/link/stats/" + source + "/" + target + (end !== undefined ? "?end=" + end : ""));
    },
    getASPaths: function(asn, parameters) {
      var options = stringifyParameters(parameters);
      var canceller = $q.defer();
      var promise = $http.get(bgpAPI + "/aspaths/" + asn + options, { cache: true }, { timeout: canceller.promise })
        .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject("Failed to get AS paths for as=" + asn + " - (" + response.statusText + ") " + response.data);
        });

      return { promise: promise, cancel: cancel(canceller) };
    },
    getASPathsHistory: function(asn, parameters) {
      var options = stringifyParameters(parameters);
      var canceller = $q.defer();
      var promise = $http.get(bgpAPI + "/aspaths/hist/" + asn + options, { cache: true }, { timeout: canceller.promise })
        .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject("Failed to get AS paths history - as=" + asn);
        });

      return { promise: promise, cancel: cancel(canceller) };
    },
    getPrefixInfo: function(prefix, parameters) {
      var options = stringifyParameters(parameters);
      var canceller = $q.defer();
      var promise = $http.get(bgpAPI + "/prefixes/" + prefix + options, { cache: true }, { timeout: canceller.promise })
        .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject("Failed to get AS paths history - prefix=" + prefix);
        });

      return { promise: promise, cancel: cancel(canceller) };
    },
    getASHistInfo: function(as, parameters) {
      var options = stringifyParameters(parameters);
      var canceller = $q.defer();
      var promise = $http.get(bgpAPI + "/as/hist/" + as + options, { cache: true }, { timeout: canceller.promise })
        .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject("Failed to get AS history - as=" + as);
        });

      return { promise: promise, cancel: cancel(canceller) };
    },
    getLinkHistInfo: function(startAS, endAS, start, end) {
      var parameters = "";
      if (start !== undefined) {
        parameters = "?start=" + start;
      }
      if (end !== undefined) {
        parameters += (parameters.length === 0 ? "?" : "&") + "end=" + end;
      }
      var canceller = $q.defer();
      var promise = $http.get(bgpAPI + "/links/hist/" + startAS + "/" + endAS + parameters, { cache: true }, { timeout: canceller.promise })
        .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject("Failed to get AS link history - startAS=" + startAS + " - endAS=" + endAS);
        });

      return { promise: promise, cancel: cancel(canceller) };
    },
    getAnomaliesTypes: function() {
      var canceller = $q.defer();
      var promise = $http.get(bgpAPI + "/anomalies/overview/list", { cache: false }, { timeout: canceller.promise })
        .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject("Failed to get anomalies overview list");
        });

      return { promise: promise, cancel: cancel(canceller) };
    },
    // parameters is a json object with the following fields: anomaliesType, exportType, start, end, peer_as
    getAnomalyOverview: function(parameters) {
      var options = stringifyParameters(parameters);
      // get the types of anomalies and perform parallel requests
      var canceller = $q.defer();
      var promise = $http.get(bgpAPI + "/anomalies/overview/" + parameters.anomaliesType + options, { cache: true }, { timeout: canceller.promise })
        .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject("Failed to get anomalies overview data for " + parameters.anomaliesType + "");
        });
      return { promise: promise, cancel: cancel(canceller) };
    },
    getAnomalies: function(parameters) {
      // parameters is a json object with the following fields: anomaliesType, exportType, start, end
      // allowed anomaliesType: "martians", "prefixLength" (mandatory parameter: no default value)
      // allowed exportType: "json" (default), "csv"
      if (parameters.exportType === undefined || parameters.exportType === "json") {
        parameters.exportType = "";
      }
      var options = stringifyParameters(parameters);

      var canceller = $q.defer();
      var query = bgpAPI + "/anomalies/" + parameters.anomaliesType + "/" + options;//parameters.exportType + timestamps;
      console.debug("anomalies query", query);
      var promise = $http.get(query, { cache: true }, { timeout: canceller.promise })
        .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject("Failed to get anomalies " + parameters.anomaliesType + " data");
        });
      return { promise: promise, cancel: cancel(canceller) };
    },
    getAnomaliesAPI: function(parameters, exportType) {
      if (exportType !== undefined) {
        parameters.export_type = exportType;
      }
      var options = stringifyParameters(parameters);
      return bgpAPI + "/anomalies/" + parameters.anomaliesType + "/" + options;
    },
    getGroundTruthHash: function(timestamp) {
      var timestamps = "";
      if (timestamp !== undefined) {
        timestamps = "?timestamp=" + timestamp;
      }

      var canceller = $q.defer();
      var query = bgpAPI + "/anomalies/ground_truth/" + timestamps;
      var promise = $http.get(query, { cache: false }, { timeout: canceller.promise })
        .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject("Failed to get anomalies' ground truth hash " + parameters.anomaliesType + " data");
        });
      return { promise: promise, cancel: cancel(canceller) };
    },
    // parameters is a json object with the following optional fields: orderBy, orderDir, limit, offset
    getASPathsBetweenASNumbers: function(asn1, asn2, parameters) {
      var options = [];
      if (parameters.orderBy !== undefined) {
        options.push("orderBy=" + parameters.orderBy);

        if (parameters.orderDir !== undefined) {
          options.push("orderDir=" + parameters.orderDir);
        }
      }
      if (parameters.limit !== undefined) {
        options.push("limit=" + parameters.limit);

        if (parameters.offset !== undefined) {
          options.push("offset=" + parameters.offset);
        }
      }

      options = options.length === 0 ? "" : "?" + options.join("&");
      var canceller = $q.defer();
      var promise = $http.get(bgpAPI + "/aspaths/" + asn1 + "/" + asn2 + options, { cache: false }, { timeout: canceller.promise })
        .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject("Failed to get AS paths between AS " + asn1 + " and AS " + asn2);
        });
      return { promise: promise, cancel: cancel(canceller) };
    },
    // parameters is a json object with the following optional fields: orderBy, orderDir, limit, offset
    getASPathsHistoryBetweenASNumbers: function(asn1, asn2, parameters) {
      var options = [];
      if (parameters.orderBy !== undefined) {
        options.push("orderBy=" + parameters.orderBy);

        if (parameters.orderDir !== undefined) {
          options.push("orderDir=" + parameters.orderDir);
        }
      }
      if (parameters.limit !== undefined) {
        options.push("limit=" + parameters.limit);

        if (parameters.offset !== undefined) {
          options.push("offset=" + parameters.offset);
        }
      }

      options = options.length === 0 ? "" : "?" + options.join("&");
      var canceller = $q.defer();
      var promise = $http.get(bgpAPI + "/aspaths/hist/" + asn1 + "/" + asn2 + options, { cache: false }, { timeout: canceller.promise })
        .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject("Failed to get AS paths history between AS " + asn1 + " and AS " + asn2);
        });
      return { promise: promise, cancel: cancel(canceller) };
    }
  };
}]);
