import { map_affected } from './map_affected.js';
import { map_implementer } from './map_implementer.js';
import { CANVAS_AFFECTED_BARS, AFFECTED_FLOW_BARS } from './affected_flow_bars.js';


// here we are setting the canvas for the area chart
export const MARGIN = {top: 10, right: 60, bottom: 30, left: 60};
    
export function HEIGHT(){return Math.round(window.innerHeight / 4)}
export function WIDTH(){return document.getElementById("plots").offsetWidth - MARGIN.right - MARGIN.left;}
    console.log(WIDTH());
    console.log(document.getElementById("plots").offsetWidth);

// append div for area chart
d3.select('#plots')
        .append('div')
        .attr('id', 'div_area')
        .classed('row', true);

    // append divs for the maps
export const DIV_MAPS = d3.select('#plots')
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
                                .attr("width", document.getElementById("div_area").offsetWidth-120)
                                .attr("height", HEIGHT() + MARGIN.top + MARGIN.bottom)
                                .append("g")
                                .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);
                                
                                

var x = d3.scaleTime() // this is the scale for time domains
                .range([ 0, document.getElementById("div_area").offsetWidth-190 ]); // the ouput range, which the input data should fit

var xAxis = d3.axisBottom().scale(x); //Initialize X axis

SVG_AREA_CHART.append("g")
                .attr("transform", `translate(0,${HEIGHT()})`) // axes are always rendered at the origin, that's why we need to transform them accordingly
                .attr("class","Xaxis_area_chart")

var y = d3.scaleLinear() // this is the quantitative scale for values
                .range([ HEIGHT(), 0 ]); // the ouput range, which the input data should fit

var yAxis = d3.axisLeft().scale(y); //Initialize Y axis

SVG_AREA_CHART.append("g")
                .attr("class","Yaxis_area_chart");

CANVAS_AFFECTED_BARS(); // add empty canvas for affected flow bar chart

var data;
d3.csv('./data/data.csv',   //url
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

        
export const area_chart = function (affected = 'United States of America', implementer = 'Germany'){

    let data_chart = data.filter(d => d.affected == affected && d.implementer == implementer) // modelling API request of Affected == Canada and implementer == United States of America

    console.log({affected: affected, implementer: implementer});
    console.log(data_chart)

    // Add X axis
    x = x.domain(d3.extent(data_chart, d => new Date(+d.year,0) )) // the input data range 

    SVG_AREA_CHART.selectAll(".Xaxis_area_chart")
                    .transition() //gradual transition between previous and current state of X axis
                    .call(xAxis);

    // Add Y axis
    y = y.domain([0, d3.max(data_chart, d => d.value )]) // the input data range from min to max

    SVG_AREA_CHART.selectAll(".Yaxis_area_chart")
                    .transition() //gradual transition between previous and current state of Y axis
                    .call(yAxis); // renders reference marks for scales

    var area = d3.area() //Constructs an area generator
                    .x(d => x(new Date(+d.year,0)))
                    .y0(y(0))   // sets bottom 'limit', eg zero
                    .y1(d => y(d.value) );

    var update = SVG_AREA_CHART.selectAll(".area_path") // create update selection and bind new data
                    .data([data_chart]);
        
        update
            .enter()
                .append("path")
                .attr("class","area_path")
                .merge(update) // merge previous data and update data for the area chart
                .transition() // gradual transition between previous and current area charts
                .attr("fill", "rgba(0, 110, 190, 0.1)")
                .attr("stroke", "none")
                .attr("stroke-width", 1.5)
                .attr("d", area);

    AFFECTED_FLOW_BARS(data_chart);
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
