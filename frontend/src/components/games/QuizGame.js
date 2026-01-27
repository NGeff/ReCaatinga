import React, { useState, useEffect } from 'react';
import './GameStyles.css';

const QuizGame = ({ game, onComplete, onExit }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(game.timeLimit);
  const [answered, setAnswered] = useState(false);

  const questions = game.content?.questions || [];

  useEffect(() => {
    if (game.timeLimit > 0 && !showResult) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentQuestion, showResult]);

  const handleTimeUp = () => {
    setShowResult(true);
    const finalScore = Math.round((score / questions.length) * game.points);
    onComplete(finalScore);
  };

  const handleAnswerSelect = (index) => {
    if (answered) return;
    setSelectedAnswer(index);
  };

  const handleConfirm = () => {
    if (selectedAnswer === null || answered) return;

    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    if (isCorrect) setScore(score + 1);
    setAnswered(true);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setAnswered(false);
      } else {
        setShowResult(true);
        const finalScore = Math.round(((score + (isCorrect ? 1 : 0)) / questions.length) * game.points);
        onComplete(finalScore);
      }
    }, 1500);
  };

  if (questions.length === 0) {
    return (
      <div className="game-card">
        <div className="game-error">Nenhuma pergunta disponível para este jogo.</div>
      </div>
    );
  }

  if (showResult) {
    const finalScore = Math.round((score / questions.length) * game.points);
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="game-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>
          {percentage >= 70 ? '🎉' : '😔'}
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--game-text)', marginBottom: '0.75rem' }}>
          {percentage >= 70 ? 'Parabéns!' : 'Quase lá!'}
        </h2>
        <p style={{ fontSize: '1.125rem', color: 'var(--game-text-light)', marginBottom: '2rem' }}>
          {percentage >= 70 ? 'Você completou o jogo com sucesso!' : 'Continue praticando para melhorar!'}
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(249, 250, 251, 0.8) 0%, rgba(243, 244, 246, 0.6) 100%)', borderRadius: '1rem', border: '2px solid var(--game-border)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--game-primary)' }}>{score}/{questions.length}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--game-text-light)', fontWeight: 600, marginTop: '0.5rem' }}>Acertos</div>
          </div>
          <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(249, 250, 251, 0.8) 0%, rgba(243, 244, 246, 0.6) 100%)', borderRadius: '1rem', border: '2px solid var(--game-border)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--game-primary)' }}>{percentage}%</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--game-text-light)', fontWeight: 600, marginTop: '0.5rem' }}>Aproveitamento</div>
          </div>
          <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(249, 250, 251, 0.8) 0%, rgba(243, 244, 246, 0.6) 100%)', borderRadius: '1rem', border: '2px solid var(--game-border)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--game-primary)' }}>{finalScore}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--game-text-light)', fontWeight: 600, marginTop: '0.5rem' }}>Pontos</div>
          </div>
        </div>

        <button onClick={onExit} className="btn btn-primary">
          Continuar
        </button>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="game-card">
      <div className="game-header">
        <div className="game-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-text">
            Pergunta {currentQuestion + 1} de {questions.length}
          </span>
        </div>
        
        {game.timeLimit > 0 && (
          <div className={`game-timer ${timeLeft <= 10 ? 'timer-warning' : ''}`}>
            ⏱️ {timeLeft}s
          </div>
        )}
      </div>

      <div className="question-container">
        <h2 className="question-text">{question.question}</h2>
        
        <div className="options-grid">
          {question.options.map((option, index) => {
            let className = 'option-button';
            
            if (answered) {
              if (index === question.correctAnswer) className += ' correct';
              else if (index === selectedAnswer) className += ' incorrect';
            } else if (selectedAnswer === index) {
              className += ' selected';
            }

            return (
              <button
                key={index}
                className={className}
                onClick={() => handleAnswerSelect(index)}
                disabled={answered}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="option-text">{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="game-actions">
        <button className="btn btn-outline" onClick={onExit}>
          Sair
        </button>
        <button 
          className="btn btn-primary"
          onClick={handleConfirm}
          disabled={selectedAnswer === null || answered}
        >
          Confirmar
        </button>
      </div>
    </div>
  );
};

export default QuizGame;
