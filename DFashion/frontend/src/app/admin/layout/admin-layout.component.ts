import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { AdminAuthService, AdminUser } from '../services/admin-auth.service';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('drawer') drawer!: MatSidenav;
  
  private destroy$ = new Subject<void>();
  currentUser$: Observable<AdminUser | null>;
  currentUser: AdminUser | null = null;
  pageTitle = 'Dashboard';

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  navigationItems = [
    {
      title: 'Dashboard',
      icon: 'dashboard',
      route: '/admin/dashboard',
      permission: 'dashboard:view'
    },
    {
      title: 'User Management',
      icon: 'people',
      route: '/admin/users',
      permission: 'users:view'
    },
    {
      title: 'Product Management',
      icon: 'inventory',
      route: '/admin/products',
      permission: 'products:view'
    },
    {
      title: 'Order Management',
      icon: 'shopping_cart',
      route: '/admin/orders',
      permission: 'orders:view'
    },
    {
      title: 'Analytics',
      icon: 'analytics',
      route: '/admin/analytics',
      permission: 'analytics:view'
    },
    {
      title: 'Settings',
      icon: 'settings',
      route: '/admin/settings',
      permission: 'settings:view'
    }
  ];

  constructor(
    private breakpointObserver: BreakpointObserver,
    public authService: AdminAuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Subscribe to current user
    this.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
    });

    // Listen to route changes to update page title
    this.router.events.pipe(
      takeUntil(this.destroy$)
    ).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updatePageTitle();
      }
    });

    // Initial page title update
    this.updatePageTitle();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  hasPermission(permission: string): boolean {
    if (!permission || !this.currentUser) return true;
    
    const [module, action] = permission.split(':');
    return this.authService.hasPermission(module, action);
  }

  getVisibleNavigationItems() {
    return this.navigationItems.filter(item => this.hasPermission(item.permission));
  }

  onLogout(): void {
    this.authService.logout();
  }

  private updatePageTitle(): void {
    const url = this.router.url;
    const routeTitleMap: { [key: string]: string } = {
      '/admin/dashboard': 'Dashboard',
      '/admin/users': 'User Management',
      '/admin/products': 'Product Management',
      '/admin/orders': 'Order Management',
      '/admin/analytics': 'Analytics',
      '/admin/settings': 'Settings'
    };

    this.pageTitle = routeTitleMap[url] || 'Admin Panel';
  }

  getUserInitials(): string {
    if (!this.currentUser?.fullName) return 'AD';
    
    const names = this.currentUser.fullName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  getRoleColor(): string {
    if (!this.currentUser?.role) return '#666';

    const roleColors: { [key: string]: string } = {
      'super_admin': '#e91e63',
      'admin': '#9c27b0',
      'sales_manager': '#2196f3',
      'marketing_manager': '#ff9800',
      'account_manager': '#4caf50',
      'support_manager': '#795548'
    };

    return roleColors[this.currentUser.role] || '#666';
  }

  getRoleDisplayName(): string {
    if (!this.currentUser?.role) return '';

    const roleDisplayNames: { [key: string]: string } = {
      'super_admin': 'Super Admin',
      'admin': 'Admin',
      'sales_manager': 'Sales Manager',
      'sales_executive': 'Sales Executive',
      'marketing_manager': 'Marketing Manager',
      'marketing_executive': 'Marketing Executive',
      'account_manager': 'Account Manager',
      'accountant': 'Accountant',
      'support_manager': 'Support Manager',
      'support_agent': 'Support Agent',
      'content_manager': 'Content Manager',
      'vendor_manager': 'Vendor Manager'
    };

    return roleDisplayNames[this.currentUser.role] || this.currentUser.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }

  onMenuItemClick(): void {
    // Close drawer on mobile after navigation
    this.isHandset$.pipe(takeUntil(this.destroy$)).subscribe(isHandset => {
      if (isHandset && this.drawer) {
        this.drawer.close();
      }
    });
  }
}
