import { render } from './index.js';
import { appParameters } from './index.js';
import * as d3 from 'd3';
import { setUpSvg } from './index.js';
import { data } from './index.js';

// CONSTANTS

export function flowPlot() {

  const margin = { top:0, bottom:0, left:20, right:0 }
  
  let svg = setUpSvg(1.5, 400, "flow-plot", "flow-bar", margin);
  let g = svg.g;
  
  const innerWidth = svg.innerWidth;
  const innerHeight = svg.innerHeight;
  
  
  // let data_bars = prepareData(data); // parse data into meaningful format for bars
  //   console.log("data_bars");
  //   console.log(data_bars);
  
  let data_bars = data.filter(d => d.affected == appParameters.affected && d.implementer == appParameters.implementer && d.year.getFullYear() == 2019)
  console.log(data_bars);

  
  var x = d3.scaleBand() // creates a categorical scale
          .domain(data_bars.map(d => d.flow)) // set a domain for X axis scale
          .range([0, innerWidth]) //set a width to scale the categories at
          .paddingInner(.1) //padding between individual bars
          .paddingOuter(.3); //padding between bars and axis

  var y = d3.scaleLinear() // this is the quantitative scale for values
          .rangeRound([innerHeight, 0]); // the ouput range, which the input data should fit

  y.domain([0, 1]); // I think this would be constant (0 to 1, or 1 to 100)

  var xAxis = d3.axisBottom(x); //Initialize X axis

  var yAxis = d3.axisLeft(y); //Initialize Y axis
  
  let yAxisG = g.selectAll('.y-axis').data([null]);
  yAxisG = yAxisG
  .enter().append('g')
    .attr('class', 'y-axis')
  .merge(yAxisG).transition();
  yAxisG.call(yAxis)

  let xAxisG = g.selectAll('.x-axis').data([null]);
  xAxisG = xAxisG
  .enter().append('g')
    .attr('class', 'x-axis')
  .merge(xAxisG)
    .attr('transform', `translate(0, ${innerHeight})`);
  xAxisG.call(xAxis)
var bars = g.selectAll("rect").data(data_bars)
  
  bars
    .enter()    // Enter Set, eg add new bars 
    .append("rect")
    .merge(bars) // Enter + Update set, eg add new (update) bars to existing ones
    .on('click', clickflow)
    .on('mouseover', mouseover)
    .on('mouseout', mouseout)
    .transition()
    .attr("x", d => x(d.flow))
    .attr("y", d => y(d.value))
    .attr("width", x.bandwidth())
    .attr("height", d => innerHeight - y(d.value))
    .attr('fill', 'rgb(13, 89, 159)');
    
  bars
    .exit() // remove unnecessary bars
    .transition()
    .attr("y", innerHeight)
    .attr("height", 0)
    .remove();
    

  
}

function clickflow(d) {
  console.log(d);
  if (d3.select(this).classed('flow_selected')) {
    d3.select(this).classed('flow_selected', false);
    appParameters.flow = "all";
    
    d3.selectAll('#flow-plot rect')
      .attr('opacity', 1);
    
    console.log('opacity 1'); 
      
  } else {
    d3.selectAll('.flow_selected')
      .classed('flow_selected', false)
      
    d3.selectAll('#flow-plot rect')
      .attr('opacity', 0.3);
    
    console.log('opacity 0.3'); 
      
    d3.select(this)
      .classed('flow_selected', true)
      .attr('opacity', 1);
      
    appParameters.flow = d.flow;
  }
  render();

}

function mouseover (d){
  d3.select(this)
    .classed('hover-opacity', true)
    
}

function mouseout (d){
  d3.select(this)
    .classed('hover-opacity', false)
  
}

function prepareData(initial) {
    let data = initial.slice();
    console.log(data);
    let flows = data.map(d => d.flow).filter((el,ind,arr) => { return arr.indexOf(el) == ind });
    let output = [];
    for (let el of flows){
        let val = data.filter(d => d.flow == el).reduce((acc,el) => { return acc + el.value }, 0);
        output.push({flow: el, value: val})
    }
    return output;
}
