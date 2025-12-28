import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setupNotificationListener();
    loadNotifications();
  }, []);

  const setupNotificationListener = () => {
    window.addEventListener('message', handleAppNotification);
    
    return () => {
      window.removeEventListener('message', handleAppNotification);
    };
  };

  const handleAppNotification = (event) => {
    try {
      const data = typeof event.data === 'string' 
        ? JSON.parse(event.data) 
        : event.data;

      if (data.type === 'PUSH_NOTIFICATION_RECEIVED') {
        addNotification(data.notification);
        
        if (data.notification.data?.type === 'task_review') {
          handleTaskReviewNotification(data.notification);
        }
      }
    } catch (error) {
      console.error('Erro ao processar notificação:', error);
    }
  };

  const handleTaskReviewNotification = (notification) => {
    const { title, body, data } = notification;
    
    if (data.status === 'approved') {
      toast.success(
        <div>
          <strong>{title}</strong>
          <p>{body}</p>
        </div>,
        {
          autoClose: 5000,
          onClick: () => window.location.href = '/dashboard'
        }
      );
    } else {
      toast.error(
        <div>
          <strong>{title}</strong>
          <p>{body}</p>
        </div>,
        {
          autoClose: 5000,
          onClick: () => window.location.href = '/dashboard'
        }
      );
    }
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      title: notification.title || notification.notification?.title,
      body: notification.body || notification.notification?.body,
      data: notification.data,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    saveNotifications([newNotification, ...notifications]);
  };

  const loadNotifications = () => {
    try {
      const stored = localStorage.getItem('app_notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const saveNotifications = (notifs) => {
    try {
      localStorage.setItem('app_notifications', JSON.stringify(notifs.slice(0, 50)));
    } catch (error) {
      console.error('Erro ao salvar notificações:', error);
    }
  };

  const markAsRead = (id) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    setUnreadCount(0);
    saveNotifications(updated);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('app_notifications');
    setIsOpen(false);
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
    saveNotifications(updated);
  };

  const getNotificationIcon = (notification) => {
    const type = notification.data?.type;
    
    switch(type) {
      case 'task_review':
        return notification.data?.status === 'approved' ? '✅' : '❌';
      case 'phase_unlocked':
        return '🎉';
      case 'achievement':
        return '🏆';
      case 'level_up':
        return '⬆️';
      case 'ranking':
        return '📈';
      default:
        return '🔔';
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    
    const type = notification.data?.type;
    
    switch(type) {
      case 'task_review':
        window.location.href = '/dashboard';
        break;
      case 'phase_unlocked':
        window.location.href = '/phases';
        break;
      case 'achievement':
        window.location.href = '/achievements';
        break;
      case 'ranking':
        window.location.href = '/ranking';
        break;
      default:
        break;
    }
    
    setIsOpen(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <>
      <button 
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notificações"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notificações</h3>
            <div className="notification-actions">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="btn-text">
                  Marcar todas como lidas
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll} className="btn-text btn-danger">
                  Limpar tudo
                </button>
              )}
            </div>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <span className="empty-icon">🔔</span>
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification)}
                  </div>
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.body}</p>
                    <span className="notification-time">
                      {formatTime(notification.timestamp)}
                    </span>
                  </div>
                  <button 
                    className="notification-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    aria-label="Excluir"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" 
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div 
          className="notification-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default NotificationCenter;
