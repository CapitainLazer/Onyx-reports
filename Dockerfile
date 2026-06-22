# ===== BUILD STAGE =====
FROM node:18-alpine AS builder

WORKDIR /app

# Copier package.json et package-lock.json (si exists)
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Build (si nécessaire - sinon passer cette étape)
# RUN npm run build

# ===== PRODUCTION STAGE =====
FROM node:18-alpine

WORKDIR /app

# Installer un serveur HTTP léger (pour servir les fichiers statiques)
RUN npm install -g http-server

# Copier depuis le builder
COPY --from=builder /app . 

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Exposer le port
EXPOSE 8080

# Commande de démarrage
CMD ["http-server", ".", "-p", "8080", "-c-1"]
