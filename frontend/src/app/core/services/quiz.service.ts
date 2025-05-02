// src/app/core/services/quiz.service.ts
import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Quiz,
  QuizSession,
  QuizResult,
  QuizStats,
  Question,
  ParticipantAnswer
} from '../models/quiz.model';
import {ToastService} from "../../shared/services/toast.service";

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private api = environment.apiUrl;
  private sessionsApi = `${environment.apiUrl}/sessions`;

  constructor(
      private http: HttpClient,
      private toast: ToastService
  ) { }

  private handleError(error: HttpErrorResponse) {
    const message = error.error?.message || 'Une erreur inattendue est survenue';
    this.toast.showError(message);
    return throwError(() => new Error(message));
  }

  // Teacher endpoints
  getTeacherQuizzes(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.api}/teacher`).pipe(
        catchError(this.handleError)
    );
  }

  getQuiz(id: string): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.api}/${id}`).pipe(
        catchError(this.handleError)
    );
  }

  createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Observable<Quiz> {
    return this.http.post<Quiz>(this.api, quiz).pipe(
        catchError(this.handleError)
    );
  }

  updateQuiz(id: string, quiz: Partial<Quiz>): Observable<Quiz> {
    return this.http.put<Quiz>(`${this.api}/${id}`, quiz).pipe(
        catchError(this.handleError)
    );
  }

  deleteQuiz(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(
        catchError(this.handleError)
    );
  }

  publishQuiz(id: string): Observable<Quiz> {
    return this.http.patch<Quiz>(`${this.api}/${id}/publish`, {}).pipe(
        catchError(this.handleError)
    );
  }

  // Session management
  createSession(quizId: string): Observable<QuizSession> {
    return this.http.post<QuizSession>(this.sessionsApi, { quizId }).pipe(
        catchError(this.handleError)
    );
  }

  getSession(id: string): Observable<QuizSession> {
    return this.http.get<QuizSession>(`${this.sessionsApi}/${id}`).pipe(
        catchError(this.handleError)
    );
  }

  endSession(id: string): Observable<QuizSession> {
    return this.http.patch<QuizSession>(`${this.sessionsApi}/${id}/end`, {}).pipe(
        catchError(this.handleError)
    );
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
