import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { HeaderComponent } from './shared/components/header/header.component';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { MobileLayoutComponent } from './shared/components/mobile-layout/mobile-layout.component';
import { AuthService } from './core/services/auth.service';
import { DataFlowService } from './core/services/data-flow.service';
import { MobileOptimizationService } from './core/services/mobile-optimization.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, NotificationComponent, MobileLayoutComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'DFashion';
  showHeader = true;
  isMobile = false;
  appState: any = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private dataFlowService: DataFlowService,
    private mobileService: MobileOptimizationService
  ) {}

  ngOnInit() {
    // Initialize data flow service
    this.initializeDataFlow();

    // Subscribe to device info for mobile detection
    this.subscriptions.push(
      this.mobileService.getDeviceInfo$().subscribe(deviceInfo => {
        this.isMobile = deviceInfo.isMobile;
      })
    );

    // Subscribe to app state
    this.subscriptions.push(
      this.dataFlowService.getAppState$().subscribe(state => {
        this.appState = state;
      })
    );

    // Hide header on auth pages and admin login
    this.subscriptions.push(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event) => {
          const navigationEnd = event as NavigationEnd;
          const url = navigationEnd.url;

          // Hide header on auth pages, admin login, stories, and post details for full-screen experience
          const shouldHideHeader = url.includes('/auth') ||
                                  url.includes('/admin/login') ||
                                  url.includes('/admin/auth') ||
                                  url.startsWith('/admin/login') ||
                                  url.startsWith('/stories') ||
                                  url.startsWith('/post/');

          this.showHeader = !shouldHideHeader;
        })
    );

    // Set initial header visibility
    const currentUrl = this.router.url;
    const shouldHideHeader = currentUrl.includes('/auth') ||
                            currentUrl.includes('/admin/login') ||
                            currentUrl.includes('/admin/auth') ||
                            currentUrl.startsWith('/admin/login') ||
                            currentUrl.startsWith('/stories') ||
                            currentUrl.startsWith('/post/');

    this.showHeader = !shouldHideHeader;

    // Initialize auth state
    this.authService.initializeAuth();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.dataFlowService.destroy();
  }

  private initializeDataFlow() {
    // Load initial data
    this.dataFlowService.loadAnalytics().subscribe({
      next: () => console.log('Analytics loaded'),
      error: (error) => console.error('Failed to load analytics:', error)
    });

    // Load recommendations for anonymous users
    this.dataFlowService.loadRecommendations().subscribe({
      next: () => console.log('Recommendations loaded'),
      error: (error) => console.error('Failed to load recommendations:', error)
    });
  }
}
