import { MARGIN, WIDTH, HEIGHT } from './main.js';
import { area_chart } from './main.js';
import { DATA_FOR_MAP } from './main.js';

export const map_implementer = function (data_feeded){

    console.log(data_feeded);
    
    const div_implementer =  d3.select('#div_implementer');

    //append title to div
    div_implementer
        .append('h1')
        .text('Implementing jurisdiction');

    //append name of selected affected country to div
    div_implementer
        .append('p')
        .classed('title_implementer', true);

        set_title(); //set initial title for country

    const SVG_MAP_IMPLEMENTER = div_implementer //set canvas for map
        .append('div')
        .attr('class', 'container')
        .append("svg")
        .attr('id', 'map_implementer')
        .attr("width", document.getElementById("div_implementer").offsetWidth-40)
        .attr("height", HEIGHT() + MARGIN.top + MARGIN.bottom);

    const PROJECTION = d3.geoNaturalEarth1() // a projection function that converts from a lon/lat point to an x/y point
        .scale(100) // scale a projection, eg zoom in/out. The default scale factor on a projection is 150, so a scale of 450 is three times zoomed in and so on
        .translate([(document.getElementById("div_implementer").offsetWidth-40) / 4, HEIGHT() / 2]); // set the x/y value for the center (lon/lat) point of the map

        const COLOR_SCALE = d3.scaleSequential()
        .interpolator(d3.interpolate("#df9fdf", "#602060")); 

        var implementer = d3.map(); //creating an empty map
        var promises = [
            d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
            d3.csv("./data/data.csv", function(d) {  // row conversion function
                return {
                    implementer: d.implementer,
                    value: +d.value
                }
            })
            .then(d => { return DATA_FOR_MAP(d,'implementer').map(d1 => implementer.set(d1.country, +d1.value)) }) // collect total values per country and feed them to d3.map()
        ];

        Promise.all(promises).then(ready);

        function ready([data]) {

            console.log(implementer);

            COLOR_SCALE
                  .domain(d3.extent(implementer.values())) // set min and max values for colorscale

            // Draw the map
            SVG_MAP_IMPLEMENTER.append("g")
                .selectAll("path")
                .data(data.features)
                .enter().append("path")
                .attr("fill", function (d) {
                    return COLOR_SCALE(d.value = implementer.get(d.properties.name)) || '#D3D3D3'; // get country name from d3.map() we created earlier or set grey color for empty countries
                })
                .attr("d", d3.geoPath() // a function which converts GeoJSON data into SVG path
                .projection(PROJECTION) // assigning it a projection function to calculate the position of each point on the path it creates
                )
                .style("stroke", "#fff");

        const MAP_IMPLEMENTER_PATH =  d3.selectAll('#map_implementer g');

              MAP_IMPLEMENTER_PATH
                    .selectAll('path')
                    .on('click', click)
                    .on('mouseover', mouseover)
                    .on('mouseout', mouseout)

              MAP_IMPLEMENTER_PATH
                    .append('rect')
                    .classed('maps_background', true)
                    .attr("width", document.getElementById("div_implementer").offsetWidth-40)
                    .attr("height", HEIGHT() + MARGIN.top + MARGIN.bottom)
                    .on('click', () => { 
                        d3.selectAll('.implementer_selected')
                            .classed('implementer_selected', false);
                            
                        MAP_IMPLEMENTER_PATH
                            .selectAll('path')
                            .on('mouseover', mouseover)
                            .on('mouseout', mouseout);
        
                            set_title();
                     })
                     .lower()
        }


    // Load external data and boot
    /*d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function(data){
        // Draw the map
        SVG_MAP_IMPLEMENTER.append("g")
            .selectAll("path")
            .data(data.features)
            .enter().append("path")
            .attr("fill", "#9370DB")
            .attr("d", d3.geoPath() // a function which converts GeoJSON data into SVG path
            .projection(PROJECTION) // assigning it a projection function to calculate the position of each point on the path it creates
            )
            .style("stroke", "#fff");

        const MAP_IMPLEMENTER_PATH =  d3.selectAll('#map_implementer g');

        MAP_IMPLEMENTER_PATH
            .selectAll('path')
            .on('click', click)
            .on('mouseover', mouseover)
            .on('mouseout', mouseout)

        MAP_IMPLEMENTER_PATH
            .append('rect')
            .classed('maps_background', true)
            .attr("width", WIDTH/2 + MARGIN.left + MARGIN.right)
            .attr("height", HEIGHT + MARGIN.top + MARGIN.bottom)
            .on('click', () => { 
                d3.selectAll('.implementer_selected')
                    .classed('implementer_selected', false);
                    
                MAP_IMPLEMENTER_PATH
                    .selectAll('path')
                    .on('mouseover', mouseover)
                    .on('mouseout', mouseout);

                    set_title();
             })
             .lower()
    })*/

}

function mouseover (d){
    d3.select(this)
        .classed('implementer_selected', true); //highlight path

        set_title(d.properties.name)  //show country name
}

function mouseout (d){
    d3.select(this)
        .classed('implementer_selected', false); //remove highlight path

        set_title() //reset country name
}

function click (d){
    d3.selectAll('.implementer_selected')
        .classed('implementer_selected', false);

    set_title(d.properties.name) //show country name

    d3.select(this)
        .classed('implementer_selected', true)
        .on('mouseout', null);

    d3.selectAll('#map_implementer g path')
        .on('mouseout', null);

    d3.selectAll('#map_implementer g path')
        .on('mouseover', null)

    console.log(d);
    let affected = d3.select('.affected_selected').empty() ? null : d3.select('.affected_selected').datum().properties.name; // check if affected is selected
    area_chart(affected, d.properties.name);
}

const set_title = function (set = 'Please, choose country...'){ //reset country title
    d3.select('.title_implementer')
        .text(set) 
}
