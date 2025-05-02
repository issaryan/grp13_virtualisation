const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../../db/dynamo-db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
const SALT_ROUNDS = 10;

// Login Handler
exports.loginHandler = async (event) => {
    try {
        const { email, password } = JSON.parse(event.body);

        if (!email || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Email et mot de passe requis' })
            };
        }

        const user = await db.getUserByEmail(email);

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Identifiants invalides' })
            };
        }

        const token = jwt.sign(
            { userId: user.userId, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        const { password: _, ...userWithoutPassword } = user;

        return {
            statusCode: 200,
            body: JSON.stringify({
                user: userWithoutPassword,
                token
            })
        };

    } catch (error) {
        console.error('Login error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erreur interne du serveur' })
        };
    }
};

// Registration Handler
exports.registerHandler = async (event) => {
    try {
        const { email, password, firstName, lastName, role } = JSON.parse(event.body);

        if (!email || !password || !firstName || !lastName || !role) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Tous les champs sont requis' })
            };
        }

        if (!['teacher', 'student'].includes(role)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Rôle invalide' })
            };
        }

        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Utilisateur déjà existant' })
            };
        }

        const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);

        const newUser = await db.createUser({
            userId: uuidv4(),
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role,
            createdAt: new Date().toISOString()
        });

        const token = jwt.sign(
            { userId: newUser.userId, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        const { password: _, ...userWithoutPassword } = newUser;

        return {
            statusCode: 201,
            body: JSON.stringify({
                user: userWithoutPassword,
                token
            })
        };

    } catch (error) {
        console.error('Registration error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erreur interne du serveur' })
        };
    }
};

// Logout Handler
exports.logoutHandler = async (event) => {
    // Implémentation optionnelle (invalidation JWT côté client)
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Déconnexion réussie' })
    };
};
