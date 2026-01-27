import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { phaseAPI, missionAPI, gameAPI, progressAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaPlay, FaCheckCircle, FaLock, FaStar, FaClock, FaTimes } from 'react-icons/fa';
import './PhaseDetail.css';

const PhaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [phase, setPhase] = useState(null);
  const [missions, setMissions] = useState([]);
  const [phaseGames, setPhaseGames] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoWatched, setVideoWatched] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [phaseRes, missionsRes, gamesRes, progressRes] = await Promise.all([
        phaseAPI.getById(id),
        missionAPI.getByPhase(id),
        gameAPI.getByPhase(id),
        progressAPI.getPhase(id).catch(() => ({ data: null }))
      ]);

      setPhase(phaseRes.data);
      setMissions(missionsRes.data.sort((a, b) => a.order - b.order));
      setPhaseGames(gamesRes.data.sort((a, b) => a.order - b.order));
      setUserProgress(progressRes.data);
      
      if (progressRes.data?.videoWatched) {
        setVideoWatched(true);
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar fase');
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleWatchVideo = async () => {
    try {
      await progressAPI.markVideoWatched(id);
      setVideoWatched(true);
      toast.success('Vídeo assistido! Você pode iniciar as atividades agora');
      fetchData();
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao marcar vídeo como assistido');
    }
  };

  const isMissionUnlocked = (missionIndex) => {
    if (!videoWatched) return false;
    if (missionIndex === 0) return true;
    
    const previousMission = missions[missionIndex - 1];
    const previousMissionId = previousMission._id;
    
    const isCompletedInProgress = userProgress?.completedMissions?.some(
      cm => cm.mission.toString() === previousMissionId || cm.mission._id === previousMissionId
    );
    
    const hasApprovedSubmission = userProgress?.taskSubmissions?.[previousMissionId]?.hasApproved;
    
    return isCompletedInProgress || hasApprovedSubmission;
  };

  const isMissionCompleted = (missionId) => {
    const isCompletedInProgress = userProgress?.completedMissions?.some(
      cm => (cm.mission?.toString() === missionId || cm.mission?._id === missionId || cm.mission === missionId)
    );
    
    const hasApprovedSubmission = userProgress?.taskSubmissions?.[missionId]?.hasApproved;
    
    return isCompletedInProgress || hasApprovedSubmission;
  };

  const getMissionStatus = (missionId) => {
    if (!userProgress?.taskSubmissions) return null;
    return userProgress.taskSubmissions[missionId];
  };

  const isGameUnlocked = (gameIndex) => {
    if (!videoWatched) return false;
    if (gameIndex === 0) return true;
    
    const previousGame = phaseGames[gameIndex - 1];
    return userProgress?.completedGames?.some(
      cg => (cg.game?.toString() === previousGame._id || cg.game?._id === previousGame._id || cg.game === previousGame._id)
    );
  };

  const isGameCompleted = (gameId) => {
    return userProgress?.completedGames?.some(
      cg => (cg.game?.toString() === gameId || cg.game?._id === gameId || cg.game === gameId)
    );
  };

  if (loading) {
    return (
      <div className="phase-detail-wrapper">
        <Navbar />
        <div className="phase-detail-loading">
          <div className="loading-spinner"></div>
          <p>Carregando fase...</p>
        </div>
      </div>
    );
  }

  if (!phase) {
    return (
      <div className="phase-detail-wrapper">
        <Navbar />
        <div className="phase-detail-loading">
          <p>Fase não encontrada</p>
        </div>
      </div>
    );
  }

  if (!phase.isUnlocked) {
    return (
      <div className="phase-detail-wrapper">
        <Navbar />
        <div className="phase-detail-container">
          <div className="locked-phase-card">
            <FaLock className="locked-icon" />
            <h2>Fase Bloqueada</h2>
            <p>Complete todas as atividades da fase anterior para desbloquear esta fase.</p>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalItems = missions.length + phaseGames.length;
  const completedItems = (userProgress?.completedMissions?.length || 0) + (userProgress?.completedGames?.length || 0);
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="phase-detail-wrapper">
      <Navbar />
      
      <div className="phase-detail-container">
        <div className="phase-header-card">
          <div className="phase-header-content">
            <h1>{phase.title}</h1>
            <p className="phase-description">{phase.description}</p>
            
            <div className="phase-meta-badges">
              <span className="meta-badge">
                <FaStar />
                <span>+{phase.experienceReward || 50} XP</span>
              </span>
              <span className="meta-badge">
                🏆 +{phase.pointsReward || 10} pts
              </span>
              {totalItems > 0 && (
                <span className="meta-badge">
                  📊 Progresso: {completedItems}/{totalItems}
                </span>
              )}
            </div>

            {totalItems > 0 && (
              <div className="phase-progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            )}
          </div>
        </div>

        {!videoWatched ? (
          <div className="video-section-card">
            <div className="video-section-header">
              <h2>📺 Vídeo de Introdução</h2>
              <p>Assista ao vídeo introdutório para desbloquear as atividades desta fase</p>
            </div>

            {!showVideo ? (
              <button onClick={() => setShowVideo(true)} className="btn btn-primary btn-large">
                <FaPlay />
                <span>Assistir Vídeo</span>
              </button>
            ) : (
              <div className="video-content">
                <div className="video-container">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(phase.introVideoUrl)}`}
                    title={phase.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <button onClick={handleWatchVideo} className="btn btn-success btn-large">
                  <FaCheckCircle />
                  <span>Marcar como Assistido</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="video-completed-alert">
            <FaCheckCircle />
            <span>✓ Vídeo assistido! Continue para as atividades</span>
          </div>
        )}

        {missions.length > 0 && (
          <div className="activities-section">
            <h2 className="section-title">🎯 Missões da Fase</h2>
            
            <div className="activities-grid">
              {missions.map((mission, index) => {
                const isUnlocked = isMissionUnlocked(index);
                const isCompleted = isMissionCompleted(mission._id);
                const status = getMissionStatus(mission._id);

                return (
                  <div 
                    key={mission._id}
                    className={`activity-card ${isCompleted ? 'completed' : ''} ${!isUnlocked ? 'locked' : ''} ${status?.hasPending ? 'pending' : ''}`}
                  >
                    <div className="activity-number">{index + 1}</div>
                    
                    <div className="activity-content">
                      <div className="activity-header">
                        <h3>{mission.title}</h3>
                        <div className="activity-badges">
                          {isCompleted && <FaCheckCircle className="status-icon completed" />}
                          {status?.hasPending && !isCompleted && <FaClock className="status-icon pending" />}
                          {!isUnlocked && <FaLock className="status-icon locked" />}
                        </div>
                      </div>
                      
                      <p className="activity-description">{mission.description}</p>

                      {status?.hasPending && !isCompleted && (
                        <div className="pending-badge">
                          ⏳ Aguardando análise do administrador
                        </div>
                      )}

                      <div className="activity-meta">
                        <span className="meta-item">
                          {mission.type === 'video' && '🎥 Vídeo'}
                          {mission.type === 'foto' && '📸 Foto'}
                          {mission.type === 'localizacao' && '📍 Localização'}
                          {mission.type === 'jogos' && '🎮 Jogos'}
                        </span>
                        <span className="meta-item">⭐ +{mission.experienceReward} XP</span>
                        <span className="meta-item">🏆 +{mission.pointsReward} pts</span>
                      </div>
                    </div>
                    
                    <div className="activity-action">
                      {isUnlocked && !isCompleted && !status?.hasPending && (
                        <button onClick={() => navigate(`/mission/${mission._id}`)} className="btn btn-primary btn-sm">
                          <FaPlay /> Iniciar
                        </button>
                      )}
                      {(isCompleted || status?.hasPending) && (
                        <button onClick={() => navigate(`/mission/${mission._id}`)} className="btn btn-outline btn-sm">
                          Ver Detalhes
                        </button>
                      )}
                      {!isUnlocked && (
                        <div className="locked-label">
                          <FaLock /> Bloqueado
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {phaseGames.length > 0 && (
          <div className="activities-section">
            <h2 className="section-title">🎮 Jogos da Fase</h2>
            
            <div className="activities-grid">
              {phaseGames.map((game, index) => {
                const isCompleted = isGameCompleted(game._id);
                const isUnlocked = isGameUnlocked(index);

                return (
                  <div 
                    key={game._id}
                    className={`activity-card ${isCompleted ? 'completed' : ''} ${!isUnlocked ? 'locked' : ''}`}
                  >
                    <div className="activity-number game">{index + 1}</div>
                    
                    <div className="activity-content">
                      <div className="activity-header">
                        <h3>{game.title}</h3>
                        <div className="activity-badges">
                          {isCompleted && <FaCheckCircle className="status-icon completed" />}
                          {!isUnlocked && <FaLock className="status-icon locked" />}
                        </div>
                      </div>

                      {isCompleted && (
                        <div className="completed-badge">
                          ✓ Jogo completado!
                        </div>
                      )}

                      <div className="activity-meta">
                        <span className="meta-item">🎮 {game.type}</span>
                        <span className="meta-item">🏆 {game.points} pts</span>
                        {game.timeLimit > 0 && <span className="meta-item">⏱️ {game.timeLimit}s</span>}
                        <span className="meta-item">🔄 {game.maxAttempts} tentativas</span>
                      </div>
                    </div>
                    
                    <div className="activity-action">
                      {isUnlocked && !isCompleted && (
                        <button onClick={() => navigate(`/game/${game._id}`)} className="btn btn-primary btn-sm">
                          <FaPlay /> Jogar
                        </button>
                      )}
                      {isCompleted && (
                        <button className="btn btn-outline btn-sm" disabled>
                          Completado
                        </button>
                      )}
                      {!isUnlocked && (
                        <div className="locked-label">
                          <FaLock /> {videoWatched ? 'Complete o anterior' : 'Assista o vídeo'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {missions.length === 0 && phaseGames.length === 0 && videoWatched && (
          <div className="empty-state">
            <p>Nenhuma atividade disponível nesta fase ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhaseDetail;
