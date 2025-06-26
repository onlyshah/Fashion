import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface CartItem {
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
  quantity: number;
  size?: string;
  color?: string;
  price: number;
  originalPrice?: number;
  addedFrom: string;
  addedAt: Date;
  updatedAt: Date;
  notes?: string;
  isAvailable: boolean;
  vendor: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  totalOriginalAmount: number;
  totalSavings: number;
  lastUpdated: Date;
  isActive: boolean;
}

export interface CartSummary {
  totalItems: number;
  totalAmount: number;
  totalSavings: number;
  itemCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartNewService {
  private apiUrl = 'http://localhost:5000/api/cart-new';
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  private cartSummarySubject = new BehaviorSubject<CartSummary>({
    totalItems: 0,
    totalAmount: 0,
    totalSavings: 0,
    itemCount: 0
  });

  public cart$ = this.cartSubject.asObservable();
  public cartSummary$ = this.cartSummarySubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Load cart when user logs in
    this.authService.currentUser$.subscribe(user => {
      if (user && user.role === 'customer') {
        this.loadCart();
      } else {
        this.clearLocalCart();
      }
    });
  }

  get currentCart(): Cart | null {
    return this.cartSubject.value;
  }

  get cartItemCount(): number {
    return this.cartSummarySubject.value.totalItems;
  }

  loadCart(): Observable<any> {
    if (!this.authService.requireCustomerAuth('access cart')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    return this.http.get<any>(`${this.apiUrl}`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.cartSubject.next(response.cart);
          this.cartSummarySubject.next(response.summary);
        }
      })
    );
  }

  addToCart(productId: string, quantity: number = 1, size?: string, color?: string, addedFrom: string = 'manual', notes?: string): Observable<any> {
    if (!this.authService.requireCustomerAuth('add items to cart')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    const payload = {
      productId,
      quantity,
      size,
      color,
      addedFrom,
      notes
    };

    return this.http.post<any>(`${this.apiUrl}/add`, payload, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.cartSubject.next(response.cart);
          this.cartSummarySubject.next(response.summary);
          this.showSuccessMessage(response.message);
        }
      })
    );
  }

  updateCartItem(itemId: string, updates: { quantity?: number; size?: string; color?: string; notes?: string }): Observable<any> {
    if (!this.authService.requireCustomerAuth('update cart items')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    return this.http.put<any>(`${this.apiUrl}/update/${itemId}`, updates, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.cartSubject.next(response.cart);
          this.cartSummarySubject.next(response.summary);
          this.showSuccessMessage(response.message);
        }
      })
    );
  }

  removeFromCart(itemId: string): Observable<any> {
    if (!this.authService.requireCustomerAuth('remove items from cart')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    return this.http.delete<any>(`${this.apiUrl}/remove/${itemId}`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.cartSubject.next(response.cart);
          this.cartSummarySubject.next(response.summary);
          this.showSuccessMessage(response.message);
        }
      })
    );
  }

  clearCart(): Observable<any> {
    if (!this.authService.requireCustomerAuth('clear cart')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    return this.http.delete<any>(`${this.apiUrl}/clear`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.cartSubject.next(response.cart);
          this.cartSummarySubject.next(response.summary);
          this.showSuccessMessage(response.message);
        }
      })
    );
  }

  getCartByVendors(): Observable<any> {
    if (!this.authService.requireCustomerAuth('access cart')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    return this.http.get<any>(`${this.apiUrl}/vendors`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  moveToWishlist(itemId: string): Observable<any> {
    if (!this.authService.requireCustomerAuth('move items to wishlist')) {
      return new Observable(observer => observer.error('Authentication required'));
    }

    return this.http.post<any>(`${this.apiUrl}/move-to-wishlist/${itemId}`, {}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.loadCart().subscribe(); // Refresh cart
          this.showSuccessMessage(response.message);
        }
      })
    );
  }

  // Quick add methods for different sources
  addFromPost(productId: string, quantity: number = 1, size?: string, color?: string): Observable<any> {
    return this.addToCart(productId, quantity, size, color, 'post');
  }

  addFromStory(productId: string, quantity: number = 1, size?: string, color?: string): Observable<any> {
    return this.addToCart(productId, quantity, size, color, 'story');
  }

  addFromProduct(productId: string, quantity: number = 1, size?: string, color?: string): Observable<any> {
    return this.addToCart(productId, quantity, size, color, 'product');
  }

  addFromWishlist(productId: string, quantity: number = 1, size?: string, color?: string): Observable<any> {
    return this.addToCart(productId, quantity, size, color, 'wishlist');
  }

  // Helper methods
  isInCart(productId: string, size?: string, color?: string): boolean {
    const cart = this.currentCart;
    if (!cart) return false;

    return cart.items.some(item => 
      item.product._id === productId &&
      item.size === size &&
      item.color === color
    );
  }

  getCartItemQuantity(productId: string, size?: string, color?: string): number {
    const cart = this.currentCart;
    if (!cart) return 0;

    const item = cart.items.find(item => 
      item.product._id === productId &&
      item.size === size &&
      item.color === color
    );

    return item ? item.quantity : 0;
  }

  getTotalSavings(): number {
    return this.cartSummarySubject.value.totalSavings;
  }

  private clearLocalCart(): void {
    this.cartSubject.next(null);
    this.cartSummarySubject.next({
      totalItems: 0,
      totalAmount: 0,
      totalSavings: 0,
      itemCount: 0
    });
  }

  private showSuccessMessage(message: string): void {
    // TODO: Implement proper toast/notification system
    console.log('Cart Success:', message);
  }

  // Utility methods for cart calculations
  calculateItemTotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  calculateItemSavings(item: CartItem): number {
    if (!item.originalPrice || item.originalPrice <= item.price) return 0;
    return (item.originalPrice - item.price) * item.quantity;
  }

  getDiscountPercentage(item: CartItem): number {
    if (!item.originalPrice || item.originalPrice <= item.price) return 0;
    return Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
  }
}
