// src/app/core/services/quiz.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Quiz,
  QuizSession,
  QuizResult,
  QuizStats,
  ParticipantAnswer
} from '../models/quiz.model';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Teacher endpoints
  getTeacherQuizzes(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.api}/quizzes/teacher`);
  }

  getQuiz(id: string): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.api}/quizzes/${id}`);
  }

  createQuiz(quiz: Partial<Quiz>): Observable<Quiz> {
    return this.http.post<Quiz>(`${this.api}/quizzes`, quiz);
  }

  updateQuiz(id: string, quiz: Partial<Quiz>): Observable<Quiz> {
    return this.http.put<Quiz>(`${this.api}/quizzes/${id}`, quiz);
  }

  deleteQuiz(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/quizzes/${id}`);
  }

  publishQuiz(id: string): Observable<Quiz> {
    return this.http.patch<Quiz>(`${this.api}/quizzes/${id}/publish`, {});
  }

  // Quiz session endpoints
  createSession(quizId: string): Observable<QuizSession> {
    return this.http.post<QuizSession>(`${this.api}/sessions`, { quizId });
  }

  getSession(id: string): Observable<QuizSession> {
    return this.http.get<QuizSession>(`${this.api}/sessions/${id}`);
  }

  endSession(id: string): Observable<QuizSession> {
    return this.http.patch<QuizSession>(`${this.api}/sessions/${id}/end`, {});
  }

  /** Récupère toutes les sessions d'un quiz donné */
  getSessions(quizId: string): Observable<QuizSession[]> {
    return this.http.get<QuizSession[]>(
        `${this.api}/quizzes/${quizId}/sessions`
    );
  }

  // Student endpoints
  joinSession(code: string): Observable<QuizSession> {
    return this.http.post<QuizSession>(`${this.api}/sessions/join`, { code });
  }

  submitAnswer(sessionId: string, answer: ParticipantAnswer): Observable<void> {
    return this.http.post<void>(
        `${this.api}/sessions/${sessionId}/answer`,
        answer
    );
  }

  completeQuiz(sessionId: string): Observable<QuizResult> {
    return this.http.post<QuizResult>(
        `${this.api}/sessions/${sessionId}/complete`,
        {}
    );
  }

  // Results endpoints
  getSessionResults(sessionId: string): Observable<QuizResult[]> {
    return this.http.get<QuizResult[]>(
        `${this.api}/sessions/${sessionId}/results`
    );
  }

  getStudentResults(studentId: string): Observable<QuizResult[]> {
    return this.http.get<QuizResult[]>(
        `${this.api}/results/student/${studentId}`
    );
  }

  getQuizStats(quizId: string): Observable<QuizStats> {
    return this.http.get<QuizStats>(`${this.api}/quizzes/${quizId}/stats`);
  }
}
