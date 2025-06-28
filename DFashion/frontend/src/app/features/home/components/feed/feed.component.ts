import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';
import { WishlistService } from '../../../../core/services/wishlist.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {
  posts: any[] = [];
  loading = true;
  hasMore = true;
  currentPage = 1;
  newComment = '';

  constructor(
    private router: Router,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.loading = true;

    // Simulate loading with realistic Instagram-style posts
    setTimeout(() => {
      this.posts = this.getFallbackPosts();
      this.loading = false;
    }, 1000);
  }

  getFallbackPosts() {
    return [
      {
        _id: 'post-1',
        user: {
          _id: 'user-1',
          username: 'ai_fashionista_maya',
          fullName: 'Maya Chen',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150'
        },
        content: 'Sustainable fashion is the future! 🌱✨ This eco-friendly dress is made from recycled materials and looks absolutely stunning. #SustainableFashion #EcoFriendly #OOTD',
        mediaUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600',
        mediaType: 'image',
        location: 'Mumbai, India',
        likes: 1247,
        comments: 89,
        shares: 34,
        isLiked: false,
        isSaved: false,
        isReel: false,
        hashtags: ['SustainableFashion', 'EcoFriendly', 'OOTD'],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        products: [
          {
            _id: 'prod-1',
            name: 'Eco-Friendly Summer Dress',
            price: 2499,
            image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200'
          }
        ]
      },

      {
        _id: 'post-3',
        user: {
          _id: 'user-3',
          username: 'ai_trendsetter_zara',
          fullName: 'Zara Patel',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
        },
        content: 'Ethnic fusion at its finest! Traditional meets modern ✨ This kurti is perfect for any occasion.',
        mediaUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600',
        mediaType: 'image',
        location: 'Bangalore, India',
        likes: 2156,
        comments: 134,
        shares: 67,
        isLiked: false,
        isSaved: true,
        isReel: false,
        hashtags: ['EthnicWear', 'Fusion', 'Traditional'],
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        products: [
          {
            _id: 'prod-3',
            name: 'Designer Ethnic Kurti',
            price: 1899,
            image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=200'
          }
        ]
      }
    ];
  }



  loadMorePosts() {
    this.currentPage++;
    this.loadPosts();
  }

  trackByPostId(index: number, post: any): string {
    return post._id;
  }

  // Instagram-style Actions
  toggleLike(post: any) {
    post.isLiked = !post.isLiked;
    post.likes += post.isLiked ? 1 : -1;
  }

  toggleSave(post: any) {
    post.isSaved = !post.isSaved;
  }

  toggleComments(post: any) {
    // Navigate to post detail or show comments modal
    console.log('Toggle comments for post:', post._id);
  }

  sharePost(post: any) {
    // Implement share functionality
    console.log('Share post:', post._id);
  }

  addComment(post: any) {
    if (this.newComment.trim()) {
      post.comments += 1;
      console.log('Add comment:', this.newComment, 'to post:', post._id);
      this.newComment = '';
    }
  }

  focusCommentInput(post: any) {
    // Focus on comment input
    console.log('Focus comment input for post:', post._id);
  }

  toggleVideoPlay(event: Event) {
    const video = event.target as HTMLVideoElement;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  showProductDetails(product: any) {
    console.log('Show product details:', product);
  }

  viewProduct(product: any) {
    this.router.navigate(['/product', product._id]);
  }

  formatLikesCount(likes: number): string {
    if (likes === 1) return '1 like';
    if (likes < 1000) return `${likes} likes`;
    if (likes < 1000000) return `${(likes / 1000).toFixed(1)}K likes`;
    return `${(likes / 1000000).toFixed(1)}M likes`;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  }

  getTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w`;
  }

  // E-commerce Actions
  addToCart(product: any) {
    console.log('Adding to cart:', product);
    this.cartService.addToCart(product._id, 1, undefined, undefined).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Product added to cart!');
        } else {
          alert('Failed to add product to cart');
        }
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        alert('Error adding product to cart');
      }
    });
  }

  addToWishlist(product: any) {
    console.log('Adding to wishlist:', product);
    this.wishlistService.addToWishlist(product._id).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Product added to wishlist!');
        } else {
          alert('Failed to add product to wishlist');
        }
      },
      error: (error) => {
        console.error('Error adding to wishlist:', error);
        alert('Error adding product to wishlist');
      }
    });
  }

  buyNow(product: any) {
    console.log('Buying product:', product);
    this.router.navigate(['/checkout'], {
      queryParams: {
        productId: product._id,
        source: 'feed'
      }
    });
  }
}
