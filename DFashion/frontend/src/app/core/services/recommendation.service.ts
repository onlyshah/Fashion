import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of, timer } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface RecommendationProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  images: Array<{ url: string; alt: string; isPrimary: boolean }>;
  category: string;
  subcategory: string;
  brand: string;
  rating: { average: number; count: number };
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  recommendationScore?: number;
  recommendationReason?: string;
}

export interface TrendingProduct extends RecommendationProduct {
  trendingScore: number;
  trendingReason: string;
  viewCount: number;
  purchaseCount: number;
  shareCount: number;
  engagementRate: number;
}

export interface UserAnalytics {
  userId: string;
  viewHistory: Array<{
    productId: string;
    category: string;
    timestamp: Date;
    duration: number;
  }>;
  searchHistory: Array<{
    query: string;
    category?: string;
    timestamp: Date;
    resultsClicked: number;
  }>;
  purchaseHistory: Array<{
    productId: string;
    category: string;
    price: number;
    timestamp: Date;
  }>;
  wishlistItems: string[];
  cartItems: string[];
  preferredCategories: string[];
  priceRange: { min: number; max: number };
  brandPreferences: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private apiUrl = 'http://localhost:5000/api';
  private userAnalytics$ = new BehaviorSubject<UserAnalytics | null>(null);
  private realTimeRecommendations$ = new BehaviorSubject<RecommendationProduct[]>([]);
  private userBehavior$ = new BehaviorSubject<any>(null);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Start real-time recommendation updates
    this.startRealTimeUpdates();
  }

  // Suggested for You - Personalized Recommendations
  getSuggestedProducts(userId?: string, limit: number = 10): Observable<RecommendationProduct[]> {
    const params = new HttpParams()
      .set('userId', userId || '')
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrl}/recommendations/suggested`, { params })
      .pipe(
        map(response => response.success ? response.data : []),
        tap(recommendations => {
          // Update real-time recommendations
          this.realTimeRecommendations$.next(recommendations);
        }),
        catchError(error => {
          console.error('Error fetching suggested products:', error);
          return this.getFallbackSuggestedProducts(limit);
        })
      );
  }

  // Trending Products - Based on Analytics
  getTrendingProducts(category?: string, limit: number = 10): Observable<TrendingProduct[]> {
    // For demo purposes, return fallback data immediately to avoid API calls
    console.log('📈 Loading trending products (offline mode)');
    return this.getFallbackTrendingProducts(limit);

    /* API version - uncomment when backend is available
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrl}/recommendations/trending?${params.toString()}`)
      .pipe(
        map(response => response.success ? response.data : []),
        catchError(error => {
          console.error('Error fetching trending products:', error);
          return this.getFallbackTrendingProducts(limit);
        })
      );
    */
  }

  // Similar Products - Based on Product
  getSimilarProducts(productId: string, limit: number = 6): Observable<RecommendationProduct[]> {
    return this.http.get<any>(`${this.apiUrl}/recommendations/similar/${productId}?limit=${limit}`)
      .pipe(
        map(response => response.success ? response.data : []),
        catchError(error => {
          console.error('Error fetching similar products:', error);
          return this.getFallbackSimilarProducts(limit);
        })
      );
  }

  // Recently Viewed Products
  getRecentlyViewed(userId: string, limit: number = 8): Observable<RecommendationProduct[]> {
    return this.http.get<any>(`${this.apiUrl}/recommendations/recent/${userId}?limit=${limit}`)
      .pipe(
        map(response => response.success ? response.data : []),
        catchError(error => {
          console.error('Error fetching recently viewed:', error);
          return this.getFallbackRecentProducts(limit);
        })
      );
  }

  // Track User Behavior for Analytics
  trackProductView(productId: string, category: string, duration: number = 0, source: string = 'unknown'): Observable<any> {
    const headers = this.authService.getAuthHeaders();

    return this.http.post(`${this.apiUrl}/recommendations/track-view`, {
      productId,
      category,
      duration,
      source,
      timestamp: new Date()
    }, { headers }).pipe(
      tap(response => {
        console.log('Product view tracked:', response);
      }),
      catchError(error => {
        console.error('Error tracking product view:', error);
        return of(null);
      })
    );
  }

  // Track any user interaction
  trackInteraction(type: string, targetId: string, targetType: string, metadata: any = {}): Observable<any> {
    const headers = this.authService.getAuthHeaders();

    return this.http.post(`${this.apiUrl}/recommendations/track-interaction`, {
      type,
      targetId,
      targetType,
      metadata: {
        ...metadata,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    }, { headers }).pipe(
      tap(response => {
        console.log('Interaction tracked:', response);
        // Update user behavior data
        if ((response as any)?.success) {
          this.updateUserBehavior(response);
        }
      }),
      catchError(error => {
        console.error('Error tracking interaction:', error);
        return of(null);
      })
    );
  }



  trackPurchase(productId: string, category: string, price: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/analytics/track-purchase`, {
      productId,
      category,
      price,
      timestamp: new Date()
    }).pipe(
      catchError(error => {
        console.error('Error tracking purchase:', error);
        return [];
      })
    );
  }

  // User Analytics
  getUserAnalytics(userId?: string): Observable<any> {
    if (!userId) {
      return this.userAnalytics$.asObservable();
    }

    const headers = this.authService.getAuthHeaders();

    return this.http.get<any>(`${this.apiUrl}/recommendations/user-analytics/${userId}`, { headers })
      .pipe(
        map(response => response.success ? response.data : null),
        tap(analytics => {
          if (analytics) {
            this.userAnalytics$.next(analytics);
          }
        }),
        catchError(error => {
          console.error('Error fetching user analytics:', error);
          return of(this.getDefaultAnalytics(userId));
        })
      );
  }

  // Get recommendation insights
  getRecommendationInsights(userId: string): Observable<any> {
    const headers = this.authService.getAuthHeaders();

    return this.http.get<any>(`${this.apiUrl}/recommendations/insights/${userId}`, { headers })
      .pipe(
        map(response => response.success ? response.data : null),
        catchError(error => {
          console.error('Error fetching recommendation insights:', error);
          return of(null);
        })
      );
  }

  // Real-time recommendations observable
  getRealTimeRecommendations(): Observable<RecommendationProduct[]> {
    return this.realTimeRecommendations$.asObservable();
  }

  // User behavior observable
  getUserBehavior(): Observable<any> {
    return this.userBehavior$.asObservable();
  }

  // Start real-time updates
  private startRealTimeUpdates(): void {
    // Update recommendations every 5 minutes if user is active
    timer(0, 5 * 60 * 1000).pipe(
      switchMap(() => {
        return this.authService.getCurrentUser().pipe(
          switchMap(response => {
            if (response?.user?._id) {
              return this.getSuggestedProducts(response.user._id, 10);
            }
            return of([]);
          }),
          catchError(() => of([]))
        );
      })
    ).subscribe();

    // Update user analytics every 10 minutes
    timer(0, 10 * 60 * 1000).pipe(
      switchMap(() => {
        return this.authService.getCurrentUser().pipe(
          switchMap(response => {
            if (response?.user?._id) {
              return this.getUserAnalytics(response.user._id);
            }
            return of(null);
          }),
          catchError(() => of(null))
        );
      })
    ).subscribe();
  }

  // Update user behavior data
  private updateUserBehavior(response: any): void {
    if (response.userSegment || response.engagementLevel) {
      const currentBehavior = this.userBehavior$.value || {};
      this.userBehavior$.next({
        ...currentBehavior,
        userSegment: response.userSegment,
        engagementLevel: response.engagementLevel,
        lastUpdate: new Date()
      });
    }
  }

  // Convenience methods for common tracking actions
  trackProductLike(productId: string, metadata: any = {}): Observable<any> {
    return this.trackInteraction('product_like', productId, 'product', metadata);
  }

  trackProductShare(productId: string, platform: string, metadata: any = {}): Observable<any> {
    return this.trackInteraction('product_share', productId, 'product', {
      ...metadata,
      platform
    });
  }

  trackProductPurchase(productId: string, metadata: any = {}): Observable<any> {
    return this.trackInteraction('product_purchase', productId, 'product', metadata);
  }

  trackCartAdd(productId: string, metadata: any = {}): Observable<any> {
    return this.trackInteraction('cart_add', productId, 'product', metadata);
  }

  trackWishlistAdd(productId: string, metadata: any = {}): Observable<any> {
    return this.trackInteraction('wishlist_add', productId, 'product', metadata);
  }

  trackSearch(query: string, filters: any = {}, results: number = 0): Observable<any> {
    return this.trackInteraction('search', 'search', 'search', {
      searchQuery: query,
      filters,
      resultsCount: results
    });
  }

  trackCategoryBrowse(category: string, metadata: any = {}): Observable<any> {
    return this.trackInteraction('category_browse', category, 'category', metadata);
  }

  trackVendorFollow(vendorId: string, metadata: any = {}): Observable<any> {
    return this.trackInteraction('vendor_follow', vendorId, 'vendor', metadata);
  }

  trackPostView(postId: string, duration: number = 0, metadata: any = {}): Observable<any> {
    return this.trackInteraction('post_view', postId, 'post', {
      ...metadata,
      duration
    });
  }

  trackStoryView(storyId: string, duration: number = 0, metadata: any = {}): Observable<any> {
    return this.trackInteraction('story_view', storyId, 'story', {
      ...metadata,
      duration
    });
  }

  // Category-based Recommendations
  getCategoryRecommendations(category: string, limit: number = 8): Observable<RecommendationProduct[]> {
    // For demo purposes, return fallback data immediately to avoid API calls
    console.log(`🏷️ Loading ${category} recommendations (offline mode)`);
    return this.getFallbackCategoryProducts(category, limit);

    /* API version - uncomment when backend is available
    return this.http.get<any>(`${this.apiUrl}/recommendations/category/${category}?limit=${limit}`)
      .pipe(
        map(response => response.success ? response.data : []),
        catchError(error => {
          console.error('Error fetching category recommendations:', error);
          return this.getFallbackCategoryProducts(category, limit);
        })
      );
    */
  }

  // Fallback methods for offline/error scenarios
  private getFallbackSuggestedProducts(limit: number): Observable<RecommendationProduct[]> {
    // Return mock suggested products based on popular items
    const mockProducts: RecommendationProduct[] = [
      {
        _id: 'suggested-1',
        name: 'Trending Cotton T-Shirt',
        description: 'Popular cotton t-shirt based on your preferences',
        price: 899,
        originalPrice: 1299,
        discount: 31,
        images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', alt: 'Cotton T-Shirt', isPrimary: true }],
        category: 'men',
        subcategory: 'shirts',
        brand: 'ComfortWear',
        rating: { average: 4.2, count: 156 },
        tags: ['cotton', 'casual', 'trending'],
        isActive: true,
        isFeatured: true,
        recommendationScore: 0.85,
        recommendationReason: 'Based on your recent views'
      }
    ];
    return new Observable(observer => {
      observer.next(mockProducts.slice(0, limit));
      observer.complete();
    });
  }

  private getFallbackTrendingProducts(limit: number): Observable<TrendingProduct[]> {
    const mockTrending: TrendingProduct[] = [
      {
        _id: 'trending-1',
        name: 'Viral Summer Dress',
        description: 'This dress is trending across social media',
        price: 2499,
        originalPrice: 3499,
        discount: 29,
        images: [{ url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400', alt: 'Summer Dress', isPrimary: true }],
        category: 'women',
        subcategory: 'dresses',
        brand: 'StyleHub',
        rating: { average: 4.5, count: 89 },
        tags: ['summer', 'trending', 'viral'],
        isActive: true,
        isFeatured: true,
        trendingScore: 0.92,
        trendingReason: 'Viral on social media',
        viewCount: 15420,
        purchaseCount: 342,
        shareCount: 1250,
        engagementRate: 8.7
      },
      {
        _id: 'trending-2',
        name: 'Trending Casual T-Shirt',
        description: 'Popular casual wear for everyday comfort',
        price: 899,
        originalPrice: 1299,
        discount: 31,
        images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', alt: 'Casual T-Shirt', isPrimary: true }],
        category: 'men',
        subcategory: 'shirts',
        brand: 'ComfortWear',
        rating: { average: 4.2, count: 156 },
        tags: ['casual', 'trending', 'comfort'],
        isActive: true,
        isFeatured: true,
        trendingScore: 0.85,
        trendingReason: 'High demand this week',
        viewCount: 12300,
        purchaseCount: 287,
        shareCount: 890,
        engagementRate: 7.4
      },
      {
        _id: 'trending-3',
        name: 'Stylish Ethnic Kurta',
        description: 'Traditional wear with modern styling',
        price: 1899,
        originalPrice: 2499,
        discount: 24,
        images: [{ url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400', alt: 'Ethnic Kurta', isPrimary: true }],
        category: 'women',
        subcategory: 'ethnic',
        brand: 'EthnicChic',
        rating: { average: 4.6, count: 203 },
        tags: ['ethnic', 'traditional', 'festive'],
        isActive: true,
        isFeatured: true,
        trendingScore: 0.88,
        trendingReason: 'Festival season favorite',
        viewCount: 9800,
        purchaseCount: 198,
        shareCount: 567,
        engagementRate: 8.1
      }
    ];
    return new Observable(observer => {
      observer.next(mockTrending.slice(0, limit));
      observer.complete();
    });
  }

  private getFallbackSimilarProducts(limit: number): Observable<RecommendationProduct[]> {
    return this.getFallbackSuggestedProducts(limit);
  }

  private getFallbackRecentProducts(limit: number): Observable<RecommendationProduct[]> {
    return this.getFallbackSuggestedProducts(limit);
  }

  private getFallbackCategoryProducts(category: string, limit: number): Observable<RecommendationProduct[]> {
    return this.getFallbackSuggestedProducts(limit);
  }

  private getDefaultAnalytics(userId: string): UserAnalytics {
    return {
      userId,
      viewHistory: [],
      searchHistory: [],
      purchaseHistory: [],
      wishlistItems: [],
      cartItems: [],
      preferredCategories: ['women', 'men', 'accessories'],
      priceRange: { min: 500, max: 5000 },
      brandPreferences: []
    };
  }

  // Update user analytics locally
  updateUserAnalytics(analytics: UserAnalytics): void {
    this.userAnalytics$.next(analytics);
  }

  // Get current user analytics
  getCurrentUserAnalytics(): Observable<UserAnalytics | null> {
    return this.userAnalytics$.asObservable();
  }
}
