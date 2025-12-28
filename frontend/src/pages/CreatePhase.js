import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { phaseAPI, uploadAPI } from '../services/api';
import './AdminPanel.css';
import './CreateContent.css';

const CreatePhase = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [badgePreview, setBadgePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'facil',
    category: 'educacao',
    experienceReward: 100,
    pointsReward: 50,
    introVideoUrl: '',
    requiredLevel: 1,
    badge: '',
    badgeTitle: 'Explorador da Caatinga',
    badgeDescription: ''
  });

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
        badge: formData.badge || '/badges/default-phase.png',
        badgeDescription: formData.badgeDescription || `Completou a fase: ${formData.title}`
      };

      await phaseAPI.create(submissionData);
      toast.success('Fase criada com sucesso! A ordem foi definida automaticamente.');
      navigate('/admin/content-manager');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao criar fase');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['experienceReward', 'pointsReward', 'requiredLevel'].includes(name) 
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
            <Link to="/admin/content-manager" className="back-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Voltar
            </Link>
            <h1>
              <span className="admin-icon">🎯</span>
              Criar Nova Fase
            </h1>
            <p>A ordem será definida automaticamente</p>
          </div>
        </header>

        <div className="content-form-wrapper">
          <form onSubmit={handleSubmit} className="content-form">
            <div className="input-group">
              <label>Badge da Fase</label>
              
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
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="#9ca3af" strokeWidth="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="#9ca3af"/>
                    <path d="M3 15l5-5 4 4 6-6 3 3" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}

              <label htmlFor="badge-upload" className="btn btn-outline" style={{ cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
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
              <label>Título da Fase *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: Introdução à Caatinga"
                required
              />
            </div>

            <div className="input-group">
              <label>Descrição *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descreva o conteúdo desta fase..."
                rows="4"
                required
              />
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Dificuldade *</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  required
                >
                  <option value="facil">Fácil</option>
                  <option value="medio">Médio</option>
                  <option value="dificil">Difícil</option>
                </select>
              </div>

              <div className="input-group">
                <label>Categoria *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="educacao">Educação</option>
                  <option value="plantio">Plantio</option>
                  <option value="reciclagem">Reciclagem</option>
                  <option value="monitoramento">Monitoramento</option>
                  <option value="conservacao">Conservação</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Recompensa de XP *</label>
                <input
                  type="number"
                  name="experienceReward"
                  value={formData.experienceReward}
                  onChange={handleChange}
                  min="0"
                  required
                />
                <small>XP ao completar a fase</small>
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
                <small>Pontos ao completar a fase</small>
              </div>
            </div>

            <div className="input-group">
              <label>Nível Necessário *</label>
              <input
                type="number"
                name="requiredLevel"
                value={formData.requiredLevel}
                onChange={handleChange}
                min="1"
                required
              />
              <small>Nível mínimo para acessar</small>
            </div>

            <div className="input-group">
              <label>URL do Vídeo de Introdução *</label>
              <input
                type="url"
                name="introVideoUrl"
                value={formData.introVideoUrl}
                onChange={handleChange}
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
              <small>URL do vídeo de introdução da fase (YouTube, Vimeo, etc.)</small>
            </div>

            <div className="input-group">
              <label>Título do Badge *</label>
              <input
                type="text"
                name="badgeTitle"
                value={formData.badgeTitle}
                onChange={handleChange}
                placeholder="Ex: Explorador da Caatinga"
                required
              />
              <small>Nome do badge que o usuário receberá ao completar</small>
            </div>

            <div className="input-group">
              <label>Descrição do Badge</label>
              <textarea
                name="badgeDescription"
                value={formData.badgeDescription}
                onChange={handleChange}
                placeholder="Ex: Completou com sucesso a fase de introdução..."
                rows="2"
              />
              <small>Descrição que aparecerá no badge do usuário (opcional)</small>
            </div>

            <div className="form-actions">
              <Link to="/admin/content-manager" className="btn btn-outline">
                Cancelar
              </Link>
              <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
                {loading ? 'Criando...' : 'Criar Fase'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePhase;
