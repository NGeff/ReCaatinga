import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Navbar from '../components/Navbar';
import usePushNotifications from '../utils/usePushNotifications';
import './NotificationSettings.css';

const NotificationSettings = () => {
  const { user, updateUser } = useAuth();
  const { permission, requestWebPushPermission, token, isSupported } = usePushNotifications();
  
  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      push: true,
      taskReview: true,
      phaseUnlock: true,
      achievements: true
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.preferences?.notifications) {
      setPreferences({
        notifications: {
          ...preferences.notifications,
          ...user.preferences.notifications
        }
      });
    }
  }, [user]);

  const handleToggle = (key) => {
    setPreferences(prev => ({
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await authAPI.updateProfile({
        preferences: {
          ...user.preferences,
          notifications: preferences.notifications
        }
      });

      updateUser(response.data.user);
      toast.success('Preferências de notificação atualizadas!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar preferências');
    } finally {
      setLoading(false);
    }
  };

  const handleEnablePush = async () => {
    if (permission === 'denied') {
      toast.error('Você precisa permitir notificações nas configurações do navegador');
      return;
    }

    try {
      await requestWebPushPermission();
      toast.success('Notificações push habilitadas!');
    } catch (error) {
      console.error('Erro ao habilitar push:', error);
      toast.error('Erro ao habilitar notificações push');
    }
  };

  const getPermissionStatus = () => {
    if (!isSupported) return { text: 'Não suportado', color: '#6b7280', icon: '❌' };
    
    switch(permission) {
      case 'granted':
        return { text: 'Habilitadas', color: '#10b981', icon: '✅' };
      case 'denied':
        return { text: 'Bloqueadas', color: '#ef4444', icon: '🚫' };
      default:
        return { text: 'Não habilitadas', color: '#f59e0b', icon: '⚠️' };
    }
  };

  const status = getPermissionStatus();

  return (
    <div className="page-wrapper">
      <Navbar />
      
      <div className="page-container">
        <div className="page-header">
          <h1>
            <span className="page-icon">🔔</span>
            Configurações de Notificações
          </h1>
          <p>Gerencie como deseja receber notificações</p>
        </div>

        <div className="settings-layout">
          <div className="settings-card">
            <div className="card-header">
              <h2>Status das Notificações Push</h2>
            </div>

            <div className="push-status">
              <div className="status-indicator">
                <span className="status-icon" style={{ color: status.color }}>
                  {status.icon}
                </span>
                <div>
                  <h3>Notificações Push</h3>
                  <p style={{ color: status.color, fontWeight: 600 }}>
                    {status.text}
                  </p>
                </div>
              </div>

              {token && (
                <div className="device-info">
                  <small>Dispositivo registrado</small>
                  <code>{token.substring(0, 20)}...</code>
                </div>
              )}

              {permission !== 'granted' && isSupported && (
                <button 
                  onClick={handleEnablePush}
                  className="btn btn-primary"
                  disabled={permission === 'denied'}
                >
                  {permission === 'denied' 
                    ? 'Bloqueado pelo Navegador' 
                    : 'Habilitar Notificações Push'}
                </button>
              )}
            </div>
          </div>

          <div className="settings-card">
            <div className="card-header">
              <h2>Preferências de Notificação</h2>
            </div>

            <div className="preferences-list">
              <div className="preference-item">
                <div className="preference-info">
                  <h3>📧 Notificações por Email</h3>
                  <p>Receba atualizações importantes por email</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.email}
                    onChange={() => handleToggle('email')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="preference-item">
                <div className="preference-info">
                  <h3>📱 Notificações Push</h3>
                  <p>Receba notificações instantâneas no dispositivo</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.push}
                    onChange={() => handleToggle('push')}
                    disabled={permission !== 'granted'}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="preference-divider"></div>

              <div className="preference-item">
                <div className="preference-info">
                  <h3>✅ Revisão de Tarefas</h3>
                  <p>Seja notificado quando suas tarefas forem revisadas</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.taskReview}
                    onChange={() => handleToggle('taskReview')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="preference-item">
                <div className="preference-info">
                  <h3>🎉 Novas Fases</h3>
                  <p>Notificações quando uma nova fase for desbloqueada</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.phaseUnlock}
                    onChange={() => handleToggle('phaseUnlock')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="preference-item">
                <div className="preference-info">
                  <h3>🏆 Conquistas</h3>
                  <p>Seja notificado quando conquistar novas badges</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.achievements}
                    onChange={() => handleToggle('achievements')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="card-footer">
              <button 
                onClick={handleSave}
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar Preferências'}
              </button>
            </div>
          </div>

          <div className="settings-card">
            <div className="card-header">
              <h2>Informações</h2>
            </div>

            <div className="info-list">
              <div className="info-item">
                <span className="info-icon">ℹ️</span>
                <p>
                  As notificações por email são enviadas automaticamente quando eventos importantes acontecem.
                </p>
              </div>
              <div className="info-item">
                <span className="info-icon">🔒</span>
                <p>
                  Suas preferências são privadas e podem ser alteradas a qualquer momento.
                </p>
              </div>
              <div className="info-item">
                <span className="info-icon">⚡</span>
                <p>
                  Notificações push funcionam melhor quando você usa o app instalado no dispositivo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
