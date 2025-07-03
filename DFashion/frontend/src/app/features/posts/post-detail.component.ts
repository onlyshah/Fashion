import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { environment } from '../../../environments/environment';

interface Post {
  _id: string;
  user: {
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
    isVerified?: boolean;
  };
  caption: string;
  media: {
    type: 'image' | 'video';
    url: string;
    alt: string;
  }[];
  products: {
    _id: string;
    product: {
      _id: string;
      name: string;
      price: number;
      originalPrice?: number;
      images: { url: string; alt: string }[];
      brand: string;
    };
    position: { x: number; y: number };
  }[];
  hashtags: string[];
  likes: { user: string; likedAt: Date }[];
  comments: {
    _id: string;
    user: {
      _id: string;
      username: string;
      fullName: string;
      avatar?: string;
    };
    text: string;
    commentedAt: Date;
  }[];
  shares: { user: string; sharedAt: Date }[];
  saves: { user: string; savedAt: Date }[];
  isLiked: boolean;
  isSaved: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-detail.component.html',
  styles: [`
    .post-detail-container {
      max-width: 600px;
      margin: 0 auto;
      background: #fff;
      min-height: 100vh;
    }

    .detail-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #eee;
      position: sticky;
      top: 0;
      background: #fff;
      z-index: 100;
    }

    .detail-header h1 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
    }

    .btn-back, .btn-menu {
      background: none;
      border: none;
      font-size: 1.2rem;
      color: #333;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
    }

    .btn-back:hover, .btn-menu:hover {
      background: #f8f9fa;
    }

    .post-detail-content {
      padding: 0;
    }

    .post-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .username-row {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .username {
      font-weight: 600;
      color: #333;
      font-size: 0.9rem;
    }

    .verified {
      color: #1da1f2;
      font-size: 0.8rem;
    }

    .post-time {
      font-size: 0.8rem;
      color: #666;
    }

    .btn-follow {
      background: #007bff;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
    }

    .btn-follow:hover {
      background: #0056b3;
    }

    .post-media {
      position: relative;
      background: #000;
    }

    .media-container {
      width: 100%;
      aspect-ratio: 1;
      overflow: hidden;
    }

    .post-image, .post-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-tags {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .product-tag {
      position: absolute;
      pointer-events: all;
      cursor: pointer;
      transform: translate(-50%, -50%);
    }

    .product-tag-icon {
      width: 32px;
      height: 32px;
      background: rgba(255,255,255,0.9);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #333;
      animation: pulse 2s infinite;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    @keyframes pulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); }
      50% { transform: translate(-50%, -50%) scale(1.1); }
    }

    .post-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      border-bottom: 1px solid #f0f0f0;
    }

    .primary-actions {
      display: flex;
      gap: 20px;
    }

    .action-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      color: #333;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      background: #f8f9fa;
    }

    .action-btn.liked {
      color: #ff6b6b;
    }

    .action-btn.saved {
      color: #333;
    }

    .action-btn span {
      font-size: 0.9rem;
      font-weight: 500;
    }

    .post-caption {
      padding: 16px 20px;
      line-height: 1.4;
      border-bottom: 1px solid #f0f0f0;
    }

    .caption-text {
      margin-left: 8px;
      color: #333;
    }

    .hashtags {
      margin-top: 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .hashtag {
      color: #1da1f2;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .hashtag:hover {
      text-decoration: underline;
    }

    .ecommerce-actions {
      display: flex;
      gap: 8px;
      padding: 16px 20px;
      border-bottom: 1px solid #f0f0f0;
    }

    .ecom-btn {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s ease;
    }

    .buy-now {
      background: #ff6b6b;
      color: #fff;
    }

    .add-cart {
      background: #4ecdc4;
      color: #fff;
    }

    .wishlist {
      background: #ff9ff3;
      color: #fff;
    }

    .ecom-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .comments-section {
      padding: 20px;
    }

    .comments-section h3 {
      margin: 0 0 16px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
    }

    .comments-list {
      margin-bottom: 20px;
    }

    .comment {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    .comment-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
    }

    .comment-content {
      flex: 1;
    }

    .comment-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .comment-username {
      font-weight: 600;
      color: #333;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .comment-username:hover {
      text-decoration: underline;
    }

    .comment-time {
      font-size: 0.8rem;
      color: #666;
    }

    .comment-text {
      margin: 0;
      color: #333;
      line-height: 1.4;
      font-size: 0.9rem;
    }

    .add-comment {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
    }

    .comment-input {
      flex: 1;
      border: 1px solid #ddd;
      border-radius: 20px;
      padding: 8px 16px;
      font-size: 0.9rem;
      outline: none;
    }

    .comment-input:focus {
      border-color: #007bff;
    }

    .btn-post-comment {
      background: #007bff;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 500;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .btn-post-comment:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .btn-post-comment:hover:not(:disabled) {
      background: #0056b3;
    }

    /* Product Modal */
    .product-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.8);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .modal-content {
      background: #fff;
      border-radius: 12px;
      max-width: 400px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #eee;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: #666;
      padding: 4px;
    }

    .modal-body {
      padding: 20px;
    }

    .product-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .product-info {
      margin-bottom: 20px;
    }

    .brand {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 8px;
    }

    .price {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .current-price {
      font-size: 1.2rem;
      font-weight: 700;
      color: #333;
    }

    .original-price {
      font-size: 0.9rem;
      color: #999;
      text-decoration: line-through;
    }

    .modal-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .btn-primary, .btn-secondary, .btn-outline {
      padding: 12px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: #007bff;
      color: #fff;
    }

    .btn-secondary {
      background: #6c757d;
      color: #fff;
    }

    .btn-outline {
      background: transparent;
      color: #007bff;
      border: 1px solid #007bff;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .post-detail-container {
        margin: 0;
      }

      .detail-header {
        padding: 12px 16px;
      }

      .post-header {
        padding: 12px 16px;
      }

      .post-actions {
        padding: 8px 16px;
      }

      .post-caption {
        padding: 12px 16px;
      }

      .ecommerce-actions {
        padding: 12px 16px;
        flex-direction: column;
        gap: 8px;
      }

      .comments-section {
        padding: 16px;
      }
    }
  `]
})
export class PostDetailComponent implements OnInit {
  post: Post | null = null;
  selectedProduct: any = null;
  newComment = '';
  currentUser: any = null;
  isOwnPost = false;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadPost(params['id']);
      }
    });
  }

  loadCurrentUser() {
    // TODO: Get from auth service
    this.currentUser = {
      _id: 'current-user',
      username: 'you',
      fullName: 'Your Name',
      avatar: ''
    };
  }

  loadPost(postId: string) {
    this.loading = true;
    
    // Load post from real API
    fetch(`http://10.0.2.2:5000/api/posts/${postId}`) // Direct IP for testing
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          this.post = {
            ...data.post,
            isLiked: false, // TODO: Check if current user liked this post
            isSaved: false  // TODO: Check if current user saved this post
          };
          this.isOwnPost = this.post?.user?._id === this.currentUser?._id;
        }
        this.loading = false;
      })
      .catch(error => {
        console.error('Error loading post:', error);
        this.loading = false;
      });
  }

  goBack() {
    this.router.navigate(['/social']);
  }

  showMenu() {
    // TODO: Show post menu
    console.log('Show post menu');
  }

  viewProfile(userId: string) {
    this.router.navigate(['/profile', userId]);
  }

  toggleLike() {
    if (!this.post) return;
    
    this.post.isLiked = !this.post.isLiked;
    
    if (this.post.isLiked) {
      this.post.likes.push({
        user: this.currentUser._id,
        likedAt: new Date()
      });
    } else {
      this.post.likes = this.post.likes.filter(like => like.user !== this.currentUser._id);
    }
    
    // TODO: Update like status via API
    console.log('Toggle like for post:', this.post._id, this.post.isLiked);
  }

  toggleSave() {
    if (!this.post) return;
    
    this.post.isSaved = !this.post.isSaved;
    
    if (this.post.isSaved) {
      this.post.saves.push({
        user: this.currentUser._id,
        savedAt: new Date()
      });
    } else {
      this.post.saves = this.post.saves.filter(save => save.user !== this.currentUser._id);
    }
    
    // TODO: Update save status via API
    console.log('Toggle save for post:', this.post._id, this.post.isSaved);
  }

  sharePost() {
    if (!this.post) return;
    
    // TODO: Implement share functionality
    console.log('Share post:', this.post);
    
    if (navigator.share) {
      navigator.share({
        title: `${this.post.user.username}'s post`,
        text: this.post.caption,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }

  focusCommentInput() {
    const commentInput = document.querySelector('.comment-input') as HTMLInputElement;
    if (commentInput) {
      commentInput.focus();
    }
  }

  addComment() {
    if (!this.post || !this.newComment?.trim()) return;

    const newComment = {
      _id: Date.now().toString(),
      user: {
        _id: this.currentUser._id,
        username: this.currentUser.username,
        fullName: this.currentUser.fullName,
        avatar: this.currentUser.avatar
      },
      text: this.newComment.trim(),
      commentedAt: new Date()
    };

    this.post.comments.push(newComment);
    this.newComment = '';

    // TODO: Add comment via API
    console.log('Add comment to post:', this.post._id, newComment);
  }

  searchHashtag(hashtag: string) {
    this.router.navigate(['/search'], { queryParams: { hashtag } });
  }

  // E-commerce actions
  buyNow() {
    if (this.post && this.post.products.length > 0) {
      const product = this.post.products[0].product;
      this.router.navigate(['/checkout'], { 
        queryParams: { productId: product._id, source: 'post' } 
      });
    }
  }

  addToCart() {
    if (this.post && this.post.products.length > 0) {
      const product = this.post.products[0].product;
      console.log('Add to cart from post:', product);

      this.cartService.addToCart(product._id, 1, undefined, undefined).subscribe({
        next: (response) => {
          if (response.success) {
            alert(`${product.name} added to cart!`);
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
  }

  addToWishlist() {
    if (this.post && this.post.products.length > 0) {
      const product = this.post.products[0].product;
      console.log('Add to wishlist from post:', product);

      this.wishlistService.addToWishlist(product._id).subscribe({
        next: (response) => {
          if (response.success) {
            alert(`${product.name} added to wishlist!`);
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
  }

  // Product modal
  showProductDetails(product: any) {
    this.selectedProduct = product;
  }

  closeProductModal() {
    this.selectedProduct = null;
  }

  buyProductNow() {
    if (this.selectedProduct) {
      this.router.navigate(['/checkout'], { 
        queryParams: { productId: this.selectedProduct._id, source: 'post' } 
      });
    }
  }

  addProductToCart() {
    if (this.selectedProduct) {
      console.log('Add product to cart:', this.selectedProduct);

      this.cartService.addToCart(this.selectedProduct._id, 1, undefined, undefined).subscribe({
        next: (response) => {
          if (response.success) {
            alert(`${this.selectedProduct.name} added to cart!`);
            this.closeProductModal();
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
  }

  addProductToWishlist() {
    if (this.selectedProduct) {
      // TODO: Add to wishlist via service
      console.log('Add product to wishlist:', this.selectedProduct);
      alert(`${this.selectedProduct.name} added to wishlist!`);
      this.closeProductModal();
    }
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return new Date(date).toLocaleDateString();
  }
}
