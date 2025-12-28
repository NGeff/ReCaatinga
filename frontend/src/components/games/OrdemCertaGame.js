import React, { useState, useEffect } from 'react';
import './GameStyles.css';

const OrdemCertaGame = ({ game, onComplete, onExit }) => {
  const [items, setItems] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(game.timeLimit);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (game.timeLimit > 0 && !isCorrect) {
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
  }, [isCorrect]);

  const initializeGame = () => {
    const itemsList = game.content?.items || [];
    if (itemsList.length === 0) return;
    const shuffled = [...itemsList].sort(() => Math.random() - 0.5);
    setItems(shuffled.map((item, index) => ({ ...item, currentPosition: index })));
  };

  const handleTimeUp = () => {
    onComplete(0);
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    
    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);
    
    setItems(newItems.map((item, index) => ({ ...item, currentPosition: index })));
    setDraggedIndex(null);
  };

  const checkOrder = () => {
    setAttempts(attempts + 1);
    const correct = items.every((item, index) => item.correctPosition === index);
    
    if (correct) {
      setIsCorrect(true);
      const attemptPenalty = Math.max(0, (attempts - 1) * 2);
      const finalScore = Math.max(0, game.points - attemptPenalty);
      setTimeout(() => onComplete(finalScore), 1500);
    }
  };

  if (items.length === 0) return <div className="game-card"><div className="game-error">Nenhum item disponível.</div></div>;

  return (
    <div className="game-card">
      <div className="game-header">
        <div className="memory-stats">
          <div className="stat-item"><span className="stat-icon">🔄</span><span>{attempts} tentativas</span></div>
          <div className="stat-item"><span className="stat-icon">📋</span><span>{items.length} itens</span></div>
        </div>
        {game.timeLimit > 0 && <div className={`game-timer ${timeLeft <= 10 ? 'timer-warning' : ''}`}>⏱️ {timeLeft}s</div>}
      </div>

      <div className="question-container">
        <div className="question-text" style={{ marginBottom: '1.5rem' }}>
          {game.content?.instruction || 'Arraste os itens para a ordem correta'}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {items.map((item, index) => (
            <div
              key={index}
              draggable={!isCorrect}
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.25rem 1.5rem',
                background: isCorrect && item.correctPosition === index 
                  ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'
                  : 'linear-gradient(135deg, rgba(249, 250, 251, 0.9) 0%, rgba(243, 244, 246, 0.7) 100%)',
                backdropFilter: 'blur(8px)',
                border: '2px solid',
                borderColor: isCorrect && item.correctPosition === index ? 'var(--game-green)' : 'rgba(229, 231, 235, 0.7)',
                borderRadius: '1.25rem',
                cursor: isCorrect ? 'default' : 'move',
                transition: 'all 0.3s ease',
                boxShadow: draggedIndex === index ? '0 12px 32px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.1)',
                transform: draggedIndex === index ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                background: 'white',
                border: '2px solid var(--game-border)',
                borderRadius: '0.75rem',
                fontWeight: '700',
                color: 'var(--game-primary)',
                fontSize: '1.125rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                flexShrink: 0
              }}>
                {index + 1}
              </div>
              
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {item.image && (
                  <img src={item.image} alt={item.text} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                )}
                <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--game-text)' }}>{item.text}</span>
              </div>
              
              <div style={{ fontSize: '1.5rem', color: 'var(--game-text-light)' }}>⋮⋮</div>
            </div>
          ))}
        </div>
      </div>

      <div className="game-actions">
        <button className="btn btn-outline" onClick={onExit}>Sair</button>
        {!isCorrect && (
          <button className="btn btn-primary" onClick={checkOrder}>Verificar Ordem</button>
        )}
      </div>
    </div>
  );
};

export default OrdemCertaGame;
