'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:WhoIsController
 * @description
 * # WhoIsController
 * Controller of the Login page
 */
angular.module('bmpUiApp')
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
      "<div>  <div class=\"arrow\"></div>\n" +
       "\n" +
       "  <div class=\"popover-inner\">\n" +
       "      <h3 class=\"popover-title\" ng-bind-html=\"title | unsafe\" ng-show=\"title\"></h3>\n" +
       "      <div class=\"popover-content\"ng-bind-html=\"content | unsafe\"></div>\n" +
       "  </div>\n" +
      "</div>\n</div>" +
       "");
 }]);
