import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { phaseAPI, missionAPI, gameAPI } from '../services/api';
import { toast } from 'react-toastify';
import './AdminPanel.css';
import './ContentManager.css';

const ContentManager = () => {
  const navigate = useNavigate();
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPhases, setExpandedPhases] = useState(new Set());
  const [expandedMissions, setExpandedMissions] = useState(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const phasesRes = await phaseAPI.getAll();
      const phasesData = phasesRes.data;

      const phasesWithContent = await Promise.all(
        phasesData.map(async (phase) => {
          try {
            const missionsRes = await missionAPI.getByPhase(phase._id);
            const missions = missionsRes.data;

            const missionsWithGames = await Promise.all(
              missions.map(async (mission) => {
                if (mission.type === 'jogos') {
                  try {
                    const gamesRes = await gameAPI.getByMission(mission._id);
                    return { ...mission, games: gamesRes.data };
                  } catch (error) {
                    return { ...mission, games: [] };
                  }
                }
                return { ...mission, games: [] };
              })
            );

            return { ...phase, missions: missionsWithGames };
          } catch (error) {
            return { ...phase, missions: [] };
          }
        })
      );

      setPhases(phasesWithContent);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const togglePhase = (phaseId) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  const toggleMission = (missionId) => {
    const newExpanded = new Set(expandedMissions);
    if (newExpanded.has(missionId)) {
      newExpanded.delete(missionId);
    } else {
      newExpanded.add(missionId);
    }
    setExpandedMissions(newExpanded);
  };

  const handleDeletePhase = async (id) => {
    if (!window.confirm('Tem certeza? Isso desativará todas as missões e jogos desta fase.')) return;
    
    try {
      await phaseAPI.delete(id);
      toast.success('Fase desativada com sucesso');
      fetchData();
    } catch (error) {
      toast.error('Erro ao desativar fase');
    }
  };

  const handleDeleteMission = async (id) => {
    if (!window.confirm('Tem certeza? Isso desativará todos os jogos desta missão.')) return;
    
    try {
      await missionAPI.delete(id);
      toast.success('Missão desativada com sucesso');
      fetchData();
    } catch (error) {
      toast.error('Erro ao desativar missão');
    }
  };

  const handleDeleteGame = async (id) => {
    if (!window.confirm('Tem certeza que deseja desativar este jogo?')) return;
    
    try {
      await gameAPI.delete(id);
      toast.success('Jogo desativado com sucesso');
      fetchData();
    } catch (error) {
      toast.error('Erro ao desativar jogo');
    }
  };

  const getMissionTypeIcon = (type) => {
    const icons = {
      'video': '🎥',
      'foto': '📸',
      'jogos': '🎮',
      'formulario': '📝',
      'texto': '✍️'
    };
    return icons[type] || '📋';
  };

  const getGameTypeLabel = (type) => {
    const types = {
      'quiz': 'Quiz',
      'quiz-vf': 'V/F',
      'memoria': 'Memória',
      'memoria-hibrida': 'Memória Híbrida',
      'puzzle': 'Puzzle',
      'arrastar': 'Arrastar',
      'conexo': 'Conexo',
      'conectar': 'Conectar',
      'caca-palavras': 'Caça-Palavras',
      'ordem-certa': 'Ordem Certa'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="admin-wrapper">
        <Navbar />
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

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
              <span className="admin-icon">🎯</span>
              Gerenciador de Conteúdo
            </h1>
            <p>Sistema hierárquico: Fases → Missões → Jogos</p>
          </div>
        </header>

        <section className="create-phase-section">
          <button 
            onClick={() => navigate('/admin/create-phase')}
            className="create-phase-btn"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Criar Nova Fase</span>
          </button>
        </section>

        {phases.length === 0 ? (
          <div className="empty-state-box">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
              <path d="M9 2L7 4M15 2l2 2M9 22l-2-2M15 22l2-2M2 9l2-2M2 15l2 2M22 9l-2-2M22 15l-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <h3>Nenhuma fase criada</h3>
            <p>Comece criando sua primeira fase do sistema</p>
            <button 
              onClick={() => navigate('/admin/create-phase')}
              className="btn btn-primary"
            >
              Criar Primeira Fase
            </button>
          </div>
        ) : (
          <div className="hierarchy-container">
            {phases.map((phase) => (
              <div key={phase._id} className="phase-block">
                <div className="phase-header">
                  <div className="phase-header-left" onClick={() => togglePhase(phase._id)}>
                    <button className="expand-btn">
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none"
                        style={{ transform: expandedPhases.has(phase._id) ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      >
                        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <div className="phase-info">
                      <span className="phase-order">#{phase.order}</span>
                      <h3>{phase.title}</h3>
                      <div className="phase-meta">
                        <span className={`difficulty-badge ${phase.difficulty}`}>
                          {phase.difficulty === 'facil' ? 'Fácil' : phase.difficulty === 'medio' ? 'Médio' : 'Difícil'}
                        </span>
                        <span className="meta-item">📊 {phase.missionsCount || 0} missões</span>
                        <span className="meta-item">⭐ {phase.experienceReward} XP</span>
                      </div>
                    </div>
                  </div>
                  <div className="phase-actions">
                    <button 
                      onClick={() => navigate(`/admin/create-mission`, { state: { phaseId: phase._id, phaseTitle: phase.title } })}
                      className="btn-icon btn-primary"
                      title="Adicionar Missão"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                    <Link 
                      to={`/admin/edit-phase/${phase._id}`}
                      className="btn-icon btn-secondary"
                      title="Editar Fase"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                    <button 
                      onClick={() => handleDeletePhase(phase._id)}
                      className="btn-icon btn-danger"
                      title="Desativar Fase"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {expandedPhases.has(phase._id) && (
                  <div className="phase-content">
                    {phase.missions && phase.missions.length > 0 ? (
                      <div className="missions-list">
                        {phase.missions.map((mission) => (
                          <div key={mission._id} className="mission-block">
                            <div className="mission-header">
                              <div className="mission-header-left" onClick={() => mission.type === 'jogos' && toggleMission(mission._id)}>
                                {mission.type === 'jogos' && (
                                  <button className="expand-btn">
                                    <svg 
                                      width="18" 
                                      height="18" 
                                      viewBox="0 0 24 24" 
                                      fill="none"
                                      style={{ transform: expandedMissions.has(mission._id) ? 'rotate(90deg)' : 'rotate(0deg)' }}
                                    >
                                      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </button>
                                )}
                                <div className="mission-info">
                                  <span className="mission-icon">{getMissionTypeIcon(mission.type)}</span>
                                  <span className="mission-order">#{mission.order}</span>
                                  <h4>{mission.title}</h4>
                                  {mission.type === 'jogos' && mission.games && (
                                    <span className="games-count">({mission.games.length} jogos)</span>
                                  )}
                                </div>
                              </div>
                              <div className="mission-actions">
                                {mission.type === 'jogos' && (
                                  <button 
                                    onClick={() => navigate(`/admin/create-game`, { 
                                      state: { 
                                        phaseId: phase._id, 
                                        missionId: mission._id,
                                        phaseTitle: phase.title,
                                        missionTitle: mission.title
                                      } 
                                    })}
                                    className="btn-icon btn-primary"
                                    title="Adicionar Jogo"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                  </button>
                                )}
                                <Link 
                                  to={`/admin/edit-mission/${mission._id}`}
                                  className="btn-icon btn-secondary"
                                  title="Editar Missão"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </Link>
                                <button 
                                  onClick={() => handleDeleteMission(mission._id)}
                                  className="btn-icon btn-danger"
                                  title="Desativar Missão"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {expandedMissions.has(mission._id) && mission.games && mission.games.length > 0 && (
                              <div className="games-list">
                                {mission.games.map((game) => (
                                  <div key={game._id} className="game-item">
                                    <div className="game-info">
                                      <span className="game-order">#{game.order}</span>
                                      <span className="game-type-badge">{getGameTypeLabel(game.type)}</span>
                                      <span className="game-title">{game.title}</span>
                                      <span className="game-meta">🎯 {game.points}pts</span>
                                    </div>
                                    <div className="game-actions">
                                      <Link 
                                        to={`/admin/edit-game/${game._id}`}
                                        className="btn-icon btn-secondary"
                                        title="Editar Jogo"
                                      >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                      </Link>
                                      <button 
                                        onClick={() => handleDeleteGame(game._id)}
                                        className="btn-icon btn-danger"
                                        title="Desativar Jogo"
                                      >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-missions">
                        <p>Nenhuma missão criada nesta fase</p>
                        <button 
                          onClick={() => navigate(`/admin/create-mission`, { state: { phaseId: phase._id, phaseTitle: phase.title } })}
                          className="btn btn-primary btn-sm"
                        >
                          Criar Primeira Missão
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentManager;
