import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PlayerCard from '../components/PlayerCard';
import { authAPI, uploadAPI, userAPI, rankingAPI, progressAPI, achievementAPI, phaseAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaCamera, FaUser, FaLock, FaSave, FaTrophy, FaStar, FaGamepad, FaMedal, FaArrowLeft, FaAward, FaCheckCircle } from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewingUser, setViewingUser] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [userBadges, setUserBadges] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  
  const isOwnProfile = !userId || userId === currentUser.id;
  
  const [profileData, setProfileData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    avatar: currentUser.avatar
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      if (isOwnProfile) {
        const [rankRes, progressRes, badgesRes, achievementsRes] = await Promise.all([
          rankingAPI.getUserRank().catch(() => ({ data: { position: 0, totalUsers: 0, user: currentUser } })),
          progressAPI.getOverall().catch(() => ({ data: { 
            user: currentUser,
            completedPhases: 0,
            totalPhases: 0,
            completedGames: 0,
            completedMissions: 0
          }})),
          phaseAPI.getPhaseBadges().catch(() => ({ data: { badges: [] } })),
          achievementAPI.getUserAchievements().catch(() => ({ data: [] }))
        ]);
        setUserRank(rankRes.data);
        setUserProgress(progressRes.data);
        setUserBadges(badgesRes.data.badges || []);
        setUserAchievements(achievementsRes.data || []);
        setViewingUser(currentUser);
      } else {
        const [userRes, rankRes, progressRes] = await Promise.all([
          userAPI.getById(userId),
          rankingAPI.getUserRank(userId).catch(() => ({ data: { position: 0, totalUsers: 0 } })),
          progressAPI.getOverall().catch(() => ({ data: null }))
        ]);
        setViewingUser(userRes.data);
        setUserRank(rankRes.data);
        setUserProgress(progressRes.data);
        setUserBadges(userRes.data.badges || []);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast.error('Erro ao carregar perfil');
      setViewingUser(isOwnProfile ? currentUser : null);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
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

    setAvatarPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const response = await uploadAPI.uploadAvatar(file);
      const newAvatarUrl = response.data.data.url;
      
      setProfileData(prev => ({ ...prev, avatar: newAvatarUrl }));
      
      const updateResponse = await authAPI.updateProfile({ 
        name: profileData.name,
        email: profileData.email,
        avatar: newAvatarUrl 
      });
      
      updateUser(updateResponse.data.user);
      setViewingUser(updateResponse.data.user);
      toast.success('Avatar atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      const message = error.response?.data?.message || 'Erro ao atualizar avatar';
      toast.error(message);
      setAvatarPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToUpdate = {
        name: profileData.name,
        email: profileData.email
      };

      const response = await authAPI.updateProfile(dataToUpdate);
      updateUser(response.data.user);
      setViewingUser(response.data.user);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      const message = error.response?.data?.message || 'Erro ao atualizar perfil';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setSaving(true);

    try {
      await authAPI.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Senha atualizada com sucesso!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      const message = error.response?.data?.message || 'Erro ao atualizar senha';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-wrapper">
        <Navbar />
        <div className="profile-loading">
          <div className="profile-loading-spinner"></div>
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      <Navbar />
      
      <div className="profile-container">
        {!isOwnProfile && (
          <button onClick={() => navigate(-1)} className="back-button">
            <FaArrowLeft />
            <span>Voltar</span>
          </button>
        )}

        <h1 className="profile-title">
          {isOwnProfile ? 'Meu Perfil' : `Perfil de ${viewingUser?.name}`}
        </h1>
        
        <div className="profile-layout">
          <aside className="profile-sidebar">
            <PlayerCard user={viewingUser} rank={userRank?.position} />
            
            {userRank && (
              <div className="rank-card">
                <h3>Classificação</h3>
                <div className="rank-position">
                  <FaTrophy className="trophy-icon" />
                  <span className="position-number">#{userRank.position}</span>
                </div>
                <p className="rank-total">de {userRank.totalUsers} jogadores</p>
              </div>
            )}

            {userProgress && (
              <div className="stats-card">
                <h3>Estatísticas</h3>
                <div className="stat-item">
                  <div className="stat-icon">
                    <FaGamepad />
                  </div>
                  <div>
                    <span className="stat-value">{userProgress.completedGames}</span>
                    <span className="stat-label">Jogos Completados</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">
                    <FaMedal />
                  </div>
                  <div>
                    <span className="stat-value">{userProgress.completedMissions}</span>
                    <span className="stat-label">Missões Completadas</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">
                    <FaStar />
                  </div>
                  <div>
                    <span className="stat-value">{userProgress.completedPhases}</span>
                    <span className="stat-label">Fases Completadas</span>
                  </div>
                </div>
              </div>
            )}
          </aside>

          <main className="profile-main">
            {isOwnProfile ? (
              <div className="profile-content">
                <div className="tabs-header">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                  >
                    <FaUser />
                    <span>Perfil</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('badges')}
                    className={`tab-button ${activeTab === 'badges' ? 'active' : ''}`}
                  >
                    <FaAward />
                    <span>Badges</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('achievements')}
                    className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
                  >
                    <FaTrophy />
                    <span>Conquistas</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('password')}
                    className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
                  >
                    <FaLock />
                    <span>Segurança</span>
                  </button>
                </div>

                {activeTab === 'profile' && (
                  <form onSubmit={handleProfileSubmit} className="profile-form">
                    <div className="avatar-section">
                      <div className="avatar-upload">
                        <img
                          src={avatarPreview || profileData.avatar || '/avatars/default-avatar.png'}
                          alt="Avatar"
                          className="avatar-preview"
                        />
                        <label htmlFor="avatar-upload" className="avatar-button">
                          <FaCamera />
                        </label>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          style={{ display: 'none' }}
                          disabled={uploading}
                        />
                      </div>
                      {uploading && <p className="upload-status">Fazendo upload...</p>}
                    </div>

                    <div className="input-group">
                      <label>Nome</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="input-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-block"
                      disabled={saving || uploading}
                    >
                      <FaSave />
                      <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
                    </button>
                  </form>
                )}

                {activeTab === 'badges' && (
                  <div className="profile-view">
                    <div className="info-card">
                      <h3>Meus Badges</h3>
                      {userBadges.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--profile-text-light)', padding: '2rem' }}>
                          Você ainda não desbloqueou nenhum badge. Complete fases para ganhar badges!
                        </p>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                          {userBadges.map((badge, index) => (
                            <div key={index} style={{
                              background: 'white',
                              padding: '1.5rem',
                              borderRadius: '1rem',
                              textAlign: 'center',
                              border: '2px solid var(--profile-border)',
                              transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-4px)';
                              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}>
                              <div style={{
                                width: '80px',
                                height: '80px',
                                margin: '0 auto 1rem',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2.5rem'
                              }}>
                                {badge.badge ? (
                                  <img src={badge.badge} alt={badge.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                  <FaAward style={{ color: 'var(--profile-primary)' }} />
                                )}
                              </div>
                              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--profile-text)', marginBottom: '0.5rem' }}>
                                {badge.title}
                              </h4>
                              {badge.description && (
                                <p style={{ fontSize: '0.875rem', color: 'var(--profile-text-light)', marginBottom: '0.75rem' }}>
                                  {badge.description}
                                </p>
                              )}
                              <p style={{ fontSize: '0.75rem', color: 'var(--profile-text-light)' }}>
                                <FaCheckCircle style={{ marginRight: '0.25rem', color: 'var(--profile-green)' }} />
                                {new Date(badge.earnedAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'achievements' && (
                  <div className="profile-view">
                    <div className="info-card">
                      <h3>Minhas Conquistas</h3>
                      {userAchievements.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--profile-text-light)', padding: '2rem' }}>
                          Você ainda não desbloqueou nenhuma conquista. Continue jogando!
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                          {userAchievements.map((ua) => (
                            <div key={ua._id} style={{
                              background: 'white',
                              padding: '1.5rem',
                              borderRadius: '1rem',
                              border: '2px solid var(--profile-border)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1.5rem'
                            }}>
                              <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                flexShrink: 0
                              }}>
                                {ua.achievement?.badge ? (
                                  <img src={ua.achievement.badge} alt={ua.achievement.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                  <FaTrophy style={{ color: '#f59e0b' }} />
                                )}
                              </div>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--profile-text)', marginBottom: '0.5rem' }}>
                                  {ua.achievement?.title}
                                </h4>
                                <p style={{ fontSize: '0.9375rem', color: 'var(--profile-text-light)', marginBottom: '0.5rem' }}>
                                  {ua.achievement?.description}
                                </p>
                                <p style={{ fontSize: '0.875rem', color: 'var(--profile-text-light)' }}>
                                  <FaCheckCircle style={{ marginRight: '0.25rem', color: 'var(--profile-green)' }} />
                                  Desbloqueado em {new Date(ua.unlockedAt).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                              <div style={{
                                padding: '0.5rem 1rem',
                                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                borderRadius: '0.5rem',
                                fontWeight: '700',
                                color: '#92400e',
                                flexShrink: 0
                              }}>
                                +{ua.achievement?.pointsReward} pts
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'password' && (
                  <form onSubmit={handlePasswordSubmit} className="profile-form">
                    <div className="input-group">
                      <label>Senha Atual</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        required
                        placeholder="Digite sua senha atual"
                      />
                    </div>

                    <div className="input-group">
                      <label>Nova Senha</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        required
                        placeholder="Mínimo 6 caracteres"
                        minLength="6"
                      />
                    </div>

                    <div className="input-group">
                      <label>Confirmar Nova Senha</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        required
                        placeholder="Digite a nova senha novamente"
                        minLength="6"
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-block"
                      disabled={saving}
                    >
                      <FaSave />
                      <span>{saving ? 'Salvando...' : 'Atualizar Senha'}</span>
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="profile-view">
                <div className="info-card">
                  <h3>Sobre</h3>
                  <div className="info-item">
                    <div className="info-icon">
                      <FaUser />
                    </div>
                    <div>
                      <span className="info-label">Nome</span>
                      <span className="info-value">{viewingUser.name}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-icon">
                      <FaStar />
                    </div>
                    <div>
                      <span className="info-label">Nível</span>
                      <span className="info-value">{viewingUser.level}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-icon">
                      <FaTrophy />
                    </div>
                    <div>
                      <span className="info-label">Pontos Totais</span>
                      <span className="info-value">{viewingUser.totalPoints}</span>
                    </div>
                  </div>
                </div>

                {userBadges.length > 0 && (
                  <div className="info-card" style={{ marginTop: '1.5rem' }}>
                    <h3>Badges Conquistados</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                      {userBadges.map((badge, index) => (
                        <div key={index} style={{
                          background: 'white',
                          padding: '1rem',
                          borderRadius: '0.75rem',
                          textAlign: 'center',
                          border: '2px solid var(--profile-border)'
                        }}>
                          <div style={{
                            width: '60px',
                            height: '60px',
                            margin: '0 auto 0.75rem',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem'
                          }}>
                            {badge.badge ? (
                              <img src={badge.badge} alt={badge.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                              <FaAward style={{ color: 'var(--profile-primary)' }} />
                            )}
                          </div>
                          <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--profile-text)' }}>
                            {badge.title}
                          </h4>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
