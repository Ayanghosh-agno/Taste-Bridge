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
    const container = svgRef.current.parentElement;
    const width = container ? Math.min(container.clientWidth - 32, 700) : 700;
    const height = Math.min(width * 0.67, 450);
    
    svg.selectAll("*").remove();
    
    // Collect all unique tags from both persona-level and entity-level
    const personaTags = personaData.tags || [];
    const entityTags = personaData.entities?.flatMap((entity: any) => 
      entity.tags?.map((tag: any) => tag.name || tag.id || tag) || []
    ) || [];
    
    // Combine and deduplicate all tags
    const allTags = [...new Set([...personaTags, ...entityTags])];
    
    // Create nodes from persona data
    const nodes = [
      // Central "You" node
      { 
        id: 'center', 
        group: 0, 
        radius: 18, 
        label: 'You',
        type: 'user'
      },
      // Tag nodes (from both persona and entity tags)
      ...allTags.slice(0, 12).map((tag: string, i: number) => ({
        id: `tag-${tag}`,
        group: 1,
        radius: 8 + Math.random() * 4,
        label: tag,
        type: 'tag'
      })),
      // Entity nodes
      ...personaData.entities.slice(0, 8).map((entity: any, i: number) => ({
        id: entity.entity_id || `entity-${i}`,
        group: 2,
        radius: 6 + (entity.confidence || entity.popularity || 0.5) * 8,
        label: entity.name,
        type: 'entity',
        entityType: entity.type?.replace('urn:entity:', '') || 'unknown'
      }))
    ];

    // Create different types of links
    const links = [
      // User to top persona tags
      ...personaTags.slice(0, 8).map((tag: string) => ({
        source: 'center',
        target: `tag-${tag}`,
        strength: 0.7 + Math.random() * 0.3,
        linkType: 'user-tag'
      })),
      // User to entities
      ...personaData.entities.slice(0, 8).map((entity: any) => ({
        source: 'center',
        target: entity.entity_id || `entity-${personaData.entities.indexOf(entity)}`,
        strength: entity.confidence || entity.popularity || 0.5,
        linkType: 'user-entity'
      })),
      // Entities to their specific tags (cross-domain connections)
      ...personaData.entities.slice(0, 8).flatMap((entity: any) => {
        const entityId = entity.entity_id || `entity-${personaData.entities.indexOf(entity)}`;
        const entitySpecificTags = entity.tags?.slice(0, 3) || [];
        
        return entitySpecificTags.map((tag: any) => {
          const tagName = tag.name || tag.id || tag;
          return {
            source: entityId,
            target: `tag-${tagName}`,
            strength: tag.score || 0.6,
            linkType: 'entity-tag'
          };
        });
      })
    ];

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).strength((d: any) => d.strength * 0.8))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius + 4));

    // Add links with different styles based on type
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d: any) => {
        switch (d.linkType) {
          case 'user-tag': return '#a855f7'; // Purple for user-tag connections
          case 'user-entity': return '#f97316'; // Orange for user-entity connections
          case 'entity-tag': return '#06b6d4'; // Cyan for cross-domain entity-tag connections
          default: return '#6366f1';
        }
      })
      .attr('stroke-opacity', (d: any) => {
        switch (d.linkType) {
          case 'entity-tag': return 0.8; // Make cross-domain connections more prominent
          default: return 0.6;
        }
      })
      .attr('stroke-width', (d: any) => {
        switch (d.linkType) {
          case 'entity-tag': return d.strength * 4; // Thicker lines for cross-domain connections
          case 'user-entity': return d.strength * 3;
          default: return d.strength * 2;
        }
      })
      .attr('stroke-dasharray', (d: any) => {
        // Dashed lines for cross-domain connections to make them distinct
        return d.linkType === 'entity-tag' ? '5,3' : 'none';
      });

    // Add nodes with different colors based on type
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', (d: any) => d.radius)
      .attr('fill', (d: any) => {
        switch (d.type) {
          case 'user': return '#a855f7'; // Purple for user
          case 'tag': return '#f97316'; // Orange for tags
          case 'entity': return '#06b6d4'; // Cyan for entities
          default: return '#6366f1';
        }
      })
      .attr('fill-opacity', 0.8)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    // Add labels
    const labels = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .text((d: any) => {
        // Truncate long labels for better readability
        return d.label.length > 12 ? d.label.substring(0, 12) + '...' : d.label;
      })
      .attr('font-size', (d: any) => {
        switch (d.type) {
          case 'user': return '14px';
          case 'entity': return '11px';
          default: return '10px';
        }
      })
      .attr('font-weight', (d: any) => d.type === 'user' ? 'bold' : 'normal')
      .attr('fill', '#fff')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .style('pointer-events', 'none');

    // Add tooltips for entities showing their type
    node.append('title')
      .text((d: any) => {
        if (d.type === 'entity') {
          return `${d.label}\nType: ${d.entityType}\nRadius: ${d.radius.toFixed(1)}`;
        } else if (d.type === 'tag') {
          return `Tag: ${d.label}`;
        }
        return d.label;
      });

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
      className="space-y-6"
    >
      <div className="text-center">
        <svg
          ref={svgRef}
          width="100%"
          height="350"
          viewBox="0 0 700 350"
          className="border border-gray-700 rounded-xl bg-gray-900/30"
        />
      </div>
      
      {/* Cross-Domain Explanation */}
      <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-400/20 rounded-xl p-6">
        <h4 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"></div>
          Cross-Domain Cultural Connections
        </h4>
        
        <div className="space-y-3 text-sm">
          <p className="text-gray-300 leading-relaxed">
            This visualization demonstrates how <strong className="text-cyan-300">Qloo's AI</strong> identifies 
            cultural affinities across different domains. Notice how entities from different categories 
            (music, movies, books, places) connect through shared cultural tags.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <div>
                <div className="text-purple-300 font-medium">User Connections</div>
                <div className="text-gray-400 text-xs">Your core preferences</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <div>
                <div className="text-orange-300 font-medium">Cultural Tags</div>
                <div className="text-gray-400 text-xs">Shared characteristics</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
              <div className="w-4 h-1 bg-cyan-500 rounded-full"></div>
              <div>
                <div className="text-cyan-300 font-medium">Cross-Domain Links</div>
                <div className="text-gray-400 text-xs">Qloo's unique insights</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-gray-400 text-center text-xs md:text-sm">
        Interactive cultural network - drag nodes to explore connections • 
        Dashed cyan lines show cross-domain affinities discovered by Qloo
      </p>
    </motion.div>
  );
};

export default CulturalGraph;