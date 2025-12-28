import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { notificationAPI, userAPI } from '../services/api';
import './AdminPanel.css';
import './AdminNotifications.css';

const AdminNotifications = () => {
  const [users, setUsers] = useState([]);
  const [notification, setNotification] = useState({
    title: '',
    body: '',
    type: 'all'
  });
  const [selectedUser, setSelectedUser] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, historyRes] = await Promise.all([
        userAPI.getAll(),
        notificationAPI.getHistory().catch(() => ({ data: [] }))
      ]);
      setUsers(usersRes.data);
      setHistory(historyRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!notification.title || !notification.body) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      if (notification.type === 'all') {
        await notificationAPI.sendToAll({
          title: notification.title,
          body: notification.body
        });
        toast.success('Notificação enviada para todos');
      } else {
        if (!selectedUser) {
          toast.error('Selecione um usuário');
          setLoading(false);
          return;
        }
        await notificationAPI.sendToUser(selectedUser, {
          title: notification.title,
          body: notification.body
        });
        toast.success('Notificação enviada');
      }
      
      setNotification({ title: '', body: '', type: 'all' });
      setSelectedUser('');
      fetchData();
    } catch (error) {
      toast.error('Erro ao enviar notificação');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
              <span className="admin-icon">🔔</span>
              Notificações
            </h1>
            <p>Envie notificações para os usuários</p>
          </div>
        </header>

        <div className="notifications-layout">
          <section className="notification-form-section">
            <h2>Enviar Notificação</h2>
            <form onSubmit={handleSend} className="notification-form">
              <div className="input-group">
                <label>Tipo de Envio</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="all"
                      checked={notification.type === 'all'}
                      onChange={(e) => setNotification({ ...notification, type: e.target.value })}
                    />
                    <span>Todos os Usuários</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="user"
                      checked={notification.type === 'user'}
                      onChange={(e) => setNotification({ ...notification, type: e.target.value })}
                    />
                    <span>Usuário Específico</span>
                  </label>
                </div>
              </div>

              {notification.type === 'user' && (
                <div className="input-group">
                  <label>Selecionar Usuário</label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    required={notification.type === 'user'}
                  >
                    <option value="">Escolha um usuário</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.name} - {user.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="input-group">
                <label>Título</label>
                <input
                  type="text"
                  value={notification.title}
                  onChange={(e) => setNotification({ ...notification, title: e.target.value })}
                  placeholder="Ex: Nova fase disponível!"
                  required
                />
              </div>

              <div className="input-group">
                <label>Mensagem</label>
                <textarea
                  value={notification.body}
                  onChange={(e) => setNotification({ ...notification, body: e.target.value })}
                  placeholder="Digite a mensagem da notificação..."
                  rows="4"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Notificação'}
              </button>
            </form>
          </section>

          <section className="notification-history">
            <h2>Histórico de Notificações</h2>
            <div className="history-list">
              {history.length === 0 ? (
                <div className="empty-state">
                  <p>Nenhuma notificação enviada ainda</p>
                </div>
              ) : (
                history.map((item, index) => (
                  <div key={index} className="history-item">
                    <div className="history-header">
                      <h4>{item.title}</h4>
                      <span className="history-date">
                        {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p>{item.body}</p>
                    <div className="history-meta">
                      <span className="history-type">
                        {item.type === 'all' ? '📢 Todos' : '👤 Individual'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
