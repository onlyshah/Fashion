import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-nav',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="main-navigation">
      <div class="nav-container">
        <!-- Logo -->
        <div class="nav-logo" (click)="navigateToHome()">
          <i class="fas fa-shopping-bag"></i>
          <span>DFashion</span>
        </div>

        <!-- Desktop Navigation -->
        <div class="nav-links desktop-nav">
          <button class="nav-link" 
                  [class.active]="currentRoute === '/feed'"
                  (click)="navigateToFeed()">
            <i class="fas fa-home"></i>
            <span>Feed</span>
          </button>

          <button class="nav-link" 
                  [class.active]="currentRoute.includes('/stories')"
                  (click)="navigateToStories()">
            <i class="fas fa-play-circle"></i>
            <span>Stories</span>
          </button>

          <button class="nav-link" 
                  [class.active]="currentRoute === '/shop'"
                  (click)="navigateToShop()">
            <i class="fas fa-store"></i>
            <span>Shop</span>
          </button>

          <button class="nav-link" 
                  [class.active]="currentRoute === '/wishlist'"
                  (click)="navigateToWishlist()">
            <i class="fas fa-heart"></i>
            <span>Wishlist</span>
          </button>

          <button class="nav-link" 
                  [class.active]="currentRoute === '/cart'"
                  (click)="navigateToCart()">
            <i class="fas fa-shopping-cart"></i>
            <span>Cart</span>
          </button>
        </div>

        <!-- User Actions -->
        <div class="nav-actions">
          <button class="action-btn" (click)="navigateToSearch()">
            <i class="fas fa-search"></i>
          </button>
          
          <button class="action-btn" (click)="navigateToProfile()">
            <i class="fas fa-user"></i>
          </button>
        </div>
      </div>

      <!-- Mobile Bottom Navigation -->
      <div class="mobile-nav">
        <button class="mobile-nav-btn" 
                [class.active]="currentRoute === '/feed'"
                (click)="navigateToFeed()">
          <i class="fas fa-home"></i>
          <span>Feed</span>
        </button>

        <button class="mobile-nav-btn" 
                [class.active]="currentRoute.includes('/stories')"
                (click)="navigateToStories()">
          <i class="fas fa-play-circle"></i>
          <span>Stories</span>
        </button>

        <button class="mobile-nav-btn" 
                [class.active]="currentRoute === '/shop'"
                (click)="navigateToShop()">
          <i class="fas fa-store"></i>
          <span>Shop</span>
        </button>

        <button class="mobile-nav-btn" 
                [class.active]="currentRoute === '/wishlist'"
                (click)="navigateToWishlist()">
          <i class="fas fa-heart"></i>
          <span>Wishlist</span>
        </button>

        <button class="mobile-nav-btn" 
                [class.active]="currentRoute === '/cart'"
                (click)="navigateToCart()">
          <i class="fas fa-shopping-cart"></i>
          <span>Cart</span>
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .main-navigation {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: #fff;
      border-bottom: 1px solid #eee;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
    }

    .nav-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.5rem;
      font-weight: 700;
      color: #007bff;
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .nav-logo:hover {
      color: #0056b3;
    }

    .desktop-nav {
      display: flex;
      gap: 16px;
    }

    .nav-link {
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
      font-size: 0.8rem;
    }

    .nav-link:hover {
      background: #f8f9fa;
      color: #007bff;
    }

    .nav-link.active {
      color: #007bff;
      background: #e3f2fd;
    }

    .nav-link i {
      font-size: 1.1rem;
    }

    .nav-actions {
      display: flex;
      gap: 12px;
    }

    .action-btn {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      font-size: 1.1rem;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      background: #f8f9fa;
      color: #007bff;
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
      font-size: 0.7rem;
      min-width: 60px;
    }

    .mobile-nav-btn:hover,
    .mobile-nav-btn.active {
      color: #007bff;
    }

    .mobile-nav-btn i {
      font-size: 1.2rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .desktop-nav {
        display: none;
      }

      .nav-actions {
        gap: 8px;
      }

      .mobile-nav {
        display: flex;
      }
    }

    @media (max-width: 480px) {
      .nav-container {
        padding: 8px 16px;
      }

      .nav-logo span {
        display: none;
      }
    }
  `]
})
export class MainNavComponent implements OnInit {
  currentRoute = '';

  constructor(private router: Router) {}

  ngOnInit() {
    // Track current route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });

    // Set initial route
    this.currentRoute = this.router.url;
  }

  // Navigation methods
  navigateToHome() {
    console.log('Navigating to home/feed');
    this.router.navigate(['/feed']);
  }

  navigateToFeed() {
    console.log('Navigating to feed');
    this.router.navigate(['/feed']);
  }

  navigateToStories() {
    console.log('Navigating to stories');
    this.router.navigate(['/stories']);
  }

  navigateToShop() {
    console.log('Navigating to shop');
    this.router.navigate(['/shop']);
  }

  navigateToWishlist() {
    console.log('Navigating to wishlist');
    this.router.navigate(['/wishlist']);
  }

  navigateToCart() {
    console.log('Navigating to cart');
    this.router.navigate(['/cart']);
  }

  navigateToSearch() {
    console.log('Navigating to search');
    this.router.navigate(['/search']);
  }

  navigateToProfile() {
    console.log('Navigating to profile');
    this.router.navigate(['/profile']);
  }
}
