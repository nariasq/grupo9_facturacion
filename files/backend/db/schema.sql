-- ============================================================
-- GRUPO 9 — Sistema de Facturación con Flujo de Aprobación
-- schema.sql — Crear todas las tablas
-- ============================================================

-- Limpiar tablas existentes (orden inverso por foreign keys)
DROP TABLE IF EXISTS notificaciones CASCADE;
DROP TABLE IF EXISTS aprobaciones CASCADE;
DROP TABLE IF EXISTS solicitudes CASCADE;
DROP TABLE IF EXISTS niveles_aprobacion CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ============================================================
-- TABLA 1: roles
-- ============================================================
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA 2: usuarios
-- ============================================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INTEGER NOT NULL REFERENCES roles(id),
    departamento VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA 3: niveles_aprobacion
-- Define la cadena dinámica según el monto de la solicitud
-- ============================================================
CREATE TABLE niveles_aprobacion (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    orden INTEGER NOT NULL,           -- 1 = primer nivel, 2 = segundo, etc.
    monto_minimo NUMERIC(15,2) NOT NULL DEFAULT 0,
    monto_maximo NUMERIC(15,2),       -- NULL = sin límite superior
    rol_requerido_id INTEGER NOT NULL REFERENCES roles(id),
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA 4: solicitudes
-- ============================================================
CREATE TABLE solicitudes (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    monto NUMERIC(15,2) NOT NULL CHECK (monto > 0),
    tipo VARCHAR(50) NOT NULL DEFAULT 'compra',  -- 'compra' | 'gasto'
    estado VARCHAR(30) NOT NULL DEFAULT 'borrador',
    -- estados: 'borrador' | 'en_revision' | 'aprobada' | 'rechazada'
    solicitante_id INTEGER NOT NULL REFERENCES usuarios(id),
    nivel_actual INTEGER DEFAULT 1,   -- En qué nivel de aprobación está actualmente
    orden_compra_generada BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA 5: aprobaciones
-- Historial de cada paso en la cadena de aprobación
-- ============================================================
CREATE TABLE aprobaciones (
    id SERIAL PRIMARY KEY,
    solicitud_id INTEGER NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
    nivel_id INTEGER NOT NULL REFERENCES niveles_aprobacion(id),
    aprobador_id INTEGER REFERENCES usuarios(id),  -- NULL = aún no asignado
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    -- estados: 'pendiente' | 'aprobada' | 'rechazada'
    comentario TEXT,
    fecha_accion TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA 6: notificaciones
-- ============================================================
CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    solicitud_id INTEGER REFERENCES solicitudes(id) ON DELETE SET NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ÍNDICES para mejorar el rendimiento
-- ============================================================
CREATE INDEX idx_solicitudes_solicitante ON solicitudes(solicitante_id);
CREATE INDEX idx_solicitudes_estado ON solicitudes(estado);
CREATE INDEX idx_aprobaciones_solicitud ON aprobaciones(solicitud_id);
CREATE INDEX idx_aprobaciones_estado ON aprobaciones(estado);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- ============================================================
-- FUNCIÓN: actualizar campo actualizado_en automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_solicitudes_actualizado
    BEFORE UPDATE ON solicitudes
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_usuarios_actualizado
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
