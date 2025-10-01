# Aconser Fichajes

Plataforma web mobile-first para fichaje de presencia, gestión de bolsas de horas e imputación mensual a proyectos con integraciones con A3 (Wolters Kluwer) y Microsoft Dynamics 365 Business Central.

## Arquitectura

- **Frontend**: React + Vite + TypeScript, TailwindCSS, React Query, i18n con `react-i18next`, PWA opcional.
- **Backend**: NestJS + TypeScript, patrón Ports & Adapters.
  - Autenticación OIDC (Microsoft Entra ID) con modo mock para desarrollo.
  - Auditoría, idempotencia, rate limiting y seguridad `helmet`/CSP.
  - Integraciones mediante puertos (`A3LeavePort`, `BCProjectsPort`) y adaptadores REST con reintentos.
  - Observabilidad con logs `pino`, métricas Prometheus y cron jobs (`node-cron`).
- **Base de datos**: PostgreSQL gestionado con Prisma (migraciones incluidas).
- **Infraestructura**: Docker/Docker Compose para desarrollo (servicios backend, frontend, PostgreSQL, mocks A3/BC y OTEL). Ejemplos de despliegue para Azure Web App y Render.
- **Clean Architecture**: controladores -> servicios -> puertos/adaptadores -> repositorios Prisma.

## Configuración rápida

```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

### Desarrollo local

```bash
# Lanza PostgreSQL, backend, frontend y mocks
docker compose up -d

# Backend en hot-reload
npm run dev:backend

# Frontend en hot-reload
npm run dev:frontend
```

Accesos principales:
- Frontend: <http://localhost:5173>
- Backend: <http://localhost:3000>
- Mocks: A3 (<http://localhost:4000>), BC (<http://localhost:4100>)
- Métricas Prometheus: <http://localhost:3000/metrics>
- Health checks: `/health`, `/ready`

Modo login dev: <http://localhost:5173/login?redirect=dev>

### Scripts útiles

```bash
npm run lint       # Linter backend + frontend
npm run format     # Prettier
npm run test       # Tests unitarios
npm run test:e2e   # Placeholder e2e backend
npm run build      # Build backend + frontend
```

Husky + lint-staged ejecutan formato y lint en cada commit.

## Despliegue

### Docker (producción)

```bash
docker build -f apps/backend/Dockerfile -t aconser-fichajes-backend .
docker build -f apps/frontend/Dockerfile -t aconser-fichajes-frontend .
```

Configura variables de entorno del backend (OIDC, claves A3/BC, `DATABASE_URL`, `SESSION_SECRET`, etc.).

### Azure Web App (contenedor)
1. Publica imagenes en Azure Container Registry.
2. Configura Web App para usar la imagen backend e incluye variables del backend.
3. Para frontend, sirve desde Azure Static Web Apps o Web App adicional.
4. Conecta con Azure Database for PostgreSQL y actualiza `DATABASE_URL`.

### Render
1. Crea servicio Web (Docker) apuntando al `Dockerfile` backend.
2. Configura Postgres gestionado por Render y exporta `DATABASE_URL`.
3. Para frontend usa Render Static Site con `npm install && npm run build` y directorio `apps/frontend/dist`.

## Pruebas cubiertas

Backend (Jest):
- Fichajes duplicados (idempotencia).
- Prohibición de fichar en vacaciones aprobadas.
- Validación de edición retroactiva fuera de plazo.
- Cálculo de bolsa mensual con horas extra y validación de imputación.

Frontend (Vitest + Testing Library):
- Renderizado del botón principal de fichaje en Home.

## Módulos clave

- `Auth`: inicio de sesión OIDC, sesiones vía cookie HttpOnly, guardas RBAC.
- `TimeEntries`: fichajes IN/OUT con idempotencia, validación de vacaciones, cálculo de turnos.
- `Shifts`: empareja fichajes y calcula duración con soporte DST.
- `Allocations`: cálculo diario/mensual de bolsa base + extras, validación de imputaciones.
- `Projects` & `Permissions`: sincronización con Business Central y asignación de proyectos.
- `Integrations`: webhooks y sync para A3/BC con verificación de firmas HMAC.
- `Vacations`: sincronización desde A3 y bloqueo de fichajes en permisos aprobados.
- `Settings`/`Holidays`: configuración regional y festivos parametrizables.
- `Audit`: registro estructurado de cambios.
- `Observability`: métricas, health checks, OpenTelemetry opcional.

## Cumplimiento RGPD

- Consentimientos auditados (acciones `CONSENT_GIVEN`/`CONSENT_REVOKED`).
- Retención configurable vía `Settings.auditRetentionDays`.
- Soft delete mediante `active=false` (customizable) y endpoints de exportación/eliminación admistrativa.

## Tests y calidad

- ESLint + Prettier en backend y frontend.
- Husky + lint-staged.
- GitHub Actions (definida en `.github/workflows/ci.yml`) ejecuta lint, tests, build y docker build.

## CI/CD

El pipeline de GitHub Actions instala dependencias, ejecuta linting, tests, build de apps y construye la imagen Docker, sirviendo como base para despliegues continuos.

## Datos demo

Ejecuta `npm run db:seed` para poblar usuarios (1 Admin, 2 Empleados), proyectos de ejemplo, permisos, festivos Andalucía y vacaciones pre-aprobadas. Incluye un fichaje completo de ejemplo.

## PWA

- `manifest.json` y `service-worker.js` básicos para cachear shell y permitir instalación opcional (`VITE_PWA_ENABLED`).
- En móviles ofrece experiencia instalable (sin modo offline para fichajes).

---

### Checklist manual
- [ ] Ejecutar `npm run test` y `npm run build`.
- [ ] Validar login mock y fichaje en <http://localhost:5173>.
- [ ] Probar idempotencia haciendo doble click en "Fichar".
- [ ] Revisar `/metrics`, `/health` y `/ready`.
- [ ] Confirmar sincronización manual en panel de administración.
