-- Se ejecuta automaticamente UNA SOLA VEZ, cuando Postgres crea el volumen por primera vez
-- (carpeta especial docker-entrypoint-initdb.d). Si ya existe el volumen, este script
-- no se vuelve a correr aunque reinicies los contenedores.

CREATE TABLE IF NOT EXISTS tasks (
    id            SERIAL PRIMARY KEY,
    project_name  VARCHAR(150) NOT NULL,
    activity_type VARCHAR(30)  NOT NULL
        CHECK (activity_type IN ('Tarea', 'Bug', 'Historia', 'Épica', 'Mejora')),
    status        VARCHAR(30)  NOT NULL DEFAULT 'Por hacer'
        CHECK (status IN ('Por hacer', 'En progreso', 'En revisión', 'Finalizada')),
    summary       VARCHAR(255) NOT NULL,
    description   TEXT         NOT NULL DEFAULT '',
    priority      VARCHAR(20)  NOT NULL DEFAULT 'Media'
        CHECK (priority IN ('Baja', 'Media', 'Alta', 'Crítica')),
    reporter      VARCHAR(100) NOT NULL,
    assignee      VARCHAR(100),
    precondition  TEXT         NOT NULL DEFAULT '',
    created_date  DATE         NOT NULL DEFAULT CURRENT_DATE,
    closed_date   DATE,
    sprint        VARCHAR(50),
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT closed_after_created CHECK (closed_date IS NULL OR closed_date >= created_date)
);

-- Datos de ejemplo para ver el listado funcionando desde el primer arranque
INSERT INTO tasks
    (project_name, activity_type, status, summary, description, priority,
     reporter, assignee, precondition, created_date, closed_date, sprint)
VALUES
    ('Portal de Alumnos', 'Historia', 'En progreso',
     'Login con cuenta institucional',
     'Permitir que los alumnos inicien sesión con su cuenta @universidad.edu mediante OAuth2.',
     'Alta', 'Laura Gómez', 'Martín Ruiz',
     'Contar con las credenciales OAuth registradas en el proveedor de identidad.',
     '2026-09-01', NULL, 'Sprint 3'),
    ('Portal de Alumnos', 'Bug', 'Por hacer',
     'El listado de materias no pagina',
     'Al tener más de 50 materias el listado se corta y no aparece el botón "Siguiente".',
     'Crítica', 'Laura Gómez', NULL,
     'Usuario con más de 50 materias inscriptas.',
     '2026-09-10', NULL, 'Sprint 3'),
    ('Sistema de Inventario', 'Tarea', 'En revisión',
     'Migrar el esquema de la base a Postgres 16',
     'Actualizar los scripts de migración y verificar compatibilidad con las consultas existentes.',
     'Media', 'Carlos Pérez', 'Ana Torres',
     'Backup completo de la base actual.',
     '2026-08-20', NULL, 'Sprint 2'),
    ('Sistema de Inventario', 'Mejora', 'Finalizada',
     'Agregar índice por código de producto',
     'La búsqueda por código tardaba más de 2 segundos con 100k registros.',
     'Baja', 'Carlos Pérez', 'Ana Torres',
     '',
     '2026-08-05', '2026-08-12', 'Sprint 2'),
    ('App Móvil de Reservas', 'Épica', 'Por hacer',
     'Notificaciones push de recordatorio',
     'Enviar recordatorios 24 h y 1 h antes de cada reserva.',
     'Media', 'Sofía Díaz', 'Martín Ruiz',
     'Integración con el servicio de notificaciones del proveedor cloud.',
     '2026-09-15', NULL, 'Sprint 4');
