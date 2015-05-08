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
    $scope.success = false;
    $scope.nodata = false;

    $scope.upstreamGridOptions = {
      rowHeight: 25,
      //rowTemplate:
      //  '<div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',

      columnDefs: [
        {name: "UpstreamAS", displayName: 'ASN', width: '*'},
        {name: "Prefixes_Learned", displayName: 'Prefixes', width: '*'}
      ]
    };

    $scope.downstreamGridOptions = {
      rowHeight: 25,
      //rowTemplate:
      //  '<div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',

      columnDefs: [
        {name: "DownstreamAS", displayName: 'ASN', width: '*'},
        {name: "Prefixes_Learned", displayName: 'Prefixes', width: '*'}
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

    function searchValue() {
      apiFactory.getWhoIsWhereASN($scope.searchValue).
        success(function (result) {
          if (result.w.size != 0) {
            getDetails(result.w.data[0]);
            getUpstream();
            getDownstream();
            drawTopology();
            $scope.nodata = false;
            $scope.success = true;
          }
          else{
            $scope.success = false;
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
      apiFactory.getUpstreamCount($scope.searchValue).success(function (result) {
        upstreamData = result.upstreamASNCount.data.data;
        $scope.upstreamGridOptions.data = upstreamData;
        upstreamAmount = result.upstreamASNCount.data.size;
      }).
        error(function (error) {
          alert("Sorry, it seems that there is some problem with the server. :(\nWait a moment, then try again.");
          console.log(error.message);
        });
    }

    function getDownstream() {
      apiFactory.getDownstreamCount($scope.searchValue).success(function (result) {
        downstreamData = result.downstreamASNCount.data.data;
        $scope.downstreamGridOptions.data = downstreamData;
        downstreamAmount = result.downstreamASNCount.data.size;
      }).
        error(function (error) {
          alert("Sorry, it seems that there is some problem with the server. :(\nWait a moment, then try again.");
          console.log(error.message);
        });
    }

    // draw AS topology with current AS in the middle
    function drawTopology() {
      var w = 500;

      var space1 = w / (upstreamAmount - 1)
      var space2 = w / (downstreamAmount - 1)


      var topologyData = {
        nodes: [
          {
            "id": 0,
            "x": 250,
            "y": 100,
            "name": "AS" + $('#as_number').val(),
            iconType: 'groupS'
          }
        ],
        links: []
      };


      if (upstreamAmount == 1) {
        node = {

          "name": upstreamData[0].UpstreamAS,
          "AS Name": upstreamData[0].as_name,
          "Organization": upstreamData[0].org_name,
          "Country": upstreamData[0].country,
          "-------------------------": "",
          "id": 1,
          "x": 250,
          "y": 0,

          iconType: 'groupL'
        }
        link = {
          "source": 0,
          "target": 1
        }
        topologyData["nodes"][1] = node;
        topologyData["links"][0] = link;
      } else {
        for (var i = 0; i < upstreamAmount; i++) {
          node = {
            "name": upstreamData[i].UpstreamAS,
            "AS Name": upstreamData[i].as_name,
            "Organization": upstreamData[i].org_name,
            "Country": upstreamData[i].country,
            "-------------------------": "",
            "id": i + 1,
            "x": i * space1,
            "y": 0,
            iconType: 'groupL'
          }
          link = {
            "source": 0,
            "target": i + 1
          }
          topologyData["nodes"][i + 1] = node;
          topologyData["links"][i] = link;
        }
      }
      if (downstreamAmount == 1) {
        node = {
          "name": downstreamData[0].DownstreamAS,
          "AS Name": downstreamData[0].as_name,
          "Organization": downstreamData[0].org_name,
          "Country": downstreamData[0].country,
          "-------------------------": "",
          "id": upstreamAmount + 1,
          "x": 250,
          "y": 200,
          iconType: 'groupM'
        }
        link = {
          "source": 0,
          "target": upstreamAmount + 1
        }
        topologyData["nodes"][upstreamAmount + 1] = node;
        topologyData["links"][upstreamAmount] = link
      } else {
        for (var i = 0; i < downstreamAmount; i++) {
          b = {
            "name": downstreamData[i].DownstreamAS,
            "AS Name": downstreamData[i].as_name,
            "Organization": downstreamData[i].org_name,
            "Country": downstreamData[i].country,
            "-------------------------": "",
            "id": upstreamAmount + i + 1,
            "x": i * space2,
            "y": 200,
            iconType: 'groupM'
          }
          link = {
            "source": 0,
            "target": upstreamAmount + i + 1
          }
          topologyData["nodes"][upstreamAmount + i + 1] = b;
          topologyData["links"][upstreamAmount + i] = link
        }
      }


      var App = nx.define(nx.ui.Application, {
        methods: {
          getContainer: function (comp) {
            return new nx.dom.Element(document.getElementById('AS_topology'));
          },
          start: function () {
            var topo = new nx.graphic.Topology({
              //width: canvas_width,
              //height: canvas_height,
              adaptive: true,
              nodeConfig: {
                label: 'model.name', // display node's name as label from model
                iconType: 'model.iconType'
              },
              showIcon: true,
              data: topologyData
            });

            topo.attach(this);
          }
        }
      });

      var app = new App();
      app.start();
    }

  }]);
