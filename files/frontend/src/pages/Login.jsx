// ============================================================
// frontend/src/pages/Login.jsx
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const res = await authService.login(form);
      login(res.data.token, res.data.usuario);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 24, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>🧾 Sistema de Facturación</h2>
      <h3>Iniciar sesión</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label><br />
          <input
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
            style={{ width: '100%', padding: 8, marginBottom: 12 }}
          />
        </div>
        <div>
          <label>Contraseña</label><br />
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
            style={{ width: '100%', padding: 8, marginBottom: 16 }}
          />
        </div>
        <button type="submit" disabled={cargando} style={{ width: '100%', padding: 10 }}>
          {cargando ? 'Cargando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}


// ============================================================
// frontend/src/pages/Dashboard.jsx
// ============================================================
// import { useAuth } from '../context/AuthContext';
//
// export default function Dashboard() {
//   const { usuario } = useAuth();
//   return (
//     <div style={{ padding: 24 }}>
//       <h2>Bienvenido, {usuario?.nombre} 👋</h2>
//       <p>Rol: <strong>{usuario?.rol}</strong></p>
//       <p>Desde aquí puedes gestionar tus solicitudes según tu rol.</p>
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
//   const navigate = useNavigate();
//
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await solicitudesService.crear({ ...form, monto: parseFloat(form.monto) });
//       navigate('/solicitudes');
//     } catch (err) {
//       setError(err.response?.data?.error || 'Error al crear la solicitud.');
//     }
//   };
//
//   return (
//     <div style={{ padding: 24, maxWidth: 600 }}>
//       <h2>Nueva Solicitud</h2>
//       {error && <p style={{ color: 'red' }}>{error}</p>}
//       <form onSubmit={handleSubmit}>
//         <label>Título</label>
//         <input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} required style={{display:'block', width:'100%', marginBottom:12, padding:8}} />
//
//         <label>Descripción</label>
//         <textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} required style={{display:'block', width:'100%', marginBottom:12, padding:8, height:100}} />
//
//         <label>Monto (COP $)</label>
//         <input type="number" value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} required min="1" style={{display:'block', width:'100%', marginBottom:12, padding:8}} />
//
//         <label>Tipo</label>
//         <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} style={{display:'block', width:'100%', marginBottom:16, padding:8}}>
//           <option value="compra">Compra</option>
//           <option value="gasto">Gasto</option>
//         </select>
//
//         <button type="submit" style={{padding:'10px 24px'}}>Enviar Solicitud</button>
//       </form>
//     </div>
//   );
// }


// ============================================================
// frontend/src/pages/PanelAprobacion.jsx
// ============================================================
// import { useEffect, useState } from 'react';
// import { aprobacionesService } from '../services/api';
//
// export default function PanelAprobacion() {
//   const [pendientes, setPendientes] = useState([]);
//   const [comentario, setComentario] = useState('');
//
//   useEffect(() => {
//     aprobacionesService.misPendientes().then(res => setPendientes(res.data));
//   }, []);
//
//   const actuar = async (id, accion) => {
//     await aprobacionesService.actuar(id, { accion, comentario });
//     setPendientes(pendientes.filter(p => p.aprobacion_id !== id));
//     setComentario('');
//   };
//
//   return (
//     <div style={{ padding: 24 }}>
//       <h2>Panel de Aprobación</h2>
//       {pendientes.length === 0 && <p>No hay solicitudes pendientes.</p>}
//       {pendientes.map(p => (
//         <div key={p.aprobacion_id} style={{ border: '1px solid #ccc', padding: 16, marginBottom: 12, borderRadius: 8 }}>
//           <h3>{p.titulo}</h3>
//           <p>Monto: <strong>${Number(p.monto).toLocaleString('es-CO')} COP</strong></p>
//           <p>Solicitante: {p.solicitante} — {p.departamento}</p>
//           <p>Descripción: {p.descripcion}</p>
//           <p>Nivel: {p.nivel}</p>
//           <textarea placeholder="Comentario (opcional)" value={comentario}
//             onChange={e => setComentario(e.target.value)}
//             style={{ width: '100%', padding: 8, marginBottom: 8 }} />
//           <button onClick={() => actuar(p.aprobacion_id, 'aprobar')} style={{ marginRight: 8, background: 'green', color: 'white', padding: '8px 16px' }}>
//             ✅ Aprobar
//           </button>
//           <button onClick={() => actuar(p.aprobacion_id, 'rechazar')} style={{ background: 'red', color: 'white', padding: '8px 16px' }}>
//             ❌ Rechazar
//           </button>
//         </div>
//       ))}
//     </div>
//   );
// }
