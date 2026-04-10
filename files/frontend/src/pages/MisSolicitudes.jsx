// ============================================================
// frontend/src/pages/MisSolicitudes.jsx
// ============================================================
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { solicitudesService } from '../services/api';

const coloresEstado = {
  borrador:    '#9e9e9e',
  en_revision: '#1976d2',
  aprobada:    '#388e3c',
  rechazada:   '#d32f2f',
};

export default function MisSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando]       = useState(true);

  useEffect(() => {
    solicitudesService.listar()
      .then(res => setSolicitudes(res.data))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p style={{ padding: 24 }}>Cargando...</p>;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Mis Solicitudes</h2>
        <Link to="/solicitudes/nueva">
          <button style={{ padding: '8px 20px', background: '#1a237e', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            + Nueva Solicitud
          </button>
        </Link>
      </div>

      {solicitudes.length === 0 && <p>No has creado solicitudes aún.</p>}

      {solicitudes.map(s => (
        <div key={s.id} style={{
          border: '1px solid #e0e0e0', borderRadius: 8,
          padding: 16, marginBottom: 12,
          borderLeft: `5px solid ${coloresEstado[s.estado] || '#ccc'}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 4px' }}>{s.titulo}</h3>
              <p style={{ margin: '0 0 4px', color: '#555' }}>
                Monto: <strong>${Number(s.monto).toLocaleString('es-CO')} COP</strong>
                &nbsp;·&nbsp; Tipo: {s.tipo}
              </p>
              <p style={{ margin: 0, fontSize: 13, color: '#888' }}>
                Creado: {new Date(s.creado_en).toLocaleDateString('es-CO')}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                background: coloresEstado[s.estado] || '#ccc',
                color: 'white', padding: '4px 12px', borderRadius: 12, fontSize: 12
              }}>
                {s.estado.replace('_', ' ').toUpperCase()}
              </span>
              <br /><br />
              <Link to={`/solicitudes/${s.id}`} style={{ fontSize: 13, color: '#1a237e' }}>
                Ver historial →
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
