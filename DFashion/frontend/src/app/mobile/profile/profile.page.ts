import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  user: any = null;
  isAuthenticated = false;
  isLoading = true;

  menuItems = [
    {
      title: 'My Orders',
      icon: 'bag-handle',
      route: '/orders',
      color: 'primary'
    },
    {
      title: 'My Wishlist',
      icon: 'heart',
      route: '/tabs/wishlist',
      color: 'danger'
    },
    {
      title: 'My Cart',
      icon: 'bag',
      route: '/tabs/cart',
      color: 'success'
    },
    {
      title: 'Address Book',
      icon: 'location',
      route: '/addresses',
      color: 'warning'
    },
    {
      title: 'Payment Methods',
      icon: 'card',
      route: '/payment-methods',
      color: 'secondary'
    },
    {
      title: 'Notifications',
      icon: 'notifications',
      route: '/notifications',
      color: 'tertiary'
    },
    {
      title: 'Help & Support',
      icon: 'help-circle',
      route: '/support',
      color: 'medium'
    },
    {
      title: 'Settings',
      icon: 'settings',
      route: '/settings',
      color: 'dark'
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.authService.isAuthenticated$.subscribe(
      isAuth => {
        this.isAuthenticated = isAuth;
        if (isAuth) {
          this.loadUserData();
        } else {
          this.user = null;
        }
      }
    );
  }

  async loadUserData() {
    try {
      this.isLoading = true;
      if (this.isAuthenticated) {
        const response = await this.userService.getCurrentUser().toPromise();
        this.user = response?.data;
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  onMenuItemClick(item: any) {
    if (!this.isAuthenticated && item.route !== '/auth/login') {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.router.navigate([item.route]);
  }

  onEditProfile() {
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.router.navigate(['/profile/edit']);
  }

  onLogin() {
    this.router.navigate(['/auth/login']);
  }

  onRegister() {
    this.router.navigate(['/auth/register']);
  }

  async onLogout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/tabs/home']);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  getUserAvatar(): string {
    return this.user?.avatar || '/assets/images/default-avatar.png';
  }

  getUserDisplayName(): string {
    if (!this.user) return 'Guest User';
    return this.user.fullName || this.user.username || 'User';
  }

  getUserEmail(): string {
    return this.user?.email || 'Not logged in';
  }

  getJoinDate(): string {
    if (!this.user?.createdAt) return '';
    return new Date(this.user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  }

  doRefresh(event: any) {
    this.loadUserData().then(() => {
      event.target.complete();
    });
  }
}
