// Fecha local de hoy como "YYYY-MM-DD" (toISOString() usaria UTC y a la noche daria
// el dia siguiente en Argentina).
export function todayISO() {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${now.getFullYear()}-${month}-${day}`
}

// "2026-09-01" -> "01/09/2026". Se parte el string a mano para no pasar por Date
// y evitar corrimientos de zona horaria.
export function formatDate(iso) {
    if (!iso) return '—'
    const [year, month, day] = iso.split('-')
    return `${day}/${month}/${year}`
}
