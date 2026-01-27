import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { registerPushTokenIfAvailable } from '../utils/webview';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      login(response.data.token, response.data.user);
      toast.success('Login realizado com sucesso!');
      
      setTimeout(() => {
        registerPushTokenIfAvailable();
      }, 500);
      
      navigate('/dashboard');
    } catch (error) {
      // Verifica se é erro de email não verificado
      if (error.response?.status === 403 && error.response?.data?.requiresVerification) {
        const { email, newCodeSent } = error.response.data;
        
        if (newCodeSent) {
          toast.info('Um novo código de verificação foi enviado para seu email!');
        } else {
          toast.info('Você precisa verificar seu email primeiro.');
        }
        
        // Redireciona para a página de verificação
        navigate('/verify', { state: { email } });
      } else {
        const message = error.response?.data?.message || 'Erro ao fazer login';
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">🌿</span>
          <h1>ReCaatinga</h1>
          <h2>Entrar na Plataforma</h2>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="seu@email.com"
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label>Senha</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Não tem uma conta?{' '}
            <Link to="/register">Registre-se</Link>
          </p>
          <p>
            <Link to="/forgot-password">Esqueceu a senha?</Link>
          </p>
          <Link to="/" className="back-link">
            ← Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;