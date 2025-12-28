import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { phaseAPI } from '../services/api';
import './AdminPanel.css';
import './CreateContent.css';

const EditPhase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1,
    difficulty: 'facil',
    category: 'educacao',
    experienceReward: 100,
    introVideoUrl: '',
    requiredLevel: 1,
    badge: '',
    badgeTitle: 'Explorador da Caatinga'
  });

  useEffect(() => {
    fetchPhase();
  }, [id]);

  const fetchPhase = async () => {
    try {
      const res = await phaseAPI.getById(id);
      setFormData(res.data);
    } catch (error) {
      toast.error('Erro ao carregar fase');
      navigate('/admin/manage-phases');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await phaseAPI.update(id, formData);
      toast.success('Fase atualizada com sucesso!');
      navigate('/admin/manage-phases');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar fase');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['order', 'experienceReward', 'requiredLevel'].includes(name)
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
            <Link to="/admin/manage-phases" className="back-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Voltar
            </Link>
            <h1>
              <span className="admin-icon">✏️</span>
              Editar Fase
            </h1>
            <p>Atualize as informações da fase</p>
          </div>
        </header>

        <div className="content-form-wrapper">
          <form onSubmit={handleSubmit} className="content-form">
            <div className="input-group">
              <label>Título da Fase *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Descrição *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                required
              />
            </div>

            <div className="form-row">
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
              </div>
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

            <div className="input-group">
              <label>URL do Vídeo de Introdução *</label>
              <input
                type="url"
                name="introVideoUrl"
                value={formData.introVideoUrl || ''}
                onChange={handleChange}
                required
              />
              <small>URL do vídeo de introdução da fase</small>
            </div>

            <div className="input-group">
              <label>Título do Badge</label>
              <input
                type="text"
                name="badgeTitle"
                value={formData.badgeTitle || ''}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>URL do Badge</label>
              <input
                type="text"
                name="badge"
                value={formData.badge || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <Link to="/admin/manage-phases" className="btn btn-outline">
                Cancelar
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

export default EditPhase;
