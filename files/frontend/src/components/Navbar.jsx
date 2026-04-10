// ============================================================
// frontend/src/components/Navbar.jsx
// Barra de navegación que cambia según el rol del usuario
// ============================================================
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const rolesAprobadores = ['jefe', 'gerente', 'director_financiero'];
  const rolesAdmin       = ['admin', 'director_financiero'];

  return (
    <nav style={{
      background: '#1a237e', color: 'white',
      padding: '12px 24px', display: 'flex',
      justifyContent: 'space-between', alignItems: 'center'
    }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <strong>🧾 Facturación</strong>
        <Link to="/dashboard"    style={{ color: 'white', textDecoration: 'none' }}>Inicio</Link>
        <Link to="/solicitudes"  style={{ color: 'white', textDecoration: 'none' }}>Mis Solicitudes</Link>

        {/* Solo empleados pueden crear solicitudes */}
        {['empleado', 'admin'].includes(usuario?.rol) && (
          <Link to="/solicitudes/nueva" style={{ color: '#90caf9', textDecoration: 'none' }}>+ Nueva</Link>
        )}

        {/* Panel de aprobación solo para aprobadores */}
        {rolesAprobadores.includes(usuario?.rol) && (
          <Link to="/aprobaciones" style={{ color: '#a5d6a7', textDecoration: 'none' }}>Aprobaciones</Link>
        )}

        {/* Reportes solo para admin/director */}
        {rolesAdmin.includes(usuario?.rol) && (
          <Link to="/reportes" style={{ color: '#ffe082', textDecoration: 'none' }}>Reportes</Link>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 13 }}>{usuario?.nombre} ({usuario?.rol})</span>
        <button onClick={handleLogout} style={{
          background: 'transparent', border: '1px solid white',
          color: 'white', padding: '4px 12px', cursor: 'pointer', borderRadius: 4
        }}>
          Salir
        </button>
      </div>
    </nav>
  );
}
