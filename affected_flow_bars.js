const MARGIN = {top: 30, right: 50, bottom: 30, left: 50},
WIDTH = 800 - MARGIN.left - MARGIN.right,
HEIGHT = 400 - MARGIN.top - MARGIN.bottom,
duration = 500;

var x = d3.scaleBand()
        .rangeRound([0, WIDTH/4])
        .paddingInner(.1)
        .paddingOuter(.3);

var y = d3.scaleLinear()
        .rangeRound([HEIGHT, 0]);

var xAxis = d3.axisBottom(x);

var yAxis = d3.axisLeft(y);

export const CANVAS_AFFECTED_BARS = function(){

const DIV_AFFECTED_FLOW = d3.select('#div_maps')
        .append('div')
        .attr('id', 'div_affected_flow')
        .classed('column', true);

const SVG_AFFECTED_FLOW = DIV_AFFECTED_FLOW //set canvas for map
        .append("svg")
        //.attr('id', 'svg_affected_flow')
        .attr("width", WIDTH/2 + MARGIN.left + MARGIN.right)
        .attr("height", HEIGHT + MARGIN.top + MARGIN.bottom);

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
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Percentage");
}

export const AFFECTED_FLOW_BARS = function(data){

    let data_bars = PREPARE_DATA(data);
    console.log(data_bars)

    x.domain(data_bars.map(d => d.flow));
        
    y.domain([0, d3.max(data_bars, d => d.value)]);
            
const SVG_G = d3.select('#affected_flow');

    SVG_G.select('.x_axis')
        .transition()
        .duration(duration)
        .call(xAxis);

    SVG_G.select('.y_axis')
        .transition()
        .duration(duration)
        .call(yAxis);


var bars = SVG_G.selectAll(".affected_bars")
        .data(data_bars);

        //Update Set
    bars
        .transition()
        .duration(duration)
        .attr("x", d => x(d.flow))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => HEIGHT - y(d.value));

        // Enter Set
    bars
        .enter()
        .append("rect")
        .classed("affected_bars", true)
        .attr('fill','rgba(0, 110, 190, 0.1)')
        .attr("x", d => x(d.flow))
        .attr("y", d => y(d.value))
        // .attr("width", x.bandwidth())
        //.attr("height", d => HEIGHT - y(d.value))
        .merge(bars)
        .attr("y", HEIGHT)
        .attr("height", 0)
        .transition()
        .duration(duration)
        .attr("x", d => x(d.flow))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => HEIGHT - y(d.value));

        // Exit Set
    bars
        .exit()
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
