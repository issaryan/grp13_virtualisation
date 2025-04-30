// src/app/features/quiz/quiz.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuizService } from '../../core/services/quiz.service';
import { Quiz, Question } from '../../core/models/quiz.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="quiz">
      <h2>{{ quiz.title }}</h2>
      <p>{{ quiz.description }}</p>

      <div *ngIf="currentQuestion">
        <h3>Question {{ currentQuestionIndex + 1 }} of {{ quiz.questions.length }}</h3>
        <p>{{ currentQuestion.text }}</p>

        <div *ngFor="let option of currentQuestion.options">
          <input
              type="radio"
              [id]="option.id"
              [value]="option.id"
              [(ngModel)]="selectedOption"
          >
          <label [for]="option.id">{{ option.text }}</label>
        </div>

        <button (click)="submitAnswer()">Submit Answer</button>
      </div>

      <div *ngIf="!currentQuestion && !quizCompleted">
        <p>Loading quiz...</p>
      </div>

      <div *ngIf="quizCompleted">
        <h3>Quiz Completed!</h3>
        <p>Your score: {{ score }} / {{ maxScore }}</p>
      </div>
    </div>
  `,
  styles: []
})
export class QuizComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private quizService = inject(QuizService);

  quiz: Quiz | null = null;
  currentQuestion: Question | null = null;
  currentQuestionIndex = 0;
  selectedOption = '';
  score = 0;
  maxScore = 0;
  quizCompleted = false;

  ngOnInit(): void {
    const quizId = this.route.snapshot.paramMap.get('id');
    if (quizId) {
      this.loadQuiz(quizId);
    }
  }

  private async loadQuiz(quizId: string): Promise<void> {
    const quiz = await this.quizService.getQuiz(quizId).toPromise();
    if (quiz) {
      this.quiz = quiz;
      // Utiliser 0 si points non défini
      this.maxScore = quiz.questions.reduce(
          (sum, q) => sum + (q.points ?? 0),
          0
      );
      this.startQuiz();
    }
  }

  private startQuiz(): void {
    if (!this.quiz) {
      return;
    }
    this.currentQuestionIndex = 0;
    this.currentQuestion = this.quiz.questions[this.currentQuestionIndex];
  }

  submitAnswer(): void {
    if (!this.currentQuestion || !this.selectedOption) {
      return;
    }

    // Comparer à la bonne réponse, en traitant undefined
    const correctId = this.currentQuestion.correctOptionId ?? '';
    const isCorrect = this.selectedOption === correctId;
    if (isCorrect) {
      this.score += this.currentQuestion.points ?? 0;
    }

    this.nextQuestion();
  }

  private nextQuestion(): void {
    if (!this.quiz) {
      return;
    }

    this.currentQuestionIndex++;
    if (this.currentQuestionIndex < this.quiz.questions.length) {
      this.currentQuestion = this.quiz.questions[this.currentQuestionIndex];
      this.selectedOption = '';
    } else {
      this.completeQuiz();
    }
  }

  private completeQuiz(): void {
    this.currentQuestion = null;
    this.quizCompleted = true;
  }
}
