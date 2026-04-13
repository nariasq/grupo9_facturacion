import { useEffect, useState } from 'react';
import { reportesService } from '../services/api';
import { SkeletonWidgets, SkeletonTable } from '../components/SkeletonLoader';

const IconFileText = () => <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>;
const IconEye     = () => <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconCheck   = () => <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>;
const IconX       = () => <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;
const IconDollar  = () => <svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
const IconTrend   = () => <svg viewBox="0 0 24 24"><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></svg>;

export default function Reportes() {
  const [resumen, setResumen] = useState(null);
  const [porDepto, setPorDepto] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([reportesService.resumenGeneral(), reportesService.porDepartamento()])
      .then(([repRes, depRes]) => {
        setResumen(repRes.data);
        setPorDepto(depRes.data);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const fmt = (n) => n ? `${Number(n).toLocaleString('es-CO')}` : '0';

  if (cargando) {
    return (
      <div>
        <div className="page-header"><div><div className="skeleton skeleton-text" style={{ width: 200, height: 28 }} /></div></div>
        <SkeletonWidgets count={6} />
        <div style={{ marginTop: 24 }}><SkeletonTable rows={5} columns={5} /></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-header__title">Reportes del Sistema</h2>
          <p className="page-header__subtitle">Métricas generales y desglose por departamento</p>
        </div>
      </div>

      {resumen && (
        <div className="widgets-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <div className="widget-card widget-card--accent">
            <div className="widget-card__header"><span className="widget-card__title">Total</span><div className="widget-card__icon widget-card__icon--accent"><IconFileText /></div></div>
            <div className="widget-card__value">{resumen.total}</div>
          </div>
          <div className="widget-card widget-card--warning">
            <div className="widget-card__header"><span className="widget-card__title">En Revisión</span><div className="widget-card__icon widget-card__icon--warning"><IconEye /></div></div>
            <div className="widget-card__value">{resumen.en_revision}</div>
          </div>
          <div className="widget-card widget-card--success">
            <div className="widget-card__header"><span className="widget-card__title">Aprobadas</span><div className="widget-card__icon widget-card__icon--success"><IconCheck /></div></div>
            <div className="widget-card__value">{resumen.aprobadas}</div>
          </div>
          <div className="widget-card widget-card--danger">
            <div className="widget-card__header"><span className="widget-card__title">Rechazadas</span><div className="widget-card__icon widget-card__icon--danger"><IconX /></div></div>
            <div className="widget-card__value">{resumen.rechazadas}</div>
          </div>
          <div className="widget-card widget-card--accent">
            <div className="widget-card__header"><span className="widget-card__title">Monto Aprobado</span><div className="widget-card__icon widget-card__icon--accent"><IconDollar /></div></div>
            <div className="widget-card__value" style={{ fontSize: 'var(--text-xl)' }}>{fmt(resumen.monto_total_aprobado)}</div>
            <div className="widget-card__change" style={{ color: 'var(--text-muted)' }}>COP total</div>
          </div>
          <div className="widget-card widget-card--success">
            <div className="widget-card__header"><span className="widget-card__title">Monto Promedio</span><div className="widget-card__icon widget-card__icon--success"><IconTrend /></div></div>
            <div className="widget-card__value" style={{ fontSize: 'var(--text-xl)' }}>{fmt(resumen.monto_promedio)}</div>
            <div className="widget-card__change" style={{ color: 'var(--text-muted)' }}>por solicitud</div>
          </div>
        </div>
      )}

      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)', color: 'var(--text-primary)' }}>
        Solicitudes por Departamento
      </h3>

      {porDepto.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📊</div>
          <h3 className="empty-state__title">No hay datos</h3>
          <p className="empty-state__desc">Aún no hay datos de departamentos disponibles.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Departamento</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'right' }}>Aprobadas</th>
                <th style={{ textAlign: 'right' }}>Rechazadas</th>
                <th style={{ textAlign: 'right' }}>Monto Total</th>
              </tr>
            </thead>
            <tbody>
              {porDepto.map((d) => (
                <tr key={d.departamento}>
                  <td className="td-title">{d.departamento || 'Sin departamento'}</td>
                  <td style={{ textAlign: 'right' }}>{d.total_solicitudes}</td>
                  <td style={{ textAlign: 'right' }}><span className="text-success font-semibold">{d.aprobadas}</span></td>
                  <td style={{ textAlign: 'right' }}><span className="text-danger font-semibold">{d.rechazadas}</span></td>
                  <td className="td-monto" style={{ textAlign: 'right' }}>{fmt(d.monto_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
