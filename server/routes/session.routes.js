const express = require('express');
const router = express.Router();
const db = require('../db/in-memory-db');

/**
 * @route POST /api/sessions
 * @desc Create a new quiz session
 * @access Private (Teacher only)
 */
router.post('/', (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied. Teacher role required.' });
  }
  
  const { quizId } = req.body;
  
  if (!quizId) {
    return res.status(400).json({ message: 'Please provide quizId' });
  }
  
  const quiz = db.getQuizById(quizId);
  
  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }
  
  if (quiz.createdBy !== req.user.id) {
    return res.status(403).json({ message: 'Access denied. Not your quiz.' });
  }
  
  if (!quiz.isPublished) {
    return res.status(400).json({ message: 'Cannot create session for unpublished quiz' });
  }
  
  const session = db.createSession(quizId, req.user.id);
  
  res.status(201).json(session);
});

/**
 * @route GET /api/sessions/:id
 * @desc Get a session by ID
 * @access Private
 */
router.get('/:id', (req, res) => {
  const session = db.getSessionById(req.params.id);
  
  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }
  
  // Teachers can only access their own sessions
  if (req.user.role === 'teacher') {
    const quiz = db.getQuizById(session.quizId);
    
    if (!quiz || quiz.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. Not your session.' });
    }
  }
  
  // Students can only access sessions they've joined
  if (req.user.role === 'student') {
    const isParticipant = session.participants.some(p => p.userId === req.user.id);
    
    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied. You have not joined this session.' });
    }
  }
  
  res.json(session);
});

/**
 * @route POST /api/sessions/join
 * @desc Join a session using a code
 * @access Private (Student only)
 */
router.post('/join', (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied. Student role required.' });
  }
  
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ message: 'Please provide session code' });
  }
  
  const session = db.getSessionByCode(code);
  
  if (!session) {
    return res.status(404).json({ message: 'Session not found or inactive' });
  }
  
  const updatedSession = db.addParticipantToSession(session.id, req.user.id);
  
  res.json(updatedSession);
});

/**
 * @route POST /api/sessions/:id/answer
 * @desc Submit an answer for a question
 * @access Private (Student only)
 */
router.post('/:id/answer', (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied. Student role required.' });
  }
  
  const session = db.getSessionById(req.params.id);
  
  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }
  
  if (!session.isActive) {
    return res.status(400).json({ message: 'Session is not active' });
  }
  
  const participant = session.participants.find(p => p.userId === req.user.id);
  
  if (!participant) {
    return res.status(403).json({ message: 'Access denied. You have not joined this session.' });
  }
  
  if (participant.completed) {
    return res.status(400).json({ message: 'You have already completed this quiz' });
  }
  
  const { questionId, selectedOptionId, timeSpent } = req.body;
  
  if (!questionId || !selectedOptionId) {
    return res.status(400).json({ message: 'Please provide questionId and selectedOptionId' });
  }
  
  const quiz = db.getQuizById(session.quizId);
  const question = quiz.questions.find(q => q.id === questionId);
  
  if (!question) {
    return res.status(404).json({ message: 'Question not found' });
  }
  
  // Check if question has already been answered
  const existingAnswer = participant.answers.find(a => a.questionId === questionId);
  
  if (existingAnswer) {
    return res.status(400).json({ message: 'You have already answered this question' });
  }
  
  const answer = {
    questionId,
    selectedOptionId,
    timeSpent: timeSpent || 0,
    correct: selectedOptionId === question.correctOptionId
  };
  
  db.submitAnswer(session.id, req.user.id, answer);
  
  res.json({ message: 'Answer submitted successfully' });
});

/**
 * @route POST /api/sessions/:id/complete
 * @desc Complete a quiz session
 * @access Private (Student only)
 */
router.post('/:id/complete', (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied. Student role required.' });
  }
  
  const session = db.getSessionById(req.params.id);
  
  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }
  
  const participant = session.participants.find(p => p.userId === req.user.id);
  
  if (!participant) {
    return res.status(403).json({ message: 'Access denied. You have not joined this session.' });
  }
  
  if (participant.completed) {
    return res.status(400).json({ message: 'You have already completed this quiz' });
  }
  
  const result = db.completeQuiz(session.id, req.user.id);
  
  res.json(result);
});

/**
 * @route PATCH /api/sessions/:id/end
 * @desc End a quiz session
 * @access Private (Teacher only)
 */
router.patch('/:id/end', (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied. Teacher role required.' });
  }
  
  const session = db.getSessionById(req.params.id);
  
  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }
  
  const quiz = db.getQuizById(session.quizId);
  
  if (!quiz || quiz.createdBy !== req.user.id) {
    return res.status(403).json({ message: 'Access denied. Not your session.' });
  }
  
  if (!session.isActive) {
    return res.status(400).json({ message: 'Session is already ended' });
  }
  
  const updatedSession = db.endSession(session.id);
  
  res.json(updatedSession);
});

/**
 * @route GET /api/sessions/:id/results
 * @desc Get results for a session
 * @access Private (Teacher only)
 */
router.get('/:id/results', (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied. Teacher role required.' });
  }
  
  const session = db.getSessionById(req.params.id);
  
  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }
  
  const quiz = db.getQuizById(session.quizId);
  
  if (!quiz || quiz.createdBy !== req.user.id) {
    return res.status(403).json({ message: 'Access denied. Not your session.' });
  }
  
  const results = db.getSessionResults(session.id);
  
  res.json(results);
});

module.exports = router;
