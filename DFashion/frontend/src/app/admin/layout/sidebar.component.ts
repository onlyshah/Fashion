import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AdminAuthService } from '../services/admin-auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  children?: MenuItem[];
  permission?: string;
  badge?: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Output() sidenavToggle = new EventEmitter<void>();

  currentUser: any = null;
  expandedItems: Set<string> = new Set();
  currentRoute: string = '';

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/admin/dashboard'
    },
    {
      label: 'Users',
      icon: 'people',
      route: '/admin/users',
      children: [
        { label: 'All Users', icon: 'list', route: '/admin/users' },
        { label: 'Add User', icon: 'person_add', route: '/admin/users/new' },
        { label: 'Roles & Permissions', icon: 'security', route: '/admin/users/roles' }
      ]
    },
    {
      label: 'Products',
      icon: 'inventory_2',
      route: '/admin/products',
      children: [
        { label: 'All Products', icon: 'list', route: '/admin/products' },
        { label: 'Add Product', icon: 'add_box', route: '/admin/products/new' },
        { label: 'Categories', icon: 'category', route: '/admin/products/categories' },
        { label: 'Inventory', icon: 'warehouse', route: '/admin/products/inventory' }
      ]
    },
    {
      label: 'Orders',
      icon: 'shopping_cart',
      route: '/admin/orders',
      badge: '12'
    },
    {
      label: 'Analytics',
      icon: 'analytics',
      route: '/admin/analytics'
    },
    {
      label: 'Marketing',
      icon: 'campaign',
      route: '/admin/marketing',
      children: [
        { label: 'Campaigns', icon: 'email', route: '/admin/marketing/campaigns' },
        { label: 'Coupons', icon: 'local_offer', route: '/admin/marketing/coupons' },
        { label: 'Reviews', icon: 'rate_review', route: '/admin/marketing/reviews' }
      ]
    },
    {
      label: 'Settings',
      icon: 'settings',
      route: '/admin/settings'
    }
  ];

  constructor(
    private router: Router,
    private adminAuthService: AdminAuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.adminAuthService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Track current route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
        this.autoExpandForCurrentRoute();
      }
    });

    // Set initial route
    this.currentRoute = this.router.url;
    this.autoExpandForCurrentRoute();
  }

  toggleExpanded(itemLabel: string): void {
    if (this.expandedItems.has(itemLabel)) {
      this.expandedItems.delete(itemLabel);
    } else {
      this.expandedItems.add(itemLabel);
    }
  }

  isExpanded(itemLabel: string): boolean {
    return this.expandedItems.has(itemLabel);
  }

  private autoExpandForCurrentRoute(): void {
    // Auto-expand menu items based on current route
    for (const item of this.menuItems) {
      if (item.children) {
        const hasActiveChild = item.children.some(child => 
          this.currentRoute.startsWith(child.route)
        );
        if (hasActiveChild) {
          this.expandedItems.add(item.label);
        }
      }
    }
  }

  logout(): void {
    this.adminAuthService.logout();
  }
}
