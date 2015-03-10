'use strict';

/**
 * @ngdoc overview
 * @name bmpUiApp
 * @description
 * # bmpUiApp
 *
 * Main module of the application.
 */
 angular
 .module('bmpUiApp', [
 	'ngAnimate',
 	'ngCookies',
 	'ngResource',
 	'ngRoute',
 	'ngSanitize',
 	'ngTouch',
 	'ui.router',
  'nvd3',
  'ui.grid',
  'ui.grid.selection',
 	'uiGmapgoogle-maps'
 	])
 .config(function ($stateProvider, $urlRouterProvider, uiGmapGoogleMapApiProvider) {
 	$urlRouterProvider.otherwise("/login");

 	$stateProvider
	 	.state('login', {
	 		url: '/login',
	 		templateUrl: 'views/login/login.html',
	 		controller: 'LoginController',
	 		data: {
	 			requireLogin: false
	 		}
	 	})
	 	.state('app', {
	 		abstract: true,
	 		templateUrl: 'views/container/container.html',
	 		controller: 'MainController',
	 		data: {
	 			requireLogin: true
	 		}
	 	})
		 	.state('app.globalView', {
		 		url: '/global-view',
		 		templateUrl: 'views/globalView/globalView.html',
		 		controller: 'GlobalViewController'
		 	})
			.state('app.summary', {
				url: '/summary',
				templateUrl: 'views/summary/summary.html',
				controller: 'SummaryController'
			})
		 	.state('app.peerAnalysis', {
		 		url: '/peer-analysis',
		 		templateUrl: 'views/peerAnalysis/peerAnalysis.html',
		 		controller: 'PeerAnalysisController'
		 	})
		 	.state('app.asAnalysis', {
		 		url: '/as-analysis',
		 		templateUrl: 'views/asAnalysis/asAnalysis.html',
		 		controller: 'ASAnalysisController'
		 	})
		 	.state('app.aggregationAnalysis', {
		 		url: '/aggregation-analysis',
		 		templateUrl: 'views/aggregationAnalysis/aggregationAnalysis.html',
		 		controller: 'AggregationAnalysisController'
		 	})
		 	.state('app.prefixAnalysis', {
		 		url: '/prefix-analysis',
		 		templateUrl: 'views/prefixAnalysis/prefixAnalysis.html',
		 		controller: 'PrefixAnalysisController'
		 	})
		 	.state('app.whoIs', {
		 		url: '/who-is',
		 		templateUrl: 'views/whoIs/whoIs.html',
		 		controller: 'WhoIsController'
		 	})
		 	.state('app.collectionServer', {
		 		url: '/collection-server',
		 		templateUrl: 'views/collectionServer/collectionServer.html',
		 		controller: 'CollectionServerController'

		 	})
		 	.state('app.preferences', {
		 		url: '/preferences',
		 		templateUrl: 'views/preferences/preferences.html',
		 		controller: 'PreferencesController'
		 	});

	uiGmapGoogleMapApiProvider.configure({
        //    key: 'your api key',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });
})
.run(function ($rootScope, $state, $cookies) {
	$rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
	    var requireLogin = toState.data.requireLogin;
	    if (requireLogin && typeof $cookies.username === 'undefined') {
	    	event.preventDefault();
	    	$state.transitionTo('login');
    	}
  });
});
