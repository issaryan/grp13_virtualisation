FROM node:18.20.2-alpine3.19

WORKDIR /app

# Étape 1 - Nettoyage complet du cache npm
RUN npm cache clean --force && rm -rf node_modules

# Étape 2 - Installer les dépendances système critiques
RUN apk add --no-cache python3 make g++ git

# Étape 3 - Installer Angular CLI avec résolution de dépendance explicite
RUN npm install -g @angular/cli@19.2.0 --force \
    && npm install semver@7.6.0 --no-save --force

# Étape 4 - Copier et installer les dépendances avec vérification
COPY package*.json ./
RUN npm ci --legacy-peer-deps --force \
    && npm list semver

# Étape 5 - Builder l'application avec vérification
COPY . .
RUN ng build --configuration production

CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]
