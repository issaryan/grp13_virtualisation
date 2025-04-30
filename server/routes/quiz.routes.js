const express = require('express');
const router = express.Router();
const db = require('../db/in-memory-db');

/**
 * @route GET /api/quizzes/teacher
 * @desc Get all quizzes created by the teacher
 * @access Private (Teacher only)
 */
router.get('/teacher', (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied. Teacher role required.' });
  }
  
  const quizzes = db.getQuizzesByTeacher(req.user.id);
  res.json(quizzes);
});

/**
 * @route GET /api/quizzes/:id
 * @desc Get a quiz by ID
 * @access Private
 */
router.get('/:id', (req, res) => {
  const quiz = db.getQuizById(req.params.id);
  
  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }
  
  // Students can only access published quizzes
  if (req.user.role === 'student' && !quiz.isPublished) {
    return res.status(403).json({ message: 'Access denied. Quiz is not published.' });
  }
  
  // Teachers can only access their own quizzes
  if (req.user.role === 'teacher' && quiz.createdBy !== req.user.id) {
    return res.status(403).json({ message: 'Access denied. Not your quiz.' });
  }
  
  res.json(quiz);
});

/**
 * @route POST /api/quizzes
 * @desc Create a new quiz
 * @access Private (Teacher only)
 */
router.post('/', (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied. Teacher role required.' });
  }
  
  const { title, description, questions } = req.body;
  
  if (!title || !description || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ message: 'Please provide title, description, and at least one question' });
  }
  
  const newQuiz = db.createQuiz({
    title,
    description,
    questions,
    createdBy: req.user.id
  });
  
  res.status(201).json(newQuiz);
});

/**
 * @route PUT /api/quizzes/:id
 * @desc Update a quiz
 * @access Private (Teacher only)
 */
router.put('/:id', (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied. Teacher role required.' });
  }
  
  const quiz = db.getQuizById(req.params.id);
  
  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }
  
  if (quiz.createdBy !== req.user.id) {
    return res.status(403).json({ message: 'Access denied. Not your quiz.' });
  }
  
  // Cannot update published quizzes
  if (quiz.isPublished) {
    return res.status(400).json({ message: 'Cannot update a published quiz' });
  }
  
  const { title, description, questions } = req.body;
  
  if (!title || !description || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ message: 'Please provide title, description, and at least one question' });
  }
  
  const updatedQuiz = db.updateQuiz(req.params.id, {
    title,
    description,
    questions
  });
  
  res.json(updatedQuiz);
});

/**
 * @route DELETE /api/quizzes/:id
 * @desc Delete a quiz
 * @access Private (Teacher only)
 */
router.delete('/:id', (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied. Teacher role required.' });
  }
  
  const quiz = db.getQuizById(req.params.id);
  
  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }
  
  if (quiz.createdBy !== req.user.id) {
    return res.status(403).json({ message: 'Access denied. Not your quiz.' });
  }
  
  const deleted = db.deleteQuiz(req.params.id);
  
  if (deleted) {
    res.status(204).end();
  } else {
    res.status(500).json({ message: 'Failed to delete quiz' });
  }
});

/**
 * @route PATCH /api/quizzes/:id/publish
 * @desc Publish a quiz
 * @access Private (Teacher only)
 */
router.patch('/:id/publish', (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied. Teacher role required.' });
  }
  
  const quiz = db.getQuizById(req.params.id);
  
  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }
  
  if (quiz.createdBy !== req.user.id) {
    return res.status(403).json({ message: 'Access denied. Not your quiz.' });
  }
  
  if (quiz.isPublished) {
    return res.status(400).json({ message: 'Quiz is already published' });
  }
  
  const updatedQuiz = db.updateQuiz(req.params.id, {
    isPublished: true
  });
  
  res.json(updatedQuiz);
});

/**
 * @route GET /api/quizzes/:id/stats
 * @desc Get statistics for a quiz
 * @access Private (Teacher only)
 */
router.get('/:id/stats', (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied. Teacher role required.' });
  }
  
  const quiz = db.getQuizById(req.params.id);
  
  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }
  
  if (quiz.createdBy !== req.user.id) {
    return res.status(403).json({ message: 'Access denied. Not your quiz.' });
  }
  
  // TODO: Implement actual statistics calculation
  // For demo purposes, we'll return dummy data
  const quizStats = {
    averageScore: 75,
    highestScore: 95,
    lowestScore: 60,
    totalParticipants: 12,
    questionsStats: quiz.questions.map(q => ({
      questionId: q.id,
      questionText: q.text,
      correctPercentage: Math.round(Math.random() * 100),
      averageTimeSpent: Math.round(Math.random() * 60),
      optionDistribution: q.options.reduce((acc, opt) => {
        acc[opt.id] = Math.round(Math.random() * 100);
        return acc;
      }, {})
    }))
  };
  
  res.json(quizStats);
});

module.exports = router;
