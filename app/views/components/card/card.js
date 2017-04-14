'use strict';

//When creating a new card must create a folder with name of the
//new card something relevnat makes easier to find it and know what it is
//Then you need 3 file a .scss .js and .html file. in this folder.
//There names will be same as the folder with the extensions on the end
//The only exception is scss has to have underscore at the front e.g. _name.scss

//Once this is done create a controller inside the js file and give it a name
//that has not been used.

//Now to create the html file. You just start it with a div and in this div add
//attriubte ng-controller="name" where name is the name of the controller from
//the js file.

//The structure of the html file should then have two parts as follows::
//
//<div ng-controller="name">
//
//   <!--PART 1: COLLAPSED view-->
//   <div ng-hide="cardExpand" class="collapsed">
//
//   </div>
//
//   <!--PART 2: EXPANDED view-->
//   <div ng-show="cardExpand">
//    <br>
//
//   </div>
//
//</div>

//Now can edit the card as you wish

//To add card to a page add the following
//<div bmp-card
//  data="card"
//  noremove="false"
//  template="folderName"
//  expand="false"
//  removeCard="removeCard(card)">
//</div>

//       data - this is a variable that can have all information you pass to card it needs for processing.
//  removable - this is boolean true if you dont want to be able to remove the card (remove the little x).
//   template - this is way to access the card's html file just need to use the name given to folder.
// removeCard - this is a call back. Used if you add card to list and when click x will remove it from
//              that list to stop showing it.
//     expand - this defaults to closed but if want if open give it value of true.

angular.module('bmp.components.card',['ui.bootstrap'])

  .directive('bmpCard', function () {
    return  {
      templateUrl: "views/components/card/card.html",
      restrict: 'AE',
      replace: 'true',
      scope: {
        data: '=',       //data to pass to card controller
        noremove: '=?',  //optional
        template: '=',   //folderName
        removecard: '&', //method to remove card
        expand: '=',     //state of card (expanded or collapsed)
        api: '=?'         //used to close cards
      },
      link: function(scope) {
        var generics = ['Peer']; //all generic card
        scope.templatePath = 'views/components/card/templates/';

        if(generics.indexOf(scope.data.type) != -1){
          //  is a generic card load that first
          scope.templateLoc = scope.templatePath + 'generic'+ scope.data.type + '/' + 'generic'+ scope.data.type + '.html';
        }else{
          scope.templateLoc = scope.templatePath + scope.template + '/' + scope.template + '.html';
        }

        scope.cardExpand = true; //default
        if(scope.expand !== undefined)
          scope.cardExpand = scope.expand;

        if(scope.noremove === undefined) //default removable = true
          scope.noremove = true;


        scope.api = {

          changeCardState : function() {
            scope.cardExpand = !scope.cardExpand;
          },

          getCardState : function(){
            return scope.cardExpand;
          }

        };

      }
    }
  });
