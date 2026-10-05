import { useCallback, useEffect, useRef, useState } from 'react'
import { createTask, deleteTask, finishTask, getTasks, updateTask } from './api.js'
import TaskForm from './components/TaskForm.jsx'
import TaskList from './components/TaskList.jsx'

export default function App() {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState('')
    const [editingTask, setEditingTask] = useState(null)
    // Se incrementa para forzar que el formulario se reinicie (tras guardar o cancelar)
    const [formVersion, setFormVersion] = useState(0)
    const [busyId, setBusyId] = useState(null)
    const [notice, setNotice] = useState(null)
    const formSectionRef = useRef(null)

    const loadTasks = useCallback(async () => {
        setLoading(true)
        setLoadError('')
        try {
            setTasks(await getTasks())
        } catch (err) {
            setLoadError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadTasks()
    }, [loadTasks])

    // Los avisos se ocultan solos a los 4 segundos
    useEffect(() => {
        if (!notice) return
        const timer = setTimeout(() => setNotice(null), 4000)
        return () => clearTimeout(timer)
    }, [notice])

    const resetForm = () => {
        setEditingTask(null)
        setFormVersion((v) => v + 1)
    }

    // Crea o actualiza segun haya una tarea en edicion. Si falla, el error vuelve al form.
    const handleSave = async (values) => {
        if (editingTask) {
            const updated = await updateTask(editingTask.id, values)
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
            setNotice({ type: 'success', text: `Tarea "${updated.summary}" actualizada.` })
        } else {
            const created = await createTask(values)
            setTasks((prev) => [created, ...prev])
            setNotice({ type: 'success', text: `Tarea "${created.summary}" creada.` })
        }
        resetForm()
    }

    const handleEdit = (task) => {
        setEditingTask(task)
        formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    const handleFinish = async (task) => {
        setBusyId(task.id)
        try {
            const finished = await finishTask(task.id)
            setTasks((prev) => prev.map((t) => (t.id === finished.id ? finished : t)))
            // Si justo se estaba editando, recargamos el form con el estado y la fecha nuevos
            if (editingTask?.id === finished.id) {
                setEditingTask(finished)
                setFormVersion((v) => v + 1)
            }
            setNotice({ type: 'success', text: `Tarea "${finished.summary}" finalizada.` })
        } catch (err) {
            setNotice({ type: 'error', text: `No se pudo finalizar la tarea: ${err.message}` })
        } finally {
            setBusyId(null)
        }
    }

    const handleDelete = async (task) => {
        if (!window.confirm(`¿Eliminar la tarea "${task.summary}"? Esta acción no se puede deshacer.`)) return

        setBusyId(task.id)
        try {
            await deleteTask(task.id)
            setTasks((prev) => prev.filter((t) => t.id !== task.id))
            if (editingTask?.id === task.id) resetForm()
            setNotice({ type: 'success', text: `Tarea "${task.summary}" eliminada.` })
        } catch (err) {
            setNotice({ type: 'error', text: `No se pudo eliminar la tarea: ${err.message}` })
        } finally {
            setBusyId(null)
        }
    }

    return (
        <div className="app">
            <header className="app__header">
                <h1>Gestor de Tareas</h1>
                <p className="muted">Tareas de proyectos de software · Programación Avanzada 2026</p>
            </header>

            {notice && (
                <div className={`notice notice--${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
                    {notice.text}
                </div>
            )}

            <section className="card" ref={formSectionRef} aria-labelledby="form-title">
                <div className="card__header">
                    <h2 id="form-title">{editingTask ? `Editando tarea #${editingTask.id}` : 'Nueva tarea'}</h2>
                    <span className="muted">Los campos con * son obligatorios</span>
                </div>
                <TaskForm
                    key={`${editingTask?.id ?? 'new'}-${formVersion}`}
                    task={editingTask}
                    onSubmit={handleSave}
                    onCancel={resetForm}
                />
            </section>

            <TaskList
                tasks={tasks}
                loading={loading}
                error={loadError}
                editingId={editingTask?.id}
                busyId={busyId}
                onRetry={loadTasks}
                onEdit={handleEdit}
                onFinish={handleFinish}
                onDelete={handleDelete}
            />
        </div>
    )
}
