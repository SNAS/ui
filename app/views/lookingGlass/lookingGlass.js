'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:WhoIsController
 * @description
 * # WhoIsController
 * Controller of the Whois page
 */
angular.module('bmpUiApp')
  .controller('lookingGlassController', ['$scope', 'apiFactory', 'uiGridConstants', function ($scope, apiFactory, uiGridConstants) {

    //DEBUG
    window.SCOPE = $scope;

    $scope.glassGridInitHeight = 300;

    $scope.glassGridOptions = {
      height: $scope.glassGridInitHeight,
      showGridFooter: true,
      enableFiltering: true,
      enableRowSelection: true,
      enableRowHeaderSelection: false,
      enableVerticalScrollbar: 1,
      enableHorizontalScrollbar: 0,
      rowTemplate: '<div class="hover-row-highlight"><div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div></div>'
    };
    $scope.glassGridOptions.glassGridIsLoad = true;

    $scope.glassGridOptions.columnDefs = [
     // {name: "wholePrefix", displayName: 'Prefix', width: "10%"},
      {name: "RouterName", displayName: 'Router', width: "15%"},
      {name: "PeerName", displayName: 'Peer', width: "20%"},
      {name: "AS_Path", displayName: 'AS Path', width: "20%"},
      {name: "Communities", displayName: 'Communities'}
    ];

    $scope.glassGridOptions.multiSelect = false;
    $scope.glassGridOptions.noUnselect = true;
    $scope.glassGridOptions.modifierKeysToMultiSelect = false;
    $scope.glassGridOptions.rowTemplate = '<div ng-click="grid.appScope.glassGridSelection();" ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>';
    $scope.glassGridOptions.onRegisterApi = function (gridApi) {
      $scope.glassGridApi= gridApi;
    };
    $scope.glassGridOptions.enableFiltering = false;
    $scope.toggleFiltering = function(){
      $scope.glassGridOptions.enableFiltering = !$scope.glassGridOptions.enableFiltering;
      $scope.glassGridApi.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
    };

    $scope.calGridHeight = function(grid, gridapi){
      gridapi.core.handleWindowResize();
      var height;
      if(grid.data.length > 10){
        height = ((10 * 30));
      }else{
        height = ((grid.data.length * 30) + 90);
      }
      grid.changeHeight = height;
      gridapi.grid.gridHeight = grid.changeHeight;
    };


    // var glassGridOptionsDefaultData = [{"RouterName": "-", "PeerName": "-", "wholePrefix": '-', 'NH': '-', 'AS_Path': '-', 'MED': '-', "LocalPref": '-'}];
  //   $scope.glassGridApi.core.handleWindowResize();
    // apiFactory.getPeerRib('195.128.159.0').
    // use another API to look for a default value, which is displayed on the page
    apiFactory.getPeerRibLookupIp('190.0.103.0').
      success(function (result) {
        // got response 
        if (!$.isEmptyObject(result)) {
          var resultData = result.v_routes.data;
          for(var i = 0; i < resultData.length; i++) {
            resultData[i].wholePrefix = resultData[i].Prefix + "/" + resultData[i].PrefixLen;
          }
          if (resultData.length == 0) { // no data
            $scope.glassGridOptions.data = [];
            $scope.glassGridOptions.showGridFooter = false;
          } else{
            $scope.glassGridOptions.data = $scope.initalRibdata = resultData;
          }
        } else { // empty response
          $scope.glassGridOptions.data = [];
            $scope.glassGridOptions.showGridFooter = false;
        }

        $scope.glassGridOptions.glassGridIsLoad = false; //stop loading

        $scope.calGridHeight($scope.glassGridOptions,$scope.glassGridApi);
      }).
      error(function (error) {
        console.log(error.message);
      });

    $scope.glassGridSelection = function(){
      $scope.values = $scope.glassGridApi.selection.getSelectedRows()[0];

        createASpath($scope.values.AS_Path);
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
    var path = path.split(" ");
    path.shift();

    $scope.norepeat = [];
    for(var i = 0; i < path.length; i++){
      if($scope.norepeat.indexOf(path[i]) == -1){
        $scope.norepeat.push(path[i]);
      }
    }

    //Router node
    var as_path=[];

    for(var i = 0; i < $scope.norepeat.length; i++){
      //AS nodes "bmp-as_router10-17"
      as_path.push({
        icon : "bmp-as_router10-17",
        topVal:$scope.norepeat[i],
        colour:"#9467b0",
        botVal:$scope.norepeat[i],
        isEnd:true,
        addWidth: nodeWidth
      });
    }

    //make last as not have connecting line
    as_path[as_path.length-1].isEnd = false;

    var asname;
    $scope.as_path = [];
    apiFactory.getWhoIsASNameList($scope.norepeat).
      success(function (result) {

        $scope.as_path = as_path;

        var asname = result.w.data;
        for(var i=0; i < asname.length; i++){
          var index = $scope.norepeat.indexOf((asname[i].asn).toString());

          //all fields/ info for popover.
          var popOutFields = ["asn","as_name","org_id","org_name","city","state_prov","postal_code","country"]; //etc
          var pcontent = "";
          for(var j = 0; j < popOutFields.length; j++){
            if(asname[i][popOutFields[j]] != null){
              pcontent+= popOutFields[j] + " : <span class='thin'>" + asname[i][popOutFields[j]] + "</span><br>";
              pcontent = pcontent.replace(/ASN-|ASN/g,"");
            }
          }
          asname[i].as_name = asname[i].as_name.replace(/ASN-|ASN/g,"");

          //changed the name of the as to name from results.
          $scope.as_path[index].topVal = asname[i].as_name;//+1 cause starting router node
          $scope.as_path[index].noTopText = false;
          $scope.as_path[index].popOut = pcontent;//+1 cause starting router node
        }

        if($scope.data.PeerASN == $scope.norepeat[0]){
          //EBGP
          $scope.as_path[0].icon = "bmp-ebgp_router10-17";
          $scope.as_path[0].colour = "#EAA546";
          $scope.as_path[0].noTopText = true;
          $scope.as_path[0].addWidth = nodeWidth + 28; //width of label from icon
        }else if($scope.data.PeerASN != $scope.norepeat[0]){
          //IBGP
          $scope.as_path = [{
            icon: "bmp-ibgp_router10-17",
            topVal: "",
            noTopText: true,
            colour: "#7bad85",
            botVal: $scope.data.PeerASN,
            isEnd: true,
            addWidth: nodeWidth + 28 //width of label from icon
          }].concat($scope.as_path);
        }

        $scope.as_path = [{
          icon: "bmp-bmp_router10-17",
          topVal: "",
          noTopText: true,
          colour: "#4b84ca",
          botVal: $scope.data.LocalASN,
          isEnd: true,
          addWidth: nodeWidth
        }].concat($scope.as_path);

        //set width of whole container depending on result size.
        //len + 1 for router     + 80 stop wrapping and padding
        $scope.asPath.width = nodeWidth * $scope.as_path.length + 80 + "px";
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
      //$('body').popover({ selector: '[data-popover]', trigger: 'click hover', placement: 'right', delay: {show: 10, hide: 20}});

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
    // IPV6 REGEX - (\d+\:\d+|\d+\s\:\s\d+|\d+\s\:\d+|\d+\:\s\d+)
    //TODO - also XXXX::XXXX: is accepted for some reason

    //Loop through data selecting and altering relevant data.
    $scope.search = function(value, init){
      if (value == "" || value == " ") {
        //when clear search populates original data.
        $scope.glassGridOptions.data = $scope.initalRibdata;
        $scope.calGridHeight($scope.glassGridOptions, $scope.glassGridApi);
        return;
      }
      //used to determine which regex's to use ipv4 || ipv6
      var whichIp;

      var ipv4Regex = /\d{1,3}\./;
      var ipv6Regex = /([0-9a-fA-F]{4}\:)|(\:\:([0-9a-fA-F]{1,4})?)/;

      if(ipv4Regex.exec(value) != null){
        whichIp = 0;
        $scope.number = angular.copy(value);
        //console.log(value);
      }else if(ipv6Regex.exec(value) != null){
        whichIp = 1;
      }else{
        //Entered Alphanumerics
        console.log('invalid search');
        $scope.glassGridOptions.data = [];
        $scope.glassGridOptions.showGridFooter = false;
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
        //Full ip with prefix or partial ip
        apiFactory.getPrefix(value).
          success(function (result) {
            if (!$.isEmptyObject(result)) {
              var resultData = result.v_routes.data;
              for(var i = 0; i < resultData.length; i++) {
                resultData[i].wholePrefix = resultData[i].Prefix + "/" + resultData[i].PrefixLen;
              }
              if (resultData.length == 0) { // no data
                $scope.glassGridOptions.data = [];
                $scope.glassGridOptions.showGridFooter = false;
              } else{
                $scope.glassGridOptions.data = resultData;
                $scope.calGridHeight($scope.glassGridOptions, $scope.glassGridApi);
              }
              
            } else{
              $scope.glassGridOptions.data = [];
              $scope.glassGridOptions.showGridFooter = false;
            }
          }).
          error(function (error) {
            console.log(error.message);
          });
      }else if(fullIpRegex.exec(value) != null){
        //full ip
        //pass in peer hash and the matched regex value
        apiFactory.getPeerRibLookupIp(value).
          success(function (result) {
            if (!$.isEmptyObject(result)) {
              var resultData = result.v_routes.data;
              for(var i = 0; i < resultData.length; i++) {
                resultData[i].wholePrefix = resultData[i].Prefix + "/" + resultData[i].PrefixLen;
              }
              if (resultData.length == 0) { // no data
                $scope.glassGridOptions.data = [];
                $scope.glassGridOptions.showGridFooter = false;
              } else{
                $scope.glassGridOptions.data = resultData;
                $scope.calGridHeight($scope.glassGridOptions, $scope.glassGridApi);
              }
              
            } else {
              $scope.glassGridOptions.data = [];
              $scope.glassGridOptions.showGridFooter = false;
            } 
          }).
          error(function (error) {
            console.log(error.message);
          });
      }else{
        //Entered Alphanumerics
      }
    };
  }]);
