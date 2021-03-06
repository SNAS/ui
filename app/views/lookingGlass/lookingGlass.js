'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:WhoIsController
 * @description
 * # WhoIsController
 * Controller of the Whois page
 */
angular.module('bmpUiApp')
  .controller('lookingGlassController', ['$scope', '$http', 'apiFactory',
    'uiGridConstants', 'uiGridFactory', 'leafletData',
    function($scope, $http, apiFactory, uiGridConstants, uiGridFactory,
      leafletData) {

      $scope.mapHeight = $(window).height() - 220;

      $scope.tab = 'map';

      function updateLookingGlassModal(ip) {

        $scope.modalContent = "";

        // *** Set API call modal dialog for looking glass ***

        // *
        var linkUpdatesOverTime = "rib/lookup/" + ip;
        var textUpdatesOverTime = "Rib Lookup - " + ip;
        $scope.modalContent += apiFactory.createApiCallHtml(linkUpdatesOverTime, textUpdatesOverTime);

        // *
        var linkUpdatesPeers = "peer?where=routerip like '%'&withgeo";
        var textUpdatesPeers = "Peer List - " + ip;
        $scope.modalContent += apiFactory.createApiCallHtml(linkUpdatesPeers, textUpdatesPeers);

        // *
        if ($scope.values !== undefined) {

          var linkUpdatesPeerDetails = "peer/" + $scope.values["peer_hash_id"];
          var textUpdatesPeerDetails = "Peer - " + $scope.values["PeerName"];
          $scope.modalContent += apiFactory.createApiCallHtml(linkUpdatesPeerDetails, textUpdatesPeerDetails);

          var linkUpdatesPeerOriginAs = "whois/asn/" + $scope.values["Origin_AS"];
          var textUpdatesPeerOriginAs = $scope.values["PeerName"] + " - AS " + $scope.values["Origin_AS"];
          $scope.modalContent += apiFactory.createApiCallHtml(linkUpdatesPeerOriginAs, textUpdatesPeerOriginAs);

          var linkUpdatesAsPath = "whois/asn?where=w.asn in (" + $scope.norepeat.toString() + ")"
          var textUpdatesAsPath = "As Path - " + $scope.norepeat.toString();
          $scope.modalContent += apiFactory.createApiCallHtml(linkUpdatesAsPath, textUpdatesAsPath);
        }


      };

      var accessToken =
        'pk.eyJ1IjoicGlja2xlZGJhZGdlciIsImEiOiJaTG1RUmxJIn0.HV-5_hj6_ggR32VZad4Xpg';
      var mapID = 'pickledbadger.mbkpbek5';
      angular.extend($scope, {
        defaults: {
          tileLayer: 'https://{s}.tiles.mapbox.com/v4/' + mapID +
            '/{z}/{x}/{y}.png?access_token=' + accessToken,
          minZoom: 2,
          maxZoom: 15,
          zoomControl: false,
          scrollWheelZoom: false
        }
      });

      L.Control.Legend = L.Control.extend({
        options: {
          position: 'topright'
        },
        onAdd: function(map) {
          var container = L.DomUtil.create('div', null);
          container.id = 'list';
          this.colorList = L.DomUtil.create('div', null, container);
          this.colorList.id = 'colorList';
          L.DomEvent.addListener(container, 'click', filterMap, this);
          L.DomEvent.disableClickPropagation(container);
          L.DomEvent.addListener(container, 'mousewheel', function(e) {
            L.DomEvent.stopPropagation(e);
          });
          return container;
        }
      });

      function getRandomColor() {
        var letters = '012345678'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 9)];
        }
        return color
      }

      leafletData.getMap("LookingGlassMap").then(function(map) {
        $scope.map = map;
        L.control.zoomslider().addTo($scope.map);
        $scope.map.addControl(new L.Control.Legend());
      });

      var peers;
      var cluster, markerLayer, markers;
      var colorDict;

      var filterMap = function(e) {
        var filteredPrefix = e.target.innerText;
        $('[id^=legend]').removeClass('legendActive');
        $('[id="legend' + filteredPrefix + '"]').addClass('legendActive');
        markerLayer.clearLayers();
        cluster.clearLayers();
        angular.forEach(markers, function(marker) {
          if (filteredPrefix == 'ALL' || marker.options.data.wholePrefix ==
            filteredPrefix)
            marker.addTo(markerLayer);
        });
        cluster.addLayer(markerLayer);
        $scope.map.fitBounds(markerLayer.getBounds());
      };

      $scope.peerListRibClicked = function(rib) {
        var keepGoing = true;
        angular.forEach(markers, function(marker) {
          if (keepGoing)
            if (marker.options.data.rib_hash_id == rib.rib_hash_id) {
              $scope.map.fitBounds([marker.getLatLng()]);
              keepGoing = false;
            }
        });

        $scope.values = rib;
        createASpath($scope.values.AS_Path);
        //alert(JSON.stringify($scope.values));
        updateLookingGlassModal("");
        scrollToDetail();


      };

      $scope.renderMapDisplay = function(ribData) {
        if (peers == null) {
          apiFactory.getPeersAndLocationsByIp("").success(
            function(result) {
              peers = {};
              angular.forEach(result.v_peers.data, function(peer) {
                peers[peer.peer_hash_id] = peer;
              });
              $scope.renderMapDisplay(ribData);
            }).error(function(error) {
            console.log(error.message);
          });
        } else {
          if (cluster && $scope.map.hasLayer(cluster))
            $scope.map.removeLayer(cluster);

          colorDict = {};

          markers = [];

          $scope.cardPeers = {};

          cluster = L.markerClusterGroup({
            maxClusterRadius: 15,
            spiderfyDistanceMultiplier: 1.5
          }).on('clusterclick', function(a) {
            var markers = a.layer.getAllChildMarkers();
            angular.forEach($scope.cardPeers, function(value, key) {
              var peerHash = key.substring(0, key.indexOf('@'));
              var selector = $("#" + peerHash);
              var nodesSelector = $("#" + peerHash + 'nodes');
              selector.removeClass("expanded");
              nodesSelector.hide();
            });
            angular.forEach(markers, function(marker) {
              var selector = $("#" + marker.options.data.peer_hash_id);
              var nodesSelector = $("#" + marker.options.data.peer_hash_id +
                'nodes');
              selector.addClass("expanded");
              nodesSelector.show();
            });
          });
          markerLayer = new L.FeatureGroup();
          markerLayer.on('click', function(e) {
            $scope.values = e.layer.options.data;
            createASpath($scope.values.AS_Path);
            scrollToDetail();
          });
          markerLayer.on('mouseover', function(e) {
            e.layer.openPopup();
          });
          markerLayer.on('mouseout', function(e) {
            e.layer.closePopup();
          });

          angular.forEach(ribData, function(rib) {

            var peer = peers[rib.peer_hash_id];
            var color;
            if (colorDict[rib.wholePrefix] != null) {
              color = colorDict[rib.wholePrefix];
            } else {
              color = getRandomColor();
              colorDict[rib.wholePrefix] = color;
            }
            var coloredMarker = L.VectorMarkers.icon({
              markerColor: color
            });

            if (peer.latitude == null || peer.longitude == null) {
              peer.latitude = 37.3382;
              peer.longitude = -121.886;
            }

            var marker = new L.Marker([peer.latitude, peer.longitude], {
              icon: coloredMarker,
              data: rib,
              title: "Peer Name: " + peer.PeerName
            });

            var popup = 'RouterName: ' + rib.RouterName + '<br>' +
              'PeerName: ' + rib.PeerName + '<br>' +
              'Prefix: ' + rib.Prefix + '<br>' +
              'PrefixLen: ' + rib.PrefixLen + '<br>' +
              'AS_Path: ' + rib.AS_Path;

            if ((peer.peer_hash_id + '@' + peer.PeerName) in $scope.cardPeers) {
              $scope.cardPeers[peer.peer_hash_id + '@' + peer.PeerName]
                .push(rib);
            } else {
              $scope.cardPeers[peer.peer_hash_id + '@' + peer.PeerName] = [
                rib
              ];
            }

            marker.bindPopup(popup);
            marker.addTo(markerLayer);
            markers.push(marker);
          });

          $('#colorList')[0].innerHTML =
            '<p id="legendALL" class="btn btn-block btn-sm legendActive" style="background-color:white;color:black;">ALL</p>';

          angular.forEach(colorDict, function(value, key) {

            $('#colorList')[0].innerHTML += '<p id="legend' + key +
              '" class="btn btn-block btn-sm" style="background-color:' +
              value + '">' + key + '</p>';

          });

          $scope.map.addLayer(cluster.addLayer(markerLayer));

          if ($scope.tab == "map")
            $scope.map.fitBounds(markerLayer.getBounds());
        }
      };

      //DEBUG
      window.SCOPE = $scope;

      $scope.glassGridInitHeight = 300;

      $scope.togglePeerSelection = function(peerHash) {
        var selector = $("#" + peerHash);
        var nodesSelector = $("#" + peerHash + 'nodes');
        if (!selector.hasClass("expanded")) {
          selector.addClass("expanded");
          nodesSelector.show();
        } else {
          selector.removeClass("expanded");
          nodesSelector.hide();
        }
      };

      $scope.cardPeers = {}; //used for card

      $scope.glassGridOptions = {
        height: $scope.glassGridInitHeight,
        showGridFooter: true,
        enableFiltering: true,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        enableVerticalScrollbar: 1,
        enableHorizontalScrollbar: 0
      };
      $scope.glassGridOptions.glassGridIsLoad = true;

      $scope.glassGridOptions.columnDefs = [{
        name: "wholePrefix",
        displayName: 'Prefix',
        width: "10%",
        cellTemplate: '<div class="ui-grid-cell-contents" bmp-prefix-tooltip prefix="{{ COL_FIELD }}"></div>'
      }, {
        name: "RouterName",
        displayName: 'Router',
        width: "15%"
      }, {
        name: "PeerName",
        displayName: 'Peer',
        width: "20%"
      }, {
        name: "AS_Path",
        displayName: 'AS Path',
        width: "20%"
      }, {
        name: "Communities",
        displayName: 'Communities'
      }, {
        name: "isWithdrawn",
        displayName: 'Status',
        cellFilter: 'statusFilter'
      }];

      $scope.glassGridOptions.multiSelect = false;
      $scope.glassGridOptions.noUnselect = true;
      $scope.glassGridOptions.modifierKeysToMultiSelect = false;
      $scope.glassGridOptions.rowTemplate =
        '<div class="hover-row-highlight"><div ng-click="grid.appScope.glassGridSelection();" ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div></div>';
      $scope.glassGridOptions.onRegisterApi = function(gridApi) {
        $scope.glassGridApi = gridApi;
      };
      $scope.glassGridOptions.enableFiltering = false;
      $scope.toggleFiltering = function() {
        $scope.glassGridOptions.enableFiltering = !$scope.glassGridOptions.enableFiltering;
        $scope.glassGridApi.core.notifyDataChange(uiGridConstants.dataChange
          .COLUMN);
      };

      // use another API to look for a default value, which is displayed on the page
      apiFactory.getPeerRibLookupIp('190.0.103.0').success(function(result) {
        // got response
        if (!$.isEmptyObject(result)) {
          var resultData = result.v_all_routes.data;

          if (resultData.length == 0) { // no data
            $scope.glassGridOptions.data = [];
            $scope.glassGridOptions.showGridFooter = false;
          } else {
            for (var i = 0; i < resultData.length; i++) {
              resultData[i].wholePrefix = resultData[i].Prefix + "/" +
                resultData[i].PrefixLen;
            }
            $scope.glassGridOptions.data = $scope.initalRibdata =
              resultData;
            $scope.renderMapDisplay(resultData);
            uiGridFactory.calGridHeight($scope.glassGridOptions, $scope.glassGridApi);
          }
        } else { // empty response
          $scope.glassGridOptions.data = [];
          $scope.glassGridOptions.showGridFooter = false;
        }
        $scope.glassGridOptions.glassGridIsLoad = false; //stop loading

        updateLookingGlassModal('190.0.103.0');
      }).error(function(error) {
        console.log(error.message);
      });

      $scope.glassGridSelection = function() {
        $scope.values = $scope.glassGridApi.selection.getSelectedRows()[0];
        createASpath($scope.values.AS_Path);
        scrollToDetail();
      };

      function scrollToDetail() {
        if ($("#detailView")[0] != null)
          $('html, body').animate({
            scrollTop: $("#detailView").offset().top + $("#detailView").outerHeight(
              true) - $(window).height()
          }, 600);
        else
          setTimeout(function() {
            scrollToDetail();
          }, 250);
      }


      var createASpath = function(path) {
        //e.g. " 64543 1221 4637 852 852 29810 29810 29810 29810 29810"
        $scope.asPath = {};
        var iconWidth = 50;
        var lineWidth = 100;
        var nodeWidth = iconWidth + lineWidth;

        $scope.asPath.width = "100%";
        $scope.asPath.lineWidth = lineWidth + "px";
        $scope.asPath.iconWidth = iconWidth + "px";

        //this is example later on will be revieved from the table in peerviewpeer
        var path = path.split(" ");
        path.shift();

        $scope.norepeat = [];
        for (var i = 0; i < path.length; i++) {
          if ($scope.norepeat.indexOf(path[i]) == -1 && path[i] != '}' && path[i] != '{') {
            $scope.norepeat.push(path[i]);
          }
        }

        //Router node
        var as_path = [];

        for (var i = 0; i < $scope.norepeat.length; i++) {
          //AS nodes "bmp-as_router10-17"
          as_path.push({
            icon: "bmp-as_router10-17",
            topVal: $scope.norepeat[i],
            colour: "#9467b0",
            botVal: $scope.norepeat[i],
            isEnd: true,
            addWidth: nodeWidth
          });
        }

        //make last as not have connecting line
        as_path[as_path.length - 1].isEnd = false;

        var asname;
        $scope.as_path = [];
        apiFactory.getWhoIsASNameList($scope.norepeat).success(function(
          result) {

          $scope.as_path = as_path;

          var asname = result.w.data;
          for (var i = 0; i < asname.length; i++) {
            var index = $scope.norepeat.indexOf((asname[i].asn).toString());

            //all fields/ info for popover.
            var popOutFields = ["asn", "as_name", "org_id", "org_name",
              "city", "state_prov", "postal_code", "country"
            ]; //etc
            var pcontent = "";
            for (var j = 0; j < popOutFields.length; j++) {
              if (asname[i][popOutFields[j]] != null) {
                pcontent += popOutFields[j] + " : <span class='thin'>" +
                  asname[i][popOutFields[j]] + "</span><br>";
                pcontent = pcontent.replace(/ASN-|ASN/g, "");
              }
            }
            asname[i].as_name = asname[i].as_name.replace(/ASN-|ASN/g,
              "");

            //changed the name of the as to name from results.
            $scope.as_path[index].topVal = asname[i].as_name; //+1 cause starting router node
            $scope.as_path[index].noTopText = false;
            $scope.as_path[index].popOut = pcontent; //+1 cause starting router node
          }

          if ($scope.values.PeerASN == $scope.norepeat[0]) {
            //EBGP
            $scope.as_path[0].icon = "bmp-ebgp_router10-17";
            $scope.as_path[0].colour = "#EAA546";
            $scope.as_path[0].noTopText = true;
            $scope.as_path[0].addWidth = nodeWidth + 28; //width of label from icon
          } else if ($scope.values.PeerASN != $scope.norepeat[0]) {
            //IBGP
            $scope.as_path = [{
              icon: "bmp-ibgp_router10-17",
              topVal: "",
              noTopText: true,
              colour: "#7bad85",
              botVal: $scope.values.PeerASN,
              isEnd: true,
              addWidth: nodeWidth + 28 //width of label from icon
            }].concat($scope.as_path);
          }

          $scope.as_path = [{
            icon: "bmp-bmp_router10-17",
            topVal: "",
            noTopText: true,
            colour: "#4b84ca",
            botVal: $scope.values.LocalASN,
            isEnd: true,
            addWidth: nodeWidth
          }].concat($scope.as_path);

          //set width of whole container depending on result size.
          //len + 1 for router     + 80 stop wrapping and padding
          $scope.asPath.width = nodeWidth * $scope.as_path.length + 80 +
            "px";
        }).error(function(error) {
          console.log(error);
        });

        var originalLeave = $.fn.popover.Constructor.prototype.leave;
        $.fn.popover.Constructor.prototype.leave = function(obj) {
          var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget)[this.type](this.getDelegateOptions())
            .data('bs.' + this.type)
          var container, timeout;

          originalLeave.call(this, obj);

          if (obj.currentTarget) {
            container = $(obj.currentTarget).siblings('.popover')
            timeout = self.timeout;
            container.one('mouseenter', function() {
              //We entered the actual popover – call off the dogs
              clearTimeout(timeout);
              //Let's monitor popover content instead
              container.one('mouseleave', function() {
                $.fn.popover.Constructor.prototype.leave.call(
                  self, self);
              });
            })
          }
        };
        //$('body').popover({ selector: '[data-popover]', trigger: 'click hover', placement: 'right', delay: {show: 10, hide: 20}});

        //for the tooltip
        $scope.wordCheck = function(word) {
          if (word.length > 6) {
            return word.slice(0, 4) + " ...";
          } else {
            return word;
          }
        };

      };

      //--------------------------------------- SEARCH --------------------------------------------//

      $scope.searchOptions = [
        'Prefix/IP',
        'Hostname'
        // 'Community'
      ];
      $scope.searchOption = 'Prefix/IP';
      $scope.searchKeywords = {};
      $scope.searchParams = {};

      $scope.preSearch = function() {
        $scope.glassGridOptions.glassGridIsLoad = true;
        $scope.p2 = [];
        $scope.ipAddr = [];
        if ($scope.searchOption == 'Prefix/IP') {
          // $scope.search($("#prefixSearchBox").val());
          $scope.search($scope.searchKeywords.prefix);
        } else if ($scope.searchOption == 'Hostname') {
          $scope.search($scope.searchKeywords.hostname);
        } else if ($scope.searchOption == 'Community') {
          var part1 = $scope.searchKeywords.part1;
          var part2 = $scope.searchKeywords.part2;
          var community = part1 + ":" + part2;
          $scope.searchCommunity(community);
        }
      };

      $scope.searchCommunity = function(keywords) {
        $scope.glassGridOptions.glassGridIsLoad = true;
        $scope.glassGridOptions.data = [];
        apiFactory.getPrefixByCommunity(keywords)
          .success(function(data) {
            var resultData = data.Community.data.data;
            for (var i = 0; i < resultData.length; i++) {
              resultData[i].wholePrefix = resultData[i].Prefix + "/" +
                resultData[i].PrefixLen;
            }
            if (resultData.length == 0) { // no data
              $scope.glassGridOptions.data = [];
              $scope.glassGridOptions.showGridFooter = false;
            } else {
              $scope.glassGridOptions.data = resultData;
              $scope.renderMapDisplay(resultData);
              uiGridFactory.calGridHeight($scope.glassGridOptions, $scope
                .glassGridApi);
            }
            $scope.glassGridOptions.glassGridIsLoad = false;
          });
      };

      $scope.part1Lookup = function(value) {
        if (value.indexOf(":") == -1) {
          return apiFactory.getCommP1Suggestions(value).then(function(
            response) {
            return response.data.Community.data.data.map(function(item,
              key) {
              return item['part1'];
            })
          })
        }
      };

      $scope.onSelectPart1 = function($item, $model, $label) {
        $scope.p2 = [];
        $scope.selectedPart1 = $label;
        apiFactory.getCommP2ByP1($label)
          .success(function(data) {
            data = data.Community.data.data;
            $scope.p2 = data.sort(function(a, b) {
              if (a.count > b.count) {
                return 1;
              }
              if (a.count < b.count) {
                return -1;
              }
              return 0;
            });
          })
      };

      $scope.onSelectPart2 = function($item, $model, $label) {
        var community = $scope.selectedPart1 + ":" + $label;
        $scope.searchCommunity(community);
      };

      $scope.compareP2 = function(actual, expected) {
        return actual.toString().indexOf(expected, 0) === 0;
      };

      //TODO - ATM IPV6 with XXXX:0:  not accepted need to add place to fill zero's
      // IPV6 REGEX - (\d+\:\d+|\d+\s\:\s\d+|\d+\s\:\d+|\d+\:\s\d+)
      //TODO - also XXXX::XXXX: is accepted for some reason
      var ipv4Regex = /\d{1,3}\./;
      var ipv6Regex = /([0-9a-fA-F]{1,4}\:)|(\:\:([0-9a-fA-F]{1,4})?)/;
      $scope.dnsLookup = function(value) {
        $scope.ipAddr = [];
        if (ipv4Regex.exec(value) == null && ipv6Regex.exec(value) == null) {
          return apiFactory.lookupDNS(value).then(function(response) {
            return response.data.data.map(function(item, key) {
              $scope.ipAddr.push(item["IPAddr" + key]);
              return item["IPAddr" + key];
            })
          });
        } else {
          return [];
        }
      };

      $scope.onSelectHostname = function($item, $model, $label) {
        $scope.search($label);
      };

      //Loop through data selecting and altering relevant data.
      $scope.search = function(value) {
        //used to determine which regex's to use ipv4 || ipv6
        var isIPv6;
        if (ipv4Regex.exec(value) != null) {
          isIPv6 = 0;
          $scope.number = angular.copy(value);
          //console.log(value);
        } else if (ipv6Regex.exec(value) != null) {
          isIPv6 = 1;
        } else {
          //Entered Alphanumerics
          console.log('invalid search');
          $scope.glassGridOptions.glassGridIsLoad = false;
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
          [
            /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(\d|[12]\d|3[0-2])$/,
            /^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])\/(12[0-8]|1[0-1][0-9]|[0-9]{1,2})$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*\/(12[0-8]|1[0-1][0-9]|[0-9]{1,2})$/
          ],
          [
            /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
            /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/
          ],
          [/^(\d{1,3}\.){0,2}\d{1,3}\.?$/,
            /^([0-9a-fA-F]{1,4}\:){0,7}[0-9a-fA-F]{1,4}\:{1,2}?$/
          ]
        ];

        var fullIpWithPreLenReg = regexs[0][isIPv6];
        var fullIpRegex = regexs[1][isIPv6];
        var partCompIpRegex = regexs[2][isIPv6];

        if ($scope.isAggregate && value.indexOf('/') != -1) {
          value = value.split('/')[0];
        }

        if (fullIpWithPreLenReg.exec(value) != null || partCompIpRegex.exec(
            value) != null) {
          //prefix with len or partial prefix

          if (!$.isEmptyObject($scope.searchParams)) {
            value += '?';
            for (var key in $scope.searchParams) {
              var val = $scope.searchParams[key];
              if (val) {
                value += key.substring(2).toLowerCase() + '&';
              }
            }
            value = value.substring(0, value.length - 1);
          }

          apiFactory.getPrefix(value).success(function(result) {
            if (!$.isEmptyObject(result)) {
              var resultData = result.v_all_routes.data;

              for (var i = 0; i < resultData.length; i++) {
                resultData[i].wholePrefix = resultData[i].Prefix + "/" +
                  resultData[i].PrefixLen;
              }
              if (resultData.length == 0) { // no data
                $scope.glassGridOptions.data = [];
                $scope.glassGridOptions.showGridFooter = false;
              } else {
                $scope.glassGridOptions.showGridFooter = true;
                $scope.glassGridOptions.data = resultData;
                $scope.renderMapDisplay(resultData);
                uiGridFactory.calGridHeight($scope.glassGridOptions,
                  $scope.glassGridApi);
              }

            } else {
              $scope.glassGridOptions.data = [];
              $scope.glassGridOptions.showGridFooter = false;
            }
            $scope.glassGridOptions.glassGridIsLoad = false;
          }).error(function(error) {
            console.log(error.message);
          });
        } else if (fullIpRegex.exec(value) != null) {
          //full ip
          if (!$.isEmptyObject($scope.searchParams)) {
            value += '?';
            for (var key in $scope.searchParams) {
              var val = $scope.searchParams[key];
              if (val) {
                value += key.substring(2).toLowerCase() + '&';
              }
            }
            value = value.substring(0, value.length - 1);
          }
          apiFactory.getPeerRibLookupIp(value).success(function(result) {
            if (!$.isEmptyObject(result)) {

              //alert(JSON.stringify(result));
              var resultData = result.v_all_routes.data;

              for (var i = 0; i < resultData.length; i++) {
                resultData[i].wholePrefix = resultData[i].Prefix + "/" +
                  resultData[i].PrefixLen;
              }
              if (resultData.length == 0) { // no data
                $scope.glassGridOptions.data = [];
                $scope.glassGridOptions.showGridFooter = false;
              } else {
                $scope.glassGridOptions.showGridFooter = true;
                $scope.glassGridOptions.data = resultData;
                $scope.renderMapDisplay(resultData);
                uiGridFactory.calGridHeight($scope.glassGridOptions,
                  $scope.glassGridApi);
              }
            } else {
              $scope.glassGridOptions.data = [];
              $scope.glassGridOptions.showGridFooter = false;
            }
            $scope.glassGridOptions.glassGridIsLoad = false;
          }).error(function(error) {
            console.log(error.message);
          });
        } else {
          console.log('invalid input');
        }
      };

      $scope.changeTab = function(value) {
        $scope.tab = value;
        if (value == 'map') {
          $scope.map.invalidateSize(false);
          $scope.map.fitBounds(markerLayer.getBounds());


        }
      }

    }
  ]);
