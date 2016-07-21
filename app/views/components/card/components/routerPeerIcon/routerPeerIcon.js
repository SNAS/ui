'use strict';

angular.module('bmp.components.card')
  .directive('bmpCardRouterPeerDiagram', function (apiFactory) {
    return {
      templateUrl: "views/components/card/components/routerPeerIcon/routerPeerIcon.html",
      restrict: 'AE',
      replace: 'true',
      scope: {
        data: '=?'       //data to pass to card controller
      },
      link: function (scope) {

        var default_dat = "No data";
        if (scope.data === undefined) {
          scope.data = {};
          scope.data.RouterName = default_dat;
          scope.data.RouterIP = default_dat;
          scope.data.RouterASN = default_dat;
          scope.data.PeerName = default_dat;
          scope.data.PeerIP = default_dat;
          scope.data.PeerASN = default_dat;
        }

        if ((scope.data.RouterASN > 64512 && scope.data.RouterASN <= 65534) || (scope.data.RouterASN > 4200000000 && scope.data.RouterASN <= 4294967294)) {
          scope.RouterASName = "Private AS";
        }
        else {
          apiFactory.getWhoIsASN(scope.data.RouterASN).success(function (result) {
            scope.RouterAS = result.gen_whois_asn.data[0];
            scope.RouterASName = scope.RouterAS ? scope.RouterAS.as_name : "UNKNOWN";
          });
        }

        scope.simplifyCapabs = {
          'MPBGP(1) : afi=2 safi=1 : Unicast IPv6': 'IPv6',
          'MPBGP(1) : afi=1 safi=1 : Unicast IPv4': 'IPv4',
          'MPBGP (1) : afi=1 safi=2 : Multicast IPv4': 'M-IPv4',
          'Route Refresh Old (128)': 'RRO',
          'Route Refresh (2)': 'RR',
          'Graceful Restart (64)': 'GR',
          '4 Octet ASN (65)': '4Octet'
        };

        if ((scope.data.PeerASN > 64512 && scope.data.PeerASN <= 65534) || (scope.data.PeerASN > 4200000000 && scope.data.PeerASN <= 4294967294)) {
          scope.PeerASName = "Private AS";
        }
        else {
          apiFactory.getWhoIsASN(scope.data.PeerASN).success(function (result) {
            scope.PeerAS = result.gen_whois_asn.data[0];
            scope.PeerASName = scope.PeerAS ? scope.PeerAS.as_name : "UNKNOWN";
          });
        }

        apiFactory.getPeerByHashId(scope.data.peer_hash_id).success(function (temp) {
          var p = temp.v_peers.data[0];
          var recvCapabs = p.RecvCapabilities.replace(' ', '').split(',');
          var sentCapabs = p.SentCapabilities.replace(' ', '').split(',');
          scope.enabledCapabs = [];
          angular.forEach(recvCapabs, function (capability) {
            if (recvCapabs != '') {
              var match = false;
              if (sentCapabs.indexOf(capability) > -1)
                match = true;
              if (match)
                if (!scope.enabledCapabs.indexOf(capability) > -1)
                  scope.enabledCapabs.push(capability.trim());
            }
          });
        });

        // if (scope.data.isPrePolicy == 0 && scope.data.PeerBGPId == '0.0.0.0' &&
        //   scope.data.PeerIP == '0.0.0.0') {
        //   scope.pseudoPeer = true;
        // }
        console.log(scope.data)

        scope.sameASN = scope.data.RouterASN == scope.data.PeerASN;
        if (scope.sameASN) {
          scope.outerBorder = {'border': '1px solid #A7A7A7'};
          scope.innerBorder = {};
        }
        else {
          scope.innerBorder = {'border': '1px solid #A7A7A7'};
          scope.outerBorder = {};
        }

        scope.routerIcon = "bmp-ebgp_router10-17";
        scope.colour = "#EAA546";
        if (scope.data.RouterASN == scope.data.PeerASN) {
          scope.routerIcon = "bmp-ibgp_router10-17";
          scope.colour = "#7bad85";
        }

      }
    }
  });
