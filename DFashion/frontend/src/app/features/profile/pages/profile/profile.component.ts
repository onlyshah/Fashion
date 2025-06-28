import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { OptimizedImageComponent } from '../../../../shared/components/optimized-image/optimized-image.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, OptimizedImageComponent],
  templateUrl: './profile.component.html',
  styles: [`
    .profile-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      color: white;
    }

    .profile-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 3px solid white;
      overflow: hidden;
      flex-shrink: 0;
    }

    .avatar-img {
      border-radius: 50%;
    }

    .profile-info h2 {
      margin: 0;
      font-size: 1.5rem;
    }

    .profile-role {
      background: rgba(255, 255, 255, 0.2);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.9rem;
      margin-top: 8px;
      display: inline-block;
    }

    .profile-sections {
      display: grid;
      gap: 20px;
    }

    .profile-section {
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

    .role-features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .feature-card {
      padding: 15px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .feature-card:hover {
      border-color: #667eea;
      transform: translateY(-2px);
    }

    .feature-icon {
      font-size: 2rem;
      margin-bottom: 10px;
      color: #667eea;
    }

    .settings-list {
      list-style: none;
      padding: 0;
    }

    .settings-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .settings-item:last-child {
      border-bottom: none;
    }

    .btn-primary {
      background: #667eea;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
    }

    .btn-secondary {
      background: #f8f9fa;
      color: #333;
      border: 1px solid #ddd;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .action-buttons button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .loading-container {
      text-align: center;
      padding: 40px;
    }

    .no-user-state {
      text-align: center;
      padding: 40px;
    }

    .large-icon {
      font-size: 4rem;
      color: #ccc;
      margin-bottom: 20px;
    }

    .text-success {
      color: #28a745;
    }

    .text-danger {
      color: #dc3545;
    }

    .text-warning {
      color: #ffc107;
    }

    @media (max-width: 768px) {
      .profile-header {
        flex-direction: column;
        text-align: center;
      }

      .role-features {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  isLoading = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.currentUser = this.authService.currentUserValue;
    this.isLoading = false;
  }

  // Role-based feature access
  canAccessVendorDashboard(): boolean {
    return this.authService.isVendor() || this.authService.isAdmin();
  }

  canAccessAdminPanel(): boolean {
    return this.authService.isAdmin();
  }

  canManageProducts(): boolean {
    return this.authService.isVendor() || this.authService.isAdmin();
  }

  canViewAnalytics(): boolean {
    return this.authService.isVendor() || this.authService.isAdmin();
  }

  // Navigation methods
  navigateToVendorDashboard() {
    if (this.canAccessVendorDashboard()) {
      this.router.navigate(['/vendor/dashboard']);
    }
  }

  navigateToAdminPanel() {
    if (this.canAccessAdminPanel()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  navigateToOrders() {
    this.router.navigate(['/account/orders']);
  }

  navigateToWishlist() {
    this.router.navigate(['/wishlist']);
  }

  navigateToCart() {
    this.router.navigate(['/cart']);
  }

  navigateToSettings() {
    this.router.navigate(['/account/settings']);
  }

  editProfile() {
    this.router.navigate(['/account/edit-profile']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
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

  getRoleFeatures(): any[] {
    const baseFeatures = [
      { icon: 'person-outline', title: 'Edit Profile', action: () => this.editProfile() },
      { icon: 'bag-outline', title: 'My Orders', action: () => this.navigateToOrders() },
      { icon: 'heart-outline', title: 'Wishlist', action: () => this.navigateToWishlist() },
      { icon: 'cart-outline', title: 'Shopping Cart', action: () => this.navigateToCart() },
      { icon: 'settings-outline', title: 'Settings', action: () => this.navigateToSettings() }
    ];

    if (this.canAccessVendorDashboard()) {
      baseFeatures.push(
        { icon: 'storefront-outline', title: 'Vendor Dashboard', action: () => this.navigateToVendorDashboard() },
        { icon: 'cube-outline', title: 'Manage Products', action: () => this.router.navigate(['/vendor/products']) },
        { icon: 'analytics-outline', title: 'Sales Analytics', action: () => this.router.navigate(['/vendor/analytics']) }
      );
    }

    if (this.canAccessAdminPanel()) {
      baseFeatures.push(
        { icon: 'shield-outline', title: 'Admin Panel', action: () => this.navigateToAdminPanel() },
        { icon: 'people-outline', title: 'User Management', action: () => this.router.navigate(['/admin/users']) },
        { icon: 'bar-chart-outline', title: 'System Analytics', action: () => this.router.navigate(['/admin/analytics']) }
      );
    }

    return baseFeatures;
  }
}
