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

    $scope.nodata = false;
    $scope.upstreamNodata = false;
    $scope.downstreamNodata = false;

    //upstream table opions
    $scope.upstreamGridOptions = {
      rowHeight: 25,
      //rowTemplate:
      //  '<div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',

      columnDefs: [
        {name: "UpstreamAS", displayName: 'ASN', width: '*'},
        {name: "as_name", displayName: 'AS Name', width: '*'},
        //{name: "Prefixes_Learned", displayName: 'Prefixes', width: '*'}
      ]
    };

    //downstream table opions
    $scope.downstreamGridOptions = {
      rowHeight: 25,
      //rowTemplate:
      //  '<div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',

      columnDefs: [
        {name: "DownstreamAS", displayName: 'ASN', width: '*'},
        {name: "as_name", displayName: 'AS Name', width: '*'},
        //{name: "Prefixes_Learned", displayName: 'Prefixes', width: '*'}
      ]
    };

    //Waits a bit for user to contiune typing.
    $scope.enterValue = function (value) {
      $timeout(function () {
        if (value == $scope.searchValue) {
          if (isNaN($scope.searchValue)) {
            predictiveSearch();
          }
          else {
            searchValue();
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
      $scope.suggestions = [
        "ActionScript",
        "AppleScript",
        "Asp",
        "BASIC",
        "C",
        "C++",
        "Clojure",
        "COBOL",
        "ColdFusion",
        "Erlang",
        "Fortran",
        "Groovy",
        "Haskell",
        "Java",
        "JavaScript",
        "Lisp",
        "Perl",
        "PHP",
        "Python",
        "Ruby",
        "Scala",
        "Scheme"
      ];
      //$("#tags").autocomplete({
      //  source: availableTags
      //});

      apiFactory.getWhoIsASName($scope.searchValue).success(function (result) {
        if (result.w.size != 0) {
          var data = result.w.data;
        }
      })
        .error(function () {

        });
    }

    //get all the information of this AS
    function searchValue() {
      apiFactory.getWhoIsASN($scope.searchValue).
        success(function (result) {
          if (result.gen_whois_asn.size != 0) {
            getDetails(result.gen_whois_asn.data[0]);
            getUpstream();
            getDownstream();

            downstreamPromise.success(function () {
              upstreamPromise.success(function () {
                drawTopology(result.gen_whois_asn.data[0]);
              });
            });

            $scope.nodata = false;
          }
          else {
            $scope.nodata = true;
          }
        }).
        error(function (error) {
          alert("Sorry, it seems that there is some problem with the server. :(\nWait a moment, then try again.");
          console.log(error.message);
        });
    }

    //get detailed information of this AS
    function getDetails(data) {
      var keys = Object.keys(data);
      var showValues = '<table class="tableStyle"><thead><tr><th>AS Information</th></tr></thead><tbody>';

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

    //Get upstream data
    function getUpstream() {
      upstreamPromise = apiFactory.getUpstream($scope.searchValue);
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
      downstreamPromise = apiFactory.getDownstream($scope.searchValue);
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
      var id = 0;
      var width = 1200;
      var upstreamSpace = width / (upstreamData.length - 1);
      var downstreamSpace = width / (downstreamData.length - 1);

      nodes = [];
      links = [];
      nodeSet = [];

      //current AS
      nodes.push({
        id: id++,
        asn: data.asn,
        as_name: data.as_name,
        org_name: data.org_name,
        country: data.country,
        type: "local",
        iconType: 'groupS',
        x: width / 2,
        y: width / 10
      });

      //Upstream ASes
      if (upstreamData.length < 100) {
        for (var i = 0; i < upstreamData.length; i++) {
          nodes.push({
            id: id++,
            asn: upstreamData[i].UpstreamAS,
            as_name: upstreamData[i].as_name,
            org_name: upstreamData[i].org_name,
            country: upstreamData[i].country,
            type: "upstream",
            iconType: 'groupL',
            x: (upstreamData.length == 1) ? width / 2 : i * upstreamSpace,
            y: 0
          });
          links.push({
            source: id - 1,
            target: 0
          });
        }
      }
      else {
        groupNode(upstreamData, "upstream", width, id);
      }

      //Downstream ASes
      if (downstreamData.length < 100) {
        for (var i = 0; i < downstreamData.length; i++) {
          nodes.push({
            id: id++,
            asn: downstreamData[i].DownstreamAS,
            as_name: downstreamData[i].as_name,
            org_name: downstreamData[i].org_name,
            country: downstreamData[i].country,
            type: "downstream",
            iconType: 'groupM',
            x: (downstreamData.length == 1) ? width / 2 : i * downstreamSpace,
            y: width / 5
          });
          links.push({
            source: 0,
            target: id - 1
          });
        }
      }
      else {
        groupNode(downstreamData, "downstream", width, id);
      }

      var topologyData = {
        nodes: nodes,
        links: links,
        nodeSet: nodeSet
      };

      topo.data(topologyData);
    }

    //Group nodes by the initial of  AS name
    function groupNode(data, type, width, id) {
      var space = width / (data.length - 1);
      var singleNodes = [];
      var allGroupedNodes = [];

      var nodeSet1 = {}, nodeSet2 = {};
      for (var i = 0; i < data.length; i++) {
        if (!data[i].as_name) {
          if(!nodeSet1[""]){
            nodeSet1[""] = [];
          }
          nodeSet1[""].push(data[i]);
        }
        else {
          if (!nodeSet1[data[i].as_name.charAt(0)]) {
            nodeSet1[data[i].as_name.charAt(0)] = [];
          }
          nodeSet1[data[i].as_name.charAt(0)].push(data[i]);
        }
        //if (!nodeSet1[data[i].country]) {
        //  nodeSet1[data[i].country] = [];
        //}
        //nodeSet1[data[i].country].push(data[i]);
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

      console.log(nodeSet1);
      console.log(nodeSet2);
      console.log(nodeSet1Keys);
      console.log(singleNodes);

      //push all the single nodes
      for (var i = 0; i < singleNodes.length; i++) {
        nodes.push({
          id: id++,
          asn: type == "upstream" ? singleNodes[i].UpstreamAS : singleNodes[i].DownstreamAS,
          as_name: singleNodes[i].as_name,
          org_name: singleNodes[i].org_name,
          country: singleNodes[i].country,
          type: type,
          iconType: 'groupL',
          x: i < singleNodes.length / 2 ? i * space : (allGroupedNodes.length + i) * space,
          y: type == "upstream" ? 0 : width / 5
        });
        if (type == "upstream") {
          links.push({
            source: id - 1,
            target: 0
          });
        }
        else {
          links.push({
            source: 0,
            target: id - 1
          });
        }
      }

      //push all the nodes grouped
      for (var i = 0; i < allGroupedNodes.length; i++) {
        nodes.push({
          id: id++,
          asn: type == "upstream" ? allGroupedNodes[i].UpstreamAS : allGroupedNodes[i].DownstreamAS,
          as_name: allGroupedNodes[i].as_name,
          org_name: allGroupedNodes[i].org_name,
          country: allGroupedNodes[i].country,
          type: type,
          iconType: 'groupL',
          x: (singleNodes.length / 2 + i) * space,
          y: type == "upstream" ? 0 : width / 5
        });
        if (type == "upstream") {
          links.push({
            source: id - 1,
            target: 0
          });
        }
        else {
          links.push({
            source: 0,
            target: id - 1
          });
        }
      }

      //push nodeSet
      for (var i = 0; i < nodeSet2Keys.length; i++) {
        var groupedNodes = nodeSet2[nodeSet2Keys[i]];
        var groupedNodesId = [];

        for (var j = 0; j < groupedNodes.length; j++) {
          var asn = ( type == "upstream" ) ? groupedNodes[j].UpstreamAS : groupedNodes[j].DownstreamAS;
          groupedNodesId.push(getNode(asn, type).id);
        }

        var centreNode = groupedNodes[Math.floor(groupedNodes.length / 2) - 1];
        var asn = ( type == "upstream" ) ? centreNode.UpstreamAS : centreNode.DownstreamAS;
        var centre = getNode(asn, type).x;

        nodeSet.push({
          id: id++,
          type: 'nodeSet',
          nodes: groupedNodesId,
          name: nodeSet2Keys[i],
          x: centre,
          y: type == "upstream" ? 0 : width / 5
        });
      }
    }

    //Get node by asn and type (upstream or downstream)
    function getNode(asn, type) {
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].asn == asn && nodes[i].type == type)
          return nodes[i];
      }
      return null;
    }

    nx.define('MyNodeTooltip', nx.ui.Component, {
      properties: {
        node: {
          set: function (value) {
            var modelData = value.model().getData();
            var showData = {
              "AS Name": modelData.as_name,
              "Organization": modelData.org_name,
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
