'use strict';

/**
 * @ngdoc function
 * @name bmpUiApp.controller:WhoIsController
 * @description
 * # WhoIsController
 * Controller of the Login page
 */
angular.module('bmpUiApp')
  .controller('WhoIsController', ['$scope','apiFactory', function ($scope, apiFactory) {

    apiFactory.getWhoIsName("Cisco").
      success(function (result){
        $scope.whoIsData = result.w.data;
        createWhoIsDataGrid();
      }).
      error(function (error){
        console.log(error.message);
      });


    //Loop through data selecting and altering relevant data.
    $scope.searchValue = function(value) {
      var numberRegex = /^\d+$/;

      if(numberRegex.exec(value) == null){
        //  not a number do string search
        apiFactory.getWhoIsName(value).
          success(function (result){
            $scope.whoIsData = result.w.data;
            createWhoIsDataGrid();
          }).
          error(function (error){
            console.log(error.message);
          });
      }else{
        // do a asn search
        apiFactory.getWhoIsWhereASN(value).
          success(function (result){
            $scope.whoIsData = result.w.data;
            createWhoIsDataGrid();
          }).
          error(function (error){
            console.log(error.message);
          });
      }

    };

    var createWhoIsDataGrid = function () {
      $scope.whoIsGrid = [];
      for(var i = 0; i <  $scope.whoIsData.length; i++) {
        $scope.whoIsGrid.push({
            "asn":  $scope.whoIsData[i].asn,
            "isTransit": $scope.whoIsData[i].isTransit,
            "isOrigin": $scope.whoIsData[i].isOrigin,
            "as_name": $scope.whoIsData[i].as_name,
            "org_name": $scope.whoIsData[i].org_name,
            "country": $scope.whoIsData[i].country
        });
      }
    };

    $scope.whoIsGridOptions = { data: 'whoIsGrid' };

  }]);
