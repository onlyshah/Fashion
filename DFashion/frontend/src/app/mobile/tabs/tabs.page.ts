import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit, OnDestroy {
  cartItemCount = 0;
  wishlistItemCount = 0;
  isAuthenticated = false;
  isVendor = false;
  currentUser: any = null;
  sidebarOpen = false;

  // Create content modal
  showCreateModal = false;

  // Stories viewer
  showStoriesViewer = false;
  currentStories: any[] = [];
  currentStoryIndex = 0;

  // User display properties
  get userName(): string {
    return this.currentUser?.fullName || this.currentUser?.username || 'User';
  }

  get userEmail(): string {
    return this.currentUser?.email || '';
  }

  get userAvatar(): string {
    return this.currentUser?.avatar || '/assets/images/default-avatar.svg';
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    // Subscribe to auth state
    this.authService.isAuthenticated$.subscribe(
      isAuth => this.isAuthenticated = isAuth
    );

    // Subscribe to current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isVendor = user?.role === 'vendor' || user?.role === 'admin';
    });

    // Subscribe to cart count
    this.cartService.cartItemCount$.subscribe(
      count => this.cartItemCount = count
    );

    // Subscribe to wishlist count
    this.wishlistService.wishlistItemCount$.subscribe(
      count => this.wishlistItemCount = count
    );

    // Listen for stories events from child components
    this.elementRef.nativeElement.addEventListener('openStories', (event: CustomEvent) => {
      const { stories, index } = event.detail;
      this.openStoriesViewer(stories, index);
    });

    // Listen for create modal events from child components
    this.elementRef.nativeElement.addEventListener('openCreateModal', (event: CustomEvent) => {
      const { type } = event.detail;
      console.log('📱 Opening create modal for:', type);
      this.showCreateModal = true;
    });
  }

  ngOnDestroy() {
    // Clean up event listeners
    this.elementRef.nativeElement.removeEventListener('openStories', this.openStoriesViewer);
  }

  // Sidebar methods
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    console.log('📱 Sidebar toggled:', this.sidebarOpen);
  }

  closeSidebar() {
    this.sidebarOpen = false;
    console.log('📱 Sidebar closed');
  }

  navigateAndClose(route: string) {
    console.log('📱 Navigating to:', route);
    this.router.navigate([route]);
    this.closeSidebar();
  }

  // Create content methods
  onCreateClick() {
    console.log('📱 Create button clicked');
    this.showCreateModal = true;
  }

  onCreateModalClose() {
    console.log('📱 Create modal closed');
    this.showCreateModal = false;
  }

  onCreatePost(data: any) {
    console.log('📱 Create post:', data);
    this.router.navigate(['/create-post'], { state: { data } });
  }

  onAddStory(data: any) {
    console.log('📱 Add story:', data);
    this.router.navigate(['/create-story'], { state: { data } });
  }

  onCreateReel(data: any) {
    console.log('📱 Create reel:', data);
    this.router.navigate(['/create-reel'], { state: { data } });
  }

  onGoLive() {
    console.log('📱 Go live');
    // Implement live streaming
  }

  onMoreOptions() {
    console.log('📱 More options - opening sidebar');
    this.toggleSidebar();
  }

  // Stories viewer methods
  openStoriesViewer(stories: any[], index: number = 0) {
    console.log('📱 Opening stories viewer:', stories, index);
    this.currentStories = stories;
    this.currentStoryIndex = index;
    this.showStoriesViewer = true;
  }

  onStoriesViewerClose() {
    console.log('📱 Stories viewer closed');
    this.showStoriesViewer = false;
    this.currentStories = [];
    this.currentStoryIndex = 0;
  }

  onStoryChange(index: number) {
    console.log('📱 Story changed to index:', index);
    this.currentStoryIndex = index;
  }

  onStoryProductClick(product: any) {
    console.log('📱 Story product clicked:', product);
    this.router.navigate(['/product', product.id]);
  }
}
