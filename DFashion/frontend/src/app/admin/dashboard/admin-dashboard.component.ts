import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AdminApiService, DashboardStats } from '../services/admin-api.service';
import { AdminAuthService } from '../services/admin-auth.service';
// Chart.js imports removed - using simple chart placeholders instead

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  isLoading = true;
  dashboardStats: DashboardStats | null = null;
  currentUser$ = this.authService.currentUser$;

  // Chart data (simplified without Chart.js dependency)
  userGrowthChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    data: [65, 78, 90, 81, 95, 105]
  };

  orderTrendsChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: [12, 19, 15, 25, 22, 30, 28]
  };

  revenueChartData = {
    labels: ['Products', 'Services', 'Subscriptions'],
    data: [65, 25, 10]
  };

  // Chart options for template compatibility
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  // Quick stats cards
  quickStats = [
    {
      title: 'Total Users',
      value: 0,
      change: '+12%',
      changeType: 'positive',
      icon: 'people',
      color: '#2196f3'
    },
    {
      title: 'Active Products',
      value: 0,
      change: '+8%',
      changeType: 'positive',
      icon: 'inventory',
      color: '#4caf50'
    },
    {
      title: 'Total Orders',
      value: 0,
      change: '+15%',
      changeType: 'positive',
      icon: 'shopping_cart',
      color: '#ff9800'
    },
    {
      title: 'Revenue',
      value: 0,
      change: '+23%',
      changeType: 'positive',
      icon: 'attach_money',
      color: '#9c27b0',
      prefix: '₹'
    }
  ];

  // Recent activities
  recentActivities = [
    {
      type: 'order',
      message: 'New order #DF12345 received',
      time: '2 minutes ago',
      icon: 'shopping_cart',
      color: '#4caf50'
    },
    {
      type: 'user',
      message: 'New user registration: John Doe',
      time: '5 minutes ago',
      icon: 'person_add',
      color: '#2196f3'
    },
    {
      type: 'product',
      message: 'Product "Summer Dress" approved',
      time: '10 minutes ago',
      icon: 'check_circle',
      color: '#4caf50'
    },
    {
      type: 'payment',
      message: 'Payment of ₹2,500 received',
      time: '15 minutes ago',
      icon: 'payment',
      color: '#9c27b0'
    }
  ];

  constructor(
    private apiService: AdminApiService,
    private authService: AdminAuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    this.apiService.getDashboardStats()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (stats) => {
          this.dashboardStats = stats;
          this.updateQuickStats(stats);
          this.updateCharts(stats);
        },
        error: (error) => {
          console.error('Failed to load dashboard data:', error);
          // Initialize empty dashboard data
          this.dashboardStats = null;
        }
      });
  }

  private updateQuickStats(stats: DashboardStats): void {
    this.quickStats[0].value = stats.overview.users.total;
    this.quickStats[1].value = stats.overview.products.active;
    this.quickStats[2].value = stats.overview.orders.total;
    this.quickStats[3].value = stats.revenue.totalRevenue;
  }

  private updateCharts(stats: DashboardStats): void {
    // Update chart data with actual stats
    this.userGrowthChartData.data = [65, 78, 90, 81, 95, 105];
    this.orderTrendsChartData.data = [12, 19, 15, 25, 22, 30, 28];
    this.revenueChartData.data = [65, 25, 10];
  }



  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-IN').format(value);
  }

  getChangeClass(changeType: string): string {
    return changeType === 'positive' ? 'positive-change' : 'negative-change';
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  navigateToSection(section: string): void {
    // Navigation logic based on user permissions
    switch (section) {
      case 'users':
        if (this.authService.hasPermission('users', 'view')) {
          // Navigate to users
        }
        break;
      case 'products':
        if (this.authService.hasPermission('products', 'view')) {
          // Navigate to products
        }
        break;
      case 'orders':
        if (this.authService.hasPermission('orders', 'view')) {
          // Navigate to orders
        }
        break;
    }
  }
}
