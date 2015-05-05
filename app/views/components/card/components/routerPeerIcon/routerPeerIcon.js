'use strict';

angular.module('bmp.components.card')

  .directive('bmpCardRouterPeerIcon', function () {
    return  {
      templateUrl: "views/components/card/components/routerPeerIcon/routerPeerIcon.html",
      restrict: 'AE',
      replace: 'true',
      scope: {
        data: '=?'       //data to pass to card controller
      },
      link: function(scope) {

        console.log(scope);

        if(scope.data === undefined){
          scope.data = {};
          scope.data.RouterName= "1.1.1.1";
          scope.data.RouterIP= "test";
          scope.data.PeerName= "hmmm";
          scope.data.peerFullIp= "oooo";
        }

        scope.wordCheck = function(word){
          if(word.length > 13){
            return word.slice(0,10) + " ...";
          }else{
            return word;
          }
        };

      }
    }
  });
