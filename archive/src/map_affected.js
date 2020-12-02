import { geoNaturalEarth } from "d3-geo-projection";
import { MARGIN, WIDTH, HEIGHT, area_chart, DATA_FOR_MAP } from './index.js';
import { geoNaturalEarth1Raw } from "d3";

export const map_affected = function (){


const div_affected =  d3.select('#div_affected');

    //append title to div
    div_affected
        .append('h1')
        .text('Affected jurisdiction');

    //append name of selected affected country to div
    div_affected
        .append('p')
        .classed('title_affected', true);

        set_title(); //set initial title for country

    const SVG_MAP_AFFECTED = div_affected //set canvas for map
        .append("svg")
        .attr('id', 'map_affected')
        .attr("width", '100%')
        .attr("height", '100%')
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('viewBox', `0 0 ${WIDTH/2 + MARGIN.left + MARGIN.right} ${HEIGHT + MARGIN.top + MARGIN.bottom}`)

    const PROJECTION = geoNaturalEarth() // a projection function that converts from a lon/lat point to an x/y point
        .scale(100) // scale a projection, eg zoom in/out. The default scale factor on a projection is 150, so a scale of 450 is three times zoomed in and so on
        .translate([WIDTH / 4, HEIGHT / 2 ]); // set the x/y value for the center (lon/lat) point of the map


    const COLOR_SCALE = d3.scaleSequential()
                            .interpolator(d3.interpolate("#b3b3ff", "#000080")); 

    var affected = d3.map(); //creating an empty map
    var promises = [
        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
        d3.csv("./data/data.csv", function(d) {  // row conversion function
            return {
                affected: d.affected,
                value: +d.value
            }
        })
        .then(d => { return DATA_FOR_MAP(d,'affected').map(d1 => affected.set(d1.country, +d1.value)) }) // collect total values per country and feed them to d3.map()
      ];


      Promise.all(promises).then(ready)

        function ready([data]) {

            console.log(affected);

            COLOR_SCALE
                  .domain(d3.extent(affected.values())) // set min and max values for colorscale

            // Draw the map
            SVG_MAP_AFFECTED.append("g")
                .selectAll("path")
                .data(data.features)
                .enter().append("path")
                .attr("fill", function (d) {
                    return COLOR_SCALE(d.value = affected.get(d.properties.name)) || '#D3D3D3'; // get country name from d3.map() we created earlier or set grey color for empty countries
                })
                .attr("d", d3.geoPath() // a function which converts GeoJSON data into SVG path
                                .projection(PROJECTION) // assigning it a projection function to calculate the position of each point on the path it creates
                )
                .style("stroke", "#fff");

        const MAP_AFFECTED_PATH =  d3.selectAll('#map_affected g');
            MAP_AFFECTED_PATH
                .selectAll('path')
                .on('click', click)
                .on('mouseover', mouseover)
                .on('mouseout', mouseout);

            MAP_AFFECTED_PATH
                .append('rect')
                .classed('maps_background', true)
                .attr("width", '100%') //WIDTH/2 + MARGIN.left + MARGIN.right)
                .attr("height", '100%') //HEIGHT + MARGIN.top + MARGIN.bottom)
                .on('click', () => { 
                    d3.selectAll('.affected_selected')
                        .classed('affected_selected', false);
                        
                    MAP_AFFECTED_PATH
                        .selectAll('path')
                        .on('mouseover', mouseover)
                        .on('mouseout', mouseout);

                    set_title();
                })
                .lower() // move background rectangle to the end of parent html element
        }


}

function mouseover (d){
    d3.select(this)
        .classed('affected_selected', true); //highlight path

        set_title(d.properties.name)  //show country name
}

function mouseout (d){
    d3.select(this)
        .classed('affected_selected', false); //remove highlight path

        set_title() //reset country name
}

function click (d){
    d3.selectAll('.affected_selected')
        .classed('affected_selected', false);

    set_title(d.properties.name) //show country name

    d3.select(this)
        .classed('affected_selected', true)
        .on('mouseout', null);

    d3.selectAll('#map_affected g path')
        .on('mouseout', null);

    d3.selectAll('#map_affected g path')
        .on('mouseover', null)

    console.log(d);
    let implementer = d3.select('.implementer_selected').empty() ? null : d3.select('.implementer_selected').datum().properties.name; // check if implementer is selected
    area_chart(d.properties.name, implementer);
}

const set_title = function (set = 'Please, choose country...'){ //reset country title
    d3.select('.title_affected')
        .text(set) 
}