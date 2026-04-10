// ============================================================
// backend/src/controllers/authController.js
// Login y registro de usuarios
// ============================================================
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
  }

  try {
    const resultado = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.password_hash, u.activo, r.nombre AS rol
       FROM usuarios u
       JOIN roles r ON u.rol_id = r.id
       WHERE u.email = $1`,
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const usuario = resultado.rows[0];

    if (!usuario.activo) {
      return res.status(403).json({ error: 'Usuario inactivo. Contacte al administrador.' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const payload = {
      id:     usuario.id,
      nombre: usuario.nombre,
      email:  usuario.email,
      rol:    usuario.rol,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: payload,
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// POST /api/auth/register  (solo admin)
const register = async (req, res) => {
  const { nombre, email, password, rol_id, departamento } = req.body;

  if (!nombre || !email || !password || !rol_id) {
    return res.status(400).json({ error: 'Nombre, email, contraseña y rol son requeridos.' });
  }

  try {
    const existente = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existente.rows.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado.' });
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const nuevo = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol_id, departamento)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nombre, email, rol_id, departamento, creado_en`,
      [nombre, email, password_hash, rol_id, departamento]
    );

    res.status(201).json({
      mensaje: 'Usuario creado exitosamente',
      usuario: nuevo.rows[0],
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// GET /api/auth/me
const perfil = async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.departamento, r.nombre AS rol, u.creado_en
       FROM usuarios u JOIN roles r ON u.rol_id = r.id
       WHERE u.id = $1`,
      [req.usuario.id]
    );
    res.json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { login, register, perfil };
