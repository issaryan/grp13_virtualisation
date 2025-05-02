const AWS = require('aws-sdk');
const db = require('../db/dynamo-db');

AWS.config.update({
    region: 'us-east-1',
    endpoint: process.env.SNS_ENDPOINT || 'http://localhost:4566'
});

const sns = new AWS.SNS();

exports.handler = async (event) => {
    try {
        // 1. Valider l'entrée
        const sessionId = event.pathParameters?.id;
        if (!sessionId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Session ID manquant' })
            };
        }

        // 2. Récupérer les résultats
        const results = await db.getSessionResults(sessionId);

        // 3. Publier sur SNS
        const params = {
            TopicArn: `arn:aws:sns:us-east-1:000000000000:QuizResults`,
            Message: JSON.stringify({
                metadata: {
                    sessionId,
                    totalParticipants: results.length,
                    timestamp: new Date().toISOString()
                },
                results
            }),
            MessageAttributes: {
                sessionId: {
                    DataType: 'String',
                    StringValue: sessionId
                }
            }
        };

        const result = await sns.publish(params).promise();

        // 4. Formater la réponse
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Résultats publiés avec succès',
                messageId: result.MessageId,
                participantCount: results.length
            })
        };

    } catch (error) {
        console.error('Erreur publication résultats:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Échec de la publication des résultats',
                ...(process.env.NODE_ENV === 'development' && { error: error.message })
            })
        };
    }
};
