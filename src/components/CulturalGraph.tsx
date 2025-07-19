import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';

interface CulturalGraphProps {
  personaData: any;
}

const CulturalGraph: React.FC<CulturalGraphProps> = ({ personaData }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!personaData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 600;
    const height = 400;
    
    svg.selectAll("*").remove();
    
    // Create nodes from persona data
    const nodes = [
      { id: 'center', group: 0, radius: 15, label: 'You' },
      ...personaData.tags.slice(0, 8).map((tag: string, i: number) => ({
        id: tag,
        group: 1,
        radius: 8 + Math.random() * 4,
        label: tag
      })),
      ...personaData.entities.slice(0, 6).map((entity: any, i: number) => ({
        id: entity.name,
        group: 2,
        radius: 6 + entity.confidence * 8,
        label: entity.name
      }))
    ];

    // Create links
    const links = [
      ...personaData.tags.slice(0, 8).map((tag: string) => ({
        source: 'center',
        target: tag,
        strength: 0.7 + Math.random() * 0.3
      })),
      ...personaData.entities.slice(0, 6).map((entity: any) => ({
        source: 'center',
        target: entity.name,
        strength: entity.confidence
      }))
    ];

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).strength((d: any) => d.strength))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius + 2));

    // Add links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#6366f1')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: any) => d.strength * 3);

    // Add nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', (d: any) => d.radius)
      .attr('fill', (d: any) => {
        if (d.group === 0) return '#a855f7';
        if (d.group === 1) return '#f97316';
        return '#06b6d4';
      })
      .attr('fill-opacity', 0.8)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add labels
    const labels = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .text((d: any) => d.label)
      .attr('font-size', (d: any) => d.group === 0 ? '14px' : '10px')
      .attr('font-weight', (d: any) => d.group === 0 ? 'bold' : 'normal')
      .attr('fill', '#fff')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      labels
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    // Add drag behavior
    const drag = d3.drag()
      .on('start', (event: any, d: any) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event: any, d: any) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event: any, d: any) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag as any);

  }, [personaData]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8"
    >
      <div className="text-center">
        <svg
          ref={svgRef}
          width="100%"
          height="400"
          viewBox="0 0 600 400"
          className="border border-gray-700 rounded-xl bg-gray-900/30"
        />
        <p className="text-gray-400 mt-4">
          Interactive cultural network - drag nodes to explore connections
        </p>
      </div>
    </motion.div>
  );
};

export default CulturalGraph;