import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { missionAPI, phaseAPI } from '../services/api';
import './AdminPanel.css';
import './CreateContent.css';

const CreateMission = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [phases, setPhases] = useState([]);
  const [formData, setFormData] = useState({
    phase: location.state?.phaseId || '',
    title: '',
    description: '',
    type: 'video',
    experienceReward: 50,
    pointsReward: 10,
    videoUrl: '',
    photoTask: {
      instructions: '',
      requiresPhoto: true,
      requiresLocation: false
    },
    formTask: {
      instructions: '',
      questions: [],
      minAnswers: 1
    },
    textTask: {
      instructions: '',
      minWords: 50,
      maxWords: 500,
      topics: [],
      exampleText: ''
    }
  });

  useEffect(() => {
    fetchPhases();
  }, []);

  const fetchPhases = async () => {
    try {
      const res = await phaseAPI.getAll();
      setPhases(res.data);
    } catch (error) {
      toast.error('Erro ao carregar fases');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submissionData = { ...formData };
      
      if (formData.type === 'foto') {
        submissionData.taskDetails = { ...formData.photoTask };
      }

      await missionAPI.create(submissionData);
      toast.success('Missão criada com sucesso! A ordem foi definida automaticamente.');
      navigate('/admin/content-manager');
    } catch (error) {
      console.error('Erro ao criar missão:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar missão');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['experienceReward', 'pointsReward'].includes(name)
        ? parseInt(value) || 0 
        : value
    }));
  };

  const handlePhotoTaskChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      photoTask: { 
        ...prev.photoTask, 
        [field]: value 
      }
    }));
  };

  const handleCheckboxChange = (field, checked) => {
    setFormData(prev => ({
      ...prev,
      photoTask: { 
        ...prev.photoTask, 
        [field]: checked 
      }
    }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      formTask: {
        ...prev.formTask,
        questions: [
          ...prev.formTask.questions,
          { question: '', type: 'text', options: [], required: true, placeholder: '' }
        ]
      }
    }));
  };

  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      formTask: {
        ...prev.formTask,
        questions: prev.formTask.questions.filter((_, i) => i !== index)
      }
    }));
  };

  const updateQuestion = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      formTask: {
        ...prev.formTask,
        questions: prev.formTask.questions.map((q, i) => 
          i === index ? { ...q, [field]: value } : q
        )
      }
    }));
  };

  const addOption = (questionIndex) => {
    setFormData(prev => ({
      ...prev,
      formTask: {
        ...prev.formTask,
        questions: prev.formTask.questions.map((q, i) => 
          i === questionIndex ? { ...q, options: [...(q.options || []), ''] } : q
        )
      }
    }));
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setFormData(prev => ({
      ...prev,
      formTask: {
        ...prev.formTask,
        questions: prev.formTask.questions.map((q, i) => 
          i === questionIndex 
            ? { ...q, options: q.options.map((opt, oi) => oi === optionIndex ? value : opt) }
            : q
        )
      }
    }));
  };

  const removeOption = (questionIndex, optionIndex) => {
    setFormData(prev => ({
      ...prev,
      formTask: {
        ...prev.formTask,
        questions: prev.formData.questions.map((q, i) => 
          i === questionIndex 
            ? { ...q, options: q.options.filter((_, oi) => oi !== optionIndex) }
            : q
        )
      }
    }));
  };

  const addTopic = () => {
    const topic = prompt('Digite o tópico sugerido:');
    if (topic) {
      setFormData(prev => ({
        ...prev,
        textTask: {
          ...prev.textTask,
          topics: [...prev.textTask.topics, topic]
        }
      }));
    }
  };

  const removeTopic = (index) => {
    setFormData(prev => ({
      ...prev,
      textTask: {
        ...prev.textTask,
        topics: prev.textTask.topics.filter((_, i) => i !== index)
      }
    }));
  };

  const handleTextTaskChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      textTask: {
        ...prev.textTask,
        [field]: field === 'minWords' || field === 'maxWords' ? parseInt(value) || 0 : value
      }
    }));
  };

  const handleFormTaskChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      formTask: {
        ...prev.formTask,
        [field]: field === 'minAnswers' ? parseInt(value) || 0 : value
      }
    }));
  };

  const getMissionTypeInfo = () => {
    const types = {
      video: {
        icon: '🎥',
        title: 'Vídeo Educacional',
        description: 'Os usuários assistem a um vídeo educativo'
      },
      foto: {
        icon: '📸',
        title: 'Tarefa com Foto',
        description: 'Os usuários enviam fotos de suas atividades'
      },
      jogos: {
        icon: '🎮',
        title: 'Jogos Educacionais',
        description: 'Uma coleção de jogos interativos (configure os jogos depois)'
      },
      formulario: {
        icon: '📝',
        title: 'Formulário',
        description: 'Os usuários respondem a perguntas personalizadas'
      },
      texto: {
        icon: '✍️',
        title: 'Produção de Texto',
        description: 'Os usuários escrevem textos sobre temas específicos'
      }
    };
    return types[formData.type] || types.video;
  };

  const selectedPhase = phases.find(p => p._id === formData.phase);

  return (
    <div className="admin-wrapper">
      <Navbar />
      <div className="admin-container">
        <header className="admin-header">
          <div className="admin-header-content">
            <Link to="/admin/content-manager" className="back-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Voltar
            </Link>
            <h1>
              <span className="admin-icon">🎮</span>
              Criar Nova Missão
            </h1>
            {location.state?.phaseTitle && (
              <p>Fase: {location.state.phaseTitle} • A ordem será definida automaticamente</p>
            )}
          </div>
        </header>

        <div className="content-form-wrapper">
          <form onSubmit={handleSubmit} className="content-form">
            <div className="input-group">
              <label>Fase *</label>
              <select
                name="phase"
                value={formData.phase}
                onChange={handleChange}
                required
                disabled={!!location.state?.phaseId}
              >
                <option value="">Selecione uma fase</option>
                {phases.map(phase => (
                  <option key={phase._id} value={phase._id}>
                    #{phase.order} - {phase.title}
                  </option>
                ))}
              </select>
              {selectedPhase && (
                <small>
                  Categoria: {selectedPhase.category} • Dificuldade: {selectedPhase.difficulty}
                </small>
              )}
            </div>

            <div className="input-group">
              <label>Título da Missão *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: Assistir vídeo sobre a Caatinga"
                required
              />
            </div>

            <div className="input-group">
              <label>Descrição *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descreva o objetivo desta missão..."
                rows="3"
                required
              />
            </div>

            <div className="input-group">
              <label>Tipo de Missão *</label>
              <div className="mission-type-selector">
                {['video', 'foto', 'jogos', 'formulario', 'texto'].map((type) => {
                  const typeInfo = {
                    video: { icon: '🎥', label: 'Vídeo' },
                    foto: { icon: '📸', label: 'Foto' },
                    jogos: { icon: '🎮', label: 'Jogos' },
                    formulario: { icon: '📝', label: 'Formulário' },
                    texto: { icon: '✍️', label: 'Texto' }
                  };
                  return (
                    <label key={type} className={`mission-type-option ${formData.type === type ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="type"
                        value={type}
                        checked={formData.type === type}
                        onChange={handleChange}
                      />
                      <div className="type-content">
                        <span className="type-icon">{typeInfo[type].icon}</span>
                        <span className="type-label">{typeInfo[type].label}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
              <div className="mission-type-info">
                <span className="info-icon">{getMissionTypeInfo().icon}</span>
                <div>
                  <strong>{getMissionTypeInfo().title}</strong>
                  <p>{getMissionTypeInfo().description}</p>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Recompensa de XP *</label>
                <input
                  type="number"
                  name="experienceReward"
                  value={formData.experienceReward}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>

              <div className="input-group">
                <label>Recompensa de Pontos *</label>
                <input
                  type="number"
                  name="pointsReward"
                  value={formData.pointsReward}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>
            </div>

            {formData.type === 'video' && (
              <div className="input-group">
                <label>URL do Vídeo *</label>
                <input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
                <small>URL do vídeo (YouTube, Vimeo, etc.)</small>
              </div>
            )}

            {formData.type === 'foto' && (
              <div className="form-section">
                <h3 className="form-section-title">Configurações da Tarefa</h3>
                
                <div className="input-group">
                  <label>Instruções *</label>
                  <textarea
                    value={formData.photoTask.instructions}
                    onChange={(e) => handlePhotoTaskChange('instructions', e.target.value)}
                    placeholder="Descreva o que o usuário deve fotografar..."
                    rows="3"
                    required
                  />
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.photoTask.requiresPhoto}
                      onChange={(e) => handleCheckboxChange('requiresPhoto', e.target.checked)}
                    />
                    <span>Foto obrigatória</span>
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.photoTask.requiresLocation}
                      onChange={(e) => handleCheckboxChange('requiresLocation', e.target.checked)}
                    />
                    <span>Localização obrigatória</span>
                  </label>
                </div>
              </div>
            )}

            {formData.type === 'jogos' && (
              <div className="alert info">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <div>
                  <strong>Configuração de Jogos</strong>
                  <p>Após criar esta missão, você poderá adicionar jogos educacionais através do gerenciador de conteúdo.</p>
                </div>
              </div>
            )}

            {formData.type === 'formulario' && (
              <div className="form-section">
                <h3 className="form-section-title">Configurações do Formulário</h3>
                
                <div className="input-group">
                  <label>Instruções</label>
                  <textarea
                    value={formData.formTask.instructions}
                    onChange={(e) => handleFormTaskChange('instructions', e.target.value)}
                    placeholder="Instruções gerais do formulário..."
                    rows="2"
                  />
                </div>

                <div className="input-group">
                  <label>Mínimo de respostas obrigatórias</label>
                  <input
                    type="number"
                    value={formData.formTask.minAnswers}
                    onChange={(e) => handleFormTaskChange('minAnswers', e.target.value)}
                    min="1"
                  />
                </div>

                <div className="questions-list">
                  <div className="questions-header">
                    <h4>Perguntas</h4>
                    <button type="button" onClick={addQuestion} className="btn btn-sm btn-primary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Adicionar Pergunta
                    </button>
                  </div>

                  {formData.formTask.questions.map((question, qIndex) => (
                    <div key={qIndex} className="question-item">
                      <div className="question-header">
                        <span>Pergunta #{qIndex + 1}</span>
                        <button type="button" onClick={() => removeQuestion(qIndex)} className="btn-icon btn-danger btn-sm">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>

                      <div className="input-group">
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                          placeholder="Digite a pergunta..."
                        />
                      </div>

                      <div className="form-row">
                        <div className="input-group">
                          <label>Tipo</label>
                          <select
                            value={question.type}
                            onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                          >
                            <option value="text">Texto curto</option>
                            <option value="textarea">Texto longo</option>
                            <option value="select">Seleção única</option>
                            <option value="multiselect">Múltipla escolha</option>
                            <option value="rating">Avaliação (1-5)</option>
                          </select>
                        </div>

                        <div className="input-group">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={question.required}
                              onChange={(e) => updateQuestion(qIndex, 'required', e.target.checked)}
                            />
                            <span>Obrigatória</span>
                          </label>
                        </div>
                      </div>

                      {(question.type === 'select' || question.type === 'multiselect') && (
                        <div className="options-list">
                          <label>Opções</label>
                          {question.options?.map((option, oIndex) => (
                            <div key={oIndex} className="option-input">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                placeholder={`Opção ${oIndex + 1}`}
                              />
                              <button 
                                type="button" 
                                onClick={() => removeOption(qIndex, oIndex)}
                                className="btn-icon btn-sm btn-danger"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                              </button>
                            </div>
                          ))}
                          <button type="button" onClick={() => addOption(qIndex)} className="btn btn-sm btn-outline">
                            Adicionar Opção
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.type === 'texto' && (
              <div className="form-section">
                <h3 className="form-section-title">Configurações da Produção de Texto</h3>
                
                <div className="input-group">
                  <label>Instruções *</label>
                  <textarea
                    value={formData.textTask.instructions}
                    onChange={(e) => handleTextTaskChange('instructions', e.target.value)}
                    placeholder="Descreva o que deve ser abordado no texto..."
                    rows="3"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Mínimo de palavras</label>
                    <input
                      type="number"
                      value={formData.textTask.minWords}
                      onChange={(e) => handleTextTaskChange('minWords', e.target.value)}
                      min="1"
                    />
                  </div>

                  <div className="input-group">
                    <label>Máximo de palavras</label>
                    <input
                      type="number"
                      value={formData.textTask.maxWords}
                      onChange={(e) => handleTextTaskChange('maxWords', e.target.value)}
                      min="1"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Tópicos sugeridos</label>
                  <div className="topics-list">
                    {formData.textTask.topics.map((topic, index) => (
                      <div key={index} className="topic-tag">
                        <span>{topic}</span>
                        <button type="button" onClick={() => removeTopic(index)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addTopic} className="btn btn-sm btn-outline">
                      Adicionar Tópico
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label>Exemplo de texto (opcional)</label>
                  <textarea
                    value={formData.textTask.exampleText}
                    onChange={(e) => handleTextTaskChange('exampleText', e.target.value)}
                    placeholder="Forneça um exemplo de como o texto pode ser escrito..."
                    rows="4"
                  />
                </div>
              </div>
            )}

            <div className="form-actions">
              <Link to="/admin/content-manager" className="btn btn-outline">
                Cancelar
              </Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Criando...' : 'Criar Missão'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateMission;
