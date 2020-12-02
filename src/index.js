console.log('main loaded 2 ');
import "./styles/style.scss"
import * as d3 from 'd3';
import { geoNaturalEarth } from "d3-geo-projection";
import { implementerPlot } from './map_implementer.js';
import { affectedPlot } from './map_affected.js';
import { flowPlot } from './bar_flow.js';


// CONSTANTS

var scaleTime = d3.scaleTime(); // this is the scale for time domains
var scaleLinear = d3.scaleLinear() // this is the quantitative scale for values
var xAxisBottom = d3.axisBottom(); //Initialize X axis
var yAxisLeft = d3.axisLeft(); //Initialize X axis
const area = d3.area(); //Constructs an area generator

export function setUpSvg(aspRatio=2, maxHeight=400, selector, svgId, margin) {
  
  var w = document.getElementById(`${selector}`).offsetWidth,
      h = w/aspRatio > maxHeight ? maxHeight : w/aspRatio;
      
  const props = { 
    width: w,
    height: h
  }
  
  let svg = d3.select(`#${selector}`).selectAll('svg').data([null]);
  svg = svg.enter().append('svg')
    .merge(svg)
      .attr('id', `${svgId}`)
      .attr('width', props.width)
      .attr('height', props.height)
  
  let g = svg.selectAll('.margin-group').data([null]);
  g = g
    .enter().append('g')
      .attr('class', 'margin-group')
    .merge(g)
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
  
  let innerWidth = props.width - margin.left - margin.right;
  let innerHeight = props.height - margin.top - margin.bottom;
  
  return { g: g, innerWidth: innerWidth, innerHeight: innerHeight};
}

function mainPlot() {
  
  // console.log(`${appParameters.affected}, ${appParameters.implementer}`)
  
  const margin = { top:0, bottom:20, left:20, right:0 }
  
  let data_chart = data.filter(d => d.affected == appParameters.affected && d.implementer == appParameters.implementer && d.flow == appParameters.flow) // modelling API request of Affected == Canada and implementer == United States of America
  // console.log(data);
  // console.log(data_chart);
  
  const xValue = data_chart => data_chart.year;  
  const yValue = data_chart => data_chart.value;
  // console.log();
  
  let svg = setUpSvg(2, 400, "main-plot", "area-chart", margin);
  let g = svg.g;
  
  const innerWidth = svg.innerWidth;
  const innerHeight = svg.innerHeight;
        
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data_chart, data_chart => +data_chart.value)])
    .range([innerHeight, 0]);
  const yAxis = d3.axisLeft(yScale);
  let yAxisG = g.selectAll('.y-axis').data([null]);
  yAxisG = yAxisG
  .enter().append('g')
    .attr('class', 'y-axis')
  .merge(yAxisG).transition();
  yAxisG.call(yAxis)

  const xScale = d3.scaleTime()
    .domain(d3.extent(data_chart, data_chart => data_chart.year ))
    .range([0, innerWidth]);
  const xAxis = d3.axisBottom(xScale);
  let xAxisG = g.selectAll('.x-axis').data([null]);
  xAxisG = xAxisG
  .enter().append('g')
    .attr('class', 'x-axis')
  .merge(xAxisG)
    .attr('transform', `translate(0, ${innerHeight})`);
  xAxisG.call(xAxis)
  
  const lineGenerator = d3.line()
    .x(data_chart => xScale(+data_chart.year))
    .y(data_chart => yScale(+data_chart.value));
    
  const areaGenerator = d3.area()
    .x(data_chart => xScale(+data_chart.year))
    .y0(innerHeight)
    .y1(data_chart => yScale(+data_chart.value));
  
  const path = g.selectAll('.chart-path').data([null]);
  path.enter().append('path')
    .merge(path)
    .transition()
      .attr('class', 'chart-path')
      .attr('fill', 'none')
      .attr('stroke', 'rgb(224, 56, 56)')
      .attr('stroke-width','3px')
      .attr('d', lineGenerator(data_chart));
  
  const area = g.selectAll('.chart-area').data([null]);
  area.enter().append('path') 
    .merge(area)
    .transition()
      .attr('class', 'chart-area')
      .attr('fill', 'rgba(224, 56, 56, 0.05)')
      .attr('stroke', 'none')
      .attr('d', areaGenerator(data_chart));
}

// function to feed 'country-total values' to maps
export function dataForMap(data, type) {

    let filtered = data.map( d => d[type]).filter((el, index, arr) => { return arr.indexOf(el) == index }); 
    let output = [];
    for (let country of filtered){
        let all = data.filter(d => d[type] == country);
        let value = all.reduce((acc, el, index, arr) => { return acc + el.value }, 0);
        output.push({ country: country, value: value })
    }
    return output;
}

// HERE WE RENDER ALL PLOTS
export var appParameters = { 
  implementer: "World",
  affected: "World",
  flow: "all",
  year: 2019
};

export function render() {
  mainPlot();
  implementerPlot();
  affectedPlot();
  flowPlot();
}

// DATA
export var data;
d3.csv(require('./data/data.csv'),   //url - use require for parcel.js, cannot find data.csv otherwise
    function (d){          // row conversion function
        return {
            affected: d.affected,
            implementer: d.implementer,
            year: new Date(+d.year, 0),  //convert to numbers
            flow: d.flow,
            value: +d.value //convert to numbers 
            }
        }).then(function(d) {
            
            data = d;  
            console.log(data);
            render();
    })

// render();
window.addEventListener('resize', render);

function clickAffected (d){
  set_title(d.properties.name) //show country name
  if (d3.select(this).classed('affected_selected')) {
    d3.select(this).classed('affected_selected', false);
    appParameters.affected = "World";
  } else {
    d3.selectAll('.affected_selected')
      .classed('affected_selected', false);
    d3.select(this).classed('affected_selected', true);
    appParameters.affected = d.properties.name;
  }

    // console.log(d);
    // console.log(d3.select('.implementer_selected').empty());
    // var implementer = d3.select('.implementer_selected').empty() ? null : d3.select('.implementer_selected').datum().properties.name; // check if implementer is selected
    render();
}


console.log('main loaded ended');
