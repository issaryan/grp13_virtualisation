import { Component, OnInit } from '@angular/core';
import { QuizService } from '../../../core/services/quiz.service';
import { QuizSession, QuizParticipant } from '../../../core/models/quiz.model';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-session-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="session-detail">
      <h2>Session {{ session?.code }}</h2>
      
      <div *ngIf="session">
        <div>Statut: {{ session.isActive ? 'Active' : 'Terminée' }}</div>
        <div>Participants: {{ session.participants.length }}</div>
        
        <button *ngIf="session.isActive" (click)="endSession()">Terminer la session</button>
        
        <h3>Participants</h3>
        <div class="participants">
          <div *ngFor="let participant of session.participants" class="participant">
            <div>Participant {{ participant.userId }}</div>
            <div>Score: {{ participant.score }}</div>
            <div>Statut: {{ participant.completed ? 'Terminé' : 'En cours' }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .session-detail {
      padding: 1rem;
    }
    .participants {
      margin-top: 1rem;
      display: grid;
      gap: 1rem;
    }
    .participant {
      border: 1px solid #ddd;
      padding: 1rem;
    }
  `]
})
export class SessionDetailComponent implements OnInit {
  session: QuizSession | null = null;

  constructor(
    private quizService: QuizService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const sessionId = this.route.snapshot.paramMap.get('id');
    if (sessionId) {
      this.loadSession(sessionId);
    }
  }

  loadSession(sessionId: string) {
    this.quizService.getSession(sessionId).subscribe(session => {
      this.session = session;
    });
  }

  endSession() {
    if (!this.session) return;
    this.quizService.endSession(this.session.id).subscribe(session => {
      this.session = session;
    });
  }
}
