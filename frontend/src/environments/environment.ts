export const environment = {
  production: false,

  wsUrl: 'http://localhost:3000',
  apiUrl: 'http://localhost:3000/api',
  // Configuration API Serverless
  api: {
    baseUrl: 'http://localhost:4566/restapis/<api-id>/dev/_user_request_',
    endpoints: {
      sessions: '/api/sessions',
      quizzes: '/api/quizzes',
      auth: '/api/auth'
    }
  },

  // Configuration WebSocket
  websocket: {
    endpoint: 'ws://localhost:4510',
    routes: {
      joinSession: 'joinSession',
      submitAnswer: 'submitAnswer'
    }
  }
};
