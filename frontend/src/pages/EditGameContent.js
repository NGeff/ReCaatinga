import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { gameAPI } from '../services/api';
import '../pages/AdminPanel.css';
import '../pages/EditGameContent.css';

const EditGameContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [game, setGame] = useState(null);
  const [content, setContent] = useState({});

  useEffect(() => {
    fetchGame();
  }, [id]);

  const fetchGame = async () => {
    try {
      const res = await gameAPI.getById(id);
      setGame(res.data);
      setContent(res.data.content || getDefaultContent(res.data.type));
    } catch (error) {
      toast.error('Erro ao carregar jogo');
      navigate('/admin/content-manager');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultContent = (type) => {
    const defaults = {
      'quiz': { questions: [] },
      'quiz-vf': { questions: [] },
      'memoria': { pairs: [] },
      'puzzle': { image: '', pieces: 9 },
      'arrastar': { items: [], targets: [] },
      'conexo': { groups: [] },
      'conectar': { leftItems: [], rightItems: [], connections: [] }
    };
    return defaults[type] || {};
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await gameAPI.update(id, { content });
      toast.success('Conteúdo do jogo salvo com sucesso!');
      navigate('/admin/content-manager');
    } catch (error) {
      toast.error('Erro ao salvar conteúdo');
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    const isVF = game.type === 'quiz-vf';
    setContent(prev => ({
      ...prev,
      questions: [...(prev.questions || []), {
        question: '',
        options: isVF ? [] : ['', '', '', ''],
        correctAnswer: isVF ? true : 0
      }]
    }));
  };

  const updateQuestion = (index, field, value) => {
    setContent(prev => {
      const questions = [...prev.questions];
      questions[index] = { ...questions[index], [field]: value };
      return { ...prev, questions };
    });
  };

  const updateQuestionOption = (qIndex, oIndex, value) => {
    setContent(prev => {
      const questions = [...prev.questions];
      questions[qIndex].options[oIndex] = value;
      return { ...prev, questions };
    });
  };

  const removeQuestion = (index) => {
    setContent(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const addPair = () => {
    setContent(prev => ({
      ...prev,
      pairs: [...(prev.pairs || []), { image1: '', image2: '' }]
    }));
  };

  const updatePair = (index, field, value) => {
    setContent(prev => {
      const pairs = [...prev.pairs];
      pairs[index] = { ...pairs[index], [field]: value };
      return { ...prev, pairs };
    });
  };

  const removePair = (index) => {
    setContent(prev => ({
      ...prev,
      pairs: prev.pairs.filter((_, i) => i !== index)
    }));
  };

  const addGroup = () => {
    setContent(prev => ({
      ...prev,
      groups: [...(prev.groups || []), { category: '', words: ['', '', '', ''] }]
    }));
  };

  const updateGroup = (index, field, value) => {
    setContent(prev => {
      const groups = [...prev.groups];
      groups[index] = { ...groups[index], [field]: value };
      return { ...prev, groups };
    });
  };

  const updateGroupWord = (gIndex, wIndex, value) => {
    setContent(prev => {
      const groups = [...prev.groups];
      groups[gIndex].words[wIndex] = value;
      return { ...prev, groups };
    });
  };

  const removeGroup = (index) => {
    setContent(prev => ({
      ...prev,
      groups: prev.groups.filter((_, i) => i !== index)
    }));
  };

  const addLeftItem = () => {
    setContent(prev => ({
      ...prev,
      leftItems: [...(prev.leftItems || []), { type: 'image', content: '', label: '' }]
    }));
  };

  const addRightItem = () => {
    setContent(prev => ({
      ...prev,
      rightItems: [...(prev.rightItems || []), { content: '' }]
    }));
  };

  const updateLeftItem = (index, field, value) => {
    setContent(prev => {
      const leftItems = [...prev.leftItems];
      leftItems[index] = { ...leftItems[index], [field]: value };
      return { ...prev, leftItems };
    });
  };

  const updateRightItem = (index, value) => {
    setContent(prev => {
      const rightItems = [...prev.rightItems];
      rightItems[index] = { content: value };
      return { ...prev, rightItems };
    });
  };

  const removeLeftItem = (index) => {
    setContent(prev => ({
      ...prev,
      leftItems: prev.leftItems.filter((_, i) => i !== index),
      connections: (prev.connections || []).filter(c => c.left !== index)
    }));
  };

  const removeRightItem = (index) => {
    setContent(prev => ({
      ...prev,
      rightItems: prev.rightItems.filter((_, i) => i !== index),
      connections: (prev.connections || []).filter(c => c.right !== index)
    }));
  };

  const addConnection = () => {
    setContent(prev => ({
      ...prev,
      connections: [...(prev.connections || []), { left: 0, right: 0 }]
    }));
  };

  const updateConnection = (index, field, value) => {
    setContent(prev => {
      const connections = [...prev.connections];
      connections[index] = { ...connections[index], [field]: parseInt(value) };
      return { ...prev, connections };
    });
  };

  const removeConnection = (index) => {
    setContent(prev => ({
      ...prev,
      connections: prev.connections.filter((_, i) => i !== index)
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
              <span className="admin-icon">🎮</span>
              Editar Conteúdo: {game?.title}
            </h1>
            <p>Tipo: {game?.type}</p>
          </div>
        </header>

        <div className="game-content-editor">
          {(game?.type === 'quiz' || game?.type === 'quiz-vf') && (
            <div className="editor-section">
              <div className="section-header">
                <h2>Perguntas ({content.questions?.length || 0})</h2>
                <button onClick={addQuestion} className="btn btn-primary">
                  + Adicionar Pergunta
                </button>
              </div>

              {content.questions?.map((q, qIndex) => (
                <div key={qIndex} className="question-card">
                  <div className="question-header">
                    <h3>Pergunta {qIndex + 1}</h3>
                    <button onClick={() => removeQuestion(qIndex)} className="btn btn-danger btn-sm">
                      Remover
                    </button>
                  </div>

                  <div className="input-group">
                    <label>Pergunta</label>
                    <textarea
                      value={q.question}
                      onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                      placeholder="Digite a pergunta..."
                      rows="2"
                    />
                  </div>

                  {game.type === 'quiz' && (
                    <>
                      <div className="options-grid">
                        {q.options?.map((opt, oIndex) => (
                          <div key={oIndex} className="input-group">
                            <label>Opção {oIndex + 1}</label>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => updateQuestionOption(qIndex, oIndex, e.target.value)}
                              placeholder={`Opção ${oIndex + 1}`}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="input-group">
                        <label>Resposta Correta</label>
                        <select
                          value={q.correctAnswer}
                          onChange={(e) => updateQuestion(qIndex, 'correctAnswer', parseInt(e.target.value))}
                        >
                          {q.options?.map((_, i) => (
                            <option key={i} value={i}>Opção {i + 1}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {game.type === 'quiz-vf' && (
                    <div className="input-group">
                      <label>Resposta Correta</label>
                      <select
                        value={q.correctAnswer === true || q.correctAnswer === 'true' ? 'true' : 'false'}
                        onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value === 'true')}
                      >
                        <option value="true">Verdadeiro</option>
                        <option value="false">Falso</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {game?.type === 'memoria' && (
            <div className="editor-section">
              <div className="section-header">
                <h2>Pares de Imagens ({content.pairs?.length || 0})</h2>
                <button onClick={addPair} className="btn btn-primary">
                  + Adicionar Par
                </button>
              </div>

              {content.pairs?.map((pair, index) => (
                <div key={index} className="pair-card">
                  <div className="pair-header">
                    <h3>Par {index + 1}</h3>
                    <button onClick={() => removePair(index)} className="btn btn-danger btn-sm">
                      Remover
                    </button>
                  </div>

                  <div className="pair-inputs">
                    <div className="input-group">
                      <label>URL Imagem 1</label>
                      <input
                        type="url"
                        value={pair.image1}
                        onChange={(e) => updatePair(index, 'image1', e.target.value)}
                        placeholder="https://exemplo.com/imagem1.jpg"
                      />
                    </div>

                    <div className="input-group">
                      <label>URL Imagem 2</label>
                      <input
                        type="url"
                        value={pair.image2}
                        onChange={(e) => updatePair(index, 'image2', e.target.value)}
                        placeholder="https://exemplo.com/imagem2.jpg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {game?.type === 'puzzle' && (
            <div className="editor-section">
              <h2>Configuração do Puzzle</h2>

              <div className="input-group">
                <label>URL da Imagem</label>
                <input
                  type="url"
                  value={content.image || ''}
                  onChange={(e) => setContent({ ...content, image: e.target.value })}
                  placeholder="https://exemplo.com/imagem-puzzle.jpg"
                />
              </div>

              <div className="input-group">
                <label>Número de Peças</label>
                <select
                  value={content.pieces || 9}
                  onChange={(e) => setContent({ ...content, pieces: parseInt(e.target.value) })}
                >
                  <option value="4">4 peças (2x2)</option>
                  <option value="9">9 peças (3x3)</option>
                  <option value="16">16 peças (4x4)</option>
                </select>
              </div>
            </div>
          )}

          {game?.type === 'conexo' && (
            <div className="editor-section">
              <div className="section-header">
                <h2>Grupos ({content.groups?.length || 0}/4)</h2>
                <button 
                  onClick={addGroup} 
                  className="btn btn-primary"
                  disabled={(content.groups?.length || 0) >= 4}
                >
                  + Adicionar Grupo
                </button>
              </div>

              {content.groups?.map((group, gIndex) => (
                <div key={gIndex} className="group-card">
                  <div className="group-header">
                    <h3>Grupo {gIndex + 1}</h3>
                    <button onClick={() => removeGroup(gIndex)} className="btn btn-danger btn-sm">
                      Remover
                    </button>
                  </div>

                  <div className="input-group">
                    <label>Categoria do Grupo</label>
                    <input
                      type="text"
                      value={group.category}
                      onChange={(e) => updateGroup(gIndex, 'category', e.target.value)}
                      placeholder="Ex: Animais da Caatinga"
                    />
                  </div>

                  <div className="words-grid">
                    <label>Palavras do Grupo (4)</label>
                    {[0, 1, 2, 3].map((wIndex) => (
                      <input
                        key={wIndex}
                        type="text"
                        value={group.words[wIndex] || ''}
                        onChange={(e) => updateGroupWord(gIndex, wIndex, e.target.value)}
                        placeholder={`Palavra ${wIndex + 1}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {game?.type === 'conectar' && (
            <div className="editor-section">
              <div className="section-header">
                <h2>Itens Esquerdos (Imagens) ({content.leftItems?.length || 0})</h2>
                <button onClick={addLeftItem} className="btn btn-primary">
                  + Adicionar Item
                </button>
              </div>

              {content.leftItems?.map((item, index) => (
                <div key={index} className="item-card">
                  <div className="item-header">
                    <h4>Item Esquerdo {index + 1}</h4>
                    <button onClick={() => removeLeftItem(index)} className="btn btn-danger btn-sm">
                      Remover
                    </button>
                  </div>

                  <div className="input-group">
                    <label>Tipo</label>
                    <select
                      value={item.type || 'image'}
                      onChange={(e) => updateLeftItem(index, 'type', e.target.value)}
                    >
                      <option value="image">Imagem</option>
                      <option value="text">Texto</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label>{item.type === 'image' ? 'URL da Imagem' : 'Texto'}</label>
                    <input
                      type={item.type === 'image' ? 'url' : 'text'}
                      value={item.content}
                      onChange={(e) => updateLeftItem(index, 'content', e.target.value)}
                      placeholder={item.type === 'image' ? 'https://exemplo.com/imagem.jpg' : 'Digite o texto'}
                    />
                  </div>

                  <div className="input-group">
                    <label>Rótulo (opcional)</label>
                    <input
                      type="text"
                      value={item.label || ''}
                      onChange={(e) => updateLeftItem(index, 'label', e.target.value)}
                      placeholder="Nome do item"
                    />
                  </div>
                </div>
              ))}

              <div className="section-header" style={{ marginTop: '2rem' }}>
                <h2>Itens Direitos (Nomes) ({content.rightItems?.length || 0})</h2>
                <button onClick={addRightItem} className="btn btn-primary">
                  + Adicionar Item
                </button>
              </div>

              {content.rightItems?.map((item, index) => (
                <div key={index} className="inline-input">
                  <label>Item Direito {index + 1}</label>
                  <input
                    type="text"
                    value={item.content}
                    onChange={(e) => updateRightItem(index, e.target.value)}
                    placeholder="Nome do item"
                  />
                  <button onClick={() => removeRightItem(index)} className="btn btn-danger btn-sm">
                    X
                  </button>
                </div>
              ))}

              <div className="section-header" style={{ marginTop: '2rem' }}>
                <h2>Conexões Corretas ({content.connections?.length || 0})</h2>
                <button onClick={addConnection} className="btn btn-primary">
                  + Adicionar Conexão
                </button>
              </div>

              {content.connections?.map((conn, index) => (
                <div key={index} className="connection-card">
                  <div className="connection-inputs">
                    <div className="input-group">
                      <label>Item Esquerdo</label>
                      <select
                        value={conn.left}
                        onChange={(e) => updateConnection(index, 'left', e.target.value)}
                      >
                        {content.leftItems?.map((_, i) => (
                          <option key={i} value={i}>Item {i + 1}</option>
                        ))}
                      </select>
                    </div>

                    <span className="connection-arrow">→</span>

                    <div className="input-group">
                      <label>Item Direito</label>
                      <select
                        value={conn.right}
                        onChange={(e) => updateConnection(index, 'right', e.target.value)}
                      >
                        {content.rightItems?.map((_, i) => (
                          <option key={i} value={i}>Item {i + 1}</option>
                        ))}
                      </select>
                    </div>

                    <button onClick={() => removeConnection(index)} className="btn btn-danger btn-sm">
                      X
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="editor-actions">
            <Link to="/admin/content-manager" className="btn btn-outline">
              Cancelar
            </Link>
            <button onClick={handleSave} className="btn btn-success" disabled={saving}>
              {saving ? 'Salvando...' : '💾 Salvar Conteúdo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditGameContent;
