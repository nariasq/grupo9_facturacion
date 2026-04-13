// ============================================================
// frontend/src/components/DashboardLayout.jsx
// Layout principal: Sidebar + Topbar + Content Area
// ============================================================
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleToggle = () => setCollapsed(c => !c);
  const handleMobileToggle = () => setMobileOpen(m => !m);

  return (
    <div className={`app-layout ${collapsed ? 'app-layout--collapsed' : ''}`}>
      {/* Overlay para mobile */}
      <div
        className={`sidebar-overlay ${mobileOpen ? 'sidebar-overlay--visible' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <div className={mobileOpen ? 'sidebar--mobile-open-wrapper' : ''}>
        <Sidebar
          collapsed={collapsed}
          onToggle={handleToggle}
        />
      </div>

      {/* Topbar */}
      <Topbar
        onMobileToggle={handleMobileToggle}
        currentPath={location.pathname}
      />

      {/* Main Content */}
      <main className="main-content">
        <div className="page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}
