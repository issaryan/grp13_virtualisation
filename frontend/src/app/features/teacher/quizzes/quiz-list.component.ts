import { Component } from '@angular/core';
import { QuizService } from '../../../core/services/quiz.service';
import { Quiz } from '../../../core/models/quiz.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="quiz-list">
      <h2>Mes Quizzes</h2>
      <button routerLink="/teacher/quizzes/create">Créer un quiz</button>
      
      <div class="quiz-grid">
        @for (quiz of quizzes; track quiz.id) {
          <div class="quiz-card">
            <h3>{{ quiz.title }}</h3>
            <p>{{ quiz.description }}</p>
            <div class="quiz-actions">
              <button [routerLink]="['/teacher/quizzes', quiz.id, 'edit']">Modifier</button>
              <button [routerLink]="['/teacher/quizzes', quiz.id, 'sessions']">Sessions</button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .quiz-list {
      padding: 1rem;
    }
    .quiz-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .quiz-card {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 1rem;
    }
    .quiz-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }
  `]
})
export class QuizListComponent {
  quizzes: Quiz[] = [];

  constructor(private quizService: QuizService) {}

  ngOnInit() {
    this.loadQuizzes();
  }

  loadQuizzes() {
    this.quizService.getTeacherQuizzes().subscribe(quizzes => {
      this.quizzes = quizzes;
    });
  }
}
