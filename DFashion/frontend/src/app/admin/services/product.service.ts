import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount: number;
  category: string;
  subcategory: string;
  brand: string;
  images: ProductImage[];
  sizes: ProductSize[];
  colors: ProductColor[];
  vendor?: any;
  isActive: boolean;
  isFeatured: boolean;
  isApproved?: boolean;
  rating?: {
    average: number;
    count: number;
  };
  analytics?: {
    views: number;
    likes: number;
    shares: number;
    purchases: number;
  };
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductSize {
  size: string;
  stock: number;
}

export interface ProductColor {
  name: string;
  code: string;
  images: string[];
}

export interface ProductFilters {
  search?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  vendor?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminProductResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalProducts: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminProductService {
  private apiUrl = 'http://10.0.2.2:5000/api/admin'; // Direct IP for testing
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Get all products with filters (Admin API)
  getProducts(filters: ProductFilters = {}): Observable<AdminProductResponse> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<AdminProductResponse>(`${this.apiUrl}/products`, { params });
  }

  // Get product by ID (Admin API)
  getProductById(id: string): Observable<{success: boolean; data: Product}> {
    return this.http.get<{success: boolean; data: Product}>(`${this.apiUrl}/products/${id}`);
  }

  // Update product status (Admin API)
  updateProductStatus(id: string, isActive: boolean): Observable<{success: boolean; message: string; data: Product}> {
    return this.http.put<{success: boolean; message: string; data: Product}>(`${this.apiUrl}/products/${id}/status`, { isActive });
  }

  // Toggle featured status (Admin API)
  updateFeaturedStatus(id: string, isFeatured: boolean): Observable<{success: boolean; message: string; data: Product}> {
    return this.http.put<{success: boolean; message: string; data: Product}>(`${this.apiUrl}/products/${id}/featured`, { isFeatured });
  }

  // Delete product (Admin API)
  deleteProduct(id: string): Observable<{success: boolean; message: string}> {
    return this.http.delete<{success: boolean; message: string}>(`${this.apiUrl}/products/${id}`);
  }

  // Approve product (for vendor products)
  approveProduct(id: string): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}/approve`, {});
  }

  // Get product categories
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`);
  }

  // Get subcategories by category
  getSubcategories(category: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories/${category}/subcategories`);
  }

  // Get product brands
  getBrands(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/brands`);
  }

  // Upload product images
  uploadProductImages(productId: string, files: File[]): Observable<ProductImage[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    return this.http.post<ProductImage[]>(`${this.apiUrl}/${productId}/images`, formData);
  }

  // Delete product image
  deleteProductImage(productId: string, imageId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productId}/images/${imageId}`);
  }

  // Update product inventory
  updateInventory(productId: string, inventory: any): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${productId}/inventory`, inventory);
  }

  // Get product analytics
  getProductAnalytics(productId: string, period: string = '30d'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${productId}/analytics?period=${period}`);
  }

  // Bulk operations
  bulkUpdateProducts(productIds: string[], updates: Partial<Product>): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/bulk-update`, {
      productIds,
      updates
    });
  }

  bulkDeleteProducts(productIds: string[]): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/bulk-delete`, {
      body: { productIds }
    });
  }

  // Search products
  searchProducts(query: string, filters: ProductFilters = {}): Observable<AdminProductResponse> {
    const searchFilters = { ...filters, search: query };
    return this.getProducts(searchFilters);
  }

  // Get featured products
  getFeaturedProducts(limit: number = 10): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/featured?limit=${limit}`);
  }

  // Get products by vendor
  getProductsByVendor(vendorId: string, filters: ProductFilters = {}): Observable<AdminProductResponse> {
    const vendorFilters = { ...filters, vendor: vendorId };
    return this.getProducts(vendorFilters);
  }

  // Update products subject
  updateProductsSubject(products: Product[]): void {
    this.productsSubject.next(products);
  }

  // Get current products
  getCurrentProducts(): Product[] {
    return this.productsSubject.value;
  }
}
