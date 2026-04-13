import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { solicitudesService } from '../services/api';
import { SkeletonPage } from '../components/SkeletonLoader';

export default function DetalleSolicitud() {
  const { id } = useParams();
  const [solicitud, setSolicitud] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([solicitudesService.obtener(id), solicitudesService.historial(id)])
      .then(([solRes, histRes]) => {
        setSolicitud(solRes.data);
        setHistorial(histRes.data);
      })
      .catch(() => setSolicitud(null))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) return <SkeletonPage />;

  if (!solicitud) {
    return (
      <div className="empty-state" style={{ minHeight: 400 }}>
        <div className="empty-state__icon">🔍</div>
        <h3 className="empty-state__title">Solicitud no encontrada</h3>
        <Link to="/solicitudes" style={{ marginTop: 16 }}>
          <button className="btn btn--primary">Volver a Solicitudes</button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <Link to="/solicitudes" className="back-link">← Volver a Solicitudes</Link>

      <div className="detail-header">
        <div className="detail-header__top">
          <h2 className="detail-header__title">{solicitud.titulo}</h2>
          <span className={`badge badge--${solicitud.estado}`}>{solicitud.estado.replace('_', ' ')}</span>
        </div>
        {solicitud.descripcion && <p className="detail-header__desc">{solicitud.descripcion}</p>}
        <div className="detail-header__meta">
          <div className="detail-header__meta-item">
            <span className="detail-header__meta-label">Monto:</span>
            <span className="detail-header__meta-value">${Number(solicitud.monto).toLocaleString('es-CO')} COP</span>
          </div>
          <div className="detail-header__meta-item">
            <span className="detail-header__meta-label">Tipo:</span>
            <span className="detail-header__meta-value" style={{ textTransform: 'capitalize' }}>{solicitud.tipo}</span>
          </div>
          <div className="detail-header__meta-item">
            <span className="detail-header__meta-label">Fecha:</span>
            <span className="detail-header__meta-value">{new Date(solicitud.creado_en).toLocaleDateString('es-CO')}</span>
          </div>
          <div className="detail-header__meta-item">
            <span className="detail-header__meta-label">Solicitante:</span>
            <span className="detail-header__meta-value">{solicitud.solicitante}</span>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-lg)', color: 'var(--text-primary)' }}>
        Historial de Aprobaciones
      </h3>

      {historial.length === 0 ? (
        <div className="empty-state" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          <div className="empty-state__icon">📝</div>
          <h3 className="empty-state__title">Sin historial</h3>
          <p className="empty-state__desc">Aún no hay pasos registrados en la cadena de aprobación.</p>
        </div>
      ) : (
        <div className="timeline">
          {historial.map((paso) => (
            <div key={paso.id} className="timeline__item">
              <div className={`timeline__dot timeline__dot--${paso.estado}`}>{paso.orden}</div>
              <div className="timeline__content">
                <div className="timeline__header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span className="timeline__level">{paso.nivel}</span>
                    <span className={`badge badge--${paso.estado}`}>{paso.estado.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  <span className="timeline__date">
                    {paso.fecha_accion ? new Date(paso.fecha_accion).toLocaleString('es-CO') : 'Pendiente'}
                  </span>
                </div>
                {paso.aprobador && <p className="timeline__person">Aprobado por: <strong>{paso.aprobador}</strong></p>}
                {paso.comentario && <div className="timeline__comment">"{paso.comentario}"</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
