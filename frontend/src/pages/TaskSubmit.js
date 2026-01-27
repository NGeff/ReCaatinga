import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { missionAPI, taskAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaCamera, FaMapMarkerAlt, FaUpload, FaTimes, FaPaperPlane } from 'react-icons/fa';
import './TaskSubmit.css';

const TaskSubmit = () => {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [location, setLocation] = useState(null);
  const [notes, setNotes] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    fetchMission();
  }, [missionId]);

  const fetchMission = async () => {
    try {
      const response = await missionAPI.getById(missionId);
      setMission(response.data);
    } catch (error) {
      console.error('Erro ao carregar missão:', error);
      toast.error('Erro ao carregar missão');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (photos.length + files.length > 5) {
      toast.error('Máximo de 5 fotos permitidas');
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} é muito grande. Máximo 10MB por foto.`);
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} não é uma imagem válida.`);
        return;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setPhotos([...photos, ...validFiles]);
    setPhotoPreviews([...photoPreviews, ...newPreviews]);
  };

  const removePhoto = (index) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não é suportada pelo seu navegador');
      return;
    }

    setGettingLocation(true);
    toast.info('Obtendo sua localização...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
          );
          const data = await response.json();
          
          setLocation({
            ...coords,
            address: data.display_name || `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`
          });
          
          toast.success('Localização capturada com sucesso!');
        } catch (error) {
          setLocation({
            ...coords,
            address: `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`
          });
          toast.success('Coordenadas capturadas!');
        }
        
        setGettingLocation(false);
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        toast.error('Erro ao capturar localização. Verifique as permissões do navegador.');
        setGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiresPhoto = mission.taskDetails?.requiresPhoto || mission.type === 'foto';
    const requiresLocation = mission.taskDetails?.requiresLocation;

    if (requiresPhoto && photos.length === 0) {
      toast.error('Esta tarefa requer pelo menos uma foto');
      return;
    }

    if (requiresLocation && !location) {
      toast.error('Esta tarefa requer localização');
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append('missionId', missionId);
    
    if (notes.trim()) {
      formData.append('notes', notes);
    }
    
    if (location) {
      formData.append('location', JSON.stringify(location));
    }

    photos.forEach((photo) => {
      formData.append('photos', photo);
    });

    try {
      await taskAPI.submit(formData);
      toast.success('Tarefa enviada para análise com sucesso!');
      navigate(`/mission/${missionId}`);
    } catch (error) {
      console.error('Erro ao enviar tarefa:', error);
      const message = error.response?.data?.message || 'Erro ao enviar tarefa';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      photoPreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, []);

  if (loading) {
    return (
      <div className="task-submit-wrapper">
        <Navbar />
        <div className="task-loading">
          <div className="loading-spinner"></div>
          <p>Carregando missão...</p>
        </div>
      </div>
    );
  }

  const requiresPhoto = mission.taskDetails?.requiresPhoto || mission.type === 'foto';
  const requiresLocation = mission.taskDetails?.requiresLocation;

  return (
    <div className="task-submit-wrapper">
      <Navbar />
      
      <div className="task-submit-container">
        <div className="task-submit-hero">
          <h1>Enviar Tarefa</h1>
          <h2>{mission.title}</h2>
          <p className="task-instructions">
            {mission.taskDetails?.instructions || mission.description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="task-submit-form">
          {requiresPhoto && (
            <div className="form-section">
              <div className="section-header">
                <FaCamera className="section-icon" />
                <h3>Fotos da Tarefa</h3>
                {requiresPhoto && <span className="required-badge">Obrigatório</span>}
              </div>
              <p className="section-description">
                Envie fotos que comprovem a realização da tarefa. Você pode enviar até 5 fotos.
              </p>

              <div className="photo-upload-area">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  id="photo-input"
                  style={{ display: 'none' }}
                />
                <FaUpload className="upload-icon" />
                <label htmlFor="photo-input" className="upload-button">
                  <FaCamera />
                  <span>Escolher Fotos</span>
                </label>
                <p className="upload-info">
                  {photos.length}/5 fotos • JPG, PNG, WEBP • Máximo 10MB por foto
                </p>
              </div>

              {photoPreviews.length > 0 && (
                <div className="photo-previews">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="photo-preview">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="remove-photo-btn"
                        title="Remover foto"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {requiresLocation && (
            <div className="form-section">
              <div className="section-header">
                <FaMapMarkerAlt className="section-icon" />
                <h3>Localização</h3>
                {requiresLocation && <span className="required-badge">Obrigatório</span>}
              </div>
              <p className="section-description">
                Capture a localização exata onde a tarefa foi realizada para validação.
              </p>

              {!location ? (
                <button
                  type="button"
                  onClick={getLocation}
                  disabled={gettingLocation}
                  className="location-button"
                >
                  <FaMapMarkerAlt />
                  {gettingLocation ? 'Capturando Localização...' : 'Capturar Localização'}
                </button>
              ) : (
                <div className="location-display">
                  <div className="location-info">
                    <FaMapMarkerAlt className="location-icon" />
                    <div className="location-details">
                      <strong>Localização capturada:</strong>
                      <p>{location.address}</p>
                      <a
                        href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-map-link"
                      >
                        <FaMapMarkerAlt />
                        Ver no Google Maps
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocation(null)}
                    className="btn btn-outline"
                  >
                    Capturar Novamente
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="form-section">
            <div className="section-header">
              <h3>Observações (opcional)</h3>
            </div>
            <p className="section-description">
              Adicione informações extras sobre a tarefa realizada, dificuldades encontradas ou observações relevantes.
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="5"
              placeholder="Exemplo: Plantei 3 mudas de juazeiro na área próxima à escola. O solo estava um pouco seco mas consegui regar bem..."
              className="notes-textarea"
            />
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
              disabled={submitting || (requiresPhoto && photos.length === 0) || (requiresLocation && !location)}
              className="btn btn-primary"
            >
              <FaPaperPlane />
              {submitting ? 'Enviando...' : 'Enviar Tarefa'}
            </button>
          </div>
        </form>

        <div className="info-box">
          <h4>Informações Importantes</h4>
          <ul>
            <li>Sua tarefa será analisada por um administrador em até 48 horas</li>
            <li>Você receberá um email com o resultado da análise</li>
            <li>Tarefas aprovadas concedem XP, pontos e progresso na missão</li>
            <li>Certifique-se de enviar fotos claras e que comprovem a realização</li>
            <li>Caso seja rejeitada, você poderá enviar novamente com as correções</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TaskSubmit;
