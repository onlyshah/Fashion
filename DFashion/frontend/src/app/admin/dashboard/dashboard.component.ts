import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnalyticsService, DashboardStats } from '../services/analytics.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening with your store.</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon users">
                <mat-icon>people</mat-icon>
              </div>
              <div class="stat-details">
                <h3>{{ stats.totalUsers | number }}</h3>
                <p>Total Users</p>
                <span class="stat-change positive">+{{ stats.newUsersToday }} today</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon products">
                <mat-icon>inventory_2</mat-icon>
              </div>
              <div class="stat-details">
                <h3>{{ stats.totalProducts | number }}</h3>
                <p>Total Products</p>
                <span class="stat-change neutral">Active inventory</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon orders">
                <mat-icon>shopping_cart</mat-icon>
              </div>
              <div class="stat-details">
                <h3>{{ stats.totalOrders | number }}</h3>
                <p>Total Orders</p>
                <span class="stat-change positive">+{{ stats.ordersToday }} today</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon revenue">
                <mat-icon>attach_money</mat-icon>
              </div>
              <div class="stat-details">
                <h3>₹{{ stats.totalRevenue | number }}</h3>
                <p>Total Revenue</p>
                <span class="stat-change positive">₹{{ stats.revenueToday | number }} today</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Charts and Analytics -->
      <div class="analytics-grid">
        <!-- Recent Orders -->
        <mat-card class="analytics-card">
          <mat-card-header>
            <mat-card-title>Recent Orders</mat-card-title>
            <mat-card-subtitle>Latest customer orders</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="recent-orders">
              <div *ngFor="let order of recentOrders" class="order-item">
                <div class="order-info">
                  <div class="order-number">{{ order.orderNumber }}</div>
                  <div class="customer-name">{{ order.customerName }}</div>
                </div>
                <div class="order-amount">₹{{ order.amount | number }}</div>
                <div class="order-status" [style.color]="getStatusColor(order.status)">
                  {{ order.status | titlecase }}
                </div>
              </div>
              <div *ngIf="recentOrders.length === 0" class="no-orders">
                <mat-icon>shopping_cart</mat-icon>
                <p>No recent orders</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Top Products -->
        <mat-card class="analytics-card">
          <mat-card-header>
            <mat-card-title>Top Products</mat-card-title>
            <mat-card-subtitle>Best selling products this month</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="top-products">
              <div *ngFor="let product of topProducts; let i = index" class="product-item">
                <div class="product-rank">{{ i + 1 }}</div>
                <div class="product-info">
                  <div class="product-name">{{ product.name }}</div>
                  <div class="product-sales">{{ product.sales }} sales</div>
                </div>
                <div class="product-revenue">₹{{ product.revenue | number }}</div>
              </div>
              <div *ngIf="topProducts.length === 0" class="no-products">
                <mat-icon>inventory_2</mat-icon>
                <p>No product data</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Quick Actions -->
        <mat-card class="analytics-card">
          <mat-card-header>
            <mat-card-title>Quick Actions</mat-card-title>
            <mat-card-subtitle>Common administrative tasks</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="quick-actions">
              <button mat-raised-button color="primary" routerLink="/admin/users/new">
                <mat-icon>person_add</mat-icon>
                Add User
              </button>
              <button mat-raised-button color="accent" routerLink="/admin/products/new">
                <mat-icon>add_box</mat-icon>
                Add Product
              </button>
              <button mat-raised-button routerLink="/admin/orders">
                <mat-icon>list_alt</mat-icon>
                View Orders
              </button>
              <button mat-raised-button routerLink="/admin/analytics">
                <mat-icon>analytics</mat-icon>
                View Analytics
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- System Status -->
        <mat-card class="analytics-card">
          <mat-card-header>
            <mat-card-title>System Status</mat-card-title>
            <mat-card-subtitle>Current system health</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="system-status">
              <div class="status-item">
                <div class="status-indicator online"></div>
                <span>Database: Online</span>
              </div>
              <div class="status-item">
                <div class="status-indicator online"></div>
                <span>API: Operational</span>
              </div>
              <div class="status-item">
                <div class="status-indicator online"></div>
                <span>Payment Gateway: Active</span>
              </div>
              <div class="status-item">
                <div class="status-indicator warning"></div>
                <span>Storage: 78% Used</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  stats: DashboardStats = {
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    newUsersToday: 0,
    ordersToday: 0,
    revenueToday: 0,
    conversionRate: 0
  };

  recentOrders: any[] = [
    {
      orderNumber: 'ORD-2024-001',
      customerName: 'John Doe',
      amount: 2500,
      status: 'confirmed'
    },
    {
      orderNumber: 'ORD-2024-002',
      customerName: 'Jane Smith',
      amount: 1800,
      status: 'shipped'
    },
    {
      orderNumber: 'ORD-2024-003',
      customerName: 'Mike Johnson',
      amount: 3200,
      status: 'delivered'
    }
  ];

  topProducts: any[] = [
    {
      name: 'Classic White Shirt',
      sales: 45,
      revenue: 112500
    },
    {
      name: 'Denim Jeans',
      sales: 38,
      revenue: 95000
    },
    {
      name: 'Summer Dress',
      sales: 32,
      revenue: 80000
    }
  ];

  constructor(
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    // Load dashboard statistics
    this.analyticsService.getDashboardStats('30d')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.stats = stats;
        },
        error: (error) => {
          console.error('Error loading dashboard stats:', error);
          // Initialize with empty stats
          this.stats = {
            totalUsers: 0,
            totalProducts: 0,
            totalOrders: 0,
            totalRevenue: 0,
            newUsersToday: 0,
            ordersToday: 0,
            revenueToday: 0,
            conversionRate: 0
          };
        }
      });
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'pending': '#ff9800',
      'confirmed': '#2196f3',
      'shipped': '#9c27b0',
      'delivered': '#4caf50',
      'cancelled': '#f44336'
    };
    return statusColors[status] || '#666666';
  }
}
