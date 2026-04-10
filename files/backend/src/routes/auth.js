// ============================================================
// backend/src/routes/auth.js
// ============================================================
const router = require('express').Router();
const { login, register, perfil } = require('../controllers/authController');
const { verificarToken } = require('../middlewares/auth');
const { verificarRol } = require('../middlewares/roles');

router.post('/login',    login);
router.post('/register', verificarToken, verificarRol(['admin']), register);
router.get('/me',        verificarToken, perfil);

module.exports = router;


// ============================================================
// backend/src/routes/solicitudes.js
// ============================================================
// const router = require('express').Router();
// const { listar, obtener, historial, crear } = require('../controllers/solicitudesController');
// const { verificarToken } = require('../middlewares/auth');
//
// router.get('/',              verificarToken, listar);
// router.get('/:id',           verificarToken, obtener);
// router.get('/:id/historial', verificarToken, historial);
// router.post('/',             verificarToken, crear);
//
// module.exports = router;


// ============================================================
// backend/src/routes/aprobaciones.js
// ============================================================
// const router = require('express').Router();
// const { misPendientes, actuar } = require('../controllers/aprobacionesController');
// const { verificarToken } = require('../middlewares/auth');
// const { verificarRol } = require('../middlewares/roles');
//
// const rolesAprobadores = ['jefe', 'gerente', 'director_financiero'];
//
// router.get('/mis-pendientes', verificarToken, verificarRol(rolesAprobadores), misPendientes);
// router.put('/:id',            verificarToken, verificarRol(rolesAprobadores), actuar);
//
// module.exports = router;


// ============================================================
// backend/src/routes/notificaciones.js
// ============================================================
// const router = require('express').Router();
// const { listar, marcarLeida } = require('../controllers/notificacionesController');
// const { verificarToken } = require('../middlewares/auth');
//
// router.get('/',          verificarToken, listar);
// router.put('/:id/leer', verificarToken, marcarLeida);
//
// module.exports = router;


// ============================================================
// backend/src/routes/reportes.js
// ============================================================
// const router = require('express').Router();
// const { reportes } = require('../controllers/notificacionesController');
// const { verificarToken } = require('../middlewares/auth');
// const { verificarRol } = require('../middlewares/roles');
//
// const rolesAdmin = ['admin', 'director_financiero'];
//
// router.get('/solicitudes',        verificarToken, verificarRol(rolesAdmin), reportes.resumenGeneral);
// router.get('/por-departamento',   verificarToken, verificarRol(rolesAdmin), reportes.porDepartamento);
//
// module.exports = router;
