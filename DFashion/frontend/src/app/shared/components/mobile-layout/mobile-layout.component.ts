import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { MobileOptimizationService, DeviceInfo, ViewportBreakpoints } from '../../../core/services/mobile-optimization.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';

@Component({
  selector: 'app-mobile-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mobile-layout.component.html',
  styleUrls: ['./mobile-layout.component.scss']
})
export class MobileLayoutComponent implements OnInit, OnDestroy {
  @Input() showHeader = true;
  @Input() showFooter = true;
  @Input() showBottomNav = true;
  @Output() menuToggle = new EventEmitter<boolean>();

  deviceInfo: DeviceInfo | null = null;
  breakpoints: ViewportBreakpoints | null = null;
  isKeyboardOpen = false;
  currentUser: any = null;
  
  cartCount = 0;
  wishlistCount = 0;
  
  isMenuOpen = false;
  isSearchOpen = false;
  searchQuery = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private mobileService: MobileOptimizationService,
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit() {
    // Subscribe to device info
    this.subscriptions.push(
      this.mobileService.getDeviceInfo$().subscribe(info => {
        this.deviceInfo = info;
        this.updateLayoutForDevice();
      })
    );

    // Subscribe to viewport breakpoints
    this.subscriptions.push(
      this.mobileService.getViewportBreakpoints$().subscribe(breakpoints => {
        this.breakpoints = breakpoints;
        this.updateLayoutForBreakpoint();
      })
    );

    // Subscribe to keyboard state
    this.subscriptions.push(
      this.mobileService.getIsKeyboardOpen$().subscribe(isOpen => {
        this.isKeyboardOpen = isOpen;
        this.handleKeyboardState(isOpen);
      })
    );

    // Subscribe to auth state
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.loadUserCounts();
        } else {
          this.cartCount = 0;
          this.wishlistCount = 0;
        }
      })
    );

    // Load initial counts
    this.loadUserCounts();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private updateLayoutForDevice() {
    if (!this.deviceInfo) return;

    // Apply device-specific optimizations
    if (this.deviceInfo.isMobile) {
      this.enableMobileOptimizations();
    } else {
      this.disableMobileOptimizations();
    }

    // Handle orientation changes
    if (this.deviceInfo.orientation === 'landscape' && this.deviceInfo.isMobile) {
      this.handleLandscapeMode();
    } else {
      this.handlePortraitMode();
    }
  }

  private updateLayoutForBreakpoint() {
    if (!this.breakpoints) return;

    // Adjust layout based on breakpoints
    if (this.breakpoints.xs || this.breakpoints.sm) {
      this.showBottomNav = true;
      this.enableCompactMode();
    } else {
      this.showBottomNav = false;
      this.disableCompactMode();
    }
  }

  private handleKeyboardState(isOpen: boolean) {
    if (isOpen) {
      // Hide bottom navigation when keyboard is open
      document.body.classList.add('keyboard-open');
    } else {
      document.body.classList.remove('keyboard-open');
    }
  }

  private enableMobileOptimizations() {
    // Enable touch-friendly interactions
    document.body.classList.add('mobile-device');
    
    // Disable hover effects on mobile
    if (!this.mobileService.supportsHover()) {
      document.body.classList.add('no-hover');
    }

    // Enable GPU acceleration for smooth scrolling
    const scrollElements = document.querySelectorAll('.scroll-container');
    scrollElements.forEach(element => {
      this.mobileService.enableGPUAcceleration(element as HTMLElement);
    });
  }

  private disableMobileOptimizations() {
    document.body.classList.remove('mobile-device', 'no-hover');
  }

  private handleLandscapeMode() {
    document.body.classList.add('landscape-mode');
  }

  private handlePortraitMode() {
    document.body.classList.remove('landscape-mode');
  }

  private enableCompactMode() {
    document.body.classList.add('compact-mode');
  }

  private disableCompactMode() {
    document.body.classList.remove('compact-mode');
  }

  private loadUserCounts() {
    if (!this.currentUser) return;

    // Set default counts for now
    this.cartCount = 0;
    this.wishlistCount = 0;
  }

  // Menu Methods
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.menuToggle.emit(this.isMenuOpen);
    
    if (this.isMenuOpen) {
      this.mobileService.disableBodyScroll();
    } else {
      this.mobileService.enableBodyScroll();
    }
  }

  closeMenu() {
    this.isMenuOpen = false;
    this.menuToggle.emit(false);
    this.mobileService.enableBodyScroll();
  }

  // Search Methods
  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    
    if (this.isSearchOpen) {
      setTimeout(() => {
        const searchInput = document.querySelector('.mobile-search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  }

  onSearchSubmit() {
    if (this.searchQuery.trim()) {
      // Navigate to search results
      console.log('Searching for:', this.searchQuery);
      this.isSearchOpen = false;
      this.searchQuery = '';
    }
  }

  // Navigation Methods
  navigateToProfile() {
    this.closeMenu();
    // Navigation logic
  }

  navigateToOrders() {
    this.closeMenu();
    // Navigation logic
  }

  navigateToSettings() {
    this.closeMenu();
    // Navigation logic
  }

  logout() {
    // Simple logout without subscription
    this.closeMenu();
  }

  // Utility Methods
  getTotalCount(): number {
    return this.cartCount + this.wishlistCount;
  }

  formatCount(count: number): string {
    if (count > 99) return '99+';
    return count.toString();
  }

  isCurrentRoute(route: string): boolean {
    return window.location.pathname === route;
  }

  // Touch Event Handlers
  onTouchStart(event: TouchEvent) {
    // Handle touch start for custom gestures
  }

  onTouchMove(event: TouchEvent) {
    // Handle touch move for custom gestures
  }

  onTouchEnd(event: TouchEvent) {
    // Handle touch end for custom gestures
  }

  // Performance Optimization
  trackByIndex(index: number): number {
    return index;
  }
}
