import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { achievementAPI } from '../services/api';
import { FaTrophy, FaLock, FaStar } from 'react-icons/fa';
import './Achievements.css';

const Achievements = () => {
  const [allAchievements, setAllAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const [allRes, userRes] = await Promise.all([
        achievementAPI.getAll(),
        achievementAPI.getUserAchievements(),
      ]);

      setAllAchievements(allRes.data);
      setUserAchievements(userRes.data);
    } catch (error) {
      console.error('Erro ao carregar conquistas:', error);
    } finally {
      setLoading(false);
    }
  };

  const isUnlocked = (achievementId) => {
    return userAchievements.some(ua => ua.achievement._id === achievementId);
  };

  const getUnlockedDate = (achievementId) => {
    const userAch = userAchievements.find(ua => ua.achievement._id === achievementId);
    return userAch?.unlockedAt;
  };

  const getRarityLabel = (rarity) => {
    const labels = {
      comum: 'Comum',
      raro: 'Raro',
      epico: 'Épico',
      lendario: 'Lendário'
    };
    return labels[rarity] || rarity;
  };

  const getRequirementText = (achievement) => {
    const { type, requirement } = achievement;
    
    switch (type) {
      case 'level':
        return `Alcance o nível ${requirement}`;
      case 'points':
        return `Consiga ${requirement} pontos`;
      case 'games':
        return `Complete ${requirement} jogos`;
      case 'phase':
        return `Complete ${requirement} fases`;
      case 'missions':
        return `Complete ${requirement} missões`;
      default:
        return 'Complete o desafio';
    }
  };

  if (loading) {
    return (
      <div className="achievements-wrapper">
        <Navbar />
        <div className="achievements-loading">
          <div className="loading-spinner"></div>
          <p>Carregando conquistas...</p>
        </div>
      </div>
    );
  }

  const unlockedCount = userAchievements.length;
  const totalCount = allAchievements.length;
  const progressPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <div className="achievements-wrapper">
      <Navbar />
      
      <div className="achievements-container">
        <div className="achievements-hero">
          <h1>🏆 Conquistas</h1>
          <p>Desbloqueie conquistas completando desafios e marcos especiais</p>
          
          <div className="achievement-stats">
            <span className="stats-label">
              {unlockedCount} de {totalCount} desbloqueadas
            </span>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="achievements-grid">
          {allAchievements.map(achievement => {
            const unlocked = isUnlocked(achievement._id);
            const unlockedDate = getUnlockedDate(achievement._id);

            return (
              <div 
                key={achievement._id} 
                className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="achievement-inner">
                  <div className={`achievement-icon-wrapper ${unlocked ? 'unlocked' : ''}`}>
                    {unlocked ? (
                      achievement.icon ? (
                        <img src={achievement.icon} alt={achievement.title} />
                      ) : (
                        <FaTrophy className="achievement-icon" style={{ color: '#f59e0b' }} />
                      )
                    ) : (
                      <FaLock className="lock-icon" />
                    )}
                  </div>

                  <div className="achievement-content">
                    <div className="achievement-header">
                      <h3 className="achievement-title">
                        {unlocked ? achievement.title : '???'}
                      </h3>
                      <span className={`rarity-badge ${achievement.rarity}`}>
                        {getRarityLabel(achievement.rarity)}
                      </span>
                    </div>

                    <p className={`achievement-description ${unlocked ? '' : 'locked'}`}>
                      {unlocked ? achievement.description : 'Complete o requisito para desbloquear'}
                    </p>

                    {unlocked ? (
                      <div className="achievement-footer">
                        <span className="achievement-points">
                          <FaStar />
                          +{achievement.pointsReward} pts
                        </span>
                        <span className="achievement-date">
                          {new Date(unlockedDate).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    ) : (
                      <div className="achievement-requirement">
                        <FaTrophy className="req-icon" />
                        <span>{getRequirementText(achievement)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Achievements;
