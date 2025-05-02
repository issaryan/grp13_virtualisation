import { Component, OnInit } from '@angular/core';
import { QuizService } from '../../../core/services/quiz.service';
import { Quiz, Question } from '../../../core/models/quiz.model';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quiz-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="quiz-edit">
      <h2>Modifier le quiz</h2>
      <div *ngIf="quiz">
        <div class="quiz-info">
          <input type="text" [(ngModel)]="quiz.title">
          <textarea [(ngModel)]="quiz.description"></textarea>
          <button (click)="saveQuiz()">Enregistrer</button>
          <button (click)="publishQuiz()">Publier</button>
        </div>

        <div class="questions-section">
          <h3>Questions</h3>
          <button (click)="addQuestion()">Ajouter une question</button>
          
          <div *ngFor="let question of quiz.questions; let i = index" class="question">
            <input type="text" [(ngModel)]="question.text" placeholder="Question">
            <div *ngFor="let option of question.options; let j = index" class="option">
              <input type="text" [(ngModel)]="option.text" placeholder="Option">
              <input type="radio" [checked]="option.id === question.correctOptionId" (change)="setCorrectOption(question, option.id)">
            </div>
            <button (click)="addOption(question)">Ajouter option</button>
            <button (click)="removeQuestion(i)">Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .quiz-edit {
      padding: 1rem;
    }
    .quiz-info {
      margin-bottom: 2rem;
    }
    .questions-section {
      margin-top: 2rem;
    }
    .question {
      border: 1px solid #ddd;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .option {
      display: flex;
      align-items: center;
      margin: 0.5rem 0;
    }
  `]
})
export class QuizEditComponent implements OnInit {
  quiz: Quiz | null = null;

  constructor(
    private quizService: QuizService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const quizId = this.route.snapshot.paramMap.get('id');
    if (quizId) {
      this.loadQuiz(quizId);
    }
  }

  loadQuiz(quizId: string) {
    this.quizService.getQuiz(quizId).subscribe(quiz => {
      this.quiz = quiz;
    });
  }

  saveQuiz() {
    if (!this.quiz) return;
    this.quizService.updateQuiz(this.quiz.id, this.quiz).subscribe();
  }

  publishQuiz() {
    if (!this.quiz) return;
    this.quizService.publishQuiz(this.quiz.id).subscribe(quiz => {
      this.quiz = quiz;
    });
  }

  addQuestion() {
    if (!this.quiz) return;
    this.quiz.questions.push({
      id: Date.now().toString(),
      text: '',
      options: [],
      correctOptionId: '',
      points: 1
    });
  }

  addOption(question: Question) {
    question.options.push({
      id: Date.now().toString(),
      text: ''
    });
  }

  setCorrectOption(question: Question, optionId: string) {
    question.correctOptionId = optionId;
  }

  removeQuestion(index: number) {
    if (!this.quiz) return;
    this.quiz.questions.splice(index, 1);
  }
}
