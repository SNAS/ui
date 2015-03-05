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
        return $http.get("http://ipinfo.io/" + ip + '/geo');
    };

    return apiFactory;
});