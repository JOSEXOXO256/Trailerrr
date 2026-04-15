# API Sistema de Trailers

## Información General
- **Nombre:** sistema-trailers-api
- **Versión:** 1.0.0
- **Descripción:** API REST para gestión de trailers
- **Tecnología:** Node.js + Express + PostgreSQL
- **Puerto por defecto:** 3000

---

## Endpoints

### 1. **Health Check** (Verificar disponibilidad)
```
GET /api/health
```
**Descripción:** Verifica que el servidor y la base de datos estén disponibles.

**Respuesta exitosa (200):**
```json
{
  "status": "ok",
  "service": "sistema-trailers-api",
  "timestamp": "2026-04-15T10:30:00.000Z"
}
```

---

### 2. **Listar todos los trailers**
```
GET /api/trailers
```
**Descripción:** Obtiene la lista completa de trailers ordenados por fecha de creación (más recientes primero).

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "marca": "Volvo",
    "placa": "ABC-123",
    "ejes": 3,
    "peso": 15000,
    "dimensiones": "10x2.5x2.5",
    "destino": "Miami",
    "origen": "Nueva York",
    "historial": "Viajes completados",
    "seguro": "Activo",
    "caja": "Estándar",
    "tipo_trailer": "Remolque",
    "estado_carga": "Cargado",
    "licencia": "LIC-001",
    "operador": "Juan Pérez",
    "created_at": "2026-04-15T08:00:00Z"
  }
]
```

---

### 3. **Obtener un trailer específico**
```
GET /api/trailers/:id
```
**Parámetros:**
- `id` (path): ID del trailer (número entero positivo)

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "marca": "Volvo",
  "placa": "ABC-123",
  ...
}
```

**Errores:**
- `400`: ID inválido
- `404`: Trailer no encontrado

---

### 4. **Crear un nuevo trailer**
```
POST /api/trailers
Content-Type: application/json
```

**Body requerido:**
```json
{
  "marca": "Volvo",
  "placa": "XYZ-789",
  "ejes": 3,
  "peso": 15000,
  "dimensiones": "10x2.5x2.5",
  "destino": "Miami",
  "origen": "Nueva York",
  "historial": "Nueva unidad",
  "seguro": "En proceso",
  "caja": "Estándar",
  "tipoTrailer": "Remolque",
  "estadoCarga": "Vacío",
  "licencia": "LIC-002",
  "operador": "Pedro García"
}
```

**Respuesta exitosa (201):**
```json
{
  "id": 2,
  "marca": "Volvo",
  "placa": "XYZ-789",
  ...
}
```

**Errores:**
- `400`: Campos faltantes o inválidos
- `409`: La placa ya existe

---

### 5. **Actualizar un trailer**
```
PUT /api/trailers/:id
Content-Type: application/json
```

**Parámetros:**
- `id` (path): ID del trailer

**Body:** Mismo que en POST (todos los campos son obligatorios)

**Respuesta exitosa (200):** El trailer actualizado

**Errores:**
- `400`: ID inválido o campos faltantes
- `404`: Trailer no encontrado

---

### 6. **Eliminar un trailer**
```
DELETE /api/trailers/:id
```

**Parámetros:**
- `id` (path): ID del trailer

**Respuesta exitosa (200):**
```json
{
  "message": "Trailer eliminado correctamente"
}
```

**Errores:**
- `400`: ID inválido
- `404`: Trailer no encontrado

---

### 7. **Registrar salida de un trailer**
```
PUT /api/trailers/:id/salida
```

**Descripción:** Marca el trailer como "En ruta" y registra la hora actual como hora de salida.

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "estado": "En ruta",
  "hora_salida": "2026-04-15T10:30:00Z",
  ...
}
```

**Errores:**
- `400`: ID inválido
- `404`: Trailer no encontrado

---

## Configuración de Entorno

Crea un archivo `.env` en la carpeta Backend con las siguientes variables:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_trailers
DB_USER=postgres
DB_PASSWORD=tu_contraseña

# Puerto del servidor
PORT=3000

# CORS - Orígenes permitidos (separa por comas)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080,https://tudominio.com
```

---

## Instalación y Ejecución Local

### Requisitos:
- Node.js >= 18
- PostgreSQL 12+

### Pasos:

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
# Crear archivo .env con tus datos
```

3. **Ejecutar en desarrollo:**
```bash
npm run dev
```

4. **Ejecutar en producción:**
```bash
npm start
```

---

## Opciones de Publicación

### **Opción 1: Heroku (Fácil y gratuito para pruebas)**

1. Crea una cuenta en [heroku.com](https://heroku.com)
2. Ejecuta:
```bash
npm install -g heroku
heroku login
heroku create tu-app-name
git push heroku main
heroku config:set DB_HOST=... DB_PASSWORD=... ALLOWED_ORIGINS=...
```

### **Opción 2: Railway (Recomendado, fácil y rápido)**

1. Ve a [railway.app](https://railway.app)
2. Conecta tu repositorio GitHub
3. Configura las variables de entorno en el dashboard
4. Deploy automático

### **Opción 3: AWS (Escalable, requiere configuración)**

1. Usa **Elastic Beanstalk** para la API
2. Usa **RDS** para PostgreSQL
3. Compatible con tu Express app

### **Opción 4: DigitalOcean (VPS, control total)**

1. Crea un droplet (servidor virtual)
2. Instala Node.js y PostgreSQL
3. Clona tu repositorio
4. Usa **PM2** para mantener la app corriendo:
```bash
npm install -g pm2
pm2 start server.js --name "trailers-api"
pm2 startup
pm2 save
```

### **Opción 5: Render (Moderno y fácil)**

1. Ve a [render.com](https://render.com)
2. Crea un nuevo Web Service
3. Conecta tu GitHub
4. Configurar build command: `npm install`
5. Configurar start command: `npm start`
6. Agregar variables de entorno

---

## Validaciones de Campos

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|-----------|
| marca | string | ✓ | No vacío |
| placa | string | ✓ | Única, mayúsculas |
| ejes | number | ✓ | Entero > 0 |
| peso | number | ✓ | Número > 0 |
| dimensiones | string | ✓ | No vacío |
| destino | string | ✓ | No vacío |
| origen | string | ✓ | No vacío |
| historial | string | ✓ | No vacío |
| seguro | string | ✓ | No vacío |
| caja | string | ✓ | No vacío |
| tipoTrailer | string | ✓ | No vacío |
| estadoCarga | string | ✓ | No vacío |
| licencia | string | ✓ | No vacío |
| operador | string | ✓ | No vacío |

---

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Datos inválidos |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto (ej: placa duplicada) |
| 500 | Server Error - Error interno |

---

## Seguridad

Actualmente implementado:
- ✓ Validación de datos en servidor
- ✓ CORS configurado
- ✓ Limit de tamaño de requests

Mejoras recomendadas para producción:
- [ ] Autenticación JWT
- [ ] Rate limiting
- [ ] HTTPS/SSL
- [ ] Logging y monitoreo
- [ ] Validación de entrada más estricta

---

## Ejemplo de Uso (cURL)

**Obtener todos los trailers:**
```bash
curl http://localhost:3000/api/trailers
```

**Crear un trailer:**
```bash
curl -X POST http://localhost:3000/api/trailers \
  -H "Content-Type: application/json" \
  -d '{
    "marca": "Volvo",
    "placa": "ABC-123",
    "ejes": 3,
    "peso": 15000,
    "dimensiones": "10x2.5x2.5",
    "destino": "Miami",
    "origen": "Nueva York",
    "historial": "Nueva unidad",
    "seguro": "Activo",
    "caja": "Estándar",
    "tipoTrailer": "Remolque",
    "estadoCarga": "Vacío",
    "licencia": "LIC-001",
    "operador": "Juan Pérez"
  }'
```

**Actualizar un trailer:**
```bash
curl -X PUT http://localhost:3000/api/trailers/1 \
  -H "Content-Type: application/json" \
  -d '{...datos...}'
```

---

## Soporte

Para errores o preguntas, revisa:
1. Los logs en la consola
2. La configuración de variables de entorno
3. La conexión a PostgreSQL
