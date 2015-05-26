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
    'ui.grid.autoResize',
    'ui.grid.resizeColumns',
    'bmp.components.cardList',
    'bmp.components.card',
    'bmp.components.loading',
    'ui.bootstrap',
    'bgDirectives',
    'leaflet-directive',
    'bmp.components.map'
  ])
  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'views/Login/login.html',
        controller: 'LoginController',
        data: {
          requireLogin: false
        }
      })

      //CARD TEST
      .state('app.card', {
        url: '/card',
        templateUrl: 'views/cardTest/cardTest.html',
        controller: 'CardController',
        data: {
          requireLogin: false
        }
      })

      .state('app.cardChange', {
        url: '/cardC',
        templateUrl: 'views/cardChanges/cardChanges.html',
        controller: 'CardChangesController',
        data: {
          requireLogin: false
        }
      })
      //END CARD TEST

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
        templateUrl: 'views/globalView/globalView.html'
      })
      .state('app.peerView', {
        url: '/peer-view',
        templateUrl: 'views/peerView/peerView.html'
      })
      .state('app.asView', {
        url: '/AS-view?:as?',
        templateUrl: 'views/asView/asView.html'
      })
      .state('app.linkState', {
        url: '/link-state-view',
        templateUrl: 'views/linkState/linkState.html'
      })
      .state('app.orrView', {
        url: '/orr-view',
        templateUrl: 'views/orrView/orrView.html'
      })
      .state('app.peerAnalysis', {
        url: '/peer-analysis',
        templateUrl: 'views/peeranalysis/peeranalysis.html'
      })
      .state('app.asAnalysis', {
        url: '/AS-analysis',
        templateUrl: 'views/asAnalysis/asAnalysis.html'
      })
      .state('app.prefixAnalysis', {
        url: '/prefix-analysis?:prefix?',
        templateUrl: 'views/prefixanalysis/prefixanalysis.html'
      })
      .state('app.whoIs', {
        url: '/whois?:as?',
        templateUrl: 'views/whois/whois.html'
      })
      .state('app.collectionServer', {
        url: '/collection-server',
        templateUrl: 'views/collectionServer/collectionServer.html'

      })
      .state('app.preferences', {
        url: '/preferences',
        templateUrl: 'views/preferences/preferences.html',
        controller: 'PreferencesController'
      })
      .state('app.aggregationAnalysis', {
        url: '/aggregation-analysis?:as?',
        templateUrl: 'views/aggregationanalysis/aggregationanalysis.html'
      })

      //DUAL WINDOW MODE ENAGAAAGE
      .state('app.dualWindow', {
        templateUrl: 'views/dual/dual.html'
      })
      .state('app.dualWindow.contents', {
        url: '/:a/:b',
        views: {
          'top': {
            templateUrl: function ($stateParams){
                return 'views/' + $stateParams.a + '/' + $stateParams.a + '.html';
            }
          },
          'bottom': {
            templateUrl: function ($stateParams){
              if($stateParams.b)
                return 'views/' + $stateParams.b + '/' + $stateParams.b + '.html';
            }
          }
        }
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
