import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnalyticsService } from '../services/analytics.service';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  selectedPeriod = '30d';
  periods = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '12m', label: 'Last 12 months' }
  ];

  // Analytics data
  totalRevenue = 0;
  revenueGrowth = 0;
  totalOrders = 0;
  orderGrowth = 0;
  totalCustomers = 0;
  customerGrowth = 0;
  conversionRate = 0;
  conversionChange = 0;

  newCustomers = 0;
  newCustomerGrowth = 0;
  returningCustomers = 0;
  returningCustomerGrowth = 0;
  averageOrderValue = 0;
  aovChange = 0;

  isLoading = false;

  topProducts = [
    { name: 'Classic White Shirt', sales: 45, revenue: 112500, trend: 1 },
    { name: 'Denim Jeans', sales: 38, revenue: 95000, trend: 1 },
    { name: 'Summer Dress', sales: 32, revenue: 80000, trend: -1 },
    { name: 'Casual Sneakers', sales: 28, revenue: 70000, trend: 1 },
    { name: 'Leather Jacket', sales: 22, revenue: 55000, trend: -1 }
  ];

  trafficSources = [
    { name: 'Direct', percentage: 35, visitors: 4200 },
    { name: 'Google Search', percentage: 28, visitors: 3360 },
    { name: 'Social Media', percentage: 18, visitors: 2160 },
    { name: 'Email Marketing', percentage: 12, visitors: 1440 },
    { name: 'Referrals', percentage: 7, visitors: 840 }
  ];

  constructor(
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.loadAnalyticsData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPeriodChange(): void {
    this.loadAnalyticsData();
  }

  loadAnalyticsData(): void {
    this.isLoading = true;

    // Load dashboard stats
    this.analyticsService.getDashboardStats().subscribe({
      next: (response) => {
        if (response.success) {
          const data = response.data;

          // Update overview stats
          this.totalCustomers = data.overview.users.total || 0;
          this.totalOrders = data.overview.orders.total || 0;
          this.totalRevenue = data.revenue.totalRevenue || 0;
          this.averageOrderValue = data.revenue.averageOrderValue || 0;

          // Calculate growth rates (mock for now)
          this.customerGrowth = 15.2;
          this.orderGrowth = 8.3;
          this.revenueGrowth = 12.5;
          this.conversionRate = 3.2;

          // Update top products from analytics
          if (data.analytics.topPerformingProducts) {
            this.topProducts = data.analytics.topPerformingProducts.slice(0, 5).map((product: any, index: number) => ({
              name: product.name,
              sales: product.analytics?.purchases || 0,
              revenue: product.price * (product.analytics?.purchases || 0),
              trend: index % 2 === 0 ? 1 : -1 // Mock trend
            }));
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.isLoading = false;
      }
    });

    // Load order analytics
    this.analyticsService.getOrderAnalytics().subscribe({
      next: (response) => {
        if (response.success) {
          const data = response.data;

          // Update order-specific metrics
          if (data.revenueStats) {
            this.totalRevenue = data.revenueStats.totalRevenue || 0;
            this.averageOrderValue = data.revenueStats.averageOrderValue || 0;
            this.totalOrders = data.revenueStats.totalOrders || 0;
          }
        }
      },
      error: (error) => {
        console.error('Error loading order analytics:', error);
      }
    });
  }

  exportReport(type: string): void {
    console.log('Exporting report:', type);
    // Implement export functionality
  }
}
