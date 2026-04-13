# 🧾 Sistema de Facturación con Flujo de Aprobación Empresarial

**Programa:** Análisis y Desarrollo de Software — SENA (228185)  
**Competencia:** Desarrollo de Software con Frameworks  
**Grupo:** 9

## 👥 Integrantes y Roles

| Nombre | Rol | Responsabilidades |
|--------|-----|-------------------|
| Nicolás | Backend Developer | API REST, lógica de cadena de aprobación, JWT, endpoints de reporte |
| Jorlin | Frontend Developer | React: login, dashboard por rol, formulario de solicitud, panel de aprobación |
| Sánchez | Git Master + Documentador | Repositorio, ramas, Pull Requests, README, diagrama ER, documentación técnica |

---

## 📋 Descripción del Sistema

Sistema web que permite a empleados de una empresa generar solicitudes de compra o gasto. Cada solicitud recorre una **cadena de aprobación dinámica** según el monto: jefe inmediato → gerencia → dirección financiera. Solo al completar todos los niveles requeridos se genera la orden de compra aprobada o el rechazo formal con observaciones.

### Problema que resuelve
Elimina el flujo manual de aprobaciones por correo o papel, dando trazabilidad completa, notificaciones automáticas y visibilidad del estado en tiempo real para cada solicitud.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js + Express |
| Frontend | React + Axios |
| Base de datos | PostgreSQL |
| Autenticación | JWT (JSON Web Tokens) |
| Despliegue Backend | Railway |
| Despliegue Frontend | Vercel |
| Control de versiones | GitHub |

---

## 🔐 Roles del sistema

| Rol | Descripción |
|-----|-------------|
| `empleado` | Crea solicitudes de compra/gasto y consulta su estado |
| `jefe` | Aprueba o rechaza solicitudes de montos hasta $1.000.000 COP |
| `gerente` | Aprueba o rechaza solicitudes de montos hasta $10.000.000 COP |
| `director_financiero` | Aprueba o rechaza solicitudes de cualquier monto |
| `admin` | Configura niveles de aprobación y gestiona usuarios |

---

## ⚙️ Instalación local

### Requisitos previos
- Node.js v18+
- PostgreSQL 14+
- npm o yarn

### 1. Clonar el repositorio

```bash
git clone https://github.com/[usuario]/grupo9-facturacion.git
cd grupo9-facturacion
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

Crear archivo `.env` en la carpeta `backend/`:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=facturacion_db
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=clave_super_secreta_cambiar_en_produccion
JWT_EXPIRES_IN=8h
```

Crear la base de datos y ejecutar el script SQL:

```bash
psql -U postgres -c "CREATE DATABASE facturacion_db;"
psql -U postgres -d facturacion_db -f database/schema.sql
psql -U postgres -d facturacion_db -f database/seed.sql
```

Iniciar el servidor:

```bash
npm run dev
```

El backend corre en: `http://localhost:3001`

### 3. Configurar el Frontend

```bash
cd frontend
npm install
```

Crear archivo `.env` en la carpeta `frontend/`:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

Iniciar el frontend:

```bash
npm start
```

El frontend corre en: `http://localhost:3000`

---

## 🌐 Sistema desplegado

- **Frontend:** [https://grupo9-facturacion.vercel.app](#) *(actualizar con el enlace real)*
- **Backend API:** [https://grupo9-facturacion.up.railway.app](#) *(actualizar con el enlace real)*

---

## 📁 Estructura del proyecto

```
grupo9-facturacion/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # Conexión a PostgreSQL
│   │   │   └── jwt.js             # Configuración JWT
│   │   ├── middlewares/
│   │   │   ├── auth.js            # Verificar token JWT
│   │   │   └── roles.js           # Control de acceso por rol
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── solicitudesController.js
│   │   │   ├── aprobacionesController.js
│   │   │   ├── notificacionesController.js
│   │   │   └── reportesController.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── solicitudes.js
│   │   │   ├── aprobaciones.js
│   │   │   ├── notificaciones.js
│   │   │   └── reportes.js
│   │   └── index.js
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MisSolicitudes.jsx
│   │   │   ├── NuevaSolicitud.jsx
│   │   │   ├── PanelAprobacion.jsx
│   │   │   ├── Reportes.jsx
│   │   │   └── ConfiguracionNiveles.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── NotificacionesBadge.jsx
│   │   ├── services/
│   │   │   └── api.js             # Configuración de Axios
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   └── App.jsx
│   ├── .env.example
│   └── package.json
├── docs/
│   └── diagrama-ER.png
└── README.md
```

---

## 🔗 Repositorio y commits

- **Repositorio:** [https://github.com/[usuario]/grupo9-facturacion](#)
- Mínimo 10 commits por integrante con mensajes descriptivos en español
- Rama de desarrollo: `develop`
- Pull Requests documentados antes de mergear a `main`

### Convención de commits

```
feat: agregar endpoint de aprobaciones
fix: corregir validación de monto en solicitud
docs: actualizar README con instrucciones de despliegue
style: aplicar estilos al panel de aprobación
refactor: separar lógica de cadena dinámica en servicio
```

---

## 📊 Endpoints principales de la API

| Método | Ruta | Descripción | Rol requerido |
|--------|------|-------------|---------------|
| POST | `/api/auth/login` | Iniciar sesión | Público |
| POST | `/api/auth/register` | Registrar usuario | Admin |
| GET | `/api/solicitudes` | Listar mis solicitudes | Empleado+ |
| POST | `/api/solicitudes` | Crear solicitud | Empleado |
| GET | `/api/solicitudes/:id/historial` | Ver trazabilidad completa | Empleado+ |
| GET | `/api/aprobaciones/mis-pendientes` | Ver solicitudes pendientes de mi aprobación | Jefe/Gerente/Director |
| PUT | `/api/aprobaciones/:id` | Aprobar o rechazar | Jefe/Gerente/Director |
| GET | `/api/notificaciones` | Ver mis notificaciones | Empleado+ |
| GET | `/api/reportes/solicitudes` | Reporte consolidado | Admin/Director |
| GET | `/api/reportes/por-estado` | Solicitudes agrupadas por estado | Admin |

---

## 🚀 Despliegue en Railway + Vercel

### Backend en Railway
1. Crear cuenta en [railway.app](https://railway.app)
2. Nuevo proyecto → Deploy from GitHub
3. Agregar plugin PostgreSQL al proyecto
4. Configurar variables de entorno en Railway
5. El deploy es automático con cada push a `main`

### Frontend en Vercel
1. Crear cuenta en [vercel.com](https://vercel.com)
2. Importar repositorio desde GitHub
3. Configurar `REACT_APP_API_URL` con la URL de Railway
4. Deploy automático con cada push a `main`

---

*Última actualización: Trimestre 2025 — SENA Programa 228185*
