import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { gameAPI, phaseAPI, missionAPI } from '../services/api';
import './AdminPanel.css';
import './CreateContent.css';

const EditGame = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phases, setPhases] = useState([]);
  const [missions, setMissions] = useState([]);
  const [formData, setFormData] = useState({
    phase: '',
    mission: '',
    title: '',
    type: 'quiz',
    content: {},
    points: 10,
    timeLimit: 0,
    maxAttempts: 3,
    order: 1
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (formData.phase && phases.length > 0) {
      fetchMissions(formData.phase);
    }
  }, [formData.phase, phases]);

  const fetchData = async () => {
    try {
      const [gameRes, phasesRes] = await Promise.all([
        gameAPI.getById(id),
        phaseAPI.getAll()
      ]);
      
      const game = gameRes.data;
      setFormData({
        ...game,
        phase: game.phase?._id || game.phase,
        mission: game.mission?._id || game.mission,
        content: game.content || {}
      });
      setPhases(phasesRes.data);
    } catch (error) {
      toast.error('Erro ao carregar jogo');
      navigate('/admin/content-manager');
    } finally {
      setLoading(false);
    }
  };

  const fetchMissions = async (phaseId) => {
    try {
      const res = await missionAPI.getByPhase(phaseId);
      const gamesMissions = res.data.filter(m => m.type === 'jogos');
      setMissions(gamesMissions);
    } catch (error) {
      toast.error('Erro ao carregar missões');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await gameAPI.update(id, formData);
      toast.success('Jogo atualizado com sucesso!');
      navigate('/admin/content-manager');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar jogo');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['points', 'timeLimit', 'maxAttempts', 'order'].includes(name)
        ? parseInt(value) || 0 
        : value
    }));
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
            <Link to="/admin/content-manager" className="back-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Voltar
            </Link>
            <h1>
              <span className="admin-icon">✏️</span>
              Editar Jogo
            </h1>
            <p>Atualize as informações do jogo</p>
          </div>
        </header>

        <div className="content-form-wrapper">
          <form onSubmit={handleSubmit} className="content-form">
            <div className="form-row">
              <div className="input-group">
                <label>Fase *</label>
                <select
                  name="phase"
                  value={formData.phase}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione uma fase</option>
                  {phases.map(phase => (
                    <option key={phase._id} value={phase._id}>
                      {phase.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Missão *</label>
                <select
                  name="mission"
                  value={formData.mission}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione uma missão</option>
                  {missions.map(mission => (
                    <option key={mission._id} value={mission._id}>
                      {mission.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Título do Jogo *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Tipo *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="quiz">Quiz</option>
                  <option value="quiz-vf">Quiz Verdadeiro/Falso</option>
                  <option value="memoria">Jogo da Memória</option>
                  <option value="memoria-hibrida">Memória Híbrida (Imagem+Texto)</option>
                  <option value="puzzle">Puzzle</option>
                  <option value="arrastar">Arrastar e Soltar</option>
                  <option value="conexo">Conexo</option>
                  <option value="conectar">Conectar</option>
                  <option value="caca-palavras">Caça-Palavras</option>
                  <option value="ordem-certa">Ordem Certa</option>
                </select>
              </div>

              <div className="input-group">
                <label>Ordem *</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Pontos *</label>
                <input
                  type="number"
                  name="points"
                  value={formData.points}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>

              <div className="input-group">
                <label>Tentativas Máximas *</label>
                <input
                  type="number"
                  name="maxAttempts"
                  value={formData.maxAttempts}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Limite de Tempo (segundos)</label>
              <input
                type="number"
                name="timeLimit"
                value={formData.timeLimit}
                onChange={handleChange}
                min="0"
              />
              <small>0 = sem limite de tempo</small>
            </div>

            <div className="form-actions">
              <Link to="/admin/content-manager" className="btn btn-outline">
                Cancelar
              </Link>
              <Link to={`/admin/edit-game-content/${id}`} className="btn btn-secondary">
                🎮 Editar Conteúdo do Jogo
              </Link>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditGame;
