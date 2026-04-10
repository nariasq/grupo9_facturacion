// ============================================================
// backend/src/routes/solicitudes.js
// ============================================================
const router = require('express').Router();
const { listar, obtener, historial, crear } = require('../controllers/solicitudesController');
const { verificarToken } = require('../middlewares/auth');

router.get('/',              verificarToken, listar);
router.get('/:id',           verificarToken, obtener);
router.get('/:id/historial', verificarToken, historial);
router.post('/',             verificarToken, crear);

module.exports = router;
