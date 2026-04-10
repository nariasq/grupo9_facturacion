// ============================================================
// backend/src/controllers/solicitudesController.js
// CRUD de solicitudes + generación automática de cadena de aprobación
// ============================================================
const pool = require('../config/db');

// GET /api/solicitudes  — ver las solicitudes del usuario autenticado
const listar = async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT s.id, s.titulo, s.descripcion, s.monto, s.tipo, s.estado,
              s.nivel_actual, s.creado_en, s.actualizado_en,
              u.nombre AS solicitante
       FROM solicitudes s
       JOIN usuarios u ON s.solicitante_id = u.id
       WHERE s.solicitante_id = $1
       ORDER BY s.creado_en DESC`,
      [req.usuario.id]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al listar solicitudes:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// GET /api/solicitudes/:id  — detalle de una solicitud
const obtener = async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await pool.query(
      `SELECT s.*, u.nombre AS solicitante, u.email AS email_solicitante
       FROM solicitudes s
       JOIN usuarios u ON s.solicitante_id = u.id
       WHERE s.id = $1`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada.' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// GET /api/solicitudes/:id/historial  — trazabilidad completa (RETO 4)
const historial = async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await pool.query(
      `SELECT a.id, a.estado, a.comentario, a.fecha_accion, a.creado_en,
              n.nombre AS nivel, n.orden,
              u.nombre AS aprobador, u.email AS email_aprobador
       FROM aprobaciones a
       JOIN niveles_aprobacion n ON a.nivel_id = n.id
       LEFT JOIN usuarios u ON a.aprobador_id = u.id
       WHERE a.solicitud_id = $1
       ORDER BY n.orden ASC`,
      [id]
    );
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// POST /api/solicitudes  — crear solicitud y generar cadena automáticamente (RETO 1)
const crear = async (req, res) => {
  const { titulo, descripcion, monto, tipo } = req.body;

  if (!titulo || !descripcion || !monto) {
    return res.status(400).json({ error: 'Título, descripción y monto son requeridos.' });
  }
  if (monto <= 0) {
    return res.status(400).json({ error: 'El monto debe ser mayor a 0.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Crear la solicitud
    const solicitudResult = await client.query(
      `INSERT INTO solicitudes (titulo, descripcion, monto, tipo, estado, solicitante_id, nivel_actual)
       VALUES ($1, $2, $3, $4, 'en_revision', $5, 1)
       RETURNING *`,
      [titulo, descripcion, monto, tipo || 'compra', req.usuario.id]
    );
    const solicitud = solicitudResult.rows[0];

    // 2. Determinar niveles aplicables según el monto (CADENA DINÁMICA)
    const nivelesResult = await client.query(
      `SELECT * FROM niveles_aprobacion
       WHERE activo = true
         AND monto_minimo <= $1
         AND (monto_maximo IS NULL OR monto_maximo >= $1)
       ORDER BY orden ASC`,
      [monto]
    );

    const niveles = nivelesResult.rows;

    if (niveles.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No hay niveles de aprobación configurados para este monto.' });
    }

    // 3. Crear un registro de aprobación pendiente por cada nivel aplicable
    for (const nivel of niveles) {
      await client.query(
        `INSERT INTO aprobaciones (solicitud_id, nivel_id, estado)
         VALUES ($1, $2, 'pendiente')`,
        [solicitud.id, nivel.id]
      );
    }

    // 4. Notificar al primer aprobador (nivel orden=1)
    await client.query(
      `INSERT INTO notificaciones (usuario_id, solicitud_id, titulo, mensaje)
       SELECT u.id,
              $1,
              'Nueva solicitud pendiente de aprobación',
              'La solicitud "' || $2 || '" por $' || $3 || ' está pendiente de tu aprobación.'
       FROM usuarios u
       JOIN roles r ON u.rol_id = r.id
       WHERE r.id = $4`,
      [solicitud.id, titulo, monto, niveles[0].rol_requerido_id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      mensaje: 'Solicitud creada exitosamente. Se inició la cadena de aprobación.',
      solicitud,
      niveles_asignados: niveles.length,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear solicitud:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  } finally {
    client.release();
  }
};

module.exports = { listar, obtener, historial, crear };
