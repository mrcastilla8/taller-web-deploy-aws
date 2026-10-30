# API de EventosFISI

API Node.js 24, Express y Sequelize. SQLite es el almacenamiento persistente para AWS; PostgreSQL permanece compatible mediante DATABASE_URL y DB_SSL. El despliegue histórico de Azure está documentado en deploy/ y no se elimina.

## Desarrollo

    npm ci
    npm start

La API local escucha en puerto 3001. El laboratorio está en /laboratorio.html. Para modo efímero use npm run start:memory. La aplicación principal React está en ../Frontend.

## Docker

Desde la raíz: docker compose up -d --build. Compose monta eventos_data en /app/data y configura DB_STORAGE=/app/data/eventos.sqlite. Cambiar configuración: edite el .env local y recree el servicio backend. Reinicios y reconstrucciones conservan el volumen. No use down -v como actualización.

## Variables

Consulte .env.example. DATABASE_URL selecciona PostgreSQL; para AWS SQLite no se requiere URL ni credenciales. CORS_ALLOWED_ORIGINS recibe orígenes exactos separados por comas. X-Session-Id es un identificador técnico UUID, no autenticación segura.

## Rutas

- GET /health y /api/health: salud ligera.
- GET /api/ready: autenticación de conexión de base de datos.
- GET /api/categories, /api/events, /api/events/:id.
- GET /api/state, /api/student; PUT/DELETE /api/student.
- GET/POST /api/inscriptions; DELETE /api/inscriptions/:id.
- GET/PUT/DELETE /api/favorites y /api/favorites/:id.
- GET/PUT /api/events/:id/reviews.
- /api/events?delayMs=3000 y /api/demo/orm para la demostración.

Las semillas agregan dos eventos con fechas calculadas a 30 y 45 días en una base nueva. Los IDs estables 10 y 11 evitan colisión con el catálogo original. Las inserciones son idempotentes y no cambian registros ya persistidos.

## Comprobaciones

    npm ci
    npm test
    npm run evidence

El script raíz scripts/smoke-local.mjs comprueba health, ready, CORS y persistencia con SQLite temporal. Consulte ../docs/DEMO_LABORATORIO.md.
