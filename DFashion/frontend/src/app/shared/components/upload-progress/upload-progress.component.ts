import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadProgress } from '../../../core/services/upload.service';

@Component({
  selector: 'app-upload-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="upload-progress" *ngIf="progress">
      <div class="progress-header">
        <span class="progress-text">
          {{ getProgressText() }}
        </span>
        <span class="progress-percentage">
          {{ progress.percentage }}%
        </span>
      </div>
      
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          [style.width.%]="progress.percentage"
          [class.error]="progress.status === 'error'"
          [class.success]="progress.status === 'completed'"
        ></div>
      </div>
      
      <div class="progress-details" *ngIf="showDetails">
        <span class="file-size">
          {{ formatBytes(progress.loaded) }} / {{ formatBytes(progress.total) }}
        </span>
        <span class="upload-speed" *ngIf="progress.status === 'uploading'">
          Uploading...
        </span>
      </div>
    </div>
  `,
  styles: [`
    .upload-progress {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .progress-text {
      font-weight: 500;
      color: #333;
    }

    .progress-percentage {
      font-weight: 600;
      color: #007bff;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background-color: #f0f0f0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #007bff, #0056b3);
      border-radius: 4px;
      transition: width 0.3s ease;
      position: relative;
    }

    .progress-fill.success {
      background: linear-gradient(90deg, #28a745, #1e7e34);
    }

    .progress-fill.error {
      background: linear-gradient(90deg, #dc3545, #c82333);
    }

    .progress-fill::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255,255,255,0.3),
        transparent
      );
      animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .progress-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #666;
    }

    .file-size {
      font-family: monospace;
    }

    .upload-speed {
      color: #007bff;
      font-weight: 500;
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      .upload-progress {
        padding: 12px;
        margin: 12px 0;
      }

      .progress-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .progress-percentage {
        align-self: flex-end;
      }

      .progress-details {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }
  `]
})
export class UploadProgressComponent {
  @Input() progress: UploadProgress | null = null;
  @Input() showDetails: boolean = true;

  getProgressText(): string {
    if (!this.progress) return '';

    switch (this.progress.status) {
      case 'uploading':
        return 'Uploading files...';
      case 'completed':
        return 'Upload completed successfully!';
      case 'error':
        return 'Upload failed. Please try again.';
      default:
        return 'Preparing upload...';
    }
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
