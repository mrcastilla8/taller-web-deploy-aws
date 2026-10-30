# EventosFISI frontend

Aplicación SPA React 19 y Vite 8 para explorar eventos académicos y gestionar perfil, inscripciones, favoritos y valoraciones con la API Express.

## Desarrollo local

    npm ci
    npm run dev

Vite sirve la aplicación en localhost:5173 y reenvía /api al backend en localhost:3001. Configure VITE_API_BASE_URL en .env si la API tiene otra dirección. En producción se configura durante la compilación; el valor predeterminado es /api.

## Funcionalidades

- Eventos y categorías cargados desde el servidor con búsqueda, categoría, costo y estado.
- Detalles, cupos, inscripción y cancelación desde la API.
- Modal de perfil que completa la inscripción pendiente solo tras confirmar el guardado del servidor.
- Mis Eventos con pestañas de próximos y pasados y una sección de favoritos.
- Valoraciones con promedio, cantidad, puntuación 1–5 y comentario.
- Manejo de carga, errores HTTP y reintento.
- localStorage conserva solamente el UUID técnico de sesión generado por el navegador.

La clave de sesión no es autenticación. Los datos de negocio se recuperan del backend; mockData.js no es fuente autoritativa de la aplicación.

## Compilación Amplify

    npm ci
    npm run build

Amplify usa la raíz Frontend del monorepo y publica dist. Configure VITE_API_BASE_URL con la URL real de CloudFront más /api. Si cambia, vuelva a compilar y desplegar.

## Archivos principales

- src/services/api.js: cliente HTTP, errores, timeout y sesión.
- src/context/AppContext.jsx: estado recibido del backend y operaciones.
- src/hooks/useEventFilter.js: filtros existentes sobre el catálogo real.
- src/pages/EventDetail.jsx: detalle, inscripción, favoritos y valoraciones.
- src/pages/MyEvents.jsx: inscripciones y favoritos.
- src/components/StudentModal.jsx: identificación y operación asíncrona.
- src/data/mockData.js: referencia histórica, no fuente de datos en ejecución.
