// ============================================================
// backend/src/middlewares/roles.js
// Control de acceso según el rol del usuario autenticado
// ============================================================

/**
 * Uso: router.get('/ruta', verificarToken, verificarRol(['admin', 'director_financiero']), controller)
 */
const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autenticado.' });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        error: `Acceso denegado. Se requiere uno de estos roles: ${rolesPermitidos.join(', ')}`
      });
    }

    next();
  };
};

module.exports = { verificarRol };
