import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject, timer, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, tap, shareReplay, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export interface SearchFilters {
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  onSale?: boolean;
  colors?: string[];
  sizes?: string[];
  tags?: string[];
}

export interface SearchOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface SearchSuggestion {
  text: string;
  type: 'completion' | 'product' | 'brand' | 'category' | 'trending' | 'personal';
  popularity: number;
  metadata?: any;
}

export interface SearchResult {
  success: boolean;
  products: any[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  searchMeta: {
    query: string;
    filters: SearchFilters;
    resultsCount: number;
    searchTime: number;
    suggestions: SearchSuggestion[];
  };
}

export interface TrendingSearch {
  query: string;
  searches: number;
  trendingScore: number;
  growth?: number;
}

export interface SearchHistory {
  query: string;
  timestamp: string;
  resultsCount: number;
  filters?: SearchFilters;
}

export interface SearchAnalytics {
  totalSearches: number;
  uniqueQueries: number;
  clickThroughRate: number;
  conversionRate: number;
  preferences: {
    preferredCategories: Array<{ category: string; score: number }>;
    preferredBrands: Array<{ brand: string; score: number }>;
    priceRangePreference: { min: number; max: number };
  };
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly API_URL = 'http://10.0.2.2:5000/api/v1'; // Direct IP for testing
  
  // Search state management
  private searchQuerySubject = new BehaviorSubject<string>('');
  private searchFiltersSubject = new BehaviorSubject<SearchFilters>({});
  private searchResultsSubject = new BehaviorSubject<SearchResult | null>(null);
  private searchLoadingSubject = new BehaviorSubject<boolean>(false);
  private searchSuggestionsSubject = new BehaviorSubject<SearchSuggestion[]>([]);
  
  // Public observables
  public searchQuery$ = this.searchQuerySubject.asObservable();
  public searchFilters$ = this.searchFiltersSubject.asObservable();
  public searchResults$ = this.searchResultsSubject.asObservable();
  public searchLoading$ = this.searchLoadingSubject.asObservable();
  public searchSuggestions$ = this.searchSuggestionsSubject.asObservable();
  
  // Search input subject for debouncing
  private searchInputSubject = new Subject<string>();
  
  // Cache for suggestions and trending searches
  private suggestionsCache = new Map<string, { data: SearchSuggestion[]; timestamp: number }>();
  private trendingCache: { data: TrendingSearch[]; timestamp: number } | null = null;
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.initializeSearchDebouncing();
  }

  // Initialize search input debouncing
  private initializeSearchDebouncing(): void {
    this.searchInputSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.trim().length > 0) {
          return this.performSearch(query, this.searchFiltersSubject.value);
        } else {
          this.searchResultsSubject.next(null);
          return of(null);
        }
      })
    ).subscribe();
  }

  // Set search query (triggers debounced search)
  setSearchQuery(query: string): void {
    this.searchQuerySubject.next(query);
    this.searchInputSubject.next(query);
  }

  // Set search filters
  setSearchFilters(filters: SearchFilters): void {
    this.searchFiltersSubject.next(filters);
    
    // Re-search if there's an active query
    const currentQuery = this.searchQuerySubject.value;
    if (currentQuery.trim()) {
      this.performSearch(currentQuery, filters).subscribe();
    }
  }

  // Perform search with current query and filters
  performSearch(query: string, filters: SearchFilters = {}, options: SearchOptions = {}): Observable<SearchResult> {
    this.searchLoadingSubject.next(true);
    
    let params = new HttpParams();
    
    if (query) params = params.set('q', query);
    
    // Add filters
    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          params = params.set(key, value.join(','));
        } else {
          params = params.set(key, value.toString());
        }
      }
    });
    
    // Add options
    Object.keys(options).forEach(key => {
      const value = (options as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<SearchResult>(`${this.API_URL}/search`, { params }).pipe(
      tap(result => {
        this.searchResultsSubject.next(result);
        this.searchLoadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Search error:', error);
        this.searchLoadingSubject.next(false);
        this.searchResultsSubject.next({
          success: false,
          products: [],
          pagination: { current: 1, pages: 0, total: 0, hasNext: false, hasPrev: false },
          searchMeta: { query, filters, resultsCount: 0, searchTime: Date.now(), suggestions: [] }
        });
        return of({
          success: false,
          products: [],
          pagination: { current: 1, pages: 0, total: 0, hasNext: false, hasPrev: false },
          searchMeta: { query, filters, resultsCount: 0, searchTime: Date.now(), suggestions: [] }
        });
      })
    );
  }

  // Get search suggestions with caching
  getSearchSuggestions(query: string, limit: number = 10, type: string = 'all'): Observable<SearchSuggestion[]> {
    const cacheKey = `${query}_${limit}_${type}`;
    const cached = this.suggestionsCache.get(cacheKey);
    
    // Return cached data if less than 5 minutes old
    if (cached && Date.now() - cached.timestamp < 300000) {
      return of(cached.data);
    }
    
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('type', type);
    
    if (query) params = params.set('q', query);

    return this.http.get<{ success: boolean; suggestions: SearchSuggestion[] }>(`${this.API_URL}/search/suggestions`, { params }).pipe(
      tap(response => {
        if (response.success) {
          this.suggestionsCache.set(cacheKey, {
            data: response.suggestions,
            timestamp: Date.now()
          });
          this.searchSuggestionsSubject.next(response.suggestions);
        }
      }),
      switchMap(response => of(response.suggestions || [])),
      catchError(error => {
        console.error('Get suggestions error:', error);
        return of([]);
      })
    );
  }

  // Get trending searches with caching
  getTrendingSearches(limit: number = 10, timeframe: string = '24h'): Observable<TrendingSearch[]> {
    // Return cached data if less than 10 minutes old
    if (this.trendingCache && Date.now() - this.trendingCache.timestamp < 600000) {
      return of(this.trendingCache.data);
    }
    
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('timeframe', timeframe);

    return this.http.get<{ success: boolean; trending: TrendingSearch[] }>(`${this.API_URL}/search/trending`, { params }).pipe(
      tap(response => {
        if (response.success) {
          this.trendingCache = {
            data: response.trending,
            timestamp: Date.now()
          };
        }
      }),
      switchMap(response => of(response.trending || [])),
      catchError(error => {
        console.error('Get trending searches error:', error);
        return of([]);
      })
    );
  }

  // Get user's search history
  getSearchHistory(limit: number = 20, type: string = 'recent'): Observable<{ searches: SearchHistory[]; analytics: SearchAnalytics }> {
    if (!this.authService.isAuthenticated) {
      return of({ searches: [], analytics: this.getDefaultAnalytics() });
    }
    
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('type', type);

    return this.http.get<any>(`${this.API_URL}/search/history`, { params }).pipe(
      switchMap(response => of({
        searches: response.searches || [],
        analytics: response.analytics || this.getDefaultAnalytics()
      })),
      catchError(error => {
        console.error('Get search history error:', error);
        return of({ searches: [], analytics: this.getDefaultAnalytics() });
      })
    );
  }

  // Clear search history
  clearSearchHistory(type: string = 'all'): Observable<boolean> {
    if (!this.authService.isAuthenticated) {
      return of(false);
    }
    
    const params = new HttpParams().set('type', type);

    return this.http.delete<{ success: boolean }>(`${this.API_URL}/search/history`, { params }).pipe(
      switchMap(response => of(response.success)),
      catchError(error => {
        console.error('Clear search history error:', error);
        return of(false);
      })
    );
  }

  // Track search interactions
  trackSearchInteraction(searchQuery: string, productId: string, action: string, position?: number, metadata?: any): Observable<boolean> {
    if (!this.authService.isAuthenticated) {
      return of(false);
    }
    
    const body = {
      searchQuery,
      productId,
      action,
      position,
      metadata
    };

    return this.http.post<{ success: boolean }>(`${this.API_URL}/search/track`, body).pipe(
      switchMap(response => of(response.success)),
      catchError(error => {
        console.error('Track search interaction error:', error);
        return of(false);
      })
    );
  }

  // Convenience methods for common tracking actions
  trackProductClick(searchQuery: string, productId: string, position: number): Observable<boolean> {
    return this.trackSearchInteraction(searchQuery, productId, 'click', position);
  }

  trackProductPurchase(searchQuery: string, productId: string): Observable<boolean> {
    return this.trackSearchInteraction(searchQuery, productId, 'purchase');
  }

  trackSearchDuration(searchQuery: string, duration: number): Observable<boolean> {
    return this.trackSearchInteraction(searchQuery, '', 'view_duration', 0, { duration });
  }

  trackFilterChange(searchQuery: string): Observable<boolean> {
    return this.trackSearchInteraction(searchQuery, '', 'filter_change');
  }

  // Get search analytics (for admin/vendor dashboards)
  getSearchAnalytics(timeframe: string = '7d', limit: number = 50): Observable<any> {
    const params = new HttpParams()
      .set('timeframe', timeframe)
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.API_URL}/search/analytics`, { params }).pipe(
      catchError(error => {
        console.error('Get search analytics error:', error);
        return of({
          success: false,
          analytics: {
            overview: this.getDefaultAnalytics(),
            trendingSearches: []
          }
        });
      })
    );
  }

  // Reset search state
  resetSearch(): void {
    this.searchQuerySubject.next('');
    this.searchFiltersSubject.next({});
    this.searchResultsSubject.next(null);
    this.searchLoadingSubject.next(false);
    this.searchSuggestionsSubject.next([]);
  }

  // Clear caches
  clearCaches(): void {
    this.suggestionsCache.clear();
    this.trendingCache = null;
  }

  // Get current search state
  getCurrentSearchState(): {
    query: string;
    filters: SearchFilters;
    results: SearchResult | null;
    loading: boolean;
  } {
    return {
      query: this.searchQuerySubject.value,
      filters: this.searchFiltersSubject.value,
      results: this.searchResultsSubject.value,
      loading: this.searchLoadingSubject.value
    };
  }

  // Enhanced search with AI-powered recommendations
  getSmartSearchSuggestions(query: string, userContext?: any): Observable<SearchSuggestion[]> {
    const params = new HttpParams()
      .set('q', query)
      .set('smart', 'true')
      .set('context', JSON.stringify(userContext || {}));

    return this.http.get<{ suggestions: SearchSuggestion[] }>(`${this.API_URL}/search/smart-suggestions`, { params })
      .pipe(
        map(response => response.suggestions || []),
        catchError(error => {
          console.error('Error fetching smart suggestions:', error);
          return this.getSearchSuggestions(query);
        })
      );
  }

  // Visual search functionality
  searchByImage(imageFile: File): Observable<SearchResult> {
    const formData = new FormData();
    formData.append('image', imageFile);

    this.searchLoadingSubject.next(true);

    return this.http.post<SearchResult>(`${this.API_URL}/search/visual`, formData).pipe(
      tap(result => {
        this.searchResultsSubject.next(result);
        this.searchLoadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Visual search error:', error);
        this.searchLoadingSubject.next(false);
        return of({
          success: false,
          products: [],
          pagination: { current: 1, pages: 0, total: 0, hasNext: false, hasPrev: false },
          searchMeta: {
            query: 'Visual Search',
            filters: {},
            resultsCount: 0,
            searchTime: Date.now(),
            suggestions: []
          }
        });
      })
    );
  }

  // Barcode/QR code search
  searchByBarcode(barcode: string): Observable<SearchResult> {
    const params = new HttpParams().set('barcode', barcode);

    this.searchLoadingSubject.next(true);

    return this.http.get<SearchResult>(`${this.API_URL}/search/barcode`, { params }).pipe(
      tap(result => {
        this.searchResultsSubject.next(result);
        this.searchLoadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Barcode search error:', error);
        this.searchLoadingSubject.next(false);
        return of({
          success: false,
          products: [],
          pagination: { current: 1, pages: 0, total: 0, hasNext: false, hasPrev: false },
          searchMeta: {
            query: `Barcode: ${barcode}`,
            filters: {},
            resultsCount: 0,
            searchTime: Date.now(),
            suggestions: []
          }
        });
      })
    );
  }

  // Search by similar products
  searchSimilarProducts(productId: string, limit: number = 12): Observable<SearchResult> {
    const params = new HttpParams()
      .set('productId', productId)
      .set('limit', limit.toString());

    this.searchLoadingSubject.next(true);

    return this.http.get<SearchResult>(`${this.API_URL}/search/similar`, { params }).pipe(
      tap(result => {
        this.searchResultsSubject.next(result);
        this.searchLoadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Similar products search error:', error);
        this.searchLoadingSubject.next(false);
        return of({
          success: false,
          products: [],
          pagination: { current: 1, pages: 0, total: 0, hasNext: false, hasPrev: false },
          searchMeta: {
            query: 'Similar Products',
            filters: {},
            resultsCount: 0,
            searchTime: Date.now(),
            suggestions: []
          }
        });
      })
    );
  }

  // Get personalized search recommendations
  getPersonalizedRecommendations(limit: number = 10): Observable<SearchSuggestion[]> {
    if (!this.authService.isAuthenticated) {
      return this.getTrendingSearches(limit).pipe(
        map(trending => trending.map(t => ({
          text: t.query,
          type: 'trending' as const,
          popularity: t.searches
        })))
      );
    }

    const params = new HttpParams().set('limit', limit.toString());

    return this.http.get<{ suggestions: SearchSuggestion[] }>(`${this.API_URL}/search/personalized`, { params })
      .pipe(
        map(response => response.suggestions || []),
        catchError(error => {
          console.error('Error fetching personalized recommendations:', error);
          return this.getTrendingSearches(limit).pipe(
            map(trending => trending.map(t => ({
              text: t.query,
              type: 'trending' as const,
              popularity: t.searches
            })))
          );
        })
      );
  }

  // Search analytics and insights
  getSearchInsights(): Observable<any> {
    if (!this.authService.isAuthenticated) {
      return of({});
    }

    return this.http.get<any>(`${this.API_URL}/search/insights`).pipe(
      catchError(error => {
        console.error('Error fetching search insights:', error);
        return of({});
      })
    );
  }

  // Helper method for default analytics
  private getDefaultAnalytics(): SearchAnalytics {
    return {
      totalSearches: 0,
      uniqueQueries: 0,
      clickThroughRate: 0,
      conversionRate: 0,
      preferences: {
        preferredCategories: [],
        preferredBrands: [],
        priceRangePreference: { min: 0, max: 10000 }
      }
    };
  }
}
