FROM node:18-alpine

WORKDIR /usr/src/app

RUN npm install -g serverless@3
RUN npm install serverless-localstack

COPY package*.json ./
RUN npm install

COPY . .

ENV AWS_ACCESS_KEY_ID=test
ENV AWS_SECRET_ACCESS_KEY=test
ENV AWS_DEFAULT_REGION=us-east-1
ENV NODE_ENV=development
ENV IS_LOCAL=true

CMD sh -c "sls deploy --stage local --aws-profile fake"

CMD ["npm", "start", "--", "--host", "0.0.0.0", "--port", "4200", "--disable-host-check"]
# Script de démarrage personnalisé
CMD sh -c "echo 'En attente de LocalStack...' && \
           while ! nc -z localstack 4566; do sleep 1; done && \
           echo 'Déploiement en cours...' && \
           sls deploy --stage local && \
           echo 'Déploiement terminé !' && \
           tail -f /dev/null"
