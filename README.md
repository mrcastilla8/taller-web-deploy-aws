# EventosFISI

Monorepo de eventos académicos con React/Vite, Node.js/Express y Sequelize. El backend usa SQLite persistente para AWS y mantiene PostgreSQL como opción compatible. Incluye perfiles, inscripciones, favoritos, valoraciones y laboratorio de concurrencia.

## Arquitectura

- Frontend React/Vite en Frontend/, listo para AWS Amplify.
- API Express en Backend/, lista para Docker Compose en EC2.
- SQLite persistente en el volumen nombrado de Compose.
- CloudFront proporciona HTTPS público a la API; la guía advierte que el origen EC2 del laboratorio usa HTTP.
- Azure histórico permanece documentado en Backend/deploy/.

## Requisitos y ejecución local

Node.js 24 LTS recomendado y Docker Desktop/Engine con Compose. Para desarrollo, arranque la API desde Backend con npm ci y npm start; arranque Frontend con npm ci y npm run dev. Vite reenvía /api a localhost:3001. Abra localhost:5173.

## Docker Compose

Copie .env.example como .env y ejecute:

    docker compose up -d --build

La API queda en localhost:3001; el estado de SQLite persiste en eventos_data. No use docker compose down -v en operación normal.

## Variables

- Frontend/.env.example: VITE_API_BASE_URL (por defecto /api).
- Backend/.env.example: NODE_ENV, HOST, PORT, DB_STORAGE y CORS_ALLOWED_ORIGINS; DATABASE_URL/DB_SSL siguen disponibles para PostgreSQL.
- .env.example: puerto público Compose y orígenes permitidos.

No versionar archivos .env reales. X-Session-Id identifica una sesión del laboratorio, no es autenticación.

## Verificaciones

    cd Backend; npm ci; npm test; npm run evidence
    cd ../Frontend; npm ci; npm run build
    cd ..; node scripts/smoke-local.mjs
    docker compose up -d --build

Use docs/DEMO_LABORATORIO.md para los ejercicios y docs/AWS_DEPLOY.md para configurar AWS. Los valores DNS y las URL finales solo se conocen después de crear recursos AWS.
