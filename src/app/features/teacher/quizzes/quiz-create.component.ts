import { Component } from '@angular/core';
import { QuizService } from '../../../core/services/quiz.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {Quiz} from "../../../core/models/quiz.model";

@Component({
  selector: 'app-quiz-create',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="quiz-form">
      <h2>Créer un quiz</h2>
      <form (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Titre</label>
          <input type="text" [(ngModel)]="quiz.title" name="title" required>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea [(ngModel)]="quiz.description" name="description"></textarea>
        </div>
        <button type="submit">Créer</button>
      </form>
    </div>
  `,
  styles: [`
    .quiz-form {
      max-width: 600px;
      margin: 1rem auto;
      padding: 1rem;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
    }
    input, textarea {
      width: 100%;
      padding: 0.5rem;
    }
  `]
})
export class QuizCreateComponent {
  quiz: Partial<Quiz> = {
    title: '',
    description: '',
    questions: []
  };

  constructor(
    private quizService: QuizService,
    private router: Router
  ) {}

  onSubmit() {
    this.quizService.createQuiz(this.quiz).subscribe(quiz => {
      this.router.navigate(['/teacher/quizzes', quiz.id, 'edit']);
    });
  }
}
