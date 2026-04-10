// ============================================================
// frontend/src/pages/Dashboard.jsx
// Página de inicio — muestra accesos rápidos según el rol
// ============================================================
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { solicitudesService, aprobacionesService, notificacionesService } from '../services/api';

const Tarjeta = ({ to, emoji, titulo, subtitulo, color }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div style={{
      background: color, color: 'white', borderRadius: 12,
      padding: '24px 28px', minWidth: 180, cursor: 'pointer',
      transition: 'transform 0.15s', display: 'inline-block'
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ fontSize: 32, marginBottom: 8 }}>{emoji}</div>
      <div style={{ fontWeight: 500, fontSize: 16 }}>{titulo}</div>
      {subtitulo !== undefined && (
        <div style={{ fontSize: 22, fontWeight: 'bold', marginTop: 4 }}>{subtitulo}</div>
      )}
    </div>
  </Link>
);

export default function Dashboard() {
  const { usuario } = useAuth();
  const [stats, setStats] = useState({ misSolicitudes: 0, pendientes: 0, notificaciones: 0 });

  const rolesAprobadores = ['jefe', 'gerente', 'director_financiero'];
  const rolesAdmin       = ['admin', 'director_financiero'];

  useEffect(() => {
    // Cargar contadores según el rol
    const promesas = [
      solicitudesService.listar().catch(() => ({ data: [] })),
      notificacionesService.listar().catch(() => ({ data: [] })),
    ];

    if (rolesAprobadores.includes(usuario?.rol)) {
      promesas.push(aprobacionesService.misPendientes().catch(() => ({ data: [] })));
    }

    Promise.all(promesas).then(([sol, notif, apro]) => {
      setStats({
        misSolicitudes: sol.data.length,
        notificaciones: notif.data.filter(n => !n.leida).length,
        pendientes:     apro?.data?.length ?? 0,
      });
    });
  }, [usuario]);

  return (
    <div style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto' }}>

      {/* Saludo */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ margin: '0 0 4px' }}>Bienvenido, {usuario?.nombre} 👋</h2>
        <p style={{ margin: 0, color: '#666' }}>
          Conectado como <strong>{usuario?.rol}</strong> · {usuario?.email}
        </p>
      </div>

      {/* Tarjetas de acceso rápido */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 40 }}>

        {/* Empleados y admin pueden crear solicitudes */}
        {['empleado', 'admin'].includes(usuario?.rol) && (
          <Tarjeta
            to="/solicitudes/nueva"
            emoji="📝"
            titulo="Nueva Solicitud"
            color="#1a237e"
          />
        )}

        {/* Todas las solicitudes propias */}
        <Tarjeta
          to="/solicitudes"
          emoji="📋"
          titulo="Mis Solicitudes"
          subtitulo={stats.misSolicitudes}
          color="#37474f"
        />

        {/* Panel de aprobación solo para aprobadores */}
        {rolesAprobadores.includes(usuario?.rol) && (
          <Tarjeta
            to="/aprobaciones"
            emoji="✅"
            titulo="Pendientes de aprobar"
            subtitulo={stats.pendientes}
            color={stats.pendientes > 0 ? '#c62828' : '#2e7d32'}
          />
        )}

        {/* Reportes solo para admin/director */}
        {rolesAdmin.includes(usuario?.rol) && (
          <Tarjeta
            to="/reportes"
            emoji="📊"
            titulo="Reportes"
            color="#4a148c"
          />
        )}

        {/* Notificaciones no leídas */}
        <Tarjeta
          to="/solicitudes"
          emoji="🔔"
          titulo="Notificaciones nuevas"
          subtitulo={stats.notificaciones}
          color={stats.notificaciones > 0 ? '#e65100' : '#455a64'}
        />
      </div>

      {/* Descripción del rol */}
      <div style={{
        background: '#f5f5f5', borderRadius: 8, padding: 20,
        borderLeft: '4px solid #1a237e'
      }}>
        <h3 style={{ margin: '0 0 8px' }}>Tu rol: {usuario?.rol}</h3>
        <p style={{ margin: 0, color: '#555', fontSize: 14 }}>
          {usuario?.rol === 'empleado'         && 'Puedes crear solicitudes de compra o gasto y hacer seguimiento de su estado en tiempo real.'}
          {usuario?.rol === 'jefe'             && 'Apruebas o rechazas solicitudes de primer nivel (hasta $1.000.000 COP). Cada acción notifica al solicitante.'}
          {usuario?.rol === 'gerente'          && 'Apruebas o rechazas solicitudes de segundo nivel (hasta $10.000.000 COP) que ya pasaron por el jefe inmediato.'}
          {usuario?.rol === 'director_financiero' && 'Tienes el nivel de aprobación final. También puedes consultar reportes consolidados del sistema.'}
          {usuario?.rol === 'admin'            && 'Administras usuarios, configuras niveles de aprobación y tienes acceso completo a reportes.'}
        </p>
      </div>
    </div>
  );
}
