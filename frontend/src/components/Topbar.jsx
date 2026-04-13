// ============================================================
// frontend/src/components/Topbar.jsx
// Barra superior con notificaciones y usuario
// ============================================================
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificacionesService } from '../services/api';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/solicitudes': 'Mis Solicitudes',
  '/solicitudes/nueva': 'Nueva Solicitud',
  '/aprobaciones': 'Panel de Aprobación',
  '/reportes': 'Reportes',
};

export default function Topbar({ onMobileToggle, currentPath }) {
  const { usuario } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificacionesService.listar()
      .then(res => setUnread(res.data.filter(n => !n.leida).length))
      .catch(() => {});
  }, []);

  const title = PAGE_TITLES[currentPath] || 'Dashboard';

  const initials = usuario?.nombre
    ? usuario.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button className="topbar__mobile-toggle" onClick={onMobileToggle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="topbar__title">{title}</h1>
      </div>

      <div className="topbar__right">
        <button className="topbar__notification-btn" title="Notificaciones">
          <svg viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          {unread > 0 && <span className="topbar__notification-badge">{unread}</span>}
        </button>

        <div className="topbar__user">
          <div className="topbar__user-avatar">{initials}</div>
          <div>
            <div className="topbar__user-name">{usuario?.nombre}</div>
            <div className="topbar__user-role">{usuario?.departamento}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
