import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-image-viewer',
  template: `
    <div class="image-viewer" [class.fullscreen]="fullscreen">
      <div class="image-container">
        <img 
          [src]="currentImage" 
          [alt]="alt"
          (load)="onImageLoad()"
          (error)="onImageError()"
          [class.loaded]="imageLoaded">
        
        <!-- Loading spinner -->
        <div class="loading-overlay" *ngIf="!imageLoaded">
          <ion-spinner name="crescent"></ion-spinner>
        </div>
        
        <!-- Navigation arrows for multiple images -->
        <div class="nav-arrows" *ngIf="images.length > 1">
          <ion-button 
            fill="clear" 
            class="nav-button prev"
            (click)="previousImage()"
            [disabled]="currentIndex === 0">
            <ion-icon name="chevron-back"></ion-icon>
          </ion-button>
          
          <ion-button 
            fill="clear" 
            class="nav-button next"
            (click)="nextImage()"
            [disabled]="currentIndex === images.length - 1">
            <ion-icon name="chevron-forward"></ion-icon>
          </ion-button>
        </div>
        
        <!-- Fullscreen toggle -->
        <ion-button 
          fill="clear" 
          class="fullscreen-button"
          (click)="toggleFullscreen()">
          <ion-icon [name]="fullscreen ? 'contract' : 'expand'"></ion-icon>
        </ion-button>
        
        <!-- Close button for fullscreen -->
        <ion-button 
          *ngIf="fullscreen"
          fill="clear" 
          class="close-button"
          (click)="closeFullscreen()">
          <ion-icon name="close"></ion-icon>
        </ion-button>
      </div>
      
      <!-- Image indicators -->
      <div class="image-indicators" *ngIf="images.length > 1 && showIndicators">
        <span 
          *ngFor="let image of images; let i = index"
          class="indicator"
          [class.active]="i === currentIndex"
          (click)="goToImage(i)">
        </span>
      </div>
    </div>
  `,
  styleUrls: ['./image-viewer.component.scss']
})
export class ImageViewerComponent {
  @Input() images: string[] = [];
  @Input() currentIndex: number = 0;
  @Input() alt: string = '';
  @Input() showIndicators: boolean = true;
  @Input() autoPlay: boolean = false;
  @Input() autoPlayInterval: number = 3000;

  @Output() imageChange = new EventEmitter<number>();
  @Output() fullscreenToggle = new EventEmitter<boolean>();

  fullscreen: boolean = false;
  imageLoaded: boolean = false;
  private autoPlayTimer?: any;

  get currentImage(): string {
    return this.images[this.currentIndex] || '';
  }

  ngOnInit(): void {
    if (this.autoPlay && this.images.length > 1) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  onImageLoad(): void {
    this.imageLoaded = true;
  }

  onImageError(): void {
    this.imageLoaded = true;
    // Could emit error event or show placeholder
  }

  previousImage(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.imageLoaded = false;
      this.imageChange.emit(this.currentIndex);
      this.restartAutoPlay();
    }
  }

  nextImage(): void {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
      this.imageLoaded = false;
      this.imageChange.emit(this.currentIndex);
      this.restartAutoPlay();
    }
  }

  goToImage(index: number): void {
    if (index >= 0 && index < this.images.length) {
      this.currentIndex = index;
      this.imageLoaded = false;
      this.imageChange.emit(this.currentIndex);
      this.restartAutoPlay();
    }
  }

  toggleFullscreen(): void {
    this.fullscreen = !this.fullscreen;
    this.fullscreenToggle.emit(this.fullscreen);
  }

  closeFullscreen(): void {
    this.fullscreen = false;
    this.fullscreenToggle.emit(this.fullscreen);
  }

  private startAutoPlay(): void {
    this.autoPlayTimer = setInterval(() => {
      if (this.currentIndex < this.images.length - 1) {
        this.nextImage();
      } else {
        this.goToImage(0); // Loop back to first image
      }
    }, this.autoPlayInterval);
  }

  private stopAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  private restartAutoPlay(): void {
    if (this.autoPlay) {
      this.stopAutoPlay();
      this.startAutoPlay();
    }
  }
}
