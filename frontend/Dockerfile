# /home/dma/projectmanager/frontend/Dockerfile

# Étape 1: Build du frontend
FROM node:20-alpine AS builder
WORKDIR /app

# Copier les fichiers package.json (ils sont ici, pas dans un sous-dossier frontend/)
COPY package*.json ./
RUN npm install

# Copier tout le code source
COPY . .
RUN npm run build

# Étape 2: Servir avec Nginx
FROM nginx:alpine

# Copier la configuration Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers build (le dossier build est créé par npm run build)
COPY --from=builder /app/build /usr/share/nginx/html

# Exposer les ports
EXPOSE 80 5173

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
