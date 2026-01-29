import React, { useState, useEffect } from 'react';
import './GameStyles.css';

const ConexoGame = ({ game, onComplete, onExit }) => {
  const [selectedWords, setSelectedWords] = useState([]);
  const [foundGroups, setFoundGroups] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(game.timeLimit);
  const [allWords, setAllWords] = useState([]);
  const [shake, setShake] = useState(false);

  const maxMistakes = 4;
  const groups = game.content?.groups || [];
  const groupColors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

  useEffect(() => {
    const words = [];
    groups.forEach(group => {
      group.words.forEach(word => words.push({ text: word, groupIndex: groups.indexOf(group) }));
    });
    setAllWords(shuffleArray(words));
  }, []);

  useEffect(() => {
    if (game.timeLimit > 0 && foundGroups.length < groups.length) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            onComplete(Math.round((foundGroups.length / groups.length) * game.points));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [foundGroups]);

  useEffect(() => {
    if (foundGroups.length === groups.length && groups.length > 0) {
      const baseScore = game.points;
      const mistakesPenalty = mistakes * 5;
      setTimeout(() => onComplete(Math.max(baseScore * 0.5, baseScore - mistakesPenalty)), 1000);
    }
  }, [foundGroups]);

  useEffect(() => {
    if (mistakes >= maxMistakes) onComplete(Math.round((foundGroups.length / groups.length) * game.points));
  }, [mistakes]);

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleWordClick = (word) => {
    if (foundGroups.some(g => g.words.includes(word.text))) return;
    if (selectedWords.find(w => w.text === word.text)) {
      setSelectedWords(selectedWords.filter(w => w.text !== word.text));
    } else if (selectedWords.length < 4) {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleSubmit = () => {
    if (selectedWords.length !== 4) return;
    const groupIndex = selectedWords[0].groupIndex;
    const allSameGroup = selectedWords.every(w => w.groupIndex === groupIndex);
    if (allSameGroup) {
      const group = groups[groupIndex];
      setFoundGroups([...foundGroups, { ...group, color: groupColors[foundGroups.length] }]);
      setAllWords(allWords.filter(w => !selectedWords.some(sw => sw.text === w.text)));
      setSelectedWords([]);
    } else {
      setMistakes(mistakes + 1);
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setSelectedWords([]);
      }, 500);
    }
  };

  if (groups.length === 0) {
    return (
      <div className="game-card">
        <div className="game-error">Nenhum grupo disponível.</div>
      </div>
    );
  }

  return (
    <div className="game-card conexo-game">
      <div className="game-header">
        <div className="conexo-stats">
          <div className="stat-item">
            <span>Grupos: {foundGroups.length}/{groups.length}</span>
          </div>
          <div className="mistakes-dots">
            {Array.from({ length: maxMistakes }).map((_, i) => (
              <span
                key={i}
                className={`mistake-dot ${i < mistakes ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
        {game.timeLimit > 0 && (
          <div className={`game-timer ${timeLeft <= 10 ? 'timer-warning' : ''}`}>
            ⏱️ {timeLeft}s
          </div>
        )}
      </div>

      <div className="conexo-content">
        <div className="found-groups">
          {foundGroups.map((group, index) => (
            <div
              key={index}
              className="found-group"
              style={{ background: group.color }}
            >
              <div className="group-category">{group.category}</div>
              <div className="group-words">{group.words.join(', ')}</div>
            </div>
          ))}
        </div>

        <div className={`words-grid ${shake ? 'shake' : ''}`}>
          {allWords.map((word, index) => (
            <button
              key={index}
              onClick={() => handleWordClick(word)}
              className={`word-button ${selectedWords.find(w => w.text === word.text) ? 'selected' : ''}`}
            >
              {word.text}
            </button>
          ))}
        </div>

        <div className="conexo-actions">
          <button
            onClick={() => setAllWords(shuffleArray([...allWords]))}
            className="btn btn-outline btn-sm"
          >
            🔀 Embaralhar
          </button>
          <button
            onClick={() => setSelectedWords([])}
            disabled={selectedWords.length === 0}
            className="btn btn-outline btn-sm"
          >
            Limpar
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedWords.length !== 4}
            className="btn btn-primary btn-sm"
          >
            Enviar
          </button>
        </div>
      </div>

      <div className="game-actions">
        <button className="btn btn-outline" onClick={onExit}>
          Sair
        </button>
      </div>
    </div>
  );
};

export default ConexoGame;
