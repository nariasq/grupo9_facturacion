// ============================================================
// GRUPO 9 — backend/src/index.js
// Punto de entrada del servidor Express
// ============================================================
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth',           require('./routes/auth'));
app.use('/api/solicitudes',    require('./routes/solicitudes'));
app.use('/api/aprobaciones',   require('./routes/aprobaciones'));
app.use('/api/notificaciones', require('./routes/notificaciones'));
app.use('/api/reportes',       require('./routes/reportes'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'API Grupo 9 - Sistema de Facturación funcionando ✅' });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
