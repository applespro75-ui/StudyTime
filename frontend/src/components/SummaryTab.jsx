import React, { useState } from 'react';
import { useAppContext } from '../App';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './SummaryTab.css';

const SummaryTab = () => {
  const { studyData } = useAppContext();
  const [expandedTopics, setExpandedTopics] = useState({});

  if (!studyData) {
    return (
      <div className="empty-state">
        <p>No study material analyzed yet. Please upload a file first.</p>
      </div>
    );
  }

  const toggleTopic = (index) => {
    setExpandedTopics(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="summary-tab tab-content">
      <div className="summary-header">
        <h2 className="summary-title">{studyData.title}</h2>
        <p className="summary-subtitle">{studyData.topics?.length || 0} topics identified</p>
      </div>

      <div className="topics-container">
        {studyData.topics?.map((topic, index) => (
          <div
            key={index}
            className={`topic-card ${expandedTopics[index] ? 'expanded' : ''}`}
          >
            <div
              className="topic-header"
              onClick={() => toggleTopic(index)}
            >
              <h3 className="topic-name">{topic.name}</h3>
              <button className="expand-btn">
                {expandedTopics[index] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            {expandedTopics[index] && (
              <div className="topic-content">
                <p className="topic-summary">{topic.summary}</p>
                <div className="key-points">
                  <h4 className="key-points-title">Key Points:</h4>
                  <ul className="key-points-list">
                    {topic.keyPoints?.map((point, pointIndex) => (
                      <li key={pointIndex} className="key-point">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummaryTab;
