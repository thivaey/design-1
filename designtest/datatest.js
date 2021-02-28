
//window.addEventListener("load", timeslider)
window.addEventListener("load", swarm);


const width = 850;
const height = 850;


//have function take in a date and change accrodingly 
function swarm() {
    var svg = d3
    .select("body")
    .append("svg")
    .attr("height", height)
    .attr("width", width);

    d3.csv("datatest.csv").then((data) => {
    
    let colleges = Array.from(new Set(data.map((d) => d.College)));
    let xCoords = colleges.map((d, i) => 100 + i * 40);
    let xScale = d3.scaleOrdinal().domain(colleges).range(xCoords);

    //Y AXIS
    var scale = d3.scaleLinear()
        .domain([-1.0, 1.0])
        .range([height/2, 0]);

    var y_axis = d3.axisLeft()
        .scale(scale);

    svg.append("g")
       .attr("transform", "translate(50, 10)")
       .call(y_axis);
    ///

    //X AXIS
    //var xscale = d3.scaleLinear()
        //.domain([0, d3.max(data)])
        //.range([0, width - 300]);
    const xcolleges = ["A", "A", "B", "B", "C", "C", "D", "D", "E", "E"];
    const xforcollleges = d3.scaleBand()
        .domain(xcolleges)
        .range([0, svg.attr("width")]) // TODO
        .padding(0.5);
    
    var xAxisTranslate = height/2 + 10;
    const xAxis = svg.append("g")
        .call(d3.axisBottom(xforcollleges)) // d3 creates a bunch of elements inside the <g>
        .attr("transform", "translate(50, " + xAxisTranslate  +")")
        .call(xforcollleges)






    
    var yScale = d3
        .scaleLinear()
        .domain(d3.extent(data.map((d) => +d["Sentiment"])))
        .range([height - 500, 25]);

    var color = d3.scaleOrdinal().domain(colleges).range(d3.schemePaired);

    var UpVotesDomain = d3.extent(data.map((d) => d["UpVotes"]));
    UpVotesDomain = UpVotesDomain.map((d) => Math.sqrt(d));
    var size = d3.scaleLinear().domain(UpVotesDomain).range([5, 10]);

    

    svg
        .selectAll(".circ")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "circ")
        .attr("stroke", "black")
        .attr("fill", (d) => color(d.College))
        .attr("r", (d) => size(Math.sqrt(d["UpVotes"])))
        .attr("cx", (d) => xScale(d.College))
        .attr("cy", (d) => yScale(d.Sentiment));

    let simulation = d3
        .forceSimulation(data)
        .force(
        "x",
        d3
            .forceX((d) => {
            return xScale(d.College);
            })
            .strength(0.2)
        )
        .force(
        "y",
        d3
            .forceY(function (d) {
            return yScale(d.Sentiment);
            })
            .strength(1)
        )
        .force(
        "collide",
        d3.forceCollide((d) => {
            return size(Math.sqrt(d["UpVotes"]));
        })
        )
        .alphaDecay(0)
        .alpha(0.3)
        .on("tick", tick);

    function tick() {
        d3.selectAll(".circ")
        .attr("cx", (d) => {
            return d.x;
        })
        .attr("cy", (d) => d.y);
    }

    let init_decay = setTimeout(function () {
        console.log("start alpha decay");
        simulation.alphaDecay(0.1);
    }, 3000);


    });

}


function timeslider() {
    //pass time in here and change data accordingly



}