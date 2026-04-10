// ============================================================
// frontend/src/pages/Reportes.jsx
// Solo visible para admin y director_financiero
// ============================================================
import { useEffect, useState } from 'react';
import { reportesService } from '../services/api';

const Tarjeta = ({ titulo, valor, color }) => (
  <div style={{
    background: color || '#1a237e', color: 'white',
    borderRadius: 8, padding: 20, flex: 1, minWidth: 140, textAlign: 'center'
  }}>
    <div style={{ fontSize: 28, fontWeight: 'bold' }}>{valor ?? '—'}</div>
    <div style={{ fontSize: 13, marginTop: 4 }}>{titulo}</div>
  </div>
);

export default function Reportes() {
  const [resumen, setResumen]         = useState(null);
  const [porDepto, setPorDepto]       = useState([]);
  const [cargando, setCargando]       = useState(true);

  useEffect(() => {
    Promise.all([
      reportesService.resumenGeneral(),
      reportesService.porDepartamento(),
    ]).then(([resRes, deptoRes]) => {
      setResumen(resRes.data);
      setPorDepto(deptoRes.data);
    }).finally(() => setCargando(false));
  }, []);

  if (cargando) return <p style={{ padding: 24 }}>Cargando reportes...</p>;

  const fmt = (n) => n ? `$${Number(n).toLocaleString('es-CO')}` : '$0';

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h2>📊 Reportes del Sistema</h2>

      {/* Tarjetas de resumen */}
      {resumen && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
          <Tarjeta titulo="Total solicitudes"    valor={resumen.total}       color="#1a237e" />
          <Tarjeta titulo="En revisión"          valor={resumen.en_revision} color="#1976d2" />
          <Tarjeta titulo="Aprobadas"            valor={resumen.aprobadas}   color="#388e3c" />
          <Tarjeta titulo="Rechazadas"           valor={resumen.rechazadas}  color="#d32f2f" />
          <Tarjeta titulo="Monto total aprobado" valor={fmt(resumen.monto_total_aprobado)} color="#5e35b1" />
          <Tarjeta titulo="Monto promedio"       valor={fmt(resumen.monto_promedio)}       color="#00838f" />
        </div>
      )}

      {/* Tabla por departamento */}
      <h3>Solicitudes por departamento</h3>
      {porDepto.length === 0 && <p>No hay datos disponibles.</p>}
      {porDepto.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1a237e', color: 'white' }}>
              <th style={{ padding: '10px 16px', textAlign: 'left' }}>Departamento</th>
              <th style={{ padding: '10px 16px', textAlign: 'right' }}>Total solicitudes</th>
              <th style={{ padding: '10px 16px', textAlign: 'right' }}>Aprobadas</th>
              <th style={{ padding: '10px 16px', textAlign: 'right' }}>Rechazadas</th>
              <th style={{ padding: '10px 16px', textAlign: 'right' }}>Monto total</th>
            </tr>
          </thead>
          <tbody>
            {porDepto.map((d, i) => (
              <tr key={d.departamento} style={{ background: i % 2 === 0 ? '#f5f5f5' : 'white' }}>
                <td style={{ padding: '10px 16px' }}>{d.departamento || 'Sin departamento'}</td>
                <td style={{ padding: '10px 16px', textAlign: 'right' }}>{d.total_solicitudes}</td>
                <td style={{ padding: '10px 16px', textAlign: 'right', color: '#388e3c', fontWeight: 'bold' }}>{d.aprobadas}</td>
                <td style={{ padding: '10px 16px', textAlign: 'right', color: '#d32f2f', fontWeight: 'bold' }}>{d.rechazadas}</td>
                <td style={{ padding: '10px 16px', textAlign: 'right' }}>{fmt(d.monto_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}


// ============================================================
// frontend/src/pages/Dashboard.jsx
// ============================================================
// import { useAuth } from '../context/AuthContext';
// import { Link } from 'react-router-dom';
//
// export default function Dashboard() {
//   const { usuario } = useAuth();
//   const rolesAprobadores = ['jefe', 'gerente', 'director_financiero'];
//
//   return (
//     <div style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
//       <h2>Bienvenido, {usuario?.nombre} 👋</h2>
//       <p style={{ color: '#555' }}>
//         Estás conectado como <strong>{usuario?.rol}</strong> en el Sistema de Facturación con Flujo de Aprobación.
//       </p>
//       <div style={{ display: 'flex', gap: 16, marginTop: 24, flexWrap: 'wrap' }}>
//         {['empleado', 'admin'].includes(usuario?.rol) && (
//           <Link to="/solicitudes/nueva">
//             <div style={{ background: '#1a237e', color: 'white', padding: 24, borderRadius: 8, minWidth: 180, textAlign: 'center', cursor: 'pointer' }}>
//               <div style={{ fontSize: 32 }}>📝</div>
//               <div style={{ marginTop: 8 }}>Nueva Solicitud</div>
//             </div>
//           </Link>
//         )}
//         <Link to="/solicitudes">
//           <div style={{ background: '#37474f', color: 'white', padding: 24, borderRadius: 8, minWidth: 180, textAlign: 'center', cursor: 'pointer' }}>
//             <div style={{ fontSize: 32 }}>📋</div>
//             <div style={{ marginTop: 8 }}>Mis Solicitudes</div>
//           </div>
//         </Link>
//         {rolesAprobadores.includes(usuario?.rol) && (
//           <Link to="/aprobaciones">
//             <div style={{ background: '#1565c0', color: 'white', padding: 24, borderRadius: 8, minWidth: 180, textAlign: 'center', cursor: 'pointer' }}>
//               <div style={{ fontSize: 32 }}>✅</div>
//               <div style={{ marginTop: 8 }}>Panel de Aprobación</div>
//             </div>
//           </Link>
//         )}
//       </div>
//     </div>
//   );
// }


// ============================================================
// frontend/src/pages/NuevaSolicitud.jsx
// ============================================================
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { solicitudesService } from '../services/api';
//
// export default function NuevaSolicitud() {
//   const [form, setForm] = useState({ titulo: '', descripcion: '', monto: '', tipo: 'compra' });
//   const [error, setError] = useState('');
//   const [enviando, setEnviando] = useState(false);
//   const navigate = useNavigate();
//
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setEnviando(true);
//     try {
//       await solicitudesService.crear({ ...form, monto: parseFloat(form.monto) });
//       navigate('/solicitudes');
//     } catch (err) {
//       setError(err.response?.data?.error || 'Error al crear la solicitud.');
//     } finally {
//       setEnviando(false);
//     }
//   };
//
//   return (
//     <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
//       <h2>Nueva Solicitud de Compra / Gasto</h2>
//       {error && <p style={{ color: 'red', background: '#ffebee', padding: 10, borderRadius: 4 }}>{error}</p>}
//       <form onSubmit={handleSubmit}>
//         <label style={{ display: 'block', marginBottom: 4 }}>Título *</label>
//         <input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} required
//           style={{ display: 'block', width: '100%', marginBottom: 16, padding: 10, borderRadius: 4, border: '1px solid #ccc', boxSizing: 'border-box' }} />
//
//         <label style={{ display: 'block', marginBottom: 4 }}>Descripción *</label>
//         <textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} required
//           style={{ display: 'block', width: '100%', marginBottom: 16, padding: 10, borderRadius: 4, border: '1px solid #ccc', height: 100, boxSizing: 'border-box' }} />
//
//         <label style={{ display: 'block', marginBottom: 4 }}>Monto (COP $) *</label>
//         <input type="number" value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} required min="1"
//           style={{ display: 'block', width: '100%', marginBottom: 16, padding: 10, borderRadius: 4, border: '1px solid #ccc', boxSizing: 'border-box' }} />
//
//         <label style={{ display: 'block', marginBottom: 4 }}>Tipo</label>
//         <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}
//           style={{ display: 'block', width: '100%', marginBottom: 24, padding: 10, borderRadius: 4, border: '1px solid #ccc' }}>
//           <option value="compra">Compra</option>
//           <option value="gasto">Gasto</option>
//         </select>
//
//         <button type="submit" disabled={enviando}
//           style={{ padding: '12px 32px', background: '#1a237e', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}>
//           {enviando ? 'Enviando...' : 'Crear Solicitud'}
//         </button>
//       </form>
//     </div>
//   );
// }
