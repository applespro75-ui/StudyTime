import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Brain, MessageSquare, Target, BookOpen, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Upload size={32} />,
      title: 'Smart Upload',
      description: 'Upload PDFs or paste lecture notes for instant AI-powered analysis'
    },
    {
      icon: <BookOpen size={32} />,
      title: 'AI Summaries',
      description: 'Get structured topic summaries with key points automatically generated'
    },
    {
      icon: <Brain size={32} />,
      title: 'Mind Maps',
      description: 'Visualize complex concepts and their relationships interactively'
    },
    {
      icon: <MessageSquare size={32} />,
      title: 'Study Chat',
      description: 'Ask questions about your material and get instant AI responses'
    },
    {
      icon: <Target size={32} />,
      title: 'Adaptive Quiz',
      description: 'Test your knowledge with difficulty-adjusting questions'
    },
    {
      icon: <Sparkles size={32} />,
      title: 'Progress Tracking',
      description: 'Monitor your learning with scores, streaks, and weak topic detection'
    }
  ];

  const steps = [
    { number: '1', title: 'Upload', description: 'Upload your PDF or paste lecture notes' },
    { number: '2', title: 'Analyze', description: 'AI processes and structures your content' },
    { number: '3', title: 'Learn', description: 'Explore summaries, maps, chat, and quizzes' },
    { number: '4', title: 'Master', description: 'Track progress and ace your exams' }
  ];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav-container">
          <div className="landing-brand">
            <h1 className="landing-brand-title">StudyTime AI</h1>
          </div>
          <button 
            className="nav-cta-btn"
            onClick={() => navigate('/app')}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Powered by Google Gemini AI</span>
          </div>
          <h1 className="hero-title">
            Transform Your Study Notes Into
            <span className="hero-highlight">   Interactive Learning</span>
          </h1>
          <p className="hero-subtitle">
            Upload. Understand. Master. StudyTime AI uses advanced AI to turn your PDFs and lecture notes 
            into summaries, mind maps, interactive chats, and adaptive quizzes.
          </p>
          <div className="hero-cta">
            <button 
              className="primary-cta-btn"
              onClick={() => navigate('/app')}
            >
              Start Learning Free
              <ArrowRight size={20} />
            </button>
          </div>
          <div className="hero-features">
            <div className="hero-feature-item">
              <CheckCircle size={18} />
              <span>No credit card required</span>
            </div>
            <div className="hero-feature-item">
              <CheckCircle size={18} />
              <span>BYOK (Bring Your Own Key) + self-learn</span>
            </div>
            <div className="hero-feature-item">
              <CheckCircle size={18} />
              <span>Unlimited study sessions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Everything You Need to Excel</h2>
          <p className="section-subtitle">Powerful AI tools designed for modern learners</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section">
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">From upload to mastery in 4 simple steps</p>
        </div>
        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={index} className="step-card">
              <div className="step-number">{step.number}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
              {index < steps.length - 1 && <div className="step-connector" />}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Transform Your Study Routine?</h2>
          <p className="cta-subtitle">Join thousands of students learning smarter with AI</p>
          <button 
            className="cta-button"
            onClick={() => navigate('/app')}
          >
            Get Started Now
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>StudyTime AI</h3>
            <p>Learn smarter, not harder</p>
          </div>
          <div className="footer-links">
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
              Get Gemini API Key
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 StudyTime AI. Made with ❤️ for learners everywhere.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
