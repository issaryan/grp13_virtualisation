const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({
    region: 'us-east-1',
    endpoint: 'http://localhost:4566' // LocalStack endpoint
});

const docClient = new AWS.DynamoDB.DocumentClient();

module.exports = {
    // User operations
    async getUserByEmail(email) {
        const params = {
            TableName: 'Users',
            IndexName: 'EmailIndex',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: { ':email': email }
        };

        const result = await docClient.query(params).promise();
        return result.Items[0] || null;
    },

    async getUserByToken(token) {
        const params = {
            TableName: 'Connections',
            KeyConditionExpression: 'connectionId = :token',
            ExpressionAttributeValues: { ':token': token }
        };

        const result = await docClient.query(params).promise();
        if (!result.Items[0]) return null;

        return this.getUserById(result.Items[0].userId);
    },

    async getUserById(userId) {
        const params = {
            TableName: 'Users',
            Key: { userId }
        };

        const result = await docClient.get(params).promise();
        return result.Item || null;
    },

    async createUser(userData) {
        const newUser = {
            userId: uuidv4(),
            ...userData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const params = {
            TableName: 'Users',
            Item: newUser
        };

        await docClient.put(params).promise();
        return newUser;
    },

    // Quiz operations
    async getQuizzesByTeacher(teacherId) {
        const params = {
            TableName: 'Quizzes',
            IndexName: 'TeacherIndex',
            KeyConditionExpression: 'teacherId = :teacherId',
            ExpressionAttributeValues: { ':teacherId': teacherId }
        };

        const result = await docClient.query(params).promise();
        return result.Items;
    },

    async getQuizById(quizId) {
        const params = {
            TableName: 'Quizzes',
            Key: { quizId }
        };

        const result = await docClient.get(params).promise();
        return result.Item || null;
    },

    async createQuiz(quizData) {
        const newQuiz = {
            quizId: uuidv4(),
            ...quizData,
            isPublished: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const params = {
            TableName: 'Quizzes',
            Item: newQuiz
        };

        await docClient.put(params).promise();
        return newQuiz;
    },

    // Session operations
    async createSession(quizId, teacherId) {
        const sessionCode = this.generateSessionCode();
        const newSession = {
            sessionId: uuidv4(),
            quizId,
            teacherId,
            code: sessionCode,
            startTime: new Date().toISOString(),
            isActive: true,
            participants: []
        };

        const params = {
            TableName: 'Sessions',
            Item: newSession
        };

        await docClient.put(params).promise();
        return newSession;
    },

    async getSessionById(sessionId) {
        const params = {
            TableName: 'Sessions',
            Key: { sessionId }
        };

        const result = await docClient.get(params).promise();
        return result.Item || null;
    },

    async getSessionByCode(code) {
        const params = {
            TableName: 'Sessions',
            IndexName: 'CodeIndex',
            KeyConditionExpression: 'code = :code',
            ExpressionAttributeValues: { ':code': code }
        };

        const result = await docClient.query(params).promise();
        return result.Items[0] || null;
    },

    async addParticipantToSession(sessionId, userId) {
        const participant = {
            userId,
            joinedAt: new Date().toISOString(),
            answers: [],
            completed: false
        };

        const params = {
            TableName: 'Sessions',
            Key: { sessionId },
            UpdateExpression: 'SET participants = list_append(participants, :p)',
            ExpressionAttributeValues: {
                ':p': [participant]
            },
            ReturnValues: 'ALL_NEW'
        };

        const result = await docClient.update(params).promise();
        return result.Attributes;
    },

    // WebSocket connections
    async saveConnection(connectionId, userId) {
        const params = {
            TableName: 'Connections',
            Item: {
                connectionId,
                userId,
                connectedAt: new Date().toISOString()
            }
        };

        await docClient.put(params).promise();
        return connectionId;
    },

    async getTeacherConnections(teacherId) {
        const params = {
            TableName: 'Connections',
            IndexName: 'UserConnectionsIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: { ':userId': teacherId }
        };

        const result = await docClient.query(params).promise();
        return result.Items;
    },

    // Results operations
    async getSessionResults(sessionId) {
        const params = {
            TableName: 'Results',
            IndexName: 'SessionResultsIndex',
            KeyConditionExpression: 'sessionId = :sessionId',
            ExpressionAttributeValues: { ':sessionId': sessionId }
        };

        const result = await docClient.query(params).promise();
        return result.Items;
    },

    // Helper functions
    generateSessionCode() {
        const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return code;
    },

    // Ajouter dans le module exports
    async deleteConnection(connectionId) {
        const params = {
            TableName: 'Connections',
            Key: { connectionId }
        };

        await docClient.delete(params).promise();
        return true;
    },
};
