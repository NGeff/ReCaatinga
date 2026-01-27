import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { missionAPI, gameAPI, taskAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaPlay, FaCheckCircle, FaCamera, FaPaperPlane, FaClock, FaTimesCircle, FaBook, FaClipboardList } from 'react-icons/fa';
import './MissionDetail.css';

const MissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mission, setMission] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskStatus, setTaskStatus] = useState(null);

  useEffect(() => {
    fetchMission();
    fetchMySubmissions();
  }, [id]);

  const fetchMission = async () => {
    try {
      const [missionRes, gamesRes] = await Promise.all([
        missionAPI.getById(id),
        gameAPI.getByMission(id).catch(() => ({ data: [] }))
      ]);
      setMission(missionRes.data);
      setGames(gamesRes.data.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar missão');
    } finally {
      setLoading(false);
    }
  };

  const fetchMySubmissions = async () => {
    try {
      const response = await taskAPI.getMySubmissions();
      const missionSubmissions = response.data.filter(sub => sub.mission._id === id);
      const approved = missionSubmissions.find(sub => sub.status === 'approved');
      const pending = missionSubmissions.find(sub => sub.status === 'pending');
      const rejected = missionSubmissions.find(sub => sub.status === 'rejected');
      if (approved) setTaskStatus({ status: 'approved', submission: approved });
      else if (pending) setTaskStatus({ status: 'pending', submission: pending });
      else if (rejected) setTaskStatus({ status: 'rejected', submission: rejected });
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleVideoComplete = async () => {
    try {
      await missionAPI.completeVideo(id);
      toast.success('Missão de vídeo completada!');
      navigate(`/phase/${mission.phase._id || mission.phase}`);
    } catch (error) {
      toast.error('Erro ao completar missão');
    }
  };

  if (loading) return <div className="mission-wrapper"><Navbar /><div className="mission-loading"><div className="loading-spinner"></div><p>Carregando...</p></div></div>;
  if (!mission) return <div className="mission-wrapper"><Navbar /><div className="mission-loading"><p>Missão não encontrada</p></div></div>;

  const canSubmit = taskStatus?.status !== 'approved' && taskStatus?.status !== 'pending';

  const missionIcons = {
    video: '🎥',
    foto: '📸',
    jogos: '🎮',
    formulario: '📋',
    texto: '✍️'
  };

  const missionNames = {
    video: 'Vídeo',
    foto: 'Foto',
    jogos: 'Jogos',
    formulario: 'Formulário',
    texto: 'Texto'
  };

  return (
    <div className="mission-wrapper">
      <Navbar />
      <div className="mission-container">
        <div className="mission-header-card">
          <h1>{mission.title}</h1>
          <p className="mission-description">{mission.description}</p>
          <div className="mission-meta-tags">
            <span className="meta-tag">{missionIcons[mission.type]} {missionNames[mission.type]}</span>
            <span className="meta-tag">⭐ +{mission.experienceReward || 50} XP</span>
            <span className="meta-tag">🏆 +{mission.pointsReward || 10} pts</span>
          </div>
        </div>

        {taskStatus && (
          <div className={`status-alert ${taskStatus.status}`}>
            <div className="status-header">
              {taskStatus.status === 'approved' && <><FaCheckCircle className="status-icon-large success" /><h3 className="status-title success">✓ Missão Completada!</h3><p>Parabéns! Você completou esta missão.</p></>}
              {taskStatus.status === 'pending' && <><FaClock className="status-icon-large warning" /><h3 className="status-title warning">⏳ Aguardando Análise</h3><p>Sua tarefa está sendo analisada.</p></>}
              {taskStatus.status === 'rejected' && <><FaTimesCircle className="status-icon-large error" /><h3 className="status-title error">❌ Tarefa Rejeitada</h3><p>Você pode enviar novamente.</p>{taskStatus.submission.reviewComment && <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>Motivo: {taskStatus.submission.reviewComment}</p>}</>}
            </div>
          </div>
        )}

        {mission.type === 'video' && mission.videoUrl && (
          <div className="section-card">
            <h2>📺 Vídeo da Missão</h2>
            <div className="video-container"><iframe src={`https://www.youtube.com/embed/${getYouTubeId(mission.videoUrl)}`} title={mission.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
            <button onClick={handleVideoComplete} className="btn btn-success btn-block"><FaCheckCircle /><span>Marcar como Assistido</span></button>
          </div>
        )}

        {mission.type === 'foto' && canSubmit && (
          <div className="section-card">
            <h2>📸 Tarefa de Foto</h2>
            <button onClick={() => navigate(`/task-submit/${id}`)} className="btn btn-primary btn-block"><FaCamera /><span>Enviar Foto</span></button>
          </div>
        )}

        {mission.type === 'formulario' && canSubmit && (
          <div className="section-card">
            <h2>📋 Formulário</h2>
            {mission.formTask?.instructions && <div className="task-instructions-box"><p>{mission.formTask.instructions}</p></div>}
            <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '0.75rem', border: '2px solid #86efac' }}>
              <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#15803d' }}>Este formulário contém:</strong>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#166534' }}>
                <li>{mission.formTask?.questions?.length || 0} perguntas</li>
                <li>Tempo estimado: 5-10 minutos</li>
              </ul>
            </div>
            <button onClick={() => navigate(`/form-submit/${id}`)} className="btn btn-primary btn-block"><FaClipboardList /><span>Responder Formulário</span></button>
          </div>
        )}

        {mission.type === 'texto' && canSubmit && (
          <div className="section-card">
            <h2>✍️ Produção de Texto</h2>
            {mission.textTask?.instructions && <div className="task-instructions-box"><p>{mission.textTask.instructions}</p></div>}
            <div style={{ marginBottom: '1rem', padding: '1rem', background: '#fef3c7', borderRadius: '0.75rem', border: '2px solid #fde68a' }}>
              <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#92400e' }}>Requisitos do texto:</strong>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#78350f' }}>
                <li>Mínimo: {mission.textTask?.minWords || 50} palavras</li>
                <li>Máximo: {mission.textTask?.maxWords || 500} palavras</li>
                {mission.textTask?.topics && mission.textTask.topics.length > 0 && (
                  <li>Tópicos: {mission.textTask.topics.join(', ')}</li>
                )}
              </ul>
            </div>
            <button onClick={() => navigate(`/text-submit/${id}`)} className="btn btn-primary btn-block"><FaBook /><span>Escrever Texto</span></button>
          </div>
        )}

        {mission.type === 'jogos' && games.length > 0 && (
          <div className="section-card">
            <h2>🎮 Jogos Educacionais</h2>
            <div className="games-list">
              {games.map((game, index) => (
                <div key={game._id} className="game-item">
                  <div className="game-content">
                    <div className="game-info-section">
                      <div className="game-header"><span className="game-number">{index + 1}</span><h3 className="game-title">{game.title}</h3></div>
                      <div className="game-meta"><span>🎮 {game.type}</span><span>🏆 {game.points} pts</span>{game.timeLimit > 0 && <span>⏱️ {game.timeLimit}s</span>}<span>🔄 {game.maxAttempts} tentativas</span></div>
                    </div>
                    <div className="game-action"><button onClick={() => navigate(`/game/${game._id}`)} className="btn btn-primary"><FaPlay /> <span>Jogar</span></button></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionDetail;
