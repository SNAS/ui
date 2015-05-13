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

    //$scope.success = false;
    $scope.nodata = false;
    $scope.upstreamNodata = false;
    $scope.downstreamNodata = false;

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
            predictiveSeach();
          }
          else {
            searchValue();
          }
        }
      }, 500);
    };

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
                label: 'model.asn', // display node's name as label from model
                iconType: 'model.iconType'
              },
              tooltipManagerConfig: {
                nodeTooltipContentClass: 'MyNodeTooltip'
              },
              //dataProcessor: 'force',
              identityKey: 'asn',
              showIcon: true,
              //scalable: false
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

    function predictiveSeach() {
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
            //$scope.success = true;
          }
          else {
            //$scope.success = false;
            $scope.nodata = true;
          }
        }).
        error(function (error) {
          alert("Sorry, it seems that there is some problem with the server. :(\nWait a moment, then try again.");
          console.log(error.message);
        });
    }

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

    function getUpstream() {
      upstreamPromise = apiFactory.getUpstream($scope.searchValue);
      upstreamPromise.success(function (result) {
        upstreamData = result.upstreamASN.data.data;
        if(result.upstreamASN.data.size == 0){
          $scope.upstreamNodata = true;
        }
        else{
          $scope.upstreamGridOptions.data = upstreamData;
          $scope.upstreamNodata = false;
        }
      }).
        error(function (error) {
          alert("Sorry, it seems that there is some problem with the server. :(\nWait a moment, then try again.");
          console.log(error.message);
        });
    }

    function getDownstream() {
      downstreamPromise = apiFactory.getDownstream($scope.searchValue);
      downstreamPromise.success(function (result) {
        downstreamData = result.downstreamASN.data.data;
        if(result.downstreamASN.data.size == 0){
          $scope.downstreamNodata = true;
        }
        else{
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
      var upstreamAmount = upstreamData.length;
      var downstreamAmount = downstreamData.length;
      var nodes = [], links = [], nodeSet = [];
      var width = 1200;
      var singleNodes = [];
      //var allGroupedNodes = [];
      var totalNodesAmount;

      var countrySet1 = {}, countrySet2 = {};
      for (var i = 0; i < upstreamData.length; i++) {
        if (!countrySet1[upstreamData[i].country]) {
          countrySet1[upstreamData[i].country] = [];
        }
        countrySet1[upstreamData[i].country].push(upstreamData[i]);
      }
      var countrySet1Keys = Object.keys(countrySet1);
      totalNodesAmount = countrySet1Keys.length;
      for (var i = 0; i < countrySet1Keys.length; i++) {
        if (countrySet1[countrySet1Keys[i]].length > 1) {
          countrySet2[countrySet1Keys[i]] = countrySet1[countrySet1Keys[i]];
          //groupedNodes = groupedNodes.concat(countrySet1[countrySet1Keys[i]]);
        }
        else {
          singleNodes.push(countrySet1[countrySet1Keys[i]][0]);
        }
      }
      var countrySet2Keys = Object.keys(countrySet2);

      console.log(countrySet1);
      console.log(countrySet2);
      console.log(singleNodes);

      //for (var i = 0; i < downstreamData.length; i++) {
      //  if (!country[downstreamData[i].country]) {
      //    country[downstreamData[i].country] = [];
      //  }
      //  country[downstreamData[i].country].push(downstreamData[i].DownstreamAS);

      var space1 = width / (totalNodesAmount - 1);
      var space2 = width / (downstreamAmount - 1);

      for (var i = 0; i < countrySet2Keys.length; i++) {
        var groupedNodes = countrySet2[countrySet2Keys[i]];
        var groupedNodesId = [];
        for (var j = 0; j < groupedNodes.length; j++) {
          groupedNodesId.push(groupedNodes[j].UpstreamAS);
        }
        nodeSet.push({
          id: i,
          type: 'nodeSet',
          nodes: groupedNodesId,
          name: countrySet2Keys[i],
          iconType: 'server',
          x: (countrySet1Keys.length == 1) ? width / 2 : (singleNodes.length + i) * space1,
          y: 0
          //lockYAxle: true,
          //level: 'Upstream'
        });
      }

      nodes.push({
        asn: data.asn,
        as_name: data.as_name,
        org_name: data.org_name,
        country: data.country,
        iconType: 'groupS',
        //level: 'local',
        x: width / 2,
        y: width / 10
      });

      //for (var i = 0; i < singleNodes.length; i++) {
      //  nodes.push({
      //    asn: singleNodes[i].UpstreamAS,
      //    as_name: singleNodes[i].as_name,
      //    org_name: singleNodes[i].org_name,
      //    country: singleNodes[i].country,
      //    iconType: 'groupL',
      //    //lockYAxle: true,
      //    //level: 'Upstream',
      //    x: (countrySet1Keys == 1) ? width / 2 : i * space1,
      //    y: 0
      //  });
      //  links.push({
      //    source: singleNodes[i].UpstreamAS,
      //    target: data.asn
      //  });
      //}

      for (var i = 0; i < upstreamData.length; i++) {
        nodes.push({
          asn: upstreamData[i].UpstreamAS,
          as_name: upstreamData[i].as_name,
          org_name: upstreamData[i].org_name,
          country: upstreamData[i].country,
          iconType: 'groupL',
          //lockYAxle: true,
          //level: 'Upstream',
          x: (countrySet1Keys == 1) ? width / 2 : i * space1,
          y: 0
        });
        links.push({
          source: upstreamData[i].UpstreamAS,
          target: data.asn
        });
      }


      for (var i = 0; i < downstreamAmount; i++) {
        nodes.push({
          asn: downstreamData[i].DownstreamAS,
          as_name: downstreamData[i].as_name,
          org_name: downstreamData[i].org_name,
          country: downstreamData[i].country,
          iconType: 'groupM',
          //level: 'Downstream'
          x: (downstreamAmount == 1) ? width / 2 : i * space2,
          y: width / 5
        });
        links.push({
          source: data.asn,
          target: downstreamData[i].DownstreamAS
        });
      }

      topo.view('stage').upon('mousewheel',function(sender,event){
        return false;
      });

      var topologyData = {
        nodes: nodes,
        links: links,
        nodeSet: nodeSet
      };

      topo.data(topologyData);
    }

  }])
  .directive('autocomplete', function(){

  })
;
