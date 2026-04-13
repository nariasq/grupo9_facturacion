// ============================================================
// frontend/src/components/Sidebar.jsx
// Sidebar colapsable con navegación dinámica por rol
// ============================================================
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Iconos SVG inline
const Icons = {
  dashboard: (
    <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
  ),
  solicitudes: (
    <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10,9 9,9 8,9" /></svg>
  ),
  nueva: (
    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
  ),
  aprobaciones: (
    <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22,4 12,14.01 9,11.01" /></svg>
  ),
  reportes: (
    <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
  ),
  chevronLeft: (
    <svg viewBox="0 0 24 24"><polyline points="15,18 9,12 15,6" /></svg>
  ),
  chevronRight: (
    <svg viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6" /></svg>
  ),
};

export default function Sidebar({ collapsed, onToggle }) {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const rolesAprobadores = ['jefe', 'gerente', 'director_financiero'];
  const rolesAdmin = ['admin', 'director_financiero'];

  const menuItems = [
    { label: 'Dashboard', icon: Icons.dashboard, path: '/dashboard', section: 'General' },
    { label: 'Mis Solicitudes', icon: Icons.solicitudes, path: '/solicitudes', section: 'General' },
    {
      label: 'Nueva Solicitud', icon: Icons.nueva, path: '/solicitudes/nueva', section: 'General',
      roles: ['empleado', 'admin'],
    },
    {
      label: 'Aprobaciones', icon: Icons.aprobaciones, path: '/aprobaciones', section: 'Gestión',
      roles: rolesAprobadores,
    },
    {
      label: 'Reportes', icon: Icons.reportes, path: '/reportes', section: 'Gestión',
      roles: rolesAdmin,
    },
  ];

  const filteredItems = menuItems.filter(
    item => !item.roles || item.roles.includes(usuario?.rol)
  );

  const sections = {};
  filteredItems.forEach(item => {
    if (!sections[item.section]) sections[item.section] = [];
    sections[item.section].push(item);
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = usuario?.nombre
    ? usuario.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">🧾</div>
        <span className="sidebar__logo-text">FactuApp</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section}>
            <div className="sidebar__section-title">{section}</div>
            {items.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar__item ${isActive ? 'sidebar__item--active' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="sidebar__item-icon">{item.icon}</span>
                  <span className="sidebar__item-label">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__avatar">{initials}</div>
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{usuario?.nombre}</div>
            <div className="sidebar__user-role">{usuario?.rol}</div>
          </div>
        </div>
        <button className="sidebar__toggle" onClick={onToggle} title={collapsed ? 'Expandir' : 'Colapsar'}>
          {collapsed ? Icons.chevronRight : Icons.chevronLeft}
        </button>
      </div>
    </aside>
  );
}
