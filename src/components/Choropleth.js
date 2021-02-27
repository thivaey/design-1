import { useD3 } from '../hooks/useD3';
import React from 'react';
import * as d3 from 'd3';
import * as topojson from "topojson-client";
import covidData from '../data/us-counties.csv';
import testData from '../data/test.csv';

function Choropleth({ data }) {
//   const ref = useD3(
//     (svg) => {
        const urlEdu = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
        const urlCovid = testData;
        const urlCounty = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
        Promise.all([
            d3.csv(urlCovid),
            d3.json(urlCounty)
            ]).then( ([edu, county]) => {
        const w = 992;
        const h = 650;
        const pad = 60;
        d3.select("svg").remove();
        const svg = d3.select('#choropleth')
        .append('svg')
        .attr('width', w)
        .attr('height', h)
        .style('background-color', '#DDE8DA');
        
        const tooltip = d3.select('#choropleth')
        .append('div')
        .attr('id','tooltip')
        .style('opacity', 0);
        
        console.log(edu);
        const path = d3.geoPath();
        const bachelorHigherHighLow = d3.extent(edu.map(d=>d.cases));
        // console.log(bachelorHigherHighLow);
        const low = bachelorHigherHighLow[0];
        const high = bachelorHigherHighLow[1];
        
        const topoData = topojson.feature(county, county.objects.counties).features;
        
        const colors = d3.scaleThreshold()
        .domain(d3.range(low, high, (high-low)/9))
        .range(d3.schemeGreens[9]);
        
        svg.append('g')
        .selectAll('path')
        .data(topoData)
        .enter()
        .append('path')
        .attr('class', 'county')
        .attr('d', path)      
        .attr('fill', (d)=>{
            let eduMatch = edu.filter((data)=>data.fips==d.id);
            if(eduMatch[0]){
            return colors(eduMatch[0].cases)
            }
            return 0;
        })
        .attr('data-fips', (d)=>d.id)
        .attr('data-education', (d)=>{
            let eduMatch = edu.filter((data)=>data.fips==d.id);
            if(eduMatch[0]){
            return eduMatch[0].cases
            }
            return 0;
        })
        .on('mouseover', (event,d)=>{
            tooltip.style('opacity', 1)
            .style('left', (event.pageX+30)+'px')
            .style('top', (event.pageY-20)+'px')
            .attr('data-education', ()=>{
            let eduMatch = edu.filter(data=>data.fips==d.id);
            if(eduMatch[0]){
                return eduMatch[0].cases;
            }
            return 0;
            })
            .html(()=>{
            let eduMatch = edu.filter(data=>data.fips==d.id);
            if(eduMatch[0]){return `${eduMatch[0].county}, ${eduMatch[0].state}<br/> ${eduMatch[0].cases}`}
            return 0;
            })
            
        })
        .on('mouseout', (d)=>{
            tooltip.style('opacity', 0)
            .style('left', 0)
            .style('top', 0)
        });
        
        
        svg.append('text')
        .attr('id', 'title')
        .text('COVID Cases per County')
        .attr('x', w/3)
        .attr('y', 25);
        
        
        // svg.append('text')
        // .attr('id', 'description')
        // .text("Number of COVID Cases per County")
        // .attr('x', w/5)
        // .attr('y', 40);
        
        // set color scale
        const xScale =  d3.scaleLinear()
        .domain([low, high])
        .range([pad, w/2-pad]);
        
        const xAxis = d3.axisBottom(xScale)
        .tickSize(25)
        .tickFormat(d=>d)
        .tickValues(colors.domain());
        
        svg.append('g')
        .attr('id', 'x-axis')
        .attr('transform', 'translate('+(w/3)+','+(h-pad)+')')
        .call(xAxis)
        .select('.domain')
        .remove();

        
        // set legend on color scale
        svg.append('g')
        .attr('id', 'legend')
        .selectAll('rect')
        .data(colors.range().map(d=>d))
        .enter()
        .append('rect')
        .attr('height', 15)
        .attr('width', (d, i)=>(w/2-pad*2)/9) // 9 taken from schemeGreens 
        .attr('fill', d=>d)
        .attr('x', (d,i)=>(pad+w/3)+(i*((w/2-pad*2)/9)))
        .attr('y', h-pad);
        
        svg.append('g')
        .attr('id', 'source')
        .append('text')
        .html('Data Source: <a href="https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json">U.S. Education Data</a>')
        .attr('x', pad)
        .attr('y', h-pad+10)
        
        })

  return (
    <div id="choropleth">
    </div>
  );
}

export default Choropleth;