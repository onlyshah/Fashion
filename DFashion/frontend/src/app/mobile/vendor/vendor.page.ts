import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { VendorService, VendorStats } from '../../core/services/vendor.service';

@Component({
  selector: 'app-vendor',
  templateUrl: './vendor.page.html',
  styleUrls: ['./vendor.page.scss'],
})
export class VendorPage implements OnInit {
  currentUser: any = null;
  stats: VendorStats = {
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    recentOrdersCount: 0
  };
  loading = false;

  quickActions = [
    {
      title: 'Add Product',
      subtitle: 'Create new product listing',
      icon: 'add-circle',
      color: 'primary',
      route: '/vendor/products/create'
    },
    {
      title: 'Create Post',
      subtitle: 'Share product post',
      icon: 'camera',
      color: 'secondary',
      route: '/vendor/posts/create'
    },
    {
      title: 'Add Story',
      subtitle: 'Create product story',
      icon: 'videocam',
      color: 'tertiary',
      route: '/vendor/stories/create'
    },
    {
      title: 'View Orders',
      subtitle: 'Manage your orders',
      icon: 'receipt',
      color: 'success',
      route: '/vendor/orders'
    }
  ];

  menuItems = [
    {
      title: 'My Products',
      icon: 'cube',
      route: '/vendor/products',
      count: this.stats.totalProducts
    },
    {
      title: 'My Posts',
      icon: 'images',
      route: '/vendor/posts',
      count: this.stats.totalPosts
    },
    {
      title: 'My Stories',
      icon: 'play-circle',
      route: '/vendor/stories',
      count: this.stats.totalStories
    },
    {
      title: 'Orders',
      icon: 'bag',
      route: '/vendor/orders',
      count: this.stats.totalOrders
    },
    {
      title: 'Analytics',
      icon: 'analytics',
      route: '/vendor/analytics',
      count: 0
    }
  ];

  recentActivity: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private vendorService: VendorService
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadStats();
  }

  loadUserData() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  loadStats() {
    this.loading = true;

    this.vendorService.getDashboardStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats = response.data.stats;
          this.vendorService.updateStats(this.stats);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Stats loading error:', error);
        this.loading = false;
      }
    });
  }

  formatCurrency(amount: number): string {
    return this.vendorService.formatCurrency(amount);
  }

  onQuickAction(action: any) {
    this.router.navigate([action.route]);
  }

  onMenuItem(item: any) {
    this.router.navigate([item.route]);
  }

  doRefresh(event: any) {
    this.loadStats();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}
