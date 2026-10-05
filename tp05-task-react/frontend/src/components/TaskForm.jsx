import { useRef, useState } from 'react'
import { ACTIVITY_TYPES, FINISHED_STATUS, PRIORITIES, STATUSES } from '../constants.js'
import { todayISO } from '../utils.js'

const emptyForm = () => ({
    projectName: '',
    activityType: 'Tarea',
    status: 'Por hacer',
    summary: '',
    description: '',
    priority: 'Media',
    reporter: '',
    assignee: '',
    precondition: '',
    createdDate: todayISO(),
    closedDate: '',
    sprint: '',
})

// La API devuelve null en los campos vacios; los inputs controlados necesitan ''
const fromTask = (task) => ({
    ...emptyForm(),
    ...Object.fromEntries(Object.entries(task).map(([key, value]) => [key, value ?? ''])),
})

// Campos obligatorios y el texto del error cuando estan vacios. Los selects siempre
// tienen un valor, asi que solo hay que chequear los de texto y la fecha de creacion.
const REQUIRED_MESSAGES = {
    projectName: 'El nombre del proyecto es obligatorio',
    activityType: 'El tipo de actividad es obligatorio',
    status: 'El estado es obligatorio',
    summary: 'El resumen es obligatorio',
    priority: 'La prioridad es obligatoria',
    reporter: 'El informador es obligatorio',
    createdDate: 'La fecha de creación es obligatoria',
}

function validate(values) {
    const errors = {}

    for (const [field, message] of Object.entries(REQUIRED_MESSAGES)) {
        if (!values[field].trim()) errors[field] = message
    }

    if (values.closedDate && values.createdDate && values.closedDate < values.createdDate) {
        errors.closedDate = 'La fecha de cierre no puede ser anterior a la de creación'
    }

    return errors
}

function Field({ name, label, error, wide, children }) {
    const required = name in REQUIRED_MESSAGES
    return (
        <div className={`field${wide ? ' field--wide' : ''}`}>
            <label htmlFor={`field-${name}`}>
                {label}
                {required && <span className="field__required" aria-hidden="true"> *</span>}
            </label>
            {children}
            {error && (
                <p className="field__error" id={`field-${name}-error`}>
                    {error}
                </p>
            )}
        </div>
    )
}

/**
 * Formulario de alta / edicion de una tarea.
 *
 * - task: si viene, el formulario esta en modo edicion y arranca con sus datos.
 * - onSubmit(values): async, tiene que lanzar un Error si falla (se muestra en el form).
 * - onCancel: cancela la edicion.
 *
 * El padre le pasa un "key" distinto por tarea para que el estado interno se reinicie
 * cada vez que cambia lo que se esta editando.
 */
export default function TaskForm({ task, onSubmit, onCancel }) {
    const isEditing = Boolean(task)
    const formRef = useRef(null)
    const [values, setValues] = useState(() => (task ? fromTask(task) : emptyForm()))
    const [errors, setErrors] = useState({})
    const [submitError, setSubmitError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (event) => {
        const { name, value } = event.target

        setValues((prev) => {
            const next = { ...prev, [name]: value }
            // Al pasar a "Finalizada" sin fecha de cierre, proponemos hoy (el usuario puede cambiarla)
            if (name === 'status' && value === FINISHED_STATUS && !prev.closedDate) {
                const today = todayISO()
                next.closedDate = prev.createdDate > today ? prev.createdDate : today
            }
            return next
        })
        setErrors((prev) => ({ ...prev, [name]: undefined }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setSubmitError('')

        const found = validate(values)
        setErrors(found)

        const firstInvalid = Object.keys(found)[0]
        if (firstInvalid) {
            formRef.current.elements[firstInvalid]?.focus()
            return
        }

        setSubmitting(true)
        try {
            await onSubmit(values)
        } catch (err) {
            if (err.details) setErrors(err.details)
            setSubmitError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    // Atributos comunes de cada input: id, valor, handler y accesibilidad del error
    const bind = (name) => ({
        id: `field-${name}`,
        name,
        value: values[name],
        onChange: handleChange,
        required: name in REQUIRED_MESSAGES,
        'aria-invalid': errors[name] ? true : undefined,
        'aria-describedby': errors[name] ? `field-${name}-error` : undefined,
    })

    return (
        <form ref={formRef} className="task-form" onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
                <Field name="projectName" label="Nombre del Proyecto" error={errors.projectName}>
                    <input type="text" maxLength={150} {...bind('projectName')} />
                </Field>

                <Field name="activityType" label="Tipo de Actividad" error={errors.activityType}>
                    <select {...bind('activityType')}>
                        {ACTIVITY_TYPES.map((type) => (
                            <option key={type}>{type}</option>
                        ))}
                    </select>
                </Field>

                <Field name="status" label="Estado" error={errors.status}>
                    <select {...bind('status')}>
                        {STATUSES.map((status) => (
                            <option key={status}>{status}</option>
                        ))}
                    </select>
                </Field>

                <Field name="summary" label="Resumen" wide error={errors.summary}>
                    <input type="text" maxLength={255} {...bind('summary')} />
                </Field>

                <Field name="description" label="Descripción" wide error={errors.description}>
                    <textarea rows={3} {...bind('description')} />
                </Field>

                <Field name="priority" label="Prioridad" error={errors.priority}>
                    <select {...bind('priority')}>
                        {PRIORITIES.map((priority) => (
                            <option key={priority}>{priority}</option>
                        ))}
                    </select>
                </Field>

                <Field name="reporter" label="Informador" error={errors.reporter}>
                    <input type="text" maxLength={100} {...bind('reporter')} />
                </Field>

                <Field name="assignee" label="Persona asignada" error={errors.assignee}>
                    <input type="text" maxLength={100} {...bind('assignee')} />
                </Field>

                <Field name="precondition" label="Precondición" wide error={errors.precondition}>
                    <textarea rows={2} {...bind('precondition')} />
                </Field>

                <Field name="createdDate" label="Fecha de Creación" error={errors.createdDate}>
                    <input type="date" {...bind('createdDate')} />
                </Field>

                <Field name="closedDate" label="Fecha de Cierre" error={errors.closedDate}>
                    <input type="date" min={values.createdDate || undefined} {...bind('closedDate')} />
                </Field>

                <Field name="sprint" label="Sprint" error={errors.sprint}>
                    <input type="text" maxLength={50} placeholder="Ej: Sprint 3" {...bind('sprint')} />
                </Field>
            </div>

            {submitError && (
                <p className="form-error" role="alert">
                    {submitError}
                </p>
            )}

            <div className="form-actions">
                <button type="submit" className="btn btn--primary" disabled={submitting}>
                    {submitting ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear tarea'}
                </button>
                {isEditing && (
                    <button type="button" className="btn" onClick={onCancel} disabled={submitting}>
                        Cancelar edición
                    </button>
                )}
            </div>
        </form>
    )
}
