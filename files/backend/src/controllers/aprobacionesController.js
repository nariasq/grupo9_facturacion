// ============================================================
// backend/src/controllers/aprobacionesController.js
// Aprobar/rechazar solicitudes + filtrar pendientes por rol (RETOS 2 y 3)
// ============================================================
const pool = require('../config/db');

// GET /api/aprobaciones/mis-pendientes
// Cada aprobador SOLO ve las solicitudes en SU nivel (RETO 2)
const misPendientes = async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT a.id AS aprobacion_id, a.estado AS estado_aprobacion,
              s.id AS solicitud_id, s.titulo, s.descripcion, s.monto, s.tipo,
              s.creado_en AS fecha_solicitud,
              n.nombre AS nivel, n.orden,
              u.nombre AS solicitante, u.email AS email_solicitante, u.departamento
       FROM aprobaciones a
       JOIN solicitudes s ON a.solicitud_id = s.id
       JOIN niveles_aprobacion n ON a.nivel_id = n.id
       JOIN usuarios u ON s.solicitante_id = u.id
       JOIN roles r ON r.id = n.rol_requerido_id
       WHERE a.estado = 'pendiente'
         AND r.nombre = $1
         AND n.orden = s.nivel_actual
         AND s.estado = 'en_revision'
       ORDER BY s.creado_en ASC`,
      [req.usuario.rol]
    );

    res.json(resultado.rows);
  } catch (error) {
    console.error('Error en misPendientes:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// PUT /api/aprobaciones/:id  — aprobar o rechazar (RETO 3 — notificaciones)
const actuar = async (req, res) => {
  const { id } = req.params;
  const { accion, comentario } = req.body; // accion: 'aprobar' | 'rechazar'

  if (!accion || !['aprobar', 'rechazar'].includes(accion)) {
    return res.status(400).json({ error: "La acción debe ser 'aprobar' o 'rechazar'." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Obtener la aprobación con su solicitud y nivel
    const aprobacionResult = await client.query(
      `SELECT a.*, s.titulo, s.monto, s.solicitante_id, s.nivel_actual,
              n.orden AS orden_nivel
       FROM aprobaciones a
       JOIN solicitudes s ON a.solicitud_id = s.id
       JOIN niveles_aprobacion n ON a.nivel_id = n.id
       WHERE a.id = $1 AND a.estado = 'pendiente'`,
      [id]
    );

    if (aprobacionResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Aprobación no encontrada o ya fue procesada.' });
    }

    const aprobacion = aprobacionResult.rows[0];

    // Actualizar el registro de aprobación
    const nuevoEstado = accion === 'aprobar' ? 'aprobada' : 'rechazada';
    await client.query(
      `UPDATE aprobaciones
       SET estado = $1, aprobador_id = $2, comentario = $3, fecha_accion = NOW()
       WHERE id = $4`,
      [nuevoEstado, req.usuario.id, comentario || null, id]
    );

    let mensajeNotificacion = '';
    let estadoSolicitud = '';

    if (accion === 'rechazar') {
      // Si se rechaza en cualquier nivel → solicitud rechazada
      estadoSolicitud = 'rechazada';
      mensajeNotificacion = `Tu solicitud "${aprobacion.titulo}" fue RECHAZADA en el nivel ${aprobacion.orden_nivel}. Comentario: ${comentario || 'Sin comentario.'}`;

      await client.query(
        `UPDATE solicitudes SET estado = 'rechazada', actualizado_en = NOW() WHERE id = $1`,
        [aprobacion.solicitud_id]
      );
    } else {
      // Verificar si hay más niveles pendientes
      const siguienteNivel = await client.query(
        `SELECT a.id, n.orden
         FROM aprobaciones a
         JOIN niveles_aprobacion n ON a.nivel_id = n.id
         WHERE a.solicitud_id = $1 AND a.estado = 'pendiente'
         ORDER BY n.orden ASC
         LIMIT 1`,
        [aprobacion.solicitud_id]
      );

      if (siguienteNivel.rows.length > 0) {
        // Avanzar al siguiente nivel
        const nuevoNivelOrden = siguienteNivel.rows[0].orden;
        await client.query(
          `UPDATE solicitudes SET nivel_actual = $1, actualizado_en = NOW() WHERE id = $2`,
          [nuevoNivelOrden, aprobacion.solicitud_id]
        );
        mensajeNotificacion = `Tu solicitud "${aprobacion.titulo}" fue aprobada en el nivel ${aprobacion.orden_nivel} y avanzó al siguiente nivel de aprobación.`;
        estadoSolicitud = 'en_revision';
      } else {
        // Todos los niveles aprobados → solicitud aprobada
        estadoSolicitud = 'aprobada';
        mensajeNotificacion = `🎉 Tu solicitud "${aprobacion.titulo}" fue APROBADA en todos los niveles. Se generará la orden de compra.`;
        await client.query(
          `UPDATE solicitudes SET estado = 'aprobada', orden_compra_generada = TRUE, actualizado_en = NOW() WHERE id = $1`,
          [aprobacion.solicitud_id]
        );
      }
    }

    // Notificar al solicitante (RETO 3)
    await client.query(
      `INSERT INTO notificaciones (usuario_id, solicitud_id, titulo, mensaje)
       VALUES ($1, $2, $3, $4)`,
      [
        aprobacion.solicitante_id,
        aprobacion.solicitud_id,
        `Actualización de tu solicitud`,
        mensajeNotificacion
      ]
    );

    await client.query('COMMIT');

    res.json({
      mensaje: `Solicitud ${accion === 'aprobar' ? 'aprobada' : 'rechazada'} exitosamente.`,
      estado_solicitud: estadoSolicitud,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actuar sobre aprobación:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  } finally {
    client.release();
  }
};

module.exports = { misPendientes, actuar };
