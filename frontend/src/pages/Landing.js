import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="nav-container">
          <Link to="/" className="brand">
            <span className="brand-icon">🌿</span>
            <span className="brand-text">ReCaatinga</span>
          </Link>
          <div className="nav-links">
            <Link to="/about" className="nav-item">Sobre</Link>
            <Link to="/login" className="nav-btn">Entrar</Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="hero-section">
          <div className="container">
            <div className="hero-grid">
              <div className="hero-text">
                <span className="badge">🌱 Educação Ambiental</span>
                <h1 className="hero-title">
                  Regenere a <span className="highlight">Caatinga</span> através da Tecnologia
                </h1>
                <p className="hero-description">
                  Participe de missões práticas, aprenda jogando e contribua para 
                  preservar o único bioma exclusivamente brasileiro.
                </p>
                <div className="hero-actions">
                  <Link to="/register" className="btn-hero-primary">
                    <span>Começar Agora</span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                  <Link to="/about" className="btn-hero-secondary">
                    Saiba Mais
                  </Link>
                </div>
                <div className="hero-stats">
                  <div className="stat-item">
                    <span className="stat-number">20+</span>
                    <span className="stat-label">Missões</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">100+</span>
                    <span className="stat-label">Atividades</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">∞</span>
                    <span className="stat-label">Impacto</span>
                  </div>
                </div>
              </div>
              <div className="hero-visual">
                <div className="video-card">
                  <div className="video-frame">
                    <iframe
                      src="https://www.youtube.com/embed/QIGXA8kSICo?rel=0&modestbranding=1"
                      title="ReCaatinga"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="video-decorator"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="container">
            <div className="section-intro">
              <h2 className="section-title">Aprenda Fazendo</h2>
              <p className="section-subtitle">
                Transforme conhecimento em ação através de atividades práticas e interativas
              </p>
            </div>
            
            <div className="features-grid">
              <div className="feature-box">
                <div className="feature-icon green">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3>Missões em Campo</h3>
                <p>Documente ações reais de plantio e conservação com fotos e geolocalização</p>
              </div>

              <div className="feature-box">
                <div className="feature-icon blue">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18 3v2.8M18 18.2V21M21 8.4h-2.8M13.8 8.4H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>Jogos Educativos</h3>
                <p>Quiz, memória e puzzles sobre o ecossistema da Caatinga</p>
              </div>

              <div className="feature-box">
                <div className="feature-icon purple">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M16 18L18.29 15.71L13.41 10.83L9.41 14.83L2 7.41L3.41 6L9.41 12L13.41 8L19.71 14.3L22 12V18H16Z" fill="currentColor"/>
                  </svg>
                </div>
                <h3>Sistema de Recompensas</h3>
                <p>Ganhe pontos, suba de nível e destaque-se no ranking global</p>
              </div>

              <div className="feature-box">
                <div className="feature-icon orange">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>Vídeo Aulas</h3>
                <p>Conteúdo educacional rico sobre flora, fauna e conservação</p>
              </div>
            </div>
          </div>
        </section>

        <section className="activities-section">
          <div className="container">
            <div className="activities-header">
              <div className="activities-text">
                <span className="section-tag">Atividades</span>
                <h2 className="activities-title">Múltiplas Formas de Participar</h2>
                <p className="activities-description">
                  Escolha como você quer contribuir para a preservação da Caatinga
                </p>
              </div>
            </div>

            <div className="activities-list">
              <div className="activity-card card-1">
                <div className="activity-content">
                  <div className="activity-icon-wrapper">
                    <svg className="activity-icon" width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <path d="M15 10L19.553 7.724C20.1174 7.44193 20.3996 7.3009 20.6414 7.34827C20.8532 7.39001 21.0387 7.51617 21.1531 7.69787C21.2836 7.90413 21.2836 8.22337 21.2836 8.86185V15.1382C21.2836 15.7766 21.2836 16.0959 21.1531 16.3021C21.0387 16.4838 20.8532 16.61 20.6414 16.6517C20.3996 16.6991 20.1174 16.5581 19.553 16.276L15 14M5 14.8V9.2C5 8.0799 5 7.51984 5.21799 7.09202C5.40973 6.71569 5.71569 6.40973 6.09202 6.21799C6.51984 6 7.0799 6 8.2 6H11.8C12.9201 6 13.4802 6 13.908 6.21799C14.2843 6.40973 14.5903 6.71569 14.782 7.09202C15 7.51984 15 8.0799 15 9.2V14.8C15 15.9201 15 16.4802 14.782 16.908C14.5903 17.2843 14.2843 17.5903 13.908 17.782C13.4802 18 12.9201 18 11.8 18H8.2C7.0799 18 6.51984 18 6.09202 17.782C5.71569 17.5903 5.40973 17.2843 5.21799 16.908C5 16.4802 5 15.9201 5 14.8Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <h3>Vídeo Aulas</h3>
                  <p>Aprenda sobre o bioma através de conteúdo audiovisual educativo</p>
                </div>
              </div>

              <div className="activity-card card-2">
                <div className="activity-content">
                  <div className="activity-icon-wrapper">
                    <svg className="activity-icon" width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M3 16V8C3 6.89543 3.89543 6 5 6H19C20.1046 6 21 6.89543 21 8V16C21 17.1046 20.1046 18 19 18H5C3.89543 18 3 17.1046 3 16Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M7 6V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V6" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <h3>Missões Fotográficas</h3>
                  <p>Registre espécies nativas e ações de conservação em campo</p>
                </div>
              </div>

              <div className="activity-card card-3">
                <div className="activity-content">
                  <div className="activity-icon-wrapper">
                    <svg className="activity-icon" width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3>Desafios Interativos</h3>
                  <p>Quiz, jogos de memória e puzzles sobre o ecossistema</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container">
            <div className="cta-box">
              <div className="cta-content">
                <h2 className="cta-title">Pronto para Fazer a Diferença?</h2>
                <p className="cta-text">
                  Junte-se a centenas de estudantes que já estão ajudando a regenerar a Caatinga
                </p>
                <Link to="/register" className="btn-cta">
                  Criar Conta Grátis
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
              <div className="cta-visual">
                <div className="cta-circle circle-1"></div>
                <div className="cta-circle circle-2"></div>
                <div className="cta-circle circle-3"></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="footer-brand">
                <span className="footer-logo">🌿</span>
                <span className="footer-name">ReCaatinga</span>
              </div>
              <p className="footer-desc">
                Regenerando a Caatinga através da educação ambiental e tecnologia
              </p>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">Navegação</h4>
              <Link to="/about" className="footer-link">Sobre o Projeto</Link>
              <Link to="/terms" className="footer-link">Termos de Uso</Link>
              <Link to="/privacy" className="footer-link">Privacidade</Link>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">Apoio</h4>
              <p className="footer-info">Fapeal - Pibic Jr</p>
              <p className="footer-info">E.E. Professora Joanita de Melo</p>
              <p className="footer-info">Ouro Branco, AL</p>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2024 ReCaatinga - Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
