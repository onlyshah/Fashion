import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vendor-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="vendor-orders-container">
      <div class="header">
        <h1>Orders</h1>
        <div class="order-stats">
          <div class="stat-item">
            <span class="stat-value">{{ getTotalOrders() }}</span>
            <span class="stat-label">Total Orders</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ getPendingOrders() }}</span>
            <span class="stat-label">Pending</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">₹{{ getTotalRevenue() | number:'1.0-0' }}</span>
            <span class="stat-label">Revenue</span>
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button 
          *ngFor="let filter of filters" 
          class="filter-tab"
          [class.active]="activeFilter === filter.key"
          (click)="setActiveFilter(filter.key)"
        >
          {{ filter.label }} ({{ getOrdersByStatus(filter.key).length }})
        </button>
      </div>

      <!-- Orders List -->
      <div class="orders-list" *ngIf="filteredOrders.length > 0">
        <div class="order-card" *ngFor="let order of filteredOrders">
          <div class="order-header">
            <div class="order-info">
              <h3>Order #{{ order.orderNumber }}</h3>
              <span class="order-date">{{ order.createdAt | date:'medium' }}</span>
            </div>
            <div class="order-status">
              <span class="status-badge" [class]="order.status">{{ order.status | titlecase }}</span>
              <span class="order-total">₹{{ order.total | number:'1.0-0' }}</span>
            </div>
          </div>

          <div class="order-customer">
            <div class="customer-info">
              <i class="fas fa-user"></i>
              <span>{{ order.customer.name }}</span>
            </div>
            <div class="customer-contact">
              <i class="fas fa-phone"></i>
              <span>{{ order.customer.phone }}</span>
            </div>
          </div>

          <div class="order-items">
            <div class="item" *ngFor="let item of order.items">
              <img [src]="getImageUrl(item.product.images[0])" [alt]="item.product.name">
              <div class="item-details">
                <h4>{{ item.product.name }}</h4>
                <p>Qty: {{ item.quantity }} × ₹{{ item.price | number:'1.0-0' }}</p>
                <div class="item-variants" *ngIf="item.size || item.color">
                  <span *ngIf="item.size">Size: {{ item.size }}</span>
                  <span *ngIf="item.color">Color: {{ item.color }}</span>
                </div>
              </div>
              <div class="item-total">
                ₹{{ (item.quantity * item.price) | number:'1.0-0' }}
              </div>
            </div>
          </div>

          <div class="order-address">
            <h4>Shipping Address:</h4>
            <p>{{ order.shippingAddress.addressLine1 }}, {{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} - {{ order.shippingAddress.pincode }}</p>
          </div>

          <div class="order-actions">
            <button class="btn-primary" (click)="updateOrderStatus(order)" *ngIf="order.status === 'pending'">
              <i class="fas fa-check"></i> Confirm Order
            </button>
            <button class="btn-secondary" (click)="updateOrderStatus(order)" *ngIf="order.status === 'confirmed'">
              <i class="fas fa-truck"></i> Mark as Shipped
            </button>
            <button class="btn-success" (click)="updateOrderStatus(order)" *ngIf="order.status === 'shipped'">
              <i class="fas fa-box"></i> Mark as Delivered
            </button>
            <button class="btn-view" (click)="viewOrderDetails(order)">
              <i class="fas fa-eye"></i> View Details
            </button>
            <button class="btn-contact" (click)="contactCustomer(order)">
              <i class="fas fa-phone"></i> Contact Customer
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="filteredOrders.length === 0">
        <div class="empty-content">
          <i class="fas fa-shopping-bag"></i>
          <h2>No {{ activeFilter === 'all' ? '' : activeFilter }} orders</h2>
          <p>{{ getEmptyMessage() }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .vendor-orders-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      margin-bottom: 30px;
    }

    .header h1 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 20px;
    }

    .order-stats {
      display: flex;
      gap: 30px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #333;
    }

    .stat-label {
      font-size: 0.85rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .filter-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      border-bottom: 1px solid #eee;
    }

    .filter-tab {
      padding: 12px 20px;
      border: none;
      background: none;
      cursor: pointer;
      font-weight: 500;
      color: #666;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }

    .filter-tab:hover {
      color: #007bff;
    }

    .filter-tab.active {
      color: #007bff;
      border-bottom-color: #007bff;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .order-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border: 1px solid #eee;
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .order-info h3 {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .order-date {
      color: #666;
      font-size: 0.9rem;
    }

    .order-status {
      text-align: right;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .status-badge.pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.confirmed {
      background: #cce7ff;
      color: #0066cc;
    }

    .status-badge.shipped {
      background: #e7f3ff;
      color: #007bff;
    }

    .status-badge.delivered {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.cancelled {
      background: #f8d7da;
      color: #721c24;
    }

    .order-total {
      display: block;
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
    }

    .order-customer {
      display: flex;
      gap: 24px;
      margin-bottom: 16px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .customer-info, .customer-contact {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
    }

    .order-items {
      margin-bottom: 16px;
    }

    .item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .item:last-child {
      border-bottom: none;
    }

    .item img {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 8px;
    }

    .item-details {
      flex: 1;
    }

    .item-details h4 {
      font-size: 1rem;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .item-details p {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 4px;
    }

    .item-variants {
      display: flex;
      gap: 12px;
      font-size: 0.8rem;
      color: #666;
    }

    .item-total {
      font-weight: 600;
      color: #333;
    }

    .order-address {
      margin-bottom: 20px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .order-address h4 {
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 6px;
      color: #333;
    }

    .order-address p {
      font-size: 0.9rem;
      color: #666;
      margin: 0;
    }

    .order-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .btn-primary, .btn-secondary, .btn-success, .btn-view, .btn-contact {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #545b62;
    }

    .btn-success {
      background: #28a745;
      color: white;
    }

    .btn-success:hover {
      background: #1e7e34;
    }

    .btn-view {
      background: #f8f9fa;
      color: #495057;
      border: 1px solid #dee2e6;
    }

    .btn-view:hover {
      background: #e9ecef;
    }

    .btn-contact {
      background: #17a2b8;
      color: white;
    }

    .btn-contact:hover {
      background: #138496;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }

    .empty-content i {
      font-size: 4rem;
      color: #ddd;
      margin-bottom: 20px;
    }

    .empty-content h2 {
      font-size: 1.5rem;
      margin-bottom: 10px;
    }

    .empty-content p {
      color: #666;
    }

    @media (max-width: 768px) {
      .order-header {
        flex-direction: column;
        gap: 12px;
      }

      .order-customer {
        flex-direction: column;
        gap: 8px;
      }

      .order-actions {
        flex-direction: column;
      }

      .filter-tabs {
        flex-wrap: wrap;
      }
    }
  `]
})
export class VendorOrdersComponent implements OnInit {
  orders: any[] = [];
  activeFilter = 'all';
  filteredOrders: any[] = [];

  filters = [
    { key: 'all', label: 'All Orders' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' }
  ];

  constructor() {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    // Load vendor orders from API
    this.orders = [];
    this.filterOrders();
  }

  setActiveFilter(filter: string) {
    this.activeFilter = filter;
    this.filterOrders();
  }

  filterOrders() {
    if (this.activeFilter === 'all') {
      this.filteredOrders = this.orders;
    } else {
      this.filteredOrders = this.orders.filter(order => order.status === this.activeFilter);
    }
  }

  getOrdersByStatus(status: string): any[] {
    if (status === 'all') {
      return this.orders;
    }
    return this.orders.filter(order => order.status === status);
  }

  getTotalOrders(): number {
    return this.orders.length;
  }

  getPendingOrders(): number {
    return this.orders.filter(order => order.status === 'pending').length;
  }

  getTotalRevenue(): number {
    return this.orders.reduce((total, order) => total + order.total, 0);
  }

  getImageUrl(image: any): string {
    if (typeof image === 'string') {
      return image;
    }
    return image?.url || '/assets/images/placeholder.jpg';
  }

  getEmptyMessage(): string {
    switch (this.activeFilter) {
      case 'pending':
        return 'No pending orders at the moment.';
      case 'confirmed':
        return 'No confirmed orders to process.';
      case 'shipped':
        return 'No shipped orders currently.';
      case 'delivered':
        return 'No delivered orders yet.';
      case 'cancelled':
        return 'No cancelled orders.';
      default:
        return 'No orders received yet. Start promoting your products!';
    }
  }

  updateOrderStatus(order: any) {
    // TODO: Implement order status update API
    const statusFlow = {
      'pending': 'confirmed',
      'confirmed': 'shipped',
      'shipped': 'delivered'
    };
    
    const newStatus = statusFlow[order.status as keyof typeof statusFlow];
    if (newStatus) {
      order.status = newStatus;
      this.filterOrders();
      alert(`Order #${order.orderNumber} status updated to ${newStatus}`);
    }
  }

  viewOrderDetails(order: any) {
    // TODO: Navigate to order details page
    console.log('View order details:', order);
  }

  contactCustomer(order: any) {
    // TODO: Open contact options
    console.log('Contact customer:', order.customer);
  }
}
