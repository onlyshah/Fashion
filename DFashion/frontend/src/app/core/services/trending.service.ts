import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';

export interface TrendingResponse {
  success: boolean;
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface FeaturedBrand {
  brand: string;
  productCount: number;
  avgRating: number;
  totalViews: number;
  topProducts: Product[];
}

export interface FeaturedBrandsResponse {
  success: boolean;
  brands: FeaturedBrand[];
}

export interface Influencer {
  _id: string;
  username: string;
  fullName: string;
  avatar: string;
  bio: string;
  socialStats: {
    followersCount: number;
    postsCount: number;
    followingCount: number;
  };
  isInfluencer: boolean;
}

export interface InfluencersResponse {
  success: boolean;
  influencers: Influencer[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TrendingService {
  private readonly API_URL = 'http://10.0.2.2:5000/api'; // Direct IP for testing

  // BehaviorSubjects for caching
  private trendingProductsSubject = new BehaviorSubject<Product[]>([]);
  private suggestedProductsSubject = new BehaviorSubject<Product[]>([]);
  private newArrivalsSubject = new BehaviorSubject<Product[]>([]);
  private featuredBrandsSubject = new BehaviorSubject<FeaturedBrand[]>([]);
  private influencersSubject = new BehaviorSubject<Influencer[]>([]);

  // Public observables
  public trendingProducts$ = this.trendingProductsSubject.asObservable();
  public suggestedProducts$ = this.suggestedProductsSubject.asObservable();
  public newArrivals$ = this.newArrivalsSubject.asObservable();
  public featuredBrands$ = this.featuredBrandsSubject.asObservable();
  public influencers$ = this.influencersSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Get trending products
  getTrendingProducts(page: number = 1, limit: number = 12): Observable<TrendingResponse> {
    return this.http.get<TrendingResponse>(`${this.API_URL}/v1/products/trending`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  // Get suggested products
  getSuggestedProducts(page: number = 1, limit: number = 12): Observable<TrendingResponse> {
    return this.http.get<TrendingResponse>(`${this.API_URL}/v1/products/suggested`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  // Get new arrivals
  getNewArrivals(page: number = 1, limit: number = 12): Observable<TrendingResponse> {
    return this.http.get<TrendingResponse>(`${this.API_URL}/v1/products/new-arrivals`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  // Get featured brands
  getFeaturedBrands(): Observable<FeaturedBrandsResponse> {
    return this.http.get<FeaturedBrandsResponse>(`${this.API_URL}/v1/products/featured-brands`);
  }

  // Get influencers
  getInfluencers(page: number = 1, limit: number = 10): Observable<InfluencersResponse> {
    return this.http.get<InfluencersResponse>(`${this.API_URL}/v1/users/influencers`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  // Load and cache trending products
  async loadTrendingProducts(page: number = 1, limit: number = 12): Promise<void> {
    try {
      const response = await this.getTrendingProducts(page, limit).toPromise();
      if (response?.success && response?.products) {
        this.trendingProductsSubject.next(response.products);
      }
    } catch (error) {
      console.error('Error loading trending products:', error);
    }
  }

  // Load and cache suggested products
  async loadSuggestedProducts(page: number = 1, limit: number = 12): Promise<void> {
    try {
      const response = await this.getSuggestedProducts(page, limit).toPromise();
      if (response?.success && response?.products) {
        this.suggestedProductsSubject.next(response.products);
      }
    } catch (error) {
      console.error('Error loading suggested products:', error);
    }
  }

  // Load and cache new arrivals
  async loadNewArrivals(page: number = 1, limit: number = 12): Promise<void> {
    try {
      const response = await this.getNewArrivals(page, limit).toPromise();
      if (response?.success && response?.products) {
        this.newArrivalsSubject.next(response.products);
      }
    } catch (error) {
      console.error('Error loading new arrivals:', error);
    }
  }

  // Load and cache featured brands
  async loadFeaturedBrands(): Promise<void> {
    try {
      const response = await this.getFeaturedBrands().toPromise();
      if (response?.success && response?.brands) {
        this.featuredBrandsSubject.next(response.brands);
      }
    } catch (error) {
      console.error('Error loading featured brands:', error);
    }
  }

  // Load and cache influencers
  async loadInfluencers(page: number = 1, limit: number = 10): Promise<void> {
    try {
      const response = await this.getInfluencers(page, limit).toPromise();
      if (response?.success && response?.influencers) {
        this.influencersSubject.next(response.influencers);
      }
    } catch (error) {
      console.error('Error loading influencers:', error);
    }
  }

  // Clear all cached data
  clearCache(): void {
    this.trendingProductsSubject.next([]);
    this.suggestedProductsSubject.next([]);
    this.newArrivalsSubject.next([]);
    this.featuredBrandsSubject.next([]);
    this.influencersSubject.next([]);
  }

  // Get current cached data
  getCurrentTrendingProducts(): Product[] {
    return this.trendingProductsSubject.value;
  }

  getCurrentSuggestedProducts(): Product[] {
    return this.suggestedProductsSubject.value;
  }

  getCurrentNewArrivals(): Product[] {
    return this.newArrivalsSubject.value;
  }

  getCurrentFeaturedBrands(): FeaturedBrand[] {
    return this.featuredBrandsSubject.value;
  }

  getCurrentInfluencers(): Influencer[] {
    return this.influencersSubject.value;
  }
}
