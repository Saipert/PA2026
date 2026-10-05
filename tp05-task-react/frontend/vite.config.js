import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En desarrollo (npm run dev) Vite reenvia /api al backend, asi el frontend siempre usa
// rutas relativas ("/api/tasks") y no hace falta configurar CORS. En Docker hace lo mismo
// nginx (ver nginx.conf).
export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        port: 5173,
        proxy: {
            '/api': process.env.VITE_API_TARGET || 'http://localhost:3001',
        },
    },
})
