import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, merge, of } from 'rxjs';
import { map, distinctUntilChanged, shareReplay, switchMap, catchError } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { RecommendationService } from './recommendation.service';
import { AnalyticsService } from './analytics.service';
import { CartService } from './cart.service';
import { WishlistService } from './wishlist.service';
import { MobileOptimizationService } from './mobile-optimization.service';

export interface AppState {
  user: any;
  deviceInfo: any;
  recommendations: {
    suggested: any[];
    trending: any[];
    categories: any[];
  };
  userCounts: {
    cart: number;
    wishlist: number;
    total: number;
  };
  analytics: {
    userBehavior: any[];
    searchHistory: any[];
    viewHistory: any[];
  };
  ui: {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    currentBreakpoint: string;
    isKeyboardOpen: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DataFlowService {
  private appState$ = new BehaviorSubject<AppState>(this.getInitialState());
  private isLoading$ = new BehaviorSubject<boolean>(false);
  private errors$ = new BehaviorSubject<string[]>([]);

  constructor(
    private authService: AuthService,
    private recommendationService: RecommendationService,
    private analyticsService: AnalyticsService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private mobileService: MobileOptimizationService
  ) {
    this.initializeDataFlow();
  }

  // Public Observables
  getAppState$(): Observable<AppState> {
    return this.appState$.asObservable();
  }

  getIsLoading$(): Observable<boolean> {
    return this.isLoading$.asObservable();
  }

  getErrors$(): Observable<string[]> {
    return this.errors$.asObservable();
  }

  // Specific State Selectors
  getUser$(): Observable<any> {
    return this.appState$.pipe(
      map(state => state.user),
      distinctUntilChanged()
    );
  }

  getRecommendations$(): Observable<any> {
    return this.appState$.pipe(
      map(state => state.recommendations),
      distinctUntilChanged()
    );
  }

  getUserCounts$(): Observable<any> {
    return this.appState$.pipe(
      map(state => state.userCounts),
      distinctUntilChanged()
    );
  }

  getUIState$(): Observable<any> {
    return this.appState$.pipe(
      map(state => state.ui),
      distinctUntilChanged()
    );
  }

  // Data Loading Methods
  loadUserData(userId?: string): Observable<any> {
    this.setLoading(true);

    return this.authService.currentUser$.pipe(
      map(user => {
        const userData = {
          user,
          userCounts: {
            cart: 0,
            wishlist: 0,
            total: 0
          }
        };

        this.updateState(userData);
        this.setLoading(false);
        return userData;
      }),
      catchError(error => {
        this.addError('Failed to load user data');
        this.setLoading(false);
        throw error;
      })
    );
  }

  loadRecommendations(userId?: string): Observable<any> {
    this.setLoading(true);
    
    return combineLatest([
      this.recommendationService.getSuggestedProducts(userId, 8),
      this.recommendationService.getTrendingProducts(undefined, 6),
      this.recommendationService.getCategoryRecommendations('women', 6)
    ]).pipe(
      map(([suggested, trending, categories]) => {
        const recommendations = {
          recommendations: {
            suggested,
            trending,
            categories
          }
        };
        
        this.updateState(recommendations);
        this.setLoading(false);
        return recommendations;
      }),
      catchError(error => {
        this.addError('Failed to load recommendations');
        this.setLoading(false);
        throw error;
      })
    );
  }

  loadAnalytics(): Observable<any> {
    return this.analyticsService.getAnalyticsOverview().pipe(
      map(analytics => {
        const analyticsData = {
          analytics: {
            userBehavior: analytics.userGrowth || [],
            searchHistory: analytics.searchTrends || [],
            viewHistory: []
          }
        };
        
        this.updateState(analyticsData);
        return analyticsData;
      }),
      catchError(error => {
        this.addError('Failed to load analytics');
        throw error;
      })
    );
  }

  // User Actions
  trackUserAction(action: string, data: any): void {
    const currentState = this.appState$.value;
    
    // Track in analytics
    this.analyticsService.trackUserBehavior(action, data).subscribe();
    
    // Update local analytics
    const updatedAnalytics = {
      ...currentState.analytics,
      userBehavior: [
        ...currentState.analytics.userBehavior,
        { action, data, timestamp: new Date() }
      ].slice(-100) // Keep last 100 actions
    };
    
    this.updateState({ analytics: updatedAnalytics });
  }

  addToCart(productId: string, quantity: number = 1): Observable<any> {
    this.trackUserAction('add_to_cart', { productId, quantity });
    return of({ success: true, productId, quantity });
  }

  addToWishlist(productId: string): Observable<any> {
    this.trackUserAction('add_to_wishlist', { productId });
    return of({ success: true, productId });
  }

  removeFromCart(productId: string): Observable<any> {
    this.trackUserAction('remove_from_cart', { productId });
    return of({ success: true, productId });
  }

  removeFromWishlist(productId: string): Observable<any> {
    this.trackUserAction('remove_from_wishlist', { productId });
    return of({ success: true, productId });
  }

  // Search and Navigation
  performSearch(query: string, category?: string): void {
    this.trackUserAction('search', { query, category });
    
    // Track search in recommendations service
    this.recommendationService.trackSearch(query, category, 0).subscribe();
    
    // Update search history
    const currentState = this.appState$.value;
    const updatedAnalytics = {
      ...currentState.analytics,
      searchHistory: [
        { query, category, timestamp: new Date() },
        ...currentState.analytics.searchHistory
      ].slice(0, 50) // Keep last 50 searches
    };
    
    this.updateState({ analytics: updatedAnalytics });
  }

  trackProductView(productId: string, category: string, duration: number = 0): void {
    this.trackUserAction('product_view', { productId, category, duration });
    
    // Track in recommendations service
    this.recommendationService.trackProductView(productId, category, duration).subscribe();
    
    // Update view history
    const currentState = this.appState$.value;
    const updatedAnalytics = {
      ...currentState.analytics,
      viewHistory: [
        { productId, category, duration, timestamp: new Date() },
        ...currentState.analytics.viewHistory
      ].slice(0, 100) // Keep last 100 views
    };
    
    this.updateState({ analytics: updatedAnalytics });
  }

  // Private Methods
  private initializeDataFlow(): void {
    // Initialize with device info
    this.mobileService.getDeviceInfo$().subscribe(deviceInfo => {
      this.updateState({
        ui: {
          isMobile: deviceInfo.isMobile,
          isTablet: deviceInfo.isTablet,
          isDesktop: deviceInfo.isDesktop,
          currentBreakpoint: this.mobileService.getCurrentBreakpoint(),
          isKeyboardOpen: false
        }
      });
    });

    // Listen to keyboard state
    this.mobileService.getIsKeyboardOpen$().subscribe(isOpen => {
      const currentState = this.appState$.value;
      this.updateState({
        ui: {
          ...currentState.ui,
          isKeyboardOpen: isOpen
        }
      });
    });

    // Listen to auth changes
    this.authService.currentUser$.subscribe(user => {
      this.updateState({ user });
      
      if (user) {
        // Load user-specific data
        this.loadUserData(user._id).subscribe();
        this.loadRecommendations(user._id).subscribe();
      } else {
        // Reset user-specific data
        this.updateState({
          userCounts: { cart: 0, wishlist: 0, total: 0 },
          recommendations: { suggested: [], trending: [], categories: [] }
        });
      }
    });
  }

  private updateUserCounts(): Observable<any> {
    const userCounts = {
      cart: 0,
      wishlist: 0,
      total: 0
    };

    this.updateState({ userCounts });
    return of(userCounts);
  }

  private updateState(partialState: Partial<AppState>): void {
    const currentState = this.appState$.value;
    const newState = { ...currentState, ...partialState };
    this.appState$.next(newState);
  }

  private setLoading(loading: boolean): void {
    this.isLoading$.next(loading);
  }

  private addError(error: string): void {
    const currentErrors = this.errors$.value;
    this.errors$.next([...currentErrors, error]);
    
    // Auto-remove error after 5 seconds
    setTimeout(() => {
      const errors = this.errors$.value;
      const index = errors.indexOf(error);
      if (index > -1) {
        errors.splice(index, 1);
        this.errors$.next([...errors]);
      }
    }, 5000);
  }

  private getInitialState(): AppState {
    return {
      user: null,
      deviceInfo: null,
      recommendations: {
        suggested: [],
        trending: [],
        categories: []
      },
      userCounts: {
        cart: 0,
        wishlist: 0,
        total: 0
      },
      analytics: {
        userBehavior: [],
        searchHistory: [],
        viewHistory: []
      },
      ui: {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        currentBreakpoint: 'lg',
        isKeyboardOpen: false
      }
    };
  }

  // Cleanup
  destroy(): void {
    this.appState$.complete();
    this.isLoading$.complete();
    this.errors$.complete();
  }
}
