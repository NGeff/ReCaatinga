import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { missionAPI, phaseAPI } from '../services/api';
import './AdminPanel.css';
import './CreateContent.css';

const EditMission = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phases, setPhases] = useState([]);
  const [formData, setFormData] = useState({
    phase: '',
    title: '',
    description: '',
    type: 'video',
    order: 1,
    experienceReward: 50,
    pointsReward: 10,
    videoUrl: '',
    photoTask: {
      instructions: '',
      exampleImage: '',
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
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [missionRes, phasesRes] = await Promise.all([
        missionAPI.getById(id),
        phaseAPI.getAll()
      ]);
      
      const mission = missionRes.data;
      
      let photoTaskData = mission.photoTask || mission.taskDetails || {
        instructions: '',
        exampleImage: '',
        requiresPhoto: true,
        requiresLocation: false
      };

      if (photoTaskData.requiresPhoto === undefined) {
        photoTaskData.requiresPhoto = true;
      }
      if (photoTaskData.requiresLocation === undefined) {
        photoTaskData.requiresLocation = false;
      }

      const formTaskData = mission.formTask || {
        instructions: '',
        questions: [],
        minAnswers: 1
      };

      const textTaskData = mission.textTask || {
        instructions: '',
        minWords: 50,
        maxWords: 500,
        topics: [],
        exampleText: ''
      };

      setFormData({
        ...mission,
        phase: mission.phase?._id || mission.phase,
        photoTask: photoTaskData,
        formTask: formTaskData,
        textTask: textTaskData
      });
      
      setPhases(phasesRes.data);
    } catch (error) {
      console.error('Erro ao carregar missão:', error);
      toast.error('Erro ao carregar missão');
      navigate('/admin/content-manager');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const submissionData = { ...formData };
      
      if (formData.type === 'foto') {
        submissionData.taskDetails = { ...formData.photoTask };
      }

      await missionAPI.update(id, submissionData);
      toast.success('Missão atualizada com sucesso!');
      navigate('/admin/content-manager');
    } catch (error) {
      console.error('Erro ao atualizar missão:', error);
      toast.error(error.response?.data?.message || 'Erro ao atualizar missão');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['order', 'experienceReward', 'pointsReward'].includes(name)
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

  const handleFormTaskChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      formTask: {
        ...prev.formTask,
        [field]: value
      }
    }));
  };

  const addFormQuestion = () => {
    setFormData(prev => ({
      ...prev,
      formTask: {
        ...prev.formTask,
        questions: [
          ...prev.formTask.questions,
          {
            question: '',
            type: 'text',
            options: [],
            required: true,
            placeholder: ''
          }
        ]
      }
    }));
  };

  const updateFormQuestion = (index, field, value) => {
    setFormData(prev => {
      const questions = [...prev.formTask.questions];
      questions[index] = { ...questions[index], [field]: value };
      return {
        ...prev,
        formTask: { ...prev.formTask, questions }
      };
    });
  };

  const removeFormQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      formTask: {
        ...prev.formTask,
        questions: prev.formTask.questions.filter((_, i) => i !== index)
      }
    }));
  };

  const addQuestionOption = (qIndex) => {
    setFormData(prev => {
      const questions = [...prev.formTask.questions];
      questions[qIndex].options = [...questions[qIndex].options, ''];
      return {
        ...prev,
        formTask: { ...prev.formTask, questions }
      };
    });
  };

  const updateQuestionOption = (qIndex, oIndex, value) => {
    setFormData(prev => {
      const questions = [...prev.formTask.questions];
      questions[qIndex].options[oIndex] = value;
      return {
        ...prev,
        formTask: { ...prev.formTask, questions }
      };
    });
  };

  const removeQuestionOption = (qIndex, oIndex) => {
    setFormData(prev => {
      const questions = [...prev.formTask.questions];
      questions[qIndex].options = questions[qIndex].options.filter((_, i) => i !== oIndex);
      return {
        ...prev,
        formTask: { ...prev.formTask, questions }
      };
    });
  };

  const handleTextTaskChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      textTask: {
        ...prev.textTask,
        [field]: value
      }
    }));
  };

  const addTopic = () => {
    setFormData(prev => ({
      ...prev,
      textTask: {
        ...prev.textTask,
        topics: [...prev.textTask.topics, '']
      }
    }));
  };

  const updateTopic = (index, value) => {
    setFormData(prev => {
      const topics = [...prev.textTask.topics];
      topics[index] = value;
      return {
        ...prev,
        textTask: { ...prev.textTask, topics }
      };
    });
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

  if (loading) {
    return (
      <div className="admin-wrapper">
        <Navbar />
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Carregando...</p>
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
            <Link to="/admin/content-manager" className="back-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Voltar
            </Link>
            <h1>
              <span className="admin-icon">✏️</span>
              Editar Missão
            </h1>
            <p>Atualize as informações da missão</p>
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
              >
                <option value="">Selecione uma fase</option>
                {phases.map(phase => (
                  <option key={phase._id} value={phase._id}>
                    {phase.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Título da Missão *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Descrição *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                required
              />
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Tipo *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="video">Vídeo</option>
                  <option value="foto">Tarefa com Foto</option>
                  <option value="jogos">Jogos Educacionais</option>
                  <option value="formulario">Formulário</option>
                  <option value="texto">Texto</option>
                </select>
              </div>

              <div className="input-group">
                <label>Ordem *</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  min="1"
                  required
                />
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
                  value={formData.videoUrl || ''}
                  onChange={handleChange}
                  required={formData.type === 'video'}
                />
              </div>
            )}

            {formData.type === 'foto' && (
              <>
                <div className="input-group">
                  <label>Instruções da Tarefa *</label>
                  <textarea
                    name="instructions"
                    value={formData.photoTask?.instructions || ''}
                    onChange={(e) => handlePhotoTaskChange('instructions', e.target.value)}
                    rows="4"
                    required={formData.type === 'foto'}
                  />
                  <small style={{ display: 'block', marginTop: '0.5rem', color: '#6b7280' }}>
                    Seja específico sobre o que deve aparecer na foto
                  </small>
                </div>

                <div className="input-group">
                  <label>URL da Imagem de Exemplo</label>
                  <input
                    type="url"
                    name="exampleImage"
                    value={formData.photoTask?.exampleImage || ''}
                    onChange={(e) => handlePhotoTaskChange('exampleImage', e.target.value)}
                  />
                  <small style={{ display: 'block', marginTop: '0.5rem', color: '#6b7280' }}>
                    Opcional: Uma imagem que serve como exemplo do que deve ser fotografado
                  </small>
                </div>

                <div className="input-group">
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>
                    Requisitos da Tarefa
                  </label>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'normal' }}>
                      <input
                        type="checkbox"
                        checked={formData.photoTask?.requiresPhoto !== false}
                        onChange={(e) => handleCheckboxChange('requiresPhoto', e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span>Requer foto obrigatória</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'normal' }}>
                      <input
                        type="checkbox"
                        checked={formData.photoTask?.requiresLocation === true}
                        onChange={(e) => handleCheckboxChange('requiresLocation', e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span>Requer localização obrigatória</span>
                    </label>
                  </div>
                  
                  <small style={{ display: 'block', marginTop: '0.5rem', color: '#6b7280' }}>
                    Marque os requisitos necessários para completar esta tarefa
                  </small>
                </div>
              </>
            )}

            {formData.type === 'formulario' && (
              <>
                <div className="input-group">
                  <label>Instruções do Formulário</label>
                  <textarea
                    value={formData.formTask.instructions}
                    onChange={(e) => handleFormTaskChange('instructions', e.target.value)}
                    placeholder="Instruções sobre como preencher o formulário..."
                    rows="3"
                  />
                </div>

                <div className="input-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <label style={{ margin: 0 }}>Questões ({formData.formTask.questions.length})</label>
                    <button type="button" onClick={addFormQuestion} className="btn btn-primary btn-sm">
                      + Adicionar Questão
                    </button>
                  </div>

                  {formData.formTask.questions.map((q, qIndex) => (
                    <div key={qIndex} style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '1rem', marginBottom: '1rem', border: '2px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0 }}>Questão {qIndex + 1}</h4>
                        <button type="button" onClick={() => removeFormQuestion(qIndex)} className="btn btn-danger btn-sm">
                          Remover
                        </button>
                      </div>

                      <div className="input-group">
                        <label>Pergunta</label>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => updateFormQuestion(qIndex, 'question', e.target.value)}
                          placeholder="Digite a pergunta..."
                        />
                      </div>

                      <div className="form-row">
                        <div className="input-group">
                          <label>Tipo</label>
                          <select
                            value={q.type}
                            onChange={(e) => updateFormQuestion(qIndex, 'type', e.target.value)}
                          >
                            <option value="text">Texto</option>
                            <option value="textarea">Texto Longo</option>
                            <option value="select">Seleção</option>
                            <option value="multiselect">Múltipla Escolha</option>
                            <option value="rating">Avaliação (Estrelas)</option>
                          </select>
                        </div>

                        <div className="input-group">
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={q.required}
                              onChange={(e) => updateFormQuestion(qIndex, 'required', e.target.checked)}
                              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span>Obrigatório</span>
                          </label>
                        </div>
                      </div>

                      {(q.type === 'text' || q.type === 'textarea') && (
                        <div className="input-group">
                          <label>Placeholder</label>
                          <input
                            type="text"
                            value={q.placeholder || ''}
                            onChange={(e) => updateFormQuestion(qIndex, 'placeholder', e.target.value)}
                            placeholder="Texto de exemplo..."
                          />
                        </div>
                      )}

                      {(q.type === 'select' || q.type === 'multiselect') && (
                        <div className="input-group">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ margin: 0 }}>Opções</label>
                            <button type="button" onClick={() => addQuestionOption(qIndex)} className="btn btn-secondary btn-sm">
                              + Opção
                            </button>
                          </div>
                          {q.options.map((opt, oIndex) => (
                            <div key={oIndex} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => updateQuestionOption(qIndex, oIndex, e.target.value)}
                                placeholder={`Opção ${oIndex + 1}`}
                                style={{ flex: 1 }}
                              />
                              <button type="button" onClick={() => removeQuestionOption(qIndex, oIndex)} className="btn btn-danger btn-sm">
                                X
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {formData.type === 'texto' && (
              <>
                <div className="input-group">
                  <label>Instruções da Tarefa *</label>
                  <textarea
                    value={formData.textTask.instructions}
                    onChange={(e) => handleTextTaskChange('instructions', e.target.value)}
                    placeholder="Instruções sobre o que o usuário deve escrever..."
                    rows="4"
                    required={formData.type === 'texto'}
                  />
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Mínimo de Palavras *</label>
                    <input
                      type="number"
                      value={formData.textTask.minWords}
                      onChange={(e) => handleTextTaskChange('minWords', parseInt(e.target.value) || 0)}
                      min="10"
                      required={formData.type === 'texto'}
                    />
                  </div>

                  <div className="input-group">
                    <label>Máximo de Palavras *</label>
                    <input
                      type="number"
                      value={formData.textTask.maxWords}
                      onChange={(e) => handleTextTaskChange('maxWords', parseInt(e.target.value) || 0)}
                      min="50"
                      required={formData.type === 'texto'}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Texto de Exemplo</label>
                  <textarea
                    value={formData.textTask.exampleText}
                    onChange={(e) => handleTextTaskChange('exampleText', e.target.value)}
                    placeholder="Exemplo de texto que o usuário pode usar como referência..."
                    rows="5"
                  />
                </div>

                <div className="input-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ margin: 0 }}>Tópicos Sugeridos</label>
                    <button type="button" onClick={addTopic} className="btn btn-secondary btn-sm">
                      + Tópico
                    </button>
                  </div>
                  {formData.textTask.topics.map((topic, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => updateTopic(index, e.target.value)}
                        placeholder={`Tópico ${index + 1}`}
                        style={{ flex: 1 }}
                      />
                      <button type="button" onClick={() => removeTopic(index)} className="btn btn-danger btn-sm">
                        X
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="form-actions">
              <Link to="/admin/content-manager" className="btn btn-outline">
                Cancelar
              </Link>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMission;
