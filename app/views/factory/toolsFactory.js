'use strict';

angular.module('bmpUiApp')
.factory('toolsFactory', function() {
  var toolsFactory = {};

  /**
   * Add default information for ONE record
   * @param data ONE record
   * @returns {*}
   */
  toolsFactory.addDefaultInfo = function(data) {
    if (data.latitude == null && data.longitude == null) {
      data.latitude = 37.3639;
      data.longitude = -121.929;
    }

    if (data.country == null) {
      data.country = 'US';
    }

    if (data.city == null) {
      data.city = 'San Jose';
    }

    if (data.stateprov == null) {
      data.stateprov = "CA";
    }
    return data;
  };

  return toolsFactory;
});
