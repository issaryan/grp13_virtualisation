#!/bin/bash

# Configuration
LOCALSTACK_ENDPOINT="http://localhost:4566"
SNS_TOPIC="QuizResults"
DYNAMO_TABLES_SCRIPT="infra/dynamo-tables.js"
SEED_DATA_SCRIPT="db/seed-data.js"

# Couleurs pour le terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction d'affichage d'erreur
die() {
  echo -e "${RED}$1${NC}" >&2
  exit 1
}

# Vérification des prérequis
check_prerequisites() {
  echo -e "${YELLOW}Vérification des prérequis...${NC}"

  command -v node >/dev/null 2>&1 || die "Node.js non installé"
  command -v npm >/dev/null 2>&1 || die "npm non installé"
  command -v aws >/dev/null 2>&1 || die "AWS CLI non installé"
  command -v localstack >/dev/null 2>&1 || die "LocalStack non installé"
  command -v serverless >/dev/null 2>&1 || die "Serverless Framework non installé"

  [ -f "$DYNAMO_TABLES_SCRIPT" ] || die "Fichier $DYNAMO_TABLES_SCRIPT introuvable"
  [ -f "$SEED_DATA_SCRIPT" ] || die "Fichier $SEED_DATA_SCRIPT introuvable"
}

# Démarrer LocalStack
start_localstack() {
  echo -e "${YELLOW}Démarrage de LocalStack...${NC}"
  localstack start -d || die "Échec du démarrage de LocalStack"

  # Attendre que les services soient prêts
  echo -n "Attente des services LocalStack"
  until curl -s "${LOCALSTACK_ENDPOINT}/health" | grep -q '"sqs": "available"'; do
    echo -n "."
    sleep 2
  done
  echo -e "\n${GREEN}LocalStack prêt !${NC}"
}

# Créer les ressources AWS
create_infrastructure() {
  echo -e "${YELLOW}Création des tables DynamoDB...${NC}"
  node "$DYNAMO_TABLES_SCRIPT" || die "Échec de la création des tables"

  echo -e "${YELLOW}Création du topic SNS...${NC}"
  aws --endpoint-url="$LOCALSTACK_ENDPOINT" sns create-topic --name "$SNS_TOPIC" >/dev/null || die "Échec de la création du topic SNS"
}

# Déployer l'application
deploy_app() {
  echo -e "${YELLOW}Installation des dépendances...${NC}"
  npm install || die "Échec de l'installation npm"

  echo -e "${YELLOW}Déploiement Serverless...${NC}"
  serverless deploy --stage local || die "Échec du déploiement Serverless"
}

# Peupler les données initiales
seed_data() {
  echo -e "${YELLOW}Peuplement des données initiales...${NC}"
  node "$SEED_DATA_SCRIPT" || die "Échec du peuplement des données"
}

# Afficher les informations de déploiement
show_info() {
  local websocket_url=$(serverless info --stage local | grep WebSocketEndpoint | awk '{print $2}')

  echo -e "\n${GREEN}Déploiement réussi !${NC}"
  echo -e "Endpoints disponibles :"
  echo -e "• REST API:    ${YELLOW}http://localhost:4566/restapis/[api-id]/dev/_user_request_/${NC}"
  echo -e "• WebSocket:   ${YELLOW}${websocket_url}${NC}"
  echo -e "\nCommandes utiles :"
  echo -e "• Lancer les tests: ${YELLOW}curl http://localhost:4566/health${NC}"
  echo -e "• Voir les logs:    ${YELLOW}localstack logs -f${NC}"
  echo -e "• Arrêter:          ${YELLOW}localstack stop${NC}"
}

# Menu principal
main() {
  check_prerequisites
  start_localstack
  create_infrastructure
  deploy_app
  seed_data
  show_info
}

# Exécution
main
