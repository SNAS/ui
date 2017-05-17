// transforms UTC time to local
// example of input: 2017-04-10 09:48:38
// output if based in the UK (British Summer Time = UTC + 1): 2017-04-10 10:48:38
angular.module('bmp.components.utcFilter', [])
  .filter('utcToLocalTime', ['$filter', function($filter) {
    function formatUtcFilter(input) {
      if (input === undefined) {
        return input;
      }
      // remove milliseconds from the input date
      var withoutMs = input.replace(/([0-9\-]+)\s([0-9\:]+).*/, "$1 $2");
      //      console.debug("formatUtcFilter", input, withoutMs);
      var newDate = new Date(withoutMs + " UTC");
      return $filter('date')(newDate, 'yyyy-MM-dd HH:mm:ss');
    }
    return formatUtcFilter;
  }])
  .filter('utcToDateObject', function($filter) {
    function formatUtcFilter(input) {
      if (input === undefined) {
        return input;
      }
      // remove milliseconds from the input date
      var withoutMs = input.replace(/([0-9\-]+)\s([0-9\:]+).*/, "$1 $2");
      //      console.debug("formatUtcFilter", input, withoutMs);
      return new Date(withoutMs + " UTC");
    }
    return formatUtcFilter;
  });
