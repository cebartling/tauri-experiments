import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { StockDataPoint } from '../types/stock';

interface CandlestickChartProps {
  data: StockDataPoint[];
  symbol: string;
}

export function CandlestickChart({ data, symbol }: CandlestickChartProps) {
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
    const height = 500 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', 500)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.datetime.toISOString()))
      .range([0, width])
      .padding(0.3);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.low) as number,
        d3.max(data, (d) => d.high) as number,
      ])
      .nice()
      .range([height, 0]);

    // Add X axis
    const tickValues = data.filter((_, i) => i % Math.ceil(data.length / 10) === 0);
    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickValues(tickValues.map((d) => d.datetime.toISOString()))
          .tickFormat((d) => d3.timeFormat('%H:%M')(new Date(d as string)))
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

    // Create candlestick groups
    const candles = svg
      .selectAll('.candle')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'candle')
      .attr('transform', (d) => `translate(${xScale(d.datetime.toISOString())},0)`);

    // Add wicks (high-low lines)
    candles
      .append('line')
      .attr('class', 'wick')
      .attr('x1', (xScale.bandwidth() / 2))
      .attr('x2', (xScale.bandwidth() / 2))
      .attr('y1', (d) => yScale(d.high))
      .attr('y2', (d) => yScale(d.low))
      .attr('stroke', (d) => (d.price >= d.open ? '#10b981' : '#ef4444'))
      .attr('stroke-width', 1);

    // Add candle bodies (open-close rectangles)
    candles
      .append('rect')
      .attr('class', 'body')
      .attr('x', 0)
      .attr('y', (d) => yScale(Math.max(d.open, d.price)))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => {
        const bodyHeight = Math.abs(yScale(d.open) - yScale(d.price));
        return bodyHeight === 0 ? 1 : bodyHeight; // Minimum height of 1px for doji candles
      })
      .attr('fill', (d) => (d.price >= d.open ? '#10b981' : '#ef4444'))
      .attr('stroke', (d) => (d.price >= d.open ? '#059669' : '#dc2626'))
      .attr('stroke-width', 1);

    // Add tooltip
    const tooltip = d3
      .select(containerRef.current)
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', '#1f2937')
      .style('color', '#ffffff')
      .style('border', '1px solid #374151')
      .style('border-radius', '6px')
      .style('padding', '10px 12px')
      .style('font-size', '13px')
      .style('pointer-events', 'none')
      .style('box-shadow', '0 4px 6px rgba(0,0,0,0.3)')
      .style('z-index', '1000');

    // Add vertical crosshair line
    const verticalLine = svg
      .append('line')
      .attr('class', 'crosshair')
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#6b7280')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')
      .style('opacity', 0);

    // Add hover interactions
    candles
      .on('mouseover', function (event, d) {
        d3.select(this).select('.body').attr('opacity', 0.7);

        const xPosition = xScale(d.datetime.toISOString()) || 0;

        verticalLine
          .attr('x1', xPosition + xScale.bandwidth() / 2)
          .attr('x2', xPosition + xScale.bandwidth() / 2)
          .style('opacity', 1);

        const change = d.price - d.open;
        const changePercent = (change / d.open) * 100;

        tooltip
          .style('visibility', 'visible')
          .html(
            `
            <strong>${symbol}</strong><br/>
            Time: ${d3.timeFormat('%H:%M')(d.datetime)}<br/>
            <span style="color: #10b981;">Open: $${d.open.toFixed(2)}</span><br/>
            <span style="color: #ef4444;">Close: $${d.price.toFixed(2)}</span><br/>
            High: $${d.high.toFixed(2)}<br/>
            Low: $${d.low.toFixed(2)}<br/>
            <span style="color: ${change >= 0 ? '#10b981' : '#ef4444'};">
              Change: ${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent.toFixed(2)}%)
            </span>
            ${d.volume ? `<br/>Volume: ${d.volume.toLocaleString()}` : ''}
            `
          )
          .style('left', `${event.pageX - containerRef.current!.offsetLeft + 10}px`)
          .style('top', `${event.pageY - containerRef.current!.offsetTop - 30}px`);
      })
      .on('mouseout', function () {
        d3.select(this).select('.body').attr('opacity', 1);
        tooltip.style('visibility', 'hidden');
        verticalLine.style('opacity', 0);
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
