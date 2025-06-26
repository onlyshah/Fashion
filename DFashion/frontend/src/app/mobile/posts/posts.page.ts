import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonInfiniteScroll } from '@ionic/angular';

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

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadPosts();
  }

  ionViewWillEnter() {
    this.loadPosts();
  }

  loadPosts(refresh = false) {
    if (refresh) {
      this.currentPage = 1;
      this.posts = [];
      this.hasMorePosts = true;
    }

    this.isLoading = true;

    // Load posts from API
    fetch(`http://localhost:5000/api/posts?page=${this.currentPage}&limit=10`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const newPosts = data.posts.map((post: any) => ({
            ...post,
            isLiked: false, // TODO: Check if current user liked this post
            isSaved: false, // TODO: Check if current user saved this post
            showComments: false,
            showProductTags: false
          }));

          if (refresh) {
            this.posts = newPosts;
          } else {
            this.posts = [...this.posts, ...newPosts];
          }

          this.hasMorePosts = data.posts.length === 10;
          this.currentPage++;
        }
        this.isLoading = false;
      })
      .catch(error => {
        console.error('Error loading posts:', error);
        this.isLoading = false;
      });
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
    } else {
      post.analytics.likes--;
    }
    
    // TODO: Send like/unlike request to API
    console.log('Toggle like for post:', post._id);
  }

  toggleSave(post: any) {
    post.isSaved = !post.isSaved;
    
    // TODO: Send save/unsave request to API
    console.log('Toggle save for post:', post._id);
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

  addToCart(product: any) {
    // TODO: Add product to cart
    console.log('Adding to cart:', product);
  }

  addToWishlist(product: any) {
    // TODO: Add product to wishlist
    console.log('Adding to wishlist:', product);
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
