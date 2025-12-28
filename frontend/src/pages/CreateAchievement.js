import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { achievementAPI, phaseAPI, uploadAPI } from '../services/api';
import { FaUpload, FaImage } from 'react-icons/fa';
import './AdminPanel.css';
import './CreateContent.css';

const CreateAchievement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [badgePreview, setBadgePreview] = useState(null);
  const [phases, setPhases] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    badge: '',
    type: 'level',
    requirement: 1,
    rarity: 'comum',
    pointsReward: 50,
    phase: ''
  });

  useEffect(() => {
    fetchPhases();
  }, []);

  const fetchPhases = async () => {
    try {
      const res = await phaseAPI.getAll();
      setPhases(res.data);
    } catch (error) {
      console.error('Erro ao carregar fases:', error);
    }
  };

  const handleBadgeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande! Máximo 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são permitidas');
      return;
    }

    setBadgePreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const response = await uploadAPI.uploadImage(file);
      setFormData(prev => ({ ...prev, badge: response.data.data.url }));
      toast.success('Badge carregado!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload do badge');
      setBadgePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submissionData = {
        ...formData,
        badge: formData.badge || '/badges/default.png'
      };

      if (!submissionData.phase || submissionData.phase === '') {
        delete submissionData.phase;
      }

      await achievementAPI.create(submissionData);
      toast.success('Conquista criada com sucesso!');
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao criar conquista');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['requirement', 'pointsReward'].includes(name)
        ? parseInt(value) || 0 
        : value
    }));
  };

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
              <span className="admin-icon">🏆</span>
              Criar Nova Conquista
            </h1>
            <p>Adicione uma nova conquista ao sistema</p>
          </div>
        </header>

        <div className="content-form-wrapper">
          <form onSubmit={handleSubmit} className="content-form">
            <div className="input-group">
              <label>Badge/Ícone da Conquista</label>
              
              {badgePreview || formData.badge ? (
                <div style={{ 
                  width: '120px', 
                  height: '120px', 
                  margin: '0 auto 1rem',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '4px solid var(--admin-primary)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}>
                  <img 
                    src={badgePreview || formData.badge} 
                    alt="Badge preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div style={{
                  width: '120px',
                  height: '120px',
                  margin: '0 auto 1rem',
                  borderRadius: '50%',
                  background: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed #d1d5db'
                }}>
                  <FaImage style={{ fontSize: '3rem', color: '#9ca3af' }} />
                </div>
              )}

              <label htmlFor="badge-upload" className="btn btn-outline" style={{ cursor: 'pointer' }}>
                <FaUpload />
                <span>{uploading ? 'Fazendo upload...' : (formData.badge ? 'Alterar Badge' : 'Fazer Upload do Badge')}</span>
              </label>
              <input
                id="badge-upload"
                type="file"
                accept="image/*"
                onChange={handleBadgeUpload}
                style={{ display: 'none' }}
                disabled={uploading}
              />
              <small style={{ display: 'block', marginTop: '0.5rem', textAlign: 'center', color: '#6b7280' }}>
                PNG ou JPG • Recomendado: 512x512px • Máximo 5MB
              </small>
            </div>

            <div className="input-group">
              <label>Título da Conquista *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: Mestre da Caatinga"
                required
              />
            </div>

            <div className="input-group">
              <label>Descrição *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descreva como desbloquear esta conquista..."
                rows="3"
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
                  <option value="level">Alcançar Nível</option>
                  <option value="points">Acumular Pontos</option>
                  <option value="mission">Completar Missões</option>
                  <option value="games">Completar Jogos</option>
                  <option value="phase">Completar Fases</option>
                  <option value="special">Especial</option>
                </select>
              </div>

              <div className="input-group">
                <label>Raridade *</label>
                <select
                  name="rarity"
                  value={formData.rarity}
                  onChange={handleChange}
                  required
                >
                  <option value="comum">Comum</option>
                  <option value="raro">Raro</option>
                  <option value="epico">Épico</option>
                  <option value="lendario">Lendário</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Requisito *</label>
                <input
                  type="number"
                  name="requirement"
                  value={formData.requirement}
                  onChange={handleChange}
                  min="1"
                  required
                />
                <small>
                  {formData.type === 'level' && 'Nível necessário'}
                  {formData.type === 'points' && 'Pontos necessários'}
                  {formData.type === 'mission' && 'Missões a completar'}
                  {formData.type === 'games' && 'Jogos a completar'}
                  {formData.type === 'phase' && 'Fases a completar'}
                  {formData.type === 'special' && 'Valor do requisito'}
                </small>
              </div>

              <div className="input-group">
                <label>Recompensa de Pontos *</label>
                <input
                  type="number"
                  name="pointsReward"
                  value={formData.pointsReward}
                  onChange={handleChange}
                  min="0"
                  required
                />
                <small>Pontos ganhos ao desbloquear</small>
              </div>
            </div>

            <div className="input-group">
              <label>Fase Relacionada (opcional)</label>
              <select
                name="phase"
                value={formData.phase}
                onChange={handleChange}
              >
                <option value="">Nenhuma fase específica</option>
                {phases.map(phase => (
                  <option key={phase._id} value={phase._id}>
                    {phase.title}
                  </option>
                ))}
              </select>
              <small>Vincule esta conquista a uma fase específica (opcional)</small>
            </div>

            <div className="form-actions">
              <Link to="/admin" className="btn btn-outline">
                Cancelar
              </Link>
              <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
                {loading ? 'Criando...' : 'Criar Conquista'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAchievement;
