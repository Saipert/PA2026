# Imagen base liviana con Node 22
FROM node:22-alpine

WORKDIR /app

# Copiamos primero los manifest de dependencias para aprovechar la cache de Docker:
# si solo cambia el codigo (no las dependencias), Docker no vuelve a correr npm ci
COPY package*.json ./

RUN npm ci --omit=dev

# Copiamos el resto del codigo fuente
COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
