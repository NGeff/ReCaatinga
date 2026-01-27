import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { missionAPI, taskAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaPaperPlane, FaStar } from 'react-icons/fa';
import './TaskSubmit.css';

const FormSubmit = () => {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    fetchMission();
  }, [missionId]);

  const fetchMission = async () => {
    try {
      const response = await missionAPI.getById(missionId);
      setMission(response.data);
      
      const initialAnswers = {};
      response.data.formTask?.questions?.forEach((q, index) => {
        if (q.type === 'multiselect') {
          initialAnswers[index] = [];
        } else if (q.type === 'rating') {
          initialAnswers[index] = 0;
        } else {
          initialAnswers[index] = '';
        }
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar formulário');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: value }));
  };

  const handleMultiSelectChange = (questionIndex, option) => {
    setAnswers(prev => {
      const current = prev[questionIndex] || [];
      const newValue = current.includes(option)
        ? current.filter(o => o !== option)
        : [...current, option];
      return { ...prev, [questionIndex]: newValue };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const questions = mission.formTask?.questions || [];
    const requiredAnswers = questions.filter(q => q.required);
    
    for (let i = 0; i < requiredAnswers.length; i++) {
      const qIndex = questions.indexOf(requiredAnswers[i]);
      const answer = answers[qIndex];
      
      if (!answer || (Array.isArray(answer) && answer.length === 0) || answer === 0) {
        toast.error('Por favor, responda todas as questões obrigatórias');
        return;
      }
    }
    
    setSubmitting(true);
    
    try {
      const formAnswers = questions.map((q, index) => ({
        question: q.question,
        answer: answers[index]
      }));
      
      await taskAPI.submit({
        missionId,
        type: 'form',
        formAnswers
      });
      
      toast.success('Formulário enviado para análise!');
      navigate(`/mission/${missionId}`);
    } catch (error) {
      console.error('Erro:', error);
      toast.error(error.response?.data?.message || 'Erro ao enviar formulário');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question, index) => {
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={answers[index] || ''}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            placeholder={question.placeholder || 'Sua resposta...'}
            className="form-input"
            required={question.required}
          />
        );
        
      case 'textarea':
        return (
          <textarea
            value={answers[index] || ''}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            placeholder={question.placeholder || 'Sua resposta...'}
            rows="5"
            className="form-textarea"
            required={question.required}
          />
        );
        
      case 'select':
        return (
          <select
            value={answers[index] || ''}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            className="form-input"
            required={question.required}
          >
            <option value="">Selecione uma opção</option>
            {question.options?.map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>
        );
        
      case 'multiselect':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {question.options?.map((option, i) => (
              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', background: (answers[index] || []).includes(option) ? '#f0fdf4' : '#f9fafb', borderRadius: '0.5rem', border: '2px solid', borderColor: (answers[index] || []).includes(option) ? 'var(--game-green)' : '#e5e7eb', transition: 'all 0.2s' }}>
                <input
                  type="checkbox"
                  checked={(answers[index] || []).includes(option)}
                  onChange={() => handleMultiSelectChange(index, option)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: '500' }}>{option}</span>
              </label>
            ))}
          </div>
        );
        
      case 'rating':
        return (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', padding: '1rem' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleAnswerChange(index, star)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '2.5rem',
                  color: star <= (answers[index] || 0) ? '#f59e0b' : '#e5e7eb',
                  transition: 'all 0.2s',
                  transform: star <= (answers[index] || 0) ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                <FaStar />
              </button>
            ))}
          </div>
        );
        
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="task-submit-wrapper">
        <Navbar />
        <div className="task-loading">
          <div className="loading-spinner"></div>
          <p>Carregando formulário...</p>
        </div>
      </div>
    );
  }

  if (!mission || !mission.formTask) {
    return (
      <div className="task-submit-wrapper">
        <Navbar />
        <div className="task-loading">
          <p>Formulário não encontrado</p>
        </div>
      </div>
    );
  }

  const questions = mission.formTask.questions || [];

  return (
    <div className="task-submit-wrapper">
      <Navbar />
      
      <div className="task-submit-container">
        <div className="task-submit-hero">
          <h1>📋 {mission.title}</h1>
          {mission.formTask.instructions && (
            <p className="task-instructions">{mission.formTask.instructions}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="task-submit-form">
          {questions.map((question, index) => (
            <div key={index} className="form-section">
              <div className="section-header">
                <h3>
                  {index + 1}. {question.question}
                  {question.required && <span style={{ color: 'var(--game-red)', marginLeft: '0.25rem' }}>*</span>}
                </h3>
              </div>
              {renderQuestion(question, index)}
            </div>
          ))}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(`/mission/${missionId}`)}
              className="btn btn-outline"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              <FaPaperPlane />
              {submitting ? 'Enviando...' : 'Enviar Respostas'}
            </button>
          </div>
        </form>

        <div className="info-box">
          <h4>Informações</h4>
          <ul>
            <li>Suas respostas serão analisadas por um administrador</li>
            <li>Você receberá notificação sobre a aprovação</li>
            <li>Campos com * são obrigatórios</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FormSubmit;
