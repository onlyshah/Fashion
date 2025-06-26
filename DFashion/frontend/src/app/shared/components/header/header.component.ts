import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistNewService } from '../../../core/services/wishlist-new.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styles: [`
    .header {
      background: #fff;
      border-bottom: 1px solid #dbdbdb;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      height: 60px;
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
    }

    .logo a {
      text-decoration: none;
    }

    .logo h1 {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
    }

    .search-bar {
      position: relative;
      flex: 1;
      max-width: 400px;
      margin: 0 40px;
    }

    .search-bar input {
      width: 100%;
      padding: 8px 16px 8px 40px;
      border: 1px solid #dbdbdb;
      border-radius: 8px;
      background: #fafafa;
      font-size: 14px;
      outline: none;
      transition: all 0.2s;
    }

    .search-bar input:focus {
      background: #fff;
      border-color: var(--primary-color);
    }

    .search-bar i {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #8e8e8e;
    }

    .search-suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      z-index: 1000;
      margin-top: 5px;
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #e0e0e0;
    }

    .suggestion-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      border-bottom: 1px solid #f0f0f0;
      transition: background-color 0.2s ease;
    }

    .suggestion-item:hover {
      background-color: #f8f9fa;
    }

    .suggestion-item:last-child {
      border-bottom: none;
    }

    .suggestion-item i {
      color: #6c757d;
      margin-right: 12px;
      width: 16px;
      position: static;
      transform: none;
    }

    .suggestion-text {
      flex: 1;
      font-size: 14px;
      color: #333;
    }

    .suggestion-type {
      font-size: 12px;
      color: #6c757d;
      text-transform: uppercase;
      font-weight: 500;
    }

    .nav-menu {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-decoration: none;
      color: #262626;
      font-size: 12px;
      transition: color 0.2s;
      padding: 8px;
      border-radius: 4px;
    }

    .nav-item i {
      font-size: 20px;
      margin-bottom: 4px;
    }

    .nav-item.active,
    .nav-item:hover {
      color: var(--primary-color);
    }

    .cart-item,
    .wishlist-item {
      position: relative;
    }

    .cart-badge,
    .wishlist-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #ef4444;
      color: white;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 16px;
      text-align: center;
      line-height: 1.2;
    }

    .cart-badge.zero,
    .wishlist-badge.zero {
      background: #6c757d;
    }

    .total-count-item {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: linear-gradient(135deg, #4834d4, #686de0);
      color: white;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      margin-left: 16px;
    }

    .total-count-item i {
      font-size: 16px;
    }

    .total-count-badge {
      background: #28a745;
      color: white;
      font-size: 12px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 12px;
      min-width: 20px;
      text-align: center;
      margin-left: auto;
    }

    .total-count-badge.zero {
      background: #6c757d;
    }

    .cart-total-display {
      position: absolute;
      top: 100%;
      right: 0;
      background: #28a745;
      color: white;
      font-size: 9px;
      font-weight: 600;
      padding: 2px 4px;
      border-radius: 4px;
      white-space: nowrap;
      margin-top: 2px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .cart-total-text {
      font-size: 9px;
    }

    .total-count-display {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: linear-gradient(135deg, #4834d4, #686de0);
      color: white;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 8px;
    }

    .total-count-display i {
      font-size: 12px;
    }

    .total-count-text {
      font-size: 12px;
      min-width: 16px;
      text-align: center;
    }

    .auth-buttons {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
      border: 1px solid transparent;
    }

    .btn-outline {
      color: var(--primary-color);
      border-color: var(--primary-color);
      background: transparent;
    }

    .btn-outline:hover {
      background: var(--primary-color);
      color: white;
    }

    .btn-primary {
      background: var(--primary-color);
      color: white;
    }

    .btn-primary:hover {
      background: var(--primary-dark);
    }

    .user-menu {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 8px;
      transition: background 0.2s;
    }

    .user-menu:hover {
      background: #f1f5f9;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .username {
      font-weight: 500;
      font-size: 14px;
    }

    .user-menu i {
      font-size: 12px;
      color: #64748b;
      transition: transform 0.2s;
    }

    .user-menu.active i {
      transform: rotate(180deg);
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      min-width: 200px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.2s;
      z-index: 1000;
    }

    .dropdown-menu.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      text-decoration: none;
      color: #262626;
      font-size: 14px;
      transition: background 0.2s;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
    }

    .dropdown-item:hover {
      background: #f8fafc;
    }

    .dropdown-item.logout {
      color: #ef4444;
    }

    .dropdown-item.logout:hover {
      background: #fef2f2;
    }

    .dropdown-divider {
      height: 1px;
      background: #e2e8f0;
      margin: 8px 0;
    }

    @media (max-width: 768px) {
      .search-bar {
        display: none;
      }

      .nav-menu {
        gap: 16px;
      }

      .nav-item span {
        display: none;
      }

      .username {
        display: none;
      }

      .cart-item,
      .wishlist-item {
        position: relative;
      }

      .cart-badge,
      .wishlist-badge {
        font-size: 8px;
        padding: 1px 4px;
        min-width: 12px;
      }

      .total-count-item {
        padding: 6px 8px;
        font-size: 12px;
        margin-left: 8px;
      }

      .total-count-item span:not(.total-count-badge) {
        display: none;
      }

      .total-count-item i {
        font-size: 14px;
      }

      .total-count-badge {
        font-size: 10px;
        padding: 1px 6px;
        min-width: 16px;
      }

      .cart-total-display {
        font-size: 8px;
        padding: 1px 3px;
      }

      .cart-total-text {
        font-size: 8px;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  searchQuery = '';
  showUserMenu = false;
  cartItemCount = 0;
  wishlistItemCount = 0;
  totalItemCount = 0;
  cartTotalAmount = 0;
  showCartTotalPrice = false;

  // Search functionality
  showSuggestions = false;
  searchSuggestions: any[] = [];
  searchTimeout: any;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistNewService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to user changes and refresh counts on login
    this.authService.currentUser$.subscribe(user => {
      const wasLoggedOut = !this.currentUser;
      this.currentUser = user;

      // If user just logged in, refresh total count
      if (user && wasLoggedOut) {
        console.log('🔄 User logged in, refreshing total count...');
        setTimeout(() => {
          this.cartService.refreshTotalCount();
        }, 100);
      } else if (!user && !wasLoggedOut) {
        // User logged out, reset total count
        console.log('🔄 User logged out, resetting total count...');
        this.totalItemCount = 0;
      }
    });

    // Subscribe to individual cart count
    this.cartService.cartItemCount$.subscribe((count: number) => {
      this.cartItemCount = count;
      console.log('🛒 Header cart count updated:', count);
    });

    // Subscribe to individual wishlist count
    this.wishlistService.wishlistItemCount$.subscribe((count: number) => {
      this.wishlistItemCount = count;
      console.log('💝 Header wishlist count updated:', count);
    });

    // Subscribe to total count (cart + wishlist)
    this.cartService.totalItemCount$.subscribe((count: number) => {
      this.totalItemCount = count;
      console.log('🔢 Header total count updated:', count);
    });

    // Subscribe to cart total amount
    this.cartService.cartTotalAmount$.subscribe((amount: number) => {
      this.cartTotalAmount = amount;
      console.log('💰 Header cart total amount updated:', amount);
    });

    // Subscribe to cart price display flag
    this.cartService.showCartTotalPrice$.subscribe((showPrice: boolean) => {
      this.showCartTotalPrice = showPrice;
      console.log('💲 Header show cart total price updated:', showPrice);
    });

    // Refresh counts when user logs in
    if (this.currentUser) {
      this.cartService.refreshTotalCount();
      this.wishlistService.refreshWishlistOnLogin();
    }

    // Load cart and wishlist on init
    this.cartService.loadCart();
    this.wishlistService.loadWishlist();

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu')) {
        this.showUserMenu = false;
      }
    });
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  openSearch() {
    this.router.navigate(['/search']);
  }

  // Get total count for display (cart + wishlist items for logged-in user)
  getTotalItemCount(): number {
    if (!this.currentUser) {
      return 0; // Return 0 if user is not logged in
    }
    return this.totalItemCount || 0;
  }

  // Get formatted cart total amount
  getFormattedCartTotal(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(this.cartTotalAmount || 0);
  }

  // Check if cart total price should be displayed
  shouldShowCartTotalPrice(): boolean {
    return this.currentUser !== null && this.showCartTotalPrice;
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], {
        queryParams: { q: this.searchQuery }
      });
      this.hideSuggestions();
    } else {
      this.router.navigate(['/search']);
    }
  }

  onSearchInput() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      if (this.searchQuery.trim().length > 2) {
        this.loadSearchSuggestions();
      } else {
        this.hideSuggestions();
      }
    }, 300);
  }

  onSearchFocus() {
    if (this.searchQuery.trim().length > 2) {
      this.showSuggestions = true;
    }
  }

  onSearchBlur() {
    // Delay hiding to allow clicking on suggestions
    setTimeout(() => {
      this.hideSuggestions();
    }, 200);
  }

  loadSearchSuggestions() {
    // Simulate API call for search suggestions
    const query = this.searchQuery.toLowerCase();

    // Mock suggestions based on query
    this.searchSuggestions = [
      { text: `${this.searchQuery} in Products`, type: 'product', icon: 'fa-shopping-bag' },
      { text: `${this.searchQuery} in Brands`, type: 'brand', icon: 'fa-tags' },
      { text: `${this.searchQuery} in Categories`, type: 'category', icon: 'fa-list' }
    ];

    this.showSuggestions = true;
  }

  selectSuggestion(suggestion: any) {
    this.searchQuery = suggestion.text;
    this.router.navigate(['/search'], {
      queryParams: {
        q: this.searchQuery,
        type: suggestion.type
      }
    });
    this.hideSuggestions();
  }

  getSuggestionIcon(type: string): string {
    switch (type) {
      case 'product': return 'fa-shopping-bag';
      case 'brand': return 'fa-tags';
      case 'category': return 'fa-list';
      default: return 'fa-search';
    }
  }

  hideSuggestions() {
    this.showSuggestions = false;
    this.searchSuggestions = [];
  }

  logout() {
    this.authService.logout();
    this.showUserMenu = false;
  }
}
