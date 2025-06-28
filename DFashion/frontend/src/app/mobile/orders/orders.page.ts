import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];
  isLoading = true;
  isAuthenticated = false;
  selectedStatus = 'all';

  statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  constructor(
    private router: Router,
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(
      isAuth => {
        this.isAuthenticated = isAuth;
        if (isAuth) {
          this.loadOrders();
        } else {
          this.orders = [];
          this.filteredOrders = [];
          this.isLoading = false;
        }
      }
    );
  }

  async loadOrders() {
    try {
      this.isLoading = true;
      const response = await this.orderService.getUserOrders().toPromise();
      this.orders = response?.data || [];
      this.filterOrders();
    } catch (error) {
      console.error('Error loading orders:', error);
      this.orders = [];
      this.filteredOrders = [];
    } finally {
      this.isLoading = false;
    }
  }

  onStatusChange() {
    this.filterOrders();
  }

  filterOrders() {
    if (this.selectedStatus === 'all') {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(order => 
        order.status?.toLowerCase() === this.selectedStatus.toLowerCase()
      );
    }
  }

  onOrderClick(order: any) {
    this.router.navigate(['/order-details', order._id]);
  }

  onTrackOrder(order: any, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/track-order', order._id]);
  }

  onReorderItems(order: any, event: Event) {
    event.stopPropagation();
    // Add order items to cart
    console.log('Reordering items from order:', order._id);
  }

  onCancelOrder(order: any, event: Event) {
    event.stopPropagation();
    // Show confirmation and cancel order
    console.log('Cancelling order:', order._id);
  }

  onReturnOrder(order: any, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/return-order', order._id]);
  }

  onLogin() {
    this.router.navigate(['/auth/login']);
  }

  getOrderStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'confirmed': return 'primary';
      case 'shipped': return 'secondary';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'medium';
    }
  }

  getOrderStatusIcon(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending': return 'time';
      case 'confirmed': return 'checkmark-circle';
      case 'shipped': return 'car';
      case 'delivered': return 'checkmark-done-circle';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  }

  getOrderTotal(order: any): number {
    return order.items?.reduce((total: number, item: any) => 
      total + (item.price * item.quantity), 0) || 0;
  }

  getOrderItemCount(order: any): number {
    return order.items?.reduce((count: number, item: any) => 
      count + item.quantity, 0) || 0;
  }

  getOrderDate(order: any): string {
    return new Date(order.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getEstimatedDelivery(order: any): string {
    if (order.estimatedDelivery) {
      return new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
    return 'TBD';
  }

  canCancelOrder(order: any): boolean {
    const cancelableStatuses = ['pending', 'confirmed'];
    return cancelableStatuses.includes(order.status?.toLowerCase());
  }

  canTrackOrder(order: any): boolean {
    const trackableStatuses = ['confirmed', 'shipped'];
    return trackableStatuses.includes(order.status?.toLowerCase());
  }

  canReturnOrder(order: any): boolean {
    return order.status?.toLowerCase() === 'delivered';
  }

  doRefresh(event: any) {
    this.loadOrders().then(() => {
      event.target.complete();
    });
  }
}
