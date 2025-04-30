const express = require('express');
const router = express.Router();
const db = require('../db/in-memory-db');

/**
 * @route GET /api/results/student/:studentId
 * @desc Get all results for a student
 * @access Private
 */
router.get('/student/:studentId', (req, res) => {
  const studentId = req.params.studentId;
  
  // Students can only access their own results
  if (req.user.role === 'student' && studentId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied. Not your results.' });
  }
  
  // Check if student exists
  const student = db.users.find(user => user.id === studentId && user.role === 'student');
  
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }
  
  // Get results
  const results = db.getStudentResults(studentId);
  
  res.json(results);
});

module.exports = router;
