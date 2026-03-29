import React, { useState } from 'react';
import { useAppContext } from '../App';
import { X, Key } from 'lucide-react';
import { toast } from 'sonner';
import './ApiKeyModal.css';

const ApiKeyModal = () => {
  const { showApiKeyModal, setShowApiKeyModal, apiKey, saveApiKey } = useAppContext();
  const [inputKey, setInputKey] = useState(apiKey);

  if (!showApiKeyModal) return null;

  const handleSave = () => {
    if (inputKey.trim()) {
      saveApiKey(inputKey.trim());
      toast.success('API key saved successfully');
    } else {
      toast.error('Please enter a valid API key');
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setShowApiKeyModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrapper">
            <Key size={24} className="modal-icon" />
            <h2 className="modal-title">Gemini API Key</h2>
          </div>
          <button
            className="close-btn"
            onClick={() => setShowApiKeyModal(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            To use StudyTime AI, you need a Google Gemini API key. You can get one for free from:
          </p>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="api-link"
          >
            Google AI Studio →
          </a>

          <div className="input-group">
            <label className="input-label">API Key:</label>
            <div className="input-wrapper">
              <input
                type="password"
                className="api-key-input"
                placeholder="Enter your Gemini API key"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
              />
              {inputKey && (
                <button
                  className="clear-btn"
                  onClick={() => setInputKey('')}
                  title="Clear API key"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <p className="input-note">Use only Gemini 2.5 Flash key for best results (model: gemini-2.5-flash).</p>
          </div>

          <button
            className="save-btn"
            onClick={handleSave}
          >
            Save API Key
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
