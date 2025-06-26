import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface WishlistItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    images: { url: string; alt: string }[];
    price: number;
    originalPrice?: number;
    brand: string;
    category: string;
    isActive: boolean;
    rating?: {
      average: number;
      count: number;
    };
    vendor: {
      _id: string;
      username: string;
      fullName: string;
      vendorInfo: {
        businessName: string;
      };
    };
  };
  size?: string;
  color?: string;
  price: number;
  originalPrice?: number;
  addedFrom: string;
  addedAt: Date;
  updatedAt: Date;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  isAvailable: boolean;
  vendor: string;
  likes: {
    user: {
      _id: string;
      username: string;
      fullName: string;
      avatar?: string;
    };
    likedAt: Date;
  }[];
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
    isEdited: boolean;
    editedAt?: Date;
  }[];
  likesCount: number;
  commentsCount: number;
}

export interface Wishlist {
  _id: string;
  user: string;
  items: WishlistItem[];
  totalItems: number;
  totalValue: number;
  totalSavings: number;
  lastUpdated: Date;
  isPublic: boolean;
  name: string;
  description?: string;
  tags: string[];
  shareSettings: {
    allowComments: boolean;
    allowLikes: boolean;
    shareableLink?: string;
  };
}

export interface WishlistSummary {
  totalItems: number;
  totalValue: number;
  totalSavings: number;
  itemCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class WishlistNewService {
  private apiUrl = 'http://localhost:5000/api/wishlist-new';
  private wishlistSubject = new BehaviorSubject<Wishlist | null>(null);
  private wishlistSummarySubject = new BehaviorSubject<WishlistSummary>({
    totalItems: 0,
    totalValue: 0,
    totalSavings: 0,
    itemCount: 0
  });

  public wishlist$ = this.wishlistSubject.asObservable();
  public wishlistSummary$ = this.wishlistSummarySubject.asObservable();
  public wishlistItemCount$ = this.wishlistSummarySubject.asObservable().pipe(
    map(summary => summary.totalItems)
  );

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Load wishlist when user logs in
    this.authService.currentUser$.subscribe(user => {
      if (user && user.role === 'customer') {
        this.loadWishlist();
      } else {
        this.clearLocalWishlist();
      }
    });
  }

  get currentWishlist(): Wishlist | null {
    return this.wishlistSubject.value;
  }

  get wishlistItemCount(): number {
    return this.wishlistSummarySubject.value.totalItems;
  }

  loadWishlist(): Observable<any> {
    if (!this.authService.requireCustomerAuth('access wishlist')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    return this.http.get<any>(`${this.apiUrl}`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.wishlistSubject.next(response.wishlist);
          this.wishlistSummarySubject.next(response.summary);
          console.log('💝 Wishlist loaded:', response.wishlist?.items?.length || 0, 'items');
        }
      })
    );
  }

  addToWishlist(productId: string, size?: string, color?: string, addedFrom: string = 'manual', notes?: string, priority: 'low' | 'medium' | 'high' = 'medium'): Observable<any> {
    if (!this.authService.requireCustomerAuth('add items to wishlist')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    const payload = {
      productId,
      size,
      color,
      addedFrom,
      notes,
      priority
    };

    return this.http.post<any>(`${this.apiUrl}/add`, payload, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.wishlistSubject.next(response.wishlist);
          this.wishlistSummarySubject.next(response.summary);
          this.showSuccessMessage(response.message);
          console.log('💝 Item added to wishlist, count updated:', response.summary?.totalItems || 0);
        }
      })
    );
  }

  updateWishlistItem(itemId: string, updates: { size?: string; color?: string; notes?: string; priority?: 'low' | 'medium' | 'high' }): Observable<any> {
    if (!this.authService.requireCustomerAuth('update wishlist items')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    return this.http.put<any>(`${this.apiUrl}/update/${itemId}`, updates, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.wishlistSubject.next(response.wishlist);
          this.wishlistSummarySubject.next(response.summary);
          this.showSuccessMessage(response.message);
        }
      })
    );
  }

  removeFromWishlist(itemId: string): Observable<any> {
    if (!this.authService.requireCustomerAuth('remove items from wishlist')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    return this.http.delete<any>(`${this.apiUrl}/remove/${itemId}`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.wishlistSubject.next(response.wishlist);
          this.wishlistSummarySubject.next(response.summary);
          this.showSuccessMessage(response.message);
          console.log('💝 Item removed from wishlist, count updated:', response.summary?.totalItems || 0);
        }
      })
    );
  }

  likeWishlistItem(itemId: string, wishlistUserId?: string): Observable<any> {
    if (!this.authService.requireAuth('like wishlist items')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    const payload = wishlistUserId ? { wishlistUserId } : {};

    return this.http.post<any>(`${this.apiUrl}/like/${itemId}`, payload, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.showSuccessMessage(response.message);
          // Refresh wishlist if it's the current user's wishlist
          if (!wishlistUserId || wishlistUserId === this.authService.currentUserValue?._id) {
            this.loadWishlist().subscribe();
          }
        }
      })
    );
  }

  unlikeWishlistItem(itemId: string, wishlistUserId?: string): Observable<any> {
    if (!this.authService.requireAuth('unlike wishlist items')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    const payload = wishlistUserId ? { wishlistUserId } : {};

    return this.http.delete<any>(`${this.apiUrl}/unlike/${itemId}`, {
      headers: this.authService.getAuthHeaders(),
      body: payload
    }).pipe(
      tap(response => {
        if (response.success) {
          this.showSuccessMessage(response.message);
          // Refresh wishlist if it's the current user's wishlist
          if (!wishlistUserId || wishlistUserId === this.authService.currentUserValue?._id) {
            this.loadWishlist().subscribe();
          }
        }
      })
    );
  }

  commentOnWishlistItem(itemId: string, text: string, wishlistUserId?: string): Observable<any> {
    if (!this.authService.requireAuth('comment on wishlist items')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    const payload = {
      text,
      ...(wishlistUserId && { wishlistUserId })
    };

    return this.http.post<any>(`${this.apiUrl}/comment/${itemId}`, payload, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.showSuccessMessage(response.message);
          // Refresh wishlist if it's the current user's wishlist
          if (!wishlistUserId || wishlistUserId === this.authService.currentUserValue?._id) {
            this.loadWishlist().subscribe();
          }
        }
      })
    );
  }

  moveToCart(itemId: string, quantity: number = 1): Observable<any> {
    if (!this.authService.requireCustomerAuth('move items to cart')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    return this.http.post<any>(`${this.apiUrl}/move-to-cart/${itemId}`, { quantity }, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.loadWishlist().subscribe(); // Refresh wishlist
          this.showSuccessMessage(response.message);
        }
      })
    );
  }

  // Quick add methods for different sources
  addFromPost(productId: string, size?: string, color?: string): Observable<any> {
    return this.addToWishlist(productId, size, color, 'post');
  }

  addFromStory(productId: string, size?: string, color?: string): Observable<any> {
    return this.addToWishlist(productId, size, color, 'story');
  }

  addFromProduct(productId: string, size?: string, color?: string): Observable<any> {
    return this.addToWishlist(productId, size, color, 'product');
  }

  addFromCart(productId: string, size?: string, color?: string): Observable<any> {
    return this.addToWishlist(productId, size, color, 'cart');
  }

  // Helper methods
  isInWishlist(productId: string, size?: string, color?: string): boolean {
    const wishlist = this.currentWishlist;
    if (!wishlist) return false;

    return wishlist.items.some(item => 
      item.product._id === productId &&
      item.size === size &&
      item.color === color
    );
  }

  hasLikedItem(itemId: string): boolean {
    const wishlist = this.currentWishlist;
    if (!wishlist) return false;

    const item = wishlist.items.find(item => item._id === itemId);
    if (!item) return false;

    const currentUserId = this.authService.currentUserValue?._id;
    return item.likes.some(like => like.user._id === currentUserId);
  }

  getTotalSavings(): number {
    return this.wishlistSummarySubject.value.totalSavings;
  }

  // Method to refresh wishlist on user login
  refreshWishlistOnLogin() {
    console.log('🔄 Refreshing wishlist on login...');
    this.loadWishlist().subscribe({
      next: () => {
        console.log('✅ Wishlist refreshed on login');
      },
      error: (error) => {
        console.error('❌ Error refreshing wishlist on login:', error);
      }
    });
  }

  // Method to clear wishlist on logout
  clearWishlistOnLogout() {
    console.log('🔄 Clearing wishlist on logout...');
    this.clearLocalWishlist();
  }

  private clearLocalWishlist(): void {
    this.wishlistSubject.next(null);
    this.wishlistSummarySubject.next({
      totalItems: 0,
      totalValue: 0,
      totalSavings: 0,
      itemCount: 0
    });
  }

  private showSuccessMessage(message: string): void {
    // TODO: Implement proper toast/notification system
    console.log('Wishlist Success:', message);
  }

  // Utility methods for wishlist calculations
  calculateItemSavings(item: WishlistItem): number {
    if (!item.originalPrice || item.originalPrice <= item.price) return 0;
    return item.originalPrice - item.price;
  }

  getDiscountPercentage(item: WishlistItem): number {
    if (!item.originalPrice || item.originalPrice <= item.price) return 0;
    return Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa726';
      case 'low': return '#66bb6a';
      default: return '#666';
    }
  }
}
