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

    $scope.middleColumnClosed = false;

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
        TweenMax.staggerTo("#btnSearchConnections", 0.5, {opacity:0, y:-100, ease:Back.easeIn}, 0.1);
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
    $scope.asPaths = [];
    const limit = 10;
    var currentOffset = 0;
    $scope.thereIsMoreData = false;
    $scope.startSearch = function() {
      var currentOffset = 0;
      $scope.asPaths = [];
      $scope.continueSearch();
    };
    $scope.continueSearch = function() {
      $scope.loadingASPaths = true;
      var request = bgpDataService.getASPathsHistoryBetweenASNumbers($scope.as1_number, $scope.as2_number, {orderBy: 'created_on', orderDir: 'desc', limit: limit, offset: currentOffset});
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

        $scope.setMiddleColumnState(true);
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
      active: true,
      shortest: false,
      longest: false
    };
    $scope.onButtonClick = function(key) {
      console.debug("click active", key);
//      angular.forEach($scope.buttons, function(btn) { btn = false; });
      for (var b in $scope.buttons) {
        if ($scope.buttons.hasOwnProperty(b)) {
          $scope.buttons[b] = false;
        }
      }
      $scope.buttons[key] = true;
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
//    $scope.onKeyPress = function(input, keyEvent) {
//      $scope[input+"_number"] = '';
//      var inputValue = $scope[input+"_name"];
//      // if the user presses Enter or Tab, validate the entry
//      // and focus on the other input if it hasn't been filled in, or on the search button
//      console.debug("keyEvent", keyEvent);
//      if (keyEvent.which === 13 || keyEvent.keyCode === 9) {
//        if (inputValue && inputValue.length > 0) {
//          findInfoAboutASN(input, $scope[input+"_name"]);
//          setFocusForNextStep();
//        }
//      }
//      else {
//        $scope.readyToSearchConnections = false;
//      }
//    };
    $scope.onKeyDown = function(input, keyEvent) {
      // if the user presses the delete key
//      if (keyEvent.keyCode === 8) {
//        $scope[input+"_number"] = '';
//      }

      // don't do anything if the user presses the left or right arrow
      if (keyEvent.keyCode === 37 || keyEvent.keyCode === 39) return;

      // otherwise clear the AS number and check if the user pressed Enter or Tab
      $scope[input+"_number"] = '';
      var inputValue = $scope[input+"_name"];
      // if the user presses Enter or Tab, validate the entry
      // and focus on the other input if it hasn't been filled in, or on the search button
      console.debug("keyEvent", keyEvent);
      if (keyEvent.which === 13 || keyEvent.keyCode === 9) {
        if (inputValue && inputValue.length > 0) {
          findInfoAboutASN(input, $scope[input+"_name"]);
        }
      }
      else {
        $scope.readyToSearchConnections = false;
      }
    };
//    TweenMax.staggerFrom(".btn", 2, {scale:0.5, opacity:0, delay:0.5, ease:Elastic.easeOut, force3D:true}, 0.2);

    $scope.onSelect = function(input, value) {
      findInfoAboutASN(input, value);
    };

    $scope.onSelectSearch = function(value) {
      $scope.searchValue = value;
    };

//    (function($){
//      $(window).on("load",function(){
//        console.debug("asPaths?", $("#asPaths"));
//        $timeout(function() { $("#asPaths").mCustomScrollbar({setHeight: 300, theme: "minimal-dark"}) }, 0);
//      });
//    })(jQuery);

    // initialisation
    $(function() {
      if ($stateParams.as1) {
        $scope.as1_name = $stateParams.as1;
        findInfoAboutASN('as1', $scope.as1_name);
      }
      if ($stateParams.as2) {
        $scope.as2_name = $stateParams.as2;
        findInfoAboutASN('as2', $scope.as2_name);
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
              $scope.continueSearch();
            }
          }
        }
      };
      $timeout(function() {
        $("#asPaths").mCustomScrollbar(scrollbarParameters)
      }, 0);
    });
  }
);
