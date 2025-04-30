const db = require('../db/in-memory-db');

module.exports = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication required'));
    }
    
    const user = db.getUserByToken(token);
    
    if (!user) {
      return next(new Error('Invalid token'));
    }
    
    // Add user data to socket
    socket.user = user;
    next();
  });
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);
    
    // Join session room
    socket.on('join-session', ({ sessionId }) => {
      const session = db.getSessionById(sessionId);
      
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }
      
      // Add to room for this session
      socket.join(`session-${sessionId}`);
      
      // If student is joining, notify teacher
      if (socket.user.role === 'student') {
        const participant = session.participants.find(p => p.userId === socket.user.id);
        
        if (participant) {
          // Emit to teacher
          io.to(`session-${sessionId}`).emit('new-participant', participant);
        }
      }
      
      console.log(`${socket.user.role} joined session: ${sessionId}`);
    });
    
    // Leave session room
    socket.on('leave-session', ({ sessionId }) => {
      socket.leave(`session-${sessionId}`);
      console.log(`${socket.user.role} left session: ${sessionId}`);
    });
    
    // Submit answer
    socket.on('submit-answer', ({ sessionId, answer }) => {
      if (socket.user.role !== 'student') {
        socket.emit('error', { message: 'Only students can submit answers' });
        return;
      }
      
      const session = db.getSessionById(sessionId);
      
      if (!session || !session.isActive) {
        socket.emit('error', { message: 'Session not found or inactive' });
        return;
      }
      
      // Notify everyone in the session
      io.to(`session-${sessionId}`).emit('new-answer', {
        ...answer,
        studentId: socket.user.id
      });
    });
    
    // Start quiz
    socket.on('start-quiz', ({ sessionId }) => {
      if (socket.user.role !== 'teacher') {
        socket.emit('error', { message: 'Only teachers can start quizzes' });
        return;
      }
      
      const session = db.getSessionById(sessionId);
      
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }
      
      const quiz = db.getQuizById(session.quizId);
      
      if (!quiz || quiz.createdBy !== socket.user.id) {
        socket.emit('error', { message: 'Not your quiz' });
        return;
      }
      
      // Notify everyone in the session
      io.to(`session-${sessionId}`).emit('session-update', {
        ...session,
        status: 'started'
      });
    });
    
    // End quiz
    socket.on('end-quiz', ({ sessionId }) => {
      if (socket.user.role !== 'teacher') {
        socket.emit('error', { message: 'Only teachers can end quizzes' });
        return;
      }
      
      const session = db.getSessionById(sessionId);
      
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }
      
      const quiz = db.getQuizById(session.quizId);
      
      if (!quiz || quiz.createdBy !== socket.user.id) {
        socket.emit('error', { message: 'Not your quiz' });
        return;
      }
      
      const updatedSession = db.endSession(sessionId);
      
      // Notify everyone in the session
      io.to(`session-${sessionId}`).emit('session-update', {
        ...updatedSession,
        status: 'ended'
      });
    });
    
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });
};
