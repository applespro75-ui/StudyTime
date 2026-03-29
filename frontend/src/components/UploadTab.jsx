import React, { useState } from 'react';
import { useAppContext } from '../App';
import { Upload, FileText, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import './UploadTab.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const UploadTab = () => {
  const {
    apiKey,
    sessions,
    selectedSessionId,
    setSelectedSessionId,
    addSession,
    setActiveTab,
    setShowApiKeyModal
  } = useAppContext();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pastedText, setPastedText] = useState('');

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setPastedText('');
    } else {
      toast.error('Please upload a PDF file');
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setPastedText('');
    } else {
      toast.error('Please select a PDF file');
    }
  };

  const handleAnalyze = async () => {
    if (!apiKey) {
      toast.error('Please set your Gemini API key first');
      setShowApiKeyModal(true);
      return;
    }

    let textToAnalyze = '';
    let fileName = '';

    try {
      setIsAnalyzing(true);

      if (file) {
        // Upload PDF to backend for text extraction
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await axios.post(`${BACKEND_URL}/api/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (!uploadResponse.data.success) {
          throw new Error('Failed to extract text from PDF');
        }

        textToAnalyze = uploadResponse.data.text;
        fileName = uploadResponse.data.filename;
        setPageCount(uploadResponse.data.page_count);
      } else if (pastedText.trim()) {
        textToAnalyze = pastedText.trim();
        fileName = 'Pasted Notes';
      } else {
        toast.error('Please upload a PDF or paste some text');
        return;
      }

      // Analyze with Gemini
      const analyzeResponse = await axios.post(`${BACKEND_URL}/api/analyze`, {
        text: textToAnalyze,
        api_key: apiKey
      });

      if (!analyzeResponse.data.success) {
        throw new Error('Failed to analyze content');
      }

      const newSession = {
        title: fileName,
        filename: fileName,
        text: textToAnalyze,
        studyData: analyzeResponse.data.data
      };

      addSession(newSession);
      setSelectedSessionId(newSession.id);
      toast.success('Analysis complete!');
      setActiveTab('summary');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error.response?.data?.detail || error.message || 'Failed to analyze content');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="upload-tab tab-content">
      <div className="upload-header">
        <h2 className="upload-title">Upload Your Study Material</h2>
        <p className="upload-subtitle">Upload a PDF or paste your lecture notes to get started</p>
      </div>

      {sessions.length > 0 && (
        <div className="session-selector">
          <label htmlFor="sessionSelect">Active Session:</label>
          <select
            id="sessionSelect"
            value={selectedSessionId || ''}
            onChange={(e) => setSelectedSessionId(e.target.value)}
          >
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.filename || session.title || `Session ${session.id}`}
              </option>
            ))}
          </select>
        </div>
      )}


      <div className="upload-content">
        <div
          className={`dropzone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="file-info">
              <FileText size={48} className="file-icon" />
              <p className="file-name">{file.name}</p>
              <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <button
                className="remove-file-btn"
                onClick={() => setFile(null)}
              >
                Remove
              </button>
            </div>
          ) : (
            <>
              <Upload size={48} className="upload-icon" />
              <p className="dropzone-text">Drag and drop your PDF here</p>
              <p className="dropzone-subtext">or</p>
              <label className="file-input-label">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  className="file-input"
                />
                Browse Files
              </label>
            </>
          )}
        </div>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="text-input-section">
          <label className="text-input-label">Paste your lecture notes:</label>
          <textarea
            className="text-input"
            placeholder="Paste your study material here..."
            rows={8}
            value={pastedText}
            onChange={(e) => {
              setPastedText(e.target.value);
              if (e.target.value.trim()) {
                setFile(null);
              }
            }}
          />
        </div>

        <button
          className="analyze-btn"
          onClick={handleAnalyze}
          disabled={(!file && !pastedText.trim()) || isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={20} className="loading" />
              Analyzing with AI...
            </>
          ) : (
            'Analyze with AI'
          )}
        </button>
      </div>
    </div>
  );
};

export default UploadTab;
