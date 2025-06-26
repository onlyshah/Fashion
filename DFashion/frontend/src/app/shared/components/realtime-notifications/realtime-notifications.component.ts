import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RealtimeNotificationService, RealtimeNotification } from '../../../core/services/realtime-notification.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-realtime-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './realtime-notifications.component.html',
  styleUrls: ['./realtime-notifications.component.scss']
})
export class RealtimeNotificationsComponent implements OnInit, OnDestroy {
  notifications: RealtimeNotification[] = [];
  unreadCount = 0;
  isConnected = false;
  loading = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private realtimeNotificationService: RealtimeNotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subscribeToNotifications();
    this.loadInitialData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private subscribeToNotifications() {
    // Subscribe to notifications
    this.subscriptions.push(
      this.realtimeNotificationService.notifications$.subscribe(notifications => {
        this.notifications = notifications.slice(0, 10); // Show only latest 10 in dropdown
        this.loading = false;
      })
    );

    // Subscribe to unread count
    this.subscriptions.push(
      this.realtimeNotificationService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
      })
    );

    // Subscribe to connection status
    this.subscriptions.push(
      this.realtimeNotificationService.connectionStatus$.subscribe(status => {
        this.isConnected = status;
      })
    );
  }

  private loadInitialData() {
    this.loading = true;
    this.realtimeNotificationService.getNotifications({ page: 1, limit: 10 });
  }

  markAsRead(notificationId: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.realtimeNotificationService.markAsRead(notificationId);
  }

  markAllAsRead() {
    this.realtimeNotificationService.markAllAsRead();
  }

  handleNotificationClick(notification: RealtimeNotification) {
    // Mark as read if not already read
    if (!notification.isRead) {
      this.markAsRead(notification._id);
    }

    // Navigate based on notification type
    this.navigateToRelatedContent(notification);
  }

  private navigateToRelatedContent(notification: RealtimeNotification) {
    const { type, relatedEntity, data } = notification;

    switch (type) {
      case 'order_placed':
      case 'order_confirmed':
      case 'order_shipped':
      case 'order_delivered':
      case 'order_cancelled':
        if (data?.orderId) {
          this.router.navigate(['/orders', data.orderId]);
        }
        break;

      case 'payment_success':
      case 'payment_failed':
        if (data?.orderId) {
          this.router.navigate(['/orders', data.orderId]);
        }
        break;

      case 'product_liked':
      case 'product_commented':
        if (data?.productId) {
          this.router.navigate(['/products', data.productId]);
        }
        break;

      case 'user_followed':
        if (data?.userId) {
          this.router.navigate(['/profile', data.userId]);
        }
        break;

      case 'post_liked':
      case 'post_commented':
        if (data?.postId) {
          this.router.navigate(['/posts', data.postId]);
        }
        break;

      default:
        // For other notifications, go to notifications page
        this.router.navigate(['/notifications']);
        break;
    }
  }

  viewAllNotifications() {
    this.router.navigate(['/notifications']);
  }

  getNotificationIcon(type: string): string {
    return this.realtimeNotificationService.getNotificationIcon(type);
  }

  getNotificationColor(priority: string): string {
    return this.realtimeNotificationService.getNotificationColor(priority);
  }

  trackByNotificationId(index: number, notification: RealtimeNotification): string {
    return notification._id;
  }
}
