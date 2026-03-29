import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { Settings, Home } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const {
    activeTab,
    setActiveTab,
    studyData,
    sessions,
    selectedSessionId,
    setSelectedSessionId,
    deleteSession,
    setShowApiKeyModal
  } = useAppContext();

  const hasData = !!studyData;
  const tabs = [
    { id: 'upload', label: 'Upload', icon: '📤' },
    { id: 'summary', label: 'Summary', icon: '📋', disabled: !hasData },
    { id: 'mindmap', label: 'Mind Map', icon: '🗺️', disabled: !hasData },
    { id: 'chat', label: 'Chat', icon: '💬', disabled: !hasData },
    { id: 'quiz', label: 'Quiz', icon: '🧩', disabled: !hasData }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <button 
            className="home-button"
            onClick={() => navigate('/')}
            title="Back to Home"
          >
            <Home size={20} />
          </button>
          <div>
            <h1 className="brand-title">StudyTime AI</h1>
            <p className="brand-tagline">Upload. Understand. Master.</p>
          </div>
        </div>
        
        <div className="navbar-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="session-controls">
          <select
            className="session-select"
            value={selectedSessionId || ''}
            onChange={(e) => setSelectedSessionId(e.target.value)}
          >
            <option value="" disabled>
              Select session
            </option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.filename || session.title || 'Untitled'}
              </option>
            ))}
          </select>
          <button
            className="delete-session-btn"
            onClick={() => deleteSession(selectedSessionId)}
            disabled={!selectedSessionId}
            title="Delete selected session"
          >
            ✕
          </button>
        </div>

        <button 
          className="settings-button"
          onClick={() => setShowApiKeyModal(true)}
          title="API Settings"
        >
          <Settings size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
