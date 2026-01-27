import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { rankingAPI } from '../services/api';
import { FaTrophy, FaMedal, FaStar } from 'react-icons/fa';
import './Ranking.css';

const Ranking = () => {
  const { user } = useAuth();
  const [topUsers, setTopUsers] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      const [topRes, rankRes] = await Promise.all([
        rankingAPI.getTop(20),
        rankingAPI.getUserRank(),
      ]);

      setTopUsers(topRes.data);
      setUserRank(rankRes.data);
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (position) => {
    if (position === 1) return <FaTrophy className="position-medal medal-gold" />;
    if (position === 2) return <FaMedal className="position-medal medal-silver" />;
    if (position === 3) return <FaMedal className="position-medal medal-bronze" />;
    return <span className="position-number">#{position}</span>;
  };

  if (loading) {
    return (
      <div className="ranking-wrapper">
        <Navbar />
        <div className="ranking-loading">
          <div className="ranking-loading-spinner"></div>
          <p>Carregando ranking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ranking-wrapper">
      <Navbar />
      
      <div className="ranking-container">
        <header className="ranking-hero">
          <h1>🏆 Ranking Global</h1>
          <p>Veja os melhores jogadores do ReCaatinga</p>
        </header>

        {userRank && (
          <div className="user-rank-showcase">
            <div className="rank-showcase-header">
              <h3 className="rank-showcase-title">Sua Posição</h3>
              <div className="rank-position-badge">
                #{userRank.position}
              </div>
            </div>

            <div className="rank-showcase-stats">
              <div className="rank-stat-box">
                <FaStar className="rank-stat-icon" />
                <div className="rank-stat-content">
                  <span className="rank-stat-value">{userRank.user.level}</span>
                  <span className="rank-stat-label">Nível</span>
                </div>
              </div>

              <div className="rank-stat-box">
                <FaTrophy className="rank-stat-icon" />
                <div className="rank-stat-content">
                  <span className="rank-stat-value">{userRank.user.totalPoints}</span>
                  <span className="rank-stat-label">Pontos Totais</span>
                </div>
              </div>
            </div>

            <p className="rank-total-users">
              de {userRank.totalUsers} jogadores
            </p>
          </div>
        )}

        <div className="ranking-leaderboard">
          <div className="leaderboard-header">
            <h2>Top 20 Jogadores</h2>
          </div>

          <div className="leaderboard-list">
            {topUsers.map((rankUser) => (
              <Link
                key={rankUser.id}
                to={`/profile/${rankUser.id}`}
                className={`leaderboard-item ${rankUser.id === user.id ? 'current' : ''}`}
              >
                <div className="item-position">
                  {getMedalIcon(rankUser.position)}
                </div>

                <div className="item-user">
                  <div className="user-avatar-container">
                    {rankUser.avatar ? (
                      <img 
                        src={rankUser.avatar} 
                        alt={rankUser.name}
                        className="user-avatar-img"
                      />
                    ) : (
                      <div className="user-avatar-placeholder">
                        {rankUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="user-info">
                    <span className="user-name">
                      {rankUser.name}
                      {rankUser.id === user.id && ' (Você)'}
                    </span>
                    <span className="user-level">Nível {rankUser.level}</span>
                  </div>
                </div>

                <div className="item-points">
                  <FaTrophy className="points-icon" />
                  <span>{rankUser.totalPoints}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ranking;