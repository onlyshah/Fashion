import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { OrderService, Order } from '../services/order.service';

@Component({
  selector: 'app-order-management',
  template: `
    <div class="order-management">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Order Management</mat-card-title>
          <mat-card-subtitle>Track and manage customer orders</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Filters -->
          <div class="filters-section">
            <mat-form-field appearance="outline">
              <mat-label>Search orders</mat-label>
              <input matInput [formControl]="searchControl" placeholder="Search by order number or customer">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [formControl]="statusFilter">
                <mat-option *ngFor="let status of statuses" [value]="status.value">
                  {{ status.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Payment Status</mat-label>
              <mat-select [formControl]="paymentStatusFilter">
                <mat-option *ngFor="let status of paymentStatuses" [value]="status.value">
                  {{ status.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          
          <!-- Orders Table -->
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort>
              <!-- Order Number Column -->
              <ng-container matColumnDef="orderNumber">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Order #</th>
                <td mat-cell *matCellDef="let order">
                  <div class="order-number">{{ order.orderNumber }}</div>
                  <div class="order-date">{{ formatDate(order.orderDate) }}</div>
                </td>
              </ng-container>
              
              <!-- Customer Column -->
              <ng-container matColumnDef="customer">
                <th mat-header-cell *matHeaderCellDef>Customer</th>
                <td mat-cell *matCellDef="let order">
                  <div class="customer-info">
                    <div class="customer-name">{{ order.customer?.fullName }}</div>
                    <div class="customer-email">{{ order.customer?.email }}</div>
                  </div>
                </td>
              </ng-container>
              
              <!-- Items Column -->
              <ng-container matColumnDef="items">
                <th mat-header-cell *matHeaderCellDef>Items</th>
                <td mat-cell *matCellDef="let order">
                  <div class="items-info">
                    <span class="items-count">{{ order.items?.length || 0 }} item(s)</span>
                  </div>
                </td>
              </ng-container>
              
              <!-- Amount Column -->
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Amount</th>
                <td mat-cell *matCellDef="let order">
                  <div class="amount-cell">
                    <span class="total-amount">₹{{ order.totalAmount }}</span>
                    <div class="payment-method">{{ order.paymentMethod | titlecase }}</div>
                  </div>
                </td>
              </ng-container>
              
              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let order">
                  <div class="status-cell">
                    <span class="status-chip" [style.background-color]="getStatusColor(order.status)">
                      {{ order.status | titlecase }}
                    </span>
                    <span class="payment-status" [style.color]="getPaymentStatusColor(order.paymentStatus)">
                      {{ order.paymentStatus | titlecase }}
                    </span>
                  </div>
                </td>
              </ng-container>
              
              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let order">
                  <div class="actions-cell">
                    <button mat-icon-button matTooltip="View order details" (click)="viewOrder(order)">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button mat-icon-button matTooltip="Update status" (click)="updateOrderStatus(order)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button matTooltip="Print invoice" (click)="printInvoice(order)">
                      <mat-icon>print</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>
              
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
            
            <!-- No Data Message -->
            <div *ngIf="dataSource.data.length === 0" class="no-data">
              <mat-icon>shopping_cart</mat-icon>
              <h3>No orders found</h3>
              <p>Try adjusting your search criteria.</p>
            </div>
          </div>
          
          <!-- Paginator -->
          <mat-paginator 
            [length]="totalOrders"
            [pageSize]="10"
            [pageSizeOptions]="[5, 10, 25, 50]"
            (page)="onPageChange()"
            showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./order-management.component.scss']
})
export class OrderManagementComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();
  
  displayedColumns: string[] = ['orderNumber', 'customer', 'items', 'amount', 'status', 'actions'];
  dataSource = new MatTableDataSource<Order>([]);
  isLoading = false;
  totalOrders = 0;
  
  // Filters
  searchControl = new FormControl('');
  statusFilter = new FormControl('');
  paymentStatusFilter = new FormControl('');
  dateFromFilter = new FormControl('');
  dateToFilter = new FormControl('');
  
  statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];
  
  paymentStatuses = [
    { value: '', label: 'All Payment Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
  ];

  constructor(
    private orderService: OrderService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.setupFilters();
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupFilters(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadOrders();
    });

    [this.statusFilter, this.paymentStatusFilter].forEach(control => {
      control.valueChanges.pipe(
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.loadOrders();
      });
    });
  }

  loadOrders(): void {
    this.isLoading = true;

    const filters = {
      search: this.searchControl.value || '',
      status: this.statusFilter.value || '',
      paymentStatus: this.paymentStatusFilter.value || '',
      dateFrom: this.dateFromFilter.value || '',
      dateTo: this.dateToFilter.value || '',
      page: this.paginator?.pageIndex ? this.paginator.pageIndex + 1 : 1,
      limit: this.paginator?.pageSize || 10
    };

    this.orderService.getOrders(filters).subscribe({
      next: (response) => {
        if (response.success) {
          this.dataSource.data = response.data.orders;
          this.totalOrders = response.data.pagination.totalOrders;
        } else {
          this.dataSource.data = [];
          this.totalOrders = 0;
          this.snackBar.open('Failed to load orders', 'Close', { duration: 3000 });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.dataSource.data = [];
        this.totalOrders = 0;
        this.isLoading = false;
        this.snackBar.open('Error loading orders', 'Close', { duration: 3000 });
      }
    });
  }

  onPageChange(): void {
    this.loadOrders();
  }

  viewOrder(order: Order): void {
    this.orderService.getOrderById(order._id!).subscribe({
      next: (response) => {
        if (response.success) {
          // Open order details dialog or navigate to details page
          console.log('Order details:', response.data);
          this.snackBar.open('Order details loaded', 'Close', { duration: 3000 });
        } else {
          this.snackBar.open('Failed to load order details', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error loading order details:', error);
        this.snackBar.open('Error loading order details', 'Close', { duration: 3000 });
      }
    });
  }

  updateOrderStatus(order: Order): void {
    // For now, cycle through statuses - in real implementation, show a dialog
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statuses.indexOf(order.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    this.orderService.updateOrderStatus(order._id!, nextStatus).subscribe({
      next: (response) => {
        if (response.success) {
          order.status = nextStatus as any;
          this.snackBar.open(response.message, 'Close', { duration: 3000 });
        } else {
          this.snackBar.open('Failed to update order status', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        this.snackBar.open('Error updating order status', 'Close', { duration: 3000 });
      }
    });
  }

  printInvoice(order: Order): void {
    // TODO: Implement invoice generation
    this.snackBar.open('Invoice printing - Coming soon', 'Close', { duration: 3000 });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
}
