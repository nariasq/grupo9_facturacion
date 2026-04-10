// ============================================================
// backend/src/routes/reportes.js
// ============================================================
const router = require('express').Router();
const { reportes } = require('../controllers/notificacionesController');
const { verificarToken } = require('../middlewares/auth');
const { verificarRol } = require('../middlewares/roles');

const rolesAdmin = ['admin', 'director_financiero'];

router.get('/solicitudes',      verificarToken, verificarRol(rolesAdmin), reportes.resumenGeneral);
router.get('/por-departamento', verificarToken, verificarRol(rolesAdmin), reportes.porDepartamento);

module.exports = router;
