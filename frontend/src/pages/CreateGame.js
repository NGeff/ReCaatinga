import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { gameAPI, phaseAPI, missionAPI } from '../services/api';
import './AdminPanel.css';
import './CreateContent.css';

const CreateGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [phases, setPhases] = useState([]);
  const [missions, setMissions] = useState([]);
  const [formData, setFormData] = useState({
    phase: location.state?.phaseId || '',
    mission: location.state?.missionId || '',
    title: '',
    type: 'quiz',
    content: {},
    points: 10,
    timeLimit: 0,
    maxAttempts: 3
  });

  useEffect(() => {
    fetchPhases();
  }, []);

  useEffect(() => {
    if (formData.phase) {
      fetchMissions(formData.phase);
    } else {
      setMissions([]);
      setFormData(prev => ({ ...prev, mission: '' }));
    }
  }, [formData.phase]);

  const fetchPhases = async () => {
    try {
      const res = await phaseAPI.getAll();
      setPhases(res.data);
    } catch (error) {
      toast.error('Erro ao carregar fases');
    }
  };

  const fetchMissions = async (phaseId) => {
    try {
      const res = await missionAPI.getByPhase(phaseId);
      const gamesMissions = res.data.filter(m => m.type === 'jogos');
      setMissions(gamesMissions);
      
      if (gamesMissions.length === 0) {
        toast.warning('Esta fase não possui missões do tipo "Jogos Educacionais"');
      }
    } catch (error) {
      toast.error('Erro ao carregar missões');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.mission) {
      toast.error('Selecione uma missão do tipo "Jogos Educacionais"');
      return;
    }
    
    setLoading(true);

    try {
      const response = await gameAPI.create(formData);
      toast.success('Jogo criado! Configure o conteúdo agora.');
      navigate(`/admin/edit-game-content/${response.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao criar jogo');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['points', 'timeLimit', 'maxAttempts'].includes(name)
        ? parseInt(value) || 0 
        : value
    }));
  };

  const selectedPhase = phases.find(p => p._id === formData.phase);
  const selectedMission = missions.find(m => m._id === formData.mission);

  const gameTypes = [
    { value: 'quiz', icon: '❓', label: 'Quiz', description: 'Perguntas de múltipla escolha' },
    { value: 'quiz-vf', icon: '✓✗', label: 'Quiz V/F', description: 'Verdadeiro ou Falso' },
    { value: 'memoria', icon: '🎴', label: 'Memória', description: 'Jogo de pares' },
    { value: 'memoria-hibrida', icon: '🔄', label: 'Memória Híbrida', description: 'Texto + Imagem' },
    { value: 'puzzle', icon: '🧩', label: 'Puzzle', description: 'Quebra-cabeça' },
    { value: 'arrastar', icon: '🎯', label: 'Arrastar', description: 'Arrastar e soltar' },
    { value: 'conexo', icon: '🔗', label: 'Conexo', description: 'Agrupar relacionados' },
    { value: 'conectar', icon: '↔️', label: 'Conectar', description: 'Ligar pares' },
    { value: 'caca-palavras', icon: '🔍', label: 'Caça-Palavras', description: 'Encontrar palavras' },
    { value: 'ordem-certa', icon: '🔢', label: 'Ordem Certa', description: 'Ordenar sequência' }
  ];

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
              <span className="admin-icon">🎮</span>
              Criar Novo Jogo
            </h1>
            {location.state?.phaseTitle && location.state?.missionTitle && (
              <p>
                Fase: {location.state.phaseTitle} • Missão: {location.state.missionTitle}
                <br />
                A ordem será definida automaticamente
              </p>
            )}
          </div>
        </header>

        <div className="content-form-wrapper">
          <form onSubmit={handleSubmit} className="content-form">
            <div className="input-group">
              <label>Fase *</label>
              <select
                name="phase"
                value={formData.phase}
                onChange={handleChange}
                required
                disabled={!!location.state?.phaseId}
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
              <label>Missão (Jogos Educacionais) *</label>
              <select
                name="mission"
                value={formData.mission}
                onChange={handleChange}
                required
                disabled={!formData.phase || !!location.state?.missionId}
              >
                <option value="">Selecione uma missão</option>
                {missions.map(mission => (
                  <option key={mission._id} value={mission._id}>
                    {mission.title}
                  </option>
                ))}
              </select>
              {formData.phase && missions.length === 0 && (
                <small className="text-warning">Esta fase não possui missões do tipo "Jogos Educacionais"</small>
              )}
            </div>

            <div className="input-group">
              <label>Título do Jogo *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Ex: Quiz sobre Fotossíntese"
              />
            </div>

            <div className="input-group">
              <label>Tipo de Jogo *</label>
              <div className="game-type-grid">
                {gameTypes.map(gameType => (
                  <label
                    key={gameType.value}
                    className={`game-type-card ${formData.type === gameType.value ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={gameType.value}
                      checked={formData.type === gameType.value}
                      onChange={handleChange}
                    />
                    <div className="game-type-content">
                      <span className="game-type-icon">{gameType.icon}</span>
                      <div>
                        <strong>{gameType.label}</strong>
                        <p>{gameType.description}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-row-3">
              <div className="input-group">
                <label>Pontuação *</label>
                <input
                  type="number"
                  name="points"
                  value={formData.points}
                  onChange={handleChange}
                  min="1"
                  required
                />
                <small>Pontos ao completar</small>
              </div>

              <div className="input-group">
                <label>Tempo Limite</label>
                <input
                  type="number"
                  name="timeLimit"
                  value={formData.timeLimit}
                  onChange={handleChange}
                  min="0"
                />
                <small>Segundos (0 = sem limite)</small>
              </div>

              <div className="input-group">
                <label>Máx. Tentativas *</label>
                <input
                  type="number"
                  name="maxAttempts"
                  value={formData.maxAttempts}
                  onChange={handleChange}
                  min="1"
                  required
                />
                <small>Número de tentativas</small>
              </div>
            </div>

            <div className="alert info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div>
                <strong>Próximo Passo</strong>
                <p>Após criar o jogo, você será direcionado automaticamente para configurar o conteúdo específico (perguntas, imagens, pares, etc.).</p>
              </div>
            </div>

            <div className="form-actions">
              <Link to="/admin/content-manager" className="btn btn-outline">
                Cancelar
              </Link>
              <button type="submit" className="btn btn-primary" disabled={loading || !formData.mission}>
                {loading ? 'Criando...' : 'Criar e Configurar Conteúdo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGame;
