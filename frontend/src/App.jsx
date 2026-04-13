// ============================================================
// frontend/src/App.jsx
// Rutas principales del sistema con DashboardLayout
// ============================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';

import Login              from './pages/Login';
import Dashboard          from './pages/Dashboard';
import MisSolicitudes     from './pages/MisSolicitudes';
import NuevaSolicitud     from './pages/NuevaSolicitud';
import DetalleSolicitud   from './pages/DetalleSolicitud';
import PanelAprobacion    from './pages/PanelAprobacion';
import Reportes           from './pages/Reportes';
import DashboardLayout    from './components/DashboardLayout';

// Ruta protegida: redirige al login si no hay sesión
const RutaProtegida = ({ children, rolesPermitidos }) => {
  const { usuario } = useAuth();

  if (!usuario) return <Navigate to="/login" replace />;

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Pública */}
            <Route path="/login" element={<Login />} />

            {/* Protegidas — envueltas en DashboardLayout */}
            <Route path="/" element={
              <RutaProtegida>
                <Dashboard />
              </RutaProtegida>
            } />

            <Route path="/dashboard" element={
              <RutaProtegida>
                <Dashboard />
              </RutaProtegida>
            } />

            <Route path="/solicitudes" element={
              <RutaProtegida>
                <MisSolicitudes />
              </RutaProtegida>
            } />

            <Route path="/solicitudes/nueva" element={
              <RutaProtegida rolesPermitidos={['empleado', 'admin']}>
                <NuevaSolicitud />
              </RutaProtegida>
            } />

            <Route path="/solicitudes/:id" element={
              <RutaProtegida>
                <DetalleSolicitud />
              </RutaProtegida>
            } />

            <Route path="/aprobaciones" element={
              <RutaProtegida rolesPermitidos={['jefe', 'gerente', 'director_financiero']}>
                <PanelAprobacion />
              </RutaProtegida>
            } />

            <Route path="/reportes" element={
              <RutaProtegida rolesPermitidos={['admin', 'director_financiero']}>
                <Reportes />
              </RutaProtegida>
            } />

            {/* Redirige cualquier ruta desconocida al dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
