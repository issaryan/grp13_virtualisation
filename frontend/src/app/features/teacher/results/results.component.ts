import { Component, OnInit } from '@angular/core';
import { QuizService } from '../../../core/services/quiz.service';
import { QuizResult, QuizStats } from '../../../core/models/quiz.model';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="results">
      <h2>Résultats de la session</h2>
      
      <div *ngIf="stats">
        <h3>Statistiques</h3>
        <div>Score moyen: {{ stats.averageScore }}</div>
        <div>Score max: {{ stats.highestScore }}</div>
        <div>Score min: {{ stats.lowestScore }}</div>
        <div>Participants: {{ stats.totalParticipants }}</div>
      </div>
      
      <h3>Résultats détaillés</h3>
      <div class="result-list">
        <div *ngFor="let result of results" class="result-item">
          <div>Participant {{ result.userId }}</div>
          <div>Score: {{ result.score }}%</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .results {
      padding: 1rem;
    }
    .result-list {
      margin-top: 1rem;
      display: grid;
      gap: 1rem;
    }
    .result-item {
      border: 1px solid #ddd;
      padding: 1rem;
    }
  `]
})
export class ResultsComponent implements OnInit {
  results: QuizResult[] = [];
  stats: QuizStats | null = null;

  constructor(
    private quizService: QuizService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const sessionId = this.route.snapshot.paramMap.get('id');
    if (sessionId) {
      this.loadResults(sessionId);
      this.loadStats(sessionId);
    }
  }

  loadResults(sessionId: string) {
    this.quizService.getSessionResults(sessionId).subscribe(results => {
      this.results = results;
    });
  }

  loadStats(sessionId: string) {
    this.quizService.getQuizStats(sessionId).subscribe(stats => {
      this.stats = stats;
    });
  }
}
