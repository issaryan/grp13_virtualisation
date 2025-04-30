import { Component } from '@angular/core';
import { QuizService } from '../../../core/services/quiz.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../shared/services/toast.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-join-quiz',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="join-container">
      <h2>Rejoindre un quiz</h2>
      <div class="input-group">
        <input
            type="text"
            [(ngModel)]="sessionCode"
            placeholder="Code de session"
            (keyup.enter)="joinSession()"
        >
        <button (click)="joinSession()">Rejoindre</button>
      </div>
    </div>
  `,
  styles: [`
    .join-container {
      max-width: 500px;
      margin: 2rem auto;
      padding: 1rem;
      text-align: center;
    }

    .input-group {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    input {
      flex: 1;
      padding: 0.5rem;
    }

    button {
      padding: 0.5rem 1rem;
    }
  `]
})
export class JoinQuizComponent {
  sessionCode = '';

  constructor(
    private quizService: QuizService,
    private router: Router,
    private toastService: ToastService
  ) {}

  joinSession() {
    if (!this.sessionCode) {
      this.toastService.showError('Veuillez entrer un code de session');
      return;
    }

    this.quizService.joinSession(this.sessionCode).subscribe({
      next: (session) => {
        this.router.navigate(['/student/dashboard']);
      },
      error: (err) => {
        this.toastService.showError('Code invalide ou session terminée');
      }
    });
  }
}
