'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:WhoIsController
 * @description
 * # WhoIsController
 * Controller of the Login page
 */
angular.module('bmpUiApp')
  //REWORKED CANVAS SECTION MAY NOT BE NEEDED

  //.controller('CanvasController2', ["$scope", "$timeout", "$element", "$document", function ($scope, $timeout, $element, $document) {
  //
  //  window.CANSCOPE = $scope;
  //
  //  var canvas = document.getElementById('tutorial');
  //  var ctx = canvas.getContext('2d');
  //
  //  $scope.canvasHeight = 200;
  //  canvas.height = $scope.canvasHeight;
  //
  //  $scope.path = " 64543 1221 4637 852 852 29810 29810 29810 29810 29810 1 2 3 4 5 6 7 8 9";
  //  var path = $scope.path.split(" ");
  //  path.shift();
  //
  //  var norepeat = [];
  //  for(var i = 0; i < path.length; i++){
  //    if(norepeat.indexOf(path[i]) == -1){
  //      norepeat.push(path[i]);
  //    }
  //  }
  //
  //  var iconSize = 75;
  //  var connectorWidth = 100;
  //
  //  var width = iconSize + connectorWidth;
  //
  //  //ROUTER DRAWING
  //  var drawRouterIcon = function(x,y,size,toDrawLabel) {
  //
  //    var width = size;
  //    var height = size * 0.8348;
  //
  //    var xStart = x+(width * 0.5658);
  //    var yStart = y+(height * 0.4888);
  //
  //    var arrowTotal;
  //
  //    var priCol = '#FFFFFF'; //white
  //    var secCol = '#000000'; //black
  //
  //    var drawCircle = function(){   //draw circle
  //      var circleLen = height * 0.4666;
  //
  //      ctx.save()
  //      ctx.beginPath();
  //      ctx.arc(xStart, yStart, circleLen, 0, 2 * Math.PI);
  //      ctx.fillStyle = priCol;
  //      ctx.fill();
  //      ctx.lineWidth = circleLen * 0.02381;
  //      ctx.strokeStyle = secCol;
  //      ctx.stroke();
  //      ctx.restore();
  //    };
  //
  //    var drawArrow = function (x, y, change) {
  //      var arrowHeight = height * 0.3333;
  //      var padding = arrowHeight*0.2;
  //      arrowTotal = arrowHeight + padding;
  //
  //      ctx.lineWidth = arrowHeight * 0.1666;
  //      ctx.beginPath();
  //      ctx.lineCap = "round";
  //
  //      //TO-DO::add offset in here
  //      if(!change){
  //        y = y - padding;
  //      }
  //
  //      //arrow stem
  //      ctx.moveTo(x, y);
  //      ctx.lineTo(x, y - arrowHeight);
  //
  //      //arrouw head
  //      ctx.moveTo(x - (arrowHeight * 0.3333), y - arrowHeight + (arrowHeight * 0.3333));
  //      ctx.lineTo(x, y - arrowHeight);
  //      ctx.lineTo(x + (arrowHeight * 0.3333), y - arrowHeight + (arrowHeight * 0.3333));
  //
  //      ctx.lineJoin = 'round';
  //      ctx.stroke();
  //    };
  //
  //    var drawRouter = function () {
  //      drawCircle();
  //
  //      var rotations = [0,90,180,270];
  //      var flips = [90, 270];
  //      for (var i = 0; i < rotations.length; i++) {
  //        ctx.save();
  //        ctx.translate(xStart, yStart);
  //        ctx.rotate(rotations[i] * Math.PI / 180);
  //        ctx.translate(-xStart, -yStart);
  //        if (flips.indexOf(rotations[i]) != -1) {
  //          ctx.translate(0, arrowTotal);
  //          drawArrow(xStart, yStart, 1);
  //        }else{
  //          drawArrow(xStart, yStart, 0);
  //        }
  //        ctx.restore();
  //      }
  //    };
  //
  //    var drawLabel = function(){
  //      ctx.save();
  //      ctx.lineWidth = lineWidth;
  //      ctx.beginPath();
  //      ctx.lineCap = "round";
  //
  //      var xLineStart = xStart-(height*0.5555);
  //      var yLineStart = yStart-(height*0.3333);
  //      var lineLen = width * 0.2412;
  //      var lineHei = height * 0.1667;
  //      var lineWidth = lineHei * 0.0668;
  //
  //      ctx.fillStyle = priCol;
  //      ctx.fill();
  //      ctx.lineWidth = lineWidth;
  //      ctx.strokeStyle = secCol;
  //
  //      var curveAm = height * 0.1333;
  //
  //      ctx.moveTo(xLineStart, yLineStart);
  //      ctx.lineTo(xLineStart+lineLen, yLineStart);//top
  //      ctx.bezierCurveTo(xLineStart+lineLen+curveAm,yLineStart,
  //        xLineStart+lineLen+curveAm,yLineStart+lineHei,
  //        xLineStart+lineLen,yLineStart+lineHei);
  //      ctx.lineTo(xLineStart+lineLen, yLineStart+lineHei);//right
  //      ctx.lineTo(xLineStart, yLineStart+lineHei);//bottom
  //      ctx.bezierCurveTo(xLineStart-curveAm,yLineStart+lineHei,
  //        xLineStart-curveAm,yLineStart,
  //        xLineStart,yLineStart);
  //      ctx.lineTo(xLineStart, yLineStart);//left
  //      ctx.fill();
  //
  //      ctx.lineJoin = 'round';
  //      ctx.stroke();
  //      ctx.restore();
  //
  //      //add Text
  //      var fontSize = height * 0.1555;
  //      ctx.font = fontSize+"px arial";
  //      var xWordStart = xLineStart-(height*0.05555);
  //      var yWordStart = yLineStart + fontSize - (height * 0.011111);
  //      ctx.fillText("eBGP", xWordStart, yWordStart);
  //    };
  //
  //    drawRouter();
  //    if(toDrawLabel)
  //      drawLabel();
  //  };
  //
  //  var drawIconLine = function(posx, posy, text, toDrawLabel){
  //    ctx.beginPath();
  //    drawIcon(posx, posy, text, toDrawLabel);
  //    ctx.moveTo(posx+iconSize - 4,posy+(iconSize/2)-7);
  //    ctx.lineTo(posx+iconSize + 13 + connectorWidth,posy+iconSize/2 -7);
  //    ctx.stroke();
  //  };
  //
  //  var drawIcon = function(posx, posy, text,toDrawLabel){
  //    drawRouterIcon(posx,posy,iconSize,toDrawLabel);
  //
  //    //add Text
  //    var fontSize = 30;
  //    ctx.font = fontSize+"px arial";
  //
  //    var wordX = (iconSize - ctx.measureText(text).width) / 2;
  //
  //    ctx.fillText(text, posx + wordX, posy + iconSize + (fontSize/2));
  //  };
  //
  //  var xStart= 10;
  //  var yStart= 50;
  //
  //  //only draw after width set
  //  canvas.width = width * norepeat.length + (xStart*2) - connectorWidth;
  //
  //  drawIconLine(xStart, yStart, norepeat[0], true);
  //  for(var i =1; i < norepeat.length - 1; i++){
  //    drawIconLine(xStart + (width*i), yStart, norepeat[i], false);
  //  }
  //  drawIcon(xStart + (width*(norepeat.length-1)), yStart, norepeat[i],false);
  //
  //  //worked once cannot repeat.
  //  //ctx.font = '60px bmpsymbol';
  //  //ctx.fillText('\ue612', 10, 50);
  //
  //}])

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

    $scope.asPath={};
    var iconWidth = 50;
    var lineWidth = 100;
    var nodeWidth = iconWidth + lineWidth;

    $scope.asPath.width = "100%";
    $scope.asPath.lineWidth = lineWidth+"px";
    $scope.asPath.iconWidth = iconWidth+"px";

    //this is example later on will be revieved from the table in peerviewpeer
    $scope.path = " 64543 1221 4637 852 852 29810 29810 29810 29810 29810";
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

     /* var popOutContent = "asn:" + asname[i].asn + "<br>";
      popOutContent+= "as_name:" + asname[i].as_name + "<br>";
      popOutContent+= "org_id:" + asname[i].org_id + "<br>";
      popOutContent+= "org_name:" + asname[i].org_name + "<br>";
      popOutContent+= "remarks:" + asname[i].remarks + "<br>";
      popOutContent+= "address:" + asname[i].address + "<br>";
      popOutContent+= "city:" + asname[i].city + "<br>";
      popOutContent+= "state_prov:" + asname[i].state_prov + "<br>";
      popOutContent+= "postal_code:" + asname[i].postal_code + "<br>";
      popOutContent+= "country:" + asname[i].country;*/
     // popOutContent = popOutContent.replace(/[a-z_]*:null/gi, ' ');

     var popOutFields = ["asn","as_name","org_id","org_name","city","state_prov","postal_code","country"]; //etc
    var pcontent = "";
    for(var j = 0; j < popOutFields.length; j++){
      if(asname[i][popOutFields[j]] != null){
        pcontent+= popOutFields[j] + " : " + asname[i][popOutFields[j]] + "<br>";
        pcontent = pcontent.replace(/ASN-|ASN/g,"");
      }
    }
      //changed the name of the as to name from results.
     asname[i].as_name = asname[i].as_name.replace(/ASN-|ASN/g,"");

        $scope.as_path[index+1].topVal = asname[i].as_name;//+1 cause starting router node
        $scope.as_path[index+1].popOut = pcontent;//+1 cause starting router node

        }
      }).
      error(function (error) {
        console.log(error);
      });

      var originalLeave = $.fn.popover.Constructor.prototype.leave;
      $.fn.popover.Constructor.prototype.leave = function(obj){
        var self = obj instanceof this.constructor ?
          obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)
        var container, timeout;

        originalLeave.call(this, obj);

        if(obj.currentTarget) {
          container = $(obj.currentTarget).siblings('.popover')
          timeout = self.timeout;
          container.one('mouseenter', function(){
            //We entered the actual popover – call off the dogs
            clearTimeout(timeout);
            //Let's monitor popover content instead
            container.one('mouseleave', function(){
              $.fn.popover.Constructor.prototype.leave.call(self, self);
            });
          })
        }
      };
      $('body').popover({ selector: '[data-popover]', trigger: 'click hover', placement: 'right', delay: {show: 10, hide: 20}});



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

  }]);


 angular.module('bmpUiApp').filter('unsafe', ['$sce', function ($sce){
    return function (val){
      return $sce.trustAsHtml(val);
    };
  }]);

angular.module("template/popover/popover.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/popover/popover.html",
      "  <div class=\"arrow\"></div>\n" +
      "\n" +
      "  <div class=\"popover-inner\">\n" +
      "      <h3 class=\"popover-title\" ng-bind-html=\"title | unsafe\" ng-show=\"title\"></h3>\n" +
      "      <div class=\"popover-content\"ng-bind-html=\"content | safe\"></div>\n" +
      "  </div>\n" +
      "</div>\n" +
      "");
}]);
