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

    var upstreamData, upstreamAmount, downstreamData, downstreamAmount;
    var upstreamPromise, downstreamPromise;

    //$scope.success = false;
    $scope.nodata = false;

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
          searchValue();
        }
      }, 500);
    };

    nx.define('MyNodeTooltip', nx.ui.Component, {
      properties: {
        node: {},
        topology: {}
      },
      view: {
        content: [
          {
            tag: 'h4',
            content: '{#node.model.asn}'
            //content: '{#node.id}'
          },
          {
            tag: 'p',
            content: [{
              tag: 'label',
              content: 'AS Name:'
            }, {
              tag: 'span',
              content: '{#node.model.as_name}'
            }]
          },
          {
            tag: 'p',
            content: [{
              tag: 'label',
              content: 'Organization:'
            }, {
              tag: 'span',
              content: '{#node.model.org_name}'
            }]
          },
          {
            tag: 'p',
            content: [{
              tag: 'label',
              content: 'Country:'
            }, {
              tag: 'span',
              content: '{#node.model.country}'
            }]
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
            window.topo = new nx.graphic.Topology({
              //width: canvas_width,
              //height: canvas_height,
              adaptive: true,
              nodeConfig: {
                label: 'model.asn', // display node's name as label from model
                iconType: 'model.iconType'
              },
              tooltipManagerConfig: {
                nodeTooltipContentClass: 'MyNodeTooltip'
              },
              dataProcessor: 'force',
              identityKey: 'asn',
              showIcon: true,
              scalable: false
            });

            topo.attach(this);

            //hierarchical Layout
            var layout = topo.getLayout('hierarchicalLayout');
            layout.direction('vertical');
            layout.sortOrder(["Upstream", "local", "Downstream"]);
            layout.levelBy(function (node, model) {
              return model._data.type;
            });
            topo.activateLayout('hierarchicalLayout');
          }
        }
      });

      var app = new App();
      app.start();

      //initial search
      $scope.searchValue = 109;
      searchValue();
    });


    function searchValue() {
      apiFactory.getWhoIsWhereASN($scope.searchValue).
        success(function (result) {
          if (result.w.size != 0) {
            getDetails(result.w.data[0]);
            getUpstream();
            getDownstream();

            downstreamPromise.success(function () {
              upstreamPromise.success(function () {
                drawTopology(result.w.data[0]);
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
      //var fields = ["asn", "as_name", "org_id", "org_name", "address", "city", "state_prov", "postal_code", "country", "timestamp", "source"];
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
        $scope.upstreamGridOptions.data = upstreamData;
        //upstreamAmount = result.upstreamASN.data.size;
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
        $scope.downstreamGridOptions.data = downstreamData;
        //downstreamAmount = result.downstreamASN.data.size;
      }).
        error(function (error) {
          alert("Sorry, it seems that there is some problem with the server. :(\nWait a moment, then try again.");
          console.log(error.message);
        });
    }

    function drawTopology(data) {
      var nodes = [], links = [];
      //var fields = ["asn", "as_name", "org_id", "org_name", "address", "city", "state_prov", "postal_code", "country", "timestamp", "source"];

      nodes.push({
          asn: data.asn,
          as_name: data.as_name,
          org_name: data.org_name,
          country: data.country,
          iconType: 'groupS',
          type: 'local'
        }
      );

      for (var i = 0; i < upstreamData.length; i++) {
        nodes.push({
          asn: upstreamData[i].UpstreamAS,
          as_name: upstreamData[i].as_name,
          org_name: upstreamData[i].org_name,
          country: upstreamData[i].country,
          //"Prefix": upstreamData[i].Prefixes_Learned,
          iconType: 'groupL',
          type: 'Upstream'
        });

        links.push(
          {
            source: upstreamData[i].UpstreamAS,
            target: data.asn
          });
      }

      for (var i = 0; i < downstreamData.length; i++) {
        nodes.push({
          asn: downstreamData[i].DownstreamAS,
          as_name: downstreamData[i].as_name,
          org_name: downstreamData[i].org_name,
          country: downstreamData[i].country,
          //"Prefix": upstreamData[i].Prefixes_Learned,
          iconType: 'groupM',
          type: 'Downstream'
          //"ASN": downstreamData[i].DownstreamAS,
          //"AS Name": downstreamData[i].as_name,
          //"Organization": downstreamData[i].org_name,
          //"Country": downstreamData[i].country,
          ////"Prefix": downstreamData[i].Prefixes_Learned,
          //iconType: 'groupM',
          //"Type": 'Downstream'
        });

        links.push(
          {
            source: data.asn,
            target: downstreamData[i].DownstreamAS
          });
      }

      var country = {};
      //var as_name = {};
      //var org_name = {};
      for (var i = 0; i < downstreamData.length; i++) {
        if (!country[downstreamData[i].country]) {
          country[downstreamData[i].country] = [];
        }
        country[downstreamData[i].country].push(downstreamData[i].DownstreamAS);


        //if (!as_name[downstreamData[i].as_name]) {
        //  as_name[downstreamData[i].as_name] = 1;
        //}
        //else {
        //  as_name[downstreamData[i].as_name]++;
        //}
        //
        //if (!org_name[downstreamData[i].org_name]) {
        //  org_name[downstreamData[i].org_name] = 1;
        //}
        //else {
        //  org_name[downstreamData[i].org_name]++;
        //}
      }
      console.log(country);
      //console.log(as_name);
      //console.log(org_name);

      var nodeSet = [{
        //id: 1,
        type: 'nodeSet',
        nodes: country["US"],
        //root: nodes[8].id,
        //latitude: nodes[8].latitude,
        //longitude: nodes[8].longitude,
        name: "US",
        //iconType: 'server'
      }];

      var topologyData = {
        nodes: nodes,
        links: links,
        //  nodeSet: nodeSet
      }
      topo.data(topologyData);
    }

    // draw AS topology with current AS in the middle
    //function drawTopology() {
    //  var node, link;
    //  var w = 500;
    //
    //  var space1 = w / (upstreamAmount - 1);
    //  var space2 = w / (downstreamAmount - 1);
    //
    //
    //  var topologyData = {
    //    nodes: [
    //      {
    //        "id": 0,
    //        "x": 250,
    //        "y": 100,
    //        "name": "AS" + $scope.searchValue,
    //        iconType: 'groupS'
    //      }
    //    ],
    //    links: []
    //  };
    //
    //
    //  if (upstreamAmount == 1) {
    //    node = {
    //
    //      "name": upstreamData[0].UpstreamAS,
    //      "AS Name": upstreamData[0].as_name,
    //      "Organization": upstreamData[0].org_name,
    //      "Country": upstreamData[0].country,
    //      "-------------------------": "",
    //      "id": 1,
    //      "x": 250,
    //      "y": 0,
    //
    //      iconType: 'groupL'
    //    };
    //    link = {
    //      "source": 0,
    //      "target": 1
    //    };
    //    topologyData["nodes"][1] = node;
    //    topologyData["links"][0] = link;
    //  } else {
    //    for (var i = 0; i < upstreamAmount; i++) {
    //      node = {
    //        "name": upstreamData[i].UpstreamAS,
    //        "AS Name": upstreamData[i].as_name,
    //        "Organization": upstreamData[i].org_name,
    //        "Country": upstreamData[i].country,
    //        "-------------------------": "",
    //        "id": i + 1,
    //        "x": i * space1,
    //        "y": 0,
    //        iconType: 'groupL'
    //      }
    //      link = {
    //        "source": 0,
    //        "target": i + 1
    //      }
    //      topologyData["nodes"][i + 1] = node;
    //      topologyData["links"][i] = link;
    //    }
    //  }
    //  if (downstreamAmount == 1) {
    //    node = {
    //      "name": downstreamData[0].DownstreamAS,
    //      "AS Name": downstreamData[0].as_name,
    //      "Organization": downstreamData[0].org_name,
    //      "Country": downstreamData[0].country,
    //      "-------------------------": "",
    //      "id": upstreamAmount + 1,
    //      "x": 250,
    //      "y": 200,
    //      iconType: 'groupM'
    //    }
    //    link = {
    //      "source": 0,
    //      "target": upstreamAmount + 1
    //    }
    //    topologyData["nodes"][upstreamAmount + 1] = node;
    //    topologyData["links"][upstreamAmount] = link
    //  } else {
    //    for (var i = 0; i < downstreamAmount; i++) {
    //      node = {
    //        "name": downstreamData[i].DownstreamAS,
    //        "AS Name": downstreamData[i].as_name,
    //        "Organization": downstreamData[i].org_name,
    //        "Country": downstreamData[i].country,
    //        "-------------------------": "",
    //        "id": upstreamAmount + i + 1,
    //        "x": i * space2,
    //        "y": 200,
    //        iconType: 'groupM'
    //      }
    //      link = {
    //        "source": 0,
    //        "target": upstreamAmount + i + 1
    //      }
    //      topologyData["nodes"][upstreamAmount + i + 1] = node;
    //      topologyData["links"][upstreamAmount + i] = link
    //    }
    //  }
    //
    //  topo.data(topologyData);
    //}

  }]);
