import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__logo">
          <div className="login-card__logo-icon">🧾</div>
          <span className="login-card__logo-text">FactuApp</span>
        </div>

        <p className="login-card__subtitle">
          Ingresa tus credenciales para acceder al sistema
        </p>

        {error && (
          <div className="form-error" style={{ marginBottom: 16 }}>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Correo electrónico <span>*</span></label>
            <input
              type="email"
              className="form-input"
              placeholder="admin@empresa.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña <span>*</span></label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn--primary btn--full btn--lg" disabled={cargando}>
            {cargando ? (
              <><div className="btn__spinner" /> Iniciando sesión...</>
            ) : (
              'Entrar al Sistema'
            )}
          </button>
        </form>

        <div className="login-card__footer">
          <p className="login-card__footer-text">
            Sistema de Gestión de Facturación — Grupo 9 SENA
          </p>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            Usuarios: admin@empresa.com / carlos@empresa.com — Pass: password123
          </div>
        </div>
      </div>
    </div>
  );
}
