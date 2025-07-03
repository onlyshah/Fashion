import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { CartNewService } from './cart-new.service';
import { WishlistNewService } from './wishlist-new.service';
import { environment } from '../../../environments/environment';

export interface SocialPost {
  _id: string;
  user: {
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
    isVerified?: boolean;
  };
  caption: string;
  media: {
    type: 'image' | 'video';
    url: string;
    alt: string;
  }[];
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
    size?: string;
    color?: string;
  }[];
  hashtags: string[];
  likes: { user: string; likedAt: Date }[];
  comments: {
    _id: string;
    user: {
      _id: string;
      username: string;
      fullName: string;
      avatar?: string;
    };
    text: string;
    commentedAt: Date;
  }[];
  shares: { user: string; sharedAt: Date }[];
  saves: { user: string; savedAt: Date }[];
  analytics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    productClicks: number;
    purchases: number;
  };
  isLiked: boolean;
  isSaved: boolean;
  createdAt: Date;
}

export interface SocialStory {
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

@Injectable({
  providedIn: 'root'
})
export class SocialMediaService {
  private apiUrl = 'http://10.0.2.2:5000/api'; // Direct IP for testing
  private postsSubject = new BehaviorSubject<SocialPost[]>([]);
  private storiesSubject = new BehaviorSubject<SocialStory[]>([]);

  public posts$ = this.postsSubject.asObservable();
  public stories$ = this.storiesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cartService: CartNewService,
    private wishlistService: WishlistNewService
  ) {}

  // Posts API
  loadPosts(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/posts`, {
      params: { page: page.toString(), limit: limit.toString() },
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          if (page === 1) {
            this.postsSubject.next(response.posts);
          } else {
            const currentPosts = this.postsSubject.value;
            this.postsSubject.next([...currentPosts, ...response.posts]);
          }
        }
      })
    );
  }

  likePost(postId: string): Observable<any> {
    if (!this.authService.requireAuth('like posts')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    return this.http.post<any>(`${this.apiUrl}/posts/${postId}/like`, {}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.updatePostInList(postId, { isLiked: response.isLiked });
          const message = response.isLiked ? 'Post liked!' : 'Post unliked!';
          this.showSuccessMessage(message);
        }
      })
    );
  }

  unlikePost(postId: string): Observable<any> {
    // This method is kept for backward compatibility, but the likePost method now handles both like/unlike
    return this.likePost(postId);
  }

  commentOnPost(postId: string, text: string): Observable<any> {
    if (!this.authService.requireAuth('comment on posts')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    return this.http.post<any>(`${this.apiUrl}/posts/${postId}/comment`, { text }, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.showSuccessMessage('Comment added!');
          // Refresh posts to get updated comments
          this.loadPosts().subscribe();
        }
      })
    );
  }

  sharePost(postId: string): Observable<any> {
    if (!this.authService.requireAuth('share posts')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    return this.http.post<any>(`${this.apiUrl}/posts/${postId}/share`, {}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.showSuccessMessage('Post shared!');
        }
      })
    );
  }

  savePost(postId: string): Observable<any> {
    if (!this.authService.requireAuth('save posts')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    return this.http.post<any>(`${this.apiUrl}/posts/${postId}/save`, {}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.updatePostInList(postId, { isSaved: response.isSaved });
          const message = response.isSaved ? 'Post saved!' : 'Post unsaved!';
          this.showSuccessMessage(message);
        }
      })
    );
  }

  unsavePost(postId: string): Observable<any> {
    // The save endpoint handles both save/unsave, but keeping this method for clarity
    return this.savePost(postId);
  }

  // Stories API
  loadStories(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stories`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.storiesSubject.next(response.stories);
        }
      })
    );
  }

  viewStory(storyId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/stories/${storyId}/view`, {}, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // E-commerce integration
  buyNowFromPost(postId: string, productId: string): Observable<any> {
    if (!this.authService.requireCustomerAuth('purchase items')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    // Track analytics
    this.trackProductClick(postId, productId, 'buy_now').subscribe();

    // Navigate to checkout (handled by component)
    return new Observable(observer => {
      observer.next({ success: true, action: 'navigate_to_checkout' });
      observer.complete();
    });
  }

  addToCartFromPost(postId: string, productId: string, quantity: number = 1, size?: string, color?: string): Observable<any> {
    if (!this.authService.requireCustomerAuth('add items to cart')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    // Track analytics
    this.trackProductClick(postId, productId, 'add_to_cart').subscribe();

    // Add to cart
    return this.cartService.addFromPost(productId, quantity, size, color);
  }

  addToWishlistFromPost(postId: string, productId: string, size?: string, color?: string): Observable<any> {
    if (!this.authService.requireCustomerAuth('add items to wishlist')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    // Track analytics
    this.trackProductClick(postId, productId, 'add_to_wishlist').subscribe();

    // Add to wishlist
    return this.wishlistService.addFromPost(productId, size, color);
  }

  addToCartFromStory(storyId: string, productId: string, quantity: number = 1, size?: string, color?: string): Observable<any> {
    if (!this.authService.requireCustomerAuth('add items to cart')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    // Track analytics
    this.trackStoryProductClick(storyId, productId, 'add_to_cart').subscribe();

    // Add to cart
    return this.cartService.addFromStory(productId, quantity, size, color);
  }

  addToWishlistFromStory(storyId: string, productId: string, size?: string, color?: string): Observable<any> {
    if (!this.authService.requireCustomerAuth('add items to wishlist')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    // Track analytics
    this.trackStoryProductClick(storyId, productId, 'add_to_wishlist').subscribe();

    // Add to wishlist
    return this.wishlistService.addFromStory(productId, size, color);
  }

  // Analytics tracking
  private trackProductClick(postId: string, productId: string, action: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/posts/${postId}/analytics/product-click`, {
      productId,
      action
    }, {
      headers: this.authService.getAuthHeaders()
    });
  }

  private trackStoryProductClick(storyId: string, productId: string, action: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/stories/${storyId}/analytics/product-click`, {
      productId,
      action
    }, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Helper methods
  private updatePostInList(postId: string, updates: Partial<SocialPost>): void {
    const currentPosts = this.postsSubject.value;
    const updatedPosts = currentPosts.map(post => 
      post._id === postId ? { ...post, ...updates } : post
    );
    this.postsSubject.next(updatedPosts);
  }

  private showSuccessMessage(message: string): void {
    // TODO: Implement proper toast/notification system
    console.log('Social Media Success:', message);
  }

  // Utility methods
  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return new Date(date).toLocaleDateString();
  }

  formatNumber(num: number): string {
    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    return (num / 1000000).toFixed(1) + 'M';
  }
}
