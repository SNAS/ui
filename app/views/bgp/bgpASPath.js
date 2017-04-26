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
    $scope.toggleMiddleColumn = function() {
      // the names of the fields in columns need to match the names of the classes for selection
      var columns = {
        'left-column': {},
        'right-column': {},
        'middle-column': {}
      };
      if ($scope.middleColumnClosed) {
        columns['left-column'].newWidth = '25%';
        columns['right-column'].newWidth = '25%';
        columns['middle-column'].newWidth = '50%';
      }
      else {
        columns['left-column'].newWidth = '50%';
        columns['right-column'].newWidth = '50%';
        columns['middle-column'].newWidth = 0;
      }
      var animationDuration = 0.5;
      for (var c in columns) {
        if (columns.hasOwnProperty(c)) {
          TweenLite.to($("."+c), animationDuration, {width:columns[c].newWidth, onComplete: columns[c].onComplete});
        }
      }
      $scope.middleColumnClosed = !$scope.middleColumnClosed;
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
      $scope.readyToSearchConnections = !isNaN($scope.as1_number) && !isNaN($scope.as2_number);
      console.log("checkInputs()", $scope.as1_number, $scope.as2_number);
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

    $scope.readyToSearchConnections = false;
    $scope.onKeyPress = function(input, keyEvent) {
      $scope[input+"_number"] = '';
      var inputValue = $scope[input+"_name"];
      // if the user presses Enter, validate the entry
      if (keyEvent.which === 13) {
        if (inputValue && inputValue.length > 0) {
          findInfoAboutASN(input, $scope[input+"_name"]);
        }
      }
      else {
        $scope.readyToSearchConnections = false;
      }
    };
    $scope.handleBackspace = function(input, event) {
      // if the user presses the delete key
      if (event.keyCode === 8) {
        $scope[input+"_number"] = '';
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
//      setMiddleColumnWidth(0, true);
      $scope.toggleMiddleColumn();
    });
  }
);
