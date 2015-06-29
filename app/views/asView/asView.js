//'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:ASViewController
 * @description
 * # ASViewController
 * Controller of the AS View page
 */
angular.module('bmpUiApp')
  .controller('ASViewController', ['$scope', 'apiFactory', '$timeout', '$stateParams', 'uiGridConstants',
    function ($scope, apiFactory, $timeout, $stateParams, uiGridConstants) {

      var suggestions = [];
      var upstreamData, downstreamData;
      var upstreamPromise, downstreamPromise;
      var nodes = [], links = [], nodeSet = [];
      var id = 0;
      var topo = {};
      var width = 1150;
      var topoHeight = 800;
      var space = width;

      $scope.prefixGridInitHeight = 464;
      $scope.upstreamGridInitHeight = 464;
      $scope.downstreamGridInitHeight = 464;

      $scope.nodata = false;
      $scope.upstreamNodata = false;
      $scope.downstreamNodata = false;

      //prefix table options
      $scope.prefixGridOptions = {
        rowHeight: 32,
        gridFooterHeight: 0,
        showGridFooter: true,
        enableFiltering: true,
        height: $scope.prefixGridInitHeight,
        changeHeight: $scope.prefixGridInitHeight,
        enableHorizontalScrollbar: 0,
        enableVerticalScrollbar: 1,
        columnDefs: [
          {
            name: "prefixWithLen", displayName: 'Prefix', width: '*'
            //sortingAlgorithm: addressSort
          },
          {
            name: "IPv", displayName: 'IPv', width: '*', visible: false,
            sort: {
              direction: uiGridConstants.ASC
            }
          }
        ],
        onRegisterApi: function (gridApi) {
          $scope.prefixGridApi = gridApi;
        }
      };

      //upstream table options
      $scope.upstreamGridOptions = {
        enableColumnResizing: true,
        rowHeight: 32,
        gridFooterHeight: 0,
        showGridFooter: true,
        height: $scope.upstreamGridInitHeight,
        changeHeight: $scope.upstreamGridInitHeight,
        enableHorizontalScrollbar: 0,
        enableVerticalScrollbar: 1,
        columnDefs: [
          {
            name: "asn", displayName: 'ASN', width: '30%',
            cellTemplate: '<div class="ui-grid-cell-contents"><div bmp-asn-model asn="{{ COL_FIELD }}"></div></div>'
          },
          {name: "as_name", displayName: 'AS Name', width: '70%'}
        ],
        onRegisterApi: function (gridApi) {
          $scope.upstreamGridApi = gridApi;
        }
      };

      //downstream table options
      $scope.downstreamGridOptions = {
        enableColumnResizing: true,
        rowHeight: 32,
        gridFooterHeight: 0,
        showGridFooter: true,
        height: $scope.downstreamGridInitHeight,
        changeHeight: $scope.downstreamGridInitHeight,
        enableHorizontalScrollbar: 0,
        enableVerticalScrollbar: 1,
        columnDefs: [
          {
            name: "asn",
            displayName: 'ASN',
            width: '30%',
            cellTemplate: '<div class="ui-grid-cell-contents"><div bmp-asn-model asn="{{ COL_FIELD }}"></div></div>'
          },
          {name: "as_name", displayName: 'AS Name', width: '70%'}
        ],
        onRegisterApi: function (gridApi) {
          $scope.downstreamGridApi = gridApi;
        }
      };


      $scope.calGridHeight = function (grid, gridapi) {
        gridapi.core.handleWindowResize();

        var height;
        var dataLength = 15;
        if (grid.data.length > dataLength) {
          height = (dataLength * 30);
        } else {
          height = ((grid.data.length * grid.rowHeight) + 50);
        }
        grid.changeHeight = height;
        gridapi.grid.gridHeight = grid.changeHeight;
      };

      //Waits a bit for user to contiune typing.
      $scope.enterValue = function (value) {
        $timeout(function () {
          if (value) {
            if (value == $scope.searchValue) {
              if (isNaN($scope.searchValue)) {
                predictiveSearch();
              }
              else {
                searchValue();
              }
            }
          }
        }, 500);
      };

      $scope.keypress = function (keyEvent) {
        if (keyEvent.which === 13)
          searchValue($scope.searchValue);
      };

      //Main function
      $(function () {
        //predictive search
        $("#suggestions").autocomplete({
          source: suggestions,
          autoFocus: true,
          minLength: 2,
          delay: 1000,
          select: function (event, ui) {
            apiFactory.getWhoIsASName(ui.item.value).
              success(function (result) {
                var data = result.w.data;
                getData(data);
              }).
              error(function (error) {

                console.log(error.message);
              });
          }
        });

        //initial search
        if ($stateParams.as) {
          $scope.searchValue = $stateParams.as;
        }
        else {
          $scope.searchValue = 109;
        }
        topoInit();
        searchValue();
      });

      //complete the search field automatically while searching AS name
      function predictiveSearch() {
        apiFactory.getWhoIsASNameLike($scope.searchValue, 10).success(function (result) {
          if (result.w.size != 0) {
            var data = result.w.data;
            for (var i = 0; i < result.w.size; i++) {
              suggestions.push(data[i].as_name);
            }
          }
        })
          .error(function () {
            console.log(error.message);
          });
      }

      //get all the information of this AS
      function searchValue() {
        if (isNaN($scope.searchValue)) {
          apiFactory.getWhoIsASName($scope.searchValue).
            success(function (result) {
              var data = result.w.data;
              getData(data);
            }).
            error(function (error) {

              console.log(error.message);
            });
        }
        else {
          apiFactory.getWhoIsASN($scope.searchValue).
            success(function (result) {
              var data = result.gen_whois_asn.data;
              getData(data);
            }).
            error(function (error) {

              console.log(error.message);
            });
        }
      }

      //get data about details, prefixes, upstream and downstream
      function getData(data) {
        if (data.length != 0) {
          $scope.asn = data[0].asn;
          getDetails(data[0]);
          getPrefixes();
          getUpstream();
          getDownstream();

          $scope.topologyIsLoad = true; //start loading
          downstreamPromise.success(function () {
            upstreamPromise.success(function () {
              topoClear();
              drawTopology(data[0]);
            });
          });

          $scope.nodata = false;
        }
        else {
          $scope.nodata = true;
        }
      }

      //Get detailed information of this AS
      function getDetails(data) {
        var keys = Object.keys(data);
        var showValues = '<table class="tableStyle"><tbody>';

        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          if (key != "raw_output" && key != "remarks") {
            if (key == "transit_v4_prefixes")
              showValues += '<tr class="hoz-line"><td colspan="2"><hr></td></tr>';

            var value = data[key];
            showValues += (
            '<tr>' +
            '<td>' +
            key + ' ' +
            '</td>' +

            '<td>' +
            value +
            '</td>' +
            '</tr>'
            );
          }
        }
        showValues += '</tbody></table>';
        $scope.details = showValues;
      }

      //Get prefixes information of this AS
      function getPrefixes() {
        $scope.prefixGridOptions.data = [];
        $scope.prefixIsLoad = true; //begin loading
        apiFactory.getRIBbyASN($scope.asn).
          success(function (result) {
            var data = result.v_routes.data;
            for (var i = 0; i < result.v_routes.size; i++) {
              data[i].prefixWithLen = data[i].Prefix + "/" + data[i].PrefixLen;
              data[i].IPv = (data[i].isIPv4 === 1) ? '4' : '6';
            }
            $scope.prefixGridOptions.data = data;
            $scope.prefixIsLoad = false; //stop loading
            $scope.calGridHeight($scope.prefixGridOptions, $scope.prefixGridApi);
          }).
          error(function (error) {

            console.log(error.message);
          });
      }

      //Get upstream data
      function getUpstream() {
        upstreamData = [];
        $scope.upstreamIsLoad = true; //begin loading
        $scope.upstreamGridOptions.data = [];
        upstreamPromise = apiFactory.getUpstream($scope.asn);
        upstreamPromise.success(function (result) {
          upstreamData = result.upstreamASN.data;
          if (result.upstreamASN.data.size == 0) {
            $scope.upstreamNodata = true;
          }
          else {
            $scope.upstreamGridOptions.data = upstreamData;
            $scope.calGridHeight($scope.upstreamGridOptions, $scope.upstreamGridApi);
            $scope.upstreamIsLoad = false; //stop loading
            $scope.upstreamNodata = false;
          }
        }).
          error(function (error) {

            console.log(error.message);
          });
      }

      //Get downstream data
      function getDownstream() {
        downstreamData = [];
        $scope.downstreamIsLoad = true; //begin loading
        $scope.downstreamGridOptions.data = [];
        downstreamPromise = apiFactory.getDownstream($scope.asn);
        downstreamPromise.success(function (result) {
          downstreamData = result.downstreamASN.data;
          if (result.downstreamASN.data.size == 0) {
            $scope.downstreamNodata = true;
            $scope.downstreamIsLoad = false; //stop loading
          }
          else {
            $scope.downstreamGridOptions.data = downstreamData;
            $scope.calGridHeight($scope.downstreamGridOptions, $scope.downstreamGridApi);
            $scope.downstreamIsLoad = false; //stop loading
            $scope.downstreamNodata = false;
          }
        }).
          error(function (error) {

            console.log(error.message);
          });
      }


      //topology initialization
      function topoInit() {
        var App = nx.define(nx.ui.Application, {
          methods: {
            getContainer: function (comp) {
              return new nx.dom.Element(document.getElementById('AS_topology'));
            },
            start: function () {
              topo = new nx.graphic.Topology({
                width: width,
                height: topoHeight,
                padding: 10,
                //adaptive: true,
                enableSmartLabel: true,
                nodeConfig: {
                  label: 'model.asn',
                  iconType: 'model.iconType'
                },
                nodeSetConfig: {
                  label: function (model) {
                    var label = model._data.name;
                    return label.slice(0,2).toUpperCase();
                  },
                  iconType: 'model.iconType'
                },
                tooltipManagerConfig: {
                  nodeTooltipContentClass: 'MyNodeTooltip'
                },
                identityKey: 'id',
                showIcon: true
              });
              topo.view('stage').upon('mousewheel', function (sender, event) {
                return false;
              });
              topo.attach(this);

              topo.registerScene('nodeset', 'NodeSetScene');
              topo.activateScene('nodeset');

              //topo.upon('clickNodeSet', function (sender, nodeset) {
              //  var id = nodeset._model._data.id;
              //  var level = nodeset._model._data.level;
              //  var nodeSetLayer = topo.getLayer('nodeSet');
              //  var nodeSets = nodeSetLayer.nodeSets();
              //  for (var i = 0; i < nodeSets.length; i++) {
              //    if (id == nodeSets[i]._model._data.id) {
              //      nodeSets[i].collapsed(false);
              //    }
              //    else if (level == nodeSets[i]._model._data.level && nodeSets[i].collapsed() == false) {
              //      var ns = nodeSets[i];
              //      setTimeout(function () {
              //        (function (ns) {
              //          ns.collapsed(true);
              //        })(ns);
              //      }, 0);
              //      console.log(nodeSets[i]);
              //    }
              //  }
              //  //nodeSetLayer.nodeSetDictionary().getItem(id).collapsed(false);
              //  //console.log(nodeSetLayer.nodeSetDictionary().getItem(id));
              //
              //  //return true;
              //  return false;
              //});
            }
          }
        });
        var app = new App();
        app.start();
      }

      function topoClear() {
        nodes = [];
        links = [];
        nodeSet = [];
        id = 0;

        var topologyData = {
          nodes: nodes,
          links: links,
          nodeSet: nodeSet
        };

        if (topo) {
          topo.data(topologyData);
        }
      }

      //draw AS topology with current AS in the middle
      function drawTopology(data) {
        var upstreamLayerHeight = width / 5;
        var downstreamLayerHeight = width / 5;

        //current AS
        nodes.push({
          id: id++,
          asn: data.asn,
          as_name: data.as_name,
          org_name: data.org_name,
          city: data.city,
          state_prov: data.state_prov,
          country: data.country,
          type: "local",
          iconType: 'groupS',
          x: width / 2,
          y: 0
        });

        space = width/upstreamData.length;
        pushNodes(upstreamData, "upstream", width, -upstreamLayerHeight);
        pushNodes(downstreamData, "downstream", width, downstreamLayerHeight);
        var upstreamNodeSetCount = 0;

        //Upstream ASes
        if (upstreamData.length > 100) {
          groupNode(upstreamData, -1, width/2, "upstream", "country", -upstreamLayerHeight);
          var upCountrySetCount = nodeSet.length;
          for (var i = 0; i < upCountrySetCount; i++) {
            groupNode(nodeSet[i].allNodes, nodeSet[i].id, nodeSet[i].x, "upstream", "state_prov", -2 * upstreamLayerHeight);
          }
          var upStateSetCount = nodeSet.length - upCountrySetCount;
          for (var i = upCountrySetCount; i < upCountrySetCount + upStateSetCount; i++) {
            groupNode(nodeSet[i].allNodes, nodeSet[i].id, nodeSet[i].x, "upstream", "city", -3 * upstreamLayerHeight);
          }
          var upCitySetCount = nodeSet.length - upCountrySetCount - upStateSetCount;
          for (var i = upCountrySetCount + upStateSetCount; i < upCountrySetCount + upStateSetCount + upCitySetCount; i++) {
            groupNode(nodeSet[i].allNodes, nodeSet[i].id, nodeSet[i].x, "upstream", "", -4 * upstreamLayerHeight);
          }
          upstreamNodeSetCount = nodeSet.length;
        }
        else {
          for (var i = 1; i <= upstreamData.length; i++) {
            links.push({
              source: i,
              target: 0
            });
          }
        }

        //Downstream ASes
        if (downstreamData.length > 100) {
          groupNode(downstreamData, -1, width / 2, "downstream", "country", downstreamLayerHeight);
          var downCountrySetCount = nodeSet.length - upstreamNodeSetCount;
          for (var i = upstreamNodeSetCount; i < upstreamNodeSetCount + downCountrySetCount; i++) {
            groupNode(nodeSet[i].allNodes, nodeSet[i].id, nodeSet[i].x, "downstream", "state_prov", 2 * downstreamLayerHeight);
          }
          var downStateSetCount = nodeSet.length - upstreamNodeSetCount - downCountrySetCount;
          for (var i = upstreamNodeSetCount + downCountrySetCount; i < upstreamNodeSetCount + downCountrySetCount + downStateSetCount; i++) {
            groupNode(nodeSet[i].allNodes, nodeSet[i].id, nodeSet[i].x, "downstream", "city", 3 * downstreamLayerHeight);
          }
          var downCitySetCount = nodeSet.length - upstreamNodeSetCount - downCountrySetCount - downStateSetCount;
          for (var i = upstreamNodeSetCount + downCountrySetCount + downStateSetCount;
               i < upstreamNodeSetCount + downCountrySetCount + downStateSetCount + downCitySetCount; i++) {
            if(!nodeSet[i]){
             console.log(i);
            }
            groupNode(nodeSet[i].allNodes, nodeSet[i].id, nodeSet[i].x, "downstream", "", 4 * downstreamLayerHeight);
          }
        }
        else {
          for (var i = upstreamData.length + 1; i < upstreamData.length + downstreamData.length + 1; i++) {
            links.push({
              source: i,
              target: 0
            });
          }
        }

        var topologyData = {
          nodes: nodes,
          links: links,
          nodeSet: nodeSet
        };

        topo.data(topologyData);

        $scope.topologyIsLoad = false; //stop loading
      }

      //Group nodes by the initial of  AS name
      function groupNode(data, parentNodeSetId, parentNodeSetX, type, key, height) {
        //function groupNode(data, parentNodeSetId, type, key, positionStart, width, height) {
        var nodeSet1 = {}, nodeSet2 = {};
        var singleNodes = [];
        var groupedNodesId = [];

        var parentNodeSetIndex = getNodeSetIndex(parentNodeSetId);

        //Group the nodes by key
        if (key != "") {
          //if (key != "" || (nodeSetId != -1 &&nodeSet[nodeSetId].name != null)) {
          for (var i = 0; i < data.length; i++) {
            if (key == "country") {
              if (!nodeSet1[data[i].country]) {
                nodeSet1[data[i].country] = [];
              }
              nodeSet1[data[i].country].push(data[i]);
            }
            else if (key == "state_prov") {
              if (!nodeSet1[data[i].state_prov]) {
                nodeSet1[data[i].state_prov] = [];
              }
              nodeSet1[data[i].state_prov].push(data[i]);
            }
            else if (key == "city") {
              if (!nodeSet1[data[i].city]) {
                nodeSet1[data[i].city] = [];
              }
              nodeSet1[data[i].city].push(data[i]);
            }
          }
          var nodeSet1Keys = Object.keys(nodeSet1).sort();

          //If a group only have one node, push it into single nodes. If not, take it as a nodeSet.
          for (var i = 0; i < nodeSet1Keys.length; i++) {
            if (nodeSet1[nodeSet1Keys[i]].length > 1) {
              nodeSet2[nodeSet1Keys[i]] = nodeSet1[nodeSet1Keys[i]];
            }
            else {
              singleNodes.push(nodeSet1[nodeSet1Keys[i]][0]);
            }
          }
          var nodeSet2Keys = Object.keys(nodeSet2);
        }
        else {
          var nodeSet2Keys = [];
          singleNodes = data;
        }

        var nodesCount = singleNodes.length + nodeSet2Keys.length;
        //var width2 = (parentNodeSetX < width - parentNodeSetX) ? parentNodeSetX * 2 : (width - parentNodeSetX) * 2;
        //var space = (nodesCount == 1) ? 0 : width2 / (nodesCount - 1) ;
        var startPosition = parentNodeSetX - space * (nodesCount - 1) / 2;
        //var startPosition = (parentNodeSetX < width - parentNodeSetX) ? 0 : width - width2;

        //push all the single nodes
        for (var i = 0; i < singleNodes.length; i++) {
          var nodeId = getNodeId(singleNodes[i].asn, type);
          if (nodeId >= 0) {
            if (nodesCount == 1) {
              nodes[nodeId].x = width / 2;
            }
            else {
              nodes[nodeId].x = startPosition + (i < singleNodes.length / 2 ? i * space : (nodeSet2Keys.length + i) * space);
            }
            nodes[nodeId].y = height;
            groupedNodesId.push(nodes[nodeId].id);

            links.push({
              source: nodes[nodeId].id,
              target: parentNodeSetId + 1
            });
          }
        }

        //push nodeSet
        for (var i = 0; i < nodeSet2Keys.length; i++) {
          nodeSet.push({
            id: id++,
            type: type,
            //type: 'nodeSet',
            nodes: [],
            level: key,
            iconType: type == "upstream" ? 'groupL' : 'groupM',
            name: nodeSet2Keys[i],
            parentNodeSetId: parentNodeSetId,
            allNodes: nodeSet2[nodeSet2Keys[i]],
            x: nodesCount == 1 ? parentNodeSetX : startPosition + (Math.ceil(singleNodes.length / 2) + i) * space,
            y: height
          });
          nodes.push({
            id: id++,
            asn: nodeSet2Keys[i],
            //type: 'nodeSetNode',
            iconType: type == "upstream" ? 'groupL' : 'groupM',
            x: nodesCount == 1 ? parentNodeSetX : startPosition + (Math.ceil(singleNodes.length / 2) + i) * space,
            y: height
          });
          groupedNodesId.push(id - 1);
          groupedNodesId.push(id - 2);

          links.push({
            source: id - 1,
            target: parentNodeSetId + 1
          });
        }

        //push nodes to parent nodeSet
        if (parentNodeSetIndex >= 0) {
          nodeSet[parentNodeSetIndex].nodes = groupedNodesId;
        }
      }

      //Push nodes and links
      function pushNodes(data, type, width, height) {
        for (var i = 0; i < data.length; i++) {
          nodes.push({
            id: id++,
            asn: data[i].asn,
            as_name: data[i].as_name,
            org_name: data[i].org_name,
            city: data[i].city,
            state_prov: data[i].state_prov,
            country: data[i].country,
            type: type,
            iconType: type == "upstream" ? 'groupL' : 'groupM',
            x: width/2 + (i- (data.length-1) / 2) * space,
            //x: (data.length == 1) ? width / 2 : i * width / (data.length - 1),
            y: height
          });
          //links.push({
          //  source: id - 1,
          //  target: 0
          //})
        }
      }

      //Get node index by asn and type (upstream or downstream)
      function getNodeId(asn, type) {
        for (var i = 0; i < nodes.length; i++) {
          if (nodes[i].asn === asn && nodes[i].type === type)
            return i;
        }
        return -1;
      }

      //Get nodeSet index by id
      function getNodeSetIndex(nodeSetId) {
        for (var i = 0; i < nodeSet.length; i++) {
          if (nodeSet[i].id == nodeSetId)
            return i;
        }
        return -1;
      }

      nx.define("NodeSetScene", nx.graphic.Topology.DefaultScene, {
        methods: {
          beforeExpandNodeSet: function (sender, nodeSet) {
            var id = nodeSet._model._data.id;
            var level = nodeSet._model._data.level;
            var nodeSetLayer = topo.getLayer('nodeSet');
            var nodeSets = nodeSetLayer.nodeSets();

            for (var i = 0; i < nodeSets.length; i++) {
              if (nodeSets[i]._model && level == nodeSets[i]._model._data.level &&
                id != nodeSets[i]._model._data.id && nodeSets[i].collapsed() == false) {
                nodeSets[i].collapse(false);
                //console.log(nodeSets[i]);
              }
            }

            this.inherited(sender, nodeSet);
          }
        }
      });

      function addressSort(a, b) {
        var lastSlashA = a.lastIndexOf("/");
        var lastSlashB = b.lastIndexOf("/");
        var stringA = a;
        if (lastSlashA !== -1) {
          stringA = a.substr(0, lastSlashA);
        }
        var colonsA = stringA.indexOf(":");
        var periodsA = stringA.indexOf(".");

        var stringB = b;
        if (lastSlashB !== -1) {
          stringB = b.substr(0, lastSlashB);
        }
        var colonsB = stringB.indexOf(":");
        var periodsB = stringB.indexOf(".");

        if (colonsA == -1) {
          if (colonsB == -1) {
            //compare as ipv4

            //gets an array of all the values to be compared
            var aVals = stringA.split(".");
            var bVals = stringB.split(".");
            //Should be the same length, but want to prevent index oob error
            for (var i = 0; i < Math.min(aVals.length, bVals.length); i++) {
              var currA = parseInt(aVals[i]);
              var currB = parseInt(bVals[i]);
              if (currA > currB) {
                return 1;
              } else if (currA < currB) {
                return -1;
              }
            }

            //If the numbers are the same up until the min prefix length, compare
            //the lengths of the numbers and give priority to the longer one
            if (aVals.length > bVals.length) {
              return 1;
            } else if (aVals.length < bVals.length) {
              return -1;
            } else {
              return 0;
            }

          } else {
            //The a value is ipv4 while the b value is ipv6, so we automatically
            //deem the b node to be greater
            return -1;
          }
        } else {
          if (periodsB == -1) {
            //compare as ipv6

            //gets an array of all the values to be compared
            var aVals = stringA.split(":");
            var bVals = stringB.split(":");
            for (var i = 0; i < Math.min(aVals.length, bVals.length); i++) {
              //Parse as a hex string b/c of ipv6 convention
              var currA = parseInt(aVals[i], 16);
              var currB = parseInt(bVals[i], 16);
              if (currA > currB) {
                return 1;
              } else if (currA < currB) {
                return -1;
              }
            }

            if (aVals.length > bVals.length) {
              return 1;
            } else if (aVals.length < bVals.length) {
              return -1;
            } else {
              return 0;
            }
          } else {
            //The a value is ipv6 while the b value is ipv4, so we automatically
            //deem the a node to be greater
            return 1;
          }
        }
      }


      nx.define('MyNodeTooltip', nx.ui.Component, {
        properties: {
          node: {
            set: function (value) {
              var modelData = value.model().getData();
              if (isNaN(modelData.asn)) {
                var showData = {};
              }
              else {
                var showData = {
                  "AS Name": modelData.as_name,
                  "Organization": modelData.org_name,
                  "City": modelData.city,
                  "State": modelData.state_prov,
                  "Country": modelData.country
                };
              }
              this.view('list').set('items', new nx.data.Dictionary(showData));
              this.title(value.label());
            }
          },
          topology: {},
          title: {}
        },
        view: {
          content: [
            {
              name: 'header',
              props: {
                'class': 'n-topology-tooltip-header'
              },
              content: [
                {
                  tag: 'span',
                  props: {
                    'class': 'n-topology-tooltip-header-text'
                  },
                  name: 'title',
                  content: '{#title}'
                }
              ]
            },
            {
              name: 'content',
              props: {
                'class': 'n-topology-tooltip-content n-list'
              },
              content: [
                {
                  name: 'list',
                  tag: 'ul',
                  props: {
                    'class': 'n-list-wrap',
                    template: {
                      tag: 'li',
                      props: {
                        'class': 'n-list-item-i',
                        role: 'listitem'
                      },
                      content: [
                        {
                          tag: 'label',
                          content: '{key}: '
                        },
                        {
                          tag: 'span',
                          content: '{value}'
                        }
                      ]

                    }
                  }
                }
              ]
            }
          ]
        }
      });
    }]
);
