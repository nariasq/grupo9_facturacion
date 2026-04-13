import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { solicitudesService, reportesService } from '../services/api';
import { SkeletonWidgets, SkeletonTable } from '../components/SkeletonLoader';

const IconFileText = () => <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const IconClock  = () => <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>;
const IconCheck  = () => <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>;
const IconDollar = () => <svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([solicitudesService.listar(), reportesService.resumenGeneral()])
      .then(([solRes, repRes]) => {
        const solicitudes = solRes.data;
        const rep = repRes.data;
        setData({
          resumen: {
            totalSolicitudes: rep.total,
            pendientes: rep.en_revision,
            aprobadas: rep.aprobadas,
            rechazadas: rep.rechazadas,
            montoAprobado: rep.monto_total_aprobado || 0,
            tasaAprobacion: rep.total > 0 ? Math.round((rep.aprobadas / rep.total) * 100) : 0,
          },
          recientes: solicitudes.slice(0, 5),
        });
      })
      .catch(() => setData({ resumen: {}, recientes: [] }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="skeleton skeleton-text" style={{ width: 280, height: 28 }} />
            <div className="skeleton skeleton-text skeleton-text--md" style={{ marginTop: 8 }} />
          </div>
        </div>
        <SkeletonWidgets count={4} />
        <div style={{ marginTop: 24 }}><SkeletonTable rows={5} columns={5} /></div>
      </div>
    );
  }

  const { resumen, recientes } = data;
  const fmt = (n) => `${Number(n || 0).toLocaleString('es-CO')}`;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-header__title">Bienvenido, {user?.nombre} 👋</h2>
          <p className="page-header__subtitle">
            Rol: <span className="text-accent font-semibold">{user?.rol}</span>
            &nbsp;·&nbsp; Departamento: {user?.departamento}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/solicitudes/nueva"><button className="btn btn--primary">+ Nueva Solicitud</button></Link>
          <Link to="/solicitudes"><button className="btn btn--ghost">Ver Historial</button></Link>
        </div>
      </div>

      <div className="widgets-grid">
        <div className="widget-card widget-card--accent">
          <div className="widget-card__header">
            <span className="widget-card__title">Total Solicitudes</span>
            <div className="widget-card__icon widget-card__icon--accent"><IconFileText /></div>
          </div>
          <div className="widget-card__value">{resumen.totalSolicitudes || 0}</div>
        </div>
        <div className="widget-card widget-card--warning">
          <div className="widget-card__header">
            <span className="widget-card__title">Pendientes</span>
            <div className="widget-card__icon widget-card__icon--warning"><IconClock /></div>
          </div>
          <div className="widget-card__value">{resumen.pendientes || 0}</div>
        </div>
        <div className="widget-card widget-card--success">
          <div className="widget-card__header">
            <span className="widget-card__title">Aprobadas</span>
            <div className="widget-card__icon widget-card__icon--success"><IconCheck /></div>
          </div>
          <div className="widget-card__value">{resumen.aprobadas || 0}</div>
          <div className="widget-card__change widget-card__change--up">{resumen.tasaAprobacion}% tasa</div>
        </div>
        <div className="widget-card widget-card--danger">
          <div className="widget-card__header">
            <span className="widget-card__title">Monto Aprobado</span>
            <div className="widget-card__icon widget-card__icon--danger"><IconDollar /></div>
          </div>
          <div className="widget-card__value" style={{ fontSize: 'var(--text-2xl)' }}>{fmt(resumen.montoAprobado)}</div>
          <div className="widget-card__change" style={{ color: 'var(--text-muted)' }}>COP total</div>
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>
          Solicitudes Recientes
        </h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Título</th><th>Monto</th><th>Tipo</th><th>Fecha</th><th>Estado</th><th style={{ textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {recientes.map((s) => (
                <tr key={s.id}>
                  <td className="td-title">{s.titulo}</td>
                  <td className="td-monto">${Number(s.monto).toLocaleString('es-CO')}</td>
                  <td style={{ textTransform: 'capitalize' }}>{s.tipo}</td>
                  <td>{new Date(s.creado_en).toLocaleDateString('es-CO')}</td>
                  <td><span className={`badge badge--${s.estado}`}>{s.estado}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/solicitudes/${s.id}`} className="btn btn--ghost btn--sm">Ver →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
