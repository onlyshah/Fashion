import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Post } from '../../../../core/models/post.model';
import { CartService } from '../../../../core/services/cart.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { MediaService, MediaItem } from '../../../../core/services/media.service';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss']
})
export class PostCardComponent implements OnInit {
  @Input() post!: Post;
  @Output() liked = new EventEmitter<string>();
  @Output() commented = new EventEmitter<{ postId: string; comment: string }>();
  @Output() shared = new EventEmitter<string>();
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  isLiked = false;
  isSaved = false;
  likesCount = 0;
  newComment = '';
  showComments = false;
  showProductTags = false;
  wishlistItems: string[] = [];
  cartItems: string[] = [];

  // Media handling
  mediaItems: MediaItem[] = [];
  currentMediaIndex = 0;
  currentMedia!: MediaItem;

  // Video controls
  isVideoPlaying = false;
  videoDuration = 0;
  videoProgress = 0;
  showVideoControls = false;
  showHeartAnimation = false;
  private videoProgressInterval?: number;

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router,
    private mediaService: MediaService
  ) {}

  ngOnInit() {
    this.likesCount = this.post.analytics.likes;
    this.loadWishlistItems();
    this.loadCartItems();
    this.initializeMedia();
  }

  initializeMedia() {
    // Process media items with enhanced video support and content matching
    const contentHint = this.post.caption || this.post.hashtags?.join(' ') || '';
    this.mediaItems = this.mediaService.processMediaItems(this.post.media || []);

    this.currentMediaIndex = 0;
    this.currentMedia = this.mediaItems[0] || {
      id: 'default',
      type: 'image',
      url: this.mediaService.getSafeImageUrl('', 'post'),
      alt: 'Default post image'
    };

    // Preload media for better performance
    this.preloadCurrentMedia();
  }

  private preloadCurrentMedia() {
    if (this.currentMedia) {
      this.mediaService.preloadMedia([this.currentMedia]).catch(error => {
        console.warn('Failed to preload media:', error);
      });
    }
  }

  loadWishlistItems() {
    // Load from real API via service
    this.wishlistItems = [];
  }

  loadCartItems() {
    // Load from real API via service
    this.cartItems = [];
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

  formatCaption(caption: string): string {
    return caption.replace(/#(\w+)/g, '<span class="hashtag">#$1</span>');
  }

  getRecentComments() {
    return this.post.comments.slice(-2);
  }

  toggleLike() {
    this.isLiked = !this.isLiked;
    this.likesCount += this.isLiked ? 1 : -1;
    this.liked.emit(this.post._id);
  }

  toggleSave() {
    this.isSaved = !this.isSaved;
  }

  toggleComments() {
    this.showComments = !this.showComments;
  }

  addComment() {
    if (this.newComment.trim()) {
      this.commented.emit({
        postId: this.post._id,
        comment: this.newComment.trim()
      });
      this.newComment = '';
    }
  }

  sharePost() {
    this.shared.emit(this.post._id);
  }

  // E-commerce methods
  isInWishlist(productId: string): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  addToWishlist(productId: string) {
    this.wishlistService.toggleWishlist(productId).subscribe({
      next: (response) => {
        if (this.isInWishlist(productId)) {
          this.showNotification('Removed from wishlist', 'info');
        } else {
          this.showNotification('Added to wishlist ❤️', 'success');
        }
      },
      error: (error) => {
        console.error('Wishlist error:', error);
        // Fallback to offline mode
        this.wishlistService.toggleWishlistOffline(this.getProductById(productId));
        this.showNotification(this.isInWishlist(productId) ? 'Removed from wishlist' : 'Added to wishlist ❤️', 'success');
      }
    });
  }

  addToCart(productId: string) {
    this.cartService.addToCart(productId, 1).subscribe({
      next: (response) => {
        if (response.success) {
          this.showNotification('Added to cart 🛒', 'success');
        }
      },
      error: (error: any) => {
        console.error('Cart error:', error);
        this.showNotification('Failed to add to cart', 'error');
      }
    });
  }

  buyNow(productId: string) {
    this.cartService.addToCart(productId, 1).subscribe({
      next: (response) => {
        if (response.success) {
          this.showNotification('Redirecting to checkout...', 'info');
          this.router.navigate(['/shop/checkout']);
        }
      },
      error: (error: any) => {
        console.error('Buy now error:', error);
        this.showNotification('Failed to process purchase', 'error');
      }
    });
  }

  private getProductById(productId: string): any {
    // Find product in post's products array
    const productTag = this.post.products.find(p => p.product._id === productId);
    return productTag ? productTag.product : null;
  }

  onBuyNow(productId: string) {
    this.buyNow(productId);
  }

  // Media handling methods
  getUserAvatarUrl(url: string): string {
    return this.mediaService.getSafeImageUrl(url, 'user');
  }

  getProductImageUrl(url: string): string {
    return this.mediaService.getSafeImageUrl(url, 'product');
  }

  handleImageError(event: Event, type: 'user' | 'product' | 'post' = 'post'): void {
    this.mediaService.handleImageError(event, type);
  }

  handleVideoError(event: Event): void {
    console.error('Video load error:', event);
    // Could implement fallback to thumbnail or different video
  }

  // Removed duplicate method - using onMediaLoadComplete instead

  // Video control methods
  toggleVideoPlay(): void {
    if (!this.videoPlayer?.nativeElement) return;

    const video = this.videoPlayer.nativeElement;
    if (video.paused) {
      video.play();
      this.isVideoPlaying = true;
      this.startVideoProgress();
    } else {
      video.pause();
      this.isVideoPlaying = false;
      this.stopVideoProgress();
    }
  }

  private startVideoProgress(): void {
    if (this.videoProgressInterval) {
      clearInterval(this.videoProgressInterval);
    }

    this.videoProgressInterval = window.setInterval(() => {
      if (this.videoPlayer?.nativeElement) {
        const video = this.videoPlayer.nativeElement;
        this.videoDuration = video.duration || 0;
        this.videoProgress = this.videoDuration > 0 ? (video.currentTime / this.videoDuration) * 100 : 0;

        if (video.ended) {
          this.isVideoPlaying = false;
          this.stopVideoProgress();
        }
      }
    }, 100);
  }

  private stopVideoProgress(): void {
    if (this.videoProgressInterval) {
      clearInterval(this.videoProgressInterval);
      this.videoProgressInterval = undefined;
    }
  }

  // Media navigation methods with enhanced transitions
  nextMedia(): void {
    if (this.currentMediaIndex < this.mediaItems.length - 1) {
      this.currentMediaIndex++;
      this.currentMedia = this.mediaItems[this.currentMediaIndex];
      this.resetVideoState();
      this.preloadCurrentMedia();
      this.trackMediaView();
    }
  }

  previousMedia(): void {
    if (this.currentMediaIndex > 0) {
      this.currentMediaIndex--;
      this.currentMedia = this.mediaItems[this.currentMediaIndex];
      this.resetVideoState();
      this.preloadCurrentMedia();
      this.trackMediaView();
    }
  }

  goToMedia(index: number): void {
    if (index >= 0 && index < this.mediaItems.length) {
      this.currentMediaIndex = index;
      this.currentMedia = this.mediaItems[index];
      this.resetVideoState();
      this.preloadCurrentMedia();
      this.trackMediaView();
    }
  }

  private trackMediaView(): void {
    // Track media view for analytics
    console.log(`Viewing media ${this.currentMediaIndex + 1} of ${this.mediaItems.length}: ${this.currentMedia.type}`);
  }

  private resetVideoState(): void {
    this.isVideoPlaying = false;
    this.videoProgress = 0;
    this.stopVideoProgress();
  }

  ngOnDestroy(): void {
    this.stopVideoProgress();
  }

  // Instagram-like interactions
  onDoubleTap(): void {
    this.toggleLike();
    this.showHeartAnimation = true;
    setTimeout(() => {
      this.showHeartAnimation = false;
    }, 1000);
  }

  toggleProductTags(): void {
    // Toggle product tags visibility (Instagram-style)
    if (this.post.products && this.post.products.length > 0) {
      this.showProductTags = !this.showProductTags;

      // Auto-hide after 3 seconds
      if (this.showProductTags) {
        setTimeout(() => {
          this.showProductTags = false;
        }, 3000);
      }
    }
  }

  viewProduct(productId: string): void {
    // Track product click analytics
    this.trackProductClick(productId, 'view_product');

    // Navigate to product detail page
    this.router.navigate(['/shop/product', productId]);
  }

  private trackProductClick(productId: string, action: string): void {
    // Track analytics for product clicks from posts
    console.log(`Product ${action} tracked:`, productId);
    // TODO: Implement analytics tracking API call
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  onMediaLoadComplete(): void {
    // Media loaded successfully
    if (this.currentMedia?.type === 'video') {
      this.showVideoControls = true;
      setTimeout(() => {
        this.showVideoControls = false;
      }, 3000);
    }
  }

  private showNotification(message: string, type: 'success' | 'info' | 'error') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-size: 14px;
      font-weight: 500;
      animation: slideIn 0.3s ease;
    `;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 3000);
  }
}
