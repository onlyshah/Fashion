import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface VendorStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  recentOrdersCount: number;
}

export interface MonthlyRevenue {
  _id: {
    year: number;
    month: number;
  };
  revenue: number;
  orders: number;
}

export interface VendorDashboardResponse {
  success: boolean;
  data?: {
    stats: VendorStats;
    monthlyRevenue: MonthlyRevenue[];
  };
  message?: string;
}

export interface VendorProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  images: string[];
  category: string;
  stock: number;
  sizes: Array<{
    size: string;
    stock: number;
  }>;
  isActive: boolean;
  rating: {
    average: number;
    count: number;
  };
  createdAt: string;
}

export interface VendorProductsResponse {
  success: boolean;
  data?: {
    products: VendorProduct[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  message?: string;
}

export interface VendorOrder {
  _id: string;
  orderNumber: string;
  customer: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  items: Array<{
    product: {
      _id: string;
      name: string;
      images: string[];
      price: number;
      vendor: string;
    };
    quantity: number;
    price: number;
    size?: string;
    color?: string;
  }>;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  shippingAddress: any;
  createdAt: string;
  updatedAt: string;
}

export interface VendorOrdersResponse {
  success: boolean;
  data?: {
    orders: VendorOrder[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private apiUrl = 'http://10.0.2.2:5000/api/vendor'; // Direct IP for testing
  private statsSubject = new BehaviorSubject<VendorStats | null>(null);
  public stats$ = this.statsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get vendor dashboard statistics
   */
  getDashboardStats(): Observable<VendorDashboardResponse> {
    return this.http.get<VendorDashboardResponse>(`${this.apiUrl}/dashboard/stats`);
  }

  /**
   * Get vendor products with pagination and filters
   */
  getProducts(params?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'inactive';
    category?: string;
    search?: string;
    sortBy?: 'name' | 'price' | 'stock' | 'rating';
    sortOrder?: 'asc' | 'desc';
  }): Observable<VendorProductsResponse> {
    let queryParams = '';
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
      queryParams = searchParams.toString();
    }

    const url = queryParams ? `${this.apiUrl}/products?${queryParams}` : `${this.apiUrl}/products`;
    return this.http.get<VendorProductsResponse>(url);
  }

  /**
   * Get vendor orders with pagination and filters
   */
  getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: 'createdAt' | 'amount';
    sortOrder?: 'asc' | 'desc';
  }): Observable<VendorOrdersResponse> {
    let queryParams = '';
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
      queryParams = searchParams.toString();
    }

    const url = queryParams ? `${this.apiUrl}/orders?${queryParams}` : `${this.apiUrl}/orders`;
    return this.http.get<VendorOrdersResponse>(url);
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/orders/${orderId}/status`, { status });
  }

  /**
   * Update local stats cache
   */
  updateStats(stats: VendorStats): void {
    this.statsSubject.next(stats);
  }

  /**
   * Get current stats from cache
   */
  getCurrentStats(): VendorStats | null {
    return this.statsSubject.value;
  }

  /**
   * Get order status display text
   */
  getOrderStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  }

  /**
   * Get order status color
   */
  getOrderStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'pending': 'warning',
      'confirmed': 'primary',
      'processing': 'secondary',
      'shipped': 'tertiary',
      'delivered': 'success',
      'cancelled': 'danger'
    };
    return colorMap[status] || 'medium';
  }

  /**
   * Get payment status display text
   */
  getPaymentStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'paid': 'Paid',
      'failed': 'Failed',
      'refunded': 'Refunded'
    };
    return statusMap[status] || status;
  }

  /**
   * Get payment status color
   */
  getPaymentStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'pending': 'warning',
      'paid': 'success',
      'failed': 'danger',
      'refunded': 'secondary'
    };
    return colorMap[status] || 'medium';
  }

  /**
   * Format currency amount
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Get month name from number
   */
  getMonthName(monthNumber: number): string {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthNumber - 1] || '';
  }

  /**
   * Calculate percentage change
   */
  calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Get available order statuses for vendor
   */
  getAvailableOrderStatuses(): Array<{ value: string; label: string; color: string }> {
    return [
      { value: 'pending', label: 'Pending', color: 'warning' },
      { value: 'confirmed', label: 'Confirmed', color: 'primary' },
      { value: 'processing', label: 'Processing', color: 'secondary' },
      { value: 'shipped', label: 'Shipped', color: 'tertiary' },
      { value: 'delivered', label: 'Delivered', color: 'success' },
      { value: 'cancelled', label: 'Cancelled', color: 'danger' }
    ];
  }

  /**
   * Check if status transition is valid
   */
  isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
    const validTransitions: { [key: string]: string[] } = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [],
      'cancelled': []
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}
