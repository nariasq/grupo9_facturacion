// ============================================================
// frontend/src/pages/NuevaSolicitud.jsx
// Formulario para crear una solicitud de compra o gasto
// ============================================================
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { solicitudesService } from '../services/api';

const campoStyle = {
  display: 'block', width: '100%', padding: '10px 12px',
  borderRadius: 6, border: '1px solid #ccc',
  fontSize: 15, boxSizing: 'border-box', marginBottom: 20,
  fontFamily: 'inherit',
};

const labelStyle = {
  display: 'block', marginBottom: 6,
  fontWeight: 500, fontSize: 14, color: '#333',
};

// Tabla de niveles de aprobación para que el usuario sepa qué esperar
const NIVELES = [
  { rango: 'Hasta $1.000.000',            nivel: 'Jefe inmediato' },
  { rango: 'Hasta $10.000.000',           nivel: 'Jefe + Gerente' },
  { rango: 'Más de $10.000.000',          nivel: 'Jefe + Gerente + Director Financiero' },
];

export default function NuevaSolicitud() {
  const [form, setForm] = useState({
    titulo:      '',
    descripcion: '',
    monto:       '',
    tipo:        'compra',
  });
  const [error, setError]     = useState('');
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (parseFloat(form.monto) <= 0) {
      return setError('El monto debe ser mayor a $0.');
    }

    setEnviando(true);
    try {
      await solicitudesService.crear({
        ...form,
        monto: parseFloat(form.monto),
      });
      navigate('/solicitudes');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la solicitud. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  // Calcular qué niveles aplican según el monto ingresado
  const montoNum = parseFloat(form.monto) || 0;
  const nivelesAplicables = montoNum <= 0 ? [] :
    montoNum <= 1000000   ? [NIVELES[0]] :
    montoNum <= 10000000  ? [NIVELES[0], NIVELES[1]] :
                            [NIVELES[0], NIVELES[1], NIVELES[2]];

  return (
    <div style={{ padding: '24px', maxWidth: 640, margin: '0 auto' }}>
      <Link to="/solicitudes" style={{ color: '#1a237e', fontSize: 14 }}>← Volver</Link>

      <h2 style={{ marginTop: 16 }}>Nueva Solicitud</h2>
      <p style={{ color: '#666', marginTop: 0 }}>
        Completa el formulario. La solicitud entrará automáticamente en la cadena de aprobación según el monto.
      </p>

      {error && (
        <div style={{
          background: '#ffebee', color: '#c62828', padding: '10px 14px',
          borderRadius: 6, marginBottom: 20, borderLeft: '4px solid #c62828',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Título de la solicitud *</label>
        <input
          name="titulo"
          value={form.titulo}
          onChange={handleChange}
          required
          placeholder="Ej: Compra de papelería para el área de ventas"
          style={campoStyle}
        />

        <label style={labelStyle}>Descripción detallada *</label>
        <textarea
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
          required
          placeholder="Describe qué se va a comprar, para qué y por qué es necesario..."
          style={{ ...campoStyle, height: 110, resize: 'vertical' }}
        />

        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Monto (COP $) *</label>
            <input
              name="monto"
              type="number"
              value={form.monto}
              onChange={handleChange}
              required
              min="1"
              placeholder="0"
              style={campoStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Tipo de solicitud *</label>
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              style={campoStyle}
            >
              <option value="compra">Compra</option>
              <option value="gasto">Gasto</option>
            </select>
          </div>
        </div>

        {/* Vista previa de la cadena de aprobación */}
        {nivelesAplicables.length > 0 && (
          <div style={{
            background: '#e8eaf6', borderRadius: 8, padding: 16, marginBottom: 20,
          }}>
            <p style={{ margin: '0 0 10px', fontWeight: 500, fontSize: 14, color: '#1a237e' }}>
              Cadena de aprobación para ${Number(form.monto).toLocaleString('es-CO')} COP:
            </p>
            {nivelesAplicables.map((n, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{
                  background: '#1a237e', color: 'white', borderRadius: '50%',
                  width: 22, height: 22, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 12, fontWeight: 'bold', flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 14, color: '#333' }}>{n.nivel}</span>
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={enviando}
          style={{
            width: '100%', padding: '12px 0', background: enviando ? '#9fa8da' : '#1a237e',
            color: 'white', border: 'none', borderRadius: 6,
            fontSize: 16, fontWeight: 500, cursor: enviando ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {enviando ? 'Enviando solicitud...' : 'Enviar Solicitud'}
        </button>
      </form>
    </div>
  );
}
