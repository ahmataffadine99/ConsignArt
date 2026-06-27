# Étape 1 : Build
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Installation des dépendances
COPY package*.json ./
RUN npm install

# Copie du code source et build
COPY . .
RUN npm run build

# Étape 2 : Production
FROM node:20-alpine

WORKDIR /usr/src/app

# Installation des dépendances de production uniquement
COPY package*.json ./
RUN npm install --only=production

# Récupération du build depuis l'étape précédente
COPY --from=builder /usr/src/app/dist ./dist

# Port d'écoute de l'application
EXPOSE 3000

# Commande de démarrage
CMD ["node", "dist/main"]
