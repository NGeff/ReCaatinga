import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setUserDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const openMobileMenu = () => {
    navigate('/menu');
  };

  return (
    <nav className={`nav-modern ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/dashboard" className="nav-brand">
          <span className="nav-brand-icon">🌿</span>
          <span className="nav-brand-text">ReCaatinga</span>
        </Link>

        {!isMobile && (
          <>
            <div className="nav-menu">
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActive('/dashboard') ? 'nav-link-active' : ''}`}
              >
                <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                  <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                  <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                  <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>Dashboard</span>
              </Link>

              <Link 
                to="/phases" 
                className={`nav-link ${isActive('/phases') ? 'nav-link-active' : ''}`}
              >
                <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 16V8C3 8 3 16 21 16Z" stroke="currentColor" strokeWidth="2"/>
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>Fases</span>
              </Link>

              <Link 
                to="/ranking" 
                className={`nav-link ${isActive('/ranking') ? 'nav-link-active' : ''}`}
              >
                <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
                <span>Ranking</span>
              </Link>

              <Link 
                to="/achievements" 
                className={`nav-link ${isActive('/achievements') ? 'nav-link-active' : ''}`}
              >
                <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9C6 10.5913 6.63214 12.1174 7.75736 13.2426C8.88258 14.3679 10.4087 15 12 15C13.5913 15 15.1174 14.3679 16.2426 13.2426C17.3679 12.1174 18 10.5913 18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M9 22V18M15 22V18M12 15V18M12 18H15M12 18H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="6" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>Conquistas</span>
              </Link>

              {isAdmin && (
                <Link 
                  to="/admin" 
                  className={`nav-link ${isActive('/admin') ? 'nav-link-active' : ''}`}
                >
                  <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>Admin</span>
                </Link>
              )}
            </div>

            <div className="nav-actions">
              <NotificationCenter />

              <div className="nav-user-menu" ref={userDropdownRef}>
                <button 
                  className="nav-user-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-label="Menu do usuário"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="nav-user-avatar" />
                  ) : (
                    <div className="nav-user-placeholder">
                      <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                    </div>
                  )}
                </button>

                {userDropdownOpen && (
                  <div className="nav-dropdown">
                    <div className="nav-dropdown-header">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="nav-dropdown-avatar" />
                      ) : (
                        <div className="nav-dropdown-placeholder">
                          <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                        </div>
                      )}
                      <div className="nav-dropdown-info">
                        <span className="nav-dropdown-name">{user?.name || 'Usuário'}</span>
                        <span className="nav-dropdown-level">Nível {user?.level || 1}</span>
                      </div>
                    </div>

                    <div className="nav-dropdown-divider"></div>

                    <Link 
                      to="/profile" 
                      className="nav-dropdown-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                        <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span>Meu Perfil</span>
                    </Link>

                    {isAdmin && (
                      <Link 
                        to="/admin" 
                        className="nav-dropdown-item"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span>Painel Admin</span>
                      </Link>
                    )}

                    <div className="nav-dropdown-divider"></div>

                    <button 
                      className="nav-dropdown-item nav-dropdown-logout"
                      onClick={handleLogout}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Sair</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {isMobile && (
          <div className="nav-actions">
            <NotificationCenter />

            <div className="nav-user-menu" ref={userDropdownRef}>
              <button 
                className="nav-user-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-label="Menu do usuário"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="nav-user-avatar" />
                ) : (
                  <div className="nav-user-placeholder">
                    <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  </div>
                )}
              </button>

              {userDropdownOpen && (
                <div className="nav-dropdown">
                  <div className="nav-dropdown-header">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="nav-dropdown-avatar" />
                    ) : (
                      <div className="nav-dropdown-placeholder">
                        <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                      </div>
                    )}
                    <div className="nav-dropdown-info">
                      <span className="nav-dropdown-name">{user?.name || 'Usuário'}</span>
                      <span className="nav-dropdown-level">Nível {user?.level || 1}</span>
                    </div>
                  </div>

                  <div className="nav-dropdown-divider"></div>

                  <Link 
                    to="/profile" 
                    className="nav-dropdown-item"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span>Meu Perfil</span>
                  </Link>

                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="nav-dropdown-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span>Painel Admin</span>
                    </Link>
                  )}

                  <div className="nav-dropdown-divider"></div>

                  <button 
                    className="nav-dropdown-item nav-dropdown-logout"
                    onClick={handleLogout}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>

            <button 
              className="nav-hamburger"
              onClick={openMobileMenu}
              aria-label="Menu"
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
