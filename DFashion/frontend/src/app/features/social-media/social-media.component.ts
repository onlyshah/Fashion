import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SocialFeedComponent } from '../posts/social-feed.component';
import { StoriesViewerComponent } from '../stories/stories-viewer.component';

@Component({
  selector: 'app-social-media',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, SocialFeedComponent, StoriesViewerComponent],
  templateUrl: './social-media.component.html',
  styles: [`
    .social-media-platform {
      min-height: 100vh;
      background: #f8f9fa;
    }

    /* Header */
    .platform-header {
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

    .logo-section {
      flex-shrink: 0;
    }

    .platform-logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: #007bff;
      margin: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .search-section {
      flex: 1;
      max-width: 400px;
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
      padding: 10px 12px 10px 40px;
      border: 1px solid #ddd;
      border-radius: 20px;
      font-size: 0.9rem;
      background: #f8f9fa;
    }

    .search-bar input:focus {
      outline: none;
      border-color: #007bff;
      background: #fff;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
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
      min-width: 150px;
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

    .dropdown-item:first-child {
      border-radius: 8px 8px 0 0;
    }

    .dropdown-item:last-child {
      border-radius: 0 0 8px 8px;
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

    /* Main Content */
    .platform-content {
      min-height: calc(100vh - 80px);
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

    .mobile-nav-btn i {
      font-size: 1.2rem;
    }

    .mobile-nav-btn.create-btn {
      background: #007bff;
      color: #fff;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      margin-top: -10px;
    }

    .mobile-nav-btn.create-btn:hover {
      background: #0056b3;
      color: #fff;
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

    /* Create Modal */
    .create-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.5);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .create-content {
      background: #fff;
      border-radius: 12px;
      padding: 24px;
      max-width: 400px;
      width: 100%;
    }

    .create-content h3 {
      margin: 0 0 20px 0;
      text-align: center;
      font-size: 1.3rem;
      color: #333;
    }

    .create-options {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
    }

    .create-option {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border: 1px solid #eee;
      border-radius: 8px;
      background: #fff;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
    }

    .create-option:hover {
      border-color: #007bff;
      background: #f8f9fa;
    }

    .create-option i {
      font-size: 1.5rem;
      color: #007bff;
      width: 24px;
      text-align: center;
    }

    .create-option span {
      font-weight: 600;
      color: #333;
      display: block;
      margin-bottom: 4px;
    }

    .create-option p {
      margin: 0;
      font-size: 0.8rem;
      color: #666;
    }

    .btn-close-create {
      width: 100%;
      padding: 12px;
      background: #f8f9fa;
      border: 1px solid #ddd;
      border-radius: 6px;
      color: #666;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-close-create:hover {
      background: #e9ecef;
    }

    /* Floating Action Button */
    .fab-create {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #007bff;
      color: #fff;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,123,255,0.3);
      transition: all 0.3s ease;
      z-index: 1000;
    }

    .fab-create:hover {
      background: #0056b3;
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(0,123,255,0.4);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .header-content {
        padding: 8px 16px;
        gap: 12px;
      }

      .platform-logo {
        font-size: 1.3rem;
      }

      .search-section {
        max-width: none;
        flex: 1;
      }

      .nav-actions {
        display: none;
      }

      .mobile-nav {
        display: flex;
      }

      .platform-content {
        padding-bottom: 70px;
      }

      .fab-create {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .header-content {
        gap: 8px;
      }

      .platform-logo span {
        display: none;
      }

      .search-bar input {
        font-size: 0.8rem;
        padding: 8px 10px 8px 36px;
      }
    }
  `]
})
export class SocialMediaComponent implements OnInit {
  currentView = 'feed';
  currentUser: any = null;
  showUserMenu = false;
  showCreateModal = false;
  searchQuery = '';
  cartCount = 0;
  wishlistCount = 0;
  isMobile = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkMobile();
    this.loadCurrentUser();
    this.loadCounts();
    
    // Listen for route changes to update current view
    this.router.events.subscribe(() => {
      this.updateCurrentView();
    });
  }

  checkMobile() {
    this.isMobile = window.innerWidth <= 768;
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
    });
  }

  loadCurrentUser() {
    // Get from auth service
    this.currentUser = null;
  }

  loadCounts() {
    // TODO: Get actual counts from services
    this.cartCount = 3;
    this.wishlistCount = 5;
  }

  updateCurrentView() {
    const url = this.router.url;
    if (url.includes('/shop')) this.currentView = 'shop';
    else if (url.includes('/wishlist')) this.currentView = 'wishlist';
    else if (url.includes('/cart')) this.currentView = 'cart';
    else if (url.includes('/home')) this.currentView = 'home';
    else this.currentView = 'feed';
  }

  // Navigation methods
  goHome() {
    this.router.navigate(['/home']);
  }

  goShop() {
    this.router.navigate(['/shop']);
  }

  goWishlist() {
    this.router.navigate(['/wishlist']);
  }

  goCart() {
    this.router.navigate(['/cart']);
  }

  goProfile() {
    this.router.navigate(['/profile']);
    this.showUserMenu = false;
  }

  goSettings() {
    this.router.navigate(['/settings']);
    this.showUserMenu = false;
  }

  goLogin() {
    this.router.navigate(['/auth/login']);
  }

  // User menu
  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    // TODO: Implement logout
    this.showUserMenu = false;
    this.router.navigate(['/auth/login']);
  }

  // Search
  search() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { 
        queryParams: { q: this.searchQuery } 
      });
    }
  }

  // Create content
  showCreateMenu() {
    this.showCreateModal = true;
  }

  closeCreateMenu() {
    this.showCreateModal = false;
  }

  createPost() {
    this.router.navigate(['/create/post']);
    this.closeCreateMenu();
  }

  createStory() {
    this.router.navigate(['/create/story']);
    this.closeCreateMenu();
  }

  goLive() {
    this.router.navigate(['/live']);
    this.closeCreateMenu();
  }
}
