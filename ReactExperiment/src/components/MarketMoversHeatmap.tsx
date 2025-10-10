import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { MarketMover } from '../types/stock';

interface MarketMoversHeatmapProps {
  gainers: MarketMover[] | undefined;
  losers: MarketMover[] | undefined;
}

export function MarketMoversHeatmap({ gainers, losers }: MarketMoversHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gainers || !losers || !svgRef.current || !containerRef.current) {
      return;
    }

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Combine gainers and losers
    const allMovers = [...gainers, ...losers];

    // Set dimensions
    const margin = { top: 60, right: 20, bottom: 20, left: 20 };
    const containerWidth = containerRef.current.offsetWidth;
    const cellSize = Math.floor((containerWidth - margin.left - margin.right) / 5);
    const cellPadding = 4;
    const width = cellSize * 5;
    const height = cellSize * 4; // 2 rows for gainers, 2 rows for losers

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create color scale
    const maxChange = d3.max(allMovers, (d) => Math.abs(d.changePercent)) || 5;

    const colorScale = d3
      .scaleLinear<string>()
      .domain([-maxChange, 0, maxChange])
      .range(['#dc2626', '#f3f4f6', '#16a34a'])
      .clamp(true);

    // Add section titles
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .attr('font-size', '24px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1f2937')
      .text('Market Movers');

    svg
      .append('text')
      .attr('x', 0)
      .attr('y', -10)
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#16a34a')
      .text('Top 10 Gainers');

    svg
      .append('text')
      .attr('x', 0)
      .attr('y', cellSize * 2 + 20)
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#dc2626')
      .text('Top 10 Losers');

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
      .style('padding', '12px 14px')
      .style('font-size', '13px')
      .style('pointer-events', 'none')
      .style('box-shadow', '0 4px 6px rgba(0,0,0,0.3)')
      .style('z-index', '1000');

    // Function to create cells for a section
    function createCells(data: MarketMover[], yOffset: number) {
      const cells = svg
        .selectAll(`.cell-${yOffset}`)
        .data(data)
        .enter()
        .append('g')
        .attr('class', `cell-${yOffset}`)
        .attr('transform', (_, i) => {
          const row = Math.floor(i / 5);
          const col = i % 5;
          return `translate(${col * cellSize},${yOffset + row * cellSize})`;
        });

      // Add rectangles
      cells
        .append('rect')
        .attr('width', cellSize - cellPadding)
        .attr('height', cellSize - cellPadding)
        .attr('rx', 6)
        .attr('fill', (d) => colorScale(d.changePercent))
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .on('mouseover', function (event, d) {
          d3.select(this)
            .attr('stroke', '#1f2937')
            .attr('stroke-width', 2);

          tooltip
            .style('visibility', 'visible')
            .html(
              `
              <div style="margin-bottom: 6px;"><strong style="font-size: 14px;">${d.symbol}</strong></div>
              ${d.name ? `<div style="margin-bottom: 4px;">${d.name}</div>` : ''}
              ${d.exchange ? `<div style="margin-bottom: 4px;">Exchange: ${d.exchange}</div>` : ''}
              <div style="margin-bottom: 4px;">Price: $${d.price.toFixed(2)}</div>
              <div style="margin-bottom: 4px;">Change: $${d.change.toFixed(2)}</div>
              <div style="margin-bottom: 4px;">Change %: <strong style="color: ${d.changePercent >= 0 ? '#4ade80' : '#f87171'}">${d.changePercent >= 0 ? '+' : ''}${d.changePercent.toFixed(2)}%</strong></div>
              <div>Volume: ${d.volume.toLocaleString()}</div>
              `
            )
            .style('left', `${event.pageX - containerRef.current!.offsetLeft + 10}px`)
            .style('top', `${event.pageY - containerRef.current!.offsetTop - 80}px`);
        })
        .on('mousemove', (event) => {
          tooltip
            .style('left', `${event.pageX - containerRef.current!.offsetLeft + 10}px`)
            .style('top', `${event.pageY - containerRef.current!.offsetTop - 80}px`);
        })
        .on('mouseout', function () {
          d3.select(this)
            .attr('stroke', '#e5e7eb')
            .attr('stroke-width', 1);

          tooltip.style('visibility', 'hidden');
        });

      // Add symbol text
      cells
        .append('text')
        .attr('x', (cellSize - cellPadding) / 2)
        .attr('y', (cellSize - cellPadding) / 2 - 10)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', (d) => Math.abs(d.changePercent) > maxChange * 0.6 ? '#ffffff' : '#1f2937')
        .attr('pointer-events', 'none')
        .text((d) => d.symbol);

      // Add percent change text
      cells
        .append('text')
        .attr('x', (cellSize - cellPadding) / 2)
        .attr('y', (cellSize - cellPadding) / 2 + 12)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '12px')
        .attr('fill', (d) => Math.abs(d.changePercent) > maxChange * 0.6 ? '#ffffff' : '#1f2937')
        .attr('pointer-events', 'none')
        .text((d) => `${d.changePercent >= 0 ? '+' : ''}${d.changePercent.toFixed(2)}%`);
    }

    // Create gainers cells
    createCells(gainers, 10);

    // Create losers cells
    createCells(losers, cellSize * 2 + 40);

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [gainers, losers]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} className="w-full"></svg>
    </div>
  );
}
