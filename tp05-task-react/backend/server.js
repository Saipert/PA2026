/**
 * TP05 - API de tareas de proyectos de software
 *
 * Backend del manejador de tareas hecho en React. Persiste en Postgres (ver db/init.sql)
 * y expone un CRUD REST mas una accion "finalizar":
 *
 *   GET    /api/tasks            Listar (filtro opcional ?status=En progreso)
 *   GET    /api/tasks/:id        Obtener una
 *   POST   /api/tasks            Crear
 *   PUT    /api/tasks/:id        Editar (reemplaza todos los campos del formulario)
 *   PATCH  /api/tasks/:id/finish Finalizar (estado "Finalizada" + fecha de cierre)
 *   DELETE /api/tasks/:id        Eliminar
 *   GET    /api/health           Healthcheck (lo usa docker compose)
 *
 * Los endpoints viven bajo /api para que en Docker nginx pueda distinguirlos de los
 * archivos estaticos del frontend y reenviarlos a este servicio.
 */

import express from 'express'
import { pool } from './db.js'
import { STATUSES, validateTask } from './validation.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

// Columnas de la tabla -> nombres camelCase que consume el frontend
const COLUMNS = `
    id,
    project_name  AS "projectName",
    activity_type AS "activityType",
    status,
    summary,
    description,
    priority,
    reporter,
    assignee,
    precondition,
    created_date  AS "createdDate",
    closed_date   AS "closedDate",
    sprint`

const FINISHED = 'Finalizada'

// Valida :id una sola vez para todas las rutas (si no, Postgres devolveria un 500 por
// "invalid input syntax for type integer")
app.param('id', (req, res, next, id) => {
    if (!/^\d{1,9}$/.test(id)) {
        return res.status(400).json({ error: 'El id debe ser un número entero' })
    }
    next()
})

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// GET /api/tasks - Listar todas las tareas (con filtro opcional ?status=...)
app.get('/api/tasks', async (req, res) => {
    const { status } = req.query

    if (status !== undefined && !STATUSES.includes(status)) {
        return res.status(400).json({ error: `status debe ser uno de: ${STATUSES.join(', ')}` })
    }

    const result = status
        ? await pool.query(`SELECT ${COLUMNS} FROM tasks WHERE status = $1 ORDER BY id DESC`, [status])
        : await pool.query(`SELECT ${COLUMNS} FROM tasks ORDER BY id DESC`)
    res.json(result.rows)
})

// GET /api/tasks/:id - Obtener una tarea por id
app.get('/api/tasks/:id', async (req, res) => {
    const result = await pool.query(`SELECT ${COLUMNS} FROM tasks WHERE id = $1`, [req.params.id])

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' })
    }

    res.json(result.rows[0])
})

// POST /api/tasks - Crear una nueva tarea
app.post('/api/tasks', async (req, res) => {
    const { errors, value: t } = validateTask(req.body)

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors })
    }

    // Si no llega fecha de creacion usamos hoy. Si el estado ya es "Finalizada" y no
    // llega fecha de cierre, tambien la completamos con hoy.
    const result = await pool.query(
        `INSERT INTO tasks
            (project_name, activity_type, status, summary, description, priority,
             reporter, assignee, precondition, created_date, closed_date, sprint)
         VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9,
             COALESCE($10::date, CURRENT_DATE),
             CASE WHEN $13::boolean THEN COALESCE($11::date, GREATEST(CURRENT_DATE, COALESCE($10::date, CURRENT_DATE)))
                  ELSE $11::date END,
             $12)
         RETURNING ${COLUMNS}`,
        [
            t.projectName, t.activityType, t.status, t.summary, t.description, t.priority,
            t.reporter, t.assignee, t.precondition, t.createdDate, t.closedDate, t.sprint,
            t.status === FINISHED,
        ]
    )

    res.status(201).json(result.rows[0])
})

// PUT /api/tasks/:id - Editar una tarea (el formulario envia todos los campos)
app.put('/api/tasks/:id', async (req, res) => {
    const { errors, value: t } = validateTask(req.body)

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors })
    }

    // Si no llega fecha de creacion se conserva la que ya tenia la tarea.
    const result = await pool.query(
        `UPDATE tasks
         SET project_name  = $1,
             activity_type = $2,
             status        = $3,
             summary       = $4,
             description   = $5,
             priority      = $6,
             reporter      = $7,
             assignee      = $8,
             precondition  = $9,
             created_date  = COALESCE($10::date, created_date),
             closed_date   = CASE WHEN $14::boolean
                                  THEN COALESCE($11::date, GREATEST(CURRENT_DATE, COALESCE($10::date, created_date)))
                                  ELSE $11::date END,
             sprint        = $12,
             updated_at    = NOW()
         WHERE id = $13
         RETURNING ${COLUMNS}`,
        [
            t.projectName, t.activityType, t.status, t.summary, t.description, t.priority,
            t.reporter, t.assignee, t.precondition, t.createdDate, t.closedDate, t.sprint,
            req.params.id, t.status === FINISHED,
        ]
    )

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' })
    }

    res.json(result.rows[0])
})

// PATCH /api/tasks/:id/finish - Marcar la tarea como finalizada
app.patch('/api/tasks/:id/finish', async (req, res) => {
    // Si ya tenia fecha de cierre se respeta; si no, hoy (nunca antes de la fecha de creacion)
    const result = await pool.query(
        `UPDATE tasks
         SET status      = $2,
             closed_date = COALESCE(closed_date, GREATEST(CURRENT_DATE, created_date)),
             updated_at  = NOW()
         WHERE id = $1
         RETURNING ${COLUMNS}`,
        [req.params.id, FINISHED]
    )

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' })
    }

    res.json(result.rows[0])
})

// DELETE /api/tasks/:id - Eliminar una tarea
app.delete('/api/tasks/:id', async (req, res) => {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [req.params.id])

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' })
    }

    res.status(204).send()
})

// Manejo de errores centralizado. Express 5 captura solo los rechazos de los handlers
// async, asi que no hace falta un try/catch en cada ruta.
app.use((err, req, res, next) => {
    // JSON malformado en el body (lo genera express.json())
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'El body no es un JSON válido' })
    }
    // Violacion de un CHECK de la base (ej. fecha de cierre anterior a la de creacion)
    if (err.code === '23514') {
        return res.status(400).json({ error: 'Los datos no cumplen las reglas de la base', details: { constraint: err.constraint } })
    }
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`)
    console.log(`📝 API endpoints available at /api/tasks`)
})
