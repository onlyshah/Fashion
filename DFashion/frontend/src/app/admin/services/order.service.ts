import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Order {
  _id?: string;
  orderNumber: string;
  customer: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet' | 'cod';
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  orderDate: string;
  expectedDelivery?: string;
  actualDelivery?: string;
  trackingNumber?: string;
  vendor?: any;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  product: {
    _id: string;
    name: string;
    images: any[];
    price: number;
  };
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface OrderFilters {
  search?: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  customer?: string;
  vendor?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdminOrderResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalOrders: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface OrderResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalOrders: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://10.0.2.2:5000/api/admin'; // Direct IP for testing
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  public orders$ = this.ordersSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Get all orders with filters (Admin API)
  getOrders(filters: OrderFilters = {}): Observable<AdminOrderResponse> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<AdminOrderResponse>(`${this.apiUrl}/orders`, { params });
  }

  // Get order by ID (Admin API)
  getOrderById(id: string): Observable<{success: boolean; data: {order: Order; payment?: any}}> {
    return this.http.get<{success: boolean; data: {order: Order; payment?: any}}>(`${this.apiUrl}/orders/${id}`);
  }

  // Update order status (Admin API)
  updateOrderStatus(id: string, status: string): Observable<{success: boolean; message: string; data: Order}> {
    return this.http.put<{success: boolean; message: string; data: Order}>(`${this.apiUrl}/orders/${id}/status`, { status });
  }

  // Get order analytics (Admin API)
  getOrderAnalytics(): Observable<{success: boolean; data: any}> {
    return this.http.get<{success: boolean; data: any}>(`${this.apiUrl}/analytics/orders`);
  }

  // Update payment status
  updatePaymentStatus(id: string, paymentStatus: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/payment-status`, { paymentStatus });
  }

  // Add tracking number
  addTrackingNumber(id: string, trackingNumber: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/tracking`, { trackingNumber });
  }

  // Cancel order
  cancelOrder(id: string, reason: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/cancel`, { reason });
  }

  // Process refund
  processRefund(id: string, amount: number, reason: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/refund`, { amount, reason });
  }

  // Get order statistics
  getOrderStats(period: string = '30d'): Observable<OrderStats> {
    return this.http.get<OrderStats>(`${this.apiUrl}/stats?period=${period}`);
  }

  // Get orders by customer
  getOrdersByCustomer(customerId: string, filters: OrderFilters = {}): Observable<OrderResponse> {
    const customerFilters = { ...filters, customer: customerId };
    return this.getOrders(customerFilters);
  }

  // Get orders by vendor
  getOrdersByVendor(vendorId: string, filters: OrderFilters = {}): Observable<OrderResponse> {
    const vendorFilters = { ...filters, vendor: vendorId };
    return this.getOrders(vendorFilters);
  }

  // Search orders
  searchOrders(query: string, filters: OrderFilters = {}): Observable<OrderResponse> {
    const searchFilters = { ...filters, search: query };
    return this.getOrders(searchFilters);
  }

  // Get recent orders
  getRecentOrders(limit: number = 10): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/recent?limit=${limit}`);
  }

  // Export orders
  exportOrders(filters: OrderFilters = {}, format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    
    params = params.set('format', format);

    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }

  // Generate invoice
  generateInvoice(orderId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${orderId}/invoice`, {
      responseType: 'blob'
    });
  }

  // Send order confirmation email
  sendOrderConfirmation(orderId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${orderId}/send-confirmation`, {});
  }

  // Send shipping notification
  sendShippingNotification(orderId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${orderId}/send-shipping-notification`, {});
  }

  // Get order timeline
  getOrderTimeline(orderId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${orderId}/timeline`);
  }

  // Bulk operations
  bulkUpdateOrderStatus(orderIds: string[], status: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/bulk-update-status`, {
      orderIds,
      status
    });
  }

  bulkExportOrders(orderIds: string[], format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/bulk-export`, {
      orderIds,
      format
    }, {
      responseType: 'blob'
    });
  }

  // Update orders subject
  updateOrdersSubject(orders: Order[]): void {
    this.ordersSubject.next(orders);
  }

  // Get current orders
  getCurrentOrders(): Order[] {
    return this.ordersSubject.value;
  }
}
