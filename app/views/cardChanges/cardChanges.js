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

    var iconSize = 80;
    var connectorWidth = 100;

    var width = iconSize + connectorWidth;

    //ROUTER DRAWING
    var drawRouterIcon = function(x,y,size) {

      var width = size;
      var height = size * 0.8348;

      var xStart = x+(width * 0.5658);
      var yStart = y+(height * 0.4888);

      var arrowTotal;

      var priCol = '#FFFFFF'; //white
      var secCol = '#000000'; //black

      var drawCircle = function(){   //draw circle
        var circleLen = height * 0.4666;

        ctx.save()
        ctx.beginPath();
        ctx.arc(xStart, yStart, circleLen, 0, 2 * Math.PI);
        ctx.fillStyle = priCol;
        ctx.fill();
        ctx.lineWidth = circleLen * 0.02381;
        ctx.strokeStyle = secCol;
        ctx.stroke();
        ctx.restore();
      };

      var drawArrow = function (x, y, change) {
        var arrowHeight = height * 0.3333;
        var padding = arrowHeight*0.2;
        arrowTotal = arrowHeight + padding;

        ctx.lineWidth = arrowHeight * 0.1666;
        ctx.beginPath();
        ctx.lineCap = "round";

        //TO-DO::add offset in here
        if(!change){
          y = y - padding;
        }

        //arrow stem
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - arrowHeight);

        //arrouw head
        ctx.moveTo(x - (arrowHeight * 0.3333), y - arrowHeight + (arrowHeight * 0.3333));
        ctx.lineTo(x, y - arrowHeight);
        ctx.lineTo(x + (arrowHeight * 0.3333), y - arrowHeight + (arrowHeight * 0.3333));

        ctx.lineJoin = 'round';
        ctx.stroke();
      };

      var drawRouter = function () {
        drawCircle();

        var rotations = [0,90,180,270];
        var flips = [90, 270];
        for (var i = 0; i < rotations.length; i++) {
          ctx.save();
          ctx.translate(xStart, yStart);
          ctx.rotate(rotations[i] * Math.PI / 180);
          ctx.translate(-xStart, -yStart);
          if (flips.indexOf(rotations[i]) != -1) {
            ctx.translate(0, arrowTotal);
            drawArrow(xStart, yStart, 1);
          }else{
            drawArrow(xStart, yStart, 0);
          }
          ctx.restore();
        }
      };

      var drawLabel = function(){
        ctx.save();
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.lineCap = "round";

        var xLineStart = xStart-(height*0.5555);
        var yLineStart = yStart-(height*0.3333);
        var lineLen = width * 0.2412;
        var lineHei = height * 0.1667;
        var lineWidth = lineHei * 0.0668;

        ctx.fillStyle = priCol;
        ctx.fill();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = secCol;

        var curveAm = height * 0.1333;

        ctx.moveTo(xLineStart, yLineStart);
        ctx.lineTo(xLineStart+lineLen, yLineStart);//top
        ctx.bezierCurveTo(xLineStart+lineLen+curveAm,yLineStart,
          xLineStart+lineLen+curveAm,yLineStart+lineHei,
          xLineStart+lineLen,yLineStart+lineHei);
        ctx.lineTo(xLineStart+lineLen, yLineStart+lineHei);//right
        ctx.lineTo(xLineStart, yLineStart+lineHei);//bottom
        ctx.bezierCurveTo(xLineStart-curveAm,yLineStart+lineHei,
          xLineStart-curveAm,yLineStart,
          xLineStart,yLineStart);
        ctx.lineTo(xLineStart, yLineStart);//left
        ctx.fill();

        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.restore();

        //add Text
        var fontSize = height * 0.1555;
        ctx.font = fontSize+"px arial";
        var xWordStart = xLineStart-(height*0.05555);
        var yWordStart = yLineStart + fontSize - (height * 0.011111);
        ctx.fillText("eBGP", xWordStart, yWordStart);
      };

      drawRouter();
      drawLabel();
    };

    var drawIconLine = function(posx, posy , text){
      ctx.beginPath();
      drawIcon(posx,posy, text);
      ctx.moveTo(posx+iconSize - 4,posy+(iconSize/2)-7);
      ctx.lineTo(posx+iconSize + 13 + connectorWidth,posy+iconSize/2 -7);
      ctx.stroke();
    };

    var drawIcon = function(posx, posy, text){
      drawRouterIcon(posx,posy,iconSize);

      //add Text
      var fontSize = 30;
      ctx.font = fontSize+"px arial";
      ctx.fillText(text, posx, posy + iconSize + (fontSize/2));
    };

    var xStart= 10;
    var yStart= 50;

    //only draw after width set
    canvas.width = width * norepeat.length + (xStart*2) - connectorWidth;

    for(var i =0; i < norepeat.length - 1; i++){
      drawIconLine(xStart + (width*i), yStart, norepeat[i]);
    }
    drawIcon(xStart + (width*(norepeat.length-1)), yStart, norepeat[i]);

    //worked once cannot repeat.
    //ctx.font = '60px bmpsymbol';
    //ctx.fillText('\ue612', 10, 50);

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
