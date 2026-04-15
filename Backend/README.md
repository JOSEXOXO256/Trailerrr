# Sistema Trailers API

API REST con Node.js + Express + PostgreSQL para gestionar trailers.

## 1) Requisitos

- Node.js 18 o superior
- PostgreSQL

## 2) Configuracion

1. Copia `.env.example` a `.env`
2. Ajusta los valores de base de datos y `JWT_SECRET`
3. Instala dependencias:

```bash
npm install
```

4. Ejecuta en desarrollo:

```bash
npm run dev
```

5. Ejecuta en produccion:

```bash
npm start
```

API base local: `http://localhost:3000/api`

## 3) Autenticacion

Primero inicia sesion para obtener token JWT:

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"password\"}"
```

Usa el token en el header:

`Authorization: Bearer TU_TOKEN`

## 4) Endpoints

- `GET /api/health` estado del servicio y conexion DB
- `GET /api` metadata rapida de la API
- `POST /api/login` login y obtencion de token
- `GET /api/me` usuario autenticado
- `GET /api/trailers` listar trailers
- `GET /api/trailers/:id` obtener trailer por ID
- `POST /api/trailers` crear trailer
- `PUT /api/trailers/:id` actualizar trailer
- `DELETE /api/trailers/:id` eliminar trailer
- `PUT /api/trailers/:id/salida` registrar salida
- `PUT /api/trailers/:id/entrada` registrar entrada

## 5) Ejemplo crear trailer

```bash
curl -X POST http://localhost:3000/api/trailers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d "{
    \"marca\": \"Utility\",
    \"placa\": \"ABC123\",
    \"ejes\": 2,
    \"peso\": 18500.5,
    \"dimensiones\": \"53ft\",
    \"destino\": \"Monterrey\",
    \"origen\": \"CDMX\",
    \"historial\": \"normal\",
    \"seguro\": \"Vigente\",
    \"caja\": \"Seca\",
    \"tipoTrailer\": \"Caja\",
    \"estadoCarga\": \"Cargado\",
    \"licencia\": \"LIC-0001\",
    \"operador\": \"Juan Perez\"
  }"
```

## 6) CORS

Controla los origenes permitidos con `ALLOWED_ORIGINS` en `.env`:

`ALLOWED_ORIGINS=http://localhost:5500,http://tu-frontend.com`

Si `ALLOWED_ORIGINS` esta vacio, se permite cualquier origen.

## 7) Despliegue publico (Railway)

- Este proyecto incluye `railway.json` en la raiz (build/start/healthcheck).
- El backend tambien sirve `Frontend/Index.html`, asi que la pagina y la API quedan en la misma URL publica.
- Ejecuta el schema inicial con:

```bash
psql "TU_DATABASE_URL" -f Backend/sql/init.sql
```

Guia completa: `Backend/GUIA_PUBLICACION.md`
