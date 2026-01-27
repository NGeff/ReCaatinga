import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { missionAPI, taskAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaPaperPlane, FaBook } from 'react-icons/fa';
import './TaskSubmit.css';

const TextSubmit = () => {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    fetchMission();
  }, [missionId]);

  const fetchMission = async () => {
    try {
      const response = await missionAPI.getById(missionId);
      setMission(response.data);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar tarefa');
    } finally {
      setLoading(false);
    }
  };

  const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCharCount = (text) => {
    return text.length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const wordCount = getWordCount(text);
    const minWords = mission.textTask?.minWords || 50;
    const maxWords = mission.textTask?.maxWords || 500;
    
    if (wordCount < minWords) {
      toast.error(`O texto deve ter no mínimo ${minWords} palavras. Você tem ${wordCount} palavras.`);
      return;
    }
    
    if (wordCount > maxWords) {
      toast.error(`O texto deve ter no máximo ${maxWords} palavras. Você tem ${wordCount} palavras.`);
      return;
    }
    
    setSubmitting(true);
    
    try {
      await taskAPI.submit({
        missionId,
        type: 'text',
        textContent: {
          text: text.trim(),
          wordCount,
          charCount: getCharCount(text)
        }
      });
      
      toast.success('Texto enviado para análise!');
      navigate(`/mission/${missionId}`);
    } catch (error) {
      console.error('Erro:', error);
      toast.error(error.response?.data?.message || 'Erro ao enviar texto');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="task-submit-wrapper">
        <Navbar />
        <div className="task-loading">
          <div className="loading-spinner"></div>
          <p>Carregando tarefa...</p>
        </div>
      </div>
    );
  }

  if (!mission || !mission.textTask) {
    return (
      <div className="task-submit-wrapper">
        <Navbar />
        <div className="task-loading">
          <p>Tarefa não encontrada</p>
        </div>
      </div>
    );
  }

  const wordCount = getWordCount(text);
  const charCount = getCharCount(text);
  const minWords = mission.textTask.minWords || 50;
  const maxWords = mission.textTask.maxWords || 500;
  const isValid = wordCount >= minWords && wordCount <= maxWords;

  return (
    <div className="task-submit-wrapper">
      <Navbar />
      
      <div className="task-submit-container">
        <div className="task-submit-hero">
          <h1>✍️ {mission.title}</h1>
          {mission.textTask.instructions && (
            <p className="task-instructions">{mission.textTask.instructions}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="task-submit-form">
          {mission.textTask.topics && mission.textTask.topics.length > 0 && (
            <div className="form-section">
              <div className="section-header">
                <FaBook className="section-icon" />
                <h3>Tópicos Sugeridos</h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {mission.textTask.topics.map((topic, index) => (
                  <span key={index} style={{
                    padding: '0.5rem 1rem',
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    borderRadius: '2rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--game-green)',
                    border: '2px solid var(--game-green)'
                  }}>
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {mission.textTask.exampleText && (
            <div className="form-section">
              <div className="section-header">
                <h3>Exemplo de Texto</h3>
              </div>
              <div style={{
                padding: '1.5rem',
                background: '#fef3c7',
                borderRadius: '1rem',
                border: '2px solid #fde68a',
                fontStyle: 'italic',
                lineHeight: '1.8',
                color: '#78350f'
              }}>
                {mission.textTask.exampleText}
              </div>
            </div>
          )}

          <div className="form-section">
            <div className="section-header">
              <h3>Seu Texto</h3>
              <span className="required-badge">Obrigatório</span>
            </div>
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows="15"
              placeholder="Escreva seu texto aqui..."
              className="form-textarea"
              style={{ fontSize: '1rem', lineHeight: '1.8' }}
              required
            />
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '1rem',
              padding: '1rem',
              background: isValid ? '#f0fdf4' : wordCount > maxWords ? '#fee2e2' : '#f9fafb',
              borderRadius: '0.75rem',
              border: '2px solid',
              borderColor: isValid ? 'var(--game-green)' : wordCount > maxWords ? 'var(--game-red)' : '#e5e7eb'
            }}>
              <div>
                <strong style={{ color: isValid ? 'var(--game-green)' : wordCount > maxWords ? 'var(--game-red)' : 'var(--game-text)' }}>
                  {wordCount} palavras
                </strong>
                <span style={{ color: 'var(--game-text-light)', fontSize: '0.875rem', marginLeft: '0.5rem' }}>
                  (mínimo: {minWords}, máximo: {maxWords})
                </span>
              </div>
              <div style={{ color: 'var(--game-text-light)', fontSize: '0.875rem' }}>
                {charCount} caracteres
              </div>
            </div>
            
            {wordCount > 0 && !isValid && (
              <div style={{
                marginTop: '0.75rem',
                padding: '0.875rem 1.25rem',
                background: wordCount < minWords ? '#fef3c7' : '#fee2e2',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: wordCount < minWords ? '#92400e' : '#991b1b'
              }}>
                {wordCount < minWords 
                  ? `Você precisa escrever mais ${minWords - wordCount} palavras`
                  : `Você ultrapassou o limite em ${wordCount - maxWords} palavras`
                }
              </div>
            )}
          </div>

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
              disabled={submitting || !isValid}
              className="btn btn-primary"
            >
              <FaPaperPlane />
              {submitting ? 'Enviando...' : 'Enviar Texto'}
            </button>
          </div>
        </form>

        <div className="info-box">
          <h4>Dicas para um Bom Texto</h4>
          <ul>
            <li>Seja claro e objetivo em suas ideias</li>
            <li>Use parágrafos para organizar o conteúdo</li>
            <li>Revise ortografia e gramática antes de enviar</li>
            <li>Desenvolva bem os tópicos sugeridos</li>
            <li>Seu texto será analisado por um administrador</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextSubmit;
