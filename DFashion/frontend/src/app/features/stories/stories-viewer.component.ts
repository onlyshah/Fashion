import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

interface Story {
  _id: string;
  user: {
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
  };
  media: {
    type: 'image' | 'video';
    url: string;
    duration: number;
    thumbnail?: string;
  };
  caption?: string;
  products: {
    _id: string;
    product: {
      _id: string;
      name: string;
      price: number;
      originalPrice?: number;
      images: { url: string; alt: string }[];
      brand: string;
    };
    position: { x: number; y: number };
  }[];
  viewers: { user: string; viewedAt: Date }[];
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
}

@Component({
  selector: 'app-stories-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stories-viewer.component.html',
  styleUrls: ['./stories-viewer.component.scss']
})
export class StoriesViewerComponent implements OnInit, OnDestroy {
  @ViewChild('storyVideo') storyVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('storyThumbnails') storyThumbnails!: ElementRef<HTMLDivElement>;

  stories: Story[] = [];
  currentIndex = 0;
  currentStory!: Story;
  isLiked = false;
  isMuted = true;
  isPaused = false;
  showProductTags = false;
  selectedProduct: any = null;
  showCommentsModal = false;
  comments: any[] = [];
  newComment = '';

  // Touch handling
  private touchStartTime = 0;
  private longPressTimer: any;

  // Navigation slider properties
  canScrollLeft = false;
  canScrollRight = false;

  private progressTimer: any;
  private storyDuration = 15000; // 15 seconds default

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Handle query parameters for story index
    this.route.queryParams.subscribe(queryParams => {
      if (queryParams['index']) {
        this.currentIndex = parseInt(queryParams['index'], 10) || 0;
      }
    });

    this.route.params.subscribe(params => {
      if (params['userId']) {
        this.loadUserStories(params['userId']);
      } else {
        this.loadStories();
      }
      if (params['storyId']) {
        this.jumpToStory(params['storyId']);
      }
    });

    // Add keyboard listeners for better UX
    this.addKeyboardListeners();
    this.addTouchListeners();

    // Initialize navigation slider after view init
    setTimeout(() => {
      this.updateScrollButtons();
      this.updateNavigationSlider();
    }, 100);
  }

  ngOnDestroy() {
    if (this.progressTimer) {
      clearTimeout(this.progressTimer);
    }
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
  }

  // Instagram-like interactions
  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.storyVideo) {
      if (this.isPaused) {
        this.storyVideo.nativeElement.pause();
        clearTimeout(this.progressTimer);
      } else {
        this.storyVideo.nativeElement.play();
        this.startStoryTimer();
      }
    }
  }

  toggleProductTags() {
    this.showProductTags = !this.showProductTags;
    if (this.showProductTags) {
      setTimeout(() => {
        this.showProductTags = false;
      }, 3000);
    }
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartTime = Date.now();
    this.longPressTimer = setTimeout(() => {
      this.isPaused = true;
      if (this.storyVideo) {
        this.storyVideo.nativeElement.pause();
      }
      clearTimeout(this.progressTimer);
    }, 200);
  }

  onTouchEnd(event: TouchEvent) {
    clearTimeout(this.longPressTimer);
    if (this.isPaused && Date.now() - this.touchStartTime > 200) {
      this.isPaused = false;
      if (this.storyVideo) {
        this.storyVideo.nativeElement.play();
      }
      this.startStoryTimer();
    }
  }

  onMouseDown(event: MouseEvent) {
    this.touchStartTime = Date.now();
    this.longPressTimer = setTimeout(() => {
      this.isPaused = true;
      if (this.storyVideo) {
        this.storyVideo.nativeElement.pause();
      }
      clearTimeout(this.progressTimer);
    }, 200);
  }

  onMouseUp(event: MouseEvent) {
    clearTimeout(this.longPressTimer);
    if (this.isPaused && Date.now() - this.touchStartTime > 200) {
      this.isPaused = false;
      if (this.storyVideo) {
        this.storyVideo.nativeElement.play();
      }
      this.startStoryTimer();
    }
  }

  onMediaLoaded() {
    // Media loaded, start timer
    this.startStoryTimer();
  }

  getStoryDuration(story: Story): number {
    return story.media.type === 'video' ? story.media.duration : 15;
  }

  handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowLeft':
        this.previousStory();
        break;
      case 'ArrowRight':
      case ' ':
        this.nextStory();
        break;
      case 'Escape':
        this.closeStories();
        break;
    }
  }



  loadStories() {
    // Load stories from real API
    fetch('http://10.0.2.2:5000/api/stories') // Direct IP for testing
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          this.stories = data.stories.filter((story: any) => story.isActive);
          if (this.stories.length > 0) {
            // Use the index from query params or default to 0
            const startIndex = Math.min(this.currentIndex, this.stories.length - 1);
            this.currentIndex = startIndex;
            this.currentStory = this.stories[startIndex];
            this.startStoryTimer();
            // Initialize navigation slider
            setTimeout(() => {
              this.updateScrollButtons();
              this.updateNavigationSlider();
            }, 100);
          }
        }
      })
      .catch(error => {
        console.error('Error loading stories:', error);
        // Show error message to user
        alert('Failed to load stories. Please try again.');
      });
  }

  loadUserStories(userId: string) {
    // Load specific user's stories from real API
    fetch(`http://localhost:5000/api/stories/user/${userId}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          this.stories = data.stories.filter((story: any) => story.isActive);
          if (this.stories.length > 0) {
            this.currentStory = this.stories[0];
            this.startStoryTimer();
          }
        }
      })
      .catch(error => {
        console.error('Error loading user stories:', error);
      });
  }

  jumpToStory(storyId: string) {
    const index = this.stories.findIndex(s => s._id === storyId);
    if (index !== -1) {
      this.currentIndex = index;
      this.currentStory = this.stories[index];
      this.startStoryTimer();
    }
  }

  startStoryTimer() {
    if (this.progressTimer) {
      clearTimeout(this.progressTimer);
    }
    
    const duration = this.currentStory.media.type === 'video' 
      ? this.currentStory.media.duration * 1000 
      : this.storyDuration;
    
    this.progressTimer = setTimeout(() => {
      this.nextStory();
    }, duration);
  }

  nextStory() {
    if (this.currentIndex < this.stories.length - 1) {
      this.currentIndex++;
      this.currentStory = this.stories[this.currentIndex];
      this.startStoryTimer();
      this.updateNavigationSlider();
    } else {
      this.closeStories();
    }
  }

  previousStory() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.currentStory = this.stories[this.currentIndex];
      this.startStoryTimer();
      this.updateNavigationSlider();
    }
  }

  jumpToStoryIndex(index: number) {
    if (index >= 0 && index < this.stories.length && index !== this.currentIndex) {
      this.currentIndex = index;
      this.currentStory = this.stories[index];
      this.startStoryTimer();
      this.updateNavigationSlider();
    }
  }

  handleStoryClick(event: MouseEvent) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    
    if (clickX < width * 0.3) {
      this.previousStory();
    } else if (clickX > width * 0.7) {
      this.nextStory();
    }
  }

  getProgressWidth(index: number): number {
    if (index < this.currentIndex) return 100;
    if (index > this.currentIndex) return 0;
    return 0; // Will be animated by CSS
  }

  // Navigation slider methods
  getStoryThumbnail(story: Story): string {
    if (story.media.type === 'video' && story.media.thumbnail) {
      return story.media.thumbnail;
    }
    return story.media.url;
  }

  getThumbnailProgress(index: number): number {
    if (index < this.currentIndex) return 100;
    if (index > this.currentIndex) return 0;
    if (index === this.currentIndex) {
      // Calculate current progress based on timer
      return 0; // Will be updated by progress animation
    }
    return 0;
  }

  scrollStoriesLeft() {
    if (this.storyThumbnails) {
      const container = this.storyThumbnails.nativeElement;
      container.scrollBy({ left: -200, behavior: 'smooth' });
      setTimeout(() => this.updateScrollButtons(), 300);
    }
  }

  scrollStoriesRight() {
    if (this.storyThumbnails) {
      const container = this.storyThumbnails.nativeElement;
      container.scrollBy({ left: 200, behavior: 'smooth' });
      setTimeout(() => this.updateScrollButtons(), 300);
    }
  }

  updateNavigationSlider() {
    if (this.storyThumbnails && this.stories.length > 5) {
      const container = this.storyThumbnails.nativeElement;
      const thumbnailWidth = 56; // 48px + 8px gap
      const containerWidth = container.clientWidth;
      const currentThumbnailPosition = this.currentIndex * thumbnailWidth;

      // Center the current thumbnail
      const scrollPosition = currentThumbnailPosition - (containerWidth / 2) + (thumbnailWidth / 2);
      container.scrollTo({ left: scrollPosition, behavior: 'smooth' });

      setTimeout(() => this.updateScrollButtons(), 300);
    }
  }

  updateScrollButtons() {
    if (this.storyThumbnails) {
      const container = this.storyThumbnails.nativeElement;
      this.canScrollLeft = container.scrollLeft > 0;
      this.canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth);
    }
  }

  closeStories() {
    // Navigate back to the previous page or home
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/social']);
    }
  }

  // E-commerce actions
  buyNow() {
    if (this.currentStory.products.length > 0) {
      const product = this.currentStory.products[0].product;
      this.router.navigate(['/checkout'], { 
        queryParams: { productId: product._id, source: 'story' } 
      });
    }
  }

  addToCart() {
    if (this.currentStory.products.length > 0) {
      const product = this.currentStory.products[0].product;
      // TODO: Add to cart via service
      console.log('Add to cart from story:', product);
    }
  }

  addToWishlist() {
    if (this.currentStory.products.length > 0) {
      const product = this.currentStory.products[0].product;
      // TODO: Add to wishlist via service
      console.log('Add to wishlist from story:', product);
    }
  }

  // Social actions
  toggleLike() {
    this.isLiked = !this.isLiked;
    // TODO: Like/unlike story via API
  }

  openComments() {
    this.showCommentsModal = true;
    this.loadComments();
  }

  closeComments() {
    this.showCommentsModal = false;
  }

  shareStory() {
    // TODO: Implement share functionality
    console.log('Share story:', this.currentStory);
  }

  toggleSound() {
    this.isMuted = !this.isMuted;
    if (this.storyVideo) {
      this.storyVideo.nativeElement.muted = this.isMuted;
    }
  }

  // Product modal
  showProductModal(product: any) {
    this.selectedProduct = product;
  }

  closeProductModal() {
    this.selectedProduct = null;
  }

  // Direct product navigation
  viewProduct(productId: string): void {
    // Track product click analytics
    this.trackProductClick(productId, 'view_product');

    // Navigate to product detail page
    this.router.navigate(['/shop/product', productId]);
  }

  viewCategory(categoryId: string): void {
    // Navigate to category page
    this.router.navigate(['/shop/category', categoryId]);
  }

  private trackProductClick(productId: string, action: string): void {
    // Track analytics for product clicks from stories
    console.log(`Story product ${action} tracked:`, productId);
    // TODO: Implement analytics tracking API call
  }

  buyProductNow() {
    if (this.selectedProduct) {
      this.router.navigate(['/checkout'], { 
        queryParams: { productId: this.selectedProduct._id, source: 'story' } 
      });
    }
  }

  addProductToCart() {
    if (this.selectedProduct) {
      // TODO: Add to cart via service
      console.log('Add product to cart:', this.selectedProduct);
      this.closeProductModal();
    }
  }

  addProductToWishlist() {
    if (this.selectedProduct) {
      // TODO: Add to wishlist via service
      console.log('Add product to wishlist:', this.selectedProduct);
      this.closeProductModal();
    }
  }

  // Comments
  loadComments() {
    // Load comments from API
    this.comments = [];
  }

  addComment() {
    if (this.newComment.trim()) {
      // TODO: Add comment via API
      console.log('Add comment:', this.newComment);
      this.newComment = '';
    }
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'now';
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  }

  getProductName(): string {
    return this.currentStory?.products?.[0]?.product?.name || 'Product';
  }



  // Keyboard and touch event listeners
  addKeyboardListeners() {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        this.previousStory();
      } else if (event.key === 'ArrowRight') {
        this.nextStory();
      } else if (event.key === 'Escape') {
        this.closeStories();
      }
    });
  }

  addTouchListeners() {
    let startX = 0;
    let startY = 0;

    document.addEventListener('touchstart', (event) => {
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    });

    document.addEventListener('touchend', (event) => {
      const endX = event.changedTouches[0].clientX;
      const endY = event.changedTouches[0].clientY;
      const diffX = startX - endX;
      const diffY = startY - endY;

      // Horizontal swipe
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          this.nextStory(); // Swipe left - next story
        } else {
          this.previousStory(); // Swipe right - previous story
        }
      }
      // Vertical swipe down to close
      else if (diffY < -100) {
        this.closeStories();
      }
    });
  }
}
