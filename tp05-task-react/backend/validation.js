/**
 * Reglas de validacion de una tarea.
 *
 * Los catalogos (tipos, estados, prioridades) tienen que coincidir con los CHECK de
 * db/init.sql y con las listas de frontend/src/constants.js.
 */

export const ACTIVITY_TYPES = ['Tarea', 'Bug', 'Historia', 'Épica', 'Mejora']
export const STATUSES = ['Por hacer', 'En progreso', 'En revisión', 'Finalizada']
export const PRIORITIES = ['Baja', 'Media', 'Alta', 'Crítica']

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

// Valida formato Y que la fecha exista de verdad (rechaza 2026-02-31)
function isValidDate(value) {
    if (!DATE_REGEX.test(value)) return false
    const date = new Date(`${value}T00:00:00Z`)
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

/**
 * Normaliza y valida el body de un POST/PUT.
 * Devuelve { errors, value }: si "errors" tiene claves, el body es invalido.
 * Los strings opcionales vacios se normalizan a null (o '' si la columna es NOT NULL).
 */
export function validateTask(body = {}) {
    const errors = {}
    const text = (field) => (typeof body[field] === 'string' ? body[field].trim() : '')

    const required = (field, label, max) => {
        const value = text(field)
        if (!value) errors[field] = `${label} es obligatorio`
        else if (value.length > max) errors[field] = `${label} no puede superar ${max} caracteres`
        return value
    }

    const optional = (field, label, max) => {
        const value = text(field)
        if (value.length > max) errors[field] = `${label} no puede superar ${max} caracteres`
        return value
    }

    const oneOf = (field, label, allowed, fallback) => {
        const value = body[field] === undefined || body[field] === '' ? fallback : body[field]
        if (!allowed.includes(value)) {
            errors[field] = `${label} debe ser uno de: ${allowed.join(', ')}`
        }
        return value
    }

    const date = (field, label) => {
        const value = text(field)
        if (value && !isValidDate(value)) errors[field] = `${label} no es una fecha válida (AAAA-MM-DD)`
        return value || null
    }

    const value = {
        projectName: required('projectName', 'El nombre del proyecto', 150),
        activityType: oneOf('activityType', 'El tipo de actividad', ACTIVITY_TYPES),
        status: oneOf('status', 'El estado', STATUSES, 'Por hacer'),
        summary: required('summary', 'El resumen', 255),
        description: optional('description', 'La descripción', 10000),
        priority: oneOf('priority', 'La prioridad', PRIORITIES, 'Media'),
        reporter: required('reporter', 'El informador', 100),
        assignee: optional('assignee', 'La persona asignada', 100) || null,
        precondition: optional('precondition', 'La precondición', 10000),
        createdDate: date('createdDate', 'La fecha de creación'),
        closedDate: date('closedDate', 'La fecha de cierre'),
        sprint: optional('sprint', 'El sprint', 50) || null,
    }

    if (value.createdDate && value.closedDate && value.closedDate < value.createdDate) {
        errors.closedDate = 'La fecha de cierre no puede ser anterior a la de creación'
    }

    return { errors, value }
}
