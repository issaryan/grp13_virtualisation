// src/app/features/student/results/result-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { QuizService } from '../../../core/services/quiz.service';
import { ActivatedRoute } from '@angular/router';
import { QuizResult } from '../../../core/models/quiz.model';
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-result-detail',
  template: `
    <div class="detail-container">
      <h2>Détail du résultat</h2>

      <ng-template #loading>
        <div class="loading">Chargement...</div>
      </ng-template>

      <div *ngIf="result as r; else loading" class="result-detail">
        <div class="header">
          <h3>{{ r.quizTitle }}</h3>
          <div class="score">Score: {{ r.percentageScore }}%</div>
        </div>

        <div class="questions">
          <div *ngFor="let question of r.questions" class="question">
            <div class="question-text">{{ question.text }}</div>
            <div class="answers">
              <div
                  *ngFor="let option of question.options"
                  class="answer"
                  [class.correct]="option.isCorrect"
                  [class.selected]="option.id === question.selectedAnswer"
              >
                {{ option.text }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  imports: [
    NgIf,
    NgForOf
  ],
  styles: [`
    .detail-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 1rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .score {
      font-weight: bold;
      font-size: 1.2rem;
    }

    .questions {
      margin-top: 2rem;
    }

    .question {
      margin-bottom: 2rem;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .question-text {
      font-weight: bold;
      margin-bottom: 1rem;
    }

    .answers {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }

    .answer {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .correct {
      background-color: #d4edda;
      border-color: #c3e6cb;
    }

    .selected:not(.correct) {
      background-color: #f8d7da;
      border-color: #f5c6cb;
    }
  `]
})
export class ResultDetailComponent implements OnInit {
  result: QuizResult | null = null;
  loading = true;

  constructor(
      private quizService: QuizService,
      private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const resultId = this.route.snapshot.paramMap.get('id');
    if (resultId) {
      this.loadResult(resultId);
    } else {
      this.loading = false;
    }
  }

  loadResult(resultId: string) {
    this.loading = true;
    this.quizService.getStudentResults('current-user').subscribe({
      next: (results) => {
        this.result = results.find(r => r.id === resultId) || null;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
