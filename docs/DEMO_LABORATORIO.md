# Demostración del laboratorio

## Preparación

1. Inicie SQLite con docker compose up -d --build o ejecute npm ci y npm start desde Backend.
2. En Frontend copie .env.example a .env con VITE_API_BASE_URL=/api; ejecute npm ci y npm run dev.
3. Abra la aplicación y compruebe eventos y categorías del servidor. Identifíquese, inscríbase a un evento futuro, cancele, guarde favorito y valoración.
4. Abra Mis Eventos y actualice la página para demostrar la recuperación desde SQLite.
5. Reinicie con docker compose restart backend y confirme que el estado persiste.

## Ejercicio 1: concurrencia

Abra /laboratorio.html desde el backend. Lance solicitudes concurrentes a /api/events?delayMs=3000 y, durante la espera, consulte /api/health y /api/events. Las lecturas rápidas deben terminar mientras la solicitud demorada sigue activa. El panel muestra tiempos. Consulte /api/demo/orm para trabajo de Sequelize y temporizadores. La opción de memoria se ejecuta desde Backend con npm run start:memory.

## Ejercicio 2: ORM y persistencia

Use React para guardar perfil, inscripción, cancelación, favorito y valoración. Reinicie proceso o contenedor y confirme persistencia. GET /api/ready comprueba conexión real a la base.

## Ejercicio 3: despliegue

Construya con Docker Compose, valide /health y /api/ready, y configure Amplify y CloudFront con AWS_DEPLOY.md. Repita los flujos desde la URL HTTPS de Amplify.

## Implementación

- Backend/src/app.js: HTTP, CORS, salud y concurrencia.
- Backend/src/database.js: Sequelize, transacciones y SQLite.
- Backend/src/data/events.js: catálogo original y semillas futuras idempotentes.
- Backend/public/laboratorio.html y concurrency.js: demostración de concurrencia.
- Frontend/src/services/api.js y context/AppContext.jsx: cliente y estado del servidor.
- Frontend/src/pages/EventDetail.jsx: cupos, favoritos y valoraciones.
- Backend/Dockerfile, compose.yaml y amplify.yml: empaquetado y alojamiento.
