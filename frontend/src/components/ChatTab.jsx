import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../App';
import { Send, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import './ChatTab.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const ChatTab = () => {
  const { apiKey, sessionId, extractedText, setShowApiKeyModal } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load chat history
    const loadHistory = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/chat/${sessionId}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    if (sessionId) {
      loadHistory();
    }
  }, [sessionId]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    if (!apiKey) {
      toast.error('Please set your Gemini API key first');
      setShowApiKeyModal(true);
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      session_id: sessionId,
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/chat`, {
        message: inputMessage,
        session_id: sessionId,
        api_key: apiKey,
        study_material: extractedText
      });

      if (response.data.success) {
        const assistantMessage = {
          id: `assistant-${Date.now()}`,
          session_id: sessionId,
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        toast.error('Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error(error.response?.data?.detail || 'Failed to send message');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-tab tab-content">
      <div className="chat-header">
        <h2 className="chat-title">Ask Questions</h2>
        <p className="chat-subtitle">Chat with AI about your study material</p>
      </div>

      <div className="chat-container">
        <div className="messages-area">
          {messages.length === 0 ? (
            <div className="empty-chat">
              <p>Start a conversation by asking a question about your study material.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.role}`}
              >
                <div className="message-content">
                  {msg.content}
                </div>
              </div>
            ))
          )}

          {isTyping && (
            <div className="message assistant">
              <div className="message-content typing-indicator">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <input
            type="text"
            className="chat-input"
            placeholder="Ask a question about your study material..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping}
          />
          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
          >
            {isTyping ? <Loader2 size={20} className="loading" /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatTab;
