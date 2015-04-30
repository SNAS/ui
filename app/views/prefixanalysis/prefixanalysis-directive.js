angular.module('bmpUiApp')
      .directive('d3Directive', function(){
  function link($scope,element){
    //element.text("hello world!");
    // console.log("hello world!");
    var w = 600;
    var h = 20;
    var datasetAs = [5, 10, 13, 19, 21, 25, 22, 18, 15, 13, 11, 12, 15, 20, 18, 17, 16, 18, 23, 25, 21, 22, 23, 24];

//create the AS PATH part
    var div0 = d3.select(element[0])
      .append("div");

    var text0 = div0
      .append("text")
      .text("As path")
      .style("text-anchor", "middle")
      .attr("x",10);

    var svg0 = div0
      .append("svg")
      .attr("width", w)
      .attr("height", h);

    svg0.selectAll("rect")
      .data(datasetAs)
      .enter()
      .append("rect")
      .attr("x", function(d, i) {
        //console.log(i);
        return (i%24) * 23 + 10;	//Bar width of 20 plus 1 for padding
      })
      .attr("width", 20)
      .attr("y", 0)
      .attr("height", 20)
      .attr("style","fill:#CCFFFF")
      .on("click",function(){
        d3.select(this)
          .attr("style","fill:green");
      })
      .on("mouseover",function(d,i){
        d3.select(this)
          .attr("style","fill:blue");
      })
      .on("mouseout",function(d,i){
        d3.select(this)
          .transition()
          .duration(500)
          .attr("style","fill:#CCFFFF");
      });

//create the Communities part
    var div1 = d3.select(element[0])
      .append("div");

    var text1 = div1
      .append("text")
      .text("Communities")
      .style("text-anchor", "middle")
      .attr("x",10);

    var svg1 = div1
      .append("svg")
      .attr("width", w)
      .attr("height", h);

    svg1.selectAll("rect")
      .data(datasetAs)
      .enter()
      .append("rect")
      .attr("x", function(d, i) {
        //console.log(i);
        return (i%24) * 23 + 10;	//Bar width of 20 plus 1 for padding
      })
      .attr("width", 20)
      .attr("y", 0)
      .attr("height", 20)
      .attr("style","fill:rgb(166,217,106)");

//create the last modified time

    var div2 = d3.select(element[0])
      .append("div");

    var text2 = div2
      .append("text")
      .text("Last Modified")
      .style("text-anchor", "middle")
      .attr("x",10);

    var svg2 = div2
      .append("svg")
      .attr("width", w)
      .attr("height", h);

    svg2.selectAll("rect")
      .data(datasetAs)
      .enter()
      .append("rect")
      .attr("x", function(d, i) {
        //console.log(i);
        return (i%24) * 23 + 10;	//Bar width of 20 plus 1 for padding
      })
      .attr("width", 20)
      .attr("y", 0)
      .attr("height", 20)
      .attr("style","fill:#FADF56")
      .on("click",function(d,i){
        $scope.hideGrid = false;
        console.log($scope.hideGrid);
        //$scope.selectChange();

        d3.select(this)
          .attr("style","fill:green");

        var iString = i.toString();

        if(2 == iString.length)
        {
          $scope.getPrefixHisDataHour(iString);  //chose which hour data should be shown
          //$scope.selectChange();
          console.log('length:'+iString+' '+iString.length);
          console.log(iString);
        }
        else if(1 == iString.length)
        {
          $scope.getPrefixHisDataHour('0'+iString);
          debugger
          //$scope.selectChange();
          console.log('length:'+iString+' '+iString.length);
          console.log('0'+iString);
        }
      })
      .on("mouseover",function(d,i){
        d3.select(this)
          .attr("style","fill:blue");
      })
      .on("mouseout",function(d,i){
        d3.select(this)
          .transition()
          .duration(500)
          .attr("style","fill:#FADF56");
      });
//create the last modified time

    var div3 = d3.select(element[0])
      .append("div");

    var text3 = div3
      .append("text")
      .text("Next Hop")
      .style("text-anchor", "middle")
      .attr("x",10);

    var svg3 = div3
      .append("svg")
      .attr("width", w)
      .attr("height", h);

    svg3.selectAll("rect")
      .data(datasetAs)
      .enter()
      .append("rect")
      .attr("x", function(d, i) {
        //console.log(i);
        return (i%24) * 23 + 10;	//Bar width of 20 plus 1 for padding
      })
      .attr("width", 20)
      .attr("y", 0)
      .attr("height", 20)
      .attr("style","fill:#FE2E64");

  }
  return {
    link: link,
    restrict: 'E'
  };
});
