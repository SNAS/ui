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
 	'ui.router'
 	])
 .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
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
	 		templateUrl: 'views/container/containerDirective.html',
	 		data: {
	 			requireLogin: true
	 		}
	 	})
		 	.state('app.dashboards', {
		 		abstract: true,
		 		template: '<div ui-view></div>'
		 	})
			 	.state('app.dashboards.worldWatch', {
			 		url: '/world-watch',
			 		templateUrl: 'views/worldWatch/worldWatch.html',
			 		controller: 'WorldWatchController'
			 	})

			.state('app.details', {
		 		abstract: true,
		 		template: '<div ui-view></div>'
		 	})
			 	.state('app.details.peerAnalysis', {
			 		url: '/peer-analysis',
			 		templateUrl: 'views/peerAnalysis/peerAnalysis.html',
			 		controller: 'PeerAnalysisController'
			 	})
			 	.state('app.details.asAnalysis', {
			 		url: '/as-analysis',
			 		templateUrl: 'views/asAnalysis/asAnalysis.html',
			 		controller: 'ASAnalysisController'
			 	})
			 	.state('app.details.aggregationAnalysis', {
			 		url: '/aggregation-analysis',
			 		templateUrl: 'views/aggregationAnalysis/aggregationAnalysis.html',
			 		controller: 'AggregationAnalysisController'
			 	})
			 	.state('app.details.prefixAnalysis', {
			 		url: '/prefix-analysis',
			 		templateUrl: 'views/prefixAnalysis/prefixAnalysis.html',
			 		controller: 'PrefixAnalysisController'
			 	})
			 	.state('app.details.whoIs', {
			 		url: '/pwho-is',
			 		templateUrl: 'views/whoIs/whoIs.html',
			 		controller: 'WhoIsController'
			 	})

		 	.state('app.admin', {
		 		abstract: true,
        template: '<div ui-view></div>'
		 	})
			 	.state('app.admin.collectionServer', {
			 		url: '/collection-server',
			 		templateUrl: 'views/collectionServer/collectionServer.html',
			 		controller: 'CollectionServerController'
			 	})
			 	.state('app.admin.preferences', {
			 		url: '/preferences',
			 		templateUrl: 'views/preferences/preferences.html',
			 		controller: 'PreferencesController'
			 	});
}])
.run(function ($rootScope, $state, $cookies) {
	$rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
	    var requireLogin = toState.data.requireLogin;
	    if (requireLogin && typeof $cookies.username === 'undefined') {
	    	event.preventDefault();
	    	$state.transitionTo('login');
    	}
  });
});
