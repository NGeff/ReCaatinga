import React from 'react';
import { FaStar, FaTrophy, FaAward } from 'react-icons/fa';
import './PlayerCard.css';

const PlayerCard = ({ user, rank }) => {
  if (!user) {
    return (
      <div className="player-card">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  const level = user.level || 1;
  const experience = user.experience || 0;
  const totalPoints = user.totalPoints || 0;
  const name = user.name || 'Usuário';
  const avatar = user.avatar;

  const experienceToNextLevel = level * 100;
  const experienceProgress = (experience / experienceToNextLevel) * 100;

  return (
    <div className="player-card">
      <div className="player-card-header">
        <div className="player-avatar-large">
          {avatar ? (
            <img src={avatar} alt={name} />
          ) : (
            <div className="avatar-placeholder-large">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="player-info">
          <h2 className="player-name">{name}</h2>
          <div className="player-level">
            <FaStar className="level-icon" />
            <span>Nível {level}</span>
          </div>
        </div>
      </div>

      <div className="player-stats">
        <div className="stat-item">
          <FaTrophy className="stat-icon" />
          <div className="stat-content">
            <span className="stat-label">Pontos Totais</span>
            <span className="stat-value">{totalPoints}</span>
          </div>
        </div>
        
        <div className="stat-item">
          <FaAward className="stat-icon" />
          <div className="stat-content">
            <span className="stat-label">Ranking</span>
            <span className="stat-value">#{rank || '—'}</span>
          </div>
        </div>
      </div>

      <div className="experience-section">
        <div className="experience-header">
          <span>Experiência</span>
          <span>{experience} / {experienceToNextLevel}</span>
        </div>
        <div className="experience-bar">
          <div 
            className="experience-progress" 
            style={{ width: `${experienceProgress}%` }}
          />
        </div>
        <p className="experience-text">
          Faltam {experienceToNextLevel - experience} XP para o próximo nível
        </p>
      </div>
    </div>
  );
};

export default PlayerCard;
