import React, { useState, useEffect } from 'react';
import './GameStyles.css';

const PuzzleGame = ({ game, onComplete, onExit }) => {
  const [pieces, setPieces] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(game.timeLimit);

  const gridSize = Math.sqrt(game.content?.pieces || 9);
  const pieceSize = 100 / gridSize;

  useEffect(() => {
    const totalPieces = game.content?.pieces || 9;
    const newPieces = Array.from({ length: totalPieces }, (_, i) => ({ id: i, currentPosition: i, correctPosition: i }));
    setPieces(shuffleArray(newPieces));
  }, []);

  useEffect(() => {
    if (game.timeLimit > 0 && !isPuzzleComplete()) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            const correctPieces = pieces.filter(p => p.currentPosition === p.correctPosition).length;
            onComplete(Math.round((correctPieces / pieces.length) * game.points));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [pieces]);

  useEffect(() => {
    if (pieces.length > 0 && isPuzzleComplete()) {
      const baseScore = game.points;
      const movesPenalty = Math.max(0, (moves - pieces.length) * 3);
      setTimeout(() => onComplete(Math.max(baseScore * 0.5, baseScore - movesPenalty)), 1000);
    }
  }, [pieces]);

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      newArray[i].currentPosition = i;
      newArray[j].currentPosition = j;
    }
    return newArray;
  };

  const isPuzzleComplete = () => pieces.every(piece => piece.currentPosition === piece.correctPosition);

  const handlePieceClick = (index) => {
    if (selectedPiece === null) {
      setSelectedPiece(index);
    } else {
      if (selectedPiece !== index) {
        const newPieces = [...pieces];
        [newPieces[selectedPiece], newPieces[index]] = [newPieces[index], newPieces[selectedPiece]];
        newPieces[selectedPiece].currentPosition = selectedPiece;
        newPieces[index].currentPosition = index;
        setPieces(newPieces);
        setMoves(moves + 1);
      }
      setSelectedPiece(null);
    }
  };

  if (!game.content?.image) return <div className="game-card"><div className="game-error">Imagem do puzzle não configurada.</div></div>;

  return (
    <div className="game-card">
      <div className="game-header">
        <div className="puzzle-stats">
          <div className="stat-item"><span className="stat-icon">🎯</span><span>{moves} movimentos</span></div>
          <div className="stat-item"><span className="stat-icon">✓</span><span>{pieces.filter(p => p.currentPosition === p.correctPosition).length}/{pieces.length} peças</span></div>
        </div>
        {game.timeLimit > 0 && <div className={`game-timer ${timeLeft <= 10 ? 'timer-warning' : ''}`}>⏱️ {timeLeft}s</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gridTemplateRows: `repeat(${gridSize}, 1fr)`, gap: '0.5rem', background: 'var(--game-border)', padding: '0.5rem', borderRadius: '1rem', aspectRatio: '1' }}>
          {pieces.map((piece, index) => {
            const row = Math.floor(piece.id / gridSize);
            const col = piece.id % gridSize;
            return (
              <div key={index} onClick={() => handlePieceClick(index)} style={{ backgroundImage: `url(${game.content.image})`, backgroundPosition: `${col * pieceSize}% ${row * pieceSize}%`, backgroundSize: `${gridSize * 100}%`, border: `${selectedPiece === index ? '3px' : '2px'} solid ${piece.currentPosition === piece.correctPosition ? 'var(--game-green)' : selectedPiece === index ? 'var(--game-primary)' : 'var(--game-border)'}`, borderRadius: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}>
                {piece.currentPosition === piece.correctPosition && <div style={{ position: 'absolute', top: '4px', right: '4px', background: 'var(--game-green)', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>✓</div>}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--game-text)' }}>Imagem Original</h4>
          <img src={game.content.image} alt="Preview" style={{ width: '100%', borderRadius: '1rem', border: '2px solid var(--game-border)' }} />
        </div>
      </div>

      <div className="game-actions"><button className="btn btn-outline" onClick={onExit}>Sair</button></div>
    </div>
  );
};

export default PuzzleGame;
