import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { GestureController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-stories',
  templateUrl: './stories.page.html',
  styleUrls: ['./stories.page.scss'],
})
export class StoriesPage implements OnInit, OnDestroy {
  @ViewChild('storyContainer', { static: false }) storyContainer!: ElementRef;
  @ViewChild('storyVideo', { static: false }) storyVideo!: ElementRef;

  stories: any[] = [];
  currentIndex = 0;
  currentStory: any = null;
  isPlaying = true;
  isMuted = false;
  showProducts = false;
  selectedProduct: any = null;
  
  // Progress tracking
  progress = 0;
  progressTimer: any;
  storyDuration = 15000; // 15 seconds
  
  // Touch/gesture handling
  private gesture: any;
  private startX = 0;
  private startY = 0;
  private isLongPress = false;
  private longPressTimer: any;

  constructor(
    private router: Router,
    private gestureCtrl: GestureController,
    private platform: Platform
  ) {}

  ngOnInit() {
    this.loadStories();
  }

  ngOnDestroy() {
    this.clearTimers();
    if (this.gesture) {
      this.gesture.destroy();
    }
  }

  ionViewDidEnter() {
    this.setupGestures();
  }

  loadStories() {
    // Load stories from API with Instagram-like data structure
    fetch('http://localhost:5000/api/stories')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          this.stories = data.stories.filter((story: any) => story.isActive);
          if (this.stories.length > 0) {
            this.currentStory = this.stories[0];
            this.startStoryProgress();
          }
        }
      })
      .catch(error => {
        console.error('Error loading stories:', error);
        this.stories = [];
      });
  }



  setupGestures() {
    if (!this.storyContainer) return;

    this.gesture = this.gestureCtrl.create({
      el: this.storyContainer.nativeElement,
      threshold: 15,
      gestureName: 'story-swipe',
      onStart: (ev) => this.onGestureStart(ev),
      onMove: (ev) => this.onGestureMove(ev),
      onEnd: (ev) => this.onGestureEnd(ev)
    });

    this.gesture.enable();
  }

  onGestureStart(ev: any) {
    this.startX = ev.startX;
    this.startY = ev.startY;
    this.isLongPress = false;
    
    // Start long press timer for pause functionality
    this.longPressTimer = setTimeout(() => {
      this.isLongPress = true;
      this.pauseStory();
    }, 500);
  }

  onGestureMove(ev: any) {
    // Clear long press if user moves finger
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  onGestureEnd(ev: any) {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    if (this.isLongPress) {
      this.resumeStory();
      return;
    }

    const deltaX = ev.currentX - this.startX;
    const deltaY = ev.currentY - this.startY;

    // Horizontal swipe for next/previous story
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 50) {
        this.previousStory();
      } else if (deltaX < -50) {
        this.nextStory();
      }
    }
    // Vertical swipe for navigation
    else if (Math.abs(deltaY) > 100) {
      if (deltaY < 0) {
        // Swipe up - show products or go to profile
        this.toggleProducts();
      } else {
        // Swipe down - close stories
        this.closeStories();
      }
    }
    // Tap for next story
    else {
      const tapX = ev.currentX;
      const screenWidth = this.platform.width();
      
      if (tapX < screenWidth / 3) {
        this.previousStory();
      } else if (tapX > (screenWidth * 2) / 3) {
        this.nextStory();
      } else {
        this.togglePlayPause();
      }
    }
  }

  startStoryProgress() {
    this.clearTimers();
    this.progress = 0;
    
    const duration = this.currentStory?.media?.duration || this.storyDuration;
    const interval = 100; // Update every 100ms
    const increment = (interval / duration) * 100;
    
    this.progressTimer = setInterval(() => {
      if (this.isPlaying) {
        this.progress += increment;
        if (this.progress >= 100) {
          this.nextStory();
        }
      }
    }, interval);
  }

  nextStory() {
    if (this.currentIndex < this.stories.length - 1) {
      this.currentIndex++;
      this.currentStory = this.stories[this.currentIndex];
      this.startStoryProgress();
    } else {
      this.closeStories();
    }
  }

  previousStory() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.currentStory = this.stories[this.currentIndex];
      this.startStoryProgress();
    }
  }

  togglePlayPause() {
    this.isPlaying = !this.isPlaying;
    
    if (this.currentStory?.media?.type === 'video' && this.storyVideo) {
      const video = this.storyVideo.nativeElement;
      if (this.isPlaying) {
        video.play();
      } else {
        video.pause();
      }
    }
  }

  pauseStory() {
    this.isPlaying = false;
    if (this.currentStory?.media?.type === 'video' && this.storyVideo) {
      this.storyVideo.nativeElement.pause();
    }
  }

  resumeStory() {
    this.isPlaying = true;
    if (this.currentStory?.media?.type === 'video' && this.storyVideo) {
      this.storyVideo.nativeElement.play();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.currentStory?.media?.type === 'video' && this.storyVideo) {
      this.storyVideo.nativeElement.muted = this.isMuted;
    }
  }

  toggleProducts() {
    this.showProducts = !this.showProducts;
  }

  selectProduct(product: any) {
    this.selectedProduct = product;
    this.pauseStory();
  }

  closeProductModal() {
    this.selectedProduct = null;
    this.resumeStory();
  }

  addToCart(product: any) {
    // Add product to cart
    console.log('Adding to cart:', product);
    this.closeProductModal();
  }

  addToWishlist(product: any) {
    // Add product to wishlist
    console.log('Adding to wishlist:', product);
    this.closeProductModal();
  }

  closeStories() {
    this.clearTimers();
    this.router.navigate(['/tabs/home']);
  }

  clearTimers() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  viewProfile(user: any) {
    this.pauseStory();
    this.router.navigate(['/profile', user._id]);
  }

  shareStory() {
    // Implement share functionality
    console.log('Sharing story:', this.currentStory);
  }

  reportStory() {
    // Implement report functionality
    console.log('Reporting story:', this.currentStory);
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d`;
    }
  }
}
