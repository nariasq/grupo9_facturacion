// ============================================================
// backend/src/controllers/notificacionesController.js
// ============================================================
const pool = require('../config/db');

// GET /api/notificaciones
const listar = async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id, titulo, mensaje, leida, solicitud_id, creado_en
       FROM notificaciones
       WHERE usuario_id = $1
       ORDER BY creado_en DESC
       LIMIT 50`,
      [req.usuario.id]
    );
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// PUT /api/notificaciones/:id/leer
const marcarLeida = async (req, res) => {
  try {
    await pool.query(
      'UPDATE notificaciones SET leida = TRUE WHERE id = $1 AND usuario_id = $2',
      [req.params.id, req.usuario.id]
    );
    res.json({ mensaje: 'Notificación marcada como leída.' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { listar, marcarLeida };


// ============================================================
// backend/src/controllers/reportesController.js
// Endpoint de reporte que agrega datos (requisito mínimo del taller)
// ============================================================
// EXPORTADO APARTE — en el mismo archivo para simplicidad del esqueleto


const reportes = {

  // GET /api/reportes/solicitudes  — resumen general (admin/director)
  resumenGeneral: async (req, res) => {
    try {
      const resultado = await pool.query(
        `SELECT
           COUNT(*) FILTER (WHERE estado = 'en_revision') AS en_revision,
           COUNT(*) FILTER (WHERE estado = 'aprobada')   AS aprobadas,
           COUNT(*) FILTER (WHERE estado = 'rechazada')  AS rechazadas,
           COUNT(*) FILTER (WHERE estado = 'borrador')   AS borradores,
           COUNT(*)                                       AS total,
           SUM(monto) FILTER (WHERE estado = 'aprobada') AS monto_total_aprobado,
           AVG(monto)                                     AS monto_promedio
         FROM solicitudes`
      );
      res.json(resultado.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },

  // GET /api/reportes/por-departamento  — agrupa por departamento
  porDepartamento: async (req, res) => {
    try {
      const resultado = await pool.query(
        `SELECT
           u.departamento,
           COUNT(s.id) AS total_solicitudes,
           SUM(s.monto) AS monto_total,
           COUNT(*) FILTER (WHERE s.estado = 'aprobada') AS aprobadas,
           COUNT(*) FILTER (WHERE s.estado = 'rechazada') AS rechazadas
         FROM solicitudes s
         JOIN usuarios u ON s.solicitante_id = u.id
         GROUP BY u.departamento
         ORDER BY monto_total DESC`
      );
      res.json(resultado.rows);
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  },
};

module.exports.reportes = reportes;
