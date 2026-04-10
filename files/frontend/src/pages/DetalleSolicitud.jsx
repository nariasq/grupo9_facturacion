// ============================================================
// frontend/src/pages/DetalleSolicitud.jsx
// Muestra la trazabilidad completa de una solicitud (RETO 4)
// ============================================================
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { solicitudesService } from '../services/api';

const coloresEstado = {
  pendiente:  '#f9a825',
  aprobada:   '#388e3c',
  rechazada:  '#d32f2f',
};

export default function DetalleSolicitud() {
  const { id } = useParams();
  const [solicitud, setSolicitud]   = useState(null);
  const [historial, setHistorial]   = useState([]);
  const [cargando, setCargando]     = useState(true);

  useEffect(() => {
    Promise.all([
      solicitudesService.obtener(id),
      solicitudesService.historial(id),
    ]).then(([resSol, resHist]) => {
      setSolicitud(resSol.data);
      setHistorial(resHist.data);
    }).finally(() => setCargando(false));
  }, [id]);

  if (cargando) return <p style={{ padding: 24 }}>Cargando...</p>;
  if (!solicitud) return <p style={{ padding: 24 }}>Solicitud no encontrada.</p>;

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Link to="/solicitudes" style={{ color: '#1a237e', fontSize: 14 }}>← Volver</Link>

      {/* Encabezado de la solicitud */}
      <div style={{ background: '#f5f5f5', borderRadius: 8, padding: 20, margin: '16px 0' }}>
        <h2 style={{ margin: '0 0 8px' }}>{solicitud.titulo}</h2>
        <p style={{ margin: '0 0 4px' }}>{solicitud.descripcion}</p>
        <p style={{ margin: '0 0 4px' }}>
          Monto: <strong>${Number(solicitud.monto).toLocaleString('es-CO')} COP</strong>
          &nbsp;·&nbsp; Tipo: {solicitud.tipo}
        </p>
        <p style={{ margin: '0 0 4px' }}>
          Estado: <strong>{solicitud.estado.replace('_', ' ').toUpperCase()}</strong>
        </p>
        {solicitud.orden_compra_generada && (
          <p style={{ color: '#388e3c', fontWeight: 'bold' }}>✅ Orden de compra generada</p>
        )}
      </div>

      {/* Historial de aprobaciones — trazabilidad completa */}
      <h3>Historial de Aprobaciones</h3>
      <div style={{ position: 'relative' }}>
        {historial.map((paso, idx) => (
          <div key={paso.id} style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            {/* Indicador visual del paso */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: coloresEstado[paso.estado] || '#bdbdbd',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 'bold', fontSize: 14
              }}>
                {paso.orden}
              </div>
              {idx < historial.length - 1 && (
                <div style={{ width: 2, flex: 1, background: '#e0e0e0', minHeight: 20 }} />
              )}
            </div>

            {/* Contenido del paso */}
            <div style={{ flex: 1, paddingBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <strong>{paso.nivel}</strong>
                  <span style={{
                    marginLeft: 8, fontSize: 12, padding: '2px 8px', borderRadius: 10,
                    background: coloresEstado[paso.estado] || '#bdbdbd', color: 'white'
                  }}>
                    {paso.estado.toUpperCase()}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: '#888' }}>
                  {paso.fecha_accion
                    ? new Date(paso.fecha_accion).toLocaleString('es-CO')
                    : 'Pendiente'}
                </span>
              </div>

              {paso.aprobador && (
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#555' }}>
                  Por: {paso.aprobador}
                </p>
              )}
              {paso.comentario && (
                <p style={{
                  margin: '8px 0 0', padding: '8px 12px',
                  background: '#fff8e1', borderRadius: 4, fontSize: 13,
                  borderLeft: '3px solid #f9a825'
                }}>
                  "{paso.comentario}"
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
