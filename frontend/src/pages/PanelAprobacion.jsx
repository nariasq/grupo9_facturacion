import { useState, useEffect } from 'react';
import { aprobacionesService } from '../services/api';
import { SkeletonPage } from '../components/SkeletonLoader';
import { useToast } from '../components/Toast';

export default function PanelAprobacion() {
  const [pendientes, setPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [comentarios, setComentarios] = useState({});
  const [procesando, setProcesando] = useState(null);
  const toast = useToast();

  useEffect(() => {
    aprobacionesService.misPendientes()
      .then(res => setPendientes(res.data))
      .catch(() => setPendientes([]))
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
      if (accion === 'aprobar') {
        toast.success('Solicitud aprobada', 'La solicitud avanza al siguiente nivel.');
      } else {
        toast.error('Solicitud rechazada', 'La solicitud fue rechazada y notificada al solicitante.');
      }
    } catch (err) {
      toast.error('Error', err.response?.data?.error || 'No se pudo procesar la acción.');
    } finally {
      setProcesando(null);
    }
  };

  if (cargando) return <SkeletonPage />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-header__title">Panel de Aprobación</h2>
          <p className="page-header__subtitle">Solicitudes pendientes asignadas a tu nivel de aprobación</p>
        </div>
        <div className="badge badge--pendiente" style={{ fontSize: 'var(--text-sm)', padding: '6px 16px' }}>
          {pendientes.length} pendiente{pendientes.length !== 1 ? 's' : ''}
        </div>
      </div>

      {pendientes.length === 0 && (
        <div className="empty-state" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', minHeight: 300 }}>
          <div className="empty-state__icon">✅</div>
          <h3 className="empty-state__title">¡Todo al día!</h3>
          <p className="empty-state__desc">No tienes solicitudes pendientes por aprobar.</p>
        </div>
      )}

      {pendientes.map(p => (
        <div key={p.aprobacion_id} className="approval-card">
          <div className="approval-card__header">
            <div style={{ flex: 1 }}>
              <div className="approval-card__title">{p.titulo}</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', margin: '8px 0', lineHeight: 1.6 }}>{p.descripcion}</p>
              <div className="approval-card__meta">
                <span><strong>Solicitante:</strong> {p.solicitante} — {p.departamento}</span><br />
                <span><strong>Tipo:</strong> <span style={{ textTransform: 'capitalize' }}>{p.tipo}</span> · <strong>Nivel:</strong> {p.nivel}</span><br />
                <span style={{ fontSize: 'var(--text-xs)' }}>Fecha: {new Date(p.fecha_solicitud).toLocaleDateString('es-CO')}</span>
              </div>
            </div>
            <div className="approval-card__amount">
              ${Number(p.monto).toLocaleString('es-CO')}
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 400 }}>COP</div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
            <textarea
              className="form-textarea"
              placeholder="Comentario u observación (opcional)"
              value={comentarios[p.aprobacion_id] || ''}
              onChange={e => setComentarios(prev => ({ ...prev, [p.aprobacion_id]: e.target.value }))}
              style={{ minHeight: 70 }}
            />
          </div>

          <div className="approval-card__actions">
            <button className="btn btn--success" onClick={() => actuar(p.aprobacion_id, 'aprobar')} disabled={procesando === p.aprobacion_id}>
              {procesando === p.aprobacion_id ? <div className="btn__spinner" /> : <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>}
              Aprobar
            </button>
            <button className="btn btn--danger" onClick={() => actuar(p.aprobacion_id, 'rechazar')} disabled={procesando === p.aprobacion_id}>
              {procesando === p.aprobacion_id ? <div className="btn__spinner" /> : <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
              Rechazar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
