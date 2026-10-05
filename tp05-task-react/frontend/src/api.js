// Cliente de la API. Las rutas son relativas (/api/...): en desarrollo las reenvia el
// proxy de Vite y en Docker nginx.
const BASE_URL = '/api/tasks'

async function request(path = '', options = {}) {
    let response
    try {
        response = await fetch(BASE_URL + path, {
            headers: { 'Content-Type': 'application/json' },
            ...options,
        })
    } catch {
        throw new Error('No se pudo conectar con el servidor')
    }

    if (response.status === 204) return null

    const data = await response.json().catch(() => null)

    if (!response.ok) {
        // Sin body JSON (ej. 502 de nginx cuando la API esta caida) mostramos un mensaje generico
        const error = new Error(data?.error || `El servidor respondió con un error (${response.status})`)
        // Errores de validacion del backend: { campo: 'mensaje' }
        error.details = data?.details
        throw error
    }

    return data
}

export const getTasks = () => request()

export const createTask = (task) =>
    request('', { method: 'POST', body: JSON.stringify(task) })

export const updateTask = (id, task) =>
    request(`/${id}`, { method: 'PUT', body: JSON.stringify(task) })

export const finishTask = (id) => request(`/${id}/finish`, { method: 'PATCH' })

export const deleteTask = (id) => request(`/${id}`, { method: 'DELETE' })
