import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { QuizService } from '../../../core/services/quiz.service';
import { QuizResult } from '../../../core/models/quiz.model';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <h1 class="dashboard-title">Tableau de Bord Étudiant</h1>
      <p class="dashboard-subtitle">Bienvenue, {{ studentName }} ! Participez aux quiz et suivez votre progression.</p>
      
      <div class="dashboard-stats">
        <div class="stat-card bg-primary">
          <div class="stat-value">{{ totalQuizzes }}</div>
          <div class="stat-label">Quiz Complétés</div>
        </div>
        <div class="stat-card bg-secondary">
          <div class="stat-value">{{ averageScore }}%</div>
          <div class="stat-label">Score Moyen</div>
        </div>
        <div class="stat-card bg-accent">
          <div class="stat-value">{{ highestScore }}%</div>
          <div class="stat-label">Meilleur Score</div>
        </div>
        <div class="stat-card bg-success">
          <div class="stat-value">{{ quizzesThisMonth }}</div>
          <div class="stat-label">Quiz ce Mois</div>
        </div>
      </div>
      
      <div class="dashboard-actions">
        <a routerLink="/student/join" class="btn btn-primary">Rejoindre un Quiz</a>
        <a routerLink="/student/results" class="btn btn-outline">Voir mes Résultats</a>
      </div>
      
      <section class="recent-results">
        <div class="section-header">
          <h2>Résultats Récents</h2>
          @if (results.length > 0) {
            <a routerLink="/student/results" class="btn btn-sm">Voir Tout</a>
          }
        </div>
        
        @if (isLoading) {
          <div class="loading-indicator">
            <div class="spinner"></div>
            <p>Chargement des résultats...</p>
          </div>
        } @else if (results.length === 0) {
          <div class="empty-state">
            <div class="empty-icon">📝</div>
            <h3>Aucun Résultat</h3>
            <p>Participez à un quiz pour voir vos résultats ici.</p>
            <a routerLink="/student/join" class="btn btn-primary mt-3">Rejoindre un Quiz</a>
          </div>
        } @else {
          <div class="results-list">
            @for (result of recentResults; track result.quizId) {
              <div class="result-card">
                <div class="result-header">
                  <h3 class="result-title">Titre du Quiz</h3>
                  <div class="result-score" [class]="getScoreClass(result.percentageScore)">
                    {{ result.percentageScore }}%
                  </div>
                </div>
                
                <div class="result-stats">
                  <div class="result-stat">
                    <span class="stat-label">Correct</span>
                    <span class="stat-value">{{ result.correctAnswers }}/{{ result.totalQuestions }}</span>
                  </div>
                  <div class="result-stat">
                    <span class="stat-label">Temps</span>
                    <span class="stat-value">{{ formatTime(result.timeSpent) }}</span>
                  </div>
                  <div class="result-stat">
                    <span class="stat-label">Date</span>
                    <span class="stat-value">{{ formatDate(result.completedAt) }}</span>
                  </div>
                </div>
                
                <a [routerLink]="['/student/result', result.sessionId]" class="btn btn-sm btn-outline btn-block mt-3">
                  Voir les Détails
                </a>
              </div>
            }
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .dashboard-title {
      margin-bottom: var(--space-2);
    }
    
    .dashboard-subtitle {
      color: var(--neutral-600);
      margin-bottom: var(--space-4);
    }
    
    .dashboard-stats {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: var(--space-3);
      margin-bottom: var(--space-5);
    }
    
    .stat-card {
      padding: var(--space-4);
      border-radius: var(--radius-md);
      color: white;
      text-align: center;
    }
    
    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      line-height: 1.2;
    }
    
    .stat-label {
      font-size: 1rem;
      opacity: 0.9;
    }
    
    .dashboard-actions {
      display: flex;
      gap: var(--space-3);
      margin-bottom: var(--space-5);
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-4);
    }
    
    .results-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--space-3);
    }
    
    .result-card {
      background-color: white;
      border-radius: var(--radius-md);
      padding: var(--space-3);
      box-shadow: var(--shadow-md);
    }
    
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-3);
    }
    
    .result-title {
      margin: 0;
      font-size: 1.25rem;
    }
    
    .result-score {
      font-size: 1.25rem;
      font-weight: bold;
      padding: 0.25rem 0.75rem;
      border-radius: var(--radius-md);
    }
    
    .score-high {
      background-color: var(--success-100);
      color: var(--success-700);
    }
    
    .score-medium {
      background-color: var(--warning-100);
      color: var(--warning-700);
    }
    
    .score-low {
      background-color: var(--error-100);
      color: var(--error-700);
    }
    
    .result-stats {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--space-2);
    }
    
    .result-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .result-stat .stat-label {
      font-size: 0.75rem;
      color: var(--neutral-500);
    }
    
    .result-stat .stat-value {
      font-size: 1rem;
      font-weight: 600;
    }
    
    .btn-sm {
      padding: var(--space-1) var(--space-2);
      font-size: 0.875rem;
    }
    
    .btn-block {
      display: block;
      width: 100%;
    }
    
    .empty-state {
      text-align: center;
      padding: var(--space-5);
      background-color: white;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
    }
    
    .empty-icon {
      font-size: 3rem;
      margin-bottom: var(--space-3);
    }
    
    .loading-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--space-5);
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--neutral-200);
      border-top-color: var(--primary-500);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: var(--space-3);
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
      .dashboard-actions {
        flex-direction: column;
      }
      
      .dashboard-stats {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      }
    }
  `]
})
export class StudentDashboardComponent implements OnInit {
  studentName = '';
  results: QuizResult[] = [];
  recentResults: QuizResult[] = [];
  isLoading = true;
  totalQuizzes = 0;
  averageScore = 0;
  highestScore = 0;
  quizzesThisMonth = 0;

  constructor(
    private authService: AuthService,
    private quizService: QuizService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.studentName = `${currentUser.firstName} ${currentUser.lastName}`;
    }
    
    this.loadResults();
  }

  loadResults(): void {
    const userId = this.authService.currentUserValue?.id || '';
    
    this.quizService.getStudentResults(userId).subscribe({
      next: (results) => {
        this.isLoading = false;
        this.results = results;
        
        // Get 3 most recent results
        this.recentResults = [...results].sort((a, b) => 
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        ).slice(0, 3);
        
        // Calculate statistics
        this.totalQuizzes = results.length;
        
        if (results.length > 0) {
          this.averageScore = Math.round(
            results.reduce((sum, result) => sum + result.percentageScore, 0) / results.length
          );
          
          this.highestScore = Math.round(
            Math.max(...results.map(result => result.percentageScore))
          );
          
          // Count quizzes taken this month
          const now = new Date();
          const thisMonth = now.getMonth();
          const thisYear = now.getFullYear();
          
          this.quizzesThisMonth = results.filter(result => {
            const date = new Date(result.completedAt);
            return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
          }).length;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.show({
          message: 'Échec du chargement des résultats. Veuillez réessayer.',
          type: 'error'
        });
      }
    });
  }

  getScoreClass(score: number): string {
    if (score >= 80) {
      return 'score-high';
    } else if (score >= 60) {
      return 'score-medium';
    } else {
      return 'score-low';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }
}
