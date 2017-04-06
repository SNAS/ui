nv.models.customForceDirectedGraph = function() {
  "use strict";

  //============================================================
  // Public Variables with Default Settings
  //------------------------------------------------------------
  var margin = {top: 2, right: 0, bottom: 2, left: 0}
    , width = 400
    , height = 32
    , container = null
    , dispatch = d3.dispatch('renderEnd', 'zoomControl')
    , color = nv.utils.getColor(['#000'])
    , tooltip = nv.models.tooltip()
    , noData = null
  // Force directed graph specific parameters [default values]
    , linkStrength = 0.1
    , friction = 0.9
    , linkDist = 30
    , charge = -120
    , gravity = 0.1
    , theta = 0.8
    , alpha = 0.1
    , radius = 5
  // These functions allow to add extra attributes to nodes and links
    , nodeExtras = function(nodes) { /* Do nothing */ }
    , linkExtras = function(links) { /* Do nothing */ }
    , linkColor = "#ccc"
    , initCallback = function(svgContainer) { /* Do nothing */}
  // you can specify the list of fields you want to show when hovering a node e.g. ["name", "value"]
    , nvTooltipFields = null
    , useNVTooltip = true
    , tooltipCallback = function(hide, tooltipData) { /* Do nothing */}
    , nodeCircles = null
    , linkColorSet = []// used for the arrows' colors to match the link colors, should the user decide to use marker-end to display an arrow
    , nodeIdField = "id"
    , onLongPress = null;
    ;

  //============================================================
  // Private Variables
  //------------------------------------------------------------

  var renderWatch = nv.utils.renderWatch(dispatch);


  var nominal_base_node_size = 8;
  var max_base_node_size = 36;
  var nominal_stroke = 1.5;
  var max_stroke = 4.5;
  var min_zoom = 0.1;
  var max_zoom = 7;
  var zoom = d3.behavior.zoom().scaleExtent([min_zoom,max_zoom]);
  var svg, g;

  var size = d3.scale.pow().exponent(1)
    .domain([1,100])
    .range([8,24]);

  var highlight_color = "blue";
  var highlight_trans = 0.1;
  var focus_node = null, highlight_node = null;
  var default_node_color = "#ccc";
  var default_link_color = "#888";

  // d contains source and target, each of them containing x and y coordinates
  // this function calculates the angle (in radians) between vectors (source,target) and (source,projectionOfTargetOntoXAxis)
  function calculateAngleXAxis(d) {
    var distX = d.target.x - d.source.x;
    var distY = d.target.y - d.source.y;
    var angle = Math.atan(distY/distX);
    return isNaN(angle) ? 0 : angle;
  }

  function getPrecalculatedValue(d, parameter, forceUpdate) {
    if (undefined === d.precalculatedValues || forceUpdate) {
      d.precalculatedValues = {
        angle: calculateAngleXAxis(d),
        x1CircleRadius: d3.max(d.source.calculatedRadius, function(r) { return r.radius; }),
        x2CircleRadius: d3.max(d.target.calculatedRadius, function(r) { return r.radius; })
      };
    }
    return d.precalculatedValues[parameter];
  }

  function chart(selection) {
    renderWatch.reset();

    selection.each(function(data) {
      if (svg === undefined) {
        svg = d3.select(this);
        container = svg.append("g");
        g = container;
        svg.style("cursor","move");

        const markerDim = 15;
        const refX = 7, refY = 0;

        // adding svg defs
        var defs = svg.append("defs");
        var arrowClasses = ["arrow"];
        for (var i = 0 ; i < linkColorSet.length ; i++) {
          arrowClasses.push("arrow-" + linkColorSet[i].label);
        }
        defs.selectAll("marker")
          .data(arrowClasses)
          .enter().append("marker")
          .attr("id", function(d) { return d; })
          .attr("viewBox", "0 -5 10 10")
          .attr("refX", refX)
          .attr("refY", refY)
          .attr("markerWidth", markerDim)
          .attr("markerHeight", markerDim)
          .attr("markerUnits", "userSpaceOnUse")// userSpaceOnUse: no autoscaling of marker; strokeWidth: autoscaling
          .attr("orient", "auto")
          .append("path")
          .attr("d", "M2,0L0,-5L10,0L0,5");

        defs.select("marker#arrow")
          .style("fill", "#555");

        for (var i = 0 ; i < linkColorSet.length ; i++) {
          defs.select("marker#arrow-"+linkColorSet[i].label)
            .style("fill", linkColorSet[i].color);
        }
      }
      nv.utils.initSVG(container);

      var availableWidth = nv.utils.availableWidth(width, container, margin),
        availableHeight = nv.utils.availableHeight(height, container, margin);

      container
        .attr("width", availableWidth)
        .attr("height", availableHeight);

      // Display No Data message if there's nothing to show.
      if (!data || !data.links || !data.nodes) {
        nv.utils.noData(chart, container)
        return chart;
      } else {
        container.selectAll('.nv-noData').remove();
      }
      container.selectAll('*').remove();

      // Collect names of all fields in the nodes
      var nodeFieldSet = new Set();
      data.nodes.forEach(function(node) {
        var keys = Object.keys(node);
        keys.forEach(function(key) {
          if (nvTooltipFields === null || nvTooltipFields.indexOf(key) !== -1) {
            nodeFieldSet.add(key);
          }
        });
      });

      var linkedByIndex = {};
      data.links.forEach(function(d) {
        linkedByIndex[d.source + "," + d.target] = true;
      });

      function isConnected(a, b) {
        return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
      }

      function dragstart(d) {
        d3.select(this).classed("fixed", d.fixed = true);
      }

      function elementClick(d) {
        d3.select(this).classed("fixed", d.fixed = false);
      }

//      function hasConnections(a) {
//        for (var property in linkedByIndex) {
//          var s = property.split(",");
//          if ((s[0] == a.index || s[1] == a.index) && linkedByIndex[property]) {
//            return true;
//          }
//        }
//        return false;
//      }
//
//      function isNumber(n) {
//        return !isNaN(parseFloat(n)) && isFinite(n);
//      }

      var force = d3.layout.force()
        .nodes(data.nodes)
        .links(data.links)
        .size([availableWidth, availableHeight])
        .linkStrength(linkStrength)
        .friction(friction)
        .linkDistance(linkDist)
        .charge(charge)
        .gravity(gravity)
        .theta(theta)
        .alpha(alpha)
        .start();

      var drag = force.drag().on("dragstart", dragstart);

      var link = container.selectAll(".link")
        .data(data.links, linkId)
        .enter().append("line")
        .attr("id", linkId)
        .attr("class", "nv-force-link")
        .style("stroke-width", function(d) { return Math.sqrt(d.value); });

      function nodeId(node) {
        return "node-" + node.asn;
      }
      var node = container.selectAll(".node")
        .data(data.nodes)
        .enter()
        .append("g")
        .attr("class", "nv-force-node")
        .attr("id", nodeId)
        .on("dblclick", elementClick)
        .call(drag);

      if (nodeCircles === null) {
        nodeCircles = [
          { color: function(d) { return color(d) }, radius: radius, cssClass: "", displayNode: function(d) { return true; } }
        ];
      }

      var circles = [];
      var group = node.append("g").attr("class", "circles");
      for (var i = 0 ; i < nodeCircles.length ; i++) {
        var n = nodeCircles[i];
        // add a progress circle of the same dimension as the first circle
        if (i === 0) {
          group.append("circle")
            .attr("r", function(d) {
              var r = n.radius(d);
              if (d.calculatedRadius === undefined) {
                d.calculatedRadius = [];
              }
              d.calculatedRadius[i] = {key: n.cssClass, radius: r};
              return r;
            })
            .attr("class", "progress");
        }
        var c = group.append("circle")
//          .attr("r", n.radius)
          .attr("r", function(d) {
            var r = n.radius(d);
            if (d.calculatedRadius === undefined) {
              d.calculatedRadius = [];
            }
            d.calculatedRadius[i] = {key: n.cssClass, radius: r};
            return r;
          })
//          .style("fill", n.color)
          .attr("class", function(d) { return (n.displayNode(d) ? "" : "hidden") + " " + n.cssClass; });
        circles.push(c);
      }
      group
        .on("mouseover", function(evt) {
          container.select('.nv-series-' + evt.seriesIndex + ' .nv-distx-' + evt.pointIndex)
            .attr('y1', evt.py);
          container.select('.nv-series-' + evt.seriesIndex + ' .nv-disty-' + evt.pointIndex)
            .attr('x2', evt.px);

          // Add 'series' object to
          var nodeColor = color(evt);
          evt.series = [];
          nodeFieldSet.forEach(function(field) {
            evt.series.push({
              color: nodeColor,
              key:   field,
              value: evt[field]
            });
          });
          if (useNVTooltip) {
            tooltip.data(evt).hidden(false);
          }
          tooltipCallback(false, evt);
        })
        .on("mouseout", function(d) {
          if (useNVTooltip) {
            tooltip.hidden(true);
          }
          tooltipCallback(true);
        });


      function exit_highlight() {
        highlight_node = null;
        if (focus_node === null) {
          svg.style("cursor","move");
          if (highlight_color !== "white") {
            nodeCircles.forEach(function(n, i) {
              circles[i].style("stroke", "white");
            });
            link.style("opacity", 1);
            link.style("stroke", function(o) {
              return linkColor(o);
            });
          }
        }
      }

      function set_focus(d) {
        if (highlight_trans < 1) {
          nodeCircles.forEach(function(n, i) {
            circles[i].style("opacity", function(o) {
              return isConnected(d, o) ? 1 : highlight_trans;
            });
          });

          link.style("opacity", function(o) {
            return o.source.index == d.index || o.target.index == d.index ? 1 : highlight_trans;
          });
        }
      }

      function set_highlight(d) {
        svg.style("cursor","pointer");
        if (focus_node !== null) d = focus_node;
        highlight_node = d;

        if (highlight_color !== "white") {
//          nodeCircles.forEach(function(n, i) {
//            circles[i].style("stroke", function(o) {
//              return isConnected(d, o) ? highlight_color : "white";
//            });
//          });
          link.style("opacity", function(o) {
            return o.source.index == d.index || o.target.index == d.index ? 1 : 0.5;
          });
          link.style("stroke", function(o) {
            return o.source.index == d.index || o.target.index == d.index ? linkColor(o) : default_link_color;
          });
        }
      }

      var pressTimer;
      function resetProgressCircle(d) {
        if (onLongPress === null) return;

        clearTimeout(pressTimer);
        var progressCircle = $("#"+nodeId(d)+" > g > circle.progress");
        progressCircle.attr("class", "progress");
        progressCircle.attr("style", "stroke-dasharray: 0");
      }
      function activateProgressCircle(d) {
        if (onLongPress === null) return;

        var progressCircle = $("#"+nodeId(d)+" > g > circle.progress");
        progressCircle.attr("class", "progress active");
        progressCircle.attr("style", "stroke-dasharray: " + Math.PI * d.calculatedRadius[0].radius * 2);
        // Set timeout
        pressTimer = window.setTimeout(function() {
          progressCircle.attr("class", "progress active launch");
          /* open link, launch pop-up, etc etc */
          onLongPress(d);
        }, 2000);
      }
      node
        .on("mouseover", function(d) {
          set_highlight(d);
        })
        .on("mouseup", function(d) {
          resetProgressCircle(d);
          return false;
        })
        .on("mousedown", function(d) {
          d3.event.stopPropagation();

          activateProgressCircle(d);

          focus_node = d;
          set_focus(d);
          if (highlight_node === null) {
            set_highlight(d);
          }
        }).on("mouseout", function(d) {
          exit_highlight();
          resetProgressCircle(d);
        });

      d3.select(window).on("mouseup", function() {
        if (focus_node !== null) {
          focus_node = null;
          if (highlight_trans < 1) {
            nodeCircles.forEach(function(n, i) {
              circles[i].style("opacity", 1);
            });
            link.style("opacity", 1);
          }
        }

        if (highlight_node === null) exit_highlight();
      });

      function zoomed() {
        var stroke = nominal_stroke;
        if (nominal_stroke*zoom.scale()>max_stroke) stroke = max_stroke/zoom.scale();
        link.style("stroke-width",stroke);
        nodeCircles.forEach(function(n, i) {
          circles[i].style("stroke-width", i === 0 ? 0 : stroke);
        });

        var base_radius = nominal_base_node_size;
        if (nominal_base_node_size*zoom.scale()>max_base_node_size) base_radius = max_base_node_size/zoom.scale();
        nodeCircles.forEach(function(n, i) {
          circles[i].attr("r", function(d) {
            return (n.radius(d)*base_radius/nominal_base_node_size/*||base_radius*/);
          });
        });
//        g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        g.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
      }

      function interpolateZoom (translate, scale) {
        var self = this;
        return d3.transition().duration(350).tween("zoom", function () {
          var iTranslate = d3.interpolate(zoom.translate(), translate),
            iScale = d3.interpolate(zoom.scale(), scale);
          return function (t) {
            zoom
              .scale(iScale(t))
              .translate(iTranslate(t));
            zoomed();
          };
        });
      }
      function linkId(d) {
        return "link_" + d.source[nodeIdField] + "-" + d.target[nodeIdField];
      }

      dispatch.on("zoomControl", function(zoomDirection) {
        var direction = 1,
          factor = 0.2,
          target_zoom = 1,
          center = [width / 2, height / 2],
          extent = zoom.scaleExtent(),
          translate = zoom.translate(),
          translate0 = [],
          l = [],
          view = {x: translate[0], y: translate[1], k: zoom.scale()};

//        d3.event.preventDefault();
        direction = (zoomDirection === 'zoom_in') ? 1 : -1;
        target_zoom = zoom.scale() * (1 + factor * direction);

        if (target_zoom < extent[0] || target_zoom > extent[1]) { return false; }

        translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
        view.k = target_zoom;
        l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

        view.x += center[0] - l[0];
        view.y += center[1] - l[1];

        interpolateZoom([view.x, view.y], view.k);
      });

      zoom.on("zoom", zoomed);

      tooltip.headerFormatter(function(d) {return "Node";});

      // Apply extra attributes to nodes and links (if any)
      linkExtras(link);
      nodeExtras(node);

      var markerEndSize = 5;
      force.on("tick", function() {
        link
          .attr("tmp", function(d) { return getPrecalculatedValue(d, "angle", true); }) // temporary store values so that we don't need to recalculate them
          .attr("tmp", null) // unset the attribute
//          .attr("x1", function(d) { return d.source.x; })
//          .attr("y1", function(d) { return d.source.y; })
//          .attr("x2", function(d) { return d.target.x; })
//          .attr("y2", function(d) { return d.target.y; })
          .attr("x1", function(d) {
            var angle = getPrecalculatedValue(d, "angle");
            var r = getPrecalculatedValue(d, "x1CircleRadius");
            var inverse = d.source.x < d.target.x ? 1 : -1;
            return d.source.x + inverse * r * Math.cos(angle);
          })
          .attr("y1", function(d) {
            var angle = getPrecalculatedValue(d, "angle");
            var r = getPrecalculatedValue(d, "x1CircleRadius");
            var inverse = d.source.x < d.target.x ? 1 : -1;
            return d.source.y + inverse * r * Math.sin(angle);
          })
          .attr("x2", function(d) {
            var angle = getPrecalculatedValue(d, "angle");
            var r = getPrecalculatedValue(d, "x2CircleRadius") + markerEndSize;
            var inverse = d.source.x > d.target.x ? 1 : -1;
            return d.target.x + inverse * r * Math.cos(angle);
          })
          .attr("y2", function(d) {
            var angle = getPrecalculatedValue(d, "angle");
            var r = getPrecalculatedValue(d, "x2CircleRadius") + markerEndSize;
            var inverse = d.source.x > d.target.x ? 1 : -1;
            return d.target.y + inverse * r * Math.sin(angle);
          })

        node.attr("transform", function(d) {
          return "translate(" + d.x + ", " + d.y + ")";
        });
      });
    });

    svg.call(zoom);

    initCallback(svg);

    return chart;
  }

  //============================================================
  // Expose Public Variables
  //------------------------------------------------------------

  chart.options = nv.utils.optionsFunc.bind(chart);

  chart._options = Object.create({}, {
    // simple options, just get/set the necessary values
    width:     {get: function(){return width;}, set: function(_){width=_;}},
    height:    {get: function(){return height;}, set: function(_){height=_;}},

    // Force directed graph specific parameters
    linkStrength:{get: function(){return linkStrength;}, set: function(_){linkStrength=_;}},
    friction:    {get: function(){return friction;}, set: function(_){friction=_;}},
    linkDist:    {get: function(){return linkDist;}, set: function(_){linkDist=_;}},
    charge:      {get: function(){return charge;}, set: function(_){charge=_;}},
    gravity:     {get: function(){return gravity;}, set: function(_){gravity=_;}},
    theta:       {get: function(){return theta;}, set: function(_){theta=_;}},
    alpha:       {get: function(){return alpha;}, set: function(_){alpha=_;}},
    radius:      {get: function(){return radius;}, set: function(_){radius=_;}},

    //functor options
    x: {get: function(){return getX;}, set: function(_){getX=d3.functor(_);}},
    y: {get: function(){return getY;}, set: function(_){getY=d3.functor(_);}},

    // options that require extra logic in the setter
    margin: {get: function(){return margin;}, set: function(_){
      margin.top    = _.top    !== undefined ? _.top    : margin.top;
      margin.right  = _.right  !== undefined ? _.right  : margin.right;
      margin.bottom = _.bottom !== undefined ? _.bottom : margin.bottom;
      margin.left   = _.left   !== undefined ? _.left   : margin.left;
    }},
    color:  {get: function(){return color;}, set: function(_){
      color = nv.utils.getColor(_);
    }},
    noData:    {get: function(){return noData;}, set: function(_){noData=_;}},
    nodeExtras: {get: function(){return nodeExtras;}, set: function(_){
      nodeExtras = _;
    }},
    linkExtras: {get: function(){return linkExtras;}, set: function(_){
      linkExtras = _;
    }},
    linkColor: {get: function(){return linkColor;}, set: function(_){
      linkColor = _;
    }},
    initCallback: {get: function() { return initCallback; }, set: function(_) {
      console.log("setting initCallback");
      initCallback = _;
    }},
    nvTooltipFields: {get: function() { return nvTooltipFields; }, set: function(_) {
      nvTooltipFields = _;
    }},
    useNVTooltip: {get: function() { return useNVTooltip; }, set: function(_) {
      useNVTooltip = _;
    }},
    tooltipCallback: {get: function() { return tooltipCallback; }, set: function(_) {
      tooltipCallback = _;
    }},
    nodeCircles: { get: function() { return nodeCircles;}, set: function(_) { nodeCircles = _; }},
    linkColorSet: { get: function() { return linkColorSet;}, set: function(_) { linkColorSet = _; }},
    nodeIdField: { get: function() { return nodeIdField;}, set: function(_) { nodeIdField = _; }},
    onLongPress: { get: function() { return onLongPress;}, set: function(_) { onLongPress = _; }}
  });

  // I didn't find a better way than exposing this functionality to the window level
  // for emitting custom events from outside
  window.customForceDirectedGraph = {
    dispatch: dispatch
  };

  chart.dispatch = dispatch;
  chart.tooltip = tooltip;
  nv.utils.initOptions(chart);
  return chart;
};