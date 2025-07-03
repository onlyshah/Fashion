import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface WishlistItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    images: Array<{ url: string; alt?: string; isPrimary: boolean }>;
    brand: string;
    discount: number;
    rating: {
      average: number;
      count: number;
    };
    analytics: {
      views: number;
      likes: number;
    };
  };
  addedAt: Date;
}

export interface WishlistResponse {
  success: boolean;
  data: {
    items: WishlistItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly API_URL = 'http://10.0.2.2:5000/api'; // Direct IP for testing
  private wishlistItemsSubject = new BehaviorSubject<WishlistItem[]>([]);
  private wishlistCountSubject = new BehaviorSubject<number>(0);

  // Public observables
  public wishlistItems$ = this.wishlistItemsSubject.asObservable();
  public wishlistCount$ = this.wishlistCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeWishlist();
  }

  private initializeWishlist(): void {
    const token = localStorage.getItem('token');
    if (token) {
      // User is authenticated, load from API
      this.loadWishlist();
    } else {
      // Guest user, load from local storage only
      console.log('🔄 Guest user detected, loading wishlist from local storage only...');
      this.loadWishlistFromLocalStorage();
    }
  }

  getWishlist(page: number = 1, limit: number = 12): Observable<WishlistResponse> {
    const token = localStorage.getItem('token');
    const options = token ? {
      headers: { 'Authorization': `Bearer ${token}` }
    } : {};

    return this.http.get<WishlistResponse>(`${this.API_URL}/wishlist?page=${page}&limit=${limit}`, options).pipe(
      tap(response => {
        if (response.success) {
          this.wishlistItemsSubject.next(response.data.items);
          this.wishlistCountSubject.next(response.data.pagination.totalItems);
        }
      })
    );
  }

  addToWishlist(productId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const options = token ? {
      headers: { 'Authorization': `Bearer ${token}` }
    } : {};

    return this.http.post(`${this.API_URL}/wishlist`, {
      productId
    }, options).pipe(
      tap(() => {
        this.loadWishlist(); // Refresh wishlist after adding
      })
    );
  }

  removeFromWishlist(productId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const options = token ? {
      headers: { 'Authorization': `Bearer ${token}` }
    } : {};

    return this.http.delete(`${this.API_URL}/wishlist/${productId}`, options).pipe(
      tap(() => {
        this.loadWishlist(); // Refresh wishlist after removing
      })
    );
  }

  clearWishlist(): Observable<any> {
    return this.http.delete(`${this.API_URL}/wishlist`).pipe(
      tap(() => {
        this.wishlistItemsSubject.next([]);
        this.wishlistCountSubject.next(0);
      })
    );
  }

  moveToCart(productId: string, quantity: number = 1, size?: string, color?: string): Observable<any> {
    return this.http.post(`${this.API_URL}/wishlist/move-to-cart/${productId}`, {
      quantity,
      size,
      color
    }).pipe(
      tap(() => {
        this.loadWishlist(); // Refresh wishlist after moving
      })
    );
  }

  getWishlistCount(): number {
    return this.wishlistCountSubject.value;
  }

  isInWishlist(productId: string): boolean {
    const items = this.wishlistItemsSubject.value;
    return items.some(item => item.product._id === productId);
  }

  toggleWishlist(productId: string): Observable<any> {
    if (this.isInWishlist(productId)) {
      return this.removeFromWishlist(productId);
    } else {
      return this.addToWishlist(productId);
    }
  }

  private loadWishlist(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No authentication token, using local storage fallback');
      this.loadWishlistFromLocalStorage();
      return;
    }

    this.getWishlist().subscribe({
      next: (response) => {
        // Wishlist is already updated in the tap operator
      },
      error: (error) => {
        console.error('Failed to load wishlist:', error);
        if (error.status === 401) {
          console.log('❌ Authentication failed, clearing token');
          localStorage.removeItem('token');
        }
        // Use localStorage as fallback
        this.loadWishlistFromLocalStorage();
      }
    });
  }

  private loadWishlistFromLocalStorage(): void {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        const wishlistData = JSON.parse(savedWishlist);
        this.wishlistItemsSubject.next(wishlistData.items || []);
        this.wishlistCountSubject.next(wishlistData.items?.length || 0);
      }
    } catch (error) {
      console.error('Failed to load wishlist from localStorage:', error);
    }
  }

  // Get current wishlist count
  getCurrentCount(): number {
    return this.wishlistCountSubject.value;
  }

  // Sync with server when online
  syncWithServer(): Observable<any> {
    return this.getWishlist().pipe(
      tap((response: any) => {
        if (response && response.success) {
          const items = response.data?.items || [];
          this.wishlistItemsSubject.next(items);
          this.wishlistCountSubject.next(items.length);
        }
      })
    );
  }
}
