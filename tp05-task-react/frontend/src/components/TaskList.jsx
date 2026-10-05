import { Fragment, useMemo, useState } from 'react'
import { FINISHED_STATUS, PRIORITIES, STATUSES } from '../constants.js'
import { formatDate } from '../utils.js'

// "En revisión" -> "en-revision": clase CSS estable para el color de cada badge
const slug = (text) =>
    text
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/\s+/g, '-')

function Badge({ kind, value }) {
    return <span className={`badge badge--${kind}-${slug(value)}`}>{value}</span>
}

/**
 * Listado de Tareas: tabla con filtros, detalle expandible y las acciones
 * Editar / Finalizar / Eliminar de cada tarea.
 */
export default function TaskList({ tasks, loading, error, editingId, busyId, onRetry, onEdit, onFinish, onDelete }) {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [priorityFilter, setPriorityFilter] = useState('')
    const [expanded, setExpanded] = useState(() => new Set())

    const visibleTasks = useMemo(() => {
        const query = search.trim().toLowerCase()
        return tasks.filter((task) => {
            if (statusFilter && task.status !== statusFilter) return false
            if (priorityFilter && task.priority !== priorityFilter) return false
            if (!query) return true
            return [task.projectName, task.summary, task.assignee, task.reporter, task.sprint]
                .filter(Boolean)
                .some((text) => text.toLowerCase().includes(query))
        })
    }, [tasks, search, statusFilter, priorityFilter])

    const toggleExpanded = (id) =>
        setExpanded((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })

    const hasFilters = Boolean(search || statusFilter || priorityFilter)
    const clearFilters = () => {
        setSearch('')
        setStatusFilter('')
        setPriorityFilter('')
    }

    return (
        <section className="card" aria-labelledby="list-title">
            <div className="card__header">
                <h2 id="list-title">Listado de Tareas</h2>
                {!loading && !error && (
                    <span className="muted">
                        {visibleTasks.length} de {tasks.length} {tasks.length === 1 ? 'tarea' : 'tareas'}
                    </span>
                )}
            </div>

            <div className="filters">
                <input
                    type="search"
                    placeholder="Buscar por proyecto, resumen, persona o sprint…"
                    aria-label="Buscar tareas"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select aria-label="Filtrar por estado" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">Todos los estados</option>
                    {STATUSES.map((status) => (
                        <option key={status}>{status}</option>
                    ))}
                </select>
                <select aria-label="Filtrar por prioridad" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                    <option value="">Todas las prioridades</option>
                    {PRIORITIES.map((priority) => (
                        <option key={priority}>{priority}</option>
                    ))}
                </select>
                {hasFilters && (
                    <button type="button" className="btn btn--small" onClick={clearFilters}>
                        Limpiar filtros
                    </button>
                )}
            </div>

            {loading && <p className="state">Cargando tareas…</p>}

            {error && (
                <div className="state state--error" role="alert">
                    <p>No se pudieron cargar las tareas: {error}</p>
                    <button type="button" className="btn btn--small" onClick={onRetry}>
                        Reintentar
                    </button>
                </div>
            )}

            {!loading && !error && tasks.length === 0 && (
                <p className="state">Todavía no hay tareas. Creá la primera con el formulario de arriba.</p>
            )}

            {!loading && !error && tasks.length > 0 && visibleTasks.length === 0 && (
                <p className="state">Ninguna tarea coincide con los filtros.</p>
            )}

            {visibleTasks.length > 0 && (
                <div className="table-wrap">
                    <table className="task-table">
                        <thead>
                            <tr>
                                <th>Proyecto</th>
                                <th>Tipo</th>
                                <th>Resumen</th>
                                <th>Prioridad</th>
                                <th>Estado</th>
                                <th>Asignada a</th>
                                <th>Sprint</th>
                                <th>Creación</th>
                                <th>Cierre</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleTasks.map((task) => {
                                const isOpen = expanded.has(task.id)
                                const isFinished = task.status === FINISHED_STATUS
                                const isBusy = busyId === task.id

                                return (
                                    <Fragment key={task.id}>
                                        <tr className={`${isFinished ? 'is-finished' : ''}${editingId === task.id ? ' is-editing' : ''}`}>
                                            <td className="cell-project">{task.projectName}</td>
                                            <td>{task.activityType}</td>
                                            <td className="cell-summary">
                                                <button
                                                    type="button"
                                                    className="link-button"
                                                    aria-expanded={isOpen}
                                                    onClick={() => toggleExpanded(task.id)}
                                                    title={isOpen ? 'Ocultar detalle' : 'Ver detalle'}
                                                >
                                                    <span className="chevron" aria-hidden="true">{isOpen ? '▾' : '▸'}</span>
                                                    <span className="summary-text">{task.summary}</span>
                                                </button>
                                            </td>
                                            <td><Badge kind="priority" value={task.priority} /></td>
                                            <td><Badge kind="status" value={task.status} /></td>
                                            <td>{task.assignee || <span className="muted">Sin asignar</span>}</td>
                                            <td className="cell-nowrap">{task.sprint || <span className="muted">—</span>}</td>
                                            <td className="cell-nowrap">{formatDate(task.createdDate)}</td>
                                            <td className="cell-nowrap">{formatDate(task.closedDate)}</td>
                                            <td>
                                                <div className="row-actions">
                                                    <button type="button" className="btn btn--small" onClick={() => onEdit(task)} disabled={isBusy}>
                                                        Editar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn--small btn--success"
                                                        onClick={() => onFinish(task)}
                                                        disabled={isBusy || isFinished}
                                                    >
                                                        Finalizar
                                                    </button>
                                                    <button type="button" className="btn btn--small btn--danger" onClick={() => onDelete(task)} disabled={isBusy}>
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {isOpen && (
                                            <tr className="detail-row">
                                                <td colSpan={10}>
                                                    <dl className="detail">
                                                        <div>
                                                            <dt>Descripción</dt>
                                                            <dd>{task.description || <span className="muted">Sin descripción</span>}</dd>
                                                        </div>
                                                        <div>
                                                            <dt>Precondición</dt>
                                                            <dd>{task.precondition || <span className="muted">Sin precondición</span>}</dd>
                                                        </div>
                                                        <div>
                                                            <dt>Informador</dt>
                                                            <dd>{task.reporter}</dd>
                                                        </div>
                                                    </dl>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    )
}
