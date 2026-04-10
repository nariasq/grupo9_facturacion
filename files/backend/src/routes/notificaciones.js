// ============================================================
// backend/src/routes/notificaciones.js
// ============================================================
const router = require('express').Router();
const { listar, marcarLeida } = require('../controllers/notificacionesController');
const { verificarToken } = require('../middlewares/auth');

router.get('/',          verificarToken, listar);
router.put('/:id/leer', verificarToken, marcarLeida);

module.exports = router;
