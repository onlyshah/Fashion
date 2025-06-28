import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './settings.component.html',
  styles: [`
    .settings-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .settings-header {
      margin-bottom: 30px;
    }

    .settings-sections {
      display: grid;
      gap: 20px;
    }

    .settings-section {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .section-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 15px;
      color: #333;
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .setting-item:last-child {
      border-bottom: none;
    }

    .setting-info {
      flex: 1;
    }

    .setting-title {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .setting-description {
      font-size: 0.9rem;
      color: #666;
    }

    .setting-control {
      margin-left: 20px;
    }

    .btn-primary {
      background: #667eea;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .role-badge {
      background: #667eea;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
    }

    .admin-badge {
      background: #dc3545;
    }

    .vendor-badge {
      background: #28a745;
    }

    .customer-badge {
      background: #17a2b8;
    }

    .permission-list {
      list-style: none;
      padding: 0;
      margin: 10px 0;
    }

    .permission-item {
      padding: 5px 0;
      font-size: 0.9rem;
      color: #666;
    }

    .permission-item::before {
      content: "✓";
      color: #28a745;
      margin-right: 8px;
    }
  `]
})
export class SettingsComponent implements OnInit {
  currentUser: User | null = null;
  isLoading = true;

  // Settings state
  notificationsEnabled = true;
  emailNotifications = true;
  pushNotifications = true;
  marketingEmails = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserSettings();
  }

  loadUserSettings() {
    this.currentUser = this.authService.currentUserValue;
    this.loadNotificationSettings();
    this.isLoading = false;
  }

  loadNotificationSettings() {
    // Load from localStorage or API
    const settings = localStorage.getItem('userSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
      this.notificationsEnabled = parsed.notificationsEnabled ?? true;
      this.emailNotifications = parsed.emailNotifications ?? true;
      this.pushNotifications = parsed.pushNotifications ?? true;
      this.marketingEmails = parsed.marketingEmails ?? false;
    }
  }

  saveNotificationSettings() {
    const settings = {
      notificationsEnabled: this.notificationsEnabled,
      emailNotifications: this.emailNotifications,
      pushNotifications: this.pushNotifications,
      marketingEmails: this.marketingEmails
    };
    localStorage.setItem('userSettings', JSON.stringify(settings));
    this.showSuccessMessage('Notification settings saved successfully!');
  }

  // Role-based access methods
  canAccessVendorSettings(): boolean {
    return this.authService.isVendor() || this.authService.isAdmin();
  }

  canAccessAdminSettings(): boolean {
    return this.authService.isAdmin();
  }

  canManageAccount(): boolean {
    return this.authService.isAuthenticated;
  }

  // Navigation methods
  editProfile() {
    this.router.navigate(['/account/edit-profile']);
  }

  changePassword() {
    this.router.navigate(['/account/change-password']);
  }

  managePaymentMethods() {
    this.router.navigate(['/account/payment-methods']);
  }

  manageAddresses() {
    this.router.navigate(['/account/addresses']);
  }

  viewPrivacySettings() {
    this.router.navigate(['/account/privacy']);
  }

  viewSecuritySettings() {
    this.router.navigate(['/account/security']);
  }

  navigateToVendorSettings() {
    if (this.canAccessVendorSettings()) {
      this.router.navigate(['/vendor/settings']);
    }
  }

  navigateToAdminSettings() {
    if (this.canAccessAdminSettings()) {
      this.router.navigate(['/admin/settings']);
    }
  }

  // Account management
  deactivateAccount() {
    if (confirm('Are you sure you want to deactivate your account? This action can be reversed by contacting support.')) {
      // Implement account deactivation
      console.log('Account deactivation requested');
      this.showSuccessMessage('Account deactivation request submitted. You will receive an email confirmation.');
    }
  }

  deleteAccount() {
    if (confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      if (confirm('This will permanently delete all your data. Are you absolutely sure?')) {
        // Implement account deletion
        console.log('Account deletion requested');
        this.showSuccessMessage('Account deletion request submitted. You will receive an email with further instructions.');
      }
    }
  }

  getRoleDisplayName(): string {
    switch (this.currentUser?.role) {
      case 'customer':
        return 'Customer';
      case 'vendor':
        return 'Vendor';
      case 'admin':
        return 'Administrator';
      default:
        return 'User';
    }
  }

  getRoleBadgeClass(): string {
    switch (this.currentUser?.role) {
      case 'customer':
        return 'customer-badge';
      case 'vendor':
        return 'vendor-badge';
      case 'admin':
        return 'admin-badge';
      default:
        return 'role-badge';
    }
  }

  getRolePermissions(): string[] {
    switch (this.currentUser?.role) {
      case 'customer':
        return [
          'Browse and purchase products',
          'Create and manage wishlist',
          'View order history',
          'Leave product reviews',
          'Follow other users'
        ];
      case 'vendor':
        return [
          'All customer permissions',
          'Add and manage products',
          'View sales analytics',
          'Manage inventory',
          'Process orders',
          'Create promotional content'
        ];
      case 'admin':
        return [
          'All vendor permissions',
          'Manage all users',
          'Access system analytics',
          'Moderate content',
          'Configure system settings',
          'Manage vendor approvals'
        ];
      default:
        return [];
    }
  }

  private showSuccessMessage(message: string) {
    // You can replace this with a proper toast/notification service
    alert(message);
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
