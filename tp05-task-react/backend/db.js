/**
 * Pool de conexiones a Postgres.
 *
 * Se configura enteramente por variables de entorno para que funcione tanto
 * corriendo "suelto" (npm run dev contra un Postgres local) como dentro de
 * docker compose, donde DB_HOST pasa a ser el nombre del servicio ("db")
 * en vez de "localhost".
 */

import pg from 'pg'

const { Pool, types } = pg

// Por defecto "pg" convierte las columnas DATE (oid 1082) a objetos Date de JS, y al
// serializarlas a JSON la fecha puede correrse un dia segun la zona horaria. Las dejamos
// como string "YYYY-MM-DD", que es justo lo que usa el <input type="date"> del frontend.
types.setTypeParser(1082, (value) => value)

export const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
})

// Chequeo simple al arrancar para dar un error claro si la base no responde
pool.query('SELECT NOW()')
    .then(() => console.log('✅ Conectado a Postgres'))
    .catch((err) => console.error('❌ No se pudo conectar a Postgres:', err.message))
