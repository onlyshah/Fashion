import { Component, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SearchService } from '../../../core/services/search.service';

@Component({
  selector: 'app-visual-search',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="visual-search-container">
      <!-- Camera/Upload Options -->
      <div class="search-options">
        <ion-button 
          fill="outline" 
          size="small"
          (click)="openCamera()"
          [disabled]="isProcessing">
          <ion-icon name="camera" slot="start"></ion-icon>
          Take Photo
        </ion-button>
        
        <ion-button 
          fill="outline" 
          size="small"
          (click)="selectImage()"
          [disabled]="isProcessing">
          <ion-icon name="image" slot="start"></ion-icon>
          Upload Image
        </ion-button>
        
        <ion-button 
          *ngIf="supportsBarcodeScanner"
          fill="outline" 
          size="small"
          (click)="scanBarcode()"
          [disabled]="isProcessing">
          <ion-icon name="qr-code" slot="start"></ion-icon>
          Scan Code
        </ion-button>
      </div>

      <!-- Hidden file input -->
      <input 
        #fileInput 
        type="file" 
        accept="image/*" 
        capture="environment"
        style="display: none"
        (change)="onFileSelected($event)">

      <!-- Processing indicator -->
      <div *ngIf="isProcessing" class="processing-indicator">
        <ion-spinner name="crescent"></ion-spinner>
        <p>{{ processingMessage }}</p>
      </div>

      <!-- Preview image -->
      <div *ngIf="previewImage && !isProcessing" class="image-preview">
        <img [src]="previewImage" alt="Search preview" class="preview-img">
        <div class="preview-actions">
          <ion-button size="small" fill="clear" (click)="clearPreview()">
            <ion-icon name="close" slot="icon-only"></ion-icon>
          </ion-button>
          <ion-button size="small" (click)="searchWithImage()">
            <ion-icon name="search" slot="start"></ion-icon>
            Search
          </ion-button>
        </div>
      </div>

      <!-- Error message -->
      <div *ngIf="errorMessage" class="error-message">
        <ion-icon name="alert-circle" color="danger"></ion-icon>
        <span>{{ errorMessage }}</span>
      </div>
    </div>
  `,
  styles: [`
    .visual-search-container {
      padding: 1rem;
      border-radius: 12px;
      background: var(--ion-color-light);
      border: 2px dashed var(--ion-color-medium);
      text-align: center;
      transition: all 0.3s ease;

      &:hover {
        border-color: var(--ion-color-primary);
        background: var(--ion-color-primary-tint);
      }
    }

    .search-options {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 1rem;

      ion-button {
        --border-radius: 20px;
        font-size: 0.875rem;
      }
    }

    .processing-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 2rem;

      p {
        margin: 0;
        color: var(--ion-color-medium);
        font-size: 0.875rem;
      }
    }

    .image-preview {
      position: relative;
      max-width: 300px;
      margin: 0 auto;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .preview-img {
      width: 100%;
      height: auto;
      max-height: 200px;
      object-fit: cover;
    }

    .preview-actions {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      gap: 0.5rem;

      ion-button {
        --background: rgba(255, 255, 255, 0.9);
        --color: var(--ion-color-dark);
        --border-radius: 50%;
        width: 36px;
        height: 36px;
      }
    }

    .error-message {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem;
      background: var(--ion-color-danger-tint);
      border-radius: 8px;
      margin-top: 1rem;

      span {
        color: var(--ion-color-danger);
        font-size: 0.875rem;
      }
    }

    @media (max-width: 768px) {
      .search-options {
        flex-direction: column;
        align-items: center;

        ion-button {
          width: 100%;
          max-width: 200px;
        }
      }
    }
  `]
})
export class VisualSearchComponent {
  @Output() searchResults = new EventEmitter<any>();
  @Output() searchError = new EventEmitter<string>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isProcessing = false;
  processingMessage = '';
  previewImage: string | null = null;
  selectedFile: File | null = null;
  errorMessage = '';
  supportsBarcodeScanner = false;

  constructor(private searchService: SearchService) {
    this.checkBarcodeSupport();
  }

  private checkBarcodeSupport(): void {
    // Check if device supports barcode scanning
    this.supportsBarcodeScanner = 'BarcodeDetector' in window || 
                                  navigator.mediaDevices?.getUserMedia !== undefined;
  }

  openCamera(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.setAttribute('capture', 'environment');
      this.fileInput.nativeElement.click();
    }
  }

  selectImage(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.removeAttribute('capture');
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.showError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.showError('Image size must be less than 10MB');
      return;
    }

    this.selectedFile = file;
    this.createPreview(file);
    this.clearError();
  }

  private createPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewImage = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  searchWithImage(): void {
    if (!this.selectedFile) return;

    this.isProcessing = true;
    this.processingMessage = 'Analyzing image...';
    this.clearError();

    this.searchService.searchByImage(this.selectedFile).subscribe({
      next: (result) => {
        this.isProcessing = false;
        this.searchResults.emit(result);
        this.clearPreview();
      },
      error: (error) => {
        this.isProcessing = false;
        const errorMsg = 'Visual search failed. Please try again.';
        this.showError(errorMsg);
        this.searchError.emit(errorMsg);
      }
    });
  }

  async scanBarcode(): Promise<void> {
    if (!this.supportsBarcodeScanner) {
      this.showError('Barcode scanning is not supported on this device');
      return;
    }

    try {
      this.isProcessing = true;
      this.processingMessage = 'Starting barcode scanner...';

      // Use modern Barcode Detection API if available
      if ('BarcodeDetector' in window) {
        await this.scanWithBarcodeDetector();
      } else {
        // Fallback to camera-based scanning
        await this.scanWithCamera();
      }
    } catch (error) {
      console.error('Barcode scanning error:', error);
      this.showError('Barcode scanning failed. Please try again.');
    } finally {
      this.isProcessing = false;
    }
  }

  private async scanWithBarcodeDetector(): Promise<void> {
    // Implementation would use BarcodeDetector API
    // This is a placeholder for the actual implementation
    this.showError('Barcode scanning feature coming soon!');
  }

  private async scanWithCamera(): Promise<void> {
    // Implementation would use camera stream for barcode detection
    // This is a placeholder for the actual implementation
    this.showError('Camera-based barcode scanning feature coming soon!');
  }

  clearPreview(): void {
    this.previewImage = null;
    this.selectedFile = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.clearError(), 5000);
  }

  private clearError(): void {
    this.errorMessage = '';
  }
}
