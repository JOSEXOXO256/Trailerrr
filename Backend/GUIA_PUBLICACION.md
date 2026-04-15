# Guia de Publicacion en Railway (API + pagina en una sola URL)

Esta app ya esta preparada para Railway.

- Frontend: `Frontend/Index.html`
- API: `Backend/server.js`
- Config Railway: `railway.json`
- Resultado: una sola URL publica (`https://...up.railway.app`)

## 1) Sube el proyecto a GitHub

Desde la raiz del proyecto (`Trailerrr`):

```bash
git init
git add .
git commit -m "deploy: railway"
```

Luego subelo a GitHub.

## 2) Crea proyecto en Railway

1. Entra a Railway y crea un proyecto nuevo desde tu repo de GitHub.
2. Importa **este repo completo**.
3. Servicio web: selecciona el servicio que viene del repo.
4. Muy importante: en `Settings -> Root Directory` dejalo en `/` (raiz).

No uses `/Backend`, porque el backend sirve archivos de `../Frontend`.

## 3) Agrega PostgreSQL

En el mismo proyecto:

1. `New` -> `Database` -> `PostgreSQL`
2. Espera a que quede en estado activo.

## 4) Variables del servicio web

En el servicio web, pestaña `Variables`, agrega:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
DB_SSL=false
JWT_SECRET=pon_una_clave_larga_y_segura
ALLOWED_ORIGINS=https://TU_DOMINIO_PUBLICO.up.railway.app
```

Notas:
- Si tu base no se llama `Postgres`, usa `New Variable` -> `Reference` y selecciona el servicio PostgreSQL + variable `DATABASE_URL`.
- `ALLOWED_ORIGINS` debe quedar con tu dominio real cuando lo generes.

## 5) Inicializa tablas y usuarios

Desde terminal local, con `psql` instalado:

```bash
psql "TU_DATABASE_URL" -f Backend/sql/init.sql
```

`TU_DATABASE_URL` es la cadena de conexion de la BD de Railway.

Usuarios creados por el script:
- `admin` / `password`
- `operador` / `password`

## 6) Genera la URL publica

En el servicio web:

1. `Settings`
2. `Networking -> Public Networking`
3. `Generate Domain`

Railway te dara una URL tipo:

`https://tu-servicio.up.railway.app`

## 7) Ajusta CORS y redeploy

Actualiza la variable con el dominio final:

```env
ALLOWED_ORIGINS=https://tu-servicio.up.railway.app
```

Guarda y despliega los cambios.

## 8) Pruebas finales

- Frontend: `https://tu-servicio.up.railway.app/`
- API: `https://tu-servicio.up.railway.app/api`
- Health: `https://tu-servicio.up.railway.app/api/health`

Si `/api/health` responde `{"status":"ok", ...}` ya quedo publicado correctamente.
