import React, { useState, useEffect } from 'react';
import './GameStyles.css';

const CacaPalavrasGame = ({ game, onComplete, onExit }) => {
  const [grid, setGrid] = useState([]);
  const [wordsToFind, setWordsToFind] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(game.timeLimit);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (game.timeLimit > 0 && foundWords.length < wordsToFind.length) {
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
  }, [foundWords]);

  useEffect(() => {
    if (foundWords.length === wordsToFind.length && wordsToFind.length > 0) {
      handleGameComplete();
    }
  }, [foundWords]);

  const initializeGame = () => {
    const { grid: gameGrid, words } = game.content || {};
    if (!gameGrid || !words) return;
    setGrid(gameGrid);
    setWordsToFind(words);
  };

  const handleTimeUp = () => {
    const score = Math.round((foundWords.length / wordsToFind.length) * game.points);
    onComplete(score);
  };

  const handleGameComplete = () => {
    setTimeout(() => onComplete(game.points), 1000);
  };

  const handleMouseDown = (row, col) => {
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
  };

  const handleMouseEnter = (row, col) => {
    if (!isSelecting) return;
    const lastCell = selectedCells[selectedCells.length - 1];
    if (lastCell && (lastCell.row === row || lastCell.col === col || Math.abs(lastCell.row - row) === Math.abs(lastCell.col - col))) {
      setSelectedCells([...selectedCells, { row, col }]);
    }
  };

  const handleMouseUp = () => {
    if (selectedCells.length < 2) {
      setSelectedCells([]);
      setIsSelecting(false);
      return;
    }
    
    const selectedWord = selectedCells.map(cell => grid[cell.row][cell.col]).join('');
    const reversedWord = selectedWord.split('').reverse().join('');
    
    if (wordsToFind.includes(selectedWord) && !foundWords.includes(selectedWord)) {
      setFoundWords([...foundWords, selectedWord]);
    } else if (wordsToFind.includes(reversedWord) && !foundWords.includes(reversedWord)) {
      setFoundWords([...foundWords, reversedWord]);
    }
    
    setSelectedCells([]);
    setIsSelecting(false);
  };

  const isCellSelected = (row, col) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  if (!grid || grid.length === 0) return <div className="game-card"><div className="game-error">Nenhuma grade disponível.</div></div>;

  return (
    <div className="game-card">
      <div className="game-header">
        <div className="memory-stats">
          <div className="stat-item"><span className="stat-icon">🔍</span><span>{foundWords.length}/{wordsToFind.length} palavras</span></div>
        </div>
        {game.timeLimit > 0 && <div className={`game-timer ${timeLeft <= 10 ? 'timer-warning' : ''}`}>⏱️ {timeLeft}s</div>}
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ userSelect: 'none' }}>
          <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${grid[0]?.length || 10}, 1fr)`, gap: '0.25rem', background: 'white', padding: '1rem', borderRadius: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            {grid.map((row, rowIndex) => (
              row.map((letter, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                  onMouseUp={handleMouseUp}
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isCellSelected(rowIndex, colIndex) ? 'linear-gradient(135deg, var(--game-green) 0%, #10b981 100%)' : 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                    color: isCellSelected(rowIndex, colIndex) ? 'white' : 'var(--game-text)',
                    borderRadius: '0.5rem',
                    fontWeight: '700',
                    fontSize: '1.125rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: '2px solid',
                    borderColor: isCellSelected(rowIndex, colIndex) ? 'var(--game-green)' : 'var(--game-border)'
                  }}
                >
                  {letter}
                </div>
              ))
            ))}
          </div>
        </div>

        <div style={{ flex: '1', minWidth: '250px', maxWidth: '300px' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--game-text)', fontSize: '1.25rem' }}>Palavras para Encontrar:</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {wordsToFind.map((word, index) => (
              <div
                key={index}
                style={{
                  padding: '0.875rem 1.25rem',
                  background: foundWords.includes(word) ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' : 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  color: foundWords.includes(word) ? 'var(--game-green)' : 'var(--game-text)',
                  border: '2px solid',
                  borderColor: foundWords.includes(word) ? 'var(--game-green)' : 'var(--game-border)',
                  textDecoration: foundWords.includes(word) ? 'line-through' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {foundWords.includes(word) && <span style={{ fontSize: '1.25rem' }}>✓</span>}
                {word.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="game-actions" style={{ marginTop: '2rem' }}><button className="btn btn-outline" onClick={onExit}>Sair</button></div>
    </div>
  );
};

export default CacaPalavrasGame;
