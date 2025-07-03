import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { StoryService } from '../../core/services/story.service';
import { PostService } from '../../core/services/post.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  featuredProducts: any[] = [];
  recentStories: any[] = [];
  trendingPosts: any[] = [];
  trendingProducts: any[] = [];
  featuredBrands: any[] = [];
  newArrivals: any[] = [];
  suggestedUsers: any[] = [];
  topInfluencers: any[] = [];
  categories: any[] = [];
  isLoading = true;
  isAuthenticated = false;

  // Slider options
  slideOpts = {
    initialSlide: 0,
    speed: 400,
    spaceBetween: 10,
    slidesPerView: 1.2,
    centeredSlides: false,
    loop: true,
    autoplay: {
      delay: 3000,
    }
  };

  storySlideOpts = {
    initialSlide: 0,
    speed: 400,
    spaceBetween: 8,
    slidesPerView: 5.5,
    freeMode: true,
    grabCursor: true
  };

  productSlideOpts = {
    initialSlide: 0,
    speed: 400,
    spaceBetween: 15,
    slidesPerView: 2.2,
    freeMode: true,
    autoplay: {
      delay: 3000,
    }
  };

  brandSlideOpts = {
    initialSlide: 0,
    speed: 400,
    spaceBetween: 12,
    slidesPerView: 3.5,
    freeMode: true,
    autoplay: {
      delay: 4000,
    }
  };

  userSlideOpts = {
    initialSlide: 0,
    speed: 400,
    spaceBetween: 16,
    slidesPerView: 2.5,
    freeMode: true,
    autoplay: {
      delay: 5000,
    }
  };

  constructor(
    private router: Router,
    private productService: ProductService,
    private storyService: StoryService,
    private postService: PostService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    console.log('📱 Mobile Home Page: ngOnInit called!');
    this.loadHomeData();
    this.authService.isAuthenticated$.subscribe(
      isAuth => {
        console.log('📱 Mobile Home: Auth state changed:', isAuth);
        this.isAuthenticated = isAuth;
      }
    );
  }

  async loadHomeData() {
    try {
      console.log('📱 Mobile Home: Starting to load home data...');
      this.isLoading = true;

      // Load all data in parallel
      console.log('📱 Mobile Home: Loading featured products, stories, and posts...');
      const [products, stories, posts] = await Promise.all([
        this.productService.getFeaturedProducts().toPromise(),
        this.storyService.getActiveStories().toPromise(),
        this.postService.getTrendingPosts().toPromise()
      ]);

      console.log('📱 Mobile Home: Received data:', { products, stories, posts });
      this.featuredProducts = products?.data || [];
      this.recentStories = stories?.data || [];
      this.trendingPosts = posts?.data || [];

      console.log('📱 Mobile Home: Assigned data:', {
        featuredProducts: this.featuredProducts.length,
        recentStories: this.recentStories.length,
        trendingPosts: this.trendingPosts.length
      });

      // Load additional data
      console.log('📱 Mobile Home: Loading additional data...');
      await this.loadTrendingProducts();
      await this.loadFeaturedBrands();
      await this.loadNewArrivals();
      await this.loadSuggestedUsers();
      await this.loadTopInfluencers();
      this.loadCategories();

      console.log('📱 Mobile Home: All data loaded successfully!');
    } catch (error) {
      console.error('❌ Mobile Home: Error loading home data:', error);
    } finally {
      this.isLoading = false;
      console.log('📱 Mobile Home: Loading complete, isLoading set to false');
    }
  }

  onProductClick(product: any) {
    this.router.navigate(['/product', product.id]);
  }

  onStoryClick(story: any, index: number = 0) {
    console.log('📱 Story clicked:', story, 'at index:', index);

    // Find the parent tabs component and open stories viewer
    const tabsPage = document.querySelector('app-tabs');
    if (tabsPage) {
      // Emit event to parent tabs component
      const event = new CustomEvent('openStories', {
        detail: { stories: this.recentStories, index }
      });
      tabsPage.dispatchEvent(event);
    }
  }

  onCategoryClick(category: any) {
    this.router.navigate(['/tabs/categories'], { 
      queryParams: { category: category.name.toLowerCase() } 
    });
  }

  onSearchClick() {
    this.router.navigate(['/search']);
  }

  onNotificationsClick() {
    if (this.isAuthenticated) {
      this.router.navigate(['/notifications']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  doRefresh(event: any) {
    this.loadHomeData().then(() => {
      event.target.complete();
    });
  }

  async loadCategories() {
    try {
      // Load categories from API or use default ones
      this.categories = [
        { id: 'men', name: 'Men', icon: 'man', color: 'primary' },
        { id: 'women', name: 'Women', icon: 'woman', color: 'secondary' },
        { id: 'kids', name: 'Kids', icon: 'happy', color: 'tertiary' },
        { id: 'accessories', name: 'Accessories', icon: 'bag', color: 'success' },
        { id: 'shoes', name: 'Shoes', icon: 'footsteps', color: 'warning' },
        { id: 'bags', name: 'Bags', icon: 'bag-handle', color: 'danger' }
      ];
    } catch (error) {
      console.error('Error loading categories:', error);
      this.categories = [];
    }
  }

  async loadTrendingProducts() {
    try {
      const response = await this.productService.getTrendingProducts().toPromise();
      this.trendingProducts = response?.data?.slice(0, 10) || [];
    } catch (error) {
      console.error('Error loading trending products:', error);
      this.trendingProducts = [];
    }
  }

  async loadFeaturedBrands() {
    try {
      // Mock data for featured brands
      this.featuredBrands = [
        { id: '1', name: 'Nike', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png', productCount: 150 },
        { id: '2', name: 'Adidas', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Adidas-Logo.png', productCount: 120 },
        { id: '3', name: 'Puma', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Puma-Logo.png', productCount: 95 },
        { id: '4', name: 'Zara', logo: 'https://logos-world.net/wp-content/uploads/2020/07/Zara-Logo.png', productCount: 200 },
        { id: '5', name: 'H&M', logo: 'https://logos-world.net/wp-content/uploads/2020/04/HM-Logo.png', productCount: 180 }
      ];
    } catch (error) {
      console.error('Error loading featured brands:', error);
      this.featuredBrands = [];
    }
  }

  async loadNewArrivals() {
    try {
      const response = await this.productService.getNewArrivals().toPromise();
      this.newArrivals = response?.data?.slice(0, 10) || [];
    } catch (error) {
      console.error('Error loading new arrivals:', error);
      this.newArrivals = [];
    }
  }

  async loadSuggestedUsers() {
    try {
      // Mock data for suggested users
      this.suggestedUsers = [
        {
          id: '1',
          username: 'fashionista_maya',
          fullName: 'Maya Patel',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
          isFollowing: false,
          isInfluencer: true,
          followerCount: 45000
        },
        {
          id: '2',
          username: 'style_guru_raj',
          fullName: 'Raj Kumar',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          isFollowing: false,
          isInfluencer: true,
          followerCount: 32000
        },
        {
          id: '3',
          username: 'trendy_sara',
          fullName: 'Sara Johnson',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          isFollowing: false,
          isInfluencer: false,
          followerCount: 8500
        }
      ];
    } catch (error) {
      console.error('Error loading suggested users:', error);
      this.suggestedUsers = [];
    }
  }

  async loadTopInfluencers() {
    try {
      // Mock data for top influencers
      this.topInfluencers = [
        {
          id: '1',
          username: 'fashionista_queen',
          fullName: 'Priya Sharma',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
          followerCount: 2500000,
          category: 'High Fashion',
          isVerified: true,
          isFollowing: false
        },
        {
          id: '2',
          username: 'street_style_king',
          fullName: 'Arjun Kapoor',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          followerCount: 1800000,
          category: 'Streetwear',
          isVerified: true,
          isFollowing: false
        }
      ];
    } catch (error) {
      console.error('Error loading top influencers:', error);
      this.topInfluencers = [];
    }
  }

  onBrandClick(brand: any) {
    this.router.navigate(['/tabs/categories'], {
      queryParams: { brand: brand.name.toLowerCase() }
    });
  }

  onUserClick(user: any) {
    this.router.navigate(['/profile', user.username]);
  }

  onInfluencerClick(influencer: any) {
    this.router.navigate(['/profile', influencer.username]);
  }

  onFollowUser(user: any, event: Event) {
    event.stopPropagation();
    user.isFollowing = !user.isFollowing;
    if (user.isFollowing) {
      user.followerCount++;
    } else {
      user.followerCount--;
    }
  }

  onFollowInfluencer(influencer: any, event: Event) {
    event.stopPropagation();
    influencer.isFollowing = !influencer.isFollowing;
    if (influencer.isFollowing) {
      influencer.followerCount++;
    } else {
      influencer.followerCount--;
    }
  }

  getProductImage(product: any): string {
    return product.images?.[0]?.url || '/assets/images/placeholder-product.png';
  }

  getDiscountPercentage(product: any): number {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    if (product.discountPrice && product.price > product.discountPrice) {
      return Math.round(((product.price - product.discountPrice) / product.price) * 100);
    }
    return 0;
  }

  formatFollowerCount(count: number): string {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }

  // Instagram-style methods
  onMessagesClick() {
    console.log('📱 Messages clicked');
    // Navigate to messages/chat
  }

  onAddStoryClick() {
    console.log('📱 Add story clicked');

    // Find the parent tabs component and open create modal
    const tabsPage = document.querySelector('app-tabs');
    if (tabsPage) {
      // Emit event to parent tabs component
      const event = new CustomEvent('openCreateModal', {
        detail: { type: 'story' }
      });
      tabsPage.dispatchEvent(event);
    }
  }

  onLikePost(post: any) {
    console.log('📱 Like post:', post.id);
    post.isLiked = !post.isLiked;
    if (post.isLiked) {
      post.analytics = post.analytics || {};
      post.analytics.likes = (post.analytics.likes || 0) + 1;
    } else {
      post.analytics.likes = Math.max(0, (post.analytics.likes || 1) - 1);
    }
  }

  onCommentPost(post: any) {
    console.log('📱 Comment on post:', post.id);
    // Navigate to post detail with comments
  }

  onSharePost(post: any) {
    console.log('📱 Share post:', post.id);
    // Open share dialog
  }

  onSavePost(post: any) {
    console.log('📱 Save post:', post.id);
    post.isSaved = !post.isSaved;
  }

  onViewComments(post: any) {
    console.log('📱 View comments for post:', post.id);
    // Navigate to post detail
  }

  formatCount(count: number): string {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }

  getTimeAgo(date: string): string {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d`;
    }
  }

  loadMorePosts() {
    console.log('📱 Loading more posts...');
    // Load more posts from API
  }

  // Performance optimization
  trackByPostId(index: number, post: any): any {
    return post.id || index;
  }

  trackByStoryId(index: number, story: any): any {
    return story.id || index;
  }
}
