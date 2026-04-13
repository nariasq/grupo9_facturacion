import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { solicitudesService } from '../services/api';
import { useToast } from '../components/Toast';

const NIVELES = [
  { rango: 'Hasta $1.000.000',   nivel: 'Jefe inmediato' },
  { rango: 'Hasta $10.000.000',  nivel: 'Jefe + Gerente' },
  { rango: 'Más de $10.000.000', nivel: 'Jefe + Gerente + Director Financiero' },
];

export default function NuevaSolicitud() {
  const [form, setForm] = useState({ titulo: '', descripcion: '', monto: '', tipo: 'compra' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (parseFloat(form.monto) <= 0) return setError('El monto debe ser mayor a $0.');
    setEnviando(true);
    try {
      await solicitudesService.crear({ ...form, monto: parseFloat(form.monto) });
      toast.success('Solicitud creada', `"${form.titulo}" ha sido enviada a la cadena de aprobación.`);
      navigate('/solicitudes');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la solicitud.');
    } finally {
      setEnviando(false);
    }
  };

  const montoNum = parseFloat(form.monto) || 0;
  const nivelesAplicables = montoNum <= 0 ? [] :
    montoNum <= 1000000  ? [NIVELES[0]] :
    montoNum <= 10000000 ? [NIVELES[0], NIVELES[1]] :
                           [NIVELES[0], NIVELES[1], NIVELES[2]];

  return (
    <div style={{ maxWidth: 640 }}>
      <Link to="/solicitudes" className="back-link">← Volver a Solicitudes</Link>

      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h2 className="page-header__title">Nueva Solicitud</h2>
          <p className="page-header__subtitle">La solicitud entrará automáticamente en la cadena de aprobación según el monto.</p>
        </div>
      </div>

      {error && (
        <div className="form-error">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Título <span>*</span></label>
          <input name="titulo" className="form-input" value={form.titulo} onChange={handleChange} required placeholder="Ej: Compra de papelería" />
        </div>
        <div className="form-group">
          <label className="form-label">Descripción <span>*</span></label>
          <textarea name="descripcion" className="form-textarea" value={form.descripcion} onChange={handleChange} required placeholder="Describe qué se va a comprar y por qué..." />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Monto (COP $) <span>*</span></label>
            <input name="monto" type="number" className="form-input" value={form.monto} onChange={handleChange} required min="1" placeholder="0" />
          </div>
          <div className="form-group">
            <label className="form-label">Tipo <span>*</span></label>
            <select name="tipo" className="form-select" value={form.tipo} onChange={handleChange}>
              <option value="compra">Compra</option>
              <option value="gasto">Gasto</option>
            </select>
          </div>
        </div>

        {nivelesAplicables.length > 0 && (
          <div className="approval-chain">
            <div className="approval-chain__title">
              Cadena de aprobación para ${Number(form.monto).toLocaleString('es-CO')} COP:
            </div>
            {nivelesAplicables.map((n, i) => (
              <div key={i} className="approval-chain__step">
                <span className="approval-chain__number">{i + 1}</span>
                <span className="approval-chain__label">{n.nivel}</span>
              </div>
            ))}
          </div>
        )}

        <button type="submit" className="btn btn--primary btn--full btn--lg" disabled={enviando}>
          {enviando ? <><div className="btn__spinner" /> Enviando...</> : 'Enviar Solicitud'}
        </button>
      </form>
    </div>
  );
}
