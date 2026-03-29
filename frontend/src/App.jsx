import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';
import UploadTab from './components/UploadTab';
import SummaryTab from './components/SummaryTab';
import MindMapTab from './components/MindMapTab';
import ChatTab from './components/ChatTab';
import QuizTab from './components/QuizTab';
import ApiKeyModal from './components/ApiKeyModal';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

const MainApp = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [sessions, setSessions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('study_sessions') || '[]');
    } catch {
      return [];
    }
  });
  const [selectedSessionId, setSelectedSessionId] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('study_sessions') || '[]');
    return saved.length > 0 ? saved[0].id : null;
  });
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
    setShowApiKeyModal(false);
  };

  const selectedSession = sessions.find((session) => session.id === selectedSessionId) || null;

  const addSession = (session) => {
    const id = session.id || `session_${Date.now()}`;
    const completeSession = { ...session, id, createdAt: new Date().toISOString() };
    setSessions((prev) => [completeSession, ...prev]);
    setSelectedSessionId(id);
  };

  const updateSession = (id, updates) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteSession = (id) => {
    const nextSessions = sessions.filter((s) => s.id !== id);
    setSessions(nextSessions);
    if (selectedSessionId === id) {
      setSelectedSessionId(nextSessions.length > 0 ? nextSessions[0].id : null);
      setActiveTab('upload');
    }
  };

  React.useEffect(() => {
    localStorage.setItem('study_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const contextValue = {
    activeTab,
    setActiveTab,
    apiKey,
    saveApiKey,
    studyData: selectedSession?.studyData || null,
    extractedText: selectedSession?.text || '',
    filename: selectedSession?.filename || '',
    sessionId: selectedSession?.id || null,
    sessions,
    selectedSessionId,
    setSelectedSessionId,
    addSession,
    updateSession,
    deleteSession,
    showApiKeyModal,
    setShowApiKeyModal
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          {activeTab === 'upload' && <UploadTab />}
          {activeTab === 'summary' && <SummaryTab />}
          {activeTab === 'mindmap' && <MindMapTab />}
          {activeTab === 'chat' && <ChatTab />}
          {activeTab === 'quiz' && <QuizTab />}
        </main>
        <ApiKeyModal />
      </div>
    </AppContext.Provider>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<MainApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
