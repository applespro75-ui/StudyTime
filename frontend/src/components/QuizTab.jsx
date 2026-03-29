import React, { useState, useEffect } from 'react';
import { useAppContext } from '../App';
import { ChevronRight, Award, RefreshCw } from 'lucide-react';
import './QuizTab.css';

const QuizTab = () => {
  const { studyData } = useAppContext();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [topicScores, setTopicScores] = useState({});
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (studyData?.quiz) {
      // Start with medium questions
      const mediumQuestions = studyData.quiz.filter(q => q.difficulty === 'medium');
      setQuizQuestions(mediumQuestions.slice(0, 1));
    }
  }, [studyData]);

  if (!studyData || !studyData.quiz) {
    return (
      <div className="empty-state">
        <p>No quiz questions available. Please upload and analyze a file first.</p>
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];

  const getNextQuestion = (wasCorrect) => {
    const allQuestions = studyData.quiz;
    let nextDifficulty;

    if (wasCorrect) {
      nextDifficulty = currentQuestion.difficulty === 'easy' ? 'medium' : 'hard';
    } else {
      nextDifficulty = currentQuestion.difficulty === 'hard' ? 'medium' : 'easy';
    }

    const availableQuestions = allQuestions.filter(
      q => q.difficulty === nextDifficulty && !quizQuestions.includes(q)
    );

    if (availableQuestions.length > 0) {
      return availableQuestions[0];
    } else {
      // Fallback to any difficulty
      const fallback = allQuestions.filter(q => !quizQuestions.includes(q));
      return fallback.length > 0 ? fallback[0] : null;
    }
  };

  const handleAnswerSelect = (option) => {
    if (isAnswered) return;

    setSelectedAnswer(option);
    setIsAnswered(true);

    const isCorrect = option === currentQuestion.answer;

    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
    } else {
      setStreak(0);
      // Track weak topics
      const topic = currentQuestion.topic || 'General';
      setTopicScores(prev => ({
        ...prev,
        [topic]: (prev[topic] || 0) + 1
      }));
    }
  };

  const handleNextQuestion = () => {
    const wasCorrect = selectedAnswer === currentQuestion.answer;
    const nextQuestion = getNextQuestion(wasCorrect);

    if (nextQuestion && quizQuestions.length < 10) {
      setQuizQuestions([...quizQuestions, nextQuestion]);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleRetryWeak = () => {
    const weakTopics = Object.keys(topicScores);
    const weakQuestions = studyData.quiz.filter(q => 
      weakTopics.includes(q.topic || 'General')
    ).slice(0, 5);

    if (weakQuestions.length > 0) {
      setQuizQuestions([weakQuestions[0]]);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setScore(0);
      setStreak(0);
      setIsComplete(false);
    }
  };

  const handleRestartQuiz = () => {
    const mediumQuestions = studyData.quiz.filter(q => q.difficulty === 'medium');
    setQuizQuestions(mediumQuestions.slice(0, 1));
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setTopicScores({});
    setIsComplete(false);
  };

  if (isComplete) {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    const weakTopicsList = Object.entries(topicScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return (
      <div className="quiz-tab tab-content">
        <div className="results-screen">
          <div className="results-header">
            <Award size={64} className="award-icon" />
            <h2 className="results-title">Quiz Complete!</h2>
          </div>

          <div className="results-stats">
            <div className="stat-card">
              <div className="stat-value">{percentage}%</div>
              <div className="stat-label">Score</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{score}/{quizQuestions.length}</div>
              <div className="stat-label">Correct</div>
            </div>
          </div>

          {weakTopicsList.length > 0 && (
            <div className="weak-topics">
              <h3 className="weak-topics-title">Topics to Review:</h3>
              <ul className="weak-topics-list">
                {weakTopicsList.map(([topic, errors]) => (
                  <li key={topic}>
                    {topic} ({errors} incorrect)
                  </li>
                ))}
              </ul>
              <button
                className="retry-weak-btn"
                onClick={handleRetryWeak}
              >
                Retry Weak Topics
              </button>
            </div>
          )}

          <button
            className="restart-btn"
            onClick={handleRestartQuiz}
          >
            <RefreshCw size={20} />
            Restart Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-tab tab-content">
      <div className="quiz-header">
        <h2 className="quiz-title">Adaptive Quiz</h2>
        <div className="quiz-stats">
          <div className="stat">
            <span className="stat-label">Score:</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Streak:</span>
            <span className="stat-value">{streak}🔥</span>
          </div>
        </div>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${((currentQuestionIndex + 1) / 10) * 100}%` }}
        />
        <span className="progress-text">
          Question {currentQuestionIndex + 1} of 10
        </span>
      </div>

      <div className="question-card">
        <div className="question-header">
          <span className={`difficulty-badge ${currentQuestion?.difficulty}`}>
            {currentQuestion?.difficulty}
          </span>
        </div>

        <h3 className="question-text">{currentQuestion?.question}</h3>

        <div className="options-container">
          {currentQuestion?.options?.map((option, index) => {
            let optionClass = 'option';
            if (isAnswered) {
              if (option === currentQuestion.answer) {
                optionClass += ' correct';
              } else if (option === selectedAnswer) {
                optionClass += ' incorrect';
              }
            } else if (option === selectedAnswer) {
              optionClass += ' selected';
            }

            return (
              <button
                key={index}
                className={optionClass}
                onClick={() => handleAnswerSelect(option)}
                disabled={isAnswered}
              >
                {option}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <button
            className="next-btn"
            onClick={handleNextQuestion}
          >
            {quizQuestions.length >= 10 ? 'See Results' : 'Next Question'}
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizTab;
