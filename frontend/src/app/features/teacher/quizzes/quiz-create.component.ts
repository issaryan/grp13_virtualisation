import { Component } from '@angular/core';
import { QuizService } from '../../../core/services/quiz.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Quiz, Question, QuestionOption } from "../../../core/models/quiz.model";
import { v4 as uuidv4 } from 'uuid';
import { ToastService } from "../../../shared/services/toast.service";

@Component({
  selector: 'app-quiz-create',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="quiz-creation-container">
      <h1 class="page-title">Création d'un nouveau quiz</h1>

      <form #form="ngForm" (ngSubmit)="handleSubmit()" class="quiz-form">
        <!-- Title Section -->
        <div class="form-section card">
          <label class="section-label">Titre du quiz</label>
          <input
              type="text"
              [(ngModel)]="quizData.title"
              name="title"
              required
              class="form-input"
              placeholder="Ex: Culture Générale Avancée">
        </div>

        <!-- Description Section -->
        <div class="form-section card">
          <label class="section-label">Description</label>
          <textarea
              [(ngModel)]="quizData.description"
              name="description"
              class="form-textarea"
              rows="3"
              placeholder="Décrivez le thème et les objectifs du quiz..."></textarea>
        </div>

        <!-- Questions Section -->
        <div class="questions-section card">
          <div class="section-header">
            <h3 class="section-title">
              <i class="icon-question"></i>
              Questions
            </h3>
            <button
                type="button"
                (click)="addNewQuestion()"
                class="btn-add-section">
              <i class="icon-add"></i>
              Nouvelle question
            </button>
          </div>

          <div *ngFor="let question of quizData.questions; let qIdx = index"
               class="question-card">
            <div class="question-header">
              <div class="question-number">Question {{ qIdx + 1 }}</div>
              <button
                  type="button"
                  (click)="removeQuestion(qIdx)"
                  class="btn-remove">
                <i class="icon-delete"></i>
              </button>
            </div>

            <input
                type="text"
                [(ngModel)]="question.text"
                [name]="'question_' + qIdx"
                required
                class="question-input"
                placeholder="Énoncé de la question">

            <!-- Options -->
            <div class="options-section">
              <div class="options-header">
                <span>Options de réponse</span>
                <small>Cliquez sur le rond pour marquer la bonne réponse</small>
              </div>

              <div *ngFor="let option of question.options; let oIdx = index"
                   class="option-row">
                <div class="option-content">
                  <input
                      type="text"
                      [(ngModel)]="option.text"
                      [name]="'option_' + qIdx + '_' + oIdx"
                      required
                      class="option-input"
                      placeholder="Texte de l'option">
                  <div class="option-controls">
                    <div class="radio-container">
                      <input
                          type="radio"
                          [name]="'correctAnswer_' + qIdx"
                          [checked]="option.id === question.correctOptionId"
                          (change)="setCorrectAnswer(question, option.id)"
                          class="correct-radio">
                      <span class="radio-checkmark"></span>
                    </div>
                    <button
                        type="button"
                        (click)="removeOption(qIdx, oIdx)"
                        class="btn-remove-option">
                      <i class="icon-clear"></i>
                    </button>
                  </div>
                </div>
              </div>

              <button
                  type="button"
                  (click)="addNewOption(question)"
                  class="btn-add-option">
                <i class="icon-add"></i>
                Ajouter une option
              </button>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button
              type="submit"
              [disabled]="form.invalid || isSubmitting"
              class="btn-submit">
            <span *ngIf="!isSubmitting">Valider la création</span>
            <span *ngIf="isSubmitting" class="loading-indicator">
              <div class="spinner"></div>
              Création en cours...
            </span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    /* quiz-create.component.css */
    :root {
      --primary-color: #2196F3;
      --secondary-color: #FF4081;
      --background-light: #f8f9fa;
      --text-dark: #2c3e50;
      --border-radius: 8px;
      --box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .quiz-creation-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    .page-title {
      text-align: center;
      margin-bottom: 2rem;
      font-weight: 600;
      font-size: 2rem;
    }

    .card {
      background: white;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .form-section {
      margin-bottom: 2rem;
    }

    .section-label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .form-input, .form-textarea {
      width: 100%;
      padding: 0.8rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .form-input:focus, .form-textarea:focus {
      box-shadow: 0 0 0 3px rgba(33,150,243,0.1);
      outline: none;
    }

    .questions-section .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .btn-add-section {
      color: white;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: opacity 0.3s;
    }

    .btn-add-section:hover {
      opacity: 0.9;
    }

    .question-card {
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      animation: slideIn 0.3s ease;
    }

    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .question-number {
      font-weight: 500;
      font-size: 0.9rem;
    }

    .btn-remove {
      background: none;
      border: none;
      color: #e74c3c;
      cursor: pointer;
      padding: 0.3rem;
    }

    .options-section {
      margin-top: 1rem;
    }

    .option-row {
      margin-bottom: 0.8rem;
    }

    .option-content {
      display: flex;
      gap: 0.8rem;
      align-items: center;
    }

    .option-input {
      flex-grow: 1;
      padding: 0.6rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .option-controls {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .radio-container {
      position: relative;
    }

    .correct-radio {
      opacity: 0;
      position: absolute;
    }

    .radio-checkmark {
      display: block;
      width: 20px;
      height: 20px;
      border: 2px solid #ccc;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .correct-radio:checked + .radio-checkmark {
      box-shadow: inset 0 0 0 3px white;
    }

    .btn-add-option {
      background: none;
      border: 1px dashed #ccc;
      width: 100%;
      padding: 0.6rem;
      margin-top: 0.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #666;
    }

    .btn-add-option:hover {
    }

    .btn-submit {
      color: white;
      border: none;
      padding: 1rem 2rem;
      font-size: 1.1rem;
      width: 100%;
      cursor: pointer;
      transition: opacity 0.3s;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.8rem;
    }

    .btn-submit:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .loading-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.8rem;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s linear infinite;
    }

    @keyframes slideIn {
      from { transform: translateY(10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .quiz-creation-container {
        padding: 0 0.5rem;
      }

      .question-content {
        flex-direction: column;
        gap: 0.5rem;
      }

      .btn-add-section {
        width: 100%;
        justify-content: center;
      }
    }
  `]})
export class QuizCreateComponent {
  isSubmitting = false;
  quizData: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'> = {
    title: '',
    description: '',
    questions: [],
    createdBy: '',
    isPublished: false
  };

  constructor(
      private quizService: QuizService,
      private router: Router,
      private toast: ToastService
  ) {}

  addNewQuestion() {
    this.quizData.questions.push({
      id: uuidv4(),
      text: '',
      options: [],
      points: 1,
      correctOptionId: ''
    });
  }

  addNewOption(question: Question) {
    question.options.push({
      id: uuidv4(),
      text: ''
    });
  }

  setCorrectAnswer(question: Question, optionId: string) {
    question.correctOptionId = optionId;
  }

  removeQuestion(index: number) {
    this.quizData.questions.splice(index, 1);
  }

  removeOption(questionIndex: number, optionIndex: number) {
    this.quizData.questions[questionIndex].options.splice(optionIndex, 1);
  }

  validateForm(): boolean {
    return this.quizData.questions.every(q =>
        q.text.trim() &&
        q.options.length >= 2 &&
        q.correctOptionId
    );
  }

  handleSubmit() {
    if (!this.validateForm()) {
      this.toast.showError('Veuillez remplir toutes les questions correctement');
      return;
    }

    this.isSubmitting = true;
    this.quizService.createQuiz(this.quizData).subscribe({
      next: (createdQuiz) => {
        this.toast.dismiss('Quiz créé avec succès !');
        this.router.navigate(['/teacher/quizzes', createdQuiz.id, 'edit']);
      },
      error: () => this.isSubmitting = false,
      complete: () => this.isSubmitting = false
    });
  }
}
