'use strict';

angular.module('bmpUiApp')
  .controller('AtlasController', ["$scope", "apiFactory", function ($scope, apiFactory) {

    //group an array
    function groupBy(array, f) {
      var groups = {};
      array.forEach(function (o) {
        var group = JSON.stringify(f(o));
        groups[group] = groups[group] || [];
        groups[group].push(o);
      });
      return Object.keys(groups).map(function (group) {
        return groups[group];
      })
    }

    var map = L.map('map').setView([37.4250, -121.9460], 8);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      accessToken: 'pk.eyJ1IjoicmFpbnk5MjcxIiwiYSI6ImNpaHNicmNlaDAwcWp0N2tobmxiOGRnbXgifQ.iWcbPl8TwyIX-qaX6nTx-g',
      id: 'rainy9271.obcfe84n',
      minZoom: 3
    }).addTo(map);

    var panMap = function (e) {
      var value;
      if (e.target.attributes['asn'] != undefined) {
        value = e.target.attributes['asn'].value;
        map.panTo(ASCircles[value]._latlng, {animate: true});
      }
      else {
        value = e.target.innerText;
        map.panTo(prefixCircles[value]._latlng, {animate: true});
      }
    };

    L.Control.Locator = L.Control.extend({
      options: {
        position: 'topright',
        placeholder: 'Search...'
      },
      onAdd: function (map) {
        var container = L.DomUtil.create('div', 'my-custom-control');

        this.input = L.DomUtil.create('input', 'form-control input-sm', container);
        this.input.type = 'text';
        this.input.placeholder = this.options.placeholder;
        L.DomEvent.addListener(this.input, 'keyup', _.debounce(this.keyup, 300), this);
        L.DomEvent.disableClickPropagation(container);
        return container;
      },
      keyup: function (e) {
        if (e.keyCode == 13) {
          var searchValue = this.input.value;
          if (searchValue.indexOf("/") < 0) {
            map.setView(ASCircles[searchValue]._latlng, 12);
            selectAS(searchValue);
          }
          else {
            apiFactory.getWhoisPrefix(searchValue).success(function (result) {
              map.setView(ASCircles[result.gen_whois_route.data[0].origin_as]._latlng, 12);
              selectAS(result.gen_whois_route.data[0].origin_as);
            });
          }
        }
      }
    });

    L.Control.ListView = L.Control.extend({
      options: {
        position: 'topright'
      },
      onAdd: function (map) {
        var container = L.DomUtil.create('div', 'my-custom-control');

        this.list = L.DomUtil.create('div', 'listView', container);
        this.list.id = 'list';
        L.DomEvent.addListener(this.list, 'click', panMap, this);

        return container;
      }
    });

    map.addControl(new L.Control.Locator());
    map.addControl(new L.Control.ListView());

    var ASPolyLines = [], ASCircles = [], prefixCircles = [];

    var lastCircle = null;

    var listViewHTML = "";

    var selectAS = function (as) {
      if (lastCircle != null) {
        lastCircle.options.color = "#686868";
        angular.forEach(lastCircle.AS.upstreams.split(','), function (e) {
          if (ASCircles[e] != undefined)
            ASCircles[e].options.color = "#686868";
        });
        angular.forEach(lastCircle.AS.downstreams.split(','), function (e) {
          if (ASCircles[e] != undefined)
            ASCircles[e].options.color = "#686868";
        });
      }

      var thisCircle = ASCircles[as];

      lastCircle = thisCircle;

      var upstreams = thisCircle.AS.upstreams.split(',');
      var downstreams = thisCircle.AS.downstreams.split(',');

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
        map.removeLayer(polyline);
      });
      angular.forEach(prefixCircles, function (circle) {
        map.removeLayer(circle);
      });

      listViewHTML = "";

      angular.forEach(upstreams, function (upAS) {
        if (ASCircles[upAS] != undefined) {
          ASPolyLines.push(L.polyline([thisCircle._latlng, ASCircles[upAS]._latlng], {
            color: '#FF4448',
            weight: 2,
            opacity: 0.3
          }).addTo(map));
          listViewHTML += "<p class='label labelCustom' style='background-color: #FF4448;display: block;cursor: pointer' asn='" + upAS + "'>" + (ASCircles[upAS].AS.as_name ? ASCircles[upAS].AS.as_name : upAS) + "</p>";
        }
      });

      angular.forEach(downstreams, function (downAS) {
        if (ASCircles[downAS] != undefined) {
          ASPolyLines.push(L.polyline([thisCircle._latlng, ASCircles[downAS]._latlng], {
            color: '#5CC5EF',
            weight: 2,
            opacity: 0.3
          }).addTo(map));
          listViewHTML += "<p class='label labelCustom' style='background-color: #5CC5EF;display: block;cursor: pointer' asn='" + downAS + "'>" + (ASCircles[downAS].AS.as_name ? ASCircles[downAS].AS.as_name : downAS) + "</p>";
        }
      });

      apiFactory.getPrefixesOriginingFrom(as).success(function (result) {

        var v_routes = result.v_routes.data;

        angular.forEach(v_routes, function (row) {
          apiFactory.getPeerGeo(row.PeerAddress).success(function (geo) {
            var geoData = geo.v_geo_ip.data[0];
            var lat = geoData.latitude;
            var long = geoData.longitude;
            var fullPrefix = row.Prefix + "/" + row.PrefixLen;
            var circle = L.circle([lat, long], 300, {
                color: "lightgreen",
                fillColor: 'white',
                fillOpacity: 0.5
              })
              .addTo(map).bindPopup("<p>" + "Prefix: " + fullPrefix + "</p>"
                + "<p>" + "Peer Name: " + row.PeerName + "</p>"
                + "<p>" + "Router Name: " + row.RouterName + "</p>"
              );
            circle.prefix = row;
            prefixCircles[fullPrefix] = circle;
            ASPolyLines.push(L.polyline([thisCircle._latlng, L.latLng(lat, long)], {
              color: 'lightgreen',
              weight: 2,
              opacity: 0.3
            }).addTo(map));
            $('#list')[0].innerHTML += "<p class='label labelCustom' style='background-color: lightgreen;display: block;cursor: pointer'>" + fullPrefix + "</p>";
          });
        });

      });

      $('#list')[0].innerHTML = listViewHTML;

    };

    var ASCollection;

    $scope.loading = true;

    apiFactory.getAllASAndRelationships().success(function (result) {

      $scope.loading = false;

      ASCollection = groupBy(result.ASCollection.data, function (item) {
        return [item.country ? getCode(item.country) : item.country, item.city ? item.city.toLowerCase() : item.city];
      });

      angular.forEach(ASCollection, function (asArray) {
        var countryCode = asArray[0].country ? getCode(asArray[0].country) : asArray[0].country;
        var city = asArray[0].city ? asArray[0].city.toLowerCase() : asArray[0].city;
        var baseLatLng, lat, long;
        if (countryCode && city)
          apiFactory.getGeoLocation(countryCode, city).success(function (location) {
            if (!location.geo_location.data.length > 0)
              baseLatLng = [-78.870048, 12.216797];
            else
              baseLatLng = [location.geo_location.data[0].latitude, location.geo_location.data[0].longitude];
            angular.forEach(asArray, function (as) {
              lat = parseFloat(baseLatLng[0]) + ((Math.random() > 0.5 ? 1 : -1) * Math.random() * 0.03);
              long = parseFloat(baseLatLng[1]) + ((Math.random() > 0.5 ? 1 : -1) * Math.random() * 0.03);

              var radius = (as.upstreams.split(',').length + as.downstreams.split(',').length) * 8;
              var circle = L.circle([lat, long], radius, {
                color: '#686868',
                fillColor: 'white',
                fillOpacity: 0.5
              }).addTo(map).bindPopup("<p>" + "AS: " + as.asn + "</p>"
                + "<p>" + "AS Name: " + as.as_name + "</p>"
                + "<p>" + "Org Name: " + as.org_name + "</p>"
                + (baseLatLng == [1, 1] ? ("<h4>" + "This AS has no geo location provided" + "</h4>") : "")
              );

              circle.AS = as;

              circle.on('click', function (e) {

                selectAS(circle.AS.asn);

              });

              ASCircles[as.asn] = circle;
            });
          });
        else {
          baseLatLng = [-78.870048, 12.216797];
          angular.forEach(asArray, function (as) {
            lat = parseFloat(baseLatLng[0]) + ((Math.random() > 0.5 ? 1 : -1) * Math.random() * 0.025);
            long = parseFloat(baseLatLng[1]) + ((Math.random() > 0.5 ? 1 : -1) * Math.random() * 0.025);

            var radius = (as.upstreams.split(',').length + as.downstreams.split(',').length) * 7;
            var circle = L.circle([lat, long], radius, {
              color: 'black',
              fillColor: 'orange',
              fillOpacity: 0.4
            }).addTo(map).bindPopup("<p>" + "AS: " + as.asn + "</p>"
              + "<p>" + "AS Name: " + as.as_name + "</p>"
              + "<p>" + "Org Name: " + as.org_name + "</p>"
              + "<h4>" + "This AS has no geo location provided" + "</h4>"
            );

            circle.AS = as;

            circle.on('click', function (e) {

              selectAS(circle.AS.asn);

            });

            ASCircles[as.asn] = circle;
          });
        }
      });
    });

  }
  ]);
