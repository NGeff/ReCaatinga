import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PlayerCard from '../components/PlayerCard';
import { phaseAPI, progressAPI, rankingAPI, gameAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [phases, setPhases] = useState([]);
  const [progress, setProgress] = useState(null);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalGames, setTotalGames] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [phasesRes, progressRes, rankRes] = await Promise.all([
        phaseAPI.getAll(),
        progressAPI.getOverall(),
        rankingAPI.getUserRank(),
      ]);

      setPhases(phasesRes.data);
      setProgress(progressRes.data);
      setRank(rankRes.data.position);

      let gamesCount = 0;
      for (const phase of phasesRes.data) {
        try {
          const gamesRes = await gameAPI.getByPhase(phase._id);
          gamesCount += gamesRes.data.length;
        } catch (err) {
          console.error('Erro ao contar jogos:', err);
        }
      }
      setTotalGames(gamesCount);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <Navbar />
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Carregando seu progresso...</p>
        </div>
      </div>
    );
  }

  const completedGames = progress?.completedGames || 0;
  const completedMissions = progress?.completedMissions || 0;
  const totalActivities = completedGames + completedMissions;
  const completionPercentage = totalGames > 0 ? ((completedGames / totalGames) * 100) : 0;
  const nextLevelXP = user.level * 100;
  const xpProgress = (user.experience / nextLevelXP) * 100;

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      
      <div className="dashboard-container">
        <header className="dashboard-hero">
          <div className="hero-greeting">
            <span className="greeting-emoji">👋</span>
            <div>
              <h1>Olá, {user.name}!</h1>
              <p>Continue sua jornada de aprendizado</p>
            </div>
          </div>
          <div className="hero-level">
            <div className="level-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
              </svg>
              <span>Nível {user.level}</span>
            </div>
          </div>
        </header>

        <div className="dashboard-grid">
          <aside className="dashboard-sidebar">
            <PlayerCard user={user} rank={rank} />

            <div className="progress-widget">
              <div className="widget-header">
                <h3>Experiência</h3>
                <span className="xp-count">{user.experience} XP</span>
              </div>
              <div className="xp-bar-container">
                <div className="xp-bar">
                  <div 
                    className="xp-bar-fill"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
                <p className="xp-label">
                  Faltam {nextLevelXP - user.experience} XP para o nível {user.level + 1}
                </p>
              </div>
            </div>

            <div className="quick-stats-widget">
              <h3>Estatísticas Rápidas</h3>
              <div className="quick-stats-list">
                <div className="quick-stat-item">
                  <div className="stat-icon-wrapper green">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{totalActivities}</span>
                    <span className="stat-name">Atividades</span>
                  </div>
                </div>

                <div className="quick-stat-item">
                  <div className="stat-icon-wrapper gold">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{user.totalPoints}</span>
                    <span className="stat-name">Pontos Totais</span>
                  </div>
                </div>

                <div className="quick-stat-item">
                  <div className="stat-icon-wrapper purple">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M16 18L18.29 15.71L13.41 10.83L9.41 14.83L2 7.41L3.41 6L9.41 12L13.41 8L19.71 14.3L22 12V18H16Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">#{rank || '--'}</span>
                    <span className="stat-name">Posição</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="dashboard-main">
            <section className="metrics-section">
              <div className="metric-card primary">
                <div className="metric-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="metric-content">
                  <span className="metric-label">Jogos Completos</span>
                  <span className="metric-value">{completedGames}</span>
                </div>
              </div>

              <div className="metric-card secondary">
                <div className="metric-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M21 16V8C3 8 3 16 21 16Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M17 21H7C4 21 3 20 3 17V7C3 4 4 3 7 3H17C20 3 21 4 21 7V17C21 20 20 21 17 21Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="metric-content">
                  <span className="metric-label">Total de Jogos</span>
                  <span className="metric-value">{totalGames}</span>
                </div>
              </div>

              <div className="metric-card accent">
                <div className="metric-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="metric-content">
                  <span className="metric-label">Progresso</span>
                  <span className="metric-value">{completionPercentage.toFixed(0)}%</span>
                </div>
              </div>
            </section>

            <section className="phases-showcase">
              <div className="showcase-header">
                <div>
                  <h2>Suas Fases</h2>
                  <p>Continue explorando e aprendendo</p>
                </div>
                <Link to="/phases" className="btn-view-all">
                  Ver Todas
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>

              <div className="phases-grid">
                {phases.slice(0, 3).map((phase) => {
                  const phaseProgress = progress?.phasesProgress?.find(p => p.phase._id === phase._id);
                  const difficultyColors = {
                    facil: 'easy',
                    medio: 'medium',
                    dificil: 'hard'
                  };
                  const difficultyLabels = {
                    facil: 'Fácil',
                    medio: 'Médio',
                    dificil: 'Difícil'
                  };

                  return (
                    <Link 
                      to={`/phase/${phase._id}`} 
                      key={phase._id}
                      className="phase-showcase-card"
                    >
                      <div className="phase-card-header">
                        <span className={`difficulty-tag ${difficultyColors[phase.difficulty]}`}>
                          {difficultyLabels[phase.difficulty]}
                        </span>
                        <div className="phase-reward-badge">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                          </svg>
                          <span>+{phase.experienceReward}</span>
                        </div>
                      </div>

                      <div className="phase-card-content">
                        <h3>{phase.title}</h3>
                        <p>{phase.description}</p>
                      </div>

                      <div className="phase-card-footer">
                        <div className="phase-missions-count">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          <span>{phaseProgress?.totalMissions || 0} missões</span>
                        </div>
                        <div className="phase-arrow">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
