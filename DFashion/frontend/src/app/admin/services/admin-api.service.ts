import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AdminAuthService } from './admin-auth.service';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: {
    items?: T[];
    users?: T[];
    products?: T[];
    orders?: T[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems?: number;
      totalUsers?: number;
      totalProducts?: number;
      totalOrders?: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    stats?: any;
  };
}

export interface DashboardStats {
  overview: {
    users: {
      total: number;
      active: number;
      inactive: number;
    };
    products: {
      total: number;
      active: number;
      approved: number;
      pending: number;
      featured: number;
    };
    orders: {
      total: number;
      pending: number;
      confirmed: number;
      shipped: number;
      delivered: number;
      cancelled: number;
    };
  };
  revenue: {
    totalRevenue: number;
    averageOrderValue: number;
  };
  monthlyTrends: any[];
  topCustomers: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(
    private http: HttpClient,
    private authService: AdminAuthService
  ) {}

  // Get authorization headers
  private getHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }

  // Handle API errors
  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    
    if (error.status === 401) {
      this.authService.logout();
    }
    
    return throwError(error);
  }

  // Dashboard APIs
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.apiUrl}/admin/dashboard`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data),
      catchError(this.handleError.bind(this))
    );
  }

  // User Management APIs
  getUsers(params: any = {}): Observable<PaginatedResponse> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });

    return this.http.get<PaginatedResponse>(`${this.apiUrl}/admin/users`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getUserById(id: string): Observable<any> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/admin/users/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data),
      catchError(this.handleError.bind(this))
    );
  }

  createUser(userData: any): Observable<any> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/admin/users`, userData, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  updateUser(id: string, userData: any): Observable<any> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/admin/users/${id}`, userData, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/admin/users/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  activateUser(id: string): Observable<any> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/admin/users/${id}/activate`, {}, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  updateUserPassword(id: string, newPassword: string): Observable<any> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/admin/users/${id}/password`, {
      newPassword
    }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Product Management APIs
  getProducts(params: any = {}): Observable<PaginatedResponse> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });

    return this.http.get<PaginatedResponse>(`${this.apiUrl}/admin/products`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getProductById(id: string): Observable<any> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/admin/products/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data),
      catchError(this.handleError.bind(this))
    );
  }

  createProduct(productData: any): Observable<any> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/admin/products`, productData, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  updateProduct(id: string, productData: any): Observable<any> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/admin/products/${id}`, productData, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/admin/products/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  approveProduct(id: string): Observable<any> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/admin/products/${id}/approve`, {}, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  rejectProduct(id: string, reason: string): Observable<any> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/admin/products/${id}/reject`, {
      rejectionReason: reason
    }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  toggleProductFeatured(id: string): Observable<any> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/admin/products/${id}/featured`, {}, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Order Management APIs
  getOrders(params: any = {}): Observable<PaginatedResponse> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });

    return this.http.get<PaginatedResponse>(`${this.apiUrl}/admin/orders`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getOrderById(id: string): Observable<any> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/admin/orders/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data),
      catchError(this.handleError.bind(this))
    );
  }

  updateOrderStatus(id: string, status: string, trackingNumber?: string, notes?: string): Observable<any> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/admin/orders/${id}/status`, {
      status,
      trackingNumber,
      notes
    }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  cancelOrder(id: string, reason: string): Observable<any> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/admin/orders/${id}/cancel`, {
      reason
    }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  processRefund(id: string, amount?: number, reason?: string): Observable<any> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/admin/orders/${id}/refund`, {
      amount,
      reason
    }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Analytics APIs
  getAnalytics(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });

    return this.http.get<ApiResponse>(`${this.apiUrl}/admin/analytics/overview`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      map(response => response.data),
      catchError(this.handleError.bind(this))
    );
  }

  getSalesReport(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });

    return this.http.get<ApiResponse>(`${this.apiUrl}/admin/reports/sales`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      map(response => response.data),
      catchError(this.handleError.bind(this))
    );
  }

  // Settings APIs
  getSettings(): Observable<any> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/admin/settings`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data),
      catchError(this.handleError.bind(this))
    );
  }

  updateSettings(settings: any): Observable<any> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/admin/settings`, settings, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }
}
