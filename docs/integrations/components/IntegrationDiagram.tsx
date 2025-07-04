import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';

interface DiagramNode {
  id: string;
  label: string;
  type: 'platform' | 'varai' | 'user' | 'data';
  x: number;
  y: number;
}

interface DiagramConnection {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
}

interface IntegrationDiagramProps {
  title: string;
  description?: string;
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  width?: number;
  height?: number;
}

const DiagramContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[32]};
`;

const DiagramSvg = styled.svg`
  border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  margin: ${({ theme }) => theme.spacing.spacing[16]} 0;
`;

const NodeRect = styled.rect<{ nodeType: string }>`
  fill: ${({ theme, nodeType }) => {
    switch (nodeType) {
      case 'platform':
        return theme.colors.primary[100];
      case 'varai':
        return theme.colors.success[100];
      case 'user':
        return theme.colors.warning[100];
      case 'data':
        return theme.colors.info[100];
      default:
        return theme.colors.neutral[100];
    }
  }};
  stroke: ${({ theme, nodeType }) => {
    switch (nodeType) {
      case 'platform':
        return theme.colors.primary.main;
      case 'varai':
        return theme.colors.success.main;
      case 'user':
        return theme.colors.warning.main;
      case 'data':
        return theme.colors.info.main;
      default:
        return theme.colors.neutral.main;
    }
  }};
  stroke-width: 2;
`;

const NodeLabel = styled.text`
  font-size: 12px;
  font-family: sans-serif;
  text-anchor: middle;
  dominant-baseline: middle;
  pointer-events: none;
  font-weight: bold;
`;

const ConnectionPath = styled.path<{ dashed: boolean }>`
  fill: none;
  stroke: ${({ theme }) => theme.colors.neutral[600]};
  stroke-width: 2;
  stroke-dasharray: ${({ dashed }) => dashed ? '5,5' : 'none'};
  marker-end: url(#arrowhead);
`;

const ConnectionLabel = styled.text`
  font-size: 10px;
  font-family: sans-serif;
  text-anchor: middle;
  dominant-baseline: middle;
  pointer-events: none;
  fill: ${({ theme }) => theme.colors.neutral[700]};
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
`;

const LegendColor = styled.div<{ nodeType: string }>`
  width: 16px;
  height: 16px;
  margin-right: ${({ theme }) => theme.spacing.spacing[8]};
  border-radius: 4px;
  background-color: ${({ theme, nodeType }) => {
    switch (nodeType) {
      case 'platform':
        return theme.colors.primary[100];
      case 'varai':
        return theme.colors.success[100];
      case 'user':
        return theme.colors.warning[100];
      case 'data':
        return theme.colors.info[100];
      default:
        return theme.colors.neutral[100];
    }
  }};
  border: 2px solid ${({ theme, nodeType }) => {
    switch (nodeType) {
      case 'platform':
        return theme.colors.primary.main;
      case 'varai':
        return theme.colors.success.main;
      case 'user':
        return theme.colors.warning.main;
      case 'data':
        return theme.colors.info.main;
      default:
        return theme.colors.neutral.main;
    }
  }};
`;

/**
 * IntegrationDiagram Component
 * 
 * A component for displaying integration diagrams with nodes and connections.
 */
const IntegrationDiagram: React.FC<IntegrationDiagramProps> = ({ 
  title, 
  description, 
  nodes, 
  connections,
  width = 800,
  height = 400
}) => {
  // Calculate the path between two nodes
  const calculatePath = (from: DiagramNode, to: DiagramNode) => {
    const nodeWidth = 120;
    const nodeHeight = 60;
    
    const fromX = from.x + nodeWidth / 2;
    const fromY = from.y + nodeHeight / 2;
    const toX = to.x + nodeWidth / 2;
    const toY = to.y + nodeHeight / 2;
    
    // Calculate control points for a curved path
    const dx = toX - fromX;
    const dy = toY - fromY;
    const controlX = fromX + dx / 2;
    const controlY = fromY + dy / 2;
    
    return `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`;
  };
  
  // Calculate the position for the connection label
  const calculateLabelPosition = (from: DiagramNode, to: DiagramNode) => {
    const nodeWidth = 120;
    const nodeHeight = 60;
    
    const fromX = from.x + nodeWidth / 2;
    const fromY = from.y + nodeHeight / 2;
    const toX = to.x + nodeWidth / 2;
    const toY = to.y + nodeHeight / 2;
    
    return {
      x: (fromX + toX) / 2,
      y: (fromY + toY) / 2 - 10
    };
  };
  
  return (
    <DiagramContainer>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      
      {description && (
        <Typography variant="body1" gutterBottom>
          {description}
        </Typography>
      )}
      
      <DiagramSvg width={width} height={height}>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
          </marker>
        </defs>
        
        {/* Render connections */}
        {connections.map((connection, index) => {
          const fromNode = nodes.find(node => node.id === connection.from);
          const toNode = nodes.find(node => node.id === connection.to);
          
          if (!fromNode || !toNode) return null;
          
          const path = calculatePath(fromNode, toNode);
          const labelPos = calculateLabelPosition(fromNode, toNode);
          
          return (
            <g key={`connection-${index}`}>
              <ConnectionPath 
                d={path} 
                dashed={connection.dashed || false} 
              />
              
              {connection.label && (
                <ConnectionLabel x={labelPos.x} y={labelPos.y}>
                  {connection.label}
                </ConnectionLabel>
              )}
            </g>
          );
        })}
        
        {/* Render nodes */}
        {nodes.map((node, index) => (
          <g key={`node-${index}`}>
            <NodeRect
              x={node.x}
              y={node.y}
              width={120}
              height={60}
              rx={8}
              ry={8}
              nodeType={node.type}
            />
            <NodeLabel x={node.x + 60} y={node.y + 30}>
              {node.label}
            </NodeLabel>
          </g>
        ))}
      </DiagramSvg>
      
      <Legend>
        <LegendItem>
          <LegendColor nodeType="platform" />
          <Typography variant="body2">E-commerce Platform</Typography>
        </LegendItem>
        <LegendItem>
          <LegendColor nodeType="varai" />
          <Typography variant="body2">VARAi Service</Typography>
        </LegendItem>
        <LegendItem>
          <LegendColor nodeType="user" />
          <Typography variant="body2">User Interface</Typography>
        </LegendItem>
        <LegendItem>
          <LegendColor nodeType="data" />
          <Typography variant="body2">Data Store</Typography>
        </LegendItem>
      </Legend>
    </DiagramContainer>
  );
};

export default IntegrationDiagram;