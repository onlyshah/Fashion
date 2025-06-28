import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div [class]="containerClasses">
      <!-- Spinner Loading -->
      <div *ngIf="type === 'spinner'" class="spinner-container">
        <ion-spinner [name]="spinnerType" [color]="color"></ion-spinner>
        <p *ngIf="message" class="loading-message">{{ message }}</p>
      </div>

      <!-- Skeleton Loading -->
      <div *ngIf="type === 'skeleton'" class="skeleton-container">
        <div *ngFor="let item of skeletonItems" class="skeleton-item">
          <div class="skeleton-avatar" *ngIf="showAvatar"></div>
          <div class="skeleton-content">
            <div class="skeleton-line" *ngFor="let line of item.lines" [style.width]="line + '%'"></div>
          </div>
        </div>
      </div>

      <!-- Dots Loading -->
      <div *ngIf="type === 'dots'" class="dots-container">
        <div class="dot" *ngFor="let dot of [1,2,3]" [style.animation-delay]="(dot - 1) * 0.2 + 's'"></div>
        <p *ngIf="message" class="loading-message">{{ message }}</p>
      </div>

      <!-- Pulse Loading -->
      <div *ngIf="type === 'pulse'" class="pulse-container">
        <div class="pulse-circle"></div>
        <p *ngIf="message" class="loading-message">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      text-align: center;
      min-height: 150px;

      &.size-small {
        padding: 1rem;
        min-height: 100px;
      }

      &.size-large {
        padding: 3rem 1rem;
        min-height: 250px;
      }

      &.fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.9);
        z-index: 9999;
        min-height: 100vh;
      }
    }

    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;

      ion-spinner {
        width: 32px;
        height: 32px;
      }
    }

    .skeleton-container {
      width: 100%;
      max-width: 400px;
    }

    .skeleton-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .skeleton-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-content {
      flex: 1;
    }

    .skeleton-line {
      height: 12px;
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 6px;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .dots-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--ion-color-primary);
      display: inline-block;
      margin: 0 4px;
      animation: bounce 1.4s infinite ease-in-out both;
    }

    .pulse-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .pulse-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--ion-color-primary);
      animation: pulse 1.5s infinite;
    }

    .loading-message {
      margin: 0;
      color: var(--ion-color-medium);
      font-size: 0.875rem;
      font-weight: 500;
    }

    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }

    @keyframes bounce {
      0%, 80%, 100% {
        transform: scale(0);
      }
      40% {
        transform: scale(1);
      }
    }

    @keyframes pulse {
      0% {
        transform: scale(0);
        opacity: 1;
      }
      100% {
        transform: scale(1);
        opacity: 0;
      }
    }
  `]
})
export class LoadingStateComponent {
  @Input() type: 'spinner' | 'skeleton' | 'dots' | 'pulse' = 'spinner';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() message: string = '';
  @Input() color: string = 'primary';
  @Input() spinnerType: string = 'crescent';
  @Input() showAvatar: boolean = true;
  @Input() skeletonCount: number = 3;
  @Input() fullscreen: boolean = false;
  @Input() customClass: string = '';

  get containerClasses(): string {
    const classes = ['loading-state'];
    if (this.size) classes.push(`size-${this.size}`);
    if (this.fullscreen) classes.push('fullscreen');
    if (this.customClass) classes.push(this.customClass);
    return classes.join(' ');
  }

  get skeletonItems(): Array<{ lines: number[] }> {
    const items = [];
    for (let i = 0; i < this.skeletonCount; i++) {
      items.push({
        lines: [80, 60, 40] // Different line widths for variety
      });
    }
    return items;
  }
}
