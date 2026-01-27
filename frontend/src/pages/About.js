import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  const team = [
    { name: 'Ana Beatryz', role: 'Pesquisa' },
    { name: 'Geferson Amaro', role: 'Tecnologia' },
    { name: 'Jalys Emanoel', role: 'Tecnologia' },
    { name: 'Davi Vieira', role: 'Pesquisa' },
    { name: 'Jamilly Gonçalves', role: 'Social' },
    { name: 'Ysley Santos', role: 'Pesquisa' },
    { name: 'Vinícius Rodrigues', role: 'Pesquisa' },
    { name: 'Maria Kawany', role: 'Social' },
    { name: 'Willyelma Gomes', role: 'Pesquisa' },
    { name: 'Lucas Guilherme', role: 'Tecnologia' }
  ];

  const achievements = [
    {
      title: 'CBAC 2025',
      description: 'Representou Alagoas na 5ª Conferência Brasileira de Aprendizagem Criativa',
      icon: '🏆'
    },
    {
      title: 'COP30',
      description: 'Classificado entre os 5 projetos mais apoiados para COP30 em Belém',
      icon: '🌍'
    }
  ];

  const impacts = [
    'Recuperação de áreas degradadas',
    'Plantio de vegetação nativa',
    'Reaproveitamento de resíduos',
    'Monitoramento de ecossistemas',
    'Protagonismo juvenil',
    'Educação ambiental'
  ];

  return (
    <div className="about-page">
      <nav className="about-nav">
        <div className="about-nav-container">
          <Link to="/" className="about-brand">
            <span className="about-brand-icon">🌿</span>
            <span>ReCaatinga</span>
          </Link>
          <Link to="/" className="about-back-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Voltar</span>
          </Link>
        </div>
      </nav>

      <main className="about-main">
        <section className="about-hero-section">
          <div className="about-container">
            <div className="about-hero-badge">
              <span className="badge-icon">🌱</span>
              <span>Projeto de Inovação</span>
            </div>
            <h1 className="about-hero-title">
              Sobre o <span className="text-highlight">ReCaatinga</span>
            </h1>
            <p className="about-hero-description">
              Regenerando a Caatinga através de ciência, tecnologia e educação ambiental
            </p>
          </div>
        </section>

        <section className="about-story-section">
          <div className="about-container">
            <div className="story-grid">
              <div className="story-content">
                <div className="story-tag">Nossa História</div>
                <h2 className="story-title">O que é o ReCaatinga?</h2>
                <p className="story-text">
                  O ReCaatinga é um projeto de pesquisa e inovação social e ambiental 
                  idealizado para regenerar áreas degradadas do semiárido, mais 
                  precisamente da Caatinga, usando ciência e tecnologia.
                </p>
                <p className="story-text">
                  Desenvolvido por estudantes do Ensino Médio da Escola Estadual 
                  Professora Joanita de Melo, em Ouro Branco, Alagoas, com apoio da 
                  Fundação de Amparo à Pesquisa do Estado de Alagoas (Fapeal), através 
                  do programa Pibic Jr.
                </p>
              </div>
              <div className="story-visual">
                <div className="visual-card card-green">
                  <div className="visual-icon">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h3>Metodologia</h3>
                  <p>Gamificação de ações ambientais através de missões práticas</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-mission-section">
          <div className="about-container">
            <div className="mission-header">
              <h2 className="section-title-center">Objetivos e Metodologia</h2>
              <p className="section-description">
                Uma evolução constante em prol da preservação ambiental
              </p>
            </div>
            <div className="mission-content">
              <div className="mission-card">
                <div className="mission-number">01</div>
                <h3>Proposta Original</h3>
                <p>
                  Criar uma ferramenta digital para mapear áreas degradadas no 
                  semiárido e sugerir soluções sustentáveis
                </p>
              </div>
              <div className="mission-card">
                <div className="mission-number">02</div>
                <h3>Evolução</h3>
                <p>
                  Plataforma interativa que gamifica ações de restauração e 
                  preservação através de missões e jogos educacionais
                </p>
              </div>
              <div className="mission-card">
                <div className="mission-number">03</div>
                <h3>Impacto</h3>
                <p>
                  Monitoramento contínuo e engajamento de estudantes em ações 
                  práticas de conservação ambiental
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-coordinator-section">
          <div className="about-container">
            <div className="coordinator-box">
              <div className="coordinator-avatar">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="coordinator-content">
                <span className="coordinator-label">Coordenação</span>
                <h3 className="coordinator-name">Professor Marcos Alves</h3>
                <p className="coordinator-description">
                  Coordenador do projeto, responsável por unir seu amor pela Caatinga 
                  com tecnologia, transformando inquietação em inovação
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-team-section">
          <div className="about-container">
            <div className="team-header">
              <h2 className="section-title-center">Nossa Equipe</h2>
              <p className="section-description">
                10 bolsistas do Pibic Jr trabalhando pela regeneração da Caatinga
              </p>
            </div>
            <div className="team-grid">
              {team.map((member, index) => (
                <div key={index} className="team-member">
                  <div className="member-avatar">
                    <span className="avatar-text">{member.name.charAt(0)}</span>
                  </div>
                  <h3 className="member-name">{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                  <span className="member-badge">Bolsista Pibic Jr</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="about-achievements-section">
          <div className="about-container">
            <div className="achievements-header">
              <h2 className="section-title-center">Reconhecimento</h2>
              <p className="section-description">
                Destaque nacional em inovação e sustentabilidade
              </p>
            </div>
            <div className="achievements-grid">
              {achievements.map((achievement, index) => (
                <div key={index} className="achievement-card">
                  <div className="achievement-icon">{achievement.icon}</div>
                  <h3 className="achievement-title">{achievement.title}</h3>
                  <p className="achievement-description">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="about-impact-section">
          <div className="about-container">
            <div className="impact-box">
              <div className="impact-content">
                <h2 className="impact-title">Impactos Esperados</h2>
                <p className="impact-intro">
                  Transformações positivas para o meio ambiente e a sociedade
                </p>
                <div className="impact-grid">
                  {impacts.map((impact, index) => (
                    <div key={index} className="impact-item">
                      <svg className="impact-check" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#dcfce7"/>
                        <path d="M8 12L11 15L16 9" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{impact}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-support-section">
          <div className="about-container">
            <div className="support-box">
              <h2 className="support-title">Apoio Institucional</h2>
              <div className="support-cards">
                <div className="support-card">
                  <div className="support-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3>Fapeal</h3>
                  <p>Fundação de Amparo à Pesquisa do Estado de Alagoas</p>
                  <span className="support-badge">Programa Pibic Jr</span>
                </div>
                <div className="support-card">
                  <div className="support-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M3 8H21" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="8" cy="14" r="1.5" fill="currentColor"/>
                      <circle cx="16" cy="14" r="1.5" fill="currentColor"/>
                    </svg>
                  </div>
                  <h3>E.E. Professora Joanita de Melo</h3>
                  <p>Ouro Branco, Alagoas</p>
                  <span className="support-badge">Ensino Médio</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="about-footer">
        <div className="about-container">
          <div className="footer-content">
            <div className="footer-brand-section">
              <div className="footer-brand">
                <span className="footer-icon">🌿</span>
                <span>ReCaatinga</span>
              </div>
              <p className="footer-tagline">
                Regenerando a Caatinga com ciência e tecnologia
              </p>
            </div>
            <div className="footer-links">
              <Link to="/">Início</Link>
              <Link to="/terms">Termos de Uso</Link>
              <Link to="/privacy">Privacidade</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 ReCaatinga - Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
