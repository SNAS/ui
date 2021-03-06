'use strict';

/**
 * @ngdoc overview
 * @name bmpUiApp
 * @description
 * # bmpUiApp
 *
 * Main module of the application.
 */
var bmpUiApp = angular
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
    'ui.grid.pagination',
    'ui.grid.edit',
    'bmp.components.authentication',
    'bmp.components.cardList',
    'bmp.components.card',
    'bmp.components.loading',
    'bmp.components.asnModel',
    'bmp.components.prefixTooltip',
    'ui.bootstrap',
    'bgDirectives',
    'leaflet-directive',
    'bmp.components.map',
    'angular-loading-bar',
    'bmp.components.table'
  ])
  .provider('ConfigService', function () {
    var options = {};
    this.config = function (opt) {
      angular.extend(options, opt);
    };

    this.$get = [function () {
      if (!options) {
        throw new Error('Config options must be configured');
      }

      return options;
    }];
  })
  .config(function ($stateProvider, $urlRouterProvider, $logProvider) {
    $urlRouterProvider.otherwise("/login");
    $logProvider.debugEnabled(false);
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
      .state('app.tops', {
        url: '/tops',
        templateUrl: 'views/tops/tops.html'
      })
      .state('app.asView', {
        url: '/AS-view?:as?',
        templateUrl: 'views/asView/asView.html'
      })
      .state('app.linkState', {
        url: '/link-state-view',
        templateUrl: 'views/linkState/linkState.html'
      })
      .state('app.networkView', {
        url: '/network-view',
        templateUrl: 'views/orrView/orrView.html'
      })
      //.state('app.peerAnalysis', {
      //  url: '/peer-analysis',
      //  templateUrl: 'views/peeranalysis/peeranalysis.html'
      //})
      .state('app.atlas', {
        url: '/atlas',
        templateUrl: 'views/atlas/atlas.html'
      })
      .state('app.asAnalysis', {
        url: '/AS-analysis',
        templateUrl: 'views/asAnalysis/asAnalysis.html'
      })
      .state('app.prefixAnalysis', {
        url: '/prefix-analysis?:prefix?',
        params: {
          'p': 'defaultPrefix',
          'type': 'defaultType',
          'peer': 'defaultPeer',
          'startTime': 'defaultStartTimestamp',
          'endTime': 'defaultEndTimestamp',
          'limitForUpdates': 'defaultLimitForUpdates',
          'limitForWithdraws': 'defaultLimitForWithdraws'
        },
        templateUrl: 'views/prefixanalysis/prefixanalysis.html'
      })
      .state('app.whoIs', {
        url: '/whois?:as?',
        templateUrl: 'views/whois/whois.html'
      })
      .state('app.lookingGlass', {
        url: '/looking-glass',
        templateUrl: 'views/lookingGlass/lookingGlass.html'
      })
      .state('app.aggregationAnalysis', {
        url: '/aggregation-analysis?:as?',
        templateUrl: 'views/aggregationanalysis/aggregationanalysis.html'
      })
      .state('app.securityAnalysis', {
        url: '/security-analysis?:as?',
        templateUrl: 'views/securityAnalysis/securityAnalysis.html'
      })
      .state('app.adminView',{
        url: '/admin',
        templateUrl: 'views/adminView/adminView.html'
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


// manually bootstrap the app when the document is ready and both config files have been loaded
function bootstrapApplication() {
  angular.element(document).ready(function() {
    angular.bootstrap(document, ["bmpUiApp"]);
  });
}

// load config files in a specific order before bootstrapping the web app
(function loadConfigFilesAndBootstrapTheApp() {
  var initInjector = angular.injector(["ng"]);
  var $http = initInjector.get("$http");
  $http.get('conf/config.json')
    .then(function(json) {

      bmpUiApp.config(['ConfigServiceProvider', function (ConfigServiceProvider) {
        ConfigServiceProvider.config(json.data);

//        console.log("conf/config.json loaded successfully", json.data);
      }]);

      bootstrapApplication();
    });
}());
