// Simple in-memory database for development and demo purposes

const { v4: uuidv4 } = require('uuid');

/**
 * In-memory database structure
 */
const db = {
  users: [],
  quizzes: [],
  sessions: [],
  results: [],
  tokens: {} // Maps tokens to user IDs
};

/**
 * User operations
 */
const getUserByEmail = (email) => {
  return db.users.find(user => user.email === email);
};

const getUserByToken = (token) => {
  const userId = db.tokens[token];
  if (!userId) return null;
  return db.users.find(user => user.id === userId);
};

const createUser = (userData) => {
  const newUser = {
    id: uuidv4(),
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  db.users.push(newUser);
  return newUser;
};

const createToken = (userId) => {
  // In a real app, this would create a proper JWT
  const token = uuidv4();
  db.tokens[token] = userId;
  return token;
};

/**
 * Quiz operations
 */
const getQuizzesByTeacher = (teacherId) => {
  return db.quizzes.filter(quiz => quiz.createdBy === teacherId);
};

const getQuizById = (quizId) => {
  return db.quizzes.find(quiz => quiz.id === quizId);
};

const createQuiz = (quizData) => {
  const newQuiz = {
    id: uuidv4(),
    ...quizData,
    isPublished: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  db.quizzes.push(newQuiz);
  return newQuiz;
};

const updateQuiz = (quizId, quizData) => {
  const index = db.quizzes.findIndex(quiz => quiz.id === quizId);
  
  if (index === -1) return null;
  
  db.quizzes[index] = {
    ...db.quizzes[index],
    ...quizData,
    updatedAt: new Date()
  };
  
  return db.quizzes[index];
};

const deleteQuiz = (quizId) => {
  const index = db.quizzes.findIndex(quiz => quiz.id === quizId);
  
  if (index === -1) return false;
  
  db.quizzes.splice(index, 1);
  return true;
};

/**
 * Session operations
 */
const createSession = (quizId, teacherId) => {
  const sessionCode = generateSessionCode();
  
  const newSession = {
    id: uuidv4(),
    quizId,
    teacherId,
    code: sessionCode,
    startTime: new Date(),
    isActive: true,
    participants: []
  };
  
  db.sessions.push(newSession);
  return newSession;
};

const getSessionById = (sessionId) => {
  return db.sessions.find(session => session.id === sessionId);
};

const getSessionByCode = (code) => {
  return db.sessions.find(session => session.code === code && session.isActive);
};

const addParticipantToSession = (sessionId, userId) => {
  const session = getSessionById(sessionId);
  
  if (!session) return null;
  
  // Check if participant already exists
  if (session.participants.find(p => p.userId === userId)) {
    return session;
  }
  
  const newParticipant = {
    userId,
    joinedAt: new Date(),
    answers: [],
    score: 0,
    completed: false
  };
  
  session.participants.push(newParticipant);
  return session;
};

const submitAnswer = (sessionId, userId, answer) => {
  const session = getSessionById(sessionId);
  
  if (!session) return null;
  
  const participantIndex = session.participants.findIndex(p => p.userId === userId);
  
  if (participantIndex === -1) return null;
  
  // Add the answer
  session.participants[participantIndex].answers.push({
    ...answer,
    answeredAt: new Date()
  });
  
  return session;
};

const completeQuiz = (sessionId, userId) => {
  const session = getSessionById(sessionId);
  
  if (!session) return null;
  
  const participantIndex = session.participants.findIndex(p => p.userId === userId);
  
  if (participantIndex === -1) return null;
  
  const participant = session.participants[participantIndex];
  const quiz = getQuizById(session.quizId);
  
  if (!quiz) return null;
  
  // Calculate score
  let correctAnswers = 0;
  let totalTimeSpent = 0;
  
  participant.answers.forEach(answer => {
    const question = quiz.questions.find(q => q.id === answer.questionId);
    
    if (question && answer.selectedOptionId === question.correctOptionId) {
      correctAnswers++;
    }
    
    totalTimeSpent += answer.timeSpent || 0;
  });
  
  const score = Math.round((correctAnswers / quiz.questions.length) * 100);
  const completedAt = new Date();
  
  // Update participant data
  participant.score = score;
  participant.completed = true;
  participant.completedAt = completedAt;
  
  // Create result record
  const result = {
    sessionId,
    quizId: session.quizId,
    userId,
    score,
    maxScore: quiz.questions.length,
    percentageScore: score,
    correctAnswers,
    totalQuestions: quiz.questions.length,
    timeSpent: totalTimeSpent,
    completedAt
  };
  
  db.results.push(result);
  
  return result;
};

const getSessionResults = (sessionId) => {
  return db.results.filter(result => result.sessionId === sessionId);
};

const getStudentResults = (studentId) => {
  return db.results.filter(result => result.userId === studentId);
};

const endSession = (sessionId) => {
  const session = getSessionById(sessionId);
  
  if (!session) return null;
  
  session.isActive = false;
  session.endTime = new Date();
  
  return session;
};

/**
 * Helper functions
 */
const generateSessionCode = () => {
  // Generate a 6-character alphanumeric code
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  
  return code;
};

module.exports = {
  // User operations
  getUserByEmail,
  getUserByToken,
  createUser,
  createToken,

  // Quiz operations
  getQuizzesByTeacher,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,

  // Session operations
  createSession,
  getSessionById,
  getSessionByCode,
  addParticipantToSession,
  submitAnswer,
  completeQuiz,
  getSessionResults,
  getStudentResults,
  endSession,

  // Direct data access (for testing and development)
  users: db.users,
  quizzes: db.quizzes,
  sessions: db.sessions,
  results: db.results,

  // ← add this line:
  tokens: db.tokens
};
