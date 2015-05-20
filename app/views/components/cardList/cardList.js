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
//1.Can Select a peer without a router being selected.
//  -- to do this need to check parent isnt empty.
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
        scope.cApi = {};

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


        scope.api = {

          removeCard: function (card){
            var pIndex = scope.priority.indexOf(card.type);

            var index = arr[pIndex].indexOf(card);
            arr[pIndex].splice(index, 1);

            //if empty then empty childs
            if(arr[pIndex][0] == null){
              for(var i = pIndex; i >= 0; i--){
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
              scope.cApi[card.$$hashKey]={functions:null};
              //remove oldest of the begining if list becomes to long.
              if (arr[pIndex].length + 1 > scope.length[pIndex]) {
                var reCard = arr[pIndex].shift();
                delete scope.cApi[reCard.$$hashKey];
                //if empty then empty childs
                if(arr[pIndex][0] == null){
                  for(var i = pIndex; i >= 0; i--){
                    arr[i] = [];
                  }
                }
              }
              arr[pIndex].push(card);
            }

            //close parent cards
            for(var i = pIndex+1; i < arr.length; i++){
              for(var j =0; j < arr[i].length; j++){
                var api = scope.cApi[arr[i][j].$$hashKey].functions;
                if(api.getCardState()){ //check open
                  api.changeCardState(); //close it
                }
              }
            }

            buildList();
          }

        };
      }
    }
  });
