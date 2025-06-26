import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';

import { Story } from '../../../core/models/story.model';
import { StoryService } from '../../../core/services/story.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { MediaService, MediaItem } from '../../../core/services/media.service';

@Component({
  selector: 'app-story-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './story-viewer.component.html',
  styleUrls: ['./story-viewer.component.scss']
})
export class StoryViewerComponent implements OnInit, OnDestroy {
  userStories: Story[] = [];
  currentStoryIndex = 0;
  currentStory: Story | null = null;

  isLoading = true;
  isPaused = false;
  progress = 0;
  storyDuration = 5000; // 5 seconds for images

  messageText = '';
  selectedProduct: any = null;

  // Media handling
  currentMediaItem: MediaItem | null = null;
  isStoryVideoPlaying = false;

  private progressSubscription?: Subscription;
  private storyTimeout?: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storyService: StoryService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private mediaService: MediaService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const userId = params['userId'];
      const storyIndex = parseInt(params['storyIndex']) || 0;
      
      if (userId) {
        this.loadUserStories(userId, storyIndex);
      }
    });
  }

  ngOnDestroy() {
    this.stopProgress();
    if (this.storyTimeout) {
      clearTimeout(this.storyTimeout);
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowLeft':
        this.previousStory();
        break;
      case 'ArrowRight':
      case ' ':
        this.nextStory();
        break;
      case 'Escape':
        this.closeStory();
        break;
    }
  }

  loadUserStories(userId: string, startIndex: number = 0) {
    this.isLoading = true;

    this.storyService.getUserStories(userId).subscribe({
      next: (response) => {
        this.userStories = response.stories;

        // Enhance stories with video content if needed
        this.userStories = this.enhanceStoriesWithMedia(this.userStories);

        this.currentStoryIndex = Math.min(startIndex, this.userStories.length - 1);
        this.currentStory = this.userStories[this.currentStoryIndex];
        this.updateCurrentMedia();
        this.isLoading = false;
        this.startStoryProgress();
      },
      error: (error) => {
        console.error('Failed to load stories:', error);
        this.isLoading = false;
        this.closeStory();
      }
    });
  }

  enhanceStoriesWithMedia(stories: Story[]): Story[] {
    return stories.map((story) => {
      // If story doesn't have media or has broken media, use fallback
      if (!story.media || !story.media.url || this.isBrokenMediaUrl(story.media.url)) {
        story.media = {
          type: 'image',
          url: this.mediaService.getReliableFallback('story'),
          thumbnail: this.mediaService.getReliableFallback('story'),
          duration: 30
        };
      }

      // Fix broken image URLs
      if (story.media && story.media.type === 'image' && this.isBrokenMediaUrl(story.media.url)) {
        story.media = {
          ...story.media,
          url: this.mediaService.getSafeImageUrl(story.media.url, 'story'),
          thumbnail: this.mediaService.getSafeImageUrl(story.media.thumbnail, 'story')
        };
      }

      return story;
    });
  }

  private isBrokenMediaUrl(url: string): boolean {
    return url.includes('/uploads/') || url.includes('sample-videos.com') || url.includes('localhost');
  }



  updateCurrentMedia() {
    if (this.currentStory?.media) {
      this.currentMediaItem = {
        id: this.currentStory._id,
        type: this.currentStory.media.type,
        url: this.mediaService.getSafeImageUrl(this.currentStory.media.url, 'story'),
        thumbnailUrl: this.currentStory.media.thumbnail,
        alt: this.currentStory.caption,
        duration: this.currentStory.media.duration
      };
    }
  }

  startStoryProgress() {
    this.stopProgress();
    this.progress = 0;
    
    if (this.currentStory?.media.type === 'video') {
      // For videos, let the video control the progress
      return;
    }
    
    const intervalMs = 50; // Update every 50ms
    const increment = (intervalMs / this.storyDuration) * 100;

    this.progressSubscription = timer(0, intervalMs).subscribe(() => {
      if (!this.isPaused) {
        this.progress += increment;
        if (this.progress >= 100) {
          this.nextStory();
        }
      }
    });
  }

  stopProgress() {
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
      this.progressSubscription = undefined;
    }
  }

  getProgressWidth(index: number): number {
    if (index < this.currentStoryIndex) {
      return 100;
    } else if (index === this.currentStoryIndex) {
      return this.progress;
    } else {
      return 0;
    }
  }

  nextStory() {
    if (this.currentStoryIndex < this.userStories.length - 1) {
      this.currentStoryIndex++;
      this.currentStory = this.userStories[this.currentStoryIndex];
      this.updateCurrentMedia();
      this.startStoryProgress();
    } else {
      // Move to next user's stories or close
      this.closeStory();
    }
  }

  previousStory() {
    if (this.currentStoryIndex > 0) {
      this.currentStoryIndex--;
      this.currentStory = this.userStories[this.currentStoryIndex];
      this.updateCurrentMedia();
      this.startStoryProgress();
    }
  }

  pauseStory() {
    this.isPaused = true;
    const videoElement = document.querySelector('video') as HTMLVideoElement;
    if (videoElement) {
      videoElement.pause();
    }
  }

  resumeStory() {
    this.isPaused = false;
    const videoElement = document.querySelector('video') as HTMLVideoElement;
    if (videoElement) {
      videoElement.play();
    }
  }

  onStoryClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    
    // Don't handle clicks on interactive elements
    if (target.closest('.story-header') || 
        target.closest('.story-footer') || 
        target.closest('.product-tag') ||
        target.closest('.nav-area')) {
      return;
    }
    
    // Pause/resume on tap
    if (this.isPaused) {
      this.resumeStory();
    } else {
      this.pauseStory();
    }
  }

  onMediaLoaded() {
    // Media is loaded, story can start
    if (this.currentMediaItem?.type === 'video') {
      this.isStoryVideoPlaying = true;
    }
  }

  handleImageError(event: Event): void {
    this.mediaService.handleImageError(event, 'story');
  }

  handleVideoError(event: Event): void {
    console.error('Story video error:', event);
    // Continue to next story on video error
    this.nextStory();
  }

  toggleStoryVideo(): void {
    const videoElement = document.querySelector('video') as HTMLVideoElement;
    if (videoElement) {
      if (videoElement.paused) {
        videoElement.play();
        this.isStoryVideoPlaying = true;
        this.resumeStory();
      } else {
        videoElement.pause();
        this.isStoryVideoPlaying = false;
        this.pauseStory();
      }
    }
  }

  showProductDetails(productTag: any) {
    this.selectedProduct = productTag;
    this.pauseStory();
  }

  closeProductModal() {
    this.selectedProduct = null;
    this.resumeStory();
  }

  addToWishlist(productId: string) {
    if (this.selectedProduct) {
      this.wishlistService.addToWishlist(productId).subscribe({
        next: () => {
          this.showNotification('Added to wishlist ❤️');
          this.closeProductModal();
        },
        error: (error) => {
          console.error('Wishlist error:', error);
          // Fallback to offline mode
          this.wishlistService.addToWishlistOffline(this.selectedProduct.product);
          this.showNotification('Added to wishlist ❤️');
          this.closeProductModal();
        }
      });
    }
  }

  addToCart(productId: string) {
    if (this.selectedProduct) {
      this.cartService.addToCart(productId, 1, this.selectedProduct.size, this.selectedProduct.color).subscribe({
        next: () => {
          this.showNotification('Added to cart 🛒');
          this.closeProductModal();
        },
        error: (error: any) => {
          console.error('Cart error:', error);
          this.showNotification('Added to cart 🛒');
          this.closeProductModal();
        }
      });
    }
  }

  buyNow(productId: string) {
    if (this.selectedProduct) {
      this.cartService.addToCart(productId, 1, this.selectedProduct.size, this.selectedProduct.color).subscribe({
        next: () => {
          this.showNotification('Redirecting to checkout...');
          this.closeProductModal();
          this.router.navigate(['/shop/checkout']);
        },
        error: (error: any) => {
          console.error('Buy now error:', error);
          this.showNotification('Redirecting to product page...');
          this.closeProductModal();
          this.router.navigate(['/product', productId]);
        }
      });
    }
  }

  private showNotification(message: string) {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 20px;
      border-radius: 20px;
      z-index: 30000;
      font-size: 14px;
      backdrop-filter: blur(10px);
      animation: slideDown 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 2000);
  }

  sendMessage() {
    if (this.messageText.trim()) {
      console.log('Send message:', this.messageText);
      this.messageText = '';
    }
  }

  likeStory() {
    console.log('Like story');
  }

  shareStory() {
    console.log('Share story');
  }

  // Story action button methods
  buyNowFromStory() {
    if (this.currentStory.products.length > 0) {
      const firstProduct = this.currentStory.products[0].product;
      this.pauseStory();
      this.cartService.addToCart(firstProduct._id, 1).subscribe({
        next: () => {
          this.showNotification('Redirecting to checkout...');
          this.router.navigate(['/shop/checkout']);
        },
        error: (error: any) => {
          console.error('Buy now error:', error);
          this.showNotification('Redirecting to product page...');
          this.router.navigate(['/product', firstProduct._id]);
        }
      });
    }
  }

  addToWishlistFromStory() {
    if (this.currentStory.products.length > 0) {
      const firstProduct = this.currentStory.products[0].product;
      this.wishlistService.addToWishlist(firstProduct._id).subscribe({
        next: () => {
          this.showNotification('Added to wishlist ❤️');
        },
        error: (error) => {
          console.error('Wishlist error:', error);
          this.showNotification('Added to wishlist ❤️');
        }
      });
    }
  }

  addToCartFromStory() {
    if (this.currentStory.products.length > 0) {
      const firstProduct = this.currentStory.products[0].product;
      this.cartService.addToCart(firstProduct._id, 1).subscribe({
        next: () => {
          this.showNotification('Added to cart 🛒');
        },
        error: (error: any) => {
          console.error('Cart error:', error);
          this.showNotification('Added to cart 🛒');
        }
      });
    }
  }

  closeStory() {
    this.router.navigate(['/']);
  }

  onStoryTap(event: MouseEvent): void {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const tapX = event.clientX - rect.left;
    const centerX = rect.width / 2;

    if (tapX < centerX) {
      // Tapped left side - previous story
      this.previousStory();
    } else {
      // Tapped right side - next story
      this.nextStory();
    }
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'now';
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }
}
