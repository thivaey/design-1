

var pymChild = null;

function drawGraphic() {

  //clear the svg first
  //d3.select('svg').selectAll("*").remove()

  clicked = false;

  var svg = d3.select("svg"),
    margin = {top: 20, right: 12, bottom: 40, left: 100},

    svgwidth =  parseInt(svg.style("width"));
    heightper = dvc.essential.heightperstrip;

    heightper = heightper;
    width = svgwidth - margin.left - margin.right;

    //get unique groups
    //replace with colleges we want to use
    var groups = graphic_data.map(function(obj) { return obj.id; });
    groups = groups.filter(function(v,i) { return groups.indexOf(v) == i; });

    height = (heightper*groups.length) + margin.top + margin.bottom;

    svg.attr("height",height + "px")


  var x = d3.scaleLinear()
    .rangeRound([0, width])
    .domain([-1.0, 1.0]);


  groupeddata = {}

  separate = heightper;

  runningtotal = 0;

  for(var j = 0; j < groups.length; j++) {

  groupeddata[j] =  graphic_data.filter(function(v,i) { return v.id == groups[j]; });

  if(j>0) {
    runningtotal = runningtotal + groupeddata[j-1].length;
  }



    var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + (margin.top + (separate*j)) + ")");

    var simulation = d3.forceSimulation(groupeddata[j])
      .force("x", d3.forceX(function(d) { return x(d.value); }).strength(2))
      .force("y", d3.forceY(heightper / 2))
      .force("collide", d3.forceCollide(dvc.essential.dotradius))
      .stop();

    for (var i = 0; i < 120; ++i) simulation.tick();

    if(svgwidth < dvc.optional.mobileBreakpoint) {
      numberticks = dvc.optional.x_num_ticks_sm_md[0];
    } else {
      numberticks = dvc.optional.x_num_ticks_sm_md[1];
    }


    g.append("text").attr("class","label").text(groups[j]).attr("y",(heightper/2)+5).attr("x",-margin.left)
    var cell = g.append("g")
      .attr("class", "cells")
    .selectAll("g").data(d3.voronoi()
      .extent([[-margin.left, 0], [width + margin.right, heightper]])
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; })
      .polygons(groupeddata[j])).enter().append("g").attr("class", function(d,i){ /*console.log(d, i);*/ return i})

    cell.append("circle")
      .attr("r", dvc.essential.dotradius)
      .attr("cx", function(d) {/*console.log(d);*/ return d.data.x; })
      .attr("cy", function(d) { return d.data.y; })
      .attr("class", function(d,i) { return "cell cell" + (runningtotal + i)})
      .attr("fill",function(d){return  dvc.essential.colour_palette[groups.indexOf(d.data.id)]});

    cell.append("path")
      .attr("d", function(d) { return "M" + d.join("L") + "Z"; })
      .attr("class", function(d,i) { return "path" + (runningtotal + i)})
      .on("mouseover", function(d,i) {
        pathidstr = d3.select(this).attr("class");
        pathid = +pathidstr.substr(4);

        changetext(d.data.value, d.data.unique);
        $("#dropselect").val("id" + pathid).trigger("chosen:updated");
        d3.select(".cell" + pathid).classed("cellsselected",true)
      })

      .on("mouseout", function(d,i) {

        pathidstr = d3.select(this).attr("class");
        pathid = +pathidstr.substr(4);

        d3.select("#info").html("");
        $("#dropselect").val("").trigger("chosen:updated");
        d3.select(".cell" + pathid).classed("cellsselected",false)

        if(clicked == true) {
         changetext(d.data.value, d.data.unique)

          $("#dropselect").val("id" + pathid).trigger("chosen:updated");
          d3.select(".cell" + pathid).classed("cellsselected",true)

        }
      })


      if(j==0) {
          g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0,0)")
            .call(d3.axisTop(x).ticks(numberticks, ".0s"));
        }

        if(j==groups.length-1){
          g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + (-heightper*(groups.length-1)) + ")")
            .call(d3.axisBottom(x)
                    .ticks(numberticks, ".0s")
                    .tickSize(height-heightper)

            );

        g.selectAll(".axis--x line").style("stroke", "#ddd").attr("stroke-dasharray", "2,2");
        }
      }

      annotationCreation();

      function annotationCreation(){
          //create line breaks for annotation
          var insertLinebreaks = function () {

          var el1 = this.firstChild;
          var el = el1.data;

          var words = el.split('  ');


          d3.select(this).text('');

          xpos = d3.select(this).attr("x");


            for (var i = 0; i < words.length; i++) {
              var tspan = d3.select(this).append('tspan').text(words[i]);
              if (i > 0) {
                tspan.attr('x', xpos).attr('dy', '13');
                }
            }

            if(words.length > 1) {
                d3.select(this).attr("transform","translate(0,"+ ((words.length-1) * (-13/2)) + ")")
            }

          };

            d3.selectAll(".label").each(insertLinebreaks);

      }//end of annotationCreation
      
      selectlist(graphic_data);

      function selectlist(datacsv) {

            $('#dropselect').chosen({width: "98%", allow_single_deselect:true})

            d3.select('input.chosen-search-input').attr('id','chosensearchinput')
            d3.select('div.chosen-search').insert('label','input.chosen-search-input')
                .attr('class','visuallyhidden')
                .attr('for','chosensearchinput')
                .html("Type to select an occupation")

            
            $('#dropselect').on('change',function(evt,params){

                if($('#dropselect').val() != "") {
                //if(typeof params != 'undefined') {
                  clicked = true;
                    d3.selectAll(".cell").classed("cellsselected", false);
                    d3.selectAll(".cells path").style("pointer-events","none")

                    dropcode = $('#dropselect').val();

                    dropcodeid = +dropcode.substr(2)


                    d3.select(".cell" + dropcodeid).classed("cellsselected", true);
                    datafilter = datacsv.filter(function(d,i) {return "id" + i == dropcode})

                    changetext(datafilter[0].value,datafilter[0].unique )

                    d3.select('abbr').on('keypress',function(evt){
                      if(d3.event.keyCode==13 || d3.event.keyCode==32){
                        d3.event.preventDefault()

                        clicked = false;

                        d3.select(".cell" + dropcodeid).classed("cellsselected",false)
                        d3.selectAll(".cells path").style("pointer-events","all")

                        d3.select("#info").html("");

                        $("#dropselect").val(null).trigger('chosen:updated');
                      }
                    })
                  

                }
                else {
                  clicked = false;

                  d3.selectAll(".cell").classed("cellsselected", false);
                  d3.selectAll(".cells path").style("pointer-events","all");

                  d3.select("#info").html("");

                }
                
            });
          } //end selectlist
          
          function changetext(value,id) {

              d3.select("#info").html(value);
              occupation = $("#dropselect option:selected").text()
              d3.select("#infohidden").html(occupation + " earn " + value);
          }
          
          



  //add xaxislabel
  svg.append("g")
    .attr("transform", "translate(" + (svgwidth - (margin.left * 2.6)) + "," + (height) + ")")
    .append("text")
    .attr("id","xaxislabel")
    .attr("text-anchor", "end")
    .text("Sentiment Score");
  if (pymChild) {
    pymChild.sendHeight();
  }

}


if (Modernizr.svg) {
  //load config
  d3.json("config.json", function(error, config) {
  dvc=config
    //load chart data
    d3.csv(dvc.essential.graphic_data_url, function(error, data) {
      graphic_data = data;
      //use pym to create iframed chart dependent on specified variables
      pymChild = new pym.Child({ renderCallback: drawGraphic});
    });
  })
} else {
   //use pym to create iframe containing fallback image (which is set as default)
  pymChild = new pym.Child();
  if (pymChild) {
    pymChild.sendHeight();
  }
}


function type(d) {
  if (!d.value) return;
  d.value = +d.value;
  return d;
}