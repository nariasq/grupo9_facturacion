// ============================================================
// frontend/src/App.jsx
// Rutas principales del sistema
// ============================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login              from './pages/Login';
import Dashboard          from './pages/Dashboard';
import MisSolicitudes     from './pages/MisSolicitudes';
import NuevaSolicitud     from './pages/NuevaSolicitud';
import DetalleSolicitud   from './pages/DetalleSolicitud';
import PanelAprobacion    from './pages/PanelAprobacion';
import Reportes           from './pages/Reportes';
import Navbar             from './components/Navbar';

// Ruta protegida: redirige al login si no hay sesión
const RutaProtegida = ({ children, rolesPermitidos }) => {
  const { usuario } = useAuth();

  if (!usuario) return <Navigate to="/login" replace />;

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Pública */}
          <Route path="/login" element={<Login />} />

          {/* Protegidas */}
          <Route path="/" element={
            <RutaProtegida>
              <Navbar />
              <Dashboard />
            </RutaProtegida>
          } />

          <Route path="/dashboard" element={
            <RutaProtegida>
              <Navbar />
              <Dashboard />
            </RutaProtegida>
          } />

          <Route path="/solicitudes" element={
            <RutaProtegida>
              <Navbar />
              <MisSolicitudes />
            </RutaProtegida>
          } />

          <Route path="/solicitudes/nueva" element={
            <RutaProtegida rolesPermitidos={['empleado', 'admin']}>
              <Navbar />
              <NuevaSolicitud />
            </RutaProtegida>
          } />

          <Route path="/solicitudes/:id" element={
            <RutaProtegida>
              <Navbar />
              <DetalleSolicitud />
            </RutaProtegida>
          } />

          <Route path="/aprobaciones" element={
            <RutaProtegida rolesPermitidos={['jefe', 'gerente', 'director_financiero']}>
              <Navbar />
              <PanelAprobacion />
            </RutaProtegida>
          } />

          <Route path="/reportes" element={
            <RutaProtegida rolesPermitidos={['admin', 'director_financiero']}>
              <Navbar />
              <Reportes />
            </RutaProtegida>
          } />

          {/* Redirige cualquier ruta desconocida al dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
