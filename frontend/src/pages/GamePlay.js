import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { gameAPI } from '../services/api';
import QuizGame from '../components/games/QuizGame';
import QuizVFGame from '../components/games/QuizVFGame';
import MemoriaGame from '../components/games/MemoriaGame';
import MemoriaHibridaGame from '../components/games/MemoriaHibridaGame';
import PuzzleGame from '../components/games/PuzzleGame';
import ConexoGame from '../components/games/ConexoGame';
import ConectarGame from '../components/games/ConectarGame';
import CacaPalavrasGame from '../components/games/CacaPalavrasGame';
import OrdemCertaGame from '../components/games/OrdemCertaGame';
import './GamePlay.css';

const GamePlay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    fetchGame();
  }, [id]);

  const fetchGame = async () => {
    try {
      const res = await gameAPI.getById(id);
      setGame(res.data);
      
      if (!res.data.isUnlocked) {
        toast.error('Este jogo ainda está bloqueado!');
        navigate(-1);
      }
    } catch (error) {
      toast.error('Erro ao carregar jogo');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleGameComplete = async (score) => {
    try {
      const res = await gameAPI.submitScore(id, score);
      toast.success(res.data.message);
      
      if (res.data.newAchievements && res.data.newAchievements.length > 0) {
        res.data.newAchievements.forEach(achievement => {
          toast.info(`🏆 Conquista desbloqueada: ${achievement.title}`);
        });
      }
      
      setTimeout(() => {
        if (game.mission && game.mission._id) {
          navigate(`/mission/${game.mission._id}`);
        } else if (game.phase && game.phase._id) {
          navigate(`/phase/${game.phase._id}`);
        } else {
          navigate('/phases');
        }
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao registrar pontuação');
    }
  };

  const handleExit = () => {
    if (game.mission && game.mission._id) {
      navigate(`/mission/${game.mission._id}`);
    } else if (game.phase && game.phase._id) {
      navigate(`/phase/${game.phase._id}`);
    } else {
      navigate('/phases');
    }
  };

  const renderGame = () => {
    if (!gameStarted) return null;

    const gameProps = {
      game,
      onComplete: handleGameComplete,
      onExit: handleExit
    };

    switch (game.type) {
      case 'quiz':
        return <QuizGame {...gameProps} />;
      case 'quiz-vf':
        return <QuizVFGame {...gameProps} />;
      case 'memoria':
        return <MemoriaGame {...gameProps} />;
      case 'memoria-hibrida':
        return <MemoriaHibridaGame {...gameProps} />;
      case 'puzzle':
        return <PuzzleGame {...gameProps} />;
      case 'conexo':
        return <ConexoGame {...gameProps} />;
      case 'conectar':
        return <ConectarGame {...gameProps} />;
      case 'caca-palavras':
        return <CacaPalavrasGame {...gameProps} />;
      case 'ordem-certa':
        return <OrdemCertaGame {...gameProps} />;
      default:
        return <div className="game-error">Tipo de jogo não suportado</div>;
    }
  };

  if (loading) {
    return (
      <div className="game-wrapper">
        <Navbar />
        <div className="game-loading">
          <div className="loading-spinner"></div>
          <p>Carregando jogo...</p>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    const gameIcons = {
      quiz: '📝',
      'quiz-vf': '✅',
      memoria: '🧠',
      'memoria-hibrida': '🎴',
      puzzle: '🧩',
      conexo: '🔗',
      conectar: '🎯',
      'caca-palavras': '🔍',
      'ordem-certa': '🔢'
    };

    const gameNames = {
      quiz: 'Quiz',
      'quiz-vf': 'Verdadeiro ou Falso',
      memoria: 'Jogo da Memória',
      'memoria-hibrida': 'Memória Híbrida',
      puzzle: 'Quebra-Cabeça',
      conexo: 'Conexo',
      conectar: 'Conectar',
      'caca-palavras': 'Caça-Palavras',
      'ordem-certa': 'Ordem Certa'
    };

    return (
      <div className="game-wrapper">
        <Navbar />
        <div className="game-intro">
          <div className="game-intro-card">
            <div className="game-intro-icon">{gameIcons[game.type] || '🎮'}</div>
            <h1>{game.title}</h1>
            <p className="game-intro-description">
              Prepare-se para testar seus conhecimentos!
            </p>
            
            <div className="game-info-grid">
              <div className="game-info-item">
                <span className="info-icon">🎮</span>
                <span className="info-label">Tipo</span>
                <span className="info-value">{gameNames[game.type] || 'Jogo'}</span>
              </div>
              
              <div className="game-info-item">
                <span className="info-icon">⭐</span>
                <span className="info-label">Pontos</span>
                <span className="info-value">{game.points}</span>
              </div>
              
              {game.timeLimit > 0 && (
                <div className="game-info-item">
                  <span className="info-icon">⏱️</span>
                  <span className="info-label">Tempo</span>
                  <span className="info-value">{game.timeLimit}s</span>
                </div>
              )}
              
              <div className="game-info-item">
                <span className="info-icon">🎯</span>
                <span className="info-label">Tentativas</span>
                <span className="info-value">{game.maxAttempts}</span>
              </div>
            </div>

            {game.isCompleted && (
              <div className="game-completed-badge">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Jogo já completado</span>
              </div>
            )}

            <div className="game-intro-actions">
              <button 
                className="btn btn-outline"
                onClick={handleExit}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Voltar</span>
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => setGameStarted(true)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 3l14 9-14 9V3z" fill="currentColor"/>
                </svg>
                <span>Começar Jogo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-wrapper">
      <Navbar />
      <div className="game-container">
        {renderGame()}
      </div>
    </div>
  );
};

export default GamePlay;
