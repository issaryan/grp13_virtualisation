const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const db = require('../../db/dynamo-db');

// Create Quiz
exports.createQuizHandler = async (event) => {
    try {
        const user = event.requestContext.authorizer?.user;
        if (!user || user.role !== 'teacher') {
            return respond(403, { message: 'Accès refusé' });
        }

        const body = JSON.parse(event.body);
        const { title, description, questions } = body;

        if (!title || !description || !questions?.length) {
            return respond(400, { message: 'Champs requis manquants' });
        }

        const quizData = {
            quizId: uuidv4(),
            title,
            description,
            questions: questions.map(q => ({
                questionId: uuidv4(),
                ...q,
                options: q.options.map(opt => ({
                    optionId: uuidv4(),
                    ...opt
                }))
            })),
            createdBy: user.userId,
            isPublished: false,
            createdAt: new Date().toISOString()
        };

        const createdQuiz = await db.createQuiz(quizData);
        return respond(201, createdQuiz);

    } catch (error) {
        console.error('Create Quiz Error:', error);
        return respond(500, { message: 'Erreur interne du serveur' });
    }
};

// Get Quiz by ID
exports.getQuizHandler = async (event) => {
    try {
        const user = event.requestContext.authorizer?.user;
        const quizId = event.pathParameters?.id;

        const quiz = await db.getQuizById(quizId);
        if (!quiz) return respond(404, { message: 'Quiz non trouvé' });

        if (user.role === 'student' && !quiz.isPublished) {
            return respond(403, { message: 'Quiz non publié' });
        }

        if (user.role === 'teacher' && quiz.createdBy !== user.userId) {
            return respond(403, { message: 'Accès refusé' });
        }

        return respond(200, quiz);

    } catch (error) {
        console.error('Get Quiz Error:', error);
        return respond(500, { message: 'Erreur interne du serveur' });
    }
};

// Publish Quiz
exports.publishQuizHandler = async (event) => {
    try {
        const user = event.requestContext.authorizer?.user;
        if (!user || user.role !== 'teacher') {
            return respond(403, { message: 'Accès refusé' });
        }

        const quizId = event.pathParameters?.id;
        const quiz = await db.getQuizById(quizId);

        if (!quiz) return respond(404, { message: 'Quiz non trouvé' });
        if (quiz.createdBy !== user.userId) return respond(403, { message: 'Accès refusé' });

        const updatedQuiz = await db.updateQuiz(quizId, { isPublished: true });
        return respond(200, updatedQuiz);

    } catch (error) {
        console.error('Publish Quiz Error:', error);
        return respond(500, { message: 'Erreur interne du serveur' });
    }
};

// Get Quiz Statistics
exports.getStatsHandler = async (event) => {
    try {
        const user = event.requestContext.authorizer?.user;
        const quizId = event.pathParameters?.id;

        if (!user || user.role !== 'teacher') {
            return respond(403, { message: 'Accès refusé' });
        }

        const quiz = await db.getQuizById(quizId);
        if (!quiz || quiz.createdBy !== user.userId) {
            return respond(404, { message: 'Quiz non trouvé' });
        }

        const results = await db.getQuizResults(quizId);

        // Calcul des statistiques
        const stats = {
            totalParticipants: results.length,
            averageScore: calculateAverage(results),
            questionStats: calculateQuestionStats(quiz, results)
        };

        return respond(200, stats);

    } catch (error) {
        console.error('Get Stats Error:', error);
        return respond(500, { message: 'Erreur interne du serveur' });
    }
};

// Helper functions
const respond = (statusCode, body) => ({
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
});

const calculateAverage = (results) => {
    const total = results.reduce((sum, res) => sum + res.score, 0);
    return total / results.length || 0;
};

const calculateQuestionStats = (quiz, results) => {
    return quiz.questions.map(question => {
        const answers = results.flatMap(res =>
            res.answers.filter(a => a.questionId === question.questionId)
        );

        return {
            questionId: question.questionId,
            correctAnswers: answers.filter(a => a.correct).length,
            averageTime: answers.reduce((sum, a) => sum + a.timeSpent, 0) / answers.length || 0
        };
    });
};
