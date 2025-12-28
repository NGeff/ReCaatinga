import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { phaseAPI } from '../services/api';
import './AdminPanel.css';
import './ManageContent.css';

const ManagePhases = () => {
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhases();
  }, []);

  const fetchPhases = async () => {
    try {
      const res = await phaseAPI.getAll();
      setPhases(res.data.sort((a, b) => a.order - b.order));
    } catch (error) {
      toast.error('Erro ao carregar fases');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta fase? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await phaseAPI.delete(id);
      toast.success('Fase excluída com sucesso!');
      fetchPhases();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao excluir fase');
    }
  };

  if (loading) {
    return (
      <div className="admin-wrapper">
        <Navbar />
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Carregando fases...</p>
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
              Gerenciar Fases
            </h1>
            <p>Visualize, edite e organize as fases</p>
          </div>
          <Link to="/admin/create-phase" className="btn btn-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Nova Fase
          </Link>
        </header>

        <div className="manage-grid">
          {phases.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma fase cadastrada ainda</p>
              <Link to="/admin/create-phase" className="btn btn-primary">
                Criar Primeira Fase
              </Link>
            </div>
          ) : (
            phases.map(phase => (
              <div key={phase._id} className="manage-card">
                <div className="manage-card-header">
                  <span className="phase-order">#{phase.order}</span>
                  <span className={`difficulty-badge ${phase.difficulty}`}>
                    {phase.difficulty === 'facil' ? 'Fácil' : phase.difficulty === 'medio' ? 'Médio' : 'Difícil'}
                  </span>
                </div>
                <div className="manage-card-content">
                  <h3>{phase.title}</h3>
                  <p>{phase.description}</p>
                  <div className="phase-meta">
                    <span>⭐ {phase.experienceReward} XP</span>
                    <span>🎯 Nível {phase.requiredLevel}</span>
                  </div>
                </div>
                <div className="manage-card-actions">
                  <Link to={`/phase/${phase._id}`} className="btn btn-outline">
                    Visualizar
                  </Link>
                  <Link to={`/admin/edit-phase/${phase._id}`} className="btn btn-primary">
                    Editar
                  </Link>
                  <button 
                    onClick={() => handleDelete(phase._id)} 
                    className="btn btn-danger"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagePhases;
