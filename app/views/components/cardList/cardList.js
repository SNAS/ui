'use strict';

//::NOTES::
//------------------------------------------------------------
//This directive is for keeping track of the cards directive
//This has been made so can resuse for other lists
//Has a priority [x,y,z] where z in most important (at top)
//Has length which corresponds to prioirty so [4,3,1] where 3
//would be the max length of the y list.
//------------------------------------------------------------

//::CHANGES::
//------------------------------------------------------------
//1.Need to make it so when change router to empty so replace it
//that it will empty all the childs lists of that element.
//
//2.Can Select a peer without a router being selected.
//------------------------------------------------------------

angular.module('bmp.components.cardList',[])

  .directive('bmpCardList', function () {
    return  {
      templateUrl: "views/components/cardList/cardList.html",
      restrict: 'AE',
      replace: 'true',
      scope: {
        length: '=',      //set length of cards to show
        priority: '=',    //order for the cards !!most imp at end!!
        api: '=',         //directive global api
        pageLocation: '=' //location for getting relevant template
      },
      link: function(scope) {
        scope.cards = [];
        var arr = new Array(scope.priority.length);

        for(var i = 0; i < scope.priority.length; i++){
          arr[i] = [];
        }

        //This is to change it to 1D array for iteration
        var buildList = function(){
          var buildarr = [];
          for(var i = 0; i < scope.priority.length; i++){
            buildarr = buildarr.concat(arr[i]);
          }
          scope.cards = buildarr;
        };

        //this is naughty used for when click x in card direc
        scope.removeCard = function (card){
          scope.api.removeCard(card);
        };

        scope.api = {

          removeCard: function (card){
            var pIndex = scope.priority.indexOf(card.type);

            debugger;

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
            card.template = scope.pageLocation + card.type;

            var pIndex = scope.priority.indexOf(card.type);

            //check card doesnt exist
            if (arr[pIndex].indexOf(card) == -1) {
              arr[pIndex].push(card);
              //remove oldest of the begining if list to long.
              if (arr[pIndex].length > scope.length[pIndex]) {
                arr[pIndex].shift();
              }
            }
            buildList();
          }

        };
      }
    }
  });
