'use strict';

angular.module('bmpUiApp')
  .factory('cardFactory', function () {

    var cardFactory = {};

    cardFactory.createLocationTable = function(data){
      if (data.stateprov !== undefined || data.city !== undefined || data.country !== undefined) {
        var type;
        if (data.type === "Router") {
          type = "BMP Router";
        } else if (data.type === "Peer") {
          type = "Peer";
        } else {
          type = "None";
        }
        return (
        '<table class="table">' +
        ' <tr>' +
        '   <td>Type</td>' +
        '   <td>' + type + '</td>' +
        ' </tr>' +
        ' <tr>' +
        '   <td>Location</td>' +
        '   <td>' + data.city + '</td>' +
        ' </tr>' +
        ' <tr>' +
        '   <td>State</td>' +
        '   <td>' + data.stateprov + '</td>' +
        ' </tr>' +
        ' <tr>' +
        '   <td>Country</td>' +
        '   <td>' + data.country + '</td>' +
        ' </tr>' +
        '</table>'
        );
      } else {
        //DEFAULT Data
        return "<table class='routerLoc noRouterLoc'><tr><td>There is no Location Data ...</td></tr></table>";
      }
    };

    return cardFactory;
  });
