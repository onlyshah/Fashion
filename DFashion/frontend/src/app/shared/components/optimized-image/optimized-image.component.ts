import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { MediaService } from '../../../core/services/media.service';

@Component({
  selector: 'app-optimized-image',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="optimized-image-container" [class]="containerClass">
      <!-- Loading State -->
      <div class="loading-overlay" *ngIf="isLoading && showLoader">
        <ion-spinner name="crescent" [color]="loaderColor"></ion-spinner>
      </div>

      <!-- Main Image -->
      <img
        [src]="currentSrc"
        [alt]="alt"
        [class]="imageClass"
        [style.object-fit]="objectFit"
        (load)="onImageLoad()"
        (error)="onImageError($event)"
        [class.loaded]="imageLoaded"
        [class.error]="hasError"
        [loading]="lazyLoad ? 'lazy' : 'eager'"
      />

      <!-- Error State -->
      <div class="error-overlay" *ngIf="hasError && showErrorMessage">
        <ion-icon name="image-outline" class="error-icon"></ion-icon>
        <p class="error-text">{{ errorMessage }}</p>
      </div>

      <!-- Overlay Content -->
      <div class="image-overlay" *ngIf="showOverlay">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .optimized-image-container {
      position: relative;
      display: inline-block;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    img {
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    img.loaded {
      opacity: 1;
    }

    img.error {
      opacity: 0.5;
    }

    .loading-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2;
    }

    .error-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      z-index: 2;
      color: #6b7280;
    }

    .error-icon {
      font-size: 2rem;
      margin-bottom: 8px;
    }

    .error-text {
      font-size: 0.875rem;
      margin: 0;
    }

    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 3;
    }

    /* Responsive image styles */
    .responsive {
      max-width: 100%;
      height: auto;
    }

    .cover {
      object-fit: cover;
    }

    .contain {
      object-fit: contain;
    }

    .rounded {
      border-radius: 8px;
    }

    .circle {
      border-radius: 50%;
    }
  `]
})
export class OptimizedImageComponent implements OnInit, OnDestroy {
  @Input() src: string = '';
  @Input() alt: string = '';
  @Input() fallbackType: 'user' | 'product' | 'post' | 'story' = 'post';
  @Input() width?: number;
  @Input() height?: number;
  @Input() quality: number = 80;
  @Input() lazyLoad: boolean = true;
  @Input() showLoader: boolean = true;
  @Input() showErrorMessage: boolean = false;
  @Input() loaderColor: string = 'primary';
  @Input() errorMessage: string = 'Failed to load image';
  @Input() objectFit: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none' = 'cover';
  @Input() containerClass: string = '';
  @Input() imageClass: string = '';
  @Input() showOverlay: boolean = false;
  @Input() preload: boolean = false;

  @Output() imageLoad = new EventEmitter<Event>();
  @Output() imageError = new EventEmitter<Event>();

  currentSrc: string = '';
  isLoading: boolean = true;
  imageLoaded: boolean = false;
  hasError: boolean = false;

  private retryCount: number = 0;
  private maxRetries: number = 2;

  constructor(private mediaService: MediaService) {}

  ngOnInit() {
    this.loadImage();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  private loadImage() {
    if (!this.src) {
      this.setFallbackImage();
      return;
    }

    // Get optimized image URL
    let optimizedSrc = this.src;
    if (this.width || this.height) {
      optimizedSrc = this.mediaService.optimizeImageUrl(this.src, this.width, this.height, this.quality);
    }

    // Use media service to get safe URL
    this.currentSrc = this.mediaService.getSafeImageUrl(optimizedSrc, this.fallbackType);

    // Preload if requested
    if (this.preload) {
      this.preloadImage();
    }
  }

  private preloadImage() {
    const img = new Image();
    img.onload = () => {
      this.isLoading = false;
      this.imageLoaded = true;
    };
    img.onerror = () => {
      this.handleLoadError();
    };
    img.src = this.currentSrc;
  }

  onImageLoad() {
    this.isLoading = false;
    this.imageLoaded = true;
    this.hasError = false;
    this.retryCount = 0;
    this.imageLoad.emit();
  }

  onImageError(event: Event) {
    this.handleLoadError();
    this.imageError.emit(event);
  }

  private handleLoadError() {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      // Try with media service error handling
      this.mediaService.handleImageError({ target: { src: this.currentSrc } } as any, this.fallbackType);
      
      // Get fallback URL
      const fallbackUrl = this.mediaService.getReliableFallback(this.fallbackType);
      if (this.currentSrc !== fallbackUrl) {
        this.currentSrc = fallbackUrl;
        return;
      }
    }

    this.setFallbackImage();
  }

  private setFallbackImage() {
    this.isLoading = false;
    this.hasError = true;
    this.currentSrc = this.mediaService.getReliableFallback(this.fallbackType);
  }

  // Public methods for external control
  reload() {
    this.retryCount = 0;
    this.hasError = false;
    this.isLoading = true;
    this.imageLoaded = false;
    this.loadImage();
  }

  getResponsiveUrls() {
    return this.mediaService.getResponsiveImageUrls(this.src);
  }
}
