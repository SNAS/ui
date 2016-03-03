'use strict';

angular.module('bmpUiApp')
  .controller('AtlasController', ["$scope", "apiFactory", function ($scope, apiFactory) {

    var map = L.map('map').setView([39.50, -98.35], 4);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      accessToken: 'pk.eyJ1IjoicmFpbnk5MjcxIiwiYSI6ImNpaHNicmNlaDAwcWp0N2tobmxiOGRnbXgifQ.iWcbPl8TwyIX-qaX6nTx-g',
      id: 'rainy9271.obcfe84n'
    }).addTo(map);

    var panMap = function (e) {
      var value;
      if (e.target.attributes['asn'] != undefined) {
        value = e.target.attributes['asn'].value;
        map.setView(ASCircles[value].getLatLng(), map.getMaxZoom() - 1);
      }
      else {
        value = e.target.innerText;
        map.setView(prefixCircles[value].getLatLng(), map.getMaxZoom() - 1);
      }
    };

    L.Control.Indicator = L.Control.extend({
      options: {
        position: 'bottomleft'
      },
      onAdd: function (map) {
        var container = L.DomUtil.create('div', 'map-control-group');

        this.label = L.DomUtil.create('p', 'control-indicator', container);
        this.label.innerText = "Selected : None";
        this.label.id = "indicator";

        return container;
      }
    });

    L.Control.Locator = L.Control.extend({
      options: {
        position: 'topright',
        placeholder: 'Search...'
      },
      onAdd: function (map) {
        var container = L.DomUtil.create('div', 'map-control-group');

        this.input = L.DomUtil.create('input', 'form-control input-sm', container);
        this.input.type = 'text';
        this.input.placeholder = this.options.placeholder;
        this.input.id = "locator";

        container.innerHTML += '<label class="display-block"><input id="toggleLines" type="checkbox" checked="checked" />Show Lines</label>';

        container.innerHTML += '<label class="display-block"><input id="toggleList" type="checkbox" checked="checked" />Show List</label>';

        L.DomEvent.disableClickPropagation(container);

        return container;
      }
    });

    L.Control.ListView = L.Control.extend({
      options: {
        position: 'topright'
      },
      onAdd: function (map) {
        var container = L.DomUtil.create('div', 'listView');
        container.id = 'list';
        this.upstreamList = L.DomUtil.create('div', null, container);
        this.downstreamList = L.DomUtil.create('div', null, container);
        this.prefixList = L.DomUtil.create('div', null, container);
        this.upstreamList.id = 'upstreamList';
        this.downstreamList.id = 'downstreamList';
        this.prefixList.id = 'prefixList';
        L.DomEvent.addListener(container, 'click', panMap, this);
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.addListener(container, 'mousewheel', function (e) {
          L.DomEvent.stopPropagation(e);
        });
        return container;
      }
    });

    map.addControl(new L.Control.Indicator());
    map.addControl(new L.Control.Locator());
    map.addControl(new L.Control.ListView());

    function locate(e) {
      if (e.keyCode == 13) {
        var searchValue = this.value;
        if (searchValue.indexOf("/") < 0) {
          selectAS(searchValue);
        }
        else {
          apiFactory.getWhoisPrefix(searchValue).success(function (result) {
            selectAS(result.gen_whois_route.data[0].origin_as);
          });
        }
      }
    }

    $("#locator")[0].addEventListener("keyup", locate, false);

    var showLines = true, showList = true;

    function toggleLines() {
      showLines = this.checked;
      angular.forEach(ASPolyLines, function (line) {
        if (showLines) {
          if (!map.hasLayer(line))
            line.addTo(map);
        }
        else {
          if (map.hasLayer(line))
            map.removeLayer(line);
        }
      });
      angular.forEach(prefixPolylines, function (line) {
        if (showLines) {
          if (!map.hasLayer(line))
            line.addTo(map);
        }
        else {
          if (map.hasLayer(line))
            map.removeLayer(line);
        }
      });
    }

    $("#toggleLines")[0].addEventListener("click", toggleLines, false);

    function toggleList() {
      showList = this.checked;
      if (showList)
        $('#list').show();
      else
        $('#list').hide();
    }

    $("#toggleList")[0].addEventListener("click", toggleList, false);


    var ASPolyLines = [], ASCircles = {}, prefixPolylines = [], prefixCircles = {}, prefixCaches = {};

    var lastCircle = null;

    //function waitForResetCircles(ASes) {
    //  if (typeof ASes !== "undefined" && ASes != null) {
    //    angular.forEach(ASes.split(','), function (e) {
    //      if (ASCircles[e] != undefined)
    //        ASCircles[e].options.color = "black";
    //    });
    //  }
    //  else {
    //    setTimeout(function () {
    //      waitForResetCircles(ASes);
    //    }, 250);
    //  }
    //}
    function resetCircles(ASes) {
      angular.forEach(ASes.split(','), function (e) {
        if (ASCircles[e] != undefined)
          ASCircles[e].options.color = "black";
      });
    }

    var selectAS = function (as) {
      if (lastCircle != null) {
        lastCircle.options.color = "black";
        //waitForResetCircles(lastCircle.AS.upstreams);
        //waitForResetCircles(lastCircle.AS.downstreams);
        if (lastCircle.AS.upstreams != null)
          resetCircles(lastCircle.AS.upstreams);
        if (lastCircle.AS.downstreams != null)
          resetCircles(lastCircle.AS.downstreams);
      }

      var thisCircle = ASCircles[as];

      $('#upstreamList')[0].innerHTML = "";
      $('#downstreamList')[0].innerHTML = "";
      $('#prefixList')[0].innerHTML = "";

      console.log(thisCircle);

      $('#indicator')[0].innerText = "Selected : AS" + as + " | "
        + (thisCircle.AS.as_name ? thisCircle.AS.as_name + " | " : "")
        + (thisCircle.AS.org_name ? thisCircle.AS.org_name + " | " : "")
        + (thisCircle.AS.state_prov ? thisCircle.AS.state_prov + " | " : "")
        + (thisCircle.AS.city ? thisCircle.AS.city + " | " : "")
        + (thisCircle.AS.country ? thisCircle.AS.country + " | " : "");

      apiFactory.getRelatedAS(as).success(function (result) {
        thisCircle.AS.upstreams = result.table.data[0].upstreams;
        thisCircle.AS.downstreams = result.table.data[0].downstreams;

        lastCircle = thisCircle;

        var upstreams = thisCircle.AS.upstreams.split(',');
        var downstreams = thisCircle.AS.downstreams.split(',');

        var bounds = [thisCircle.getLatLng()];

        thisCircle.options.color = "#FF00CC";

        angular.forEach(upstreams, function (e) {
          if (ASCircles[e] != undefined)
            ASCircles[e].options.color = "#FF4448";
        });
        angular.forEach(downstreams, function (e) {
          if (ASCircles[e] != undefined)
            ASCircles[e].options.color = "#5CC5EF";
        });

        angular.forEach(ASPolyLines, function (polyline) {
          if (map.hasLayer(polyline))
            map.removeLayer(polyline);
        });

        ASPolyLines = [];


        angular.forEach(upstreams, function (upAS) {
          if (ASCircles[upAS] != undefined) {
            var line = L.polyline([thisCircle.getLatLng(), ASCircles[upAS].getLatLng()], {
              color: '#FF4448',
              weight: 2,
              opacity: 0.5
            });
            ASPolyLines.push(line);
            if (showLines)
              line.addTo(map);
            $('#upstreamList')[0].innerHTML += "<p class='label labelCustom' style='background-color: #FF4448;display: block;cursor: pointer' asn='" + upAS + "'>" + (ASCircles[upAS].AS.as_name ? ASCircles[upAS].AS.as_name : upAS) + "</p>";
            bounds.push(ASCircles[upAS].getLatLng());
          }
        });

        angular.forEach(downstreams, function (downAS) {
          if (ASCircles[downAS] != undefined) {
            var line = L.polyline([thisCircle.getLatLng(), ASCircles[downAS].getLatLng()], {
              color: '#5CC5EF',
              weight: 2,
              opacity: 0.5
            });
            ASPolyLines.push(line);
            if (showLines)
              line.addTo(map);
            $('#downstreamList')[0].innerHTML += "<p class='label labelCustom' style='background-color: #5CC5EF;display: block;cursor: pointer' asn='" + downAS + "'>" + (ASCircles[downAS].AS.as_name ? ASCircles[downAS].AS.as_name : downAS) + "</p>";
            bounds.push(ASCircles[downAS].getLatLng());
          }
        });

        map.fitBounds(L.latLngBounds(bounds), {paddingBottomRight: [0, 200]});
      });


      apiFactory.getPrefixesOriginingFrom(as).success(function (result) {

        var v_routes = result.v_routes.data;
        var existedPrefixes = [];
        var nonExistedPrefixes = [];

        angular.forEach(prefixCircles, function (circle) {
          if (map.hasLayer(circle))
            map.removeLayer(circle);
        });
        angular.forEach(prefixPolylines, function (polyline) {
          if (map.hasLayer(polyline))
            map.removeLayer(polyline);
        });
        prefixCircles = {};
        prefixPolylines = [];

        angular.forEach(v_routes, function (row) {
          var fullPrefix = row.Prefix + "/" + row.PrefixLen;
          if (prefixCaches[fullPrefix] != undefined)
            existedPrefixes.push(prefixCaches[fullPrefix]);
          else
            nonExistedPrefixes.push(row);
        });
        angular.forEach(nonExistedPrefixes, function (row) {
          apiFactory.getPeerGeo(row.PeerAddress).success(function (geo) {

            var fullPrefix = row.Prefix + "/" + row.PrefixLen;
            var geoData = geo.v_geo_ip.data[0];
            var lat = parseFloat(geoData.latitude) + ((Math.random() > 0.5 ? 1 : -1) * Math.random() * 0.01);
            var long = parseFloat(geoData.longitude) + ((Math.random() > 0.5 ? 1 : -1) * Math.random() * 0.01);
            var circle = L.circleMarker([lat, long], {
              color: "green",
              fillColor: "#CCCCCC"
            }).on('mouseover', function (e) {
              e.target.openPopup();
            }).on('mouseout', function (e) {
              e.target.closePopup();
            }).bindPopup("<p>" + "Prefix: " + fullPrefix + "</p>"
                + "<p>" + "Peer Name: " + row.PeerName + "</p>"
                + "<p>" + "Router Name: " + row.RouterName + "</p>"
              )
              .addTo(map);
            circle.prefix = row;
            circle.fullPrefix = fullPrefix;
            prefixCircles[fullPrefix] = circle;
            var line = L.polyline([thisCircle.getLatLng(), L.latLng(lat, long)], {
              color: 'lightgreen',
              weight: 2,
              opacity: 0.5
            });
            prefixPolylines.push(line);
            if (showLines)
              line.addTo(map);
            $('#prefixList')[0].innerHTML += "<p class='label labelCustom' style='background-color: lightgreen;display: block;cursor: pointer'>" + fullPrefix + "</p>";

            prefixCaches[fullPrefix] = circle;

          });
        });
        angular.forEach(existedPrefixes, function (circle) {

          circle.addTo(map);
          var fullPrefix = circle.fullPrefix;
          var line = L.polyline([thisCircle.getLatLng(), circle.getLatLng()], {
            color: 'lightgreen',
            weight: 2,
            opacity: 0.5
          });
          prefixPolylines.push(line);
          if (showLines)
            line.addTo(map);
          $('#prefixList')[0].innerHTML += "<p class='label labelCustom' style='background-color: lightgreen;display: block;cursor: pointer'>" + fullPrefix + "</p>";

        });
      });

      $('#locator').val(as);

    };

    apiFactory.getAllAS().success(function (result) {

      var ASCollection;

      var cluster;

      ASCollection = result.gen_whois_asn.data;

      $scope.loading = true;

      cluster = new L.MarkerClusterGroup({
        chunkedLoading: true
      });

      angular.forEach(ASCollection, function (as) {
        var baseLatLng, lat, long, noGeo = '';
        if (as.city_lat && as.city_long)
          baseLatLng = [as.city_lat, as.city_long];
        else {
          baseLatLng = [14.774883, -133.945312];
          noGeo = '<div class="row"><span class="label label-danger col-xs-12"><h4>This AS has no geo location provided</h4></span></div>'
        }
        lat = parseFloat(baseLatLng[0]) + ((Math.random() > 0.5 ? 1 : -1) * Math.random() * 0.01);
        long = parseFloat(baseLatLng[1]) + ((Math.random() > 0.5 ? 1 : -1) * Math.random() * 0.01);

        var circle = L.circleMarker([lat, long], {
          color: 'black',
          fillColor: 'pink',
          fillOpacity: 0.5
        }).on('click', function (e) {
          selectAS(e.target.AS.asn);
        }).on('mouseover', function (e) {
          e.target.openPopup();
        }).on('mouseout', function (e) {
          e.target.closePopup();
        }).bindPopup("<p>" + "AS: " + as.asn + "</p>"
          + "<p>" + "AS Name: " + as.as_name + "</p>"
          + "<p>" + "Org Name: " + as.org_name + "</p>"
          + noGeo
        ).addTo(cluster);

        circle.AS = as;

        ASCircles[as.asn] = circle;

      });

      $scope.loading = false;

      cluster.addTo(map);
    });
  }]);
