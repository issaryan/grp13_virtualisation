import { Component, OnInit } from '@angular/core';
import { QuizService } from '../../../core/services/quiz.service';
import { AuthService } from '../../../core/services/auth.service';
import { QuizResult } from '../../../core/models/quiz.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-student-results',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  template: `
    <div class="results-container">
      <h2>Mes résultats</h2>
      
      @if (loading) {
        <div class="loading">Chargement...</div>
      }
      
      @if (!loading && results.length === 0) {
        <div class="empty">
          Aucun résultat trouvé
        </div>
      }

      <div class="result-list">
        @for (result of results; track result.id) {
          <div 
            class="result-item"
            [routerLink]="['/student/result', result.id]"
          >
            <div class="quiz-title">{{ result.quizTitle }}</div>
            <div class="score">Score: {{ result.score }}%</div>
            <div class="date">{{ result.completedAt | date }}</div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .results-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 1rem;
    }
    .result-list {
      margin-top: 1rem;
    }
    .result-item {
      padding: 1rem;
      margin-bottom: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .result-item:hover {
      background-color: #f5f5f5;
    }
    .quiz-title {
      font-weight: bold;
      flex: 2;
    }
    .score {
      flex: 1;
      text-align: center;
    }
    .date {
      flex: 1;
      text-align: right;
    }
  `]
})
export class StudentResultsComponent implements OnInit {
  results: QuizResult[] = [];
  loading = true;

  constructor(
    private quizService: QuizService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadResults();
  }

  loadResults() {
    this.loading = true;
    const userId = this.authService.currentUserValue?.id;
    if (!userId) return;
    
    this.quizService.getStudentResults(userId)
      .subscribe({
        next: (results) => {
          this.results = results;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }
}
