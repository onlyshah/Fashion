import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AdminAuthService } from '../services/admin-auth.service';

@Component({
  selector: 'app-header',
  template: `
    <mat-toolbar class="admin-header">
      <!-- Mobile Menu Toggle -->
      <button 
        mat-icon-button 
        class="menu-toggle"
        (click)="toggleSidenav()"
        [class.mobile-only]="true">
        <mat-icon>menu</mat-icon>
      </button>

      <!-- Page Title -->
      <div class="page-title">
        <h1>{{ pageTitle }}</h1>
      </div>

      <!-- Header Actions -->
      <div class="header-actions">
        <!-- Search -->
        <div class="search-container">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search...</mat-label>
            <input matInput [(ngModel)]="searchQuery" (keyup.enter)="onSearch()">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </div>

        <!-- Notifications -->
        <button 
          mat-icon-button 
          [matMenuTriggerFor]="notificationMenu"
          class="notification-button">
          <mat-icon [matBadge]="notificationCount" matBadgeColor="warn">notifications</mat-icon>
        </button>

        <mat-menu #notificationMenu="matMenu" class="notification-menu">
          <div class="notification-header">
            <h3>Notifications</h3>
            <button mat-button color="primary" (click)="markAllAsRead()">Mark all as read</button>
          </div>
          <mat-divider></mat-divider>
          
          <div class="notification-list">
            <button 
              *ngFor="let notification of notifications" 
              mat-menu-item 
              class="notification-item"
              [class.unread]="!notification.read"
              (click)="onNotificationClick(notification)">
              <div class="notification-content">
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-message">{{ notification.message }}</div>
                <div class="notification-time">{{ formatNotificationTime(notification.time) }}</div>
              </div>
            </button>
          </div>

          <mat-divider></mat-divider>
          <button mat-menu-item routerLink="/admin/notifications" class="view-all-button">
            <mat-icon>list</mat-icon>
            View All Notifications
          </button>
        </mat-menu>

        <!-- Quick Actions -->
        <button 
          mat-icon-button 
          [matMenuTriggerFor]="quickActionsMenu"
          matTooltip="Quick Actions">
          <mat-icon>add</mat-icon>
        </button>

        <mat-menu #quickActionsMenu="matMenu">
          <button mat-menu-item routerLink="/admin/products/new">
            <mat-icon>add_box</mat-icon>
            <span>Add Product</span>
          </button>
          <button mat-menu-item routerLink="/admin/users/new">
            <mat-icon>person_add</mat-icon>
            <span>Add User</span>
          </button>
          <button mat-menu-item routerLink="/admin/orders">
            <mat-icon>shopping_cart</mat-icon>
            <span>View Orders</span>
          </button>
          <button mat-menu-item routerLink="/admin/analytics">
            <mat-icon>analytics</mat-icon>
            <span>View Analytics</span>
          </button>
        </mat-menu>

        <!-- User Profile -->
        <button 
          mat-icon-button 
          [matMenuTriggerFor]="userMenu"
          class="user-profile-button">
          <mat-icon>account_circle</mat-icon>
        </button>

        <mat-menu #userMenu="matMenu">
          <div class="user-menu-header" *ngIf="currentUser">
            <div class="user-info">
              <div class="user-name">{{ currentUser.fullName }}</div>
              <div class="user-email">{{ currentUser.email }}</div>
            </div>
          </div>
          <mat-divider></mat-divider>
          
          <button mat-menu-item routerLink="/admin/profile">
            <mat-icon>person</mat-icon>
            <span>My Profile</span>
          </button>
          <button mat-menu-item routerLink="/admin/settings">
            <mat-icon>settings</mat-icon>
            <span>Settings</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </div>
    </mat-toolbar>
  `,
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() sidenavToggle = new EventEmitter<void>();

  currentUser: any = null;
  pageTitle: string = 'Dashboard';
  searchQuery: string = '';
  notificationCount: number = 3;

  notifications: any[] = [];

  constructor(
    private adminAuthService: AdminAuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.adminAuthService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Update notification count
    this.updateNotificationCount();
  }

  toggleSidenav(): void {
    this.sidenavToggle.emit();
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
      // Implement search functionality
    }
  }

  onNotificationClick(notification: any): void {
    // Mark as read
    notification.read = true;
    this.updateNotificationCount();
    
    // Handle notification click (navigate to relevant page)
    console.log('Notification clicked:', notification);
  }

  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.updateNotificationCount();
  }

  private updateNotificationCount(): void {
    this.notificationCount = this.notifications.filter(n => !n.read).length;
  }

  logout(): void {
    this.adminAuthService.logout();
  }

  formatNotificationTime(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }
}
