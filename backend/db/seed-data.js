// Seed the database with initial test data

const db = require('./dynamo-db');
const { v4: uuidv4 } = require('uuid');

module.exports = () => {
  console.log('Seeding database with test data...');
  
  // Create test users
  const teacherId = uuidv4();
  const studentId = uuidv4();
  
  db.users.push({
    id: teacherId,
    email: 'teacher@example.com',
    password: 'password123', // In a real app, this would be hashed
    firstName: 'John',
    lastName: 'Doe',
    role: 'teacher',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  db.users.push({
    id: studentId,
    email: 'student@example.com',
    password: 'password123', // In a real app, this would be hashed
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'student',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Create tokens for test users
  const teacherToken = uuidv4();
  const studentToken = uuidv4();
  
  db.tokens[teacherToken] = teacherId;
  db.tokens[studentToken] = studentId;
  
  console.log('\nTest Accounts:');
  console.log('Teacher: email=teacher@example.com, password=password123');
  console.log('Student: email=student@example.com, password=password123');
  
  // Create test quizzes
  const quizId1 = uuidv4();
  const quizId2 = uuidv4();
  
  // Quiz 1: Math Quiz
  db.quizzes.push({
    id: quizId1,
    title: 'Basic Mathematics Quiz',
    description: 'Test your knowledge of basic math concepts',
    questions: [
      {
        id: uuidv4(),
        text: 'What is 2 + 2?',
        options: [
          { id: uuidv4(), text: '3' },
          { id: uuidv4(), text: '4' },
          { id: uuidv4(), text: '5' },
          { id: uuidv4(), text: '22' }
        ],
        correctOptionId: '2', // This would be the actual ID of the option with text '4'
        points: 1
      },
      {
        id: uuidv4(),
        text: 'What is 10 - 5?',
        options: [
          { id: uuidv4(), text: '3' },
          { id: uuidv4(), text: '4' },
          { id: uuidv4(), text: '5' },
          { id: uuidv4(), text: '15' }
        ],
        correctOptionId: '3', // This would be the actual ID of the option with text '5'
        points: 1
      }
    ],
    createdBy: teacherId,
    createdAt: new Date(),
    updatedAt: new Date(),
    isPublished: true
  });
  
  // Quiz 2: Science Quiz
  db.quizzes.push({
    id: quizId2,
    title: 'Basic Science Quiz',
    description: 'Test your knowledge of basic science concepts',
    questions: [
      {
        id: uuidv4(),
        text: 'What is the chemical symbol for water?',
        options: [
          { id: uuidv4(), text: 'WA' },
          { id: uuidv4(), text: 'HO' },
          { id: uuidv4(), text: 'H2O' },
          { id: uuidv4(), text: 'W' }
        ],
        correctOptionId: '3', // This would be the actual ID of the option with text 'H2O'
        points: 1
      },
      {
        id: uuidv4(),
        text: 'What is the largest planet in our solar system?',
        options: [
          { id: uuidv4(), text: 'Earth' },
          { id: uuidv4(), text: 'Mars' },
          { id: uuidv4(), text: 'Jupiter' },
          { id: uuidv4(), text: 'Saturn' }
        ],
        correctOptionId: '3', // This would be the actual ID of the option with text 'Jupiter'
        points: 1
      }
    ],
    createdBy: teacherId,
    createdAt: new Date(),
    updatedAt: new Date(),
    isPublished: false
  });
  
  console.log('Database seeded successfully!');
};
