const AWS = require('aws-sdk');
const db = require('../db/dynamo-db');
const { v4: uuidv4 } = require('uuid');

const apigw = new AWS.ApiGatewayManagementApi({
    endpoint: process.env.APIGW_ENDPOINT || 'http://localhost:4566'
});

const sns = new AWS.SNS({
    endpoint: process.env.SNS_ENDPOINT || 'http://localhost:4566'
});

const handleConnection = async (connectionId, token) => {
    try {
        const user = await db.getUserByToken(token);
        if (!user) throw new Error('Invalid token');

        await db.saveConnection(connectionId, user.userId);
        return { statusCode: 200 };
    } catch (error) {
        console.error('Connection error:', error);
        return { statusCode: 401 };
    }
};

const handleJoinSession = async (connectionId, data) => {
    const session = await db.getSessionByCode(data.code);
    const user = await db.getUserByToken(data.token);

    if (!session || !session.isActive) {
        await sendMessage(connectionId, {
            type: 'ERROR',
            message: 'Session inactive ou introuvable'
        });
        return;
    }

    if (user.role === 'student') {
        const updatedSession = await db.addParticipantToSession(session.sessionId, user.userId);

        // Notify teacher
        const teacherConnections = await db.getTeacherConnections(session.teacherId);
        await Promise.all(teacherConnections.map(conn =>
            sendMessage(conn.connectionId, {
                type: 'PARTICIPANT_JOINED',
                participant: {
                    userId: user.userId,
                    firstName: user.firstName,
                    lastName: user.lastName
                }
            })
        ));
    }

    await sendMessage(connectionId, {
        type: 'SESSION_JOINED',
        sessionId: session.sessionId,
        quizId: session.quizId
    });
};

const handleSubmitAnswer = async (connectionId, data) => {
    const user = await db.getUserByToken(data.token);
    const session = await db.getSessionById(data.sessionId);

    if (user.role !== 'student') {
        return sendError(connectionId, 'Seuls les étudiants peuvent soumettre des réponses');
    }

    if (!session.isActive) {
        return sendError(connectionId, 'La session est terminée');
    }

    // Broadcast answer to teacher
    const teacherConnections = await db.getTeacherConnections(session.teacherId);
    await Promise.all(teacherConnections.map(conn =>
        sendMessage(conn.connectionId, {
            type: 'NEW_ANSWER',
            answer: data.answer,
            studentId: user.userId,
            questionId: data.questionId
        })
    ));

    await sendMessage(connectionId, {
        type: 'ANSWER_ACCEPTED',
        questionId: data.questionId
    });
};

const handleEndQuiz = async (connectionId, data) => {
    const user = await db.getUserByToken(data.token);
    const session = await db.getSessionById(data.sessionId);

    if (user.role !== 'teacher' || session.teacherId !== user.userId) {
        return sendError(connectionId, 'Action non autorisée');
    }

    // Update session status
    await db.endSession(session.sessionId);

    // Broadcast end session
    const participants = await db.getSessionParticipants(session.sessionId);
    await Promise.all(participants.map(p =>
        sendMessage(p.connectionId, {
            type: 'SESSION_ENDED',
            sessionId: session.sessionId
        })
    ));

    // Publish results to SNS
    const results = await db.getSessionResults(session.sessionId);
    await sns.publish({
        TopicArn: `arn:aws:sns:us-east-1:000000000000:quiz-results-${session.sessionId}`,
        Message: JSON.stringify(results),
        MessageAttributes: {
            sessionId: { DataType: 'String', StringValue: session.sessionId }
        }
    }).promise();
};

const sendMessage = async (connectionId, message) => {
    try {
        await apigw.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify(message)
        }).promise();
    } catch (error) {
        console.error('Failed to send message:', error);
    }
};

const sendError = (connectionId, message) =>
    sendMessage(connectionId, { type: 'ERROR', message });

exports.handler = async (event) => {
    const { connectionId, routeKey } = event.requestContext;
    const body = event.body ? JSON.parse(event.body) : {};

    try {
        switch(routeKey) {
            case '$connect':
                return handleConnection(connectionId, event.queryStringParameters?.token);

            case '$disconnect':
                await db.deleteConnection(connectionId);
                return { statusCode: 200 };

            case 'joinSession':
                await handleJoinSession(connectionId, body);
                break;

            case 'submitAnswer':
                await handleSubmitAnswer(connectionId, body);
                break;

            case 'endQuiz':
                await handleEndQuiz(connectionId, body);
                break;

            default:
                await sendError(connectionId, 'Action non reconnue');
        }

        return { statusCode: 200 };
    } catch (error) {
        console.error('WebSocket error:', error);
        await sendError(connectionId, 'Erreur interne du serveur');
        return { statusCode: 500 };
    }
};
