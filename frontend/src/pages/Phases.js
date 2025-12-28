import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { phaseAPI, progressAPI, taskAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaPlay, FaStar, FaLock, FaCheckCircle } from 'react-icons/fa';
import './Phases.css';

const Phases = () => {
  const { user } = useAuth();
  const [phases, setPhases] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [phasesRes, progressRes, submissionsRes] = await Promise.all([
        phaseAPI.getAll(),
        progressAPI.getOverall(),
        taskAPI.getMySubmissions().catch(() => ({ data: [] }))
      ]);

      const sortedPhases = phasesRes.data.sort((a, b) => a.order - b.order);
      
      const approvedSubmissions = submissionsRes.data.filter(s => s.status === 'approved');
      
      const enhancedProgress = {
        ...progressRes.data,
        phasesProgress: progressRes.data.phasesProgress?.map(pp => {
          const phaseApprovedMissions = approvedSubmissions.filter(
            s => s.phase._id === pp.phase._id
          ).length;
          
          const totalCompleted = pp.completedMissions + phaseApprovedMissions;
          const percentage = pp.totalMissions > 0 
            ? Math.round((totalCompleted / pp.totalMissions) * 100) 
            : 0;
          
          return {
            ...pp,
            completedMissions: totalCompleted,
            percentage,
            completed: totalCompleted >= pp.totalMissions
          };
        })
      };

      setPhases(sortedPhases);
      setUserProgress(enhancedProgress);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const isPhaseUnlocked = (phase, index) => {
    if (index === 0) return true;
    
    if (user.level < phase.requiredLevel) return false;
    
    const previousPhase = phases[index - 1];
    return userProgress?.phasesProgress?.some(
      p => p.phase._id === previousPhase._id && p.completed
    );
  };

  const getPhaseProgress = (phaseId) => {
    return userProgress?.phasesProgress?.find(
      p => p.phase._id === phaseId
    );
  };

  const filteredPhases = phases.filter(phase => {
    if (filter === 'all') return true;
    return phase.category === filter;
  });

  const categories = [
    { value: 'all', label: 'Todas', icon: '🌟' },
    { value: 'plantio', label: 'Plantio', icon: '🌱' },
    { value: 'reciclagem', label: 'Reciclagem', icon: '♻️' },
    { value: 'monitoramento', label: 'Monitoramento', icon: '📊' },
    { value: 'educacao', label: 'Educação', icon: '📚' },
    { value: 'conservacao', label: 'Conservação', icon: '🌿' },
  ];

  const getDifficultyLabel = (difficulty) => {
    const labels = {
      facil: 'Fácil',
      medio: 'Médio',
      dificil: 'Difícil'
    };
    return labels[difficulty] || difficulty;
  };

  const getDifficultyClass = (difficulty) => {
    const classes = {
      facil: 'difficulty-easy',
      medio: 'difficulty-medium',
      dificil: 'difficulty-hard'
    };
    return classes[difficulty] || '';
  };

  const getCategoryLabel = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? `${cat.icon} ${cat.label}` : category;
  };

  if (loading) {
    return (
      <div className="phases-wrapper">
        <Navbar />
        <div className="phases-loading">
          <div className="phases-loading-spinner"></div>
          <p>Carregando fases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="phases-wrapper">
      <Navbar />
      
      <div className="phases-container">
        <header className="phases-hero">
          <h1>🎓 Jornada de Aprendizado</h1>
          <p>Complete as fases em ordem para progredir e desbloquear novos desafios</p>
        </header>

        <div className="phases-filters">
          {categories.map(cat => (
            <button
              key={cat.value}
              className={`filter-chip ${filter === cat.value ? 'active' : ''}`}
              onClick={() => setFilter(cat.value)}
            >
              <span className="filter-icon">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="phases-content">
          {filteredPhases.length === 0 ? (
            <div className="phases-empty">
              <p>Nenhuma fase disponível nesta categoria.</p>
            </div>
          ) : (
            <div className="phases-grid">
              {filteredPhases.map((phase, index) => {
                const isUnlocked = isPhaseUnlocked(phase, index);
                const progress = getPhaseProgress(phase._id);
                const isCompleted = progress?.completed || false;

                return (
                  <div 
                    key={phase._id}
                    className={`phase-card ${isCompleted ? 'completed' : ''} ${!isUnlocked ? 'locked' : ''}`}
                  >
                    <div className="phase-card-inner">
                      <div className={`phase-number ${isCompleted ? 'completed' : isUnlocked ? 'unlocked' : 'locked'}`}>
                        {isCompleted ? <FaCheckCircle /> : index + 1}
                      </div>

                      <div className="phase-header">
                        <div className="phase-title-row">
                          <h2 className="phase-title">{phase.title}</h2>
                          {!isUnlocked && <FaLock className="lock-icon" />}
                        </div>
                        
                        <div className="phase-badges">
                          <span className={`phase-badge ${getDifficultyClass(phase.difficulty)}`}>
                            {getDifficultyLabel(phase.difficulty)}
                          </span>
                          
                          <span className="phase-badge category">
                            {getCategoryLabel(phase.category)}
                          </span>

                          {isCompleted && (
                            <span className="phase-badge completed-badge">
                              ✓ Completado
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="phase-description">{phase.description}</p>

                      {progress && (
                        <div className="phase-progress-section">
                          <div className="progress-header">
                            <span className="progress-label">Progresso</span>
                            <span className="progress-count">
                              {progress.completedMissions}/{progress.totalMissions} missões
                            </span>
                          </div>
                          <div className="progress-bar-container">
                            <div 
                              className="progress-bar-fill"
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="phase-footer">
                        <div className="phase-meta-info">
                          <div className="meta-item">
                            <FaStar className="meta-icon star" />
                            <span>+{phase.experienceReward} XP</span>
                          </div>
                          <div className="meta-item">
                            <span className="meta-icon">📋</span>
                            <span>{progress?.totalMissions || 0} missões</span>
                          </div>
                          <div className="meta-item">
                            <span className="meta-icon">🎯</span>
                            <span>Nível {phase.requiredLevel}</span>
                          </div>
                        </div>
                        
                        <div className="phase-action">
                          {isUnlocked ? (
                            <Link to={`/phase/${phase._id}`} className="phase-btn">
                              <FaPlay />
                              <span>{isCompleted ? 'Revisar' : 'Começar'}</span>
                            </Link>
                          ) : (
                            <div className="phase-locked-label">
                              <FaLock />
                              <span>
                                {user.level < phase.requiredLevel 
                                  ? `Nível ${phase.requiredLevel} necessário`
                                  : 'Complete a fase anterior'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Phases;
