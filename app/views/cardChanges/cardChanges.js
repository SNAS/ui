'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:WhoIsController
 * @description
 * # WhoIsController
 * Controller of the Login page
 */
angular.module('bmpUiApp')

  .controller('CanvasController2', ["$scope", "$timeout", "$element", "$document", function ($scope, $timeout, $element, $document) {

    window.CANSCOPE = $scope;

    var canvas = document.getElementById('tutorial');
    var ctx = canvas.getContext('2d');

    $scope.canvasHeight = 200;
    canvas.height = $scope.canvasHeight;

    $scope.path = " 64543 1221 4637 852 852 29810 29810 29810 29810 29810 1 2 3 4 5 6 7 8 9";
    var path = $scope.path.split(" ");
    path.shift();

    var norepeat = [];
    for(var i = 0; i < path.length; i++){
      if(norepeat.indexOf(path[i]) == -1){
        norepeat.push(path[i]);
      }
    }

    var iconSize = 40;
    var connectorWidth = 100;

    var width = iconSize*2 + connectorWidth;

    var drawIconLine = function(posx, posy){
      ctx.beginPath();
      ctx.arc(posx+iconSize,posy+iconSize,iconSize,0,Math.PI*2,true); // Outer circle
      ctx.lineTo(posx+iconSize*2 + connectorWidth,posy + iconSize);
      ctx.stroke();
    };

    var drawIcon = function(posx, posy){
      ctx.beginPath();
      ctx.arc(posx+iconSize,posy+iconSize,iconSize,0,Math.PI*2,true); // Outer circle
      ctx.stroke();
    };

    var xStart= 10;
    var yStart= 50;

    //only draw after width set
    canvas.width = width * norepeat.length + (xStart*2) - connectorWidth;

    for(var i =0; i < norepeat.length - 1; i++){
      drawIconLine(xStart + (width*i), yStart);
    }
    drawIcon(xStart + (width*(norepeat.length-1)), yStart);

    //'\u062'

    ctx.font = '60px bmpsymbol';
    ctx.fillText('\ue612', 10, 50);


    //ROUTER DRAWING
    var drawRouterIcon = function() {

      var xStart = 320;
      var yStart = 250;

      var arrowHeight = 150;
      var priCol = 'white'; //FFFFFF
      var secCol = 'black'; //000000

      var drawArrow = function (x, y) {
        ctx.lineWidth = 25;
        ctx.beginPath();
        ctx.lineCap = "round";

        //arrow stem
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - 150);

        //arrouw head
        ctx.moveTo(x - 50, y - arrowHeight + 50);
        ctx.lineTo(x, y - arrowHeight);
        ctx.lineTo(x + 50, y - arrowHeight + 50);

        ctx.lineJoin = 'round';
        ctx.stroke();
      };

      var drawCircle = function(){
        //draw circle
        ctx.save()
        ctx.beginPath();
        ctx.arc(xStart, yStart, (arrowHeight + 30 * 2), 0, 2 * Math.PI);
        ctx.fillStyle = priCol;
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
        ctx.restore();
      };

      var drawRouter = function () {
        drawCircle();

        var rotations = [90, 270, 180, 0];
        var flips = [90, 270];
        for (var i = 0; i < rotations.length; i++) {
          ctx.save();
          ctx.translate(xStart, yStart);
          ctx.rotate(rotations[i] * Math.PI / 180);
          ctx.translate(-xStart, -yStart);

          if (flips.indexOf(rotations[i]) != -1) {
            ctx.translate(0, yStart - 30);
          }

          drawArrow(xStart, yStart - 30);
          ctx.restore();
        }
      };

      var drawLabel = function() {

        var lineWidth = 10;
        var xLineStart = xStart - 250;
        var yLineStart = yStart - 150;
        var lineLen = 130;
        var lineHei = 75;

        ctx.save();
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.fillStyle = priCol;
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#00000';

        ctx.beginPath();
        ctx.moveTo(xLineStart, yLineStart);
        ctx.lineTo(xLineStart + lineLen, yLineStart);                     //top
        ctx.bezierCurveTo(xLineStart + lineLen + 60, yLineStart,
          xLineStart + lineLen + 60, yLineStart + lineHei,
          xLineStart + lineLen, yLineStart + lineHei);
        ctx.lineTo(xLineStart + lineLen, yLineStart + lineHei);           //right
        ctx.lineTo(xLineStart, yLineStart + lineHei);                     //bottom
        ctx.bezierCurveTo(xLineStart - 60, yLineStart + lineHei,
          xLineStart - 60, yLineStart,
          xLineStart, yLineStart);
        ctx.lineTo(xLineStart, yLineStart);                               //left
        ctx.fill();

        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.restore();

        //Text
        var fontSize = 70;
        ctx.font = fontSize + "px arial";
        var xWordStart = xLineStart - 25;
        var yWordStart = yLineStart + fontSize - 5;
        ctx.fillText("eBGP", xWordStart, yWordStart);
      }

      drawRouter();
      drawLabel();

    };


  }])

  .controller('CardChangesController', ['$scope','apiFactory', '$http', '$timeout', '$interval', function ($scope, apiFactory, $http, $timeout, $interval) {

    window.SCOPERS = $scope;

    $scope.routerList = [];
    $scope.routerPeers = [];

    apiFactory.getRoutersAndLocations().
      success(function (result){
        $scope.routerList = result.routers.data;
        $scope.routerPeers = new Array($scope.routerList.length);
      }).
      error(function (error){
        console.log(error);
      });


    $scope.getRouterPeers = function(index,routerip) {
      apiFactory.getPeersAndLocationsByIp(routerip).
        success(function (result) {
          $scope.routerPeers[index] = result.v_peers.data;
        }).
        error(function (error) {
          console.log(error);
        });
    };
  }]);
