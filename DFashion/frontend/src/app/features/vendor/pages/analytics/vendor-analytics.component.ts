import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vendor-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="vendor-analytics-container">
      <div class="header">
        <h1>Analytics Dashboard</h1>
        <div class="date-filter">
          <select [(ngModel)]="selectedPeriod" (change)="onPeriodChange()">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon">
            <i class="fas fa-rupee-sign"></i>
          </div>
          <div class="metric-content">
            <h3>₹{{ analytics.revenue | number:'1.0-0' }}</h3>
            <p>Total Revenue</p>
            <span class="metric-change positive">+12.5%</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <i class="fas fa-shopping-cart"></i>
          </div>
          <div class="metric-content">
            <h3>{{ analytics.orders }}</h3>
            <p>Total Orders</p>
            <span class="metric-change positive">+8.3%</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <i class="fas fa-eye"></i>
          </div>
          <div class="metric-content">
            <h3>{{ analytics.views | number:'1.0-0' }}</h3>
            <p>Product Views</p>
            <span class="metric-change positive">+15.7%</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <i class="fas fa-percentage"></i>
          </div>
          <div class="metric-content">
            <h3>{{ analytics.conversionRate }}%</h3>
            <p>Conversion Rate</p>
            <span class="metric-change negative">-2.1%</span>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <div class="chart-card">
          <h3>Revenue Trend</h3>
          <div class="chart-placeholder">
            <div class="chart-bars">
              <div class="bar" *ngFor="let data of revenueData" [style.height.%]="data.percentage">
                <span class="bar-value">₹{{ data.value | number:'1.0-0' }}</span>
              </div>
            </div>
            <div class="chart-labels">
              <span *ngFor="let label of chartLabels">{{ label }}</span>
            </div>
          </div>
        </div>

        <div class="chart-card">
          <h3>Order Status Distribution</h3>
          <div class="pie-chart">
            <div class="pie-item" *ngFor="let item of orderStatusData">
              <div class="pie-color" [style.background-color]="item.color"></div>
              <span class="pie-label">{{ item.label }}</span>
              <span class="pie-value">{{ item.value }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Products -->
      <div class="top-products-section">
        <h3>Top Performing Products</h3>
        <div class="products-table">
          <div class="table-header">
            <span>Product</span>
            <span>Views</span>
            <span>Orders</span>
            <span>Revenue</span>
            <span>Conversion</span>
          </div>
          <div class="table-row" *ngFor="let product of topProducts">
            <div class="product-info">
              <img [src]="product.image" [alt]="product.name">
              <span>{{ product.name }}</span>
            </div>
            <span>{{ product.views | number:'1.0-0' }}</span>
            <span>{{ product.orders }}</span>
            <span>₹{{ product.revenue | number:'1.0-0' }}</span>
            <span>{{ product.conversion }}%</span>
          </div>
        </div>
      </div>

      <!-- Social Media Performance -->
      <div class="social-performance">
        <h3>Content Performance</h3>
        <div class="performance-grid">
          <div class="performance-card">
            <h4>Posts</h4>
            <div class="performance-stats">
              <div class="stat">
                <span class="stat-value">{{ socialStats.posts.total }}</span>
                <span class="stat-label">Total Posts</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ socialStats.posts.likes }}</span>
                <span class="stat-label">Total Likes</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ socialStats.posts.comments }}</span>
                <span class="stat-label">Comments</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ socialStats.posts.shares }}</span>
                <span class="stat-label">Shares</span>
              </div>
            </div>
          </div>

          <div class="performance-card">
            <h4>Stories</h4>
            <div class="performance-stats">
              <div class="stat">
                <span class="stat-value">{{ socialStats.stories.total }}</span>
                <span class="stat-label">Total Stories</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ socialStats.stories.views }}</span>
                <span class="stat-label">Total Views</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ socialStats.stories.replies }}</span>
                <span class="stat-label">Replies</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ socialStats.stories.productClicks }}</span>
                <span class="stat-label">Product Clicks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .vendor-analytics-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .header h1 {
      font-size: 2rem;
      font-weight: 600;
    }

    .date-filter select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.9rem;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .metric-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .metric-icon {
      width: 50px;
      height: 50px;
      background: #f0f8ff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #007bff;
      font-size: 1.2rem;
    }

    .metric-content h3 {
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 4px;
      color: #333;
    }

    .metric-content p {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 8px;
    }

    .metric-change {
      font-size: 0.8rem;
      font-weight: 500;
    }

    .metric-change.positive {
      color: #28a745;
    }

    .metric-change.negative {
      color: #dc3545;
    }

    .charts-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
      margin-bottom: 30px;
    }

    .chart-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .chart-card h3 {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 20px;
    }

    .chart-placeholder {
      height: 200px;
      position: relative;
    }

    .chart-bars {
      display: flex;
      align-items: flex-end;
      height: 160px;
      gap: 8px;
      margin-bottom: 10px;
    }

    .bar {
      flex: 1;
      background: linear-gradient(to top, #007bff, #66b3ff);
      border-radius: 4px 4px 0 0;
      position: relative;
      min-height: 20px;
    }

    .bar-value {
      position: absolute;
      top: -20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.7rem;
      color: #666;
    }

    .chart-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: #666;
    }

    .pie-chart {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .pie-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .pie-color {
      width: 16px;
      height: 16px;
      border-radius: 50%;
    }

    .pie-label {
      flex: 1;
      font-size: 0.9rem;
    }

    .pie-value {
      font-weight: 600;
      color: #333;
    }

    .top-products-section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .top-products-section h3 {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 20px;
    }

    .products-table {
      display: flex;
      flex-direction: column;
    }

    .table-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
      gap: 16px;
      padding: 12px 0;
      border-bottom: 2px solid #eee;
      font-weight: 600;
      color: #333;
    }

    .table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid #f0f0f0;
      align-items: center;
    }

    .product-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .product-info img {
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: 6px;
    }

    .social-performance {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .social-performance h3 {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 20px;
    }

    .performance-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .performance-card {
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 20px;
    }

    .performance-card h4 {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 16px;
      color: #333;
    }

    .performance-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .stat {
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 0.8rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .charts-section {
        grid-template-columns: 1fr;
      }

      .performance-grid {
        grid-template-columns: 1fr;
      }

      .table-header,
      .table-row {
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .table-header {
        display: none;
      }

      .table-row {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 8px;
      }
    }
  `]
})
export class VendorAnalyticsComponent implements OnInit {
  selectedPeriod = '30';
  
  analytics = {
    revenue: 125000,
    orders: 150,
    views: 12500,
    conversionRate: 3.2
  };

  revenueData = [
    { value: 15000, percentage: 60 },
    { value: 18000, percentage: 72 },
    { value: 22000, percentage: 88 },
    { value: 25000, percentage: 100 },
    { value: 20000, percentage: 80 },
    { value: 23000, percentage: 92 },
    { value: 28000, percentage: 100 }
  ];

  chartLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  orderStatusData = [
    { label: 'Delivered', value: 65, color: '#28a745' },
    { label: 'Shipped', value: 20, color: '#007bff' },
    { label: 'Confirmed', value: 10, color: '#ffc107' },
    { label: 'Pending', value: 5, color: '#dc3545' }
  ];

  topProducts = [
    {
      name: 'Summer Dress',
      image: '/assets/images/product1.jpg',
      views: 2500,
      orders: 45,
      revenue: 134550,
      conversion: 1.8
    },
    {
      name: 'Casual Shirt',
      image: '/assets/images/product2.jpg',
      views: 1800,
      orders: 32,
      revenue: 51168,
      conversion: 1.7
    },
    {
      name: 'Sneakers',
      image: '/assets/images/product3.jpg',
      views: 1200,
      orders: 28,
      revenue: 139720,
      conversion: 2.3
    }
  ];

  socialStats = {
    posts: {
      total: 12,
      likes: 456,
      comments: 89,
      shares: 34
    },
    stories: {
      total: 8,
      views: 1234,
      replies: 67,
      productClicks: 234
    }
  };

  constructor() {}

  ngOnInit() {
    this.loadAnalytics();
  }

  onPeriodChange() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    // TODO: Implement API call to get analytics data based on selected period
    console.log('Loading analytics for period:', this.selectedPeriod);
  }
}
