'use strict';

angular.module('bmp.components.card')

  .controller('BmpCardPeerController', ["$scope", "apiFactory", "timeFactory", "cardFactory", "uiGridFactory", "countryConversionFactory",
    function ($scope, apiFactory, timeFactory, cardFactory, uiGridFactory, countryConversionFactory) {

    //  PEER DATA
    //  {
    //  "RouterName":"csr1.openbmp.org",     //  "RouterIP":"173.39.209.78",
    //  "LocalIP":"192.168.255.32",          //  "LocalPort":17404,
    //  "LocalASN":65000,                    //  "LocalBGPId":"192.168.255.32",
    //  "PeerName":"lo-0.edge5.Washington1.Level3.net",
    //  "PeerIP":"4.68.1.197",               //  "PeerPort":179,
    //  "PeerASN":3356,                      //  "PeerBGPId":"4.68.1.197",
    //  "LocalHoldTime":180,                 //  "PeerHoldTime":90,
    //  "isUp":1,                            //  "isBMPConnected":1,
    //  "isPeerIPv4":1,                      //  "isPeerVPN":0,
    //  "isPrePolicy":1,                     //  "LastBMPReasonCode":null,
    //  "LastDownCode":0,                    //  "LastdownSubCode":0,
    //  "LastDownMessage":null,              //  "LastDownTimestamp":null,
    //  "SentCapabilities":"MPBGP (1) : afi=1 safi=1 : Unicast IPv4, Route Refresh Old (128), Route Refresh (2), Route Refresh Enhanced (70), 4 Octet ASN (65)",
    //  "RecvCapabilities":"MPBGP (1) : afi=1 safi=1 : Unicast IPv4, Route Refresh (2), Route Refresh Old (128), Graceful Restart (64), 4 Octet ASN (65)",
    //  "peer_hash_id":"c33f36c12036e98d89ae3ea54cce0be2",
    //  "router_hash_id":"0314f419a33ec8819e78724f51348ef9"
    // }


    window.GPEERSCO = $scope;

    //peer stuff here
    var peerPrefix;
    $scope.ribData = [
      ["Pre Rib", 0, "bmp-prerib"],
      ["Post Rib", 0, "bmp-postrib"]
    ];
    $scope.filterRate = 0.00;

    apiFactory.getPeerPrefixByHashId($scope.data.peer_hash_id).
      success(function (result) {
        peerPrefix = result.v_peer_prefix_report_last.data;
        //atm this grabs first data item (may not be correct)
        try {
          $scope.ribData[0][1] = peerPrefix[0].Pre_RIB;
          $scope.ribData[1][1] = peerPrefix[0].Post_RIB;

          if (peerPrefix[0].Post_RIB == peerPrefix[0].Pre_RIB)
            $scope.filerRate = 0.00;
          else
            $scope.filterRate = Math.floor(((1 - (peerPrefix[0].Post_RIB / peerPrefix[0].Pre_RIB) ) * 100) * 100) / 100;
        } catch (err) {
          //catch if RIB is undefined
        }
      }).
      error(function (error) {
        console.log(error.message);
      });

    $scope.summaryGridInitHeight = 300;

    $scope.summaryPeerOptions = {
      //summaryGridIsLoad: true,
      height: $scope.summaryGridInitHeight,
      enableRowSelection: true,
      enableRowHeaderSelection: false,
      enableHorizontalScrollbar: 0,
      enableVerticalScrollbar: 1,
      showGridFooter: true,
      rowTemplate: '<div class="hover-row-highlight"><div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div></div>',
      columnDefs: [
        {
          name: "asn", displayName: 'AS Number', width: '*',
          cellTemplate: '<div class="ui-grid-cell-contents asn-clickable"><div bmp-asn-model asn="{{ COL_FIELD }}"></div></div>'
        },
        {name: "as_name", displayName: 'AS Name', width: '*'},
        {name: "org_name", displayName: 'Organization', width: '*'}
      ]
    };
    var summaryPeerOptionsDefaultData = [{"as_name": "-", "asn": "-", "org_name": "-"}];

    $scope.summaryPeerOptions.multiSelect = false;
    $scope.summaryPeerOptions.modifierKeysToMultiSelect = false;
    $scope.summaryPeerOptions.noUnselect = false;

    $scope.summaryPeerOptions.onRegisterApi = function (gridApi) {
      $scope.summaryPeerOptionsApi = gridApi;
    };

    $scope.summaryPeerOptions.gridIsLoading = true;

    //DownstreamAS, as_name, and org_name (working)
    $scope.loadDownStream = function () {
      $scope.summaryPeerOptions.summaryGridIsLoad = true;
      $scope.peerDownData = [];
      apiFactory.getPeerDownStream($scope.data.peer_hash_id).
        success(function (result) {
          if (result.downstreamASN.size == 0) {
            $scope.summaryPeerOptions.data = [];
            $scope.summaryPeerOptions.showGridFooter = false;
          } else {
            $scope.summaryPeerOptions.data = result.downstreamASN.data;
            uiGridFactory.calGridHeight($scope.summaryPeerOptions, $scope.summaryPeerOptionsApi);
            $scope.summaryPeerOptions.showGridFooter = true;
          }
          $scope.summaryPeerOptions.summaryGridIsLoad = false; //stop loading

        }).
        error(function (error) {
          console.log(error.message);
        });
    };
    $scope.loadDownStream();

    if ($scope.data.isUp) {
      $scope.peerTimeText = "Peer Up Time";
      $scope.peerTime = timeFactory.calTimeFromNow($scope.data.LastModified);
    } else {
      $scope.peerTimeText = "Peer Down Time";
      $scope.peerTime = timeFactory.calTimeFromNow($scope.data.LastDownTimestamp);
    }

    $scope.fullIp = function (ip, port) {
      if (ip.indexOf("." != -1)) {
        //is ipv4 so add ' :<port>'
        return ip + ":" + port;
      } else {
        //is ipv6 so add ' <port>'
        return ip + " " + port;
      }
    };

    $scope.rpDiagramData = {};

    for(var attrname in $scope.data){
      $scope.rpDiagramData[attrname] = $scope.data[attrname];
    }

    $scope.rpDiagramData.RouterASN = $scope.data.LocalASN;

    $scope.locationInfo = cardFactory.createLocationTable({
      stateprov: $scope.data.stateprov,
      city: $scope.data.city,
      country: countryConversionFactory.getName($scope.data.country),
      type: $scope.data.type
    });

  }]);
