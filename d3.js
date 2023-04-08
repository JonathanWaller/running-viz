
const margin = ({top: 30, right: 30, left: 120, bottom: 30})
const width= 1000
const innerWidth = width - margin.left - margin.right
const splitHeight = 900
const noSplitHeight = 500

const median = d3.median(running2, d => d.speed)
console.log('RUNNING 2', running2)
// const yearGroups2 = d3.group(running2, d => d.year)
// console.log('GROPS: ', yearGroups2)
console.log('MEDIAN: ', median)

const split = false;
chart.update(split);

color = d3.scaleSequential(d3.extent(running2, d => d.speed), d3.interpolateOrRd);

const chart = {

    
}
    const svg = d3.create('svg')
      .attr('viewBox', [0, 0, width, noSplitHeight + margin.top + margin.bottom]);

    
    const wrapper = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

      const x = d3.scaleLinear()
      .domain(d3.extent(running2, d => d.speed))
      .range([0, innerWidth])
  
      const y = d3.scaleBand()
      .domain(['All'])
      .range([noSplitHeight, 0])
  
      const r = d3.scaleSqrt()
      .domain(d3.extent(running2, d => d.distance))
      .range([1, 10])
    
    const xAxis = g => g
    .call(d3.axisTop(x)
            .tickFormat(d => `${d} m/hr`))
    .call(g => g.select('.domain').remove())
    .call(g => g.append('text')
          .attr('x', innerWidth)
          .attr('y', 20)
          .attr('font-weight', 'bold')
          .attr('fill', 'currentColor')
          .attr('text-anchor', 'end')
          .text('How fast I ran →'))

    const yAxis = g => g
    .call(d3.axisLeft(y).ticks(8))
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('.tick line').remove())

    // Add x-Axis
    wrapper.append('g')
      .call(xAxis);


    // Add median speed
    const medianLine = wrapper.append('line')
      .attr('x1', x(median))
      .attr('x2', x(median))
      .attr('y1', 10)
      .attr('y2', noSplitHeight)
      .attr('stroke', '#ccc');
    
    // Add median text
    const medianText = wrapper.append('text')
      .attr('x', x(median) + 5)
      .attr('y', 25)
      .attr('font-size', '11px')
      .text('Median speed');
    
    // add yAxis
    const yAxisContainer = wrapper.append('g')
      .attr('transform', `translate(-10,0)`);

    const force = d3.forceSimulation(running2)
    .force('charge', d3.forceManyBody().strength(0))
    .force('x', d3.forceX().x(d => x(d.speed)))
    .force('y', d3.forceY(d => y(d.year)))
    .force('collision', d3.forceCollide().radius(d => r(d.distance) + 1))
        
    const circles = wrapper.append('g')
      .attr('className', 'circles')
      .selectAll('circle')
      .data(running2)
      .join('circle')
        .attr('r', d => r(d.distance))
        .attr('fill', d => color(d.speed))
        .attr('x', d => x(d.speed))
        .attr('y', d => y(d.year) + y.bandwidth() / 2)  

    
    force.on('tick', () => {
      circles
        .transition()
        .ease(d3.easeLinear)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    })
    
    //  invalidation.then(() => force.stop());
    
   Object.assign(svg.node(), {
      update(split) {
        let height = split ? splitHeight : noSplitHeight;
        let years = [...yearGroups2.keys()].sort()
        
        // Update height of svg object
        const t = d3.transition().duration(750);
        svg.transition(t).attr('viewBox', [0, 0, width, height]);
        
        // Update domain of y-Axis
        y.domain(split ? years : ['All']);
        y.range(split ? [splitHeight - margin.top - margin.bottom, 0] : [noSplitHeight - margin.top - margin.bottom, 0]);
        yAxisContainer.call(yAxis, y, split ? years : ['All'])
          .call(g => g.select('.domain').remove())
          .call(g => g.selectAll('.tick line').remove());
        
        // Update simulation
        force.force('y', split ? d3.forceY(d => y(d.year) + y.bandwidth() / 2) : // If split by year align by year
                                 d3.forceY((noSplitHeight - margin.top - margin.bottom) / 2)); // If not split align to middle
        // force.nodes(running2);
        force.alpha(1).restart();
        
        // Update median line
        medianLine.transition(t).attr('y2', split ? splitHeight - 20 : noSplitHeight);
      }
    });


