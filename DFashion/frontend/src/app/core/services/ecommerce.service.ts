import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  brand: string;
  category: string;
  images: { url: string; alt: string; isPrimary?: boolean }[];
  variants: {
    colors: string[];
    sizes: string[];
  };
  stock: {
    quantity: number;
    lowStockThreshold: number;
  };
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  analytics: {
    views: number;
    likes: number;
    shares: number;
    purchases: number;
  };
  likes: { user: string; likedAt: Date }[];
  shares: { user: string; platform: string; sharedAt: Date; message?: string }[];
  comments: {
    _id: string;
    user: { _id: string; username: string; fullName: string; avatar?: string };
    text: string;
    rating: number;
    likes: { user: string; likedAt: Date }[];
    commentedAt: Date;
    isEdited: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WishlistItem {
  _id: string;
  product: Product;
  addedAt: Date;
  addedFrom: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  size?: string;
  color?: string;
  priceWhenAdded: number;
  currentPrice?: number;
  isAvailable: boolean;
  likes: { user: string; likedAt: Date }[];
  comments: {
    _id: string;
    user: { _id: string; username: string; fullName: string; avatar?: string };
    text: string;
    commentedAt: Date;
  }[];
}

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
  originalPrice?: number;
  discount: number;
  addedAt: Date;
  addedFrom: string;
  isAvailable: boolean;
  stockStatus: string;
}

@Injectable({
  providedIn: 'root'
})
export class EcommerceService {
  private apiUrl = 'http://localhost:5000/api/ecommerce';
  
  // Subjects for real-time updates
  private wishlistSubject = new BehaviorSubject<WishlistItem[]>([]);
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  private savedItemsSubject = new BehaviorSubject<CartItem[]>([]);

  // Observables
  public wishlist$ = this.wishlistSubject.asObservable();
  public cart$ = this.cartSubject.asObservable();
  public savedItems$ = this.savedItemsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Load initial data if user is authenticated
    if (this.authService.isAuthenticated()) {
      this.loadWishlist();
      this.loadCart();
    }
  }

  // ==================== PRODUCT SOCIAL FEATURES ====================

  likeProduct(productId: string): Observable<any> {
    if (!this.authService.requireAuth('like products')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    return this.http.post<any>(`${this.apiUrl}/products/${productId}/like`, {}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.showSuccessMessage(response.message);
        }
      })
    );
  }

  shareProduct(productId: string, platform: string, message?: string, isPublic: boolean = false): Observable<any> {
    if (!this.authService.requireAuth('share products')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    return this.http.post<any>(`${this.apiUrl}/products/${productId}/share`, {
      platform,
      message,
      isPublic
    }, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.showSuccessMessage('Product shared successfully!');
          // Copy share URL to clipboard if copy_link platform
          if (platform === 'copy_link' && response.shareUrl) {
            navigator.clipboard.writeText(response.shareUrl);
            this.showSuccessMessage('Share link copied to clipboard!');
          }
        }
      })
    );
  }

  // ==================== WISHLIST SOCIAL FEATURES ====================

  likeWishlistItem(itemId: string): Observable<any> {
    if (!this.authService.requireAuth('like wishlist items')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    return this.http.post<any>(`${this.apiUrl}/wishlist/items/${itemId}/like`, {}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.showSuccessMessage(response.message);
          this.loadWishlist(); // Refresh wishlist
        }
      })
    );
  }

  commentOnWishlistItem(itemId: string, text: string): Observable<any> {
    if (!this.authService.requireAuth('comment on wishlist items')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    return this.http.post<any>(`${this.apiUrl}/wishlist/items/${itemId}/comment`, {
      text
    }, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.showSuccessMessage('Comment added successfully!');
          this.loadWishlist(); // Refresh wishlist
        }
      })
    );
  }

  deleteWishlistComment(itemId: string, commentId: string): Observable<any> {
    if (!this.authService.requireAuth('delete comments')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    return this.http.delete<any>(`${this.apiUrl}/wishlist/items/${itemId}/comments/${commentId}`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.showSuccessMessage('Comment deleted successfully!');
          this.loadWishlist(); // Refresh wishlist
        }
      })
    );
  }

  // ==================== CART SAVE FOR LATER ====================

  saveForLater(itemId: string): Observable<any> {
    if (!this.authService.requireAuth('save items for later')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    return this.http.post<any>(`${this.apiUrl}/cart/items/${itemId}/save-for-later`, {}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.showSuccessMessage('Item saved for later!');
          this.loadCart(); // Refresh cart
          this.loadSavedItems(); // Refresh saved items
        }
      })
    );
  }

  moveToCart(itemId: string): Observable<any> {
    if (!this.authService.requireAuth('move items to cart')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    return this.http.post<any>(`${this.apiUrl}/cart/saved/${itemId}/move-to-cart`, {}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.showSuccessMessage('Item moved to cart!');
          this.loadCart(); // Refresh cart
          this.loadSavedItems(); // Refresh saved items
        }
      })
    );
  }

  removeFromSaved(itemId: string): Observable<any> {
    if (!this.authService.requireAuth('remove saved items')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    return this.http.delete<any>(`${this.apiUrl}/cart/saved/${itemId}`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.showSuccessMessage('Item removed from saved for later!');
          this.loadSavedItems(); // Refresh saved items
        }
      })
    );
  }

  // ==================== DATA LOADING ====================

  private loadWishlist(): void {
    // Use existing wishlist service
    // This would integrate with WishlistNewService
    console.log('Loading wishlist...');
  }

  private loadCart(): void {
    // Use existing cart service
    // This would integrate with CartNewService
    console.log('Loading cart...');
  }

  private loadSavedItems(): void {
    // Load saved for later items
    console.log('Loading saved items...');
  }

  // ==================== ADMIN FEATURES ====================

  deleteProduct(productId: string): Observable<any> {
    if (!this.authService.requireSuperAdminAuth('delete products')) {
      return new Observable(observer => observer.error('Super admin access required'));
    }

    return this.http.delete<any>(`${this.apiUrl}/admin/products/${productId}`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.showSuccessMessage('Product deleted successfully!');
        }
      })
    );
  }

  getSystemAnalytics(): Observable<any> {
    if (!this.authService.requireSuperAdminAuth('view analytics')) {
      return new Observable(observer => observer.error('Super admin access required'));
    }

    return this.http.get<any>(`${this.apiUrl}/admin/analytics`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // ==================== UTILITY METHODS ====================

  private showSuccessMessage(message: string): void {
    // Success message logging for e-commerce actions
    console.log('E-commerce Success:', message);
  }

  // Get counts for UI badges
  getWishlistCount(): number {
    return this.wishlistSubject.value.length;
  }

  getCartCount(): number {
    return this.cartSubject.value.reduce((total, item) => total + item.quantity, 0);
  }

  getSavedItemsCount(): number {
    return this.savedItemsSubject.value.length;
  }

  // Check if product is liked by current user
  isProductLiked(product: Product): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;
    
    return product.likes.some(like => like.user === currentUser._id);
  }

  // Check if wishlist item is liked by current user
  isWishlistItemLiked(item: WishlistItem): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;
    
    return item.likes.some(like => like.user === currentUser._id);
  }

  // Format price for display
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  }

  // Calculate discount percentage
  calculateDiscountPercentage(originalPrice: number, currentPrice: number): number {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }
}
