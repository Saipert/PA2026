# TP05 - Gestor de Tareas (React + Vite + Node + Postgres + Docker)

## Objetivo

Aplicación para manejar tareas de proyectos de software. Un formulario en React
(con Vite) permite crear tareas; el componente **Listado de Tareas** las muestra
y permite **editar**, **eliminar** y **finalizar** cada una. La información se
persiste en **Postgres** y los tres componentes (frontend, backend y base de
datos) corren en **contenedores Docker**.

## Cómo cumple el enunciado

| Requerimiento | Dónde está |
|---|---|
| Formulario en React con Vite | `frontend/src/components/TaskForm.jsx` |
| Los 12 campos pedidos | Ver tabla "Campos del formulario" más abajo |
| Listado en el componente "Listado de Tareas" | `frontend/src/components/TaskList.jsx` |
| Editar, eliminar y finalizar | Botones por fila en el listado + `PUT`, `DELETE` y `PATCH .../finish` en la API |
| Persistencia en Postgres | `db/init.sql` + `backend/` (driver `pg`, queries parametrizadas) |
| Frontend y backend en Docker | `frontend/Dockerfile`, `backend/Dockerfile` y `docker-compose.yml` |

## Estructura

```
tp05-task-react/
├── db/
│   └── init.sql             # Crea la tabla y carga datos de ejemplo (una sola vez)
├── backend/                 # API Express + Postgres
│   ├── server.js            # Endpoints REST
│   ├── validation.js        # Validación de los datos de una tarea
│   ├── db.js                # Pool de conexión a Postgres
│   └── Dockerfile
├── frontend/                # React + Vite
│   ├── src/
│   │   ├── App.jsx          # Estado general y acciones (crear, editar, finalizar, eliminar)
│   │   ├── api.js           # Cliente de la API
│   │   ├── constants.js     # Tipos de actividad, estados y prioridades
│   │   └── components/
│   │       ├── TaskForm.jsx # Formulario de alta / edición
│   │       └── TaskList.jsx # Listado de Tareas (filtros, detalle y acciones)
│   ├── nginx.conf           # Sirve el build y reenvía /api al backend
│   └── Dockerfile           # Build multi-etapa: Node (Vite) -> nginx
├── docker-compose.yml       # Orquesta db + api + web
└── .env.example             # Copiar a .env
```

## Cómo correr (Docker)

1. Copiar las variables de entorno:

   ```
   cp .env.example .env
   ```

2. Levantar todo (construye las imágenes de la API y del frontend, y descarga Postgres):

   ```
   docker compose up --build
   ```

3. Abrir **http://localhost:8080**.

   | Servicio | URL |
   |---|---|
   | Frontend (nginx) | http://localhost:8080 |
   | API | http://localhost:3001/api/tasks |
   | Postgres | `localhost:5433` (usuario/clave/base del `.env`) |

   Postgres usa el puerto 5433 en tu máquina para no chocar con el del TP03 (5432).

4. Para parar todo:

   ```
   docker compose down
   ```

   Los datos quedan en el volumen `tp05_pgdata` y sobreviven. Para borrarlos también:

   ```
   docker compose down -v
   ```

## Cómo correr en desarrollo (sin Docker para frontend y backend)

Necesitás un Postgres con la tabla creada (por ejemplo, levantando solo el servicio `db`:
`docker compose up db`).

```
# Terminal 1 - backend (puerto 3001)
cd backend
npm install
DB_HOST=localhost DB_PORT=5433 \
POSTGRES_USER=task_user POSTGRES_PASSWORD=task_pass POSTGRES_DB=task_db \
npm run dev

# Terminal 2 - frontend (puerto 5173, con hot reload)
cd frontend
npm install
npm run dev
```

Vite reenvía `/api` a `http://localhost:3001` (ver `frontend/vite.config.js`), por eso el
frontend usa rutas relativas y no hace falta configurar CORS.

## Campos del formulario

| Campo | Tipo de input | Obligatorio | Valores / notas |
|---|---|---|---|
| Nombre del Proyecto | texto | Sí | máx. 150 caracteres |
| Tipo de Actividad | select | Sí | Tarea, Bug, Historia, Épica, Mejora |
| Estado | select | Sí | Por hacer, En progreso, En revisión, Finalizada |
| Resumen | texto | Sí | máx. 255 caracteres |
| Descripción | textarea | No | |
| Prioridad | select | Sí | Baja, Media, Alta, Crítica |
| Informador | texto | Sí | quien reporta la tarea |
| Persona asignada | texto | No | vacío = "Sin asignar" |
| Precondición | textarea | No | |
| Fecha de Creación | fecha | Sí | por defecto, hoy |
| Fecha de Cierre | fecha | No | no puede ser anterior a la de creación |
| Sprint | texto | No | ej. `Sprint 3` |

Reglas de negocio:

- **Finalizar** pone el estado en `Finalizada` y completa la fecha de cierre con hoy
  (si la tarea ya tenía fecha de cierre, se respeta).
- Si en el formulario se elige el estado `Finalizada` y no hay fecha de cierre,
  se propone hoy automáticamente (se puede cambiar).
- Las validaciones se hacen en el frontend (mensajes por campo) **y** en el backend
  (`400` con el detalle por campo), y la base las refuerza con `CHECK` en `init.sql`.

## API

Todos los endpoints viven bajo `/api`.

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/tasks` | Lista las tareas (más nuevas primero). Filtro opcional `?status=En progreso` |
| `GET` | `/api/tasks/:id` | Obtiene una tarea |
| `POST` | `/api/tasks` | Crea una tarea |
| `PUT` | `/api/tasks/:id` | Edita una tarea (reemplaza todos los campos del formulario) |
| `PATCH` | `/api/tasks/:id/finish` | Finaliza una tarea |
| `DELETE` | `/api/tasks/:id` | Elimina una tarea (`204`) |
| `GET` | `/api/health` | Healthcheck (lo usa Docker Compose) |

Ejemplo:

```
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Portal de Alumnos",
    "activityType": "Bug",
    "status": "Por hacer",
    "summary": "El listado no pagina",
    "description": "Con más de 50 materias se corta el listado",
    "priority": "Alta",
    "reporter": "Laura Gómez",
    "assignee": "Martín Ruiz",
    "precondition": "Usuario con más de 50 materias",
    "createdDate": "2026-10-05",
    "closedDate": "",
    "sprint": "Sprint 3"
  }'

curl -X PATCH http://localhost:3001/api/tasks/1/finish
```

## Cómo se conectan las piezas

```
Navegador ──► nginx (web:80) ──┬─► archivos estáticos del build de Vite
                               └─► /api/*  ──► api:3001 (Express) ──► db:5432 (Postgres)
```

- Dentro de la red de Compose, cada servicio se encuentra por su **nombre**: la API se
  conecta a `db` (no a `localhost`) y nginx reenvía a `api`.
- `depends_on` con `condition: service_healthy` hace que la API espere a que Postgres
  esté listo, y que nginx espere a que la API responda su healthcheck.
- El frontend usa rutas relativas (`/api/tasks`): así funciona igual en desarrollo
  (proxy de Vite) y en Docker (proxy de nginx), sin CORS.

## Troubleshooting

- **Puerto 8080, 3001 o 5433 en uso**: cambiá el mapeo de puertos en `docker-compose.yml`
  (por ejemplo `"8081:80"` para el frontend).
- **`init.sql` no crea la tabla o no aparecen los datos de ejemplo**: ese script solo corre
  la primera vez que se crea el volumen. Corré `docker compose down -v` y volvé a levantar.
- **Cambios en el código no se reflejan en Docker**: las imágenes se construyen una sola vez;
  después de editar hay que correr `docker compose up --build`.
- **El listado muestra "No se pudieron cargar las tareas"**: la API no está respondiendo.
  Revisá `docker compose logs api` y usá el botón *Reintentar* cuando esté arriba.
