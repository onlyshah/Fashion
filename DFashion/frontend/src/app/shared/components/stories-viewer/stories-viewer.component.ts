import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-stories-viewer',
  templateUrl: './stories-viewer.component.html',
  styleUrls: ['./stories-viewer.component.scss']
})
export class StoriesViewerComponent implements OnInit, OnDestroy {
  @Input() stories: any[] = [];
  @Input() initialIndex: number = 0;
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() storyChange = new EventEmitter<number>();
  @Output() productClick = new EventEmitter<any>();

  @ViewChild('storyVideo') storyVideo!: ElementRef<HTMLVideoElement>;

  currentIndex = 0;
  currentStory: any = null;
  isPaused = false;
  isLoading = false;
  replyMessage = '';
  
  // Progress tracking
  storyProgress: number[] = [];
  progressInterval: any;
  storyTimer: any;
  
  // Touch handling
  touchStartX = 0;
  touchStartTime = 0;
  longPressTimer: any;
  
  // Story timing
  readonly IMAGE_DURATION = 5000; // 5 seconds for images
  readonly VIDEO_DURATION_MAX = 15000; // 15 seconds max for videos

  get isMobile(): boolean {
    return this.platform.is('mobile') || this.platform.is('mobileweb');
  }

  get currentStory(): any {
    return this.stories[this.currentIndex] || null;
  }

  constructor(private platform: Platform) {}

  ngOnInit() {
    this.currentIndex = this.initialIndex;
    this.initializeProgress();
    if (this.isVisible) {
      this.startStory();
    }
  }

  ngOnDestroy() {
    this.cleanup();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.isVisible) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        this.previousStory();
        break;
      case 'ArrowRight':
      case ' ':
        this.nextStory();
        break;
      case 'Escape':
        this.onClose();
        break;
    }
  }

  initializeProgress() {
    this.storyProgress = new Array(this.stories.length).fill(0);
  }

  startStory() {
    if (!this.currentStory) return;
    
    console.log('📱 Stories: Starting story', this.currentIndex);
    this.isPaused = false;
    this.storyChange.emit(this.currentIndex);
    
    // Reset progress for current story
    this.storyProgress[this.currentIndex] = 0;
    
    // Start progress animation
    this.startProgress();
    
    // Handle video autoplay
    if (this.currentStory.media?.type === 'video') {
      setTimeout(() => {
        this.playVideo();
      }, 100);
    }
  }

  startProgress() {
    this.clearTimers();
    
    const duration = this.getStoryDuration();
    const updateInterval = 50; // Update every 50ms for smooth animation
    const increment = (100 / duration) * updateInterval;
    
    this.progressInterval = setInterval(() => {
      if (!this.isPaused) {
        this.storyProgress[this.currentIndex] += increment;
        
        if (this.storyProgress[this.currentIndex] >= 100) {
          this.storyProgress[this.currentIndex] = 100;
          this.nextStory();
        }
      }
    }, updateInterval);
  }

  getStoryDuration(): number {
    if (this.currentStory?.media?.type === 'video') {
      const videoDuration = this.storyVideo?.nativeElement?.duration || 0;
      return videoDuration > 0 ? Math.min(videoDuration * 1000, this.VIDEO_DURATION_MAX) : this.VIDEO_DURATION_MAX;
    }
    return this.IMAGE_DURATION;
  }

  playVideo() {
    if (this.storyVideo?.nativeElement) {
      this.storyVideo.nativeElement.currentTime = 0;
      this.storyVideo.nativeElement.play().catch(error => {
        console.error('❌ Error playing video:', error);
      });
    }
  }

  pauseVideo() {
    if (this.storyVideo?.nativeElement) {
      this.storyVideo.nativeElement.pause();
    }
  }

  nextStory() {
    if (this.currentIndex < this.stories.length - 1) {
      this.storyProgress[this.currentIndex] = 100;
      this.currentIndex++;
      this.startStory();
    } else {
      this.onClose();
    }
  }

  previousStory() {
    if (this.currentIndex > 0) {
      this.storyProgress[this.currentIndex] = 0;
      this.currentIndex--;
      this.storyProgress[this.currentIndex] = 0;
      this.startStory();
    }
  }

  onPausePlay() {
    this.isPaused = !this.isPaused;
    
    if (this.currentStory?.media?.type === 'video') {
      if (this.isPaused) {
        this.pauseVideo();
      } else {
        this.playVideo();
      }
    }
  }

  onClose() {
    console.log('📱 Stories: Closing viewer');
    this.cleanup();
    this.close.emit();
  }

  cleanup() {
    this.clearTimers();
    this.pauseVideo();
  }

  clearTimers() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    if (this.storyTimer) {
      clearTimeout(this.storyTimer);
      this.storyTimer = null;
    }
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  // Touch and Click Handlers
  onStoryTap(event: Event) {
    event.stopPropagation();
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = (event as MouseEvent).clientX - rect.left;
    const width = rect.width;
    
    if (x < width / 3) {
      this.previousStory();
    } else if (x > (width * 2) / 3) {
      this.nextStory();
    } else {
      this.onPausePlay();
    }
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartTime = Date.now();
    
    // Long press to pause
    this.longPressTimer = setTimeout(() => {
      this.isPaused = true;
      if (this.currentStory?.media?.type === 'video') {
        this.pauseVideo();
      }
    }, 500);
  }

  onTouchEnd(event: TouchEvent) {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    
    const touchEndX = event.changedTouches[0].clientX;
    const touchDuration = Date.now() - this.touchStartTime;
    const swipeDistance = Math.abs(touchEndX - this.touchStartX);
    
    // If it was a long press, resume
    if (touchDuration > 500) {
      this.isPaused = false;
      if (this.currentStory?.media?.type === 'video') {
        this.playVideo();
      }
      return;
    }
    
    // Handle swipe gestures
    if (swipeDistance > 50) {
      if (touchEndX > this.touchStartX) {
        this.previousStory();
      } else {
        this.nextStory();
      }
    }
  }

  onPreviousStory(event: Event) {
    event.stopPropagation();
    this.previousStory();
  }

  onNextStory(event: Event) {
    event.stopPropagation();
    this.nextStory();
  }

  onOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  // Media Events
  onMediaLoaded() {
    this.isLoading = false;
    console.log('📱 Stories: Media loaded for story', this.currentIndex);
  }

  onVideoEnded() {
    console.log('📱 Stories: Video ended');
    this.nextStory();
  }

  // Interaction Handlers
  onProductClick(product: any, event: Event) {
    event.stopPropagation();
    console.log('📱 Stories: Product clicked', product);
    this.productClick.emit(product);
  }

  onHashtagClick(hashtag: string, event: Event) {
    event.stopPropagation();
    console.log('📱 Stories: Hashtag clicked', hashtag);
  }

  onMoreOptions() {
    console.log('📱 Stories: More options clicked');
  }

  onSendReply() {
    if (this.replyMessage?.trim()) {
      console.log('📱 Stories: Sending reply:', this.replyMessage);
      this.replyMessage = '';
    }
  }

  // Utility Methods
  getProgressWidth(index: number): number {
    if (index < this.currentIndex) return 100;
    if (index === this.currentIndex) return this.storyProgress[index] || 0;
    return 0;
  }

  getTimeAgo(date: string): string {
    const now = new Date();
    const storyDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - storyDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  }
}
