import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { QuizService } from '../../../core/services/quiz.service';
import { Quiz } from '../../../core/models/quiz.model';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <h1 class="dashboard-title">Tableau de Bord Enseignant</h1>
      <p class="dashboard-subtitle">Bienvenue, {{ teacherName }} ! Gérez vos quiz et vos sessions.</p>
      
      <div class="dashboard-stats">
        <div class="stat-card bg-primary">
          <div class="stat-value">{{ quizzes.length }}</div>
          <div class="stat-label">Quiz Créés</div>
        </div>
        <div class="stat-card bg-secondary">
          <div class="stat-value">{{ activeSessions }}</div>
          <div class="stat-label">Sessions Actives</div>
        </div>
        <div class="stat-card bg-accent">
          <div class="stat-value">{{ totalParticipants }}</div>
          <div class="stat-label">Participants Total</div>
        </div>
        <div class="stat-card bg-success">
          <div class="stat-value">{{ averageScore }}%</div>
          <div class="stat-label">Score Moyen</div>
        </div>
      </div>
      
      <div class="dashboard-actions">
        <a routerLink="/teacher/quizzes/create" class="btn btn-primary">Créer un Nouveau Quiz</a>
        <a routerLink="/teacher/quizzes" class="btn btn-outline">Voir Tous les Quiz</a>
      </div>
      
      <section class="recent-quizzes">
        <div class="section-header">
          <h2>Quiz Récents</h2>
          @if (quizzes.length > 0) {
            <a routerLink="/teacher/quizzes" class="btn btn-sm">Voir Tout</a>
          }
        </div>
        
        @if (isLoading) {
          <div class="loading-indicator">
            <div class="spinner"></div>
            <p>Chargement des quiz...</p>
          </div>
        } @else if (quizzes.length === 0) {
          <div class="empty-state">
            <div class="empty-icon">📚</div>
            <h3>Aucun Quiz Créé</h3>
            <p>Commencez par créer votre premier quiz.</p>
            <a routerLink="/teacher/quizzes/create" class="btn btn-primary mt-3">Créer un Quiz</a>
          </div>
        } @else {
          <div class="quiz-grid">
            @for (quiz of recentQuizzes; track quiz.id) {
              <div class="quiz-card">
                <div class="quiz-header">
                  <h3 class="quiz-title">{{ quiz.title }}</h3>
                  <span class="quiz-status" [class.status-published]="quiz.isPublished" [class.status-draft]="!quiz.isPublished">
                    {{ quiz.isPublished ? 'Publié' : 'Brouillon' }}
                  </span>
                </div>
                <p class="quiz-description">{{ quiz.description }}</p>
                <div class="quiz-meta">
                  <span>{{ quiz.questions.length }} questions</span>
                  <span>{{ formatDate(quiz.createdAt) }}</span>
                </div>
                <div class="quiz-actions">
                  <a [routerLink]="['/teacher/quizzes', quiz.id, 'edit']" class="btn btn-sm btn-outline">Modifier</a>
                  @if (quiz.isPublished) {
                    <button class="btn btn-sm btn-primary" (click)="createSession(quiz.id)">Démarrer Session</button>
                  } @else {
                    <button class="btn btn-sm btn-secondary" (click)="publishQuiz(quiz.id)">Publier</button>
                  }
                </div>
              </div>
            }
          </div>
        }
      </section>
      
      <section class="active-sessions">
        <div class="section-header">
          <h2>Sessions Actives</h2>
        </div>
        
        @if (activeSessions === 0) {
          <div class="empty-state">
            <div class="empty-icon">🔄</div>
            <h3>Aucune Session Active</h3>
            <p>Démarrez une session de quiz pour interagir avec vos étudiants en temps réel.</p>
          </div>
        } @else {
          <div class="sessions-list">
            <p>Sessions actives à implémenter.</p>
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
    
    .recent-quizzes, .active-sessions {
      margin-bottom: var(--space-6);
    }
    
    .quiz-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--space-3);
    }
    
    .quiz-card {
      background-color: white;
      border-radius: var(--radius-md);
      padding: var(--space-3);
      box-shadow: var(--shadow-md);
    }
    
    .quiz-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-2);
    }
    
    .quiz-title {
      margin: 0;
      font-size: 1.25rem;
    }
    
    .quiz-status {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-weight: 600;
    }
    
    .status-published {
      background-color: var(--success-100);
      color: var(--success-700);
    }
    
    .status-draft {
      background-color: var(--neutral-200);
      color: var(--neutral-700);
    }
    
    .quiz-description {
      color: var(--neutral-700);
      margin-bottom: var(--space-3);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .quiz-meta {
      display: flex;
      justify-content: space-between;
      color: var(--neutral-500);
      font-size: 0.875rem;
      margin-bottom: var(--space-3);
    }
    
    .quiz-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-2);
    }
    
    .btn-sm {
      padding: var(--space-1) var(--space-2);
      font-size: 0.875rem;
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
export class TeacherDashboardComponent implements OnInit {
  quizzes: Quiz[] = [];
  recentQuizzes: Quiz[] = [];
  isLoading = true;
  teacherName = '';
  activeSessions = 0;
  totalParticipants = 0;
  averageScore = 0;

  constructor(
    private authService: AuthService,
    private quizService: QuizService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.teacherName = `${currentUser.firstName} ${currentUser.lastName}`;
    }
    
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.quizService.getTeacherQuizzes().subscribe({
      next: (quizzes) => {
        this.isLoading = false;
        this.quizzes = quizzes;
        // Get 3 most recent quizzes
        this.recentQuizzes = [...quizzes].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 3);
        
        // Demo data
        this.activeSessions = 0;
        this.totalParticipants = 0;
        this.averageScore = 0;
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.show({
          message: 'Échec du chargement des quiz. Veuillez réessayer.',
          type: 'error'
        });
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  createSession(quizId: string): void {
    this.quizService.createSession(quizId).subscribe({
      next: (session) => {
        this.toastService.show({
          message: `Session créée avec le code : ${session.code}`,
          type: 'success'
        });
      },
      error: (error) => {
        this.toastService.show({
          message: 'Échec de la création de la session. Veuillez réessayer.',
          type: 'error'
        });
      }
    });
  }

  publishQuiz(quizId: string): void {
    this.quizService.publishQuiz(quizId).subscribe({
      next: (quiz) => {
        const index = this.quizzes.findIndex(q => q.id === quizId);
        if (index !== -1) {
          this.quizzes[index] = quiz;
          
          // Update recent quizzes if needed
          const recentIndex = this.recentQuizzes.findIndex(q => q.id === quizId);
          if (recentIndex !== -1) {
            this.recentQuizzes[recentIndex] = quiz;
          }
        }
        
        this.toastService.show({
          message: 'Quiz publié avec succès !',
          type: 'success'
        });
      },
      error: (error) => {
        this.toastService.show({
          message: 'Échec de la publication du quiz. Veuillez réessayer.',
          type: 'error'
        });
      }
    });
  }
}
