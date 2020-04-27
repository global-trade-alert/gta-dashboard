const MARGIN = {top: 30, right: 50, bottom: 30, left: 50},
WIDTH = 800 - MARGIN.left - MARGIN.right,
HEIGHT = 400 - MARGIN.top - MARGIN.bottom,
duration = 500;

var x = d3.scaleBand() // creates a categorical scale
        .range([0, WIDTH/4]) //set a width to scale the categories at
        .paddingInner(.1) //padding between individual bars
        .paddingOuter(.3); //padding between bars and axis

var y = d3.scaleLinear() // this is the quantitative scale for values
        .rangeRound([HEIGHT, 0]); // the ouput range, which the input data should fit

y.domain([0, 10]); // I think this would be constant (0 to 1, or 1 to 100)

var xAxis = d3.axisBottom(x); //Initialize X axis

var yAxis = d3.axisLeft(y); //Initialize Y axis

export const CANVAS_AFFECTED_BARS = function(){ // add initial svg and g elements to a page, where bars will be plotted

const DIV_AFFECTED_FLOW = d3.select('#div_maps')
        .append('div')
        .attr('id', 'div_affected_flow')
        .classed('column', true);

const SVG_AFFECTED_FLOW = DIV_AFFECTED_FLOW //set canvas for map
        .append("svg")
        //.attr('id', 'svg_affected_flow')
        .attr("width", '100%')
        .attr("height", '100%')
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('viewBox', `0 0 250 400`)//${WIDTH/2 + MARGIN.left + MARGIN.right} ${HEIGHT + MARGIN.top + MARGIN.bottom}`);

const G_AFFECTED_FLOW = SVG_AFFECTED_FLOW
        .append("g")
        .attr('id', 'affected_flow')
        .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    G_AFFECTED_FLOW.append("g")
        .attr("transform", `translate(0,${HEIGHT})`)
        .classed('x_axis', true);

    G_AFFECTED_FLOW.append("g")
        .classed('y_axis', true)
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 5 - MARGIN.left)
        .attr("x", 0 - (HEIGHT/2))
        .attr("dy", "0.71em")
        .attr("text-anchor", "middle")
        .text("Percentage");

    G_AFFECTED_FLOW.select('.y_axis')
        .transition()
        .duration(duration)
        .call(yAxis);
}

export const AFFECTED_FLOW_BARS = function(data){ // a function-feeder of new data for bars

    let data_bars = PREPARE_DATA(data); // parse data into meaningful format for bars
    console.log(data_bars)

    x.domain(data_bars.map(d => d.flow)); // set a domain for X axis scale
            
const SVG_G = d3.select('#affected_flow');

    SVG_G.select('.x_axis')
        .transition() // gradual animation between different states of X axis
        .duration(duration)
        .call(xAxis); // attach X axis


var bars = SVG_G.selectAll(".affected_bars") // select all existing bars. The first time this runs, there will be an empty selection
        .data(data_bars); // bind data to a selection

    
    bars
        .enter()    // Enter Set, eg add new bars 
        .append("rect")
        .classed("affected_bars", true)
        .merge(bars) // Enter + Update set, eg add new (update) bars to existing ones
        .transition()
        .duration(duration)
        .attr("x", d => x(d.flow))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => HEIGHT - y(d.value)); // since in svg Y 0 starts at the top, we need to normalize it to start from bottom 

        // Exit Set
    bars
        .exit() // remove unnecessary bars
        .transition()
        .duration(duration)
        .attr("y", HEIGHT)
        .attr("height", 0)
        .remove();
}


    

const PREPARE_DATA = function(initial){
    let data = initial.slice();
    let flows = data.map(d => d.flow).filter((el,ind,arr) => { return arr.indexOf(el) == ind });

    let output = [];
    for (let el of flows){
        let val = data.filter(d => d.flow == el).reduce((acc,el) => { return acc + el.value }, 0);
        output.push({flow: el, value: val})
    }
    return output;
}