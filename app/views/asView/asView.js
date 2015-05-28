'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:ASViewController
 * @description
 * # ASViewController
 * Controller of the AS View page
 */
angular.module('bmpUiApp')
  .controller('ASViewController', ['$scope', 'apiFactory', '$timeout', '$stateParams', function ($scope, apiFactory, $timeout, $stateParams) {

    var suggestions = [];
    var upstreamData, downstreamData;
    var upstreamPromise, downstreamPromise;
    var nodes = [], links = [], nodeSet = [];
    var id = 0;

    $scope.nodata = false;
    $scope.upstreamNodata = false;
    $scope.downstreamNodata = false;

    //prefix table options
    $scope.prefixGridOptions = {
      rowHeight: 25,
      footerHeight: 0,
      columnDefs: [
        {name: "prefixWithLen", displayName: 'Prefix', width: '*'}
      ]
    };

    //upstream table options
    $scope.upstreamGridOptions = {
      enableColumnResizing: true,
      rowHeight: 25,
      columnDefs: [
        {name: "asn", displayName: 'ASN', width: '30%'},
        {name: "as_name", displayName: 'AS Name', width: '70%'}
      ]
    };

    //downstream table options
    $scope.downstreamGridOptions = {
      enableColumnResizing: true,
      rowHeight: 25,
      columnDefs: [
        {name: "asn", displayName: 'ASN', width: '30%'},
        {name: "as_name", displayName: 'AS Name', width: '70%'}
      ]
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
              alert("Sorry, it seems that there is some problem with the server. :(\nWait a moment, then try again.");
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
      apiFactory.getWhoIsASN($scope.searchValue).
        success(function (result) {
          var data = result.gen_whois_asn.data;
          getData(data);
        }).
        error(function (error) {
          alert("Sorry, it seems that there is some problem with the server. :(\nWait a moment, then try again.");
          console.log(error.message);
        });
    }

    //get data about details, prefixes, upstream and downstream
    function getData(data) {
      if (data.size != 0) {
        $scope.asn = data[0].asn;
        getDetails(data[0]);
        getPrefixes();
        getUpstream();
        getDownstream();

        topoClear();
        downstreamPromise.success(function () {
          upstreamPromise.success(function () {
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
      apiFactory.getRIBbyASN($scope.asn).
        success(function (result) {
          var data = result.v_routes.data;
          for (var i = 0; i < result.v_routes.size; i++) {
            data[i].prefixWithLen = data[i].Prefix + "/" + data[i].PrefixLen;
          }
          $scope.prefixGridOptions.data = data;
        }).
        error(function (error) {
          alert("Sorry, it seems that there is some problem with the server. :(\nWait a moment, then try again.");
          console.log(error.message);
        });
    }

    //Get upstream data
    function getUpstream() {
      upstreamData = [];
      $scope.upstreamGridOptions.data = [];
      upstreamPromise = apiFactory.getUpstream($scope.asn);
      upstreamPromise.success(function (result) {
        upstreamData = result.upstreamASN.data.data;
        if (result.upstreamASN.data.size == 0) {
          $scope.upstreamNodata = true;
        }
        else {
          $scope.upstreamGridOptions.data = upstreamData;
          $scope.upstreamNodata = false;
        }
      }).
        error(function (error) {
          alert("Sorry, it seems that there is some problem with the server. :(\nWait a moment, then try again.");
          console.log(error.message);
        });
    }

    //Get downstream data
    function getDownstream() {
      downstreamData = [];
      $scope.downstreamGridOptions.data = [];
      downstreamPromise = apiFactory.getDownstream($scope.asn);
      downstreamPromise.success(function (result) {
        downstreamData = result.downstreamASN.data.data;
        if (result.downstreamASN.data.size == 0) {
          $scope.downstreamNodata = true;
        }
        else {
          $scope.downstreamGridOptions.data = downstreamData;
          $scope.downstreamNodata = false;
        }
      }).
        error(function (error) {
          alert("Sorry, it seems that there is some problem with the server. :(\nWait a moment, then try again.");
          console.log(error.message);
        });
    }

    //topology initialization
    function topoInit(){
      var App = nx.define(nx.ui.Application, {
        methods: {
          getContainer: function (comp) {
            return new nx.dom.Element(document.getElementById('AS_topology'));
          },
          start: function () {
            window.topo = new nx.graphic.Topology({
              //padding: 10,
              adaptive: true,
              nodeConfig: {
                label: 'model.asn',
                iconType: 'model.iconType'
              },
              nodeSetConfig: {
                label: 'model.name'
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

            topo.upon('clickNodeSet', function (sender, nodeset) {
              var id = nodeset._model._data.id;
              var level = nodeset._model._data.level;
              var nodeSetLayer = topo.getLayer('nodeSet');
              var nodeSets = nodeSetLayer.nodeSets();
              for (var i = 0; i < nodeSets.length; i++) {
                if (id == nodeSets[i]._model._data.id) {
                  nodeSets[i].collapsed(false);
                }
                else if (level == nodeSets[i]._model._data.level && nodeSets[i].collapsed() == false) {
                  var ns = nodeSets[i];
                  setTimeout(function () {
                    (function (ns) {
                      ns.collapsed(true);
                    })(ns);
                  }, 0);
                  console.log(nodeSets[i]);
                }
              }
              //nodeSetLayer.nodeSetDictionary().getItem(id).collapsed(false);
              //console.log(nodeSetLayer.nodeSetDictionary().getItem(id));

              //return true;
              return false;
            });
          }
        }
      });
      var app = new App();
      app.start();
    }

    function topoClear(){
      nodes = [];
      links = [];
      nodeSet = [];
      id = 0;

      var topologyData = {
        nodes: nodes,
        links: links,
        nodeSet: nodeSet
      };

      topo.data(topologyData);
    }

    //draw AS topology with current AS in the middle
    function drawTopology(data) {
      var width = 1200;
      var upstreamLayerHeight = width / 20;
      var downstreamLayerHeight = width / 20;

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

      //Upstream ASes
      pushNodes(upstreamData, "upstream", width, -2 * upstreamLayerHeight);
      if (upstreamData.length > 100) {
        groupNode(upstreamData, "", "upstream", "country", 0, width, -upstreamLayerHeight);
        var countrySetCount = nodeSet.length;
        for (var i = 0; i < countrySetCount; i++) {
          groupNode(nodeSet[i].allNodes, nodeSet[i].id, "upstream", "state_prov",
            i * width / countrySetCount, width / countrySetCount, -2 * upstreamLayerHeight);
        }
        var stateSetCount = nodeSet.length - countrySetCount;
        for (var i = countrySetCount; i < countrySetCount + stateSetCount; i++) {
          groupNode(nodeSet[i].allNodes, nodeSet[i].id, "upstream", "city",
            (i - countrySetCount) * width / stateSetCount, width / stateSetCount, -3 * upstreamLayerHeight);
        }
        var citySetCount = nodeSet.length - countrySetCount - stateSetCount;
        for (var i = countrySetCount + stateSetCount; i < countrySetCount + stateSetCount + citySetCount; i++) {
          groupNode(nodeSet[i].allNodes, nodeSet[i].id, "upstream", "",
            (i - countrySetCount - stateSetCount) * width / citySetCount, width / citySetCount, -4 * upstreamLayerHeight);
        }
      }

      //Downstream ASes
      pushNodes(downstreamData, "downstream", width, 2 * downstreamLayerHeight);
      if (downstreamData.length > 100) {
        groupNode(downstreamData, "", "downstream", "country", 0, width, downstreamLayerHeight);
        var countrySetCount = nodeSet.length;
        for (var i = 0; i < countrySetCount; i++) {
          groupNode(nodeSet[i].allNodes, nodeSet[i].id, "downstream", "state_prov",
            i * width / countrySetCount, width / countrySetCount, 2 * downstreamLayerHeight);
        }
        var stateSetCount = nodeSet.length - countrySetCount;
        for (var i = countrySetCount; i < countrySetCount + stateSetCount; i++) {
          groupNode(nodeSet[i].allNodes, nodeSet[i].id, "downstream", "city",
            (i - countrySetCount) * width / stateSetCount, width / stateSetCount, 3 * downstreamLayerHeight);
        }
        var citySetCount = nodeSet.length - countrySetCount - stateSetCount;
        for (var i = countrySetCount + stateSetCount; i < countrySetCount + stateSetCount + citySetCount; i++) {
          groupNode(nodeSet[i].allNodes, nodeSet[i].id, "downstream", "",
            (i - countrySetCount - stateSetCount) * width / citySetCount, width / citySetCount, 4 * downstreamLayerHeight);
        }
      }

      var topologyData = {
        nodes: nodes,
        links: links,
        nodeSet: nodeSet
      };

      topo.data(topologyData);
    }

    //Group nodes by the initial of  AS name
    function groupNode(data, parentNodeSetId, type, key, positionStart, width, height) {
      var nodeSet1 = {}, nodeSet2 = {};
      var singleNodes = [];
      var groupedNodesId = [];

      //Group the nodes by key
      if (key != "") {
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
      var space = (nodesCount == 1) ? 0 : width / nodesCount;

      //push all the single nodes
      for (var i = 0; i < singleNodes.length; i++) {
        var nodeId = getNodeId(singleNodes[i].asn, type);
        if (nodeId >= 0) {
          nodes[nodeId].x = positionStart + (i < singleNodes.length / 2 ? i * space : (nodeSet2Keys.length + i) * space);
          nodes[nodeId].y = height;
          groupedNodesId.push(nodes[nodeId].id);
        }
      }

      //push nodeSet
      for (var i = 0; i < nodeSet2Keys.length; i++) {
        nodeSet.push({
          id: id++,
          type: 'nodeSet',
          nodes: [],
          level: key,
          name: nodeSet2Keys[i],
          parentNodeSetId: parentNodeSetId,
          allNodes: nodeSet2[nodeSet2Keys[i]],
          x: positionStart + (singleNodes.length / 2 + i) * space,
          y: height
        });
        groupedNodesId.push(id - 1);
      }

      //push nodes to parent nodeSet
      var nodeSetId = getNodeSetId(parentNodeSetId);
      if (nodeSetId >= 0) {
        nodeSet[nodeSetId].nodes = groupedNodesId;
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
          x: (data.length == 1) ? width / 2 : i * width / (data.length - 1),
          y: height
        });
        links.push({
          source: id - 1,
          target: 0
        })
      }
    }

    //Get node index by asn and type (upstream or downstream)
    function getNodeId(asn, type) {
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].asn == asn && nodes[i].type == type)
          return i;
      }
      return -1;
    }

    //Get nodeSet index by id
    function getNodeSetId(id) {
      for (var i = 0; i < nodeSet.length; i++) {
        if (nodeSet[i].id == id)
          return i;
      }
      return -1;
    }

    nx.define('MyNodeTooltip', nx.ui.Component, {
      properties: {
        node: {
          set: function (value) {
            var modelData = value.model().getData();
            var showData = {
              "AS Name": modelData.as_name,
              "Organization": modelData.org_name,
              "City": modelData.city,
              "State": modelData.state_prov,
              "Country": modelData.country
            };
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
