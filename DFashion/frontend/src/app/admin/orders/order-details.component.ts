import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-order-details',
  template: `
    <h2 mat-dialog-title>Order Details - {{ order.orderNumber }}</h2>
    
    <mat-dialog-content class="order-details-content">
      <div class="order-info-grid">
        <!-- Order Status -->
        <mat-card class="info-card">
          <mat-card-header>
            <mat-card-title>Order Status</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="status-info">
              <span class="status-badge" [style.background-color]="getStatusColor(order.status)">
                {{ order.status | titlecase }}
              </span>
              <div class="status-details">
                <p><strong>Order Date:</strong> {{ formatDate(order.orderDate) }}</p>
                <p><strong>Expected Delivery:</strong> {{ formatDate(order.expectedDelivery) }}</p>
                <p *ngIf="order.trackingNumber"><strong>Tracking:</strong> {{ order.trackingNumber }}</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Customer Information -->
        <mat-card class="info-card">
          <mat-card-header>
            <mat-card-title>Customer Information</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="customer-info">
              <p><strong>Name:</strong> {{ order.customer?.fullName }}</p>
              <p><strong>Email:</strong> {{ order.customer?.email }}</p>
              <p><strong>Phone:</strong> {{ order.customer?.phone || 'N/A' }}</p>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Shipping Address -->
        <mat-card class="info-card">
          <mat-card-header>
            <mat-card-title>Shipping Address</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="address-info">
              <p><strong>{{ order.shippingAddress?.fullName }}</strong></p>
              <p>{{ order.shippingAddress?.addressLine1 }}</p>
              <p *ngIf="order.shippingAddress?.addressLine2">{{ order.shippingAddress?.addressLine2 }}</p>
              <p>{{ order.shippingAddress?.city }}, {{ order.shippingAddress?.state }} {{ order.shippingAddress?.pincode }}</p>
              <p>{{ order.shippingAddress?.country }}</p>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Payment Information -->
        <mat-card class="info-card">
          <mat-card-header>
            <mat-card-title>Payment Information</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="payment-info">
              <p><strong>Method:</strong> {{ order.paymentMethod | titlecase }}</p>
              <p><strong>Status:</strong> 
                <span [style.color]="getPaymentStatusColor(order.paymentStatus)">
                  {{ order.paymentStatus | titlecase }}
                </span>
              </p>
              <p><strong>Total Amount:</strong> ₹{{ order.totalAmount | number:'1.2-2' }}</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Order Items -->
      <mat-card class="items-card">
        <mat-card-header>
          <mat-card-title>Order Items ({{ order.items?.length || 0 }})</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="items-list">
            <div *ngFor="let item of order.items" class="item-row">
              <div class="item-image">
                <img [src]="getItemImage(item)" [alt]="item.product?.name" />
              </div>
              <div class="item-details">
                <h4>{{ item.product?.name }}</h4>
                <p class="item-specs">
                  <span *ngIf="item.size">Size: {{ item.size }}</span>
                  <span *ngIf="item.color">Color: {{ item.color }}</span>
                </p>
                <p class="item-price">₹{{ item.price | number:'1.2-2' }} × {{ item.quantity }}</p>
              </div>
              <div class="item-total">
                ₹{{ (item.price * item.quantity) | number:'1.2-2' }}
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Order Actions -->
      <div class="order-actions" *ngIf="canUpdateOrder()">
        <mat-form-field appearance="outline">
          <mat-label>Update Status</mat-label>
          <mat-select [(value)]="selectedStatus">
            <mat-option *ngFor="let status of availableStatuses" [value]="status.value">
              {{ status.label }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" *ngIf="selectedStatus === 'shipped'">
          <mat-label>Tracking Number</mat-label>
          <input matInput [(ngModel)]="trackingNumber" placeholder="Enter tracking number">
        </mat-form-field>
      </div>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Close</button>
      <button mat-raised-button color="primary" 
              *ngIf="canUpdateOrder()"
              [disabled]="isLoading"
              (click)="updateOrderStatus()">
        <mat-spinner *ngIf="isLoading" diameter="20" class="action-spinner"></mat-spinner>
        Update Order
      </button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit {
  selectedStatus: string = '';
  trackingNumber: string = '';
  isLoading: boolean = false;

  availableStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  constructor(
    public dialogRef: MatDialogRef<OrderDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public order: any,
    private orderService: OrderService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.selectedStatus = this.order.status;
    this.trackingNumber = this.order.trackingNumber || '';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  canUpdateOrder(): boolean {
    return this.order.status !== 'delivered' && this.order.status !== 'cancelled';
  }

  updateOrderStatus(): void {
    if (this.selectedStatus === this.order.status && 
        this.trackingNumber === this.order.trackingNumber) {
      this.onCancel();
      return;
    }

    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      this.snackBar.open('Order status updated successfully', 'Close', {
        duration: 3000
      });
      this.dialogRef.close({
        status: this.selectedStatus,
        trackingNumber: this.trackingNumber
      });
    }, 1000);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  getPaymentStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'pending': '#ff9800',
      'paid': '#4caf50',
      'failed': '#f44336',
      'refunded': '#9e9e9e'
    };
    return statusColors[status] || '#666666';
  }

  getItemImage(item: any): string {
    return item.product?.images?.[0]?.url || '/assets/images/placeholder-product.jpg';
  }
}
