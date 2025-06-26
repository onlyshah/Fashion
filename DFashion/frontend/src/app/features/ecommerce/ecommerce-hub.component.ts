import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ecommerce-hub',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  template: `
    <div class="ecommerce-hub">
      <!-- Navigation Header -->
      <header class="hub-header">
        <div class="header-content">
          <div class="logo-section">
            <h1 class="hub-logo" (click)="goHome()">
              <i class="fas fa-shopping-bag"></i>
              DFashion Hub
            </h1>
          </div>
          
          <nav class="main-nav">
            <button class="nav-btn" 
                    (click)="navigateTo('shop')" 
                    [class.active]="currentView === 'shop'">
              <i class="fas fa-store"></i>
              <span>Shop</span>
            </button>
            
            <button class="nav-btn" 
                    (click)="navigateTo('wishlist')" 
                    [class.active]="currentView === 'wishlist'">
              <i class="fas fa-heart"></i>
              <span>Wishlist</span>
              <span class="badge" *ngIf="wishlistCount > 0">{{ wishlistCount }}</span>
            </button>
            
            <button class="nav-btn" 
                    (click)="navigateTo('cart')" 
                    [class.active]="currentView === 'cart'">
              <i class="fas fa-shopping-cart"></i>
              <span>Cart</span>
              <span class="badge" *ngIf="cartCount > 0">{{ cartCount }}</span>
            </button>
            
            <button class="nav-btn" 
                    (click)="navigateTo('social')" 
                    [class.active]="currentView === 'social'">
              <i class="fas fa-users"></i>
              <span>Social</span>
            </button>
          </nav>
          
          <div class="user-actions">
            <button class="action-btn search-btn" (click)="toggleSearch()">
              <i class="fas fa-search"></i>
            </button>
            
            <button class="action-btn notifications-btn" (click)="showNotifications()">
              <i class="fas fa-bell"></i>
              <span class="notification-badge" *ngIf="notificationCount > 0">{{ notificationCount }}</span>
            </button>
            
            <div class="user-menu" *ngIf="currentUser; else loginButton">
              <img [src]="currentUser.avatar || '/assets/images/default-avatar.png'" 
                   [alt]="currentUser.fullName" 
                   class="user-avatar"
                   (click)="toggleUserMenu()">
              
              <div class="user-dropdown" *ngIf="showUserMenu">
                <div class="dropdown-item" (click)="navigateTo('profile')">
                  <i class="fas fa-user"></i>
                  Profile
                </div>
                <div class="dropdown-item" (click)="navigateTo('orders')">
                  <i class="fas fa-box"></i>
                  Orders
                </div>
                <div class="dropdown-item" (click)="navigateTo('settings')">
                  <i class="fas fa-cog"></i>
                  Settings
                </div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-item" (click)="logout()">
                  <i class="fas fa-sign-out-alt"></i>
                  Logout
                </div>
              </div>
            </div>
            
            <ng-template #loginButton>
              <button class="btn-login" (click)="navigateTo('auth/login')">
                Login
              </button>
            </ng-template>
          </div>
        </div>
        
        <!-- Search Bar -->
        <div class="search-section" *ngIf="showSearchBar">
          <div class="search-container">
            <div class="search-bar">
              <i class="fas fa-search"></i>
              <input type="text" 
                     [(ngModel)]="searchQuery"
                     placeholder="Search products, brands, or users..."
                     (keyup.enter)="search()"
                     (input)="onSearchInput()">
              <button class="btn-clear" *ngIf="searchQuery" (click)="clearSearch()">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <!-- Search Suggestions -->
            <div class="search-suggestions" *ngIf="searchSuggestions.length > 0">
              <div class="suggestion-item" 
                   *ngFor="let suggestion of searchSuggestions"
                   (click)="selectSuggestion(suggestion)">
                <i class="fas" [class]="getSuggestionIcon(suggestion.type)"></i>
                <span>{{ suggestion.text }}</span>
                <span class="suggestion-type">{{ suggestion.type }}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Quick Stats Dashboard -->
      <section class="quick-stats" *ngIf="currentView === 'dashboard'">
        <div class="stats-container">
          <div class="stat-card" (click)="navigateTo('wishlist')">
            <div class="stat-icon wishlist">
              <i class="fas fa-heart"></i>
            </div>
            <div class="stat-info">
              <h3>{{ wishlistCount }}</h3>
              <p>Wishlist Items</p>
            </div>
          </div>
          
          <div class="stat-card" (click)="navigateTo('cart')">
            <div class="stat-icon cart">
              <i class="fas fa-shopping-cart"></i>
            </div>
            <div class="stat-info">
              <h3>{{ cartCount }}</h3>
              <p>Cart Items</p>
            </div>
          </div>
          
          <div class="stat-card" (click)="navigateTo('orders')">
            <div class="stat-icon orders">
              <i class="fas fa-box"></i>
            </div>
            <div class="stat-info">
              <h3>{{ orderCount }}</h3>
              <p>Orders</p>
            </div>
          </div>
          
          <div class="stat-card" (click)="navigateTo('social')">
            <div class="stat-icon social">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-info">
              <h3>{{ socialCount }}</h3>
              <p>Social Posts</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Feature Highlights -->
      <section class="feature-highlights" *ngIf="currentView === 'dashboard'">
        <div class="highlights-container">
          <h2>Explore Features</h2>
          
          <div class="feature-grid">
            <div class="feature-card" (click)="navigateTo('shop')">
              <div class="feature-icon">
                <i class="fas fa-store"></i>
              </div>
              <h3>Shop Products</h3>
              <p>Browse our extensive collection of fashion items</p>
              <div class="feature-action">
                <span>Explore Now</span>
                <i class="fas fa-arrow-right"></i>
              </div>
            </div>
            
            <div class="feature-card" (click)="navigateTo('wishlist')">
              <div class="feature-icon">
                <i class="fas fa-heart"></i>
              </div>
              <h3>Wishlist</h3>
              <p>Save your favorite items for later purchase</p>
              <div class="feature-action">
                <span>View Wishlist</span>
                <i class="fas fa-arrow-right"></i>
              </div>
            </div>
            
            <div class="feature-card" (click)="navigateTo('social')">
              <div class="feature-icon">
                <i class="fas fa-camera"></i>
              </div>
              <h3>Social Shopping</h3>
              <p>Discover products through stories and posts</p>
              <div class="feature-action">
                <span>Go Social</span>
                <i class="fas fa-arrow-right"></i>
              </div>
            </div>
            
            <div class="feature-card" (click)="navigateTo('share')">
              <div class="feature-icon">
                <i class="fas fa-share-alt"></i>
              </div>
              <h3>Share & Earn</h3>
              <p>Share products with friends and family</p>
              <div class="feature-action">
                <span>Start Sharing</span>
                <i class="fas fa-arrow-right"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Content Area -->
      <main class="hub-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Mobile Bottom Navigation -->
      <nav class="mobile-nav">
        <button class="mobile-nav-btn" 
                (click)="navigateTo('shop')" 
                [class.active]="currentView === 'shop'">
          <i class="fas fa-store"></i>
          <span>Shop</span>
        </button>
        
        <button class="mobile-nav-btn" 
                (click)="navigateTo('wishlist')" 
                [class.active]="currentView === 'wishlist'">
          <i class="fas fa-heart"></i>
          <span>Wishlist</span>
          <span class="mobile-badge" *ngIf="wishlistCount > 0">{{ wishlistCount }}</span>
        </button>
        
        <button class="mobile-nav-btn hub-btn" (click)="navigateTo('dashboard')">
          <i class="fas fa-th-large"></i>
          <span>Hub</span>
        </button>
        
        <button class="mobile-nav-btn" 
                (click)="navigateTo('cart')" 
                [class.active]="currentView === 'cart'">
          <i class="fas fa-shopping-cart"></i>
          <span>Cart</span>
          <span class="mobile-badge" *ngIf="cartCount > 0">{{ cartCount }}</span>
        </button>
        
        <button class="mobile-nav-btn" 
                (click)="navigateTo('social')" 
                [class.active]="currentView === 'social'">
          <i class="fas fa-users"></i>
          <span>Social</span>
        </button>
      </nav>
    </div>
  `,
  styles: [`
    .ecommerce-hub {
      min-height: 100vh;
      background: #f8f9fa;
    }

    /* Header Styles */
    .hub-header {
      background: #fff;
      border-bottom: 1px solid #eee;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      gap: 20px;
    }

    .hub-logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: #007bff;
      margin: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .main-nav {
      display: flex;
      gap: 16px;
    }

    .nav-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 8px;
      transition: all 0.2s ease;
      position: relative;
      font-size: 0.8rem;
    }

    .nav-btn:hover {
      background: #f8f9fa;
      color: #007bff;
    }

    .nav-btn.active {
      color: #007bff;
      background: #e3f2fd;
    }

    .nav-btn i {
      font-size: 1.1rem;
    }

    .badge {
      position: absolute;
      top: 4px;
      right: 4px;
      background: #ff6b6b;
      color: #fff;
      border-radius: 10px;
      padding: 2px 6px;
      font-size: 0.7rem;
      min-width: 16px;
      text-align: center;
    }

    .user-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .action-btn {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      position: relative;
      font-size: 1.1rem;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      background: #f8f9fa;
      color: #007bff;
    }

    .notification-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      background: #ff6b6b;
      color: #fff;
      border-radius: 8px;
      padding: 1px 4px;
      font-size: 0.6rem;
      min-width: 12px;
      text-align: center;
    }

    .user-menu {
      position: relative;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.2s ease;
    }

    .user-avatar:hover {
      border-color: #007bff;
    }

    .user-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      background: #fff;
      border: 1px solid #eee;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 180px;
      z-index: 1001;
      margin-top: 8px;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      cursor: pointer;
      font-size: 0.9rem;
      color: #333;
      transition: background 0.2s ease;
    }

    .dropdown-item:hover {
      background: #f8f9fa;
    }

    .dropdown-divider {
      height: 1px;
      background: #eee;
      margin: 4px 0;
    }

    .btn-login {
      background: #007bff;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .btn-login:hover {
      background: #0056b3;
    }

    /* Search Section */
    .search-section {
      background: #f8f9fa;
      border-top: 1px solid #eee;
      padding: 16px 20px;
    }

    .search-container {
      max-width: 600px;
      margin: 0 auto;
      position: relative;
    }

    .search-bar {
      position: relative;
      width: 100%;
    }

    .search-bar i {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #666;
    }

    .search-bar input {
      width: 100%;
      padding: 12px 12px 12px 40px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 0.9rem;
      background: #fff;
    }

    .search-bar input:focus {
      outline: none;
      border-color: #007bff;
    }

    .btn-clear {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      padding: 4px;
    }

    .search-suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: #fff;
      border: 1px solid #ddd;
      border-top: none;
      border-radius: 0 0 8px 8px;
      max-height: 300px;
      overflow-y: auto;
      z-index: 1000;
    }

    .suggestion-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .suggestion-item:hover {
      background: #f8f9fa;
    }

    .suggestion-type {
      margin-left: auto;
      font-size: 0.8rem;
      color: #666;
      text-transform: capitalize;
    }

    /* Quick Stats */
    .quick-stats {
      padding: 40px 20px;
      background: #fff;
      margin-bottom: 20px;
    }

    .stats-container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
      background: #f8f9fa;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: #fff;
    }

    .stat-icon.wishlist { background: #ff6b6b; }
    .stat-icon.cart { background: #4ecdc4; }
    .stat-icon.orders { background: #45b7d1; }
    .stat-icon.social { background: #96ceb4; }

    .stat-info h3 {
      margin: 0 0 4px 0;
      font-size: 2rem;
      font-weight: 700;
      color: #333;
    }

    .stat-info p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    /* Feature Highlights */
    .feature-highlights {
      padding: 40px 20px;
    }

    .highlights-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .highlights-container h2 {
      text-align: center;
      margin-bottom: 40px;
      font-size: 2rem;
      color: #333;
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .feature-card {
      background: #fff;
      border-radius: 12px;
      padding: 32px 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }

    .feature-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #007bff, #0056b3);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      font-size: 2rem;
      color: #fff;
    }

    .feature-card h3 {
      margin: 0 0 12px 0;
      font-size: 1.3rem;
      color: #333;
    }

    .feature-card p {
      margin: 0 0 20px 0;
      color: #666;
      line-height: 1.5;
    }

    .feature-action {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #007bff;
      font-weight: 500;
    }

    /* Main Content */
    .hub-content {
      min-height: calc(100vh - 200px);
      padding-bottom: 80px;
    }

    /* Mobile Navigation */
    .mobile-nav {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #fff;
      border-top: 1px solid #eee;
      padding: 8px 0;
      z-index: 1000;
    }

    .mobile-nav {
      display: flex;
      justify-content: space-around;
      align-items: center;
    }

    .mobile-nav-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: all 0.2s ease;
      position: relative;
      font-size: 0.7rem;
      min-width: 60px;
    }

    .mobile-nav-btn:hover,
    .mobile-nav-btn.active {
      color: #007bff;
    }

    .mobile-nav-btn.hub-btn {
      background: #007bff;
      color: #fff;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      margin-top: -10px;
    }

    .mobile-nav-btn.hub-btn:hover {
      background: #0056b3;
      color: #fff;
    }

    .mobile-nav-btn i {
      font-size: 1.2rem;
    }

    .mobile-badge {
      position: absolute;
      top: 2px;
      right: 8px;
      background: #ff6b6b;
      color: #fff;
      border-radius: 8px;
      padding: 1px 4px;
      font-size: 0.6rem;
      min-width: 14px;
      text-align: center;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .header-content {
        padding: 8px 16px;
        gap: 12px;
      }

      .hub-logo {
        font-size: 1.3rem;
      }

      .main-nav {
        display: none;
      }

      .user-actions {
        gap: 8px;
      }

      .mobile-nav {
        display: flex;
      }

      .hub-content {
        padding-bottom: 70px;
      }

      .stats-container {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      .feature-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .search-section {
        padding: 12px 16px;
      }
    }

    @media (max-width: 480px) {
      .stats-container {
        grid-template-columns: 1fr;
      }

      .stat-card {
        padding: 20px;
      }

      .feature-card {
        padding: 24px 20px;
      }
    }
  `]
})
export class EcommerceHubComponent implements OnInit {
  currentView = 'dashboard';
  currentUser: any = null;
  showUserMenu = false;
  showSearchBar = false;
  searchQuery = '';
  searchSuggestions: any[] = [];
  
  // Counts
  wishlistCount = 0;
  cartCount = 0;
  orderCount = 0;
  socialCount = 0;
  notificationCount = 0;

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadCounts();
    this.updateCurrentView();
    
    // Listen for route changes
    this.router.events.subscribe(() => {
      this.updateCurrentView();
    });
  }

  loadCurrentUser() {
    // Get current user from auth service
    this.currentUser = null; // Will be set by auth service
  }

  loadCounts() {
    // Get actual counts from services
    this.wishlistCount = 0;
    this.cartCount = 0;
    this.orderCount = 0;
    this.socialCount = 0;
    this.notificationCount = 0;
  }

  updateCurrentView() {
    const url = this.router.url;
    if (url.includes('/shop')) this.currentView = 'shop';
    else if (url.includes('/wishlist')) this.currentView = 'wishlist';
    else if (url.includes('/cart')) this.currentView = 'cart';
    else if (url.includes('/social')) this.currentView = 'social';
    else if (url.includes('/orders')) this.currentView = 'orders';
    else if (url.includes('/profile')) this.currentView = 'profile';
    else this.currentView = 'dashboard';
  }

  // Navigation methods
  goHome() {
    this.navigateTo('dashboard');
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.showUserMenu = false;
  }

  // User menu
  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    // Implement logout functionality
    this.showUserMenu = false;
    this.router.navigate(['/auth/login']);
  }

  // Search functionality
  toggleSearch() {
    this.showSearchBar = !this.showSearchBar;
    if (!this.showSearchBar) {
      this.clearSearch();
    }
  }

  onSearchInput() {
    if (this.searchQuery.length > 2) {
      // Implement search suggestions from API
      this.searchSuggestions = [];
    } else {
      this.searchSuggestions = [];
    }
  }

  search() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { 
        queryParams: { q: this.searchQuery } 
      });
      this.showSearchBar = false;
      this.clearSearch();
    }
  }

  selectSuggestion(suggestion: any) {
    this.searchQuery = suggestion.text;
    this.search();
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchSuggestions = [];
  }

  getSuggestionIcon(type: string): string {
    switch (type) {
      case 'product': return 'fa-box';
      case 'brand': return 'fa-tag';
      case 'user': return 'fa-user';
      default: return 'fa-search';
    }
  }

  // Notifications
  showNotifications() {
    this.router.navigate(['/notifications']);
  }
}
