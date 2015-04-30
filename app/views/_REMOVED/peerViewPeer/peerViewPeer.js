'use strict';

angular.module('bmp.components.card')

.controller('BmpCardPeerPeerController', ["$scope", "apiFactory", "$timeout", function ($scope, apiFactory, $timeout) {
    window.SCOPEZ = $scope;

    //This can probably be moved so dont repeat.
    var createLocationTable = function(){
      if ($scope.data.stateprov !== undefined || $scope.data.city !== undefined || $scope.data.country !== undefined) {
        var type;
        if ($scope.cardType == "global.router") {
          type = "BMP Router";
        } else if ($scope.cardType == "global.peer") {
          type = "Peer";
        } else {
          type = "None";
        }
        $scope.locationInfo = (
        '<table class="routerLoc">' +
        ' <tr>' +
        '   <td>Type</td>' +
        '   <td>' + type + '</td>' +
        ' </tr>' +
        ' <tr>' +
        '   <td>Location</td>' +
        '   <td>' + $scope.data.City + '</td>' +
        ' </tr>' +
        ' <tr>' +
        '   <td>State</td>' +
        '   <td>' + $scope.data.State + '</td>' +
        ' </tr>' +
        ' <tr>' +
        '   <td>Country</td>' +
        '   <td>' + $scope.data.Country + '</td>' +
        ' </tr>' +
        '</table>'
        );
      } else {
        //DEFAULT Data
        $scope.locationInfo = "<table class='routerLoc noRouterLoc'><tr><td>There is no Location Data ...</td></tr></table>";
      }
    };

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

    //peer stuff here
    var peerPrefix;
    $scope.ribData = [
      ["Pre Rib", 0],
      ["Post Rib", 0]
    ];
    apiFactory.getPeerPrefixByHashId($scope.data.peer_hash_id).
      success(function (result){
        peerPrefix = result.v_peer_prefix_report_last.data;
        //atm this grabs first data item (may not be correct)
        try{
          $scope.ribData[0][1] = peerPrefix[0].Pre_RIB;
          $scope.ribData[1][1] = peerPrefix[0].Post_RIB;
        }catch(err){
          //catch if RIB is undefined
        }
      }).
      error(function (error){
        console.log(error.message);
      });


    //Redraw Tables when menu state changed
    $scope.$on('menu-toggle', function(thing, args) {
      $timeout( function(){
        $scope.peerViewPeerApi.core.handleWindowResize();
        $scope.ribGridApi.core.handleWindowResize();
      }, 550);
    });

    $scope.peerViewPeerOptions = {
      enableRowSelection: true,
      enableRowHeaderSelection: false
    };

    $scope.peerViewPeerOptions.columnDefs = [
      {name: "DownstreamAS", displayName: 'AS Number', width: '*'},
      {name: "as_name", displayName: 'AS Name', width: '*'},
      {name: "org_name", displayName:'Organization', width: '*'}
    ];
    var peerViewPeerDefaultData = [{"as_name":"-"},{"DownstreamAS":"-"},{"org_name":"-"}];
    $scope.peerViewPeerOptions.onRegisterApi = function (gridApi) {
      $scope.peerViewPeerApi= gridApi;
    };

    $scope.$watch('cardExpand', function(val) {
      if($scope.cardExpand == true){
        setTimeout(function(){
          //$scope.peerViewPeerApi.core.handleWindowResize();
          $scope.calGridHeight($scope.peerViewPeerOptions, $scope.peerViewPeerApi);
        },10)
      }
    });

    $scope.downStreamTab = function(){
      $scope.peerViewPeerApi.core.handleWindowResize();
    };


    $scope.calGridHeight = function(grid, gridapi){
      gridapi.core.handleWindowResize();

      var height;
      if(grid.data.length > 10){
        height = ((10 * 30) + 30);
      }else{
        height = ((grid.data.length * 30) + 50);
      }
      grid.changeHeight = height;
      gridapi.grid.gridHeight = grid.changeHeight;
    };

    //DownstreamAS, as_name, and org_name (working)
    $scope.peerDownData = [];
    apiFactory.getPeerDownStream($scope.data.peer_hash_id).
      success(function (result){
        //var peerDown
        if(result.peerDownstreamASN.data.length == 0){
          $scope.peerViewPeerOptions.data = peerViewPeerDefaultData;
        }else {
          $scope.peerViewPeerOptions.data = result.peerDownstreamASN.data;
        }
        $scope.peerViewPeerApi.core.handleWindowResize();
      }).
      error(function (error){
        console.log(error.message);
      });


    $scope.downTime = ($scope.data.LastDownTimestamp === null)? "Up":$scope.data.LastDownTimestamp;

    $scope.peerFullIp = $scope.data.PeerIP;
    if($scope.data.isPeerIPv4 == "1"){
      //is ipv4 so add ' :<port>'
      $scope.peerFullIp = $scope.data.PeerIP + " :" + $scope.data.PeerPort;
    }


    //  "RouterName": "csr1.openbmp.org",
    //  "PeerName": "lo-0.edge5.Washington1.Level3.net",
    //  "Prefix": "216.40.30.0",
    //  "PrefixLen": 23,
    //  "Origin": "igp",
    //  "Origin_AS": 4306,
    //  "MED": 0,
    //  "LocalPref": 0,
    //  "NH": "4.68.1.197",
    //  "AS_Path": " 3356 3257 4436 4436 4436 4436 6450 4306",
    //  "ASPath_Count": 8,
    //  "Communities": "3257:3257 3356:3 3356:22 3356:86 3356:575 3356:666 3356:2006",
    //  "ExtCommunities": "",
    //  "ClusterList": "",
    //  "Aggregator": "",
    //  "PeerAddress": "4.68.1.197",
    //  "PeerASN": 3356,
    //  "isPeerIPv4": "1",
    //  "isPeerVPN": "0",
    //  "LastModified": "2015-04-16 17:53:41"

    $scope.ribGridOptions = {
      enableRowSelection: true,
      enableRowHeaderSelection: false
    };
    //
    $scope.ribGridOptions.columnDefs = [
      {name: "Prefix", displayName: 'Prefix', width: "15%"},
      {name: "NH", displayName: 'NH', width: "15%"},
      {name: "AS_Path", displayName: 'AS Path'},
      {name: "MED", displayName: 'MED', width: "10%"},
      {name: "LocalPref", displayName: 'Local Pref', width: "10%"}
    ];

    $scope.ribGridOptions.multiSelect = false;
    $scope.ribGridOptions.noUnselect = true;
    $scope.ribGridOptions.modifierKeysToMultiSelect = false;
    $scope.ribGridOptions.rowTemplate = '<div ng-click="grid.appScope.ribGridSelection();" ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>';
    $scope.ribGridOptions.onRegisterApi = function (gridApi) {
      $scope.ribGridApi= gridApi;
    };

    $scope.getRibData = function() {
      apiFactory.getPeerRib($scope.data.peer_hash_id).
        success(function (result) {
          $scope.ribGridOptions.data = $scope.initalRibdata = result.v_routes.data;
          $scope.ribGridApi.core.handleWindowResize();
        }).
        error(function (error) {
          console.log(error.message);
        });
    };

    $scope.ribGridSelection = function(){
      $scope.values = $scope.ribGridApi.selection.getSelectedRows()[0];
      apiFactory.getPeerGeo($scope.values.Prefix).
        success(function (result) {
          $scope.values.geo = result.v_geo_ip.data[0];
        }).
        error(function (error) {
          console.log(error.message);
        });
    };


    createLocationTable();

    //--------------------------------------- SEARCH --------------------------------------------//

    //TODO - ATM IPV6 with XXXX:0:  not accepted need to add place to fill zero's

    //Loop through data selecting and altering relevant data.
    var searchValue = function (value, init) {
      if (value == "" || value == " ") {
        //when clear search populates origninal data.
        $scope.ribGridOptions.data = $scope.initalRibdata;
        return;
      }
      //used to determine which regex's to use ipv4 || ipv6
      var whichIp;

      var ipv4Regex = /\d{1,3}\./;
      var ipv6Regex = /([0-9a-fA-F]{4}\:)|(\:\:([0-9a-fA-F]{1,4})?)/;

      if(ipv4Regex.exec(value) != null){
        whichIp = 0;
      }else if(ipv6Regex.exec(value) != null){
        whichIp = 1;
      }else{
        //Entered Alphanumerics
        console.log('invalid search');
        return;
      }

      //regex[x][0] = ipv4 match's
      //regex[x][1] = ipv6 match's

      //regex[0] for matching whole ip with prefix  190.0.103.0/24
      //regex[1] for matching whole ip              190.0.103.0
      //regex[2] for matching part done ip's        190.0.

      var regexs = [
        [/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/(?:\d|[1-9]\d|1[0-1]\d|12[0-8])$/ , /^([0-9a-fA-F]{4}\:){7}[0-9a-fA-F]{4}\/[0-128]$/],
        [/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/ , /^([0-9a-fA-F]{4}\:){7}[0-9a-fA-F]{4}$/],
        [/^(\d{1,3}\.){0,2}\d{1,3}\.?$/ , /^([0-9a-fA-F]{4}\:){0,7}[0-9a-fA-F]{4}\:?$/]
      ];

      var fullIpWithPreLenReg = regexs[0][whichIp];
      var fullIpRegex = regexs[1][whichIp];
      var partCompIpRegex = regexs[2][whichIp];

      //IPV6 shorthand case
      if (whichIp) { //means its ipv6
        var colOccur = (value.match(/\:\:/g) || []).length;
        if (0 < colOccur < 2) {
          //one occurance of ::

          var ipv6Arr = value.split("::");

          var ipv6PartLenRegex = /[0-9a-fA-F]{4}/g;
          var ipv6PartCheckRegex = /^([0-9a-fA-F]{4}\:){0,5}[0-9a-fA-F]{4}$/;

          var len = 0;
          var check = [];
          for(var i = 0; i < ipv6Arr.length; i++){
            len += (ipv6Arr[i].match(ipv6PartLenRegex) || []).length;
            check.push(ipv6PartCheckRegex.exec(ipv6Arr[i]) != null);
          }

          if(len < 8 && check.indexOf(0) == -1){
            //valid ipv6 with ::
            value = ipv6ShortHand(value);
          }
        }
      }

      if (fullIpWithPreLenReg.exec(value) != null || partCompIpRegex.exec(value) != null) {
        console.log(value);
        //Full ip with prefix or partial ip
        apiFactory.getPeerRibPrefix($scope.data.peer_hash_id, value).
          success(function (result) {
            $scope.ribGridOptions.data = result.v_routes.data;
            $scope.calGridHeight($scope.ribGridOptions, $scope.ribGridApi);
          }).
          error(function (error) {
            console.log(error.message);
          });
      }else if(fullIpRegex.exec(value) != null){
        console.log(value);
        //full ip
        //pass in peer hash and the matched regex value
        apiFactory.getPeerRibLookup($scope.data.peer_hash_id,value).
          success(function (result) {
            $scope.ribGridOptions.data = result.v_routes.data;
            $scope.calGridHeight($scope.ribGridOptions, $scope.ribGridApi);
          }).
          error(function (error) {
            console.log(error.message);
          });
      }else{
        //Entered Alphanumerics
      }
    };

    //This take XXXX::XXXX:XXXX and turns into XXXX:0000:0000:0000:0000:0000:XXXX:XXXX
    var ipv6ShortHand = function(value) {
      var searchStr = value;
      var doblColIndex = value.indexOf("::");
      var zeroToAdd = 8 - ((value.match(/[0-9a-fA-F]{4}/g)) || []).length;

      //build the string of zero's
      var zeroStr = "";
      for (var i = 0; i < zeroToAdd - 1; i++) {
        zeroStr += "0000:"
      }
      zeroStr += "0000";

      //change zero string depending on where it appears
      if (doblColIndex + 2 == value.length && doblColIndex == 0) {
        //only the ::
        //dont need to do anything
      } else if (doblColIndex == 0) {
        //at the beginning
        zeroStr = zeroStr + ":"; //append to end
      } else if (doblColIndex + 2 == value.length) {
        //at the end
        zeroStr = ":" + zeroStr; //append to front
      } else {
        //norm case eg FE80::0202:B3FF:FE1E:8329
        zeroStr = ":" + zeroStr + ":"; //append to front
      }

      searchStr = searchStr.replace("::", zeroStr);

      return searchStr;
    };

    //Waits a bit for user to contiune typing.
    $scope.enterValue = function (value) {
      $scope.currentValue = value;

      $timeout(function () {
        if (value == $scope.currentValue) {
          searchValue(value);
        }
      }, 700);
    };

    //-------------------------------------END SEARCH--------------------------------------------//

}]);
