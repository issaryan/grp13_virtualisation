// src/app/core/models/quiz.model.ts

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;       // pour marquer la bonne réponse (facultatif côté UI)
}

export interface Question {
  selectedAnswer?: string;
  id: string;
  text: string;
  options: QuestionOption[];
  correctOptionId?: string;
  points?: number;
  timeLimit?: number;
  validation?: {
    isValid: boolean;
    errors?: string[];
  };
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  timeLimit?: number;
  validation?: {
    isValid: boolean;
    errors?: {
      title?: string;
      questions?: QuestionValidation[];
    };
  };
}

export interface QuestionValidation {
  questionId: string;
  errors: string[];
}


export interface QuizSession {
  id: string;
  quizId: string;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  participants: QuizParticipant[];
  code: string;              // code pour rejoindre la session
}

export interface QuizParticipant {
  userId: string;
  joinedAt: Date;
  answers: ParticipantAnswer[];
  score: number;
  completed: boolean;
  completedAt?: Date;
}

export interface ParticipantAnswer {
  questionId: string;
  selectedOptionId: string;
  correct: boolean;
  timeSpent: number;         // en secondes
  answeredAt: Date;
}

export interface QuizResult {
  id: string;
  sessionId: string;
  quizId: string;
  quizTitle: string;         // titre du quiz
  userId: string;
  score: number;
  maxScore: number;
  percentageScore: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;         // en secondes
  completedAt: Date;
  questions: Question[];     // liste des questions avec options et selectedAnswer
}

export interface QuizStats {
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  totalParticipants: number;
  questionsStats: QuestionStat[];
}

export interface QuestionStat {
  questionId: string;
  questionText: string;
  correctPercentage: number;
  averageTimeSpent: number;  // en secondes
  optionDistribution: { [optionId: string]: number }; // distribution des réponses
}
