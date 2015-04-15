'use strict';

angular.module('bmp.components.cardList',[])

  .directive('bmpCardList', function () {
    return  {
      templateUrl: "views/components/card/card.html",
      restrict: 'AE',
      replace: 'true',
      scope: {
        length: '=',   //set length of cards to show
        priority: '=', //order for the cards !!most imp at end!!
        api: '='       //directive global api
      },
      link: function(scope) {
        scope.cards = [];
        var arr = new Array(priority.length);

        //This is to change it to 1D array for iteration
        var buildList = function(){
          var builarr = [];
          for(var i = 0; i < priority.length; i++){
            buildarr.push(arr[i]);
          }
          scope.cards = buildarr;
        };

        scope.api = {

          removeCard: function (card){
            var pIndex = scope.priority.indexOf(card.template);

            var index = arr[pIndex].indexOf(card);
            arr[pIndex].splice(index, 1);

            //if empty then empty childs
            if(arr[pIndex]==[]){
              for(var i = pIndex; i > 0; i--){
                arr[i] = [];
              }
            }

            buildList();
          },

          changeCard: function(card) {
            var pIndex = scope.priority.indexOf(card.template);

            //check card doesnt exist
            if (arr[pIndex].indexOf(card) == -1) {
              arr[pIndex].push(value);
              //remove oldest of the begining if list to long.
              if (arr[pIndex].length > scope.length) {
                arr[pIndex].shift();
              }
            }
            buildList();
          }

        };
      }
    }
  });
