import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { solicitudesService } from '../services/api';
import { SkeletonTable } from '../components/SkeletonLoader';

const FILTROS = ['Todos', 'en_revision', 'aprobada', 'rechazada'];
const LABEL = { Todos: 'Todos', en_revision: 'En Revisión', aprobada: 'Aprobada', rechazada: 'Rechazada' };

export default function MisSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('Todos');

  useEffect(() => {
    solicitudesService.listar()
      .then(res => setSolicitudes(res.data))
      .catch(() => setSolicitudes([]))
      .finally(() => setCargando(false));
  }, []);

  const filtradas = filtro === 'Todos' ? solicitudes : solicitudes.filter(s => s.estado === filtro);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-header__title">Mis Solicitudes</h2>
          <p className="page-header__subtitle">Gestiona y revisa tus solicitudes de compra y gasto</p>
        </div>
        <Link to="/solicitudes/nueva">
          <button className="btn btn--primary">+ Nueva Solicitud</button>
        </Link>
      </div>

      <div className="filter-tabs">
        {FILTROS.map(f => (
          <button key={f} className={`filter-tab ${filtro === f ? 'filter-tab--active' : ''}`} onClick={() => setFiltro(f)}>
            {LABEL[f]}
            {f !== 'Todos' && (
              <span style={{ marginLeft: 6, opacity: 0.6 }}>
                ({solicitudes.filter(s => s.estado === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {cargando ? (
        <SkeletonTable rows={6} columns={6} />
      ) : filtradas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📋</div>
          <h3 className="empty-state__title">No hay solicitudes</h3>
          <p className="empty-state__desc">
            {filtro === 'Todos' ? 'No has creado ninguna solicitud aún.' : `No tienes solicitudes con estado "${LABEL[filtro]}".`}
          </p>
          {filtro === 'Todos' && (
            <Link to="/solicitudes/nueva" style={{ marginTop: 16 }}>
              <button className="btn btn--primary">Crear Solicitud</button>
            </Link>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Título</th><th>Monto</th><th>Tipo</th><th>Fecha</th><th>Estado</th><th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map(s => (
                <tr key={s.id}>
                  <td className="td-title">{s.titulo}</td>
                  <td className="td-monto">${Number(s.monto).toLocaleString('es-CO')}</td>
                  <td style={{ textTransform: 'capitalize' }}>{s.tipo}</td>
                  <td>{new Date(s.creado_en).toLocaleDateString('es-CO')}</td>
                  <td><span className={`badge badge--${s.estado}`}>{s.estado.replace('_', ' ')}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/solicitudes/${s.id}`} className="btn btn--ghost btn--sm">Ver historial →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
