import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Product, ProductsResponse, ProductFilters } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = 'http://10.0.2.2:5000/api'; // Direct IP for testing

  constructor(private http: HttpClient) {}

  getProducts(filters: ProductFilters = {}): Observable<ProductsResponse> {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ProductsResponse>(`${this.API_URL}/products`, { params });
  }

  getProduct(id: string): Observable<{ product: Product }> {
    return this.http.get<{ product: Product }>(`${this.API_URL}/products/${id}`);
  }

  createProduct(productData: any): Observable<{ message: string; product: Product }> {
    return this.http.post<{ message: string; product: Product }>(`${this.API_URL}/products`, productData);
  }

  updateProduct(id: string, productData: any): Observable<{ message: string; product: Product }> {
    return this.http.put<{ message: string; product: Product }>(`${this.API_URL}/products/${id}`, productData);
  }

  deleteProduct(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/products/${id}`);
  }

  addReview(productId: string, reviewData: any): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/products/${productId}/review`, reviewData);
  }

  getFeaturedProducts(): Observable<{ products: Product[] }> {
    return this.http.get<{ products: Product[] }>(`${this.API_URL}/products/featured`);
  }

  getTrendingProducts(): Observable<{ success: boolean; data: Product[] }> {
    return this.http.get<{ success: boolean; data: Product[] }>(`${this.API_URL}/products/trending`);
  }

  getVendorProducts(vendorId: string, filters: ProductFilters = {}): Observable<ProductsResponse> {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ProductsResponse>(`${this.API_URL}/products/vendor/${vendorId}`, { params });
  }

  searchProducts(query: string, filters: ProductFilters = {}): Observable<ProductsResponse> {
    const searchFilters = { ...filters, search: query };
    return this.getProducts(searchFilters);
  }

  // Advanced search with full search engine capabilities
  advancedSearch(query: string, filters: any = {}, options: any = {}): Observable<any> {
    let params = new HttpParams();

    if (query) params = params.set('q', query);

    // Add filters
    Object.keys(filters).forEach(key => {
      const value = filters[key];
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
      const value = options[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<any>(`${this.API_URL}/search`, { params });
  }

  getCategories(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.API_URL}/v1/categories`);
  }

  getBrands(): Observable<{ brands: string[] }> {
    return this.http.get<{ brands: string[] }>(`${this.API_URL}/products/brands`);
  }

  // Featured Brands
  getFeaturedBrands(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.API_URL}/brands/featured`);
  }

  // New Arrivals
  getNewArrivals(): Observable<{ success: boolean; data: Product[] }> {
    return this.http.get<{ success: boolean; data: Product[] }>(`${this.API_URL}/products/new-arrivals`);
  }

  // Get suggested users for sidebar
  getSuggestedUsers(): Observable<any> {
    return this.http.get(`${this.API_URL}/v1/users/suggested`);
  }

  // Get top influencers for sidebar
  getTopInfluencers(): Observable<any> {
    return this.http.get(`${this.API_URL}/v1/users/influencers`);
  }

  // Get product by ID
  getProductById(id: string): Observable<any> {
    return this.http.get(`${this.API_URL}/products/${id}`);
  }

  // Product interactions
  toggleProductLike(productId: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/products/${productId}/like`, {});
  }

  shareProduct(productId: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/products/${productId}/share`, {});
  }

  // Category products
  getCategoryProducts(categorySlug: string, filters: ProductFilters = {}): Observable<ProductsResponse> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ProductsResponse>(`${this.API_URL}/products/category/${categorySlug}`, { params });
  }
}
