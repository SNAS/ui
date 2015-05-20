'use strict';

angular.module('bmp.components.card')

  .controller('CanvasController', ["$scope", "$timeout", "$element", "$document", function ($scope, $timeout, $element, $document) {

      window.CANSCOPE = $scope;

      console.log("canvas controller");

      var canvas = document.getElementById('tutorial');
      console.dir(canvas);
      var ctx = canvas.getContext('2d');



  }])

.controller('BmpCardPeerPeerInsertController', ["$scope", "apiFactory", "$timeout", "$element", "$document", function ($scope, apiFactory, $timeout, $element, $document) {
    window.SCOPEZ = $scope;

    $scope.graphs = [];


    //Redraw Tables when menu state changed
    $scope.$on('menu-toggle', function(thing, args) {
      $timeout( function(){
        $scope.ribGridApi.core.handleWindowResize();
      }, 550);
    });

    //this is for the graph cards.
    $scope.graphVisibility = false;
    $scope.showGraphs = function(){
      $scope.graphs = ["preUpdatesGraph","preWithdrawsGraph","updatesGraph","withdrawsGraph"];
      $scope.graphVisibility = true;
    };

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
      enableRowHeaderSelection: true
    };

    $scope.ribGridOptions.columnDefs = [
      {name: "Prefix", displayName: 'Prefix', width: "15%"},
      {name: "PrefixLen", displayName: 'Pre Len', width: "7%"},
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

    //when select Routing tab
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
          $scope.latLong = {
            latitude: $scope.values.geo.latitude,
            longitude: $scope.values.geo.longitude
          };

          $scope.rpiconData = {
            RouterName: $scope.values.Origin_AS,
            RouterIP: $scope.data.RouterIP,
            RouterASN: $scope.data.LocalASN,
            PeerName: $scope.values.PeerName,
            PeerIP: $scope.values.PeerAddress,
            PeerASN: $scope.data.PeerASN
          };
          createASpath($scope.values.AS_Path);
        }).
        error(function (error) {
          console.log(error.message);
        });
    };

    var createASpath = function(path){
      //e.g. " 64543 1221 4637 852 852 29810 29810 29810 29810 29810"
   $scope.asPath={};
    var iconWidth = 50;
    var lineWidth = 100;
    var nodeWidth = iconWidth + lineWidth;

    $scope.asPath.width = "100%";
    $scope.asPath.lineWidth = lineWidth+"px";
    $scope.asPath.iconWidth = iconWidth+"px";

    //this is example later on will be revieved from the table in peerviewpeer
    $scope.path = path;
    var path = $scope.path.split(" ");
    path.shift();

    //Router node
    $scope.as_path=[];
    $scope.as_path.push({
      icon:"bmp-bmp_router10-17",
      topVal:"RouterName",
      colour:"#4b84ca",
      botVal:"IP",
      isEnd:true
    });

    $scope.norepeat = [];
    for(var i = 0; i < path.length; i++){
      if($scope.norepeat.indexOf(path[i]) == -1){
        $scope.norepeat.push(path[i]);
      }
    }

    //var cloneNorepeat = $scope.norepeat.slice(0);
    //cloneNorepeat.sort();
    for(var i = 0; i < $scope.norepeat.length; i++){
      //AS nodes
      $scope.as_path.push({
        icon:"bmp-as_router10-17",
        topVal:$scope.norepeat[i],
        colour:"#9467b0",
        botVal:$scope.norepeat[i],
        //popOut: "popOutContent",
        isEnd:true
      });
    }
    //make last as not have connecting line
    $scope.as_path[$scope.as_path.length-1].isEnd = false;



   var asname;
    apiFactory.getWhoIsASNameList($scope.norepeat).
      success(function (result) {
        var asname = result.w.data;
        for(var i=0; i < asname.length; i++){
         //console.dir(asname[i]);

          var index = $scope.norepeat.indexOf((asname[i].asn).toString());

          //Here is where all fields/ info for popover should be.

      var popOutContent = "asn:" + asname[i].asn + " ";
      popOutContent+= "as_name:" + asname[i].as_name + " ";
      popOutContent+= "org_id:" + asname[i].org_id + " ";
      popOutContent+= "org_name:" + asname[i].org_name + " ";
      popOutContent+= "remarks:" + asname[i].remarks + " ";
      popOutContent+= "address:" + asname[i].address + " ";
      popOutContent+= "city:" + asname[i].city + " ";
      popOutContent+= "state_prov:" + asname[i].state_prov + " ";
      popOutContent+= "postal_code:" + asname[i].postal_code + " ";
      popOutContent+= "country:" + asname[i].country;
      popOutContent = popOutContent.replace(/[a-z_]*:null/gi, ' ');


      //changed the name of the as to name from results.
        $scope.as_path[index+1].topVal = asname[i].as_name;//+1 cause starting router node
       //$scope.as_path[index+1].popOut = asname[i].as_name;//+1 cause starting router node
        $scope.as_path[index+1].popOut = popOutContent;//+1 cause starting router node

        }
      }).
      error(function (error) {
        console.log(error);
      });

    //set width of whole container depending on result size.
    //len + 1 for router     + 80 stop wrapping and padding
    $scope.asPath.width = nodeWidth * ($scope.norepeat.length + 1) + 80 + "px";

    //for the tooltip
    $scope.wordCheck = function(word){
      if(word.length > 6){
        return word.slice(0,4) + " ...";
      }else{
        return word;
      }
    };

    };


    //--------------------------------------- SEARCH --------------------------------------------//

    //TODO - ATM IPV6 with XXXX:0:  not accepted need to add place to fill zero's
    //TODO - also XXXX::XXXX: is accepted for some reason

    //Loop through data selecting and altering relevant data.
    var searchValue = function (value, init) {
      if (value == "" || value == " ") {
        //when clear search populates origninal data.
        $scope.ribGridOptions.data = $scope.initalRibdata;
        $scope.calGridHeight($scope.ribGridOptions, $scope.ribGridApi);
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
