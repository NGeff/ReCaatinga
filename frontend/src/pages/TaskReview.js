import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { taskAPI } from '../services/api';
import { FaCheck, FaTimes, FaEye, FaMapMarkerAlt, FaImage, FaInfoCircle } from 'react-icons/fa';
import './AdminPanel.css';
import './TaskReview.css';

const TaskReview = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    fetchPendingTasks();
  }, []);

  const fetchPendingTasks = async () => {
    try {
      setLoading(true);
      const res = await taskAPI.getPending();
      console.log('Tarefas carregadas:', res.data);
      setTasks(res.data || []);
    } catch (error) {
      console.error('Erro detalhado ao carregar tarefas:', error);
      console.error('Response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Erro ao carregar tarefas');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (taskId, status) => {
    setReviewing(true);
    try {
      await taskAPI.review(taskId, { 
        status, 
        reviewComment: status === 'rejected' ? reviewComment : '' 
      });
      toast.success(`Tarefa ${status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso!`);
      setSelectedTask(null);
      setReviewComment('');
      fetchPendingTasks();
    } catch (error) {
      console.error('Erro ao revisar tarefa:', error);
      toast.error(error.response?.data?.message || 'Erro ao revisar tarefa');
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-wrapper">
        <Navbar />
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Carregando tarefas...</p>
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
              <span className="admin-icon">✅</span>
              Revisar Tarefas
            </h1>
            <p>Avalie as tarefas enviadas pelos usuários • {tasks.length} pendente{tasks.length !== 1 ? 's' : ''}</p>
          </div>
        </header>

        {tasks.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Nenhuma tarefa pendente</h3>
            <p>Todas as tarefas foram revisadas!</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {tasks.map(task => {
              if (!task || !task.mission) {
                console.warn('Tarefa sem dados completos:', task);
                return null;
              }

              return (
                <div key={task._id} className="task-card">
                  <div className="task-header">
                    <div className="task-user">
                      {task.user?.avatar ? (
                        <img src={task.user.avatar} alt={task.user.name} />
                      ) : (
                        <div className="user-placeholder">
                          {task.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <h4>{task.user?.name || 'Usuário'}</h4>
                        <span>{new Date(task.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="task-content">
                    {task.mission?.phase?.title && (
                      <div style={{ 
                        background: '#f0fdf4', 
                        padding: '0.75rem', 
                        borderRadius: '0.5rem', 
                        marginBottom: '1rem',
                        border: '1px solid #86efac'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <FaInfoCircle style={{ color: '#16a34a' }} />
                          <strong style={{ fontSize: '0.875rem', color: '#16a34a' }}>Fase:</strong>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#15803d' }}>{task.mission.phase.title}</p>
                      </div>
                    )}

                    <h3>{task.mission?.title || 'Título não disponível'}</h3>

                    {task.mission?.instructions && (
                      <div style={{ 
                        background: '#fef3c7', 
                        padding: '0.75rem', 
                        borderRadius: '0.5rem', 
                        marginBottom: '1rem',
                        border: '1px solid #fde68a'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <FaInfoCircle style={{ color: '#d97706' }} />
                          <strong style={{ fontSize: '0.875rem', color: '#92400e' }}>Instruções da Tarefa:</strong>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#78350f', lineHeight: '1.5' }}>
                          {task.mission.instructions}
                        </p>
                      </div>
                    )}

                    {task.mission?.exampleImage && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <FaImage style={{ color: '#6b7280' }} />
                          <strong style={{ fontSize: '0.875rem' }}>Exemplo de Referência:</strong>
                        </div>
                        <img 
                          src={task.mission.exampleImage} 
                          alt="Exemplo" 
                          style={{ 
                            width: '100%', 
                            maxHeight: '200px', 
                            objectFit: 'cover', 
                            borderRadius: '0.5rem',
                            border: '2px solid #e5e7eb'
                          }} 
                        />
                      </div>
                    )}

                    {task.description && (
                      <div style={{ marginBottom: '1rem' }}>
                        <strong style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                          Descrição do Usuário:
                        </strong>
                        <p style={{ 
                          background: '#f9fafb', 
                          padding: '0.75rem', 
                          borderRadius: '0.5rem',
                          margin: 0,
                          fontSize: '0.875rem',
                          lineHeight: '1.6'
                        }}>
                          {task.description}
                        </p>
                      </div>
                    )}

                    {task.photoUrl && (
                      <div className="task-image">
                        <strong style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                          Foto Enviada:
                        </strong>
                        <img 
                          src={task.photoUrl} 
                          alt="Task submission" 
                          style={{ cursor: 'pointer' }}
                          onClick={() => window.open(task.photoUrl, '_blank')}
                        />
                      </div>
                    )}

                    {task.location && (
                      <div style={{ 
                        background: '#f0fdf4', 
                        padding: '0.75rem', 
                        borderRadius: '0.5rem',
                        marginTop: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <FaMapMarkerAlt style={{ color: '#16a34a', fontSize: '1.25rem' }} />
                        <div style={{ flex: 1 }}>
                          <strong style={{ fontSize: '0.875rem', color: '#15803d', display: 'block' }}>
                            Localização:
                          </strong>
                          <p style={{ margin: 0, fontSize: '0.875rem', color: '#166534' }}>
                            {task.location.address || task.location}
                          </p>
                          {task.location.coordinates && (
                            <a
                              href={`https://www.google.com/maps?q=${task.location.coordinates.lat},${task.location.coordinates.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: '0.8125rem', color: '#16a34a', textDecoration: 'underline' }}
                            >
                              Ver no Google Maps
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {task.formAnswers && task.formAnswers.length > 0 && (
                      <div style={{ 
                        background: '#f0f9ff', 
                        padding: '1rem', 
                        borderRadius: '0.5rem',
                        marginTop: '1rem',
                        border: '1px solid #bfdbfe'
                      }}>
                        <strong style={{ fontSize: '0.875rem', color: '#1e40af', display: 'block', marginBottom: '0.75rem' }}>
                          Respostas do Formulário:
                        </strong>
                        {task.formAnswers.map((answer, index) => (
                          <div key={index} style={{ 
                            background: 'white', 
                            padding: '0.75rem', 
                            borderRadius: '0.375rem',
                            marginBottom: index < task.formAnswers.length - 1 ? '0.75rem' : 0
                          }}>
                            <p style={{ 
                              margin: '0 0 0.375rem 0', 
                              fontSize: '0.8125rem', 
                              fontWeight: '600',
                              color: '#1e3a8a'
                            }}>
                              {answer.question}
                            </p>
                            <p style={{ 
                              margin: 0, 
                              fontSize: '0.875rem', 
                              color: '#1e40af',
                              lineHeight: '1.5'
                            }}>
                              {typeof answer.answer === 'object' ? JSON.stringify(answer.answer) : answer.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {task.textContent && (
                      <div style={{ 
                        background: '#faf5ff', 
                        padding: '1rem', 
                        borderRadius: '0.5rem',
                        marginTop: '1rem',
                        border: '1px solid #e9d5ff'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <strong style={{ fontSize: '0.875rem', color: '#7c3aed' }}>
                            Texto Enviado:
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: '#9333ea', background: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
                            {task.textContent.wordCount} palavras
                          </span>
                        </div>
                        <div style={{ 
                          background: 'white', 
                          padding: '0.75rem', 
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          color: '#6b21a8',
                          lineHeight: '1.6',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {task.textContent.text}
                        </div>
                      </div>
                    )}

                    <div style={{ 
                      display: 'flex', 
                      gap: '0.5rem', 
                      fontSize: '0.875rem', 
                      color: '#6b7280',
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid #e5e7eb'
                    }}>
                      <span>⭐ +{task.mission?.experienceReward || 50} XP</span>
                      <span>🏆 +{task.mission?.pointsReward || 10} pts</span>
                    </div>
                  </div>

                  <div className="task-actions">
                    <button 
                      onClick={() => setSelectedTask(task)}
                      className="btn btn-primary btn-block"
                    >
                      <FaEye /> Revisar Tarefa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedTask && (
          <div className="review-modal" onClick={() => setSelectedTask(null)}>
            <div className="review-modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Revisar Tarefa</h2>
                <button onClick={() => setSelectedTask(null)} className="close-btn">×</button>
              </div>

              <div className="modal-body">
                <div className="task-details">
                  <h3>{selectedTask.mission?.title}</h3>
                  <p><strong>Fase:</strong> {selectedTask.mission?.phase?.title}</p>
                  <p><strong>Usuário:</strong> {selectedTask.user?.name}</p>
                  
                  {selectedTask.mission?.instructions && (
                    <div style={{ 
                      background: '#fef3c7', 
                      padding: '1rem', 
                      borderRadius: '0.5rem', 
                      marginBottom: '1rem'
                    }}>
                      <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Instruções:</strong>
                      <p style={{ margin: 0, lineHeight: '1.6' }}>{selectedTask.mission.instructions}</p>
                    </div>
                  )}

                  {selectedTask.description && (
                    <div>
                      <strong>Descrição:</strong>
                      <p style={{ 
                        background: '#f9fafb', 
                        padding: '1rem', 
                        borderRadius: '0.5rem',
                        marginTop: '0.5rem',
                        lineHeight: '1.6'
                      }}>
                        {selectedTask.description}
                      </p>
                    </div>
                  )}

                  {selectedTask.photoUrl && (
                    <div style={{ marginTop: '1rem' }}>
                      <strong>Foto Enviada:</strong>
                      <img 
                        src={selectedTask.photoUrl} 
                        alt="Submission" 
                        style={{ 
                          width: '100%', 
                          borderRadius: '0.5rem', 
                          marginTop: '0.5rem',
                          cursor: 'pointer'
                        }}
                        onClick={() => window.open(selectedTask.photoUrl, '_blank')}
                      />
                    </div>
                  )}

                  {selectedTask.location && (
                    <div style={{ marginTop: '1rem' }}>
                      <strong>📍 Localização:</strong>
                      <p style={{ marginTop: '0.5rem' }}>
                        {selectedTask.location.address || selectedTask.location}
                      </p>
                    </div>
                  )}

                  {selectedTask.formAnswers && selectedTask.formAnswers.length > 0 && (
                    <div style={{ 
                      marginTop: '1rem',
                      background: '#f0f9ff',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #bfdbfe'
                    }}>
                      <strong style={{ display: 'block', marginBottom: '1rem', color: '#1e40af' }}>
                        📝 Respostas do Formulário:
                      </strong>
                      {selectedTask.formAnswers.map((answer, index) => (
                        <div key={index} style={{ 
                          background: 'white',
                          padding: '1rem',
                          borderRadius: '0.5rem',
                          marginBottom: index < selectedTask.formAnswers.length - 1 ? '1rem' : 0
                        }}>
                          <p style={{ 
                            margin: '0 0 0.5rem 0',
                            fontWeight: '600',
                            color: '#1e3a8a'
                          }}>
                            {answer.question}
                          </p>
                          <p style={{ 
                            margin: 0,
                            color: '#1e40af',
                            lineHeight: '1.6'
                          }}>
                            {typeof answer.answer === 'object' ? JSON.stringify(answer.answer) : answer.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedTask.textContent && (
                    <div style={{ 
                      marginTop: '1rem',
                      background: '#faf5ff',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #e9d5ff'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        marginBottom: '1rem'
                      }}>
                        <strong style={{ color: '#7c3aed' }}>
                          📄 Texto Enviado:
                        </strong>
                        <span style={{ 
                          fontSize: '0.875rem',
                          color: '#9333ea',
                          background: 'white',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '0.375rem',
                          fontWeight: '600'
                        }}>
                          {selectedTask.textContent.wordCount} palavras
                        </span>
                      </div>
                      <div style={{ 
                        background: 'white',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        color: '#6b21a8',
                        lineHeight: '1.7',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {selectedTask.textContent.text}
                      </div>
                    </div>
                  )}

                  {selectedTask.mission?.questions && selectedTask.mission.questions.length > 0 && (
                    <div style={{ 
                      marginTop: '1rem',
                      background: '#fef3c7',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #fde68a'
                    }}>
                      <strong style={{ display: 'block', marginBottom: '0.75rem', color: '#92400e' }}>
                        ℹ️ Perguntas do Formulário:
                      </strong>
                      <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
                        {selectedTask.mission.questions.map((q, i) => (
                          <li key={i} style={{ 
                            marginBottom: i < selectedTask.mission.questions.length - 1 ? '0.5rem' : 0,
                            color: '#78350f'
                          }}>
                            {q.question}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {selectedTask.mission?.topics && selectedTask.mission.topics.length > 0 && (
                    <div style={{ 
                      marginTop: '1rem',
                      background: '#fef3c7',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #fde68a'
                    }}>
                      <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#92400e' }}>
                        💡 Tópicos Sugeridos:
                      </strong>
                      <p style={{ margin: 0, color: '#78350f' }}>
                        {selectedTask.mission.topics.join(', ')}
                      </p>
                    </div>
                  )}

                  {selectedTask.mission?.minWords && selectedTask.mission?.maxWords && (
                    <div style={{ 
                      marginTop: '1rem',
                      background: '#ecfccb',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #d9f99d',
                      fontSize: '0.875rem',
                      color: '#365314'
                    }}>
                      <strong>Requisitos de palavras:</strong> {selectedTask.mission.minWords} - {selectedTask.mission.maxWords} palavras
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Comentário da Revisão (opcional para aprovação, obrigatório para rejeição):
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows="4"
                    placeholder="Adicione comentários sobre a revisão..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '2px solid #e5e7eb',
                      fontSize: '0.9375rem',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div className="review-actions">
                  <button 
                    onClick={() => handleReview(selectedTask._id, 'approved')}
                    disabled={reviewing}
                    className="btn btn-success btn-block"
                  >
                    <FaCheck /> {reviewing ? 'Aprovando...' : 'Aprovar Tarefa'}
                  </button>
                  <button 
                    onClick={() => {
                      if (!reviewComment.trim()) {
                        toast.error('Por favor, adicione um comentário explicando o motivo da rejeição');
                        return;
                      }
                      handleReview(selectedTask._id, 'rejected');
                    }}
                    disabled={reviewing}
                    className="btn btn-danger btn-block"
                  >
                    <FaTimes /> {reviewing ? 'Rejeitando...' : 'Rejeitar Tarefa'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskReview;
