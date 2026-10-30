# Despliegue de EventosFISI en AWS

Guía para Amplify Hosting (React/Vite) y EC2 con Docker Compose (Express, Sequelize y SQLite). CloudFront publica la API con HTTPS al visitante. No se crean recursos AWS desde este repositorio.

## A. Antes de empezar

Use una sola región para EC2 y seleccione la región durante la creación. Compruebe en la consola los créditos, beneficios Free Tier y fechas aplicables a su cuenta. Cree AWS Budgets con alertas antes de iniciar recursos. Active MFA y use acceso administrativo protegido; limite permisos cotidianos a los servicios necesarios. Autorice GitHub en Amplify mediante el flujo oficial.

## B. EC2 y Docker

1. Lance una instancia Linux pequeña compatible con su cuenta y un volumen EBS persistente. Revise los costos regionales.
2. En el Security Group permita SSH solo desde su IP administrativa. Permita TCP 80 desde los rangos CloudFront publicados por AWS; manténgalos actualizados. No exponga 3001 ni abra SSH a todo Internet.
3. Instale Docker Engine y Docker Compose según la guía oficial de su distribución.
4. Clone el repositorio exclusivo taller-web-deploy-aws, rama master. Cree .env desde .env.example; en EC2 use BACKEND_PUBLIC_PORT=80. Añada después el origen HTTPS real de Amplify a CORS_ALLOWED_ORIGINS.
5. Ejecute docker compose up -d --build y valide docker compose ps, curl http://localhost/health y curl http://localhost/api/ready.

SQLite se guarda en el volumen nombrado eventos_data sobre almacenamiento de EC2/EBS. Manténgalo durante las actualizaciones. No use docker compose down -v como procedimiento normal.

### Si EC2 se detuvo y se volvió a iniciar

Con una IPv4 pública asignada automáticamente, el DNS público de EC2 puede cambiar después de detener y volver a iniciar la instancia. Después del arranque, consulte en EC2 el nuevo campo Public IPv4 DNS (y la dirección IPv4 pública) en los detalles de la instancia; no reutilice el valor anterior por supuesto.

Para actualizar CloudFront sin cambiar código:

1. En CloudFront abra la distribución de la API y edite el origen EC2 existente.
2. Reemplace Origin domain por el DNS público vigente que muestra EC2. Mantenga HTTP y el puerto 80, el comportamiento /api/*, el reenvío de headers/query strings y la política sin caché.
3. Guarde el cambio y espere a que la distribución indique Deployed.
4. Compruebe que el origen nuevo está permitido por el Security Group para tráfico de CloudFront en TCP 80. No abra el puerto a todo Internet.

Después de reactivar la instancia, verifique: estado de instancia y status checks aprobados; volumen EBS conectado; Docker activo; servicio backend saludable con docker compose ps; GET /health y /api/ready localmente; CORS_ALLOWED_ORIGINS conserva la URL exacta de Amplify; origen CloudFront actualizado y desplegado; GET /api/health y /api/ready mediante el hostname CloudFront; y acceso desde Amplify en navegador a catálogo, perfil, inscripciones, favoritos y valoraciones. El volumen eventos_data debe seguir montado; no lo elimine ni lo recree.

## C. CloudFront para la API

1. Cree una distribución con el DNS público real de EC2 como origen, protocolo HTTP y puerto 80.
2. Cree el comportamiento /api/* con caché desactivada y métodos GET, HEAD, OPTIONS, POST, PUT, DELETE y PATCH.
3. Reenvíe todos los query strings y los headers Origin, Content-Type y X-Session-Id. No quite headers necesarios; mantenga las respuestas de API sin caché.
4. Exija HTTPS a los visitantes y use el hostname predeterminado que entregue CloudFront; no se presupone dominio propio.
5. Verifique las rutas /api/health y /api/ready usando el hostname real. El navegador a CloudFront va cifrado; para este laboratorio de bajo costo CloudFront llega al origen EC2 por HTTP y ese tramo no está cifrado. Restrinja el origen en Security Group a los rangos publicados por AWS.

## D. Amplify

1. Conecte el repositorio GitHub y seleccione la rama master.
2. Configure el monorepo con raíz Frontend. amplify.yml instala mediante npm ci, ejecuta npm run build y publica dist. Si la consola lo requiere, defina AMPLIFY_MONOREPO_APP_ROOT=Frontend.
3. Configure VITE_API_BASE_URL con la URL HTTPS real de CloudFront más /api.
4. Añada una regla SPA que devuelva /index.html con estado 200 para rutas de React Router y preserve recursos existentes.
5. Inicie el despliegue y registre la URL HTTPS que Amplify proporcione. Si cambia VITE_API_BASE_URL, vuelva a compilar y desplegar.

## E. Verificación final

En el .env de EC2 añada el origen HTTPS exacto de Amplify a CORS_ALLOWED_ORIGINS, sin ruta. Recree solo el backend con docker compose up -d --build backend. Verifique catálogo, perfil, inscripción y cancelación, favoritos y valoraciones en navegador. Reinicie con docker compose restart backend y confirme persistencia. Ejecute concurrencia siguiendo docs/DEMO_LABORATORIO.md y capture evidencia.

X-Session-Id es un identificador UUID de laboratorio, no autenticación segura. No proteja información sensible con él.

## F. Operación y costos

Comandos útiles: docker compose ps; docker compose logs -f backend; git pull --ff-only origin master; docker compose up -d --build backend; docker compose restart backend; curl http://localhost/health; curl http://localhost/api/ready.

Para 502 revise puerto/origen y contenedor; para 503 revise salud del origen; para CORS verifique origen exacto, preflight OPTIONS y headers reenviados. Revise logs, Security Group y políticas CloudFront.

Conserve .env y el volumen al actualizar. Haga respaldos antes de mantenimiento y no elimine ni formatee EBS. Detener EC2 no elimina cargos de EBS u otros recursos; terminarla puede borrar volúmenes marcados para eliminación. Verifique la política de eliminación y respalde SQLite. EC2, EBS, IPv4 pública, CloudFront y Amplify pueden generar cargos. No se garantiza gratuidad; revise precios y elegibilidad de la cuenta.

## Valores que AWS proporcionará

- Región seleccionada.
- IP/DNS público de EC2 y estado del volumen EBS.
- Hostname de CloudFront.
- URL HTTPS de Amplify.
- Origen HTTPS exacto de Amplify para CORS.
- Estados de distribución y despliegue.
- DNS público vigente de EC2 tras cada stop/start, si la IPv4 se asigna automáticamente.

Obtenga estos valores en las consolas AWS; no hay URLs productivas inventadas en el repositorio.
