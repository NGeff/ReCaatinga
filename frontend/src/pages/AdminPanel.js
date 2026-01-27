import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { analyticsAPI, userAPI, phaseAPI, taskAPI } from '../services/api';
import './AdminPanel.css';

const AdminPanel = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPhases: 0,
    pendingTasks: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, usersRes, phasesRes, tasksRes] = await Promise.all([
        analyticsAPI.getDashboard().catch(() => ({ data: {} })),
        userAPI.getAll().catch(() => ({ data: [] })),
        phaseAPI.getAll().catch(() => ({ data: [] })),
        taskAPI.getPending().catch(() => ({ data: [] }))
      ]);

      setStats({
        totalUsers: usersRes.data.length || 0,
        totalPhases: phasesRes.data.length || 0,
        pendingTasks: tasksRes.data.length || 0,
        activeUsers: analyticsRes.data.activeUsers || 0
      });
    } catch (error) {
      console.error('Erro ao carregar dados do painel:', error);
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
          <p>Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  const adminCards = [
    {
      title: 'Análises',
      description: 'Visualize estatísticas e métricas detalhadas',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 3v18h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18 17V9M13 17V5M8 17v-3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      link: '/admin/analytics',
      color: 'blue'
    },
    {
      title: 'Gerenciar Conteúdo',
      description: 'Gerencie fases, missões e jogos',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 7h6M9 11h6M9 15h4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      link: '/admin/content-manager',
      color: 'green'
    },
    {
      title: 'Gerenciar Fases',
      description: 'Visualize e edite todas as fases',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2"/>
          <circle cx="12" cy="12" r="6" strokeWidth="2"/>
          <circle cx="12" cy="12" r="2" fill="currentColor"/>
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      link: '/admin/manage-phases',
      color: 'purple'
    },
    {
      title: 'Revisar Tarefas',
      description: 'Avalie tarefas enviadas pelos usuários',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 11l3 3L22 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      link: '/admin/task-review',
      color: 'orange'
    },
    {
      title: 'Notificações',
      description: 'Envie notificações para os usuários',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="18" cy="5" r="3" fill="currentColor"/>
        </svg>
      ),
      link: '/admin/notifications',
      color: 'red'
    },
    {
      title: 'Criar Conquista',
      description: 'Adicione novas conquistas ao sistema',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 22h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      link: '/admin/create-achievement',
      color: 'gold'
    }
  ];

  return (
    <div className="admin-wrapper">
      <Navbar />
      
      <div className="admin-container">
        <header className="admin-header">
          <div className="admin-header-content">
            <h1>
              <span className="admin-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="3" strokeWidth="2"/>
                  <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
              Painel Administrativo
            </h1>
            <p>Gerencie e monitore a plataforma ReCaatinga</p>
          </div>
        </header>

        <section className="admin-stats">
          <div className="stat-card blue">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Total de Usuários</h3>
              <p className="stat-value">{stats.totalUsers}</p>
            </div>
          </div>

          <div className="stat-card green">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Total de Fases</h3>
              <p className="stat-value">{stats.totalPhases}</p>
            </div>
          </div>

          <div className="stat-card orange">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Tarefas Pendentes</h3>
              <p className="stat-value">{stats.pendingTasks}</p>
            </div>
          </div>

          <div className="stat-card purple">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M16 18L18.29 15.71L13.41 10.83L9.41 14.83L2 7.41L3.41 6L9.41 12L13.41 8L19.71 14.3L22 12V18H16Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Usuários Ativos</h3>
              <p className="stat-value">{stats.activeUsers}</p>
            </div>
          </div>
        </section>

        <section className="admin-actions">
          <h2>Ações Rápidas</h2>
          <div className="admin-grid">
            {adminCards.map((card, index) => (
              <Link 
                to={card.link} 
                key={index}
                className={`admin-card ${card.color}`}
              >
                <div className="card-icon">{card.icon}</div>
                <div className="card-content">
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
                <div className="card-arrow">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="admin-quick-create">
          <h2>Criar Novo Conteúdo</h2>
          <div className="quick-create-grid">
            <Link to="/admin/create-phase" className="quick-create-btn primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Nova Fase</span>
            </Link>

            <Link to="/admin/create-mission" className="quick-create-btn secondary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Nova Missão</span>
            </Link>

            <Link to="/admin/create-game" className="quick-create-btn accent">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Novo Jogo</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPanel;
