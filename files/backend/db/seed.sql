-- ============================================================
-- GRUPO 9 — seed.sql
-- Datos iniciales para probar el sistema
-- ============================================================

-- ROLES
INSERT INTO roles (nombre, descripcion) VALUES
('admin',               'Administrador del sistema, configura niveles y usuarios'),
('empleado',            'Empleado que genera solicitudes de compra o gasto'),
('jefe',                'Jefe inmediato, aprueba solicitudes de primer nivel'),
('gerente',             'Gerente, aprueba solicitudes de segundo nivel'),
('director_financiero', 'Director financiero, aprueba solicitudes de tercer nivel');

-- USUARIOS DE PRUEBA
-- Contraseña para todos: "password123" (ya hasheada con bcrypt)
INSERT INTO usuarios (nombre, email, password_hash, rol_id, departamento) VALUES
('Admin Sistema',       'admin@empresa.com',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 'Sistemas'),
('Carlos Empleado',     'carlos@empresa.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 'Ventas'),
('María Empleada',      'maria@empresa.com',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 'Marketing'),
('Pedro Jefe',          'pedro@empresa.com',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, 'Ventas'),
('Laura Gerente',       'laura@empresa.com',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, 'Gerencia'),
('Jorge Director',      'jorge@empresa.com',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 5, 'Dirección Financiera');

-- NIVELES DE APROBACIÓN (cadena dinámica según monto)
-- Nivel 1: Jefe inmediato — montos hasta $1.000.000
-- Nivel 2: Gerente       — montos hasta $10.000.000
-- Nivel 3: Director      — cualquier monto
INSERT INTO niveles_aprobacion (nombre, orden, monto_minimo, monto_maximo, rol_requerido_id) VALUES
('Jefe Inmediato',        1,       0.00,   1000000.00, 3),  -- rol: jefe
('Gerencia',              2,       0.00,  10000000.00, 4),  -- rol: gerente
('Dirección Financiera',  3,       0.00,         NULL, 5);  -- rol: director_financiero
-- Nota: el sistema asigna niveles dinámicamente según el monto de cada solicitud
