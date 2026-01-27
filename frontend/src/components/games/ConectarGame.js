import React, { useState, useEffect } from 'react';
import './GameStyles.css';

const ConectarGame = ({ game, onComplete, onExit }) => {
  const [connections, setConnections] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [timeLeft, setTimeLeft] = useState(game.timeLimit);
  const [mistakes, setMistakes] = useState(0);

  const leftItems = game.content?.leftItems || [];
  const rightItems = game.content?.rightItems || [];
  const correctConnections = game.content?.connections || [];

  useEffect(() => {
    if (game.timeLimit > 0 && connections.length < correctConnections.length) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            onComplete(Math.round((connections.length / correctConnections.length) * game.points));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [connections]);

  useEffect(() => {
    if (connections.length === correctConnections.length && correctConnections.length > 0) {
      const baseScore = game.points;
      const mistakesPenalty = mistakes * 3;
      setTimeout(() => onComplete(Math.max(baseScore * 0.5, baseScore - mistakesPenalty)), 1000);
    }
  }, [connections]);

  const handleLeftClick = (index) => {
    if (connections.some(c => c.left === index)) return;
    if (selectedLeft === index) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(index);
      if (selectedRight !== null) checkConnection(index, selectedRight);
    }
  };

  const handleRightClick = (index) => {
    if (connections.some(c => c.right === index)) return;
    if (selectedRight === index) {
      setSelectedRight(null);
    } else {
      setSelectedRight(index);
      if (selectedLeft !== null) checkConnection(selectedLeft, index);
    }
  };

  const checkConnection = (left, right) => {
    const isCorrect = correctConnections.some(c => c.left === left && c.right === right);
    if (isCorrect) {
      setConnections([...connections, { left, right, correct: true }]);
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      setMistakes(mistakes + 1);
      setConnections([...connections, { left, right, correct: false }]);
      setTimeout(() => {
        setConnections(connections.filter(c => c.correct));
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 1000);
    }
  };

  if (leftItems.length === 0 || rightItems.length === 0) return <div className="game-card"><div className="game-error">Itens não configurados.</div></div>;

  return (
    <div className="game-card">
      <div className="game-header">
        <div className="conectar-stats">
          <div className="stat-item"><span className="stat-icon">✓</span><span>{connections.length}/{correctConnections.length} conexões</span></div>
          <div className="stat-item"><span className="stat-icon">✕</span><span>{mistakes} erros</span></div>
        </div>
        {game.timeLimit > 0 && <div className={`game-timer ${timeLeft <= 10 ? 'timer-warning' : ''}`}>⏱️ {timeLeft}s</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '2rem', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--game-text)', textAlign: 'center', marginBottom: '0.5rem' }}>Imagens</h3>
          {leftItems.map((item, index) => {
            const isConnected = connections.some(c => c.left === index);
            const isSelected = selectedLeft === index;
            return (
              <div key={index} onClick={() => handleLeftClick(index)} style={{ padding: '1.25rem', background: isConnected ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' : isSelected ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : 'linear-gradient(135deg, rgba(249, 250, 251, 0.9) 0%, rgba(243, 244, 246, 0.7) 100%)', backdropFilter: 'blur(8px)', border: `${isSelected ? '3px' : '2px'} solid ${isConnected ? 'var(--game-green)' : isSelected ? 'var(--game-primary)' : 'rgba(229, 231, 235, 0.7)'}`, borderRadius: '1rem', cursor: isConnected ? 'not-allowed' : 'pointer', transition: 'all 0.2s', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80px' }}>
                {item.type === 'image' ? <img src={item.content} alt={item.label} style={{ maxWidth: '100%', maxHeight: '60px', objectFit: 'contain' }} /> : <span>{item.content}</span>}
              </div>
            );
          })}
        </div>

        <div style={{ position: 'relative', width: '100px' }}>
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
            {connections.map((conn, index) => {
              const leftEl = document.querySelector(`.game-card .conectar-item:nth-child(${conn.left + 2})`);
              const rightEl = document.querySelector(`.game-card .conectar-item:nth-child(${conn.right + 2})`);
              if (!leftEl || !rightEl) return null;
              const leftRect = leftEl.getBoundingClientRect();
              const rightRect = rightEl.getBoundingClientRect();
              const containerRect = leftEl.closest('div').getBoundingClientRect();
              const x1 = leftRect.right - containerRect.left;
              const y1 = leftRect.top + leftRect.height / 2 - containerRect.top;
              const x2 = rightRect.left - containerRect.left;
              const y2 = rightRect.top + rightRect.height / 2 - containerRect.top;
              return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke={conn.correct ? '#10b981' : '#ef4444'} strokeWidth="3" style={{ transition: 'all 0.3s' }} />;
            })}
          </svg>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--game-text)', textAlign: 'center', marginBottom: '0.5rem' }}>Nomes</h3>
          {rightItems.map((item, index) => {
            const isConnected = connections.some(c => c.right === index);
            const isSelected = selectedRight === index;
            return (
              <div key={index} onClick={() => handleRightClick(index)} style={{ padding: '1.25rem', background: isConnected ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' : isSelected ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : 'linear-gradient(135deg, rgba(249, 250, 251, 0.9) 0%, rgba(243, 244, 246, 0.7) 100%)', backdropFilter: 'blur(8px)', border: `${isSelected ? '3px' : '2px'} solid ${isConnected ? 'var(--game-green)' : isSelected ? 'var(--game-primary)' : 'rgba(229, 231, 235, 0.7)'}`, borderRadius: '1rem', cursor: isConnected ? 'not-allowed' : 'pointer', transition: 'all 0.2s', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80px' }}>
                <span>{item.content}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="game-actions"><button className="btn btn-outline" onClick={onExit}>Sair</button></div>
    </div>
  );
};

export default ConectarGame;
