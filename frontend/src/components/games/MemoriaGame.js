import React, { useState, useEffect } from 'react';
import './GameStyles.css';

const MemoriaGame = ({ game, onComplete, onExit }) => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(game.timeLimit);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (game.timeLimit > 0 && gameStarted && matchedCards.length < cards.length) {
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
  }, [gameStarted, matchedCards]);

  useEffect(() => {
    if (matchedCards.length === cards.length && cards.length > 0) {
      handleGameComplete();
    }
  }, [matchedCards]);

  const initializeGame = () => {
    const pairs = game.content?.pairs || [];
    if (pairs.length === 0) return;

    const gameCards = [];
    pairs.forEach((pair, index) => {
      gameCards.push({ id: index * 2, pairId: index, image: pair.image1 });
      gameCards.push({ id: index * 2 + 1, pairId: index, image: pair.image2 });
    });
    setCards(shuffleArray(gameCards));
    setGameStarted(true);
  };

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleTimeUp = () => {
    const score = Math.round((matchedCards.length / cards.length) * game.points);
    onComplete(score);
  };

  const handleGameComplete = () => {
    const baseScore = game.points;
    const movesPenalty = Math.max(0, (moves - cards.length) * 2);
    const finalScore = Math.max(0, baseScore - movesPenalty);
    setTimeout(() => onComplete(finalScore), 1000);
  };

  const handleCardClick = (cardId) => {
    if (flippedCards.length === 2 || flippedCards.includes(cardId) || matchedCards.includes(cardId)) return;
    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);
    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      checkMatch(newFlipped);
    }
  };

  const checkMatch = (flipped) => {
    const [firstId, secondId] = flipped;
    const firstCard = cards.find(c => c.id === firstId);
    const secondCard = cards.find(c => c.id === secondId);
    if (firstCard.pairId === secondCard.pairId) {
      setTimeout(() => {
        setMatchedCards([...matchedCards, firstId, secondId]);
        setFlippedCards([]);
      }, 500);
    } else {
      setTimeout(() => setFlippedCards([]), 1000);
    }
  };

  if (cards.length === 0) return <div className="game-card"><div className="game-error">Nenhum par de cartas disponível.</div></div>;

  const gridSize = Math.ceil(Math.sqrt(cards.length));

  return (
    <div className="game-card">
      <div className="game-header">
        <div className="memory-stats">
          <div className="stat-item"><span className="stat-icon">🎯</span><span>{moves} movimentos</span></div>
          <div className="stat-item"><span className="stat-icon">✓</span><span>{matchedCards.length / 2}/{cards.length / 2} pares</span></div>
        </div>
        {game.timeLimit > 0 && <div className={`game-timer ${timeLeft <= 10 ? 'timer-warning' : ''}`}>⏱️ {timeLeft}s</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gap: '1rem', marginBottom: '2rem', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', position: 'relative', zIndex: 1 }}>
        {cards.map((card) => {
          const isFlipped = flippedCards.includes(card.id) || matchedCards.includes(card.id);
          return (
            <div key={card.id} style={{ aspectRatio: '1', cursor: 'pointer', perspective: '1000px' }} onClick={() => handleCardClick(card.id)}>
              <div style={{ position: 'relative', width: '100%', height: '100%', transition: 'transform 0.6s', transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)' }}>
                <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--game-primary) 0%, var(--game-primary-light) 100%)', color: 'white', fontSize: '3rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>🌿</div>
                <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', background: 'white', border: matchedCards.includes(card.id) ? '2px solid var(--game-green)' : '2px solid var(--game-border)', transform: 'rotateY(180deg)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <img src={card.image} alt="Card" style={{ width: '90%', height: '90%', objectFit: 'cover', borderRadius: '0.5rem' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="game-actions"><button className="btn btn-outline" onClick={onExit}>Sair</button></div>
    </div>
  );
};

export default MemoriaGame;
