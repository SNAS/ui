'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:ASViewController
 * @description
 * # ASViewController
 * Controller of the AS View page
 */
angular.module('bmpUiApp')
  .controller('ASViewController', ['$scope', 'apiFactory', '$timeout', function ($scope, apiFactory, $timeout) {

    var upstreamData, downstreamData;
    var upstreamPromise, downstreamPromise;
    var nodes = [], links = [], nodeSet = [];
    var id = 0;

    $scope.nodata = false;
    $scope.upstreamNodata = false;
    $scope.downstreamNodata = false;

    //prefix table option
    $scope.prefixGridOptions = {
      rowHeight: 25,
      footerHeight: 0,
      //rowTemplate:
      //  '<div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',

      columnDefs: [
        {name: "prefixWithLen", displayName: 'Prefix', width: '*'},
        //{name: "PrefixLen", displayName: 'Prefix Length', width: '*'},
      ]
    };

    //upstream table opions
    $scope.upstreamGridOptions = {
      enableColumnResizing: true,
      rowHeight: 25,
      //rowTemplate:
      //  '<div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',

      columnDefs: [
        {name: "asn", displayName: 'ASN', width: '30%'},
        {name: "as_name", displayName: 'AS Name', width: '70%'},
        //{name: "Prefixes_Learned", displayName: 'Prefixes', width: '*'}
      ]
    };

    //downstream table opions
    $scope.downstreamGridOptions = {
      enableColumnResizing: true,
      rowHeight: 25,
      //rowTemplate:
      //  '<div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',

      columnDefs: [
        {name: "asn", displayName: 'ASN', width: '30%'},
        {name: "as_name", displayName: 'AS Name', width: '70%'}
        //{name: "Prefixes_Learned", displayName: 'Prefixes', width: '*'}
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
      var App = nx.define(nx.ui.Application, {
        methods: {
          getContainer: function (comp) {
            return new nx.dom.Element(document.getElementById('AS_topology'));
          },
          start: function () {
            //var container = document.getElementById('AS_topology');
            window.topo = new nx.graphic.Topology({
              //width: container.clientWidth,
              //height: 600,
              adaptive: true,
              nodeConfig: {
                label: 'model.asn',
                iconType: 'model.iconType'
              },
              nodeSetConfig: {
                label: 'model.name'
                //iconType: 'server'
              },
              tooltipManagerConfig: {
                nodeTooltipContentClass: 'MyNodeTooltip'
              },
              //dataProcessor: 'force',
              identityKey: 'id',
              showIcon: true
            });
            topo.view('stage').upon('mousewheel', function (sender, event) {
              return false;
            });
            topo.attach(this);

            //hierarchical Layout
            //var layout = topo.getLayout('hierarchicalLayout');
            //layout.direction('vertical');
            //layout.sortOrder(["Upstream", "local", "Downstream"]);
            //layout.levelBy(function (node, model) {
            //  return model._data.level;
            //});
            //topo.activateLayout('hierarchicalLayout');
          }
        }
      });

      var app = new App();
      app.start();

      //initial search
      $scope.searchValue = 109;
      searchValue();
    });

    //complete the search field automatically while searching AS name
    function predictiveSearch() {
      var suggestions = [];
      $("#tags").autocomplete({
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

      apiFactory.getWhoIsASNameLike($scope.searchValue, 10).success(function (result) {
        if (result.w.size != 0) {
          var data = result.w.data;
          for (var i = 0; i < result.w.size; i++) {
            suggestions.push(data[i].as_name);
          }

        }
      })
        .error(function () {

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

    //get detailed information of this AS
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

    function getPrefixes() {
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

    //draw AS topology with current AS in the middle
    function drawTopology(data) {
      var width = 1200;
      var upstreamLayerHeight = width / 20;
      var downstreamLayerHeight = width / 20;

      nodes = [];
      links = [];
      nodeSet = [];
      id = 0;
      //nodeSetId = 0;

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
      pushNodes(upstreamData, "upstream", width, -upstreamLayerHeight);
      if (upstreamData.length > 100) {
        var allNodeSetsByCountry = groupNode(upstreamData, "", "upstream", "country", 0, width, -upstreamLayerHeight);
        var allNodeSetsByCountryKeys = Object.keys(allNodeSetsByCountry);
        for (var i = 0; i < allNodeSetsByCountryKeys.length; i++) {
          var allNodeSetsByState = groupNode(allNodeSetsByCountry[allNodeSetsByCountryKeys[i]], allNodeSetsByCountryKeys[i], "upstream", "state_prov",
            i * width / allNodeSetsByCountryKeys.length, width / allNodeSetsByCountryKeys.length, -2 * upstreamLayerHeight);
          var allNodeSetsByStateKeys = Object.keys(allNodeSetsByState);
          for (var j = 0; j < allNodeSetsByStateKeys.length; j++) {
            var allNodeSetsByCity = groupNode(allNodeSetsByState[allNodeSetsByStateKeys[j]], allNodeSetsByStateKeys[j], "upstream", "city",
              j * width / allNodeSetsByStateKeys.length, width / allNodeSetsByStateKeys.length, -3 * upstreamLayerHeight);
            var allNodeSetsByCityKeys = Object.keys(allNodeSetsByCity);
            for (var n = 0; n < allNodeSetsByCityKeys.length; n++) {
              groupNode(allNodeSetsByCity[allNodeSetsByCityKeys[n]], allNodeSetsByCityKeys[n], "upstream", "",
                n * width / allNodeSetsByCityKeys.length, width / allNodeSetsByCityKeys.length, -4 * upstreamLayerHeight);
            }
          }
        }
        //groupedNodes = groupNode(groupedNodes, "upstream", "city", width, -3 * upstreamLayerHeight);
        //groupedNodes = groupNode(groupedNodes, "upstream", "", width, -4 * upstreamLayerHeight);
        //pushNodes(groupedNodes, "upstream", width, - 4 * downstreamLayerHeight, id);
      }

      //Downstream ASes
      pushNodes(downstreamData, "downstream", width, downstreamLayerHeight);

      if (downstreamData.length > 100) {
        var allNodeSetsByCountry = groupNode(downstreamData, "", "downstream", "country", 0, width, downstreamLayerHeight, 1);
        var allNodeSetsByCountryKeys = Object.keys(allNodeSetsByCountry);
        for (var i = 0; i < allNodeSetsByCountryKeys.length; i++) {
          allNodeSetsByState = groupNode(allNodeSetsByCountry[allNodeSetsByCountryKeys[i]], allNodeSetsByCountryKeys[i], "downstream", "state_prov",
            i * width / allNodeSetsByCountryKeys.length, width / allNodeSetsByCountryKeys.length, 2 * downstreamLayerHeight, 2);
          allNodeSetsByStateKeys = Object.keys(allNodeSetsByState);
          for (var j = 0; j < allNodeSetsByStateKeys.length; j++) {
            allNodeSetsByCity = groupNode(allNodeSetsByState[allNodeSetsByStateKeys[j]], allNodeSetsByStateKeys[j], "downstream", "city",
              j * width / allNodeSetsByStateKeys.length, width / allNodeSetsByStateKeys.length, 3 * downstreamLayerHeight, 3);
            allNodeSetsByCityKeys = Object.keys(allNodeSetsByCity);
            for (var n = 0; n < allNodeSetsByCityKeys.length; n++) {
              groupNode(allNodeSetsByCity[allNodeSetsByCityKeys[n]], allNodeSetsByCityKeys[n], "downstream", "",
                n * width / allNodeSetsByCityKeys.length, width / allNodeSetsByCityKeys.length, 4 * downstreamLayerHeight, 4);
            }
          }
        }
        //groupedNodes = groupNode(groupedNodes, "upstream", "city", width, -3 * upstreamLayerHeight);
        //groupedNodes = groupNode(groupedNodes, "upstream", "", width, -4 * upstreamLayerHeight);
        //pushNodes(groupedNodes, "upstream", width, - 4 * downstreamLayerHeight, id);
      }

      //if (downstreamData.length > 100) {
      //  var groupedNodes = groupNode(downstreamData, "downstream", "country", width, downstreamLayerHeight);
      //  groupedNodes = groupNode(groupedNodes, "downstream", "state_prov", width, 2 * downstreamLayerHeight);
      //  groupedNodes = groupNode(groupedNodes, "downstream", "city", width, 3 * downstreamLayerHeight);
      //  groupedNodes = groupNode(groupedNodes, "downstream", "", width, 4 * downstreamLayerHeight);
      //  //pushNodes(groupedNodes, "downstream", width, 4 * downstreamLayerHeight);
      //}

      ////push all the links
      //for (var i = 1; i < id; i++) {
      //  links.push({
      //    source: i,
      //    target: 0
      //  })
      //}

      var topologyData = {
        nodes: nodes,
        links: links,
        nodeSet: nodeSet
      };

      topo.data(topologyData);
    }

    //Group nodes by the initial of  AS name
    function groupNode(data, parentNodeSetName, type, key, positionStart, width, height, level) {
      var country = data[0].country;
      var singleNodes = [];
      var allGroupedNodes = [];
      var nodeSet1 = {}, nodeSet2 = {};

      if (key != "") {
        for (var i = 0; i < data.length; i++) {
          //if (!data[i].as_name) {
          //  if(!nodeSet1[""]){
          //    nodeSet1[""] = [];
          //  }
          //  nodeSet1[""].push(data[i]);
          //}
          //else {
          //  if (!nodeSet1[data[i].as_name.charAt(0)]) {
          //    nodeSet1[data[i].as_name.charAt(0)] = [];
          //  }
          //  nodeSet1[data[i].as_name.charAt(0)].push(data[i]);
          //}
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
            allGroupedNodes = allGroupedNodes.concat(nodeSet1[nodeSet1Keys[i]]);
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
      if (nodesCount == 1) {
        var space = 0;
      }
      else {
        var space = width / nodesCount;
      }
      //console.log(nodeSet1);
      //console.log(nodeSet2);
      //console.log(singleNodes);

      var groupedNodesId = [];

      //push all the single nodes
      for (var i = 0; i < singleNodes.length; i++) {
        var nodeId = getNodeId(singleNodes[i].asn, type);
        if (nodeId >= 0) {
          nodes[nodeId].x = positionStart + (i < singleNodes.length / 2 ? i * space : (nodeSet2Keys.length + i) * space);
          nodes[nodeId].y = height;
          groupedNodesId.push(nodes[nodeId].id);
        }
      }

      //push all the nodes grouped
      //for (var i = 0; i < allGroupedNodes.length; i++) {
      //  nodes.push({
      //    id: id++,
      //    asn: allGroupedNodes[i].asn,
      //    as_name: allGroupedNodes[i].as_name,
      //    org_name: allGroupedNodes[i].org_name,
      //    city: allGroupedNodes[i].city,
      //    state_prov: allGroupedNodes[i].state_prov,
      //    country: allGroupedNodes[i].country,
      //    type: type,
      //    iconType: 'groupL',
      //    //x: (singleNodes.length / 2 + i) * space,
      //    //y: type == "upstream" ? 0 : width / 2.5
      //    x: i * width / allGroupedNodes.length,
      //    y: type == "upstream" ? -width / 20 : width / 5 + width / 20
      //  });
      //}

      //push nodeSet
      for (var i = 0; i < nodeSet2Keys.length; i++) {
        //var groupedNodes = nodeSet2[nodeSet2Keys[i]];
        //var groupedNodesId = [];

        //for (var j = 0; j < groupedNodes.length; j++) {
        //  var asn = groupedNodes[j].asn;
        //  groupedNodesId.push(getNode(asn, type).id);
        //}

        //var centreNode = groupedNodes[Math.floor(groupedNodes.length / 2) - 1];
        //var asn = centreNode.asn;
        //var centre = getNode(asn, type).x;

        nodeSet.push({
          id: id++,
          type: 'nodeSet',
          nodes: [],
          name: nodeSet2Keys[i],
          parentNodeSetName: parentNodeSetName,
          level: level,
          country: nodeSet2[nodeSet2Keys[i]][0].country,
          //x: centre,
          x: positionStart + (singleNodes.length / 2 + i) * space,
          y: height
        });

        groupedNodesId.push(id - 1);
      }


      var nodeSetId = getNodeSetId(parentNodeSetName, level - 1, country);
      if (nodeSetId >= 0) {
        nodeSet[nodeSetId].nodes = groupedNodesId;
      }

      console.log(nodeSet);

      return nodeSet2;
    }

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

    //Get node by asn and type (upstream or downstream)
    function getNodeId(asn, type) {
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].asn == asn && nodes[i].type == type)
          return i;
      }
      return -1;
    }

    function getNodeSetId(name, level, country) {
      for (var i = 0; i < nodeSet.length; i++) {
        if (nodeSet[i].name == name && nodeSet[i].level == level && nodeSet[i].country == country)
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
  }])
  .directive('autocomplete', function () {

  })
;
