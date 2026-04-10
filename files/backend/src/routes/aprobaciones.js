// ============================================================
// backend/src/routes/aprobaciones.js
// ============================================================
const router = require('express').Router();
const { misPendientes, actuar } = require('../controllers/aprobacionesController');
const { verificarToken } = require('../middlewares/auth');
const { verificarRol } = require('../middlewares/roles');

const rolesAprobadores = ['jefe', 'gerente', 'director_financiero'];

router.get('/mis-pendientes', verificarToken, verificarRol(rolesAprobadores), misPendientes);
router.put('/:id',            verificarToken, verificarRol(rolesAprobadores), actuar);

module.exports = router;
