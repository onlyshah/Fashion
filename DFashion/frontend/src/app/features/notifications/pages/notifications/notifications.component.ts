import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { RealtimeNotificationService, RealtimeNotification, NotificationPreferences } from '../../../../core/services/realtime-notification.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatDividerModule,
    FormsModule
  ],
  templateUrl: './notifications.component.html',
  styles: [`
    .notifications-page {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .notifications-card {
      min-height: 600px;
    }

    .tab-content {
      padding: 24px 0;
    }

    .filter-chips {
      margin-bottom: 24px;
    }

    .filter-chips mat-chip-listbox {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      gap: 16px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      text-align: center;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: white;
    }

    .notification-item:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transform: translateY(-1px);
    }

    .notification-item.unread {
      border-left: 4px solid #2196f3;
      background: #f8f9ff;
    }

    .notification-item.urgent {
      border-left-color: #f44336;
    }

    .notification-item.high {
      border-left-color: #ff9800;
    }

    .notification-icon {
      margin-right: 16px;
      margin-top: 4px;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .notification-header h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .notification-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .time {
      font-size: 12px;
      color: #666;
    }

    .category-chip {
      font-size: 10px;
      height: 20px;
      line-height: 20px;
    }

    .priority-chip {
      font-size: 10px;
      height: 20px;
      line-height: 20px;
    }

    .priority-chip.urgent {
      background: #ffebee;
      color: #f44336;
    }

    .priority-chip.high {
      background: #fff3e0;
      color: #ff9800;
    }

    .notification-message {
      margin: 0 0 8px 0;
      color: #666;
      line-height: 1.5;
    }

    .notification-sender {
      font-size: 12px;
      color: #999;
    }

    .notification-actions {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-left: 16px;
    }

    .settings-menu {
      padding: 16px;
      min-width: 250px;
    }

    .settings-menu h4, .settings-menu h5 {
      margin: 0 0 16px 0;
    }

    .preference-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .Object {
      /* Utility class for template */
    }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: RealtimeNotification[] = [];
  unreadCount = 0;
  loading = false;
  selectedCategory = '';
  currentPage = 1;
  pageSize = 20;
  totalNotifications = 0;

  preferences: NotificationPreferences = {
    email: true,
    push: true,
    inApp: true,
    sms: false,
    categories: {
      order: true,
      payment: true,
      social: true,
      marketing: false,
      system: true,
      security: true
    }
  };

  categories = [
    { value: '', label: 'All', icon: 'notifications' },
    { value: 'order', label: 'Orders', icon: 'shopping_cart' },
    { value: 'payment', label: 'Payments', icon: 'payment' },
    { value: 'social', label: 'Social', icon: 'people' },
    { value: 'system', label: 'System', icon: 'settings' },
    { value: 'security', label: 'Security', icon: 'security' }
  ];

  private subscriptions: Subscription[] = [];
  Object = Object; // Make Object available in template

  constructor(
    private realtimeNotificationService: RealtimeNotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subscribeToNotifications();
    this.loadNotifications();
    this.loadPreferences();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private subscribeToNotifications() {
    this.subscriptions.push(
      this.realtimeNotificationService.notifications$.subscribe(notifications => {
        this.notifications = notifications;
        this.loading = false;
      })
    );

    this.subscriptions.push(
      this.realtimeNotificationService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
      })
    );
  }

  private loadNotifications() {
    this.loading = true;
    this.realtimeNotificationService.getNotifications({
      page: this.currentPage,
      limit: this.pageSize,
      category: this.selectedCategory || undefined
    });
  }

  private loadPreferences() {
    // Load user preferences from service
    // This would typically come from an API call
  }

  onTabChange(event: any) {
    const tabIndex = event.index;
    switch (tabIndex) {
      case 1: // Unread
        this.loadNotifications();
        break;
      case 2: // Orders
        this.filterByCategory('order');
        break;
      case 3: // Social
        this.filterByCategory('social');
        break;
      default:
        this.filterByCategory('');
        break;
    }
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.loadNotifications();
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadNotifications();
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
    if (!notification.isRead) {
      this.markAsRead(notification._id);
    }
    // Navigate to related content
    this.navigateToRelatedContent(notification);
  }

  private navigateToRelatedContent(notification: RealtimeNotification) {
    // Same navigation logic as in the realtime component
    const { type, data } = notification;

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
      // Add other navigation cases...
    }
  }

  updatePreferences() {
    // Update preferences via API
    console.log('Updating preferences:', this.preferences);
  }

  archiveNotification() {
    // Archive selected notification
  }

  deleteNotification() {
    // Delete selected notification
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
