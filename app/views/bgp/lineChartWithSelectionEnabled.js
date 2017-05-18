
/* Utility class to handle creation of an interactive layer.
 This places a rectangle on top of the chart. When you mouse move over it, it sends a dispatch
 containing the X-coordinate. It can also render a vertical line where the mouse is located.

 dispatch.elementMousemove is the important event to latch onto.  It is fired whenever the mouse moves over
 the rectangle. The dispatch is given one object which contains the mouseX/Y location.
 It also has 'pointXValue', which is the conversion of mouseX to the x-axis scale.
 */
nv.myinteractiveGuideline = function() {
  "use strict";

  var margin = { left: 0, top: 0 } //Pass the chart's top and left magins. Used to calculate the mouseX/Y.
    ,   width = null
    ,   height = null
    ,   xScale = d3.scale.linear()
    ,   dispatch = d3.dispatch('elementMousemove', 'elementMouseout', 'elementClick', 'elementDblclick', 'elementMouseDown', 'elementMouseUp')
    ,   showGuideLine = true
    ,   showSelectionLine = false
    ,   svgContainer = null // Must pass the chart's svg, we'll use its mousemove event.
    ,   tooltip = nv.models.tooltip()
    ,   isMSIE =  window.ActiveXObject// Check if IE by looking for activeX. (excludes IE11)
    ;

  tooltip
    .duration(0)
    .hideDelay(0)
    .hidden(false);

  function layer(selection) {
    selection.each(function(data) {
      var container = d3.select(this);
      var availableWidth = (width || 960), availableHeight = (height || 400);
      var wrap = container.selectAll("g.nv-wrap.nv-interactiveLineLayer")
        .data([data]);
      var wrapEnter = wrap.enter()
        .append("g").attr("class", " nv-wrap nv-interactiveLineLayer");
      wrapEnter.append("g").attr("class","nv-interactiveGuideLine");
      wrapEnter.append("g").attr("class","nv-interactiveSelectionLine");

      if (!svgContainer) {
        return;
      }

      function mouseHandler() {
        var d3mouse = d3.mouse(this);
        var mouseX = d3mouse[0];
        var mouseY = d3mouse[1];
        var subtractMargin = true;
        var mouseOutAnyReason = false;
        if (isMSIE) {
          /*
           D3.js (or maybe SVG.getScreenCTM) has a nasty bug in Internet Explorer 10.
           d3.mouse() returns incorrect X,Y mouse coordinates when mouse moving
           over a rect in IE 10.
           However, d3.event.offsetX/Y also returns the mouse coordinates
           relative to the triggering <rect>. So we use offsetX/Y on IE.
           */
          mouseX = d3.event.offsetX;
          mouseY = d3.event.offsetY;

          /*
           On IE, if you attach a mouse event listener to the <svg> container,
           it will actually trigger it for all the child elements (like <path>, <circle>, etc).
           When this happens on IE, the offsetX/Y is set to where ever the child element
           is located.
           As a result, we do NOT need to subtract margins to figure out the mouse X/Y
           position under this scenario. Removing the line below *will* cause
           the interactive layer to not work right on IE.
           */
          if(d3.event.target.tagName !== "svg") {
            subtractMargin = false;
          }

          if (d3.event.target.className.baseVal.match("nv-legend")) {
            mouseOutAnyReason = true;
          }

        }

        if(subtractMargin) {
          mouseX -= margin.left;
          mouseY -= margin.top;
        }

        /* If mouseX/Y is outside of the chart's bounds,
         trigger a mouseOut event.
         */
        if (d3.event.type === 'mouseout'
          || mouseX < 0 || mouseY < 0
          || mouseX > availableWidth || mouseY > availableHeight
          || (d3.event.relatedTarget && d3.event.relatedTarget.ownerSVGElement === undefined)
          || mouseOutAnyReason
          ) {

          if (isMSIE) {
            if (d3.event.relatedTarget
              && d3.event.relatedTarget.ownerSVGElement === undefined
              && (d3.event.relatedTarget.className === undefined
              || d3.event.relatedTarget.className.match(tooltip.nvPointerEventsClass))) {

              return;
            }
          }
          dispatch.elementMouseout({
            mouseX: mouseX,
            mouseY: mouseY
          });
          layer.renderGuideLine(null); //hide the guideline
          tooltip.hidden(true);
          return;
        } else {
          tooltip.hidden(false);
        }


        var scaleIsOrdinal = typeof xScale.rangeBands === 'function';
        var pointXValue = undefined;

        // Ordinal scale has no invert method
        if (scaleIsOrdinal) {
          var elementIndex = d3.bisect(xScale.range(), mouseX) - 1;
          // Check if mouseX is in the range band
          if (xScale.range()[elementIndex] + xScale.rangeBand() >= mouseX) {
            pointXValue = xScale.domain()[d3.bisect(xScale.range(), mouseX) - 1];
          }
          else {
            dispatch.elementMouseout({
              mouseX: mouseX,
              mouseY: mouseY
            });
            layer.renderGuideLine(null); //hide the guideline
            tooltip.hidden(true);
            return;
          }
        }
        else {
          pointXValue = xScale.invert(mouseX);
        }

        dispatch.elementMousemove({
          mouseX: mouseX,
          mouseY: mouseY,
          pointXValue: pointXValue
        });

        //If user double clicks the layer, fire a elementDblclick
        if (d3.event.type === "dblclick") {
          dispatch.elementDblclick({
            mouseX: mouseX,
            mouseY: mouseY,
            pointXValue: pointXValue
          });
        }

        // if user single clicks the layer, fire elementClick
        if (d3.event.type === 'click') {
          dispatch.elementClick({
            mouseX: mouseX,
            mouseY: mouseY,
            pointXValue: pointXValue
          });
        }

        // if user presses mouse down the layer, fire elementMouseDown
        if (d3.event.type === 'mousedown') {
          dispatch.elementMouseDown({
            mouseX: mouseX,
            mouseY: mouseY,
            pointXValue: pointXValue
          });
        }

        // if user presses mouse down the layer, fire elementMouseUp
        if (d3.event.type === 'mouseup') {
          dispatch.elementMouseUp({
            mouseX: mouseX,
            mouseY: mouseY,
            pointXValue: pointXValue
          });
        }
      }

      svgContainer
        .on("touchmove",mouseHandler)
        .on("mousemove",mouseHandler, true)
        .on("mouseout" ,mouseHandler,true)
        .on("mousedown" ,mouseHandler,true)
        .on("mouseup" ,mouseHandler,true)
        .on("dblclick" ,mouseHandler)
        .on("click", mouseHandler)
      ;

      layer.guideLine = null;
      //Draws a vertical guideline at the given X position.
      layer.renderGuideLine = function(x) {
        if (!showGuideLine) return;
        if (layer.guideLine && layer.guideLine.attr("x1") === x) return;
        nv.dom.write(function() {
          var line = wrap.select(".nv-interactiveGuideLine")
            .selectAll("line")
            .data((x != null) ? [nv.utils.NaNtoZero(x)] : [], String);
          line.enter()
            .append("line")
            .attr("class", "nv-guideline")
            .attr("x1", function(d) { return d;})
            .attr("x2", function(d) { return d;})
            .attr("y1", availableHeight)
            .attr("y2",0);
          line.exit().remove();
        });
      }

      layer.selectionLine = null;
      //Draws a vertical selection line at the given X position.
      layer.renderSelectionLine = function(x) {
        if (!showSelectionLine) return;
        if (layer.selectionLine && layer.selectionLine.attr("x1") === x) return;
        nv.dom.write(function() {
          var line = wrap.select(".nv-interactiveSelectionLine")
            .selectAll("line")
            .data((x != null) ? [nv.utils.NaNtoZero(x)] : [], String);
          line.enter()
            .append("line")
            .attr("class", "nv-selectionline")
            .attr("x1", function(d) { return d;})
            .attr("x2", function(d) { return d;})
            .attr("y1", availableHeight)
            .attr("y2",0);
          line.exit().remove();
        });
      }
    });
  }

  layer.dispatch = dispatch;
  layer.tooltip = tooltip;

  layer.margin = function(_) {
    if (!arguments.length) return margin;
    margin.top    = typeof _.top    != 'undefined' ? _.top    : margin.top;
    margin.left   = typeof _.left   != 'undefined' ? _.left   : margin.left;
    return layer;
  };

  layer.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return layer;
  };

  layer.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return layer;
  };

  layer.xScale = function(_) {
    if (!arguments.length) return xScale;
    xScale = _;
    return layer;
  };

  layer.showGuideLine = function(_) {
    if (!arguments.length) return showGuideLine;
    showGuideLine = _;
    return layer;
  };

  layer.svgContainer = function(_) {
    if (!arguments.length) return svgContainer;
    svgContainer = _;
    return layer;
  };

  return layer;
};

nv.models.lineChartWithSelectionEnabled = function() {
  "use strict";

  //============================================================
  // Public Variables with Default Settings
  //------------------------------------------------------------

  var lines = nv.models.line()
    , xAxis = nv.models.axis()
    , yAxis = nv.models.axis()
    , legend = nv.models.legend()
    , interactiveLayer = nv.myinteractiveGuideline()
    , tooltip = nv.models.tooltip()
    , focus = nv.models.focus(nv.models.line())
    ;

  var margin = {top: 30, right: 20, bottom: 50, left: 60}
    , marginTop = null
    , color = nv.utils.defaultColor()
    , width = null
    , height = null
    , showLegend = true
    , legendPosition = 'top'
    , showXAxis = true
    , showYAxis = true
    , rightAlignYAxis = false
    , useInteractiveGuideline = false
    , x
    , y
    , focusEnable = false
    , state = nv.utils.state()
    , defaultState = null
    , noData = null
    , dispatch = d3.dispatch('tooltipShow', 'tooltipHide', 'stateChange', 'changeState', 'renderEnd')
    , duration = 250
    , onTimeSelectedCallback = undefined
    ;

  // set options on sub-objects for this chart
  xAxis.orient('bottom').tickPadding(7);
  yAxis.orient(rightAlignYAxis ? 'right' : 'left');

  lines.clipEdge(true).duration(0);

  tooltip.valueFormatter(function(d, i) {
    return yAxis.tickFormat()(d, i);
  }).headerFormatter(function(d, i) {
      return xAxis.tickFormat()(d, i);
    });

  interactiveLayer.tooltip.valueFormatter(function(d, i) {
    return yAxis.tickFormat()(d, i);
  }).headerFormatter(function(d, i) {
      return xAxis.tickFormat()(d, i);
    });


  //============================================================
  // Private Variables
  //------------------------------------------------------------

  var renderWatch = nv.utils.renderWatch(dispatch, duration);

  var stateGetter = function(data) {
    return function(){
      return {
        active: data.map(function(d) { return !d.disabled; })
      };
    };
  };

  var stateSetter = function(data) {
    return function(state) {
      if (state.active !== undefined)
        data.forEach(function(series,i) {
          series.disabled = !state.active[i];
        });
    };
  };

  var latestTimestampInitialised = false;
  function chart(selection) {
    renderWatch.reset();
    renderWatch.models(lines);
    if (showXAxis) renderWatch.models(xAxis);
    if (showYAxis) renderWatch.models(yAxis);

    selection.each(function(data) {
      var container = d3.select(this);
      nv.utils.initSVG(container);
      var availableWidth = nv.utils.availableWidth(width, container, margin),
        availableHeight = nv.utils.availableHeight(height, container, margin) - (focusEnable ? focus.height() : 0);
      chart.update = function() {
        if (duration === 0) {
          container.call( chart );
        } else {
          container.transition().duration(duration).call(chart);
        }
      };
      chart.container = this;

      state
        .setter(stateSetter(data), chart.update)
        .getter(stateGetter(data))
        .update();

      // DEPRECATED set state.disabled
      state.disabled = data.map(function(d) { return !!d.disabled; });

      if (!defaultState) {
        var key;
        defaultState = {};
        for (key in state) {
          if (state[key] instanceof Array)
            defaultState[key] = state[key].slice(0);
          else
            defaultState[key] = state[key];
        }
      }

      // Display noData message if there's nothing to show.
      if (!data || !data.length || !data.filter(function(d) { return d.values.length; }).length) {
        nv.utils.noData(chart, container);
        return chart;
      } else {
        container.selectAll('.nv-noData').remove();
      }

    /* Update `main' graph on brush update. */
      focus.dispatch.on("onBrush", function(extent) {
        onBrush(extent);
      });

      // Setup Scales
      x = lines.xScale();
      y = lines.yScale();

      // Setup containers and skeleton of chart
      var wrap = container.selectAll('g.nv-wrap.nv-lineChart').data([data]);
      var gEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-lineChart').append('g');
      var g = wrap.select('g');

      gEnter.append('g').attr('class', 'nv-legendWrap');

      var focusEnter = gEnter.append('g').attr('class', 'nv-focus');
      focusEnter.append('g').attr('class', 'nv-background').append('rect');
      focusEnter.append('g').attr('class', 'nv-x nv-axis');
      focusEnter.append('g').attr('class', 'nv-y nv-axis');
      focusEnter.append('g').attr('class', 'nv-linesWrap');
      focusEnter.append('g').attr('class', 'nv-interactive');

      var contextEnter = gEnter.append('g').attr('class', 'nv-focusWrap');

      // Legend
      if (!showLegend) {
        g.select('.nv-legendWrap').selectAll('*').remove();
      } else {
        legend.width(availableWidth);

        g.select('.nv-legendWrap')
          .datum(data)
          .call(legend);

        if (legendPosition === 'bottom') {
          wrap.select('.nv-legendWrap')
            .attr('transform', 'translate(0,' + availableHeight +')');
        } else if (legendPosition === 'top') {
          if (!marginTop && legend.height() !== margin.top) {
            margin.top = legend.height();
            availableHeight = nv.utils.availableHeight(height, container, margin) - (focusEnable ? focus.height() : 0);
          }

          wrap.select('.nv-legendWrap')
            .attr('transform', 'translate(0,' + (-margin.top) +')');
        }
      }

      wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      if (rightAlignYAxis) {
        g.select(".nv-y.nv-axis")
          .attr("transform", "translate(" + availableWidth + ",0)");
      }

      //Set up interactive layer
      if (useInteractiveGuideline) {
        interactiveLayer
          .width(availableWidth)
          .height(availableHeight)
          .margin({left:margin.left, top:margin.top})
          .svgContainer(container)
          .xScale(x);
        wrap.select(".nv-interactive").call(interactiveLayer);
      }

      g.select('.nv-focus .nv-background rect')
        .attr('width', availableWidth)
        .attr('height', availableHeight);

      lines
        .width(availableWidth)
        .height(availableHeight)
        .color(data.map(function(d,i) {
          return d.color || color(d, i);
        }).filter(function(d,i) { return !data[i].disabled; }));

      var linesWrap = g.select('.nv-linesWrap')
        .datum(data.filter(function(d) { return !d.disabled; }));


      // Setup Main (Focus) Axes
      if (showXAxis) {
        xAxis
          .scale(x)
          ._ticks(nv.utils.calcTicksX(availableWidth/100, data) )
          .tickSize(-availableHeight, 0);
      }

      if (showYAxis) {
        yAxis
          .scale(y)
          ._ticks( nv.utils.calcTicksY(availableHeight/36, data) )
          .tickSize( -availableWidth, 0);
      }

      //============================================================
      // Update Axes
      //============================================================
      function updateXAxis() {
        if(showXAxis) {
          g.select('.nv-focus .nv-x.nv-axis')
            .transition()
            .duration(duration)
            .call(xAxis)
          ;
        }
      }

      function updateYAxis() {
        if(showYAxis) {
          g.select('.nv-focus .nv-y.nv-axis')
            .transition()
            .duration(duration)
            .call(yAxis)
          ;
        }
      }

      g.select('.nv-focus .nv-x.nv-axis')
        .attr('transform', 'translate(0,' + availableHeight + ')');

      //============================================================
      // Update Focus
      //============================================================
      if(!focusEnable) {
        linesWrap.call(lines);
        updateXAxis();
        updateYAxis();
      } else {
        focus.width(availableWidth);
        g.select('.nv-focusWrap')
          .attr('transform', 'translate(0,' + ( availableHeight + margin.bottom + focus.margin().top) + ')')
          .datum(data.filter(function(d) { return !d.disabled; }))
          .call(focus);
        var extent = focus.brush.empty() ? focus.xDomain() : focus.brush.extent();
        if(extent !== null){
          onBrush(extent);
        }
      }
      //============================================================
      // Event Handling/Dispatching (in chart's scope)
      //------------------------------------------------------------

      legend.dispatch.on('stateChange', function(newState) {
        for (var key in newState)
          state[key] = newState[key];
        dispatch.stateChange(state);
        chart.update();
      });

      interactiveLayer.dispatch.on('elementMousemove', function(e) {
        lines.clearHighlights();
        var singlePoint, pointIndex, pointXLocation, allData = [];
        data
          .filter(function(series, i) {
            series.seriesIndex = i;
            return !series.disabled && !series.disableTooltip;
          })
          .forEach(function(series,i) {
            var extent = focusEnable ? (focus.brush.empty() ? focus.xScale().domain() : focus.brush.extent()) : x.domain();
            var currentValues = series.values.filter(function(d,i) {
              // Checks if the x point is between the extents, handling case where extent[0] is greater than extent[1]
              // (e.g. x domain is manually set to reverse the x-axis)
              if(extent[0] <= extent[1]) {
                return lines.x()(d,i) >= extent[0] && lines.x()(d,i) <= extent[1];
              } else {
                return lines.x()(d,i) >= extent[1] && lines.x()(d,i) <= extent[0];
              }
            });

            pointIndex = nv.interactiveBisect(currentValues, e.pointXValue, lines.x());
            var point = currentValues[pointIndex];
            var pointYValue = chart.y()(point, pointIndex);
            if (pointYValue !== null) {
              lines.highlightPoint(i, pointIndex, true);
            }
            if (point === undefined) return;
            if (singlePoint === undefined) singlePoint = point;
            if (pointXLocation === undefined) pointXLocation = chart.xScale()(chart.x()(point,pointIndex));
            allData.push({
              key: series.key,
              value: pointYValue,
              color: color(series,series.seriesIndex),
              data: point
            });
          });

        //Highlight the tooltip entry based on which point the mouse is closest to.
        if (allData.length > 2) {
          var yValue = chart.yScale().invert(e.mouseY);
          var domainExtent = Math.abs(chart.yScale().domain()[0] - chart.yScale().domain()[1]);
          var threshold = 0.03 * domainExtent;
          var indexToHighlight = nv.nearestValueIndex(allData.map(function(d){return d.value;}),yValue,threshold);
          if (indexToHighlight !== null) {
            allData[indexToHighlight].highlight = true;
          }
        }

        var defaultValueFormatter = function(d,i) {
          return d == null ? "N/A" : yAxis.tickFormat()(d);
        };

        interactiveLayer.tooltip
          .valueFormatter(interactiveLayer.tooltip.valueFormatter() || defaultValueFormatter)
          .data({
            value: chart.x()( singlePoint,pointIndex ),
            index: pointIndex,
            series: allData
          })();

        interactiveLayer.renderGuideLine(pointXLocation);
      });

      interactiveLayer.dispatch.on('elementClick', function(e) {
        var pointXLocation, allData = [];

//        console.log("lineChart interactiveLayer click", e);

        var selectedTimestamp;
        data.filter(function(series, i) {
          series.seriesIndex = i;
          return !series.disabled;
        }).forEach(function(series) {
            var pointIndex = nv.interactiveBisect(series.values, e.pointXValue, chart.x());
            var point = series.values[pointIndex];
            if (typeof point === 'undefined') return;
            if (typeof pointXLocation === 'undefined') pointXLocation = chart.xScale()(chart.x()(point,pointIndex));
            selectedTimestamp = point[0];
            var yPos = chart.yScale()(chart.y()(point,pointIndex));
            allData.push({
              point: point,
              pointIndex: pointIndex,
              pos: [pointXLocation, yPos],
              seriesIndex: series.seriesIndex,
              series: series
            });
          });

        // draw line at selected location
        interactiveLayer.renderSelectionLine(pointXLocation);
        if (onTimeSelectedCallback !== undefined) {
          onTimeSelectedCallback(selectedTimestamp);
        }

        lines.dispatch.elementClick(allData);
      });

      interactiveLayer.dispatch.on("elementMouseout",function(e) {
        lines.clearHighlights();
      });

      dispatch.on('changeState', function(e) {
        if (typeof e.disabled !== 'undefined' && data.length === e.disabled.length) {
          data.forEach(function(series,i) {
            series.disabled = e.disabled[i];
          });

          state.disabled = e.disabled;
        }
        chart.update();
      });

      //============================================================
      // Functions
      //------------------------------------------------------------

      // Taken from crossfilter (http://square.github.com/crossfilter/)
      function resizePath(d) {
        var e = +(d == 'e'),
          x = e ? 1 : -1,
          y = availableHeight / 3;
        return 'M' + (0.5 * x) + ',' + y
          + 'A6,6 0 0 ' + e + ' ' + (6.5 * x) + ',' + (y + 6)
          + 'V' + (2 * y - 6)
          + 'A6,6 0 0 ' + e + ' ' + (0.5 * x) + ',' + (2 * y)
          + 'Z'
          + 'M' + (2.5 * x) + ',' + (y + 8)
          + 'V' + (2 * y - 8)
          + 'M' + (4.5 * x) + ',' + (y + 8)
          + 'V' + (2 * y - 8);
      }

      function onBrush(extent) {
        // Update Main (Focus)
        var focusLinesWrap = g.select('.nv-focus .nv-linesWrap')
          .datum(
            data.filter(function(d) { return !d.disabled; })
              .map(function(d,i) {
                return {
                  key: d.key,
                  area: d.area,
                  classed: d.classed,
                  values: d.values.filter(function(d,i) {
                    return lines.x()(d,i) >= extent[0] && lines.x()(d,i) <= extent[1];
                  }),
                  disableTooltip: d.disableTooltip
                };
              })
          );
        focusLinesWrap.transition().duration(duration).call(lines);

        // Update Main (Focus) Axes
        updateXAxis();
        updateYAxis();
      }
    });

    if (!latestTimestampInitialised && interactiveLayer.renderSelectionLine !== undefined) {
      latestTimestampInitialised = true;

      var latestTimestamp = chart.xScale().domain()[1];
      var latestTimestampSelectionXCoord = chart.xScale()(latestTimestamp);

      // draw line at selected location
      interactiveLayer.renderSelectionLine(latestTimestampSelectionXCoord);
      if (onTimeSelectedCallback !== undefined) {
        onTimeSelectedCallback(latestTimestamp);
      }
    }

    renderWatch.renderEnd('lineChart immediate');
    return chart;
  }


  //============================================================
  // Event Handling/Dispatching (out of chart's scope)
  //------------------------------------------------------------

  lines.dispatch.on('elementMouseover.tooltip', function(evt) {
    if(!evt.series.disableTooltip){
      tooltip.data(evt).hidden(false);
    }
  });

  lines.dispatch.on('elementMouseout.tooltip', function(evt) {
    tooltip.hidden(true);
  });

  //============================================================
  // Expose Public Variables
  //------------------------------------------------------------

  // expose chart's sub-components
  chart.dispatch = dispatch;
  chart.lines = lines;
  chart.legend = legend;
  chart.focus = focus;
  chart.xAxis = xAxis;
  chart.x2Axis = focus.xAxis
  chart.yAxis = yAxis;
  chart.y2Axis = focus.yAxis
  chart.interactiveLayer = interactiveLayer;
  chart.tooltip = tooltip;
  chart.state = state;
  chart.dispatch = dispatch;
  chart.options = nv.utils.optionsFunc.bind(chart);

  chart._options = Object.create({}, {
    // simple options, just get/set the necessary values
    width:      {get: function(){return width;}, set: function(_){width=_;}},
    height:     {get: function(){return height;}, set: function(_){height=_;}},
    showLegend: {get: function(){return showLegend;}, set: function(_){showLegend=_;}},
    legendPosition: {get: function(){return legendPosition;}, set: function(_){legendPosition=_;}},
    showXAxis:      {get: function(){return showXAxis;}, set: function(_){showXAxis=_;}},
    showYAxis:    {get: function(){return showYAxis;}, set: function(_){showYAxis=_;}},
    defaultState:    {get: function(){return defaultState;}, set: function(_){defaultState=_;}},
    noData:    {get: function(){return noData;}, set: function(_){noData=_;}},
    // Focus options, mostly passed onto focus model.
    focusEnable:    {get: function(){return focusEnable;}, set: function(_){focusEnable=_;}},
    focusHeight:     {get: function(){return focus.height();}, set: function(_){focus.height(_);}},
    focusShowAxisX:    {get: function(){return focus.showXAxis();}, set: function(_){focus.showXAxis(_);}},
    focusShowAxisY:    {get: function(){return focus.showYAxis();}, set: function(_){focus.showYAxis(_);}},
    brushExtent: {get: function(){return focus.brushExtent();}, set: function(_){focus.brushExtent(_);}},

    // options that require extra logic in the setter
    focusMargin: {get: function(){return focus.margin}, set: function(_){
      if (_.top !== undefined) {
        margin.top = _.top;
        marginTop = _.top;
      }
      focus.margin.right  = _.right  !== undefined ? _.right  : focus.margin.right;
      focus.margin.bottom = _.bottom !== undefined ? _.bottom : focus.margin.bottom;
      focus.margin.left   = _.left   !== undefined ? _.left   : focus.margin.left;
    }},
    margin: {get: function(){return margin;}, set: function(_){
      margin.top    = _.top    !== undefined ? _.top    : margin.top;
      margin.right  = _.right  !== undefined ? _.right  : margin.right;
      margin.bottom = _.bottom !== undefined ? _.bottom : margin.bottom;
      margin.left   = _.left   !== undefined ? _.left   : margin.left;
    }},
    duration: {get: function(){return duration;}, set: function(_){
      duration = _;
      renderWatch.reset(duration);
      lines.duration(duration);
      focus.duration(duration);
      xAxis.duration(duration);
      yAxis.duration(duration);
    }},
    color:  {get: function(){return color;}, set: function(_){
      color = nv.utils.getColor(_);
      legend.color(color);
      lines.color(color);
      focus.color(color);
    }},
    interpolate: {get: function(){return lines.interpolate();}, set: function(_){
      lines.interpolate(_);
      focus.interpolate(_);
    }},
    xTickFormat: {get: function(){return xAxis.tickFormat();}, set: function(_){
      xAxis.tickFormat(_);
      focus.xTickFormat(_);
    }},
    yTickFormat: {get: function(){return yAxis.tickFormat();}, set: function(_){
      yAxis.tickFormat(_);
      focus.yTickFormat(_);
    }},
    x: {get: function(){return lines.x();}, set: function(_){
      lines.x(_);
      focus.x(_);
    }},
    y: {get: function(){return lines.y();}, set: function(_){
      lines.y(_);
      focus.y(_);
    }},
    rightAlignYAxis: {get: function(){return rightAlignYAxis;}, set: function(_){
      rightAlignYAxis = _;
      yAxis.orient( rightAlignYAxis ? 'right' : 'left');
    }},
    useInteractiveGuideline: {get: function(){return useInteractiveGuideline;}, set: function(_){
      useInteractiveGuideline = _;
      if (useInteractiveGuideline) {
        lines.interactive(false);
        lines.useVoronoi(false);
      }
    }},
    onTimeSelectedCallback: {get: function() { return onTimeSelectedCallback;}, set: function(_) { onTimeSelectedCallback = _; }}
  });

  nv.utils.inheritOptions(chart, lines);
  nv.utils.initOptions(chart);

  return chart;
};