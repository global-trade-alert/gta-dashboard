import { render } from './index.js';
import { dataForMap } from './index.js';
import { appParameters } from './index.js';
import { geoNaturalEarth } from "d3-geo-projection";
import * as d3 from 'd3';
import { setUpSvg } from './index.js';



export function affectedPlot() {
  
  const margin = { top:0, bottom:0, left:0, right:0 }
  
  let svg = setUpSvg(1.5, 400, "affected-plot", "world-map-affected", margin);
  let g = svg.g;
  
  const innerWidth = svg.innerWidth;
  const innerHeight = svg.innerHeight;
  
  const colorScale = d3.scaleSequential()
    .interpolator(d3.interpolate("rgb(142, 201, 255)", "rgb(0, 78, 150)")); 
        
  var affectedMap = d3.map(); //creating an empty map
  
  var promises = [
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
    d3.csv(require("./data/data.csv"), function(d) {  // row conversion function
        return {
            affected: d.affected,
            value: +d.value
        }
    })
    .then(d => { return dataForMap(d,'affected').map(d => affectedMap.set(d.country, +d.value)) }) // collect total values per country and feed them to d3.map()
];
    
    Promise.all(promises).then(ready);
    
    function ready([data]) {

        // console.log(appParameters.affected);
        
        const projection = geoNaturalEarth() // a projection function that converts from a lon/lat point to an x/y point
          .scale(innerWidth/4.7) // scale a projection, eg zoom in/out. The default scale factor on a projection is 150, so a scale of 450 is three times zoomed in and so on
          .translate([innerWidth / 2.1, innerHeight / 2]); // set the x/y value for the center (lon/lat) point of the map

        colorScale
              .domain(d3.extent(affectedMap.values())) // set min and max values for colorscale

        // Draw the map
        // console.log("redraw");
        const map = g.selectAll('path').data(data.features);
        map.enter().append("path").merge(map)
            .attr("fill", function (d) {
                return colorScale(d.value = affectedMap.get(d.properties.name)) || '#D3D3D3'; // get country name from d3.map() we created earlier or set grey color for empty countries
            })
            .attr("d", d3.geoPath() // a function which converts GeoJSON data into SVG path
            .projection(projection) // assigning it a projection function to calculate the position of each point on the path it creates
            )
            .style("stroke", "#fff")
            .on('click', clickaffected)
            .on('mouseover', mouseover)
            .on('mouseout', mouseout);
    
        const mapFunctions = g.selectAll('.maps_background').data([null]);
        mapFunctions.enter()
          .append('rect')
          .classed('maps_background', true)
          .attr("width", innerWidth)
          .attr("height", innerHeight)
          .attr('fill', 'none')
         .lower() // move background rectangle to the end of parent html element
    }
    
}

function clickaffected (d){
    set_title(d.properties.name) //show country name
    
    if (d3.select(this).classed('affected_selected')) {
      d3.select(this).classed('affected_selected', false);
      appParameters.affected = "World";
      
      d3.selectAll('#affected-plot path')
        .transition()
        .attr('opacity', 1)
        ;
    } else {
      d3.selectAll('.affected_selected')
        .classed('affected_selected', false)
        
      d3.selectAll('#affected-plot path')
        .transition()
        .attr('opacity', 0.3);
        
      d3.select(this)
        .classed('affected_selected', true)
        .transition()
        .attr('opacity', 1);
        
      appParameters.affected = d.properties.name;
    }

// check if affected is selected
    render();
}


function mouseover (d){
  d3.select(this)
    .classed('hover-opacity', true)
    
    set_title(d.properties.name)  //show country name
}

function mouseout (d){
  d3.select(this)
    .classed('hover-opacity', false)
  
        set_title() //reset country name
}


const set_title = function (set = 'Please, choose country...'){ //reset country title
    d3.select('.title_affected')
        .text(set) 
}
