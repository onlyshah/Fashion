import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  newUsersToday: number;
  ordersToday: number;
  revenueToday: number;
  conversionRate: number;
}

export interface SalesData {
  date: string;
  sales: number;
  orders: number;
  revenue: number;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userGrowth: number;
  usersByRole: { [key: string]: number };
  usersByDepartment: { [key: string]: number };
}

export interface ProductAnalytics {
  totalProducts: number;
  activeProducts: number;
  featuredProducts: number;
  productsByCategory: { [key: string]: number };
  topSellingProducts: any[];
  lowStockProducts: any[];
}

export interface OrderAnalytics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  ordersByStatus: { [key: string]: number };
  ordersByPaymentMethod: { [key: string]: number };
}

export interface RevenueAnalytics {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  revenueByCategory: { [key: string]: number };
  revenueByMonth: SalesData[];
}

export interface TrafficAnalytics {
  totalViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  averageSessionDuration: number;
  topPages: any[];
  trafficSources: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = 'http://10.0.2.2:5000/api/admin'; // Direct IP for testing

  constructor(private http: HttpClient) {}

  // Dashboard Statistics (Admin API)
  getDashboardStats(): Observable<{success: boolean; data: any}> {
    return this.http.get<{success: boolean; data: any}>(`${this.apiUrl}/dashboard`);
  }



  // Sales Analytics
  getSalesData(period: string = '30d'): Observable<SalesData[]> {
    return this.http.get<SalesData[]>(`${this.apiUrl}/sales?period=${period}`);
  }

  getSalesStats(period: string = '30d'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sales/stats?period=${period}`);
  }

  // User Analytics
  getUserAnalytics(period: string = '30d'): Observable<UserAnalytics> {
    return this.http.get<UserAnalytics>(`${this.apiUrl}/users?period=${period}`);
  }

  getUserGrowth(period: string = '12m'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/growth?period=${period}`);
  }

  getUserActivity(period: string = '7d'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/activity?period=${period}`);
  }

  // Product Analytics
  getProductAnalytics(period: string = '30d'): Observable<ProductAnalytics> {
    return this.http.get<ProductAnalytics>(`${this.apiUrl}/products?period=${period}`);
  }

  getTopSellingProducts(limit: number = 10, period: string = '30d'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products/top-selling?limit=${limit}&period=${period}`);
  }

  getProductPerformance(productId: string, period: string = '30d'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/products/${productId}/performance?period=${period}`);
  }

  // Order Analytics
  getOrderAnalytics(period: string = '30d'): Observable<{success: boolean; data: any}> {
    return this.http.get<{success: boolean; data: any}>(`${this.apiUrl}/orders?period=${period}`);
  }

  getOrderTrends(period: string = '12m'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders/trends?period=${period}`);
  }

  // Revenue Analytics
  getRevenueAnalytics(period: string = '30d'): Observable<RevenueAnalytics> {
    return this.http.get<RevenueAnalytics>(`${this.apiUrl}/revenue?period=${period}`);
  }

  getRevenueByCategory(period: string = '30d'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/revenue/by-category?period=${period}`);
  }

  getRevenueByVendor(period: string = '30d'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/revenue/by-vendor?period=${period}`);
  }

  // Traffic Analytics
  getTrafficAnalytics(period: string = '30d'): Observable<TrafficAnalytics> {
    return this.http.get<TrafficAnalytics>(`${this.apiUrl}/traffic?period=${period}`);
  }

  getPageViews(period: string = '7d'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/traffic/page-views?period=${period}`);
  }

  // Conversion Analytics
  getConversionRates(period: string = '30d'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/conversion?period=${period}`);
  }

  getFunnelAnalytics(period: string = '30d'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/conversion/funnel?period=${period}`);
  }

  // Customer Analytics
  getCustomerAnalytics(period: string = '30d'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/customers?period=${period}`);
  }

  getCustomerLifetimeValue(period: string = '12m'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/customers/lifetime-value?period=${period}`);
  }

  getCustomerRetention(period: string = '12m'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/customers/retention?period=${period}`);
  }

  // Inventory Analytics
  getInventoryAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/inventory`);
  }

  getLowStockProducts(threshold: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inventory/low-stock?threshold=${threshold}`);
  }

  getStockMovement(period: string = '30d'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inventory/movement?period=${period}`);
  }

  // Marketing Analytics
  getMarketingAnalytics(period: string = '30d'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/marketing?period=${period}`);
  }

  getCampaignPerformance(period: string = '30d'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/marketing/campaigns?period=${period}`);
  }

  // Financial Analytics
  getFinancialAnalytics(period: string = '30d'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/financial?period=${period}`);
  }

  getProfitAnalysis(period: string = '30d'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/financial/profit?period=${period}`);
  }

  // Export Analytics
  exportAnalyticsReport(type: string, period: string = '30d', format: 'csv' | 'excel' | 'pdf' = 'csv'): Observable<Blob> {
    let params = new HttpParams()
      .set('type', type)
      .set('period', period)
      .set('format', format);

    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }

  // Real-time Analytics
  getRealTimeStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/real-time`);
  }

  // Custom Analytics
  getCustomAnalytics(query: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/custom`, query);
  }

  // Comparative Analytics
  getComparativeAnalytics(periods: string[]): Observable<any> {
    let params = new HttpParams();
    periods.forEach(period => {
      params = params.append('periods', period);
    });

    return this.http.get<any>(`${this.apiUrl}/comparative`, { params });
  }
}
