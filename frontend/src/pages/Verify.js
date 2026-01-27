import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import './Verify.css';

const Verify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.error('Email não fornecido. Redirecionando...');
      navigate('/register');
    }
  }, [email, navigate]);

  if (!email) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (code.length !== 6) {
      toast.error('O código deve ter 6 dígitos');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.verify({ email, code });
      login(response.data.token, response.data.user);
      toast.success('Email verificado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Código inválido ou expirado';
      
      if (message === 'Código expirado') {
        toast.error('Código expirado! Clique em "Reenviar código" para receber um novo.');
      } else if (message === 'Email já verificado') {
        toast.info('Este email já foi verificado! Redirecionando para o login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authAPI.resendCode({ email });
      toast.success('Novo código enviado para seu email!');
      setCode('');
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao reenviar código';
      
      if (message === 'Email já verificado') {
        toast.info('Este email já foi verificado! Redirecionando para o login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error(message);
      }
    } finally {
      setResending(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  return (
    <div className="verify-wrapper">
      <div className="verify-card">
        <div className="verify-header">
          <span className="verify-logo">📧</span>
          <h1>ReCaatinga</h1>
          <h2>Verificar Email</h2>
          <p>
            Enviamos um código de verificação de 6 dígitos para:
          </p>
          <div className="verify-email-box">
            <span className="verify-email">{email}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="verify-form">
          <div className="input-group">
            <label>Código de Verificação</label>
            <input
              type="text"
              value={code}
              onChange={handleCodeChange}
              required
              placeholder="000000"
              maxLength={6}
              className="code-input"
              autoComplete="off"
              inputMode="numeric"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block" 
            disabled={loading || code.length !== 6}
          >
            {loading ? 'Verificando...' : 'Verificar Email'}
          </button>
        </form>

        <div className="verify-info">
          <p>
            O código expira em 15 minutos. Verifique sua caixa de spam 
            se não recebeu o email.
          </p>
        </div>

        <div className="verify-footer">
          <p>
            Não recebeu o código?{' '}
            <button 
              onClick={handleResend} 
              className="link-button"
              disabled={resending}
            >
              {resending ? 'Enviando...' : 'Reenviar código'}
            </button>
          </p>
        </div>

        <div className="verify-tips">
          <h3>Dicas:</h3>
          <ul>
            <li>Verifique sua caixa de spam ou lixo eletrônico</li>
            <li>Certifique-se de que o email está correto</li>
            <li>O código tem validade de 15 minutos</li>
            <li>Se o código expirou, clique em "Reenviar código"</li>
            <li>Você pode solicitar um novo código a qualquer momento</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Verify;