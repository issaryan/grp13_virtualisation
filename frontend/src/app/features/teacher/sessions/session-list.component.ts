// src/app/features/teacher/session-list/session-list.component.ts
import { Component, OnInit } from '@angular/core';
import { QuizService } from '../../../core/services/quiz.service';
import { QuizSession } from '../../../core/models/quiz.model';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-session-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="session-list">
      <h2>Sessions du quiz</h2>
      <button (click)="createSession()">Créer une session</button>

      <div class="sessions">
        <div
            *ngFor="let session of sessions; trackBy: trackBySessionId"
            class="session-card"
        >
          <div>Code : {{ session.code }}</div>
          <div>Statut : {{ session.isActive ? 'Active' : 'Terminée' }}</div>
          <div>Participants : {{ session.participants.length }}</div>
          <button [routerLink]="['/teacher/sessions', session.id]">
            Détails
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .session-list {
      padding: 1rem;
    }
    .sessions {
      margin-top: 1rem;
      display: grid;
      gap: 1rem;
    }
    .session-card {
      border: 1px solid #ddd;
      padding: 1rem;
      border-radius: 4px;
    }
  `]
})
export class SessionListComponent implements OnInit {
  sessions: QuizSession[] = [];
  quizId = '';

  constructor(
      private quizService: QuizService,
      private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.quizId = this.route.snapshot.paramMap.get('id') || '';
    this.loadSessions();
  }

  loadSessions() {
    this.quizService.getSessions(this.quizId).subscribe({
      next: sessions => this.sessions = sessions,
      error: err => console.error('Erreur chargement sessions', err)
    });
  }

  createSession() {
    this.quizService.createSession(this.quizId).subscribe({
      next: session => this.sessions.push(session),
      error: err => console.error('Erreur création session', err)
    });
  }

  trackBySessionId(_idx: number, session: QuizSession): string {
    return session.id;
  }
}
