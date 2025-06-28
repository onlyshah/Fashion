import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonInfiniteScroll } from '@ionic/angular';
import { PostService } from '../../core/services/post.service';
import { AuthService } from '../../core/services/auth.service';
import { SocialInteractionsService } from '../../core/services/social-interactions.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.page.html',
  styleUrls: ['./posts.page.scss'],
})
export class PostsPage implements OnInit {
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  @ViewChild(IonInfiniteScroll, { static: false }) infiniteScroll!: IonInfiniteScroll;

  posts: any[] = [];
  isLoading = false;
  hasMorePosts = true;
  currentPage = 1;
  isAuthenticated = false;
  likedPosts = new Set<string>();
  savedPosts = new Set<string>();
  selectedFilter = 'all';

  filterOptions = [
    { value: 'all', label: 'All Posts' },
    { value: 'trending', label: 'Trending' },
    { value: 'following', label: 'Following' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'lifestyle', label: 'Lifestyle' }
  ];

  constructor(
    private router: Router,
    private postService: PostService,
    private authService: AuthService,
    private socialService: SocialInteractionsService,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(
      isAuth => {
        this.isAuthenticated = isAuth;
      }
    );

    this.loadLikedPosts();
    this.loadSavedPosts();
    this.loadPosts();
  }

  ionViewWillEnter() {
    this.loadPosts();
  }

  loadLikedPosts() {
    this.socialService.likedPosts$.subscribe(likedPosts => {
      this.likedPosts = likedPosts;
    });
  }

  loadSavedPosts() {
    this.socialService.savedPosts$.subscribe(savedPosts => {
      this.savedPosts = savedPosts;
    });
  }

  async loadPosts(refresh = false) {
    if (refresh) {
      this.currentPage = 1;
      this.posts = [];
      this.hasMorePosts = true;
    }

    this.isLoading = true;

    try {
      const response = await this.postService.getAllPosts(this.currentPage, 10).toPromise();

      if (response?.success) {
        const newPosts = response.data.map((post: any) => ({
          ...post,
          isLiked: this.likedPosts.has(post._id),
          isSaved: this.savedPosts.has(post._id),
          showComments: false,
          showProductTags: false
        }));

        if (refresh) {
          this.posts = newPosts;
        } else {
          this.posts = [...this.posts, ...newPosts];
        }

        this.hasMorePosts = response.data.length === 10;
        this.currentPage++;
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      this.isLoading = false;
    }
  }



  doRefresh(event: any) {
    this.loadPosts(true);
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  loadMorePosts(event: any) {
    if (!this.hasMorePosts) {
      event.target.complete();
      return;
    }

    this.loadPosts();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  toggleLike(post: any) {
    post.isLiked = !post.isLiked;
    if (post.isLiked) {
      post.analytics.likes++;
      this.socialService.likePost(post._id);
    } else {
      post.analytics.likes--;
      this.socialService.unlikePost(post._id);
    }
  }

  toggleSave(post: any) {
    post.isSaved = !post.isSaved;

    if (post.isSaved) {
      this.socialService.savePost(post._id);
    } else {
      this.socialService.unsavePost(post._id);
    }
  }

  toggleComments(post: any) {
    post.showComments = !post.showComments;
  }

  sharePost(post: any) {
    // TODO: Implement share functionality
    console.log('Share post:', post._id);
  }

  viewProfile(user: any) {
    this.router.navigate(['/profile', user._id]);
  }

  viewProduct(product: any) {
    this.router.navigate(['/product', product._id]);
  }

  async addToCart(product: any) {
    try {
      await this.cartService.addToCart(product._id, 1).toPromise();
      console.log('Added to cart:', product.name);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }

  async addToWishlist(product: any) {
    try {
      await this.wishlistService.addToWishlist(product._id).toPromise();
      console.log('Added to wishlist:', product.name);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  }

  onFilterChange() {
    this.filterPosts();
  }

  filterPosts() {
    // Apply filter logic based on selectedFilter
    if (this.selectedFilter === 'all') {
      // Show all posts - no filtering needed as we load all posts
      return;
    } else if (this.selectedFilter === 'trending') {
      // Could implement trending logic here
      return;
    } else if (this.selectedFilter === 'following') {
      // Could implement following filter here
      return;
    }
    // Add more filter logic as needed
  }

  onCreatePost() {
    if (this.isAuthenticated) {
      this.router.navigate(['/create-post']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  onSearchClick() {
    this.router.navigate(['/search']);
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d`;
    }
  }

  formatCount(count: number): string {
    if (count < 1000) {
      return count.toString();
    } else if (count < 1000000) {
      return (count / 1000).toFixed(1) + 'K';
    } else {
      return (count / 1000000).toFixed(1) + 'M';
    }
  }

  onDoubleClick(post: any) {
    // Double tap to like (Instagram-style)
    if (!post.isLiked) {
      this.toggleLike(post);
      // TODO: Show heart animation
    }
  }

  toggleProductTags(post: any) {
    // Toggle product tags visibility (Instagram-style)
    if (post.products && post.products.length > 0) {
      post.showProductTags = !post.showProductTags;

      // Auto-hide after 3 seconds
      if (post.showProductTags) {
        setTimeout(() => {
          post.showProductTags = false;
        }, 3000);
      }
    }
  }

  trackByPostId(index: number, post: any): string {
    return post._id;
  }
}
