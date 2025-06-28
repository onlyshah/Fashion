import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div [class]="containerClasses">
      <div class="error-icon" [class.shake]="showAnimation">
        <ion-icon [name]="icon" color="danger"></ion-icon>
      </div>
      
      <h3 class="error-title">{{ title }}</h3>
      <p class="error-message">{{ message }}</p>
      
      <div class="error-details" *ngIf="details && showDetails">
        <button class="details-toggle" (click)="toggleDetails()">
          <ion-icon [name]="showDetailsExpanded ? 'chevron-up' : 'chevron-down'"></ion-icon>
          {{ showDetailsExpanded ? 'Hide' : 'Show' }} Details
        </button>
        <div class="details-content" *ngIf="showDetailsExpanded">
          <pre>{{ details }}</pre>
        </div>
      </div>

      <div class="error-actions">
        <ion-button 
          *ngIf="retryText" 
          color="primary"
          fill="solid"
          (click)="onRetry()">
          <ion-icon name="refresh" slot="start"></ion-icon>
          {{ retryText }}
        </ion-button>
        
        <ion-button 
          *ngIf="secondaryText" 
          color="medium"
          fill="outline"
          (click)="onSecondaryAction()">
          <ion-icon [name]="secondaryIcon" slot="start" *ngIf="secondaryIcon"></ion-icon>
          {{ secondaryText }}
        </ion-button>
      </div>
    </div>
  `,
  styles: [`
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1rem;
      text-align: center;
      min-height: 200px;
      opacity: 0;
      animation: fadeIn 0.5s ease-in-out forwards;

      &.size-small {
        padding: 2rem 1rem;
        min-height: 150px;

        .error-icon ion-icon {
          font-size: 3rem;
        }

        .error-title {
          font-size: 1.1rem;
        }

        .error-message {
          font-size: 0.8rem;
        }
      }

      &.size-large {
        padding: 4rem 1rem;
        min-height: 300px;

        .error-icon ion-icon {
          font-size: 5rem;
        }

        .error-title {
          font-size: 1.5rem;
        }

        .error-message {
          font-size: 1rem;
        }
      }

      &.animated {
        .error-icon {
          animation: bounceIn 0.8s ease-in-out;
        }

        .error-title {
          animation: slideInUp 0.6s ease-in-out 0.2s both;
        }

        .error-message {
          animation: slideInUp 0.6s ease-in-out 0.4s both;
        }

        .error-actions {
          animation: slideInUp 0.6s ease-in-out 0.6s both;
        }
      }
    }

    .error-icon {
      margin-bottom: 1.5rem;

      ion-icon {
        font-size: 4rem;
        opacity: 0.8;
      }

      &.shake {
        animation: shake 0.5s ease-in-out;
      }
    }

    .error-title {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--ion-color-danger);
    }

    .error-message {
      margin: 0 0 1.5rem 0;
      color: var(--ion-color-medium);
      font-size: 0.875rem;
      line-height: 1.4;
      max-width: 400px;
    }

    .error-details {
      margin-bottom: 1.5rem;
      width: 100%;
      max-width: 500px;
    }

    .details-toggle {
      background: none;
      border: 1px solid var(--ion-color-medium);
      border-radius: 6px;
      padding: 0.5rem 1rem;
      color: var(--ion-color-medium);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      transition: all 0.2s ease;

      &:hover {
        background: var(--ion-color-light);
        border-color: var(--ion-color-primary);
        color: var(--ion-color-primary);
      }
    }

    .details-content {
      margin-top: 1rem;
      padding: 1rem;
      background: var(--ion-color-light);
      border-radius: 6px;
      border: 1px solid var(--ion-color-medium);
      text-align: left;

      pre {
        margin: 0;
        font-size: 0.75rem;
        color: var(--ion-color-dark);
        white-space: pre-wrap;
        word-break: break-word;
      }
    }

    .error-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: center;

      ion-button {
        min-width: 120px;
        transition: transform 0.2s ease;

        &:hover {
          transform: translateY(-2px);
        }
      }
    }

    // Animations
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes bounceIn {
      0% {
        opacity: 0;
        transform: scale(0.3);
      }
      50% {
        opacity: 1;
        transform: scale(1.05);
      }
      70% {
        transform: scale(0.9);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes shake {
      0%, 100% {
        transform: translateX(0);
      }
      10%, 30%, 50%, 70%, 90% {
        transform: translateX(-5px);
      }
      20%, 40%, 60%, 80% {
        transform: translateX(5px);
      }
    }
  `]
})
export class ErrorStateComponent {
  @Input() icon: string = 'alert-circle';
  @Input() title: string = 'Something went wrong';
  @Input() message: string = 'An unexpected error occurred. Please try again.';
  @Input() details: string = '';
  @Input() retryText: string = 'Try Again';
  @Input() secondaryText: string = '';
  @Input() secondaryIcon: string = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() showAnimation: boolean = true;
  @Input() showDetails: boolean = false;
  @Input() customClass: string = '';

  @Output() retry = new EventEmitter<void>();
  @Output() secondaryAction = new EventEmitter<void>();

  showDetailsExpanded = false;

  get containerClasses(): string {
    const classes = ['error-state'];
    if (this.size) classes.push(`size-${this.size}`);
    if (this.showAnimation) classes.push('animated');
    if (this.customClass) classes.push(this.customClass);
    return classes.join(' ');
  }

  onRetry(): void {
    this.retry.emit();
  }

  onSecondaryAction(): void {
    this.secondaryAction.emit();
  }

  toggleDetails(): void {
    this.showDetailsExpanded = !this.showDetailsExpanded;
  }
}
