angular.module('bmpUiApp').controller('BGPHeaderCtrl',
  function($rootScope, apiFactory) {
    //used for getting suggestions
    $rootScope.getSuggestions = function(val) {
      if (isNaN(val)) {
        return apiFactory.getWhoIsASNameLike(val, 10).then(function(response) {
//          console.debug(response.data.w.data);
          return response.data.w.data.map(function(item) {
            return item.as_name;// + " (ASN: "+item.asn+")";
          });
        });
      } else {
        return [];
      }
    };
  }
);