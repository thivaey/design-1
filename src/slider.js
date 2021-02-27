"use strict";

/* Slider modified from */
/* https://observablehq.com/@sarah37/snapping-range-slider-with-d3-brush */
/* Helpful reference: https://bl.ocks.org/Fil/2d43867ba1f36a05459c7113c7f6f98a */ 

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

window.addEventListener("load", slider_snap(0,12));

function slider_snap(min, max) {
    var range = [min, max]
  
    // set width and height of svg
    var w = 500
    var h = 120
    var margin = {top: 50,
                  bottom: 50,
                  left: 40,
                  right: 40}
  
    // dimensions of slider bar
    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;
  
    // create x scale
    var x = d3.scaleLinear()
        .domain(range)  // data space
        .range([0, width]);  // display space
    
    // create svg and translated g
    var svg = d3.select('svg#slider')
    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`)
    
    // draw background lines
    g.append('g').selectAll('line')
        .data(d3.range(range[0], range[1]+1))
        .enter()
        .append('line')
        .attr('x1', d => x(d)).attr('x2', d => x(d))
        .attr('y1', 0).attr('y2', height)
        .style('stroke', '#ccc')
    
    // labels
    var label = g.append('text')
        .attr("font-size", 18)
        .attr("font-weight", "bold")
        .attr("font-family", "sans-serif")
        .attr("x", width / 2)
        .attr("y", -12)
        .style("text-anchor", "middle")
        .text(MONTHS[range[0]] + ' - ' + MONTHS[range[1] - 1]);
  
    // define brush
    var brush = d3.brushX()
      .extent([[0,0], [width, height]])
    //   .on("start brush end", brushmoved)
      .on('brush', function() {
        var s = d3.event.selection;
        var r = getRange()
        var text = MONTHS[r[0]] + ' - ' + MONTHS[r[1] - 1]
        if (r[1] == r[0] + 1) {
            text = MONTHS[r[0]];
        }
        label.text(text)
        // move brush handles      
        handle.attr("display", null).attr("transform", function(d, i) { return "translate(" + [ s[i], - height / 4] + ")"; });
        // update view
        // if the view should only be updated after brushing is over, 
        // move these two lines into the on('end') part below
        svg.node().value = s.map(d => Math.round(x.invert(d)));
        // svg.node().dispatchEvent(new CustomEvent("input"));
        var eventHandler = document.getElementById("eventHandler");
        let event = new Event("change"); 
        event.data = getRange();
        eventHandler.dispatchEvent(event);
      })
      .on('end', function() {
        if (!d3.event.sourceEvent) return;
        var d0 = d3.event.selection.map(x.invert);
        var d1 = d0.map(Math.round);
        d3.select(this).transition().call(d3.event.target.move, d1.map(x));

        
      })
  
    // append brush to g
    var gBrush = g.append("g")
        .attr("class", "brush")
        .call(brush)
  
    // add brush handles (from https://bl.ocks.org/Fil/2d43867ba1f36a05459c7113c7f6f98a)
    var brushResizePath = function(d) {
        var e = +(d.type == "e"),
            x = e ? 1 : -1,
            y = height / 2;
        return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) +
          "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) +
          "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
    }
  
    var handle = gBrush.selectAll(".handle--custom")
        .data([{type: "w"}, {type: "e"}])
        .enter().append("path")
        .attr("class", "handle--custom")
        .attr("stroke", "#000")
        .attr("cursor", "ew-resize")
        .attr("d", brushResizePath);
      
    // override default behaviour - clicking outside of the selected area 
    // will select a small piece there rather than deselecting everything
    // https://bl.ocks.org/mbostock/6498000

    gBrush.selectAll(".overlay")
      .each(function(d) { d.type = "selection"; })
      .on("mousedown touchstart", brushcentered)
    
    function brushcentered() {
      var dx = x(1) - x(0), // Use a fixed width when recentering.
      cx = d3.mouse(this)[0],
      x0 = cx - dx / 2,
      x1 = cx + dx / 2;
      d3.select(this.parentNode).call(brush.move, x1 > width ? [width - dx, width] : x0 < 0 ? [0, dx] : [x0, x1]);
    }
    
    // select entire range
    gBrush.call(brush.move, range.map(x))

    function getRange() { 
        var range = d3.brushSelection(gBrush.node())
                      .map(d => Math.round(x.invert(d)));
        return range 
    };

    return svg.node()
};

