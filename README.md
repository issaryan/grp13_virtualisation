# Application de Quiz Éducatif avec Services AWS (via LocalStack)

Une plateforme de quiz interactive exploitant les services AWS simulés par **LocalStack** pour une architecture serverless complète.

## Fonctionnalités Clés

- 🎮 **Création de Quiz** : Interface enseignant pour générer des questions/réponses structurées
- ⚡ **Sessions Temps Réel** : Interactions en direct via WebSocket (API Gateway)
- 📊 **Résultats Instantanés** : Visualisation des scores en direct après chaque question
- 📈 **Statistiques Simplifiées** : Classements et taux de réussite par thématique
- 🔔 **Notifications** : Alertes SNS pour les événements critiques (début/fin de quiz)

## Architecture Serverless (LocalStack)

### Services Principaux
| **Service**       | **Rôle**                                  | **Implémentation**              |
|--------------------|-------------------------------------------|----------------------------------|
| **DynamoDB**       | Stockage des questions/résultats          | Tables                           |
| **API Gateway**    | Gestion des connexions WebSocket          | Routeur des événements temps réel|
| **Lambda**         | Logique métier des opérations             | Fonctions Node.js                |
| **SNS**            | Notifications des événements de session   | Topics dédiés                    |

### Workflow Typique
1. **Création de Quiz** → Stockage DynamoDB  
2. **Lancement Session** → Déclenchement Lambda via API Gateway  
3. **Interaction Temps Réel** → Messages WebSocket  
4. **Calcul Scores** → Mise à jour DynamoDB + Notification SNS  

## Objectifs Pédagogiques
- 🖧 **Maîtrise des WebSockets** avec API Gateway
- 🔄 **Communication Bidirectionnelle** en temps réel
- 🗄️ **Gestion d'État** via DynamoDB (modèles de données optimisés)
- 🔔 **Patterns de Notification** avec SNS
- 🐳 **Simulation d'Infra Cloud** via LocalStack

## Configuration Technique

### Prérequis
- Docker + Docker Compose
- Node.js 18+
- AWS CLI (configuré pour LocalStack)
- Python 3.11+ (pour les scripts de déploiement)

