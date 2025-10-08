import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { StockDataPoint } from '../types/stock';

interface StockLineChartProps {
  data: StockDataPoint[];
  symbol: string;
}

export function StockLineChart({ data, symbol }: StockLineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !containerRef.current) {
      return;
    }

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Set dimensions and margins
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const containerWidth = containerRef.current.offsetWidth;
    const width = containerWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', 400)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.datetime) as [Date, Date])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.low) as number,
        d3.max(data, (d) => d.high) as number,
      ])
      .nice()
      .range([height, 0]);

    // Create line generator
    const line = d3
      .line<StockDataPoint>()
      .x((d) => xScale(d.datetime))
      .y((d) => yScale(d.price))
      .curve(d3.curveMonotoneX);

    // Add X axis
    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(6)
          .tickFormat((d) => d3.timeFormat('%H:%M')(d as Date))
      )
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    // Add Y axis
    svg
      .append('g')
      .call(d3.axisLeft(yScale).tickFormat((d) => `$${d}`));

    // Add grid lines
    svg
      .append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-width)
          .tickFormat(() => '')
      );

    // Add the line path
    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#2563eb')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add area under the line
    const area = d3
      .area<StockDataPoint>()
      .x((d) => xScale(d.datetime))
      .y0(height)
      .y1((d) => yScale(d.price))
      .curve(d3.curveMonotoneX);

    svg
      .append('path')
      .datum(data)
      .attr('fill', '#2563eb')
      .attr('fill-opacity', 0.1)
      .attr('d', area);

    // Add tooltip
    const tooltip = d3
      .select(containerRef.current)
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)');

    // Add invisible overlay for mouse tracking
    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('opacity', 0)
      .on('mousemove', (event) => {
        const [xPos] = d3.pointer(event);
        const date = xScale.invert(xPos);

        // Find closest data point
        const bisect = d3.bisector((d: StockDataPoint) => d.datetime).left;
        const index = bisect(data, date);
        const d0 = data[index - 1];
        const d1 = data[index];
        const d = d1 && date.getTime() - d0.datetime.getTime() > d1.datetime.getTime() - date.getTime() ? d1 : d0;

        if (d) {
          tooltip
            .style('visibility', 'visible')
            .html(
              `
              <strong>${symbol}</strong><br/>
              Time: ${d3.timeFormat('%H:%M')(d.datetime)}<br/>
              Price: $${d.price.toFixed(2)}<br/>
              High: $${d.high.toFixed(2)}<br/>
              Low: $${d.low.toFixed(2)}
              `
            )
            .style('left', `${event.pageX - containerRef.current!.offsetLeft + 10}px`)
            .style('top', `${event.pageY - containerRef.current!.offsetTop - 30}px`);
        }
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden');
      });

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [data, symbol]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} className="w-full"></svg>
    </div>
  );
}
