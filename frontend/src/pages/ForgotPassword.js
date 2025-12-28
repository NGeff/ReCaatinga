import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
      toast.success('Email de recuperação enviado!');
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao enviar email';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">🔑</span>
          <h1>ReCaatinga</h1>
          <h2>Recuperar Senha</h2>
          <p>Digite seu email para receber o link de recuperação</p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                autoComplete="email"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Link'}
            </button>
          </form>
        ) : (
          <div className="verify-info">
            <p style={{ textAlign: 'center', color: 'var(--auth-text)' }}>
              Email enviado com sucesso! Verifique sua caixa de entrada.
            </p>
            <p className="verify-email" style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              {email}
            </p>
          </div>
        )}

        <div className="auth-footer">
          <p>
            Lembrou sua senha?{' '}
            <Link to="/login">Entrar</Link>
          </p>
          <Link to="/" className="back-link">
            ← Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;