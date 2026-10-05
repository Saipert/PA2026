# --- Etapa 1: build de la app con Vite ---
FROM node:22-alpine AS build

WORKDIR /app

# Primero los manifest, para aprovechar la cache de capas de Docker
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Etapa 2: servir los estaticos con nginx (la imagen final no incluye Node) ---
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
