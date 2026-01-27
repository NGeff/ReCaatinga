import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './MobileMenu.css';

const MobileMenu = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="mobile-menu">
      <div className="mobile-menu-header">
        <button className="mobile-menu-back" onClick={goBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="mobile-menu-title">Menu</h1>
      </div>

      <div className="mobile-menu-user">
        <div className="mobile-menu-avatar-container">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="mobile-menu-avatar" />
          ) : (
            <div className="mobile-menu-avatar-placeholder">
              <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            </div>
          )}
        </div>
        <div className="mobile-menu-user-info">
          <h2 className="mobile-menu-user-name">{user?.name || 'Usuário'}</h2>
          <p className="mobile-menu-user-level">Nível {user?.level || 1}</p>
        </div>
      </div>

      <div className="mobile-menu-divider"></div>

      <nav className="mobile-menu-nav">
        <Link 
          to="/dashboard" 
          className={`mobile-menu-item ${isActive('/dashboard') ? 'active' : ''}`}
        >
          <div className="mobile-menu-item-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
              <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
              <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
              <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="mobile-menu-item-content">
            <span className="mobile-menu-item-title">Dashboard</span>
            <span className="mobile-menu-item-subtitle">Visão geral do seu progresso</span>
          </div>
        </Link>

        <Link 
          to="/phases" 
          className={`mobile-menu-item ${isActive('/phases') ? 'active' : ''}`}
        >
          <div className="mobile-menu-item-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 16V8C3 8 3 16 21 16Z" stroke="currentColor" strokeWidth="2"/>
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="mobile-menu-item-content">
            <span className="mobile-menu-item-title">Fases</span>
            <span className="mobile-menu-item-subtitle">Explore as fases do jogo</span>
          </div>
        </Link>

        <Link 
          to="/ranking" 
          className={`mobile-menu-item ${isActive('/ranking') ? 'active' : ''}`}
        >
          <div className="mobile-menu-item-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="mobile-menu-item-content">
            <span className="mobile-menu-item-title">Ranking</span>
            <span className="mobile-menu-item-subtitle">Veja sua posição no ranking</span>
          </div>
        </Link>

        <Link 
          to="/achievements" 
          className={`mobile-menu-item ${isActive('/achievements') ? 'active' : ''}`}
        >
          <div className="mobile-menu-item-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 9C6 10.5913 6.63214 12.1174 7.75736 13.2426C8.88258 14.3679 10.4087 15 12 15C13.5913 15 15.1174 14.3679 16.2426 13.2426C17.3679 12.1174 18 10.5913 18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M9 22V18M15 22V18M12 15V18M12 18H15M12 18H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="6" r="4" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="mobile-menu-item-content">
            <span className="mobile-menu-item-title">Conquistas</span>
            <span className="mobile-menu-item-subtitle">Suas medalhas e troféus</span>
          </div>
        </Link>

        <Link 
          to="/profile" 
          className={`mobile-menu-item ${isActive('/profile') ? 'active' : ''}`}
        >
          <div className="mobile-menu-item-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="mobile-menu-item-content">
            <span className="mobile-menu-item-title">Meu Perfil</span>
            <span className="mobile-menu-item-subtitle">Edite suas informações</span>
          </div>
        </Link>

        {isAdmin && (
          <Link 
            to="/admin" 
            className={`mobile-menu-item ${isActive('/admin') ? 'active' : ''}`}
          >
            <div className="mobile-menu-item-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="mobile-menu-item-content">
              <span className="mobile-menu-item-title">Painel Admin</span>
              <span className="mobile-menu-item-subtitle">Gerenciar conteúdo</span>
            </div>
          </Link>
        )}
      </nav>

      <div className="mobile-menu-divider"></div>

      <div className="mobile-menu-settings">
        <button 
          className="mobile-menu-item logout"
          onClick={handleLogout}
        >
          <div className="mobile-menu-item-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="mobile-menu-item-content">
            <span className="mobile-menu-item-title">Sair</span>
            <span className="mobile-menu-item-subtitle">Desconectar da conta</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default MobileMenu;