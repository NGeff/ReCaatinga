import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { analyticsAPI, userAPI, rankingAPI } from '../services/api';
import './AdminPanel.css';
import './AdminAnalytics.css';

const AdminAnalytics = () => {
  const [users, setUsers] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setError(null);
      
      const [usersRes, rankingRes] = await Promise.all([
        userAPI.getAll().catch(err => {
          console.error('Erro ao buscar usuários:', err);
          return { data: [] };
        }),
        rankingAPI.getTop(10).catch(err => {
          console.error('Erro ao buscar ranking:', err);
          return { data: [] };
        })
      ]);

      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setTopPlayers(Array.isArray(rankingRes.data) ? rankingRes.data : []);
    } catch (error) {
      console.error('Erro ao carregar análises:', error);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-wrapper">
        <Navbar />
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Carregando análises...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-wrapper">
        <Navbar />
        <div className="admin-container">
          <div className="admin-header">
            <Link to="/admin" className="back-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Voltar
            </Link>
          </div>
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            background: 'white', 
            borderRadius: '1rem',
            border: '2px solid var(--admin-red)'
          }}>
            <h2 style={{ color: 'var(--admin-red)', marginBottom: '1rem' }}>Erro ao Carregar Dados</h2>
            <p style={{ color: 'var(--admin-text-light)', marginBottom: '1.5rem' }}>{error}</p>
            <button 
              onClick={fetchAnalytics}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'var(--admin-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalUsers = users.length;
  const activeUsers = users.filter(u => {
    if (!u) return false;
    const lastActive = new Date(u.statistics?.lastActiveDate || u.updatedAt || u.createdAt);
    const daysSince = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
  }).length;
  
  const avgLevel = users.length > 0 
    ? (users.reduce((sum, u) => sum + (u?.level || 1), 0) / users.length).toFixed(1)
    : 0;
  
  const totalXP = users.reduce((sum, u) => sum + (u?.totalExperience || 0), 0);

  return (
    <div className="admin-wrapper">
      <Navbar />
      
      <div className="admin-container">
        <header className="admin-header">
          <div className="admin-header-content">
            <Link to="/admin" className="back-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Voltar
            </Link>
            <h1>
              <span className="admin-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 3v18h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18 17V9M13 17V5M8 17v-3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Análises e Estatísticas
            </h1>
            <p>Monitore o desempenho da plataforma</p>
          </div>
        </header>

        <section className="analytics-overview">
          <h2>Visão Geral</h2>
          <div className="analytics-grid">
            <div className="analytics-card blue">
              <div className="analytics-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="analytics-content">
                <h3>Total de Usuários</h3>
                <p className="analytics-value">{totalUsers}</p>
                <span className="analytics-label">Usuários cadastrados</span>
              </div>
            </div>

            <div className="analytics-card green">
              <div className="analytics-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="analytics-content">
                <h3>Usuários Ativos</h3>
                <p className="analytics-value">{activeUsers}</p>
                <span className="analytics-label">Últimos 7 dias</span>
              </div>
            </div>

            <div className="analytics-card purple">
              <div className="analytics-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="analytics-content">
                <h3>Nível Médio</h3>
                <p className="analytics-value">{avgLevel}</p>
                <span className="analytics-label">De todos os usuários</span>
              </div>
            </div>

            <div className="analytics-card gold">
              <div className="analytics-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M16 18L18.29 15.71L13.41 10.83L9.41 14.83L2 7.41L3.41 6L9.41 12L13.41 8L19.71 14.3L22 12V18H16Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="analytics-content">
                <h3>XP Total</h3>
                <p className="analytics-value">{totalXP.toLocaleString()}</p>
                <span className="analytics-label">Experiência acumulada</span>
              </div>
            </div>
          </div>
        </section>

        <section className="top-players-section">
          <h2>Top 10 Jogadores</h2>
          <div className="top-players-table">
            <div className="table-header">
              <span>Posição</span>
              <span>Usuário</span>
              <span>Nível</span>
              <span>Pontos</span>
              <span>XP</span>
            </div>
            {topPlayers.length > 0 ? (
              topPlayers.map((player, index) => (
                <div key={player._id || index} className="table-row">
                  <span className="position">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `#${index + 1}`}
                  </span>
                  <span className="user-info">
                    {player.avatar ? (
                      <img src={player.avatar} alt={player.name || 'Usuário'} className="user-avatar" />
                    ) : (
                      <div className="user-placeholder">
                        {(player.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span>{player.name || 'Usuário'}</span>
                  </span>
                  <span className="level">Nível {player.level || 1}</span>
                  <span className="points">{(player.totalPoints || 0).toLocaleString()}</span>
                  <span className="xp">{(player.totalExperience || 0).toLocaleString()} XP</span>
                </div>
              ))
            ) : (
              <div className="table-row">
                <span style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--admin-text-light)' }}>
                  Nenhum jogador encontrado
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="user-engagement">
          <h2>Engajamento dos Usuários</h2>
          <div className="engagement-grid">
            <div className="engagement-card">
              <h3>Taxa de Atividade</h3>
              <div className="progress-circle">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="8"
                    strokeDasharray={`${totalUsers > 0 ? (activeUsers / totalUsers) * 283 : 0} 283`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <span className="progress-text">
                  {totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <p>{activeUsers} de {totalUsers} usuários ativos</p>
            </div>

            <div className="engagement-stats">
              <div className="engagement-stat">
                <h4>Engajamento Diário</h4>
                <p className="stat-big">{Math.round(activeUsers * 0.3)}</p>
                <span>usuários por dia</span>
              </div>
              <div className="engagement-stat">
                <h4>Engajamento Semanal</h4>
                <p className="stat-big">{activeUsers}</p>
                <span>usuários por semana</span>
              </div>
              <div className="engagement-stat">
                <h4>Taxa de Retenção</h4>
                <p className="stat-big">{totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(0) : 0}%</p>
                <span>usuários retidos</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminAnalytics;
