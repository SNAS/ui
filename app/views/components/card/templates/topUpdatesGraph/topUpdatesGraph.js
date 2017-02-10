'use strict';

angular.module('bmp.components.card')

  .controller('BmpCardTopUpdatesGraphController', ["$scope", "apiFactory", '$timeout', '$state', '$stateParams', function ($scope, apiFactory, $timeout, $state, $stateParams) {
      $scope.loading = true;
      $scope.topUpdatesGraph = {
        chart: {
          type: 'discreteBarChart',
          height: 500,
          margin : {
            top: 20,
            right: 20,
            bottom: 80,
            left: 70
          },
          color: function (d, i) {
            //return d.color
            return "#EAA546";
          },
          x: function(d){return d.label;},
          y: function(d){return d.value;},
          showValues: true,
          valueFormat: function(d){
            return d3.format('')(d);
          },
          transitionDuration: 500,
          tooltipContent: function (key, x, y, e, graph) {
            //hover = y;
            hoverValue(x);
            return '<h3>' + key + '</h3>' +
              '<p>' +  y + ' on ' + x + '</p>';
          },
          xAxis: {
            rotateLabels: -25,
            rotateYLabel: true
          },
          yAxis: {
            axisLabel: 'Number of Updates',
            axisLabelDistance: 30,
            tickFormat:d3.format('d')
          }
        }
      };

    var hoverValue = function(y){
      $scope.hover = y;
      $scope.$apply();
    };

    $scope.topUpdatesConfig = {
      visible: $scope.data.visible // default: true
    };


    $scope.topUpdatesData = [
      {
        key: "Updates"
      }
    ];

    apiFactory.getTopPrefixUpdatesByPeer($scope.data.peer_hash_id)
      .success(function (result){

        var data = result.log.data;
        var len = data.length;
        var gData = [];
        for(var i = 0; i < len; i++){
          gData.push({
            label:data[i].Prefix + "/" + data[i].PrefixLen, value:parseInt(data[i].Count)
          });
        }
        $scope.topUpdatesData[0].values = gData;
        $scope.loading = false;
      })
      .error(function (error){
        console.log(error.message);
      });

    // ------------------ used for GRAPHS ---------- binding click function-----------------------------//
    function bindGraphClick() {
      if ($scope.topUpdatesData[0].values != undefined) {
        d3.selectAll("#topUpdates .nv-bar").on('click', function(){
          $('#topUpdatesModal').modal('show');
        });
      }
      else {
        setTimeout(function () {
          bindGraphClick();
        }, 250);
      }
    }

    bindGraphClick();

    $scope.goUpdates= function(){
      $('#topUpdatesModal').modal('hide');
      $('body').removeClass('modal-open');
      $('.modal-backdrop').remove();
      $state.go('app.prefixAnalysis', {
        p: $scope.hover,
        peer: $scope.$parent.$parent.data['peer_hash_id'],
        type: 'updates'
      });
    }

  }]);
