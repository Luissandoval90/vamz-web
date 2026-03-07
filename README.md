# Fullstack Social Hub (Turso)

Proyecto fullstack para publicar tus redes sociales y gestionar addons/texturas.

## Requisitos

- Node.js 18+
- Base de datos Turso creada

## Instalacion

1. Entra al proyecto:
   ```bash
   cd fullstack-social-hub
   ```
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Crea tu archivo `.env` a partir de `.env.example`.
4. Levanta el servidor:
   ```bash
   npm run dev
   ```

## Variables de entorno

- `PORT=5000`
- `TURSO_DATABASE_URL=libsql://tu-db-tuusuario.turso.io`
- `TURSO_AUTH_TOKEN=tu_token_de_turso`

## Rutas

- Sitio publico: `http://localhost:5000/`
- Admin: `http://localhost:5000/admin`
- Health: `http://localhost:5000/health`

## API

- `GET /api/social-links`
- `POST /api/social-links`
- `PUT /api/social-links/:id`
- `DELETE /api/social-links/:id`
- `GET /api/assets?type=addon|texture`
- `POST /api/assets` (`multipart/form-data`, campo archivo: `file`)
- `DELETE /api/assets/:id`

## Notas

- Las tablas se crean automaticamente al iniciar.
- En `POST /api/assets` debes enviar archivo o `externalUrl`.
- Los archivos se guardan en `uploads/`.
