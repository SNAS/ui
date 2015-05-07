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

        var default_dat = "No data";
        if(scope.data === undefined){
          scope.data = {};
          scope.data.RouterName= default_dat;
          scope.data.RouterIP= default_dat;
          scope.data.PeerName= default_dat;
          scope.data.peerFullIp= default_dat;
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
