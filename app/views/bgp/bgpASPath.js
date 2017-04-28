'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:BGPASPathController
 * @description
 * # BGPASPathController
 * Controller for the BGP AS Path page
 */
angular.module('bmpUiApp').controller('BGPASPathController',
  function($scope, $rootScope, $stateParams, $location, $filter, bgpDataService, ConfigService, socket, uiGridConstants, apiFactory, $timeout) {

    var uiServer = ConfigService.bgpDataService;
    const SOCKET_IO_SERVER = "bgpDataServiceSocket";
    socket.connect(SOCKET_IO_SERVER, uiServer);
    socket.on(SOCKET_IO_SERVER, 'dataUpdate', function(data) {
      console.log("dataUpdate", data);
    });

    $rootScope.dualWindow.noTitleBar = true;


    // states:
    // - open: connections between AS #1 and AS #2 are being shown
    // - close: connections are not being shown
    var elementsByState = {
      open: {
        '.left-column': {width: '20%'},
        '.right-column': {width: '20%'},
        '.middle-column': {width: '60%'},
        '.as-input': {'font-size': '20px'}
      },
      close: {
        '.left-column': {width: '50%'},
        '.right-column': {width: '50%'},
        '.middle-column': {width: 0},
        '.as-input': {'font-size': '65px'}
      }
    };
    var buttonsShown = false;
    $scope.setMiddleColumnState = function(open) {
      // the names of the fields in columns need to match the names of the classes for selection
      var elements = elementsByState[open ? 'open' : 'close'];
//      var elements = $scope.middleColumnClosed ? elementsByState.open : elementsByState.close;
      var animationDuration = 0.5;
      for (var c in elements) {
        if (elements.hasOwnProperty(c)) {
          TweenLite.to($(c), animationDuration, elements[c]);
        }
      }
      if (open) {
//        TweenMax.staggerTo("#btnSearchConnections", 0.5, {opacity:0, y:-100, ease:Back.easeIn}, 0.1);
        if (!buttonsShown) {
          TweenMax.staggerFrom(".middle-column .btn", 2, {scale:0.5, opacity:0, delay:0.5, ease:Power4.easeOut, force3D:true}, 0.2);
          buttonsShown = true;
        }
      }
      $scope.middleColumnClosed = !open;
    };

    $scope.httpRequests = [];
    function clearRequest(request) {
      $scope.httpRequests.splice($scope.httpRequests.indexOf(request), 1);
    }
    $scope.cancelAllHttpRequests = function() {
      console.debug("cancelAllHttpRequests", $scope.httpRequests.length);
      while ($scope.httpRequests.length > 0) {
        console.debug("cancelling request");
        var request = $scope.httpRequests[0];
        request.cancel();
        clearRequest(request);
      }
      console.debug("all done");
    };

    $scope.loadingASPaths = false;
    var preloader;
    function addPreloader() {
      preloader = new GSPreloader({
        radius:42,
        dotSize:14,
        dotCount:10,
        colors:["#61AC27","#555","purple","#FF6600"], //have as many or as few colors as you want.
        boxOpacity:0.2,
        boxBorder:"none",
        boxColor: "transparent",
//        animationOffset: 0, //jump 1.8 seconds into the animation for a more active part of the spinning initially (just looks a bit better in my opinion)
//        parent: $("#btn-search-container")[0],
        parent: document.getElementById("btnSearchConnections"),
        position: "relative",
        top: "-38px",
        left: "50%",
        animationStartDuration: 0.3,
        staggerDelay: 0.05,
        staggerOffset: 0.07
      });
    }

//    //for testing: click the window to toggle open/close the preloader
//    document.onclick = document.ontouchstart = function() {
//      preloader.active( !preloader.active() );
//    };

    function openSearchButton(initialDelay) {
      var searchButton = $("#btnSearchConnections");

      var timelineMultiplier = 0.9;
      // start with the button invisible, and make it appear after a second to become a dot with a radius of 14px
      TweenLite.fromTo(searchButton, 0.2*timelineMultiplier,
        {color: 'white', 'font-size': 0, padding: 0, width: 0, height: 0, 'margin-left': 0, bottom: '181px'},
        {width: '14px', height: '14px', 'margin-left': '-7px', bottom: '174px', delay: initialDelay});
      // then expand the button and make the text appear
      TweenLite.to(searchButton, 0.2*timelineMultiplier, {'width': '260px', 'margin-left': '-130px', delay: initialDelay+0.2*timelineMultiplier}); // 0.2 - 0.4s
      TweenLite.to(searchButton, 0.2*timelineMultiplier, {'height': '56px', 'padding': '6px 12px', delay: initialDelay+0.4*timelineMultiplier}); // 0.4 - 0.6s
      TweenLite.to(searchButton, 0.4*timelineMultiplier, {'color': 'white', 'font-size': '25px', ease:Back.easeOut, delay: initialDelay+0.6*timelineMultiplier}); // 0.6 - 0.7s
    }
    (function initialiseSearchButton() {
      TweenLite.set($("#btnSearchConnections"), {color: 'white', 'font-size': 0, padding: 0, width: 0, height: 0, 'margin-left': 0, bottom: '181px'});
    })();
//    openSearchButton(1);


    function closeSearchButtonAndStartAnimation(onComplete) {
      var searchButton = $("#btnSearchConnections");

      // first make the search button text transparent
      var timelineMultiplier = 0.9;
      TweenLite.to(searchButton, 0.2*timelineMultiplier, {color: 'black'}); // 0 - 0.2s
      TweenLite.to(searchButton, 0.1*timelineMultiplier, {'font-size': 0, delay: 0.1*timelineMultiplier}); // 0.1 - 0.2s
      // then reduce the size of the search button
      TweenLite.to(searchButton, 0.4*timelineMultiplier, {height: '14px', padding: 0, bottom: '174px', delay: 0.2*timelineMultiplier}); // 0.2 - 0.6s
      TweenLite.to(searchButton, 0.4*timelineMultiplier, {width: '14px', 'margin-left': '-7px', delay: 0.4*timelineMultiplier}); // 0.4 - 0.8s
      TweenLite.to(searchButton, 0.2*timelineMultiplier, {width: 0, height: 0, 'margin-left': 0, bottom: '181px', delay: 0.8*timelineMultiplier, onStart: function() { preloader.active(true); }, onComplete: onComplete});
    }

    $scope.asPaths = [];
    const limit = 10;
    var currentOffset = 0;
    $scope.thereIsMoreData = false;
    $scope.startSearch = function() {
      currentOffset = 0;
      $scope.asPaths = [];

      closeSearchButtonAndStartAnimation($scope.continueSearch);
    };
    $scope.continueSearch = function() {
      $scope.loadingASPaths = true;
      // check which button is active: active, longest or shortest
      var activeButton;
      for (var b in $scope.buttons) {
        if ($scope.buttons.hasOwnProperty(b)) {
          if ($scope.buttons[b].active) {
            activeButton = b;
            break;
          }
        }
      }

      var request;
      if ($scope.buttons[activeButton].orderBy === 'length') {
        request = bgpDataService.getASPathsBetweenASNumbers($scope.as1_number, $scope.as2_number, {orderBy: $scope.buttons[activeButton].orderBy, orderDir: $scope.buttons[activeButton].orderDir, limit: limit, offset: currentOffset});
      }
      else {
        request = bgpDataService.getASPathsHistoryBetweenASNumbers($scope.as1_number, $scope.as2_number, {orderBy: $scope.buttons[activeButton].orderBy, orderDir: $scope.buttons[activeButton].orderDir, limit: limit, offset: currentOffset});
      }
      $scope.httpRequests.push(request);
      request.promise.then(function(asPaths) {
        clearRequest(request);

        $scope.loadingASPaths = false;

        console.debug("asPaths", asPaths);
        var newPaths = asPaths.map(function(asPath) {
          var pathArray = asPath.as_path.split(" ").map(function(as) {
            return parseInt(as, 10);
          });

//          var pathArray = path.path.split(" ");
          var indexes = {};

          for (var i = 0 ; i < pathArray.length ; i++) {
            var as = pathArray[i];
            if (indexes[as] === undefined) {
              indexes[as] = {count: 0};
            } else {
              pathArray.splice(i, 1);
              i--;
            }
            indexes[as].count++;
          }

          asPath.as_path = [];
          var nbDivisions = pathArray.length+1;
          var step = 100 / nbDivisions;
          for (var i = 0; i < pathArray.length; i++) {
            //AS nodes "bmp-as_router10-17"
            asPath.as_path.push({
              asn: pathArray[i],
              count: indexes[pathArray[i]].count,
              position: "calc("+((i+1)*step)+"% - "+radius+"px)"
            });
          }


//          asPath.positions = [];
//          var length = asPath.as_path.length;
////          var nbDivisions = length+1;
////          var step = 100 / nbDivisions;
//          for (var i = 0 ; i < length ; i++) {
//            var offset = "calc("+((i+1)*step)+"% - "+radius+"px)";
//            asPath.positions.push(offset);
//          }
          return asPath;
        });
        // if the number of new paths is less than the limit we set, then we know there's no more data
        $scope.thereIsMoreData = newPaths.length >= limit;
        $scope.asPaths = $scope.asPaths.concat(newPaths);
//        console.debug("asPaths transformed", $scope.asPaths);

        preloader.active(false, function() { $scope.setMiddleColumnState(true); });
      }, function(error) {
        console.warn(error);
        $scope.api_errors.push(error);
      });
    };

    $scope.asPathGraph = {
      paths: [
        { as_path: [6939, 27720, 262401] },
        { as_path: [6939, 3356, 3549, 262401, 123456789] }
      ]
    };
    var radius = 30; //px -> set this to half the diameter chosen in _bgp.scss
    angular.forEach($scope.asPathGraph.paths, function(path) {
      path.positions = [];
      var length = path.as_path.length;
      var nbDivisions = length+1;
      var step = 100 / nbDivisions;
      for (var i = 0 ; i < length ; i++) {
        var offset = "calc("+((i+1)*step)+"% - "+radius+"px)";
        path.positions.push(offset);
      }
    });

    $scope.buttons = {
      active: { active: true, orderBy: 'created_on', orderDir: 'desc' },
      shortest: { active: false, orderBy: 'length', orderDir: 'asc' },
      longest: { active: false, orderBy: 'length', orderDir: 'desc' }
    };
    $scope.onButtonClick = function(key) {
      // don't do anything if this button is already the active one
      if ($scope.buttons[key].active) return;

      console.debug("click active", key);
//      angular.forEach($scope.buttons, function(btn) { btn = false; });
      for (var b in $scope.buttons) {
        if ($scope.buttons.hasOwnProperty(b)) {
          $scope.buttons[b].active = false;
        }
      }
      $scope.buttons[key].active = true;

      // query new data
      $scope.startSearch();
    };


    //used for getting suggestions
    $scope.getSuggestions = function(val) {
      if (isNaN(val)) {
        return apiFactory.getWhoIsASNameLike(val, 10).then(function(response) {
//          console.debug(response.data.w.data);
          return response.data.w.data.map(function(item) {
            return item.as_name;// + " (ASN: "+item.asn+")";
          });
        });
      } else {
        return [];
      }
    };

    function checkInputs() {
      $timeout(function() {
        $scope.readyToSearchConnections = !isNaN($scope.as1_number) && !isNaN($scope.as2_number);
      });
//      console.log("checkInputs()", $scope.as1_number, $scope.as2_number);
      setFocusForNextStep();
    }

    //get all the information of this AS
    function findInfoAboutASN(input, searchValue) {
      if (isNaN(searchValue)) {
        apiFactory.getWhoIsASName(searchValue).success(function(result) {
          var data = result.w.data;
//          getData(data);
//          console.debug("info about AS "+searchValue, data);
          $scope[input+"_number"] = '';
          if (data.length > 0) {
            $scope[input+"_number"] = data[0].asn;
          }
          else {
            $scope[input+"_number"] = 'Unknown';
          }
          checkInputs();
        }).error(function(error) {
            console.log(error.message);
          });
      }
      else {
        apiFactory.getWhoIsASN(searchValue).success(function(result) {
          var data = result.gen_whois_asn.data;
//          getData(data);
//          console.debug("info about AS "+searchValue, result);
          if (data.length > 0) {
            $scope[input+"_name"] = data[0].as_name;
            $scope[input+"_number"] = data[0].asn;
          }
          else {
            $scope[input+"_number"] = 'Unknown';
          }
          checkInputs();
        }).error(function(error) {
            console.log(error.message);
          });
      }
    }

    function setFocusForNextStep() {
      var elementToFocusOn;
      console.debug("setFocusForeNextStep - AS1=[%s], AS2=[%s]", $scope.as1_number, $scope.as2_number);
      if ($scope.as1_number === undefined || $scope.as1_number === '') {
        elementToFocusOn = $("#as1");
      }
      else if ($scope.as2_number === undefined || $scope.as2_number === '') {
        elementToFocusOn = $("#as2");
      }
      else {
        elementToFocusOn = $("#btnSearchConnections");
      }
      elementToFocusOn.focus();
    }

    $scope.readyToSearchConnections = false;
    $scope.onKeyDown = function(input, keyEvent) {
      // if the user presses the delete key
//      if (keyEvent.keyCode === 8) {
//        $scope[input+"_number"] = '';
//      }

      // don't do anything if the user presses the left or right arrow
      if (keyEvent.keyCode === 37 || keyEvent.keyCode === 39) return;

      if (!$scope.middleColumnClosed) {
        $scope.setMiddleColumnState(false);
        openSearchButton(1);
      }

      // otherwise clear the AS number and check if the user pressed Enter or Tab
      $scope[input+"_number"] = '';
      var inputValue = $scope[input+"_name"];
      // if the user presses Enter or Tab, validate the entry
      // and focus on the other input if it hasn't been filled in, or on the search button
//      console.debug("keyEvent", keyEvent);
      if (keyEvent.which === 13 || keyEvent.keyCode === 9) {
        if (inputValue && inputValue.length > 0) {
          findInfoAboutASN(input, $scope[input+"_name"]);
        }
      }
      else {
        $scope.readyToSearchConnections = false;
      }
    };

    $scope.onSelect = function(input, value) {
      findInfoAboutASN(input, value);
    };

    $scope.onSelectSearch = function(value) {
      $scope.searchValue = value;
    };


    // initialisation
    $(function() {
      $scope.middleColumnClosed = false;
      var as1Provided = false, as2Provided = false;
      if ($stateParams.as1) {
        $scope.as1_name = $stateParams.as1;
        findInfoAboutASN('as1', $scope.as1_name);
        as1Provided = true;
      }
      if ($stateParams.as2) {
        $scope.as2_name = $stateParams.as2;
        findInfoAboutASN('as2', $scope.as2_name);
        as2Provided = true
      }
      if (as1Provided && as2Provided) {
        openSearchButton(1);
      }
      // initialise the scroll bar for the middle column
      var scrollbarParameters = {
        setHeight: 740,
        theme: "minimal-dark",
        callbacks: {
          // if the content is long enough and the vertical scrollbar is added
          onOverflowY: function() {
            $scope.thereIsMoreData = true;
          },
          // if the content is short enough and the vertical scrollbar is removed
          onOverflowYNone: function() {
            $scope.thereIsMoreData = false;
          },
          alwaysTriggerOffsets: false,
          // when we scroll to the bottom, let's run the query again to get more data
          onTotalScroll: function(){
            console.log("Scrolled back to the end of content. ",
              $scope.thereIsMoreData ? "There might be more data, so run the query again" : "There is no more data");
            if ($scope.thereIsMoreData) {
              currentOffset += limit;
              preloader.active(true);
              $scope.continueSearch();
            }
          }
        }
      };
      $timeout(function() {
        $("#asPaths").mCustomScrollbar(scrollbarParameters)
      }, 0);
      addPreloader();
    });
  }
);
