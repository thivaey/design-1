"use strict";

window.addEventListener("load", drawTest());

function drawTest() {

    var svg = d3.select('svg#test')
    var test = svg.append('text')
        .attr("font-size", 36)
        .attr("font-weight", "bold")
        .attr("font-family", "sans-serif")
        .attr("x", 250)
        .attr("y", 250)
        .style("text-anchor", "middle")
        .text("TEST");

    /* Draw component */

    var eventHandler = document.getElementById('eventHandler')
    eventHandler.addEventListener('change', function(e) {
        var vals = e.data;
        test.text(vals[0] + ', ' + vals[1]);
        /* Call update on drawn elements using new slider values */
        update(vals) 
    })

}

function update(sliderVals) {

}