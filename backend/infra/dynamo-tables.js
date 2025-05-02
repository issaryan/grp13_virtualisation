const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-1',
    endpoint: 'http://localhost:4566' // LocalStack endpoint
});

const dynamo = new AWS.DynamoDB();

const createTable = async (params) => {
    try {
        await dynamo.createTable(params).promise();
        console.log(`Table ${params.TableName} créée`);
    } catch (error) {
        console.error(`Erreur création ${params.TableName}:`, error.message);
    }
};

const tables = [
    // Table Users
    {
        TableName: 'Users',
        KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
        AttributeDefinitions: [
            { AttributeName: 'userId', AttributeType: 'S' },
            { AttributeName: 'email', AttributeType: 'S' }
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
        GlobalSecondaryIndexes: [{
            IndexName: 'EmailIndex',
            KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
            Projection: { ProjectionType: 'ALL' },
            ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
        }]
    },

    // Table Quizzes
    {
        TableName: 'Quizzes',
        KeySchema: [{ AttributeName: 'quizId', KeyType: 'HASH' }],
        AttributeDefinitions: [
            { AttributeName: 'quizId', AttributeType: 'S' },
            { AttributeName: 'teacherId', AttributeType: 'S' }
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
        GlobalSecondaryIndexes: [{
            IndexName: 'TeacherIndex',
            KeySchema: [{ AttributeName: 'teacherId', KeyType: 'HASH' }],
            Projection: { ProjectionType: 'ALL' },
            ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
        }]
    },

    // Table Sessions
    {
        TableName: 'Sessions',
        KeySchema: [{ AttributeName: 'sessionId', KeyType: 'HASH' }],
        AttributeDefinitions: [
            { AttributeName: 'sessionId', AttributeType: 'S' },
            { AttributeName: 'code', AttributeType: 'S' },
            { AttributeName: 'isActive', AttributeType: 'BOOL' }
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
        GlobalSecondaryIndexes: [
            {
                IndexName: 'CodeIndex',
                KeySchema: [{ AttributeName: 'code', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'ALL' },
                ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
            },
            {
                IndexName: 'ActiveSessionsIndex',
                KeySchema: [
                    { AttributeName: 'isActive', KeyType: 'HASH' },
                    { AttributeName: 'sessionId', KeyType: 'RANGE' }
                ],
                Projection: { ProjectionType: 'ALL' },
                ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
            }
        ]
    },

    // Table Results
    {
        TableName: 'Results',
        KeySchema: [{ AttributeName: 'resultId', KeyType: 'HASH' }],
        AttributeDefinitions: [
            { AttributeName: 'resultId', AttributeType: 'S' },
            { AttributeName: 'sessionId', AttributeType: 'S' },
            { AttributeName: 'userId', AttributeType: 'S' }
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
        GlobalSecondaryIndexes: [
            {
                IndexName: 'SessionResultsIndex',
                KeySchema: [{ AttributeName: 'sessionId', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'ALL' },
                ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
            },
            {
                IndexName: 'UserResultsIndex',
                KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'ALL' },
                ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
            }
        ]
    },

    // Table Connections (pour WebSocket)
    {
        TableName: 'Connections',
        KeySchema: [{ AttributeName: 'connectionId', KeyType: 'HASH' }],
        AttributeDefinitions: [
            { AttributeName: 'connectionId', AttributeType: 'S' },
            { AttributeName: 'userId', AttributeType: 'S' }
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
        GlobalSecondaryIndexes: [{
            IndexName: 'UserConnectionsIndex',
            KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
            Projection: { ProjectionType: 'ALL' },
            ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
        }]
    }
];

// Création séquentielle des tables
const init = async () => {
    for (const table of tables) {
        await createTable(table);
    }
    console.log('Toutes les tables ont été créées !');
};

init().catch(console.error);
