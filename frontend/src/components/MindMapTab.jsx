import React, { useState, useEffect } from 'react';
import { useAppContext } from '../App';
import './MindMapTab.css';

const MindMapTab = () => {
  const { studyData } = useAppContext();
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector('.mindmap-container');
      if (container) {
        setDimensions({
          width: Math.min(container.offsetWidth, 1200),
          height: Math.max(container.offsetHeight, 600)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  if (!studyData || !studyData.mindmap) {
    return (
      <div className="empty-state">
        <p>No mind map data available. Please upload and analyze a file first.</p>
      </div>
    );
  }

  const { root, branches } = studyData.mindmap;
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const branchRadius = Math.min(dimensions.width, dimensions.height) * 0.35;

  return (
    <div className="mindmap-tab tab-content">
      <div className="mindmap-header">
        <h2 className="mindmap-title">Concept Map</h2>
        <p className="mindmap-subtitle">Click on branches to explore connections</p>
      </div>

      <div className="mindmap-container">
        <svg width={dimensions.width} height={dimensions.height} className="mindmap-svg">
          <defs>
            <radialGradient id="rootGradient">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#2563eb" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Draw lines from root to branches */}
          {branches?.map((branch, index) => {
            const angle = (index * 2 * Math.PI) / branches.length - Math.PI / 2;
            const branchX = centerX + branchRadius * Math.cos(angle);
            const branchY = centerY + branchRadius * Math.sin(angle);

            return (
              <g key={index}>
                <path
                  d={`M ${centerX} ${centerY} Q ${centerX + (branchX - centerX) / 2} ${centerY + (branchY - centerY) / 2 - 30} ${branchX} ${branchY}`}
                  stroke="#bfdbfe"
                  strokeWidth="2"
                  fill="none"
                  className="branch-line"
                />
              </g>
            );
          })}

          {/* Draw lines from branches to children */}
          {branches?.map((branch, branchIndex) => {
            const angle = (branchIndex * 2 * Math.PI) / branches.length - Math.PI / 2;
            const branchX = centerX + branchRadius * Math.cos(angle);
            const branchY = centerY + branchRadius * Math.sin(angle);

            return branch.children?.map((child, childIndex) => {
              const childAngle = angle + (childIndex - (branch.children.length - 1) / 2) * 0.3;
              const childRadius = branchRadius + 120;
              const childX = centerX + childRadius * Math.cos(childAngle);
              const childY = centerY + childRadius * Math.sin(childAngle);

              return (
                <line
                  key={`${branchIndex}-${childIndex}`}
                  x1={branchX}
                  y1={branchY}
                  x2={childX}
                  y2={childY}
                  stroke="#93c5fd"
                  strokeWidth="1.5"
                  className="child-line"
                  opacity={selectedBranch === branchIndex ? 1 : 0.4}
                />
              );
            });
          })}

          {/* Root node */}
          <g className="root-node">
            <circle
              cx={centerX}
              cy={centerY}
              r="60"
              fill="url(#rootGradient)"
              filter="url(#glow)"
              className="root-circle"
            />
            <text
              x={centerX}
              y={centerY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fefdfb"
              fontSize="16"
              fontWeight="700"
              className="root-text"
            >
              {root?.length > 20 ? root.substring(0, 20) + '...' : root}
            </text>
          </g>

          {/* Branch nodes */}
          {branches?.map((branch, index) => {
            const angle = (index * 2 * Math.PI) / branches.length - Math.PI / 2;
            const branchX = centerX + branchRadius * Math.cos(angle);
            const branchY = centerY + branchRadius * Math.sin(angle);
            const isSelected = selectedBranch === index;

            return (
              <g
                key={index}
                className="branch-node"
                onClick={() => setSelectedBranch(isSelected ? null : index)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={branchX}
                  cy={branchY}
                  r="45"
                  fill={isSelected ? '#1d4ed8' : '#60a5fa'}
                  stroke={isSelected ? '#2563eb' : '#93c5fd'}
                  strokeWidth="2"
                  className="branch-circle"
                />
                <text
                  x={branchX}
                  y={branchY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fefdfb"
                  fontSize="13"
                  fontWeight="600"
                  className="branch-text"
                >
                  {branch.label?.length > 15 ? branch.label.substring(0, 15) + '...' : branch.label}
                </text>
              </g>
            );
          })}

          {/* Child nodes */}
          {branches?.map((branch, branchIndex) => {
            const angle = (branchIndex * 2 * Math.PI) / branches.length - Math.PI / 2;
            const isSelected = selectedBranch === branchIndex;

            return branch.children?.map((child, childIndex) => {
              const childAngle = angle + (childIndex - (branch.children.length - 1) / 2) * 0.3;
              const childRadius = branchRadius + 120;
              const childX = centerX + childRadius * Math.cos(childAngle);
              const childY = centerY + childRadius * Math.sin(childAngle);

              return (
                <g
                  key={`${branchIndex}-${childIndex}`}
                  className="child-node"
                  opacity={isSelected ? 1 : 0.3}
                >
                  <circle
                    cx={childX}
                    cy={childY}
                    r="30"
                    fill="#bfdbfe"
                    stroke="#93c5fd"
                    strokeWidth="1.5"
                  />
                  <text
                    x={childX}
                    y={childY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#1e3a8a"
                    fontSize="11"
                    fontWeight="500"
                  >
                    {child?.length > 12 ? child.substring(0, 12) + '...' : child}
                  </text>
                </g>
              );
            });
          })}
        </svg>
      </div>

      {selectedBranch !== null && (
        <div className="branch-details">
          <h3>{branches[selectedBranch]?.label}</h3>
          <ul>
            {branches[selectedBranch]?.children?.map((child, index) => (
              <li key={index}>{child}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MindMapTab;
