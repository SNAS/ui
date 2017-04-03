'use strict';

angular.module('bmp.components.card')

  .controller('BmpCardGlobalRouterController', ["$scope", "apiFactory", "timeFactory", "cardFactory", "uiGridFactory", "countryConversionFactory", function ($scope, apiFactory, timeFactory, cardFactory, uiGridFactory, countryConversionFactory) {

    //ROUTER DATA
    //{
    //  "RouterName":"csr1.openbmp.org",
    //  "RouterIP":"173.39.209.78",
    //  "RouterAS":0,
    //  "description":"",
    //  "isConnected":1,
    //  "isPassive":0,
    //  "LastTermCode":65535,
    //  "LastTermReason":"Error while reading BMP data into buffer",
    //  "InitData":"",
    //  "LastModified":"2015-04-01 18:36:36"
    // }

    $scope.modalContent = "";

    if ($scope.data.RouterName === " " || $scope.data.RouterName === "") {
      $scope.data.RouterName = $scope.data.RouterIP;
    }

    // Set API call modal dialog for corresponding router.
    var linkRouter = 'routers?where=hash_id="' + $scope.data.RouterHashId + '"';
    var textRouter = $scope.data.RouterName;
    $scope.modalContent += apiFactory.createApiCallHtml(linkRouter, textRouter);

    var linkRouterWithGeo = 'routers?where=hash_id="' + $scope.data.RouterHashId + '"&withgeo';
    var textRouterWithGeo = $scope.data.RouterName + " - Geo";
    $scope.modalContent += apiFactory.createApiCallHtml(linkRouterWithGeo, textRouterWithGeo);

    var linkRouterPeers = 'peer?where=router_hash_id="' + $scope.data.RouterHashId + '"';
    var textRouterPeers = $scope.data.RouterName + " - All Peers";
    $scope.modalContent += apiFactory.createApiCallHtml(linkRouterPeers, textRouterPeers);

    var linkRouterUpPeers = 'peer?where=router_hash_id="' + $scope.data.RouterHashId + '" AND isUp=1';
    var textRouterUpPeers = $scope.data.RouterName + " - Up Peers";
    $scope.modalContent += apiFactory.createApiCallHtml(linkRouterUpPeers, textRouterUpPeers);

    var linkRouterDownPeers = 'peer?where=router_hash_id="' + $scope.data.RouterHashId + '" AND isUp=0';
    var textRouterDownPeers = $scope.data.RouterName + " - Down Peers";
    $scope.modalContent += apiFactory.createApiCallHtml(linkRouterDownPeers, textRouterDownPeers);


    //$scope.data.RouterIPWithLength = $scope.data.RouterIP + "/" + getAsLength($scope.data.RouterIP);
    //
    //function getAsLength(theValue) {
    //  var theString = theValue + "";
    //  theString = theString.replace(":", "");
    //  theString = theString.replace(".", "");
    //  return theString.length;
    //};

    $scope.wordCheck = function (word) {
      if (word.length > 13) {
        return word.slice(0, 10) + " ...";
      } else {
        return word;
      }
    };

    $scope.ipAmountData = [
      {
        key: 'Up',
        values: [
          {label: "IPv4", value: 0},
          {label: "IPv6", value: 0}
        ]
      },
      {
        key: 'Down',
        values: [
          {label: "IPv4", value: 0},
          {label: "IPv6", value: 0}
        ]
      }
    ];

    //<!--IP's Graph-->
    var whichip = ['v4', 'v6'];

    var graphPoint = [0];
    angular.forEach(whichip, function (obj, index) {

      //alert(JSON.stringify($scope.data))
      apiFactory.getPeersOfRouterWithIpType($scope.data.RouterHashId, whichip[index]).success(function (result) {
        var ups = 0;
        var downs = 0;

        result.v_peers.data.forEach(function(peer_row, index) {
          if (peer_row.isUp == 1) {
            ups++;
          }

          else if (peer_row.isUp == 0) {
            downs++;
          }
        });

        //if(ipAmount > graphPoint[0]) //for changing graph axis
        //  graphPoint[0] = ipAmount;
        //
        $scope.ipAmountData[0].values[index].value = ups; // Add number of peers up.
        $scope.ipAmountData[1].values[index].value = downs; // Add number of peers down.
        //$scope.ipAmountData[0].values[$scope.ipAmountData[0].values.length - 1].value = ipTotal;

        $scope.ipGraphIsLoad = false; //stop loading
      }).error(function (error) {
        console.log(error.message);
      });
    });

    $scope.ipAmountOptions = {
      chart: {
        type: 'multiBarChart',
        height: 170,
        width: 285,
        margin: {
          top: 20,
          right: 10,
          bottom: 40,
          left: 30
        },
        x: function (d) {
          return d.label;
        },
        y: function (d) {
          return d.value;
        },
        showValues: true,
        stacked: true, // For stack chart.
        showControls: false,
        valueFormat: function (d) {
          return d3.format('')(d);
        },
        transitionDuration: 500,
        tooltipContent: function (key, x, y, e, graph) {
          return '<h5>' + x + " Peers: " + y + '</h5>'
        },
        "yAxis": {
          tickFormat: d3.format('d'),
          tickValues: [0]
        }
      }
    };


    //END <!--IP's Graph-->

    //ROUTER UP TIME GRAPH
    //used line graph
    $scope.upTimeOptions = {
      "chart": {
        "showYAxis": false,
        "showLegend": false,
        "type": "lineChart",
        "height": 180,
        "margin": {
          "top": 20,
          "right": 20,
          "bottom": 40,
          "left": 20
        },
        "useInteractiveGuideline": false,
        "tooltips": false,
        "dispatch": {},
        "xAxis": {
          "axisLabel": "Time (ms)"
        },
        "yAxis": {
          "axisLabelDistance": 30
        }
      },
      "title": {
        "enable": true,
        "text": "BMP Connection Up Time"
      }
    };


    $scope.upTimeConfig = {
      visible: false // default: true
    };

    //Router up time DATA
    $scope.upTimeData = [
      {
        "key": "UpTime",
        color: '#1F7D1F',
        "values": [
          //static data
          {"x": 0, "y": 0},
          {"x": 3, "y": 0},
          {"x": 3, "y": 3},
          {"x": 12, "y": 3},
          {"x": 12, "y": 0},
          {"x": 15, "y": 0},
          {"x": 15, "y": 3},
          {"x": 21, "y": 3},
          {"x": 21, "y": 0},
          {"x": 27, "y": 0}
        ]
      }
    ];

    //<!--Router Up Time-->
    $scope.upTime = timeFactory.calTimeFromNow($scope.data.LastModified);

    $scope.globalViewPeerGridInitHeight = 350;

    $scope.globalViewPeerOptions = {
      enableRowSelection: false,
      enableRowHeaderSelection: false,
      enableHorizontalScrollbar: 0,
      enableVerticalScrollbar: 1,
      height: $scope.globalViewPeerGridInitHeight,
      rowTemplate: '<div class="hover-row-highlight"><div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div></div>',
      columnDefs: [
        {
          name: "PeerASN", displayName: 'AS Number', width: '*',
          cellTemplate: '<div class="ui-grid-cell-contents asn-clickable"><div bmp-asn-model asn="{{ COL_FIELD }}"></div></div>'
        },
        {name: "as_name", displayName: 'AS Name', width: '*'},
        {name: "PeerName", displayName: 'Peer', width: '*'}
      ]
    };
    $scope.globalViewPeerOptions.multiSelect = false;
    $scope.globalViewPeerOptions.noUnselect = false;
    $scope.globalViewPeerOptions.modifierKeysToMultiSelect = false;

    //get peers data
    var peersData;
    // $scope.peerSummaryTable = [];
    apiFactory.getPeersByIp($scope.data.RouterIP).success(function (result) {
      if (!$.isEmptyObject(result)) {
        $scope.peersAmount = result.v_peers.size;
        // peersData = result.v_peers.data;
        var filteredPeers = []

        // Filters peers with PeerASN number 0.
        result.v_peers.data.forEach(function(peer) {
              if (peer['PeerASN'] != 0) {
                  filteredPeers.push(peer)
              }
        });

        $scope.globalViewPeerOptions.data = filteredPeers;
      } else {
        $scope.globalViewPeerOptions.data = [];
      }
      $scope.globalViewGridIsLoad = false; //stop loading
      $scope.peerIconIsLoad = false; //stop loading

      uiGridFactory.calGridHeight($scope.globalViewPeerOptions, $scope.globalViewPeerApi);
    }).error(function (error) {
      console.log(error.message);
    });

    var peerViewPeerDefaultData = [{"as_name": "NO DATA"}];
    $scope.globalViewPeerOptions.onRegisterApi = function (gridApi) {
      $scope.globalViewPeerApi = gridApi;
    };


    if ($scope.cardExpand) {
      $scope.upTimeConfig.visible = true;
    }

    //Listen for card expand to resize the graph and table
    $scope.$watch('cardExpand', function () {
      if ($scope.cardExpand == true) {
        //resize graph
        $scope.upTimeConfig.visible = true;
        //setTimeout(function(){
        //  //$scope.peerViewPeerApi.core.handleWindowResize();
        //  $scope.calGridHeight($scope.globalViewPeerOptions, $scope.globalViewPeerApi);
        //},10)
      }
    });
    //End Router up time Graph

    $scope.isUP = ($scope.data.isConnected == '1') ? '⬆' : '⬇';
    $scope.locationInfo = cardFactory.createLocationTable({
      stateprov: $scope.data.stateprov,
      city: $scope.data.city,
      country: countryConversionFactory.getName($scope.data.country),
      type: $scope.data.type
    });




  }]);
