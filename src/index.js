import * as d3 from 'd3';
import { map_affected } from './map_affected.js';
import { map_implementer } from './map_implementer.js';
import './style.css';
import { CANVAS_AFFECTED_BARS, AFFECTED_FLOW_BARS } from './affected_flow_bars.js';

require("expose-loader?d3!d3"); // make d3 module available in the console

window.addEventListener('resize', updateChart); //update area chart on resizing window
// here we are setting the canvas for the area chart
export const MARGIN = {top: 10, right: 30, bottom: 30, left: 50},
    WIDTH = 1000 - MARGIN.left - MARGIN.right,
    HEIGHT = 400 - MARGIN.top - MARGIN.bottom;

var margin = {top: 10, right: 30, bottom: 30, left: 50},
    width,
    height;

// append div for area chart
d3.select('body')
        .append('div')
        .attr('id', 'div_area')
        .classed('row', true);

    // append divs for the maps
export const DIV_MAPS = d3.select('body')
                    .append('div')
                    .attr('id', 'div_maps')
                    .classed('row', true);
    DIV_MAPS            
        .append('div')
        .attr('id', 'div_affected')
        .classed('column', true);

    DIV_MAPS
        .append('div')
        .attr('id', 'div_implementer')
        .classed('column', true);

const SVG_AREA_CHART = d3.select("#div_area")
                            .append("svg")
                                .attr('id', 'area_chart')
                                .attr('preserveAspectRatio', 'xMidYMid meet')
                                .append("g");

var x = d3.scaleTime(); // this is the scale for time domains

var xAxis = d3.axisBottom() //Initialize X axis
var xAxis = d3.axisBottom();

SVG_AREA_CHART.append("g")
                .attr("class","Xaxis_area_chart")

var y = d3.scaleLinear() // this is the quantitative scale for values

var yAxis = d3.axisLeft() //Initialize Y axis

const area = d3.area(); //Constructs an area generator

SVG_AREA_CHART.append("g")
                .attr("class","Yaxis_area_chart");

CANVAS_AFFECTED_BARS(); // initialize empty canvas for affected flow bar chart

var data;
d3.csv('./data/data.csv',   // a promise to load data from url
    function (d){           // row conversion function
        return {
            affected: d.affected,
            implementer: d.implementer,
            year: +d.year,  //convert to numbers
            flow: d.flow,
            value: +d.value //convert to numbers 
            }
        }).then(function(d) {
            console.log(d)
            data = d;
            area_chart();
           
            map_affected();     // build map Affected from the module map_affected.js
            map_implementer( DATA_FOR_MAP(data, 'implementer') );     // build map Implementer from the module map_implementer.js
    })

        
export const area_chart = function (affected = 'Brazil', implementer = 'Argentina'){

    let data_chart = data.filter(d => d.affected == affected && d.implementer == implementer) // modelling API request of Affected == Canada and implementer == United States of America

    console.log({affected: affected, implementer: implementer});
    console.log(data_chart)

    x.domain(d3.extent(data_chart, d => new Date(+d.year,0) )) // set the input data range 
   
    y.domain([0, d3.max(data_chart, d => d.value )]) // the input data range from min to max

    var update = SVG_AREA_CHART.selectAll(".area_path") // create selection and bind new data
                    .data([data_chart]);

        update
            .enter()
                .append("path")
                .attr("class","area_path")
                .merge(update); // merge previous data and update data for the area chart

    updateChart(); // run this function initially
    AFFECTED_FLOW_BARS(data_chart);
    
}


    function updateChart(winWidth){

        var SVG_AREA_CHART =  d3.select('#area_chart');
        
            width = window.innerWidth - margin.left - margin.right - 200; //recalculate width based on window size
            //height = 400 - margin.top - margin.bottom; //recalculate height based on window size
            height = width*0.3;

            SVG_AREA_CHART
                .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
                .attr("width", '100%')
                .attr("height", '100%')
                .attr('preserveAspectRatio', 'xMidYMid meet')

            SVG_AREA_CHART
                .select('g')
                .attr("transform", `translate(${margin.left},${margin.top})`);

               x.range([ 0, width ]); // the ouput range, which the input data should fit

               let breakpoint = 520; //window width limit, after which only each second tick from x axis will be shown
               if (window.innerWidth >= breakpoint){
                xAxis.scale(x).ticks(d3.timeYear.every(1)); // set scale of X axis
               } else {
                xAxis.scale(x).ticks(d3.timeYear.every(2)); // set scale of X axis
               }
           
               y.range([ height, 0 ]); // the ouput range, which the input data should fit
           yAxis.scale(y); // set scale of Y axis

    SVG_AREA_CHART.select('.Xaxis_area_chart')
                .attr("transform", `translate(0,${height})`) // axes are always rendered at the origin, that's why we need to transform them accordingly
                .transition() //gradual transition between previous and current state of X axis
                .call(xAxis);

    SVG_AREA_CHART.select(".Yaxis_area_chart")
                .transition() //gradual transition between previous and current state of Y axis
                .call(yAxis); // renders reference marks for scales

            area // set parameters of area generator
                .x(d => x(new Date(+d.year,0)))
                .y0(y(0))   // sets bottom 'limit', eg zero
                .y1(d => y(d.value) );

            SVG_AREA_CHART
                .selectAll(".area_path")
                .transition()// gradual transition between previous and current area charts
                .attr("fill", "#cce5df")
                .attr("stroke", "#69b3a2")
                .attr("stroke-width", 1.5)
                .attr("d", area); //build path chart
    }

// function to feed 'country-total values' to maps
export const DATA_FOR_MAP = function (data, type){

    let filtered = data.map( d => d[type]).filter((el, index, arr) => { return arr.indexOf(el) == index }); 
    let output = [];
    for (let country of filtered){
        let all = data.filter(d => d[type] == country);
        let value = all.reduce((acc, el, index, arr) => { return acc + el.value }, 0);
        output.push({ country: country, value: value })
    }
    return output;
}
