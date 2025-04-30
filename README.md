# Real-Time Quiz Application

A comprehensive real-time quiz application with an Angular 19 frontend and Node.js backend.

## Features

- Teacher portal for quiz creation and management
- Student portal for quiz participation
- Real-time quiz sessions with WebSocket integration
- Detailed statistics and results analysis
- Responsive design for all devices

## Technology Stack

### Frontend
- Angular 19
- RxJS
- Socket.io client

### Backend
- Node.js
- Express
- Socket.io
- In-memory database (simulating DynamoDB)

### Deployment
- Docker
- Docker Compose

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm (v7+)
- Docker (optional, for containerized deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/real-time-quiz-app.git
cd real-time-quiz-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

This will start both the Angular frontend and Node.js backend concurrently.

- Frontend: http://localhost:4200
- Backend: http://localhost:3000

### Test Accounts

The application is seeded with test accounts for demonstration:

- Teacher:
  - Email: teacher@example.com
  - Password: password123

- Student:
  - Email: student@example.com
  - Password: password123

## Docker Deployment

To run the application using Docker:

```bash
# Build the Docker image
npm run docker:build

# Start the container
npm run docker:up
```

## Project Structure

```
├── src/                      # Angular frontend
│   ├── app/
│   │   ├── core/             # Core module (services, models, guards)
│   │   ├── features/         # Feature modules
│   │   │   ├── auth/         # Authentication
│   │   │   ├── teacher/      # Teacher portal
│   │   │   └── student/      # Student portal
│   │   └── shared/           # Shared components
│   ├── environments/         # Environment configurations
│   └── assets/               # Static assets
├── server/                   # Node.js backend
│   ├── db/                   # Database layer
│   ├── routes/               # API routes
│   ├── socket/               # WebSocket handlers
│   └── index.js              # Server entry point
└── docker-compose.yml        # Docker configuration
```

## API Documentation

### Authentication

- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/register` - Register new user

### Quizzes

- `GET /api/quizzes/teacher` - Get all quizzes created by the teacher
- `GET /api/quizzes/:id` - Get a quiz by ID
- `POST /api/quizzes` - Create a new quiz
- `PUT /api/quizzes/:id` - Update a quiz
- `DELETE /api/quizzes/:id` - Delete a quiz
- `PATCH /api/quizzes/:id/publish` - Publish a quiz
- `GET /api/quizzes/:id/stats` - Get statistics for a quiz

### Sessions

- `POST /api/sessions` - Create a new quiz session
- `GET /api/sessions/:id` - Get a session by ID
- `POST /api/sessions/join` - Join a session using a code
- `POST /api/sessions/:id/answer` - Submit an answer for a question
- `POST /api/sessions/:id/complete` - Complete a quiz session
- `PATCH /api/sessions/:id/end` - End a quiz session
- `GET /api/sessions/:id/results` - Get results for a session

### Results

- `GET /api/results/student/:studentId` - Get all results for a student

## WebSocket Events

### Client to Server

- `join-session` - Join a session room
- `leave-session` - Leave a session room
- `submit-answer` - Submit an answer
- `start-quiz` - Start a quiz
- `end-quiz` - End a quiz

### Server to Client

- `session-update` - Session state has been updated
- `new-participant` - A new participant has joined
- `new-answer` - A new answer has been submitted
- `error` - Error message

## License

This project is licensed under the MIT License - see the LICENSE file for details.
