const db = require('../db/dynamo-db');
const { validateRequest } = require('../utils/validators');

exports.handler = async (event) => {
    try {
        // 1. Authentification et validation du rôle
        const user = event.requestContext?.authorizer?.user;
        if (!user || user.role !== 'teacher') {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Accès refusé. Rôle enseignant requis.' })
            };
        }

        // 2. Validation des données d'entrée
        const { error, data } = validateRequest(event.body, ['quizId']);
        if (error) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: error })
            };
        }
        const { quizId } = data;

        // 3. Récupération du quiz
        const quiz = await db.getQuizById(quizId);
        if (!quiz) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Quiz non trouvé' })
            };
        }

        // 4. Vérification des permissions
        if (quiz.createdBy !== user.userId) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Accès refusé. Ce quiz ne vous appartient pas.' })
            };
        }

        // 5. Vérification du statut de publication
        if (!quiz.isPublished) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Impossible de créer une session pour un quiz non publié' })
            };
        }

        // 6. Création de la session
        const session = await db.createSession(quizId, user.userId);

        // 7. Réponse formatée selon le standard existant
        return {
            statusCode: 201,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: session.sessionId,
                quizId: session.quizId,
                code: session.code,
                startTime: session.startTime,
                isActive: session.isActive
            })
        };

    } catch (error) {
        console.error('Erreur création session:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Erreur interne du serveur',
                ...(process.env.NODE_ENV === 'development' && { detail: error.message })
            })
        };
    }
};
