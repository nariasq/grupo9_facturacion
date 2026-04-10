// ============================================================
// frontend/src/pages/PanelAprobacion.jsx
// Solo visible para jefe, gerente, director_financiero
// ============================================================
import { useEffect, useState } from 'react';
import { aprobacionesService } from '../services/api';

export default function PanelAprobacion() {
  const [pendientes, setPendientes] = useState([]);
  const [cargando, setCargando]     = useState(true);
  const [comentarios, setComentarios] = useState({}); // { [aprobacion_id]: string }
  const [procesando, setProcesando] = useState(null);

  useEffect(() => {
    aprobacionesService.misPendientes()
      .then(res => setPendientes(res.data))
      .finally(() => setCargando(false));
  }, []);

  const actuar = async (aprobacionId, accion) => {
    setProcesando(aprobacionId);
    try {
      await aprobacionesService.actuar(aprobacionId, {
        accion,
        comentario: comentarios[aprobacionId] || '',
      });
      setPendientes(prev => prev.filter(p => p.aprobacion_id !== aprobacionId));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al procesar la aprobación.');
    } finally {
      setProcesando(null);
    }
  };

  if (cargando) return <p style={{ padding: 24 }}>Cargando...</p>;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h2>Panel de Aprobación</h2>
      <p style={{ color: '#555' }}>Solicitudes pendientes asignadas a tu nivel.</p>

      {pendientes.length === 0 && (
        <div style={{ padding: 32, textAlign: 'center', color: '#888', background: '#f9f9f9', borderRadius: 8 }}>
          ✅ No tienes solicitudes pendientes por aprobar.
        </div>
      )}

      {pendientes.map(p => (
        <div key={p.aprobacion_id} style={{
          border: '1px solid #e0e0e0', borderRadius: 8,
          padding: 20, marginBottom: 16,
          borderLeft: '5px solid #1976d2'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 6px' }}>{p.titulo}</h3>
              <p style={{ margin: '0 0 4px' }}>
                Monto: <strong style={{ color: '#1a237e', fontSize: 18 }}>
                  ${Number(p.monto).toLocaleString('es-CO')} COP
                </strong>
              </p>
              <p style={{ margin: '0 0 4px', color: '#555' }}>{p.descripcion}</p>
              <p style={{ margin: '0 0 4px', fontSize: 13, color: '#888' }}>
                Solicitante: {p.solicitante} — {p.departamento}
                &nbsp;·&nbsp; Tipo: {p.tipo}
                &nbsp;·&nbsp; Nivel: <strong>{p.nivel}</strong>
              </p>
              <p style={{ margin: 0, fontSize: 12, color: '#aaa' }}>
                Fecha solicitud: {new Date(p.fecha_solicitud).toLocaleDateString('es-CO')}
              </p>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <textarea
              placeholder="Comentario u observación (opcional)"
              value={comentarios[p.aprobacion_id] || ''}
              onChange={e => setComentarios(prev => ({ ...prev, [p.aprobacion_id]: e.target.value }))}
              style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', minHeight: 60, boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
            <button
              onClick={() => actuar(p.aprobacion_id, 'aprobar')}
              disabled={procesando === p.aprobacion_id}
              style={{
                padding: '10px 20px', background: '#388e3c', color: 'white',
                border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold'
              }}>
              ✅ Aprobar
            </button>
            <button
              onClick={() => actuar(p.aprobacion_id, 'rechazar')}
              disabled={procesando === p.aprobacion_id}
              style={{
                padding: '10px 20px', background: '#d32f2f', color: 'white',
                border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold'
              }}>
              ❌ Rechazar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
