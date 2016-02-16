'use strict';

angular.module('bmpUiApp')
  .factory('timeFactory', function () {

    var timeFactory = {};

    var timeNow = Date.now();

    var d = new Date();

    timeNow += d.getTimezoneOffset() * 60000;

    // This will work out time in format
    // Years 2, Months, 3 Day, 1 14h32m
    // From current time to time passed in.
    timeFactory.calTimeFromNow = function (time) {
      //Displays two largest results.
      var timestmp = Date.parse(time); //"2015-03-22 22:23:06"

      var diff = timeNow - timestmp;

      var timeStrings = ["Years, ", "Months, ", " Days, ", "h", "m"];
      var times = [31622400000, 2592000000, 86400000, 3600000, 60000];
      var timeStringSing =  ["Year, ", "Month, ", " Day, ", "h", "m"];
      var timeAmount = [0, 0, 0, 0, 0];

      var timeString = "";
      var show = 4; //show 2 largest
      for (var i = 0; i < times.length; i++) {
        var val = diff / times[i];
        if (val > 1) {
          var round = Math.floor(val);
          timeAmount[i] = round;
          diff = diff - (round * times[i]);
          if (show == 0)
            break;

          var timeSt = timeStrings[i]; //default
          if(timeAmount[i]==1)
            timeSt = timeStringSing[i];

          timeString += timeAmount[i] + timeSt;
          show--;
        }
      }
      // console.log("the time is ", timeString);
      return timeString;
    };

    return timeFactory;
  });
