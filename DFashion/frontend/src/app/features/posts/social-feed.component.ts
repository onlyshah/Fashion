import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SocialMediaService } from '../../core/services/social-media.service';
import { SocialFeaturesService } from '../../core/services/social-features.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { Subscription } from 'rxjs';
import { ViewAddStoriesComponent, Story, CurrentUser } from '../home/components/view-add-stories/view-add-stories.component';

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
    size?: string;
    color?: string;
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
  analytics?: {
    likes: number;
    comments: number;
    saves: number;
    shares: number;
  };
}

@Component({
  selector: 'app-social-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewAddStoriesComponent],
  templateUrl: './social-feed.component.html',
  styles: [`
    .social-feed {
      max-width: 600px;
      margin: 0 auto;
      padding: 0 0 80px 0;
    }

    /* Stories Bar */
    .stories-bar {
      background: #fff;
      border-bottom: 1px solid #eee;
      padding: 16px 0;
      margin-bottom: 20px;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    /* Swiper Carousel Styles */
    .stories-swiper {
      padding: 0 20px;
      overflow: visible;
    }

    .story-slide {
      width: auto !important;
      flex-shrink: 0;
    }

    /* Legacy container styles (keeping for fallback) */
    .stories-container {
      display: flex;
      gap: 16px;
      padding: 0 20px;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .stories-container::-webkit-scrollbar {
      display: none;
    }

    .story-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      min-width: 70px;
    }

    .story-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      padding: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: transform 0.2s ease;
    }

    .story-avatar:hover {
      transform: scale(1.05);
    }

    .story-ring {
      position: absolute;
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
      border-radius: 50%;
      background: linear-gradient(45deg, #ff6b6b, #ffa726, #ff6b6b);
      z-index: -1;
      animation: rotate 3s linear infinite;
    }

    .story-ring.viewed {
      background: #ddd;
      animation: none;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .story-avatar img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .add-avatar {
      background: #f8f9fa !important;
      border-color: #ddd !important;
      color: #666;
      font-size: 1.2rem;
    }

    .story-username {
      font-size: 0.8rem;
      color: #333;
      text-align: center;
      max-width: 70px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Post Cards */
    .posts-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .post-card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
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
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
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
      cursor: pointer;
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

    .btn-menu {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
    }

    .btn-menu:hover {
      background: #f8f9fa;
    }

    /* Post Media */
    .post-media {
      position: relative;
      background: #000;
      cursor: pointer;
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

    .media-nav {
      position: absolute;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
    }

    .nav-dots {
      display: flex;
      gap: 6px;
    }

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255,255,255,0.5);
    }

    .dot.active {
      background: #fff;
    }

    /* Post Actions */
    .post-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px 8px;
    }

    .primary-actions, .secondary-actions {
      display: flex;
      gap: 16px;
    }

    .action-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      color: #333;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      background: #f8f9fa;
      transform: scale(1.1);
    }

    .action-btn.liked {
      color: #ff6b6b;
      animation: heartBeat 0.6s ease;
    }

    .action-btn.saved {
      color: #333;
    }

    @keyframes heartBeat {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }

    /* Post Stats */
    .post-stats {
      padding: 0 20px 8px;
    }

    .likes-count {
      font-size: 0.9rem;
      color: #333;
    }

    /* Post Caption */
    .post-caption {
      padding: 0 20px 12px;
      line-height: 1.4;
      cursor: pointer;
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

    /* E-commerce Actions */
    .ecommerce-actions {
      display: flex;
      gap: 8px;
      padding: 12px 20px;
      border-top: 1px solid #f0f0f0;
    }

    .ecom-btn {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.85rem;
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

    /* Comments */
    .comments-preview {
      padding: 0 20px 12px;
    }

    .view-all-comments {
      color: #666;
      font-size: 0.9rem;
      cursor: pointer;
      margin-bottom: 8px;
    }

    .view-all-comments:hover {
      text-decoration: underline;
    }

    .comment {
      margin-bottom: 4px;
      font-size: 0.9rem;
      line-height: 1.3;
    }

    .comment-username {
      font-weight: 600;
      color: #333;
      margin-right: 8px;
    }

    .comment-text {
      color: #333;
    }

    /* Add Comment */
    .add-comment {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      border-top: 1px solid #f0f0f0;
    }

    .comment-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }

    .comment-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 0.9rem;
      padding: 8px 0;
    }

    .comment-input::placeholder {
      color: #999;
    }

    .btn-post-comment {
      background: none;
      border: none;
      color: #1da1f2;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.9rem;
      padding: 8px;
    }

    .btn-post-comment:disabled {
      color: #ccc;
      cursor: not-allowed;
    }

    /* Load More */
    .load-more {
      text-align: center;
      padding: 40px 20px;
    }

    .btn-load-more {
      background: #007bff;
      color: #fff;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 auto;
    }

    .btn-load-more:disabled {
      background: #ccc;
      cursor: not-allowed;
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
      .social-feed {
        padding: 0 0 60px 0;
      }

      .stories-bar {
        padding: 12px 0;
      }

      .stories-swiper {
        padding: 0 16px;
      }

      .stories-container {
        padding: 0 16px;
        gap: 12px;
      }

      .story-avatar {
        width: 50px;
        height: 50px;
      }

      .story-ring {
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
      }

      .story-username {
        font-size: 0.75rem;
        max-width: 50px;
      }

      .post-header {
        padding: 12px 16px;
      }

      .post-actions {
        padding: 8px 16px 6px;
      }

      .post-stats, .post-caption, .comments-preview {
        padding-left: 16px;
        padding-right: 16px;
      }

      .ecommerce-actions {
        padding: 8px 16px;
        flex-direction: column;
        gap: 6px;
      }

      .ecom-btn {
        padding: 12px;
        font-size: 0.9rem;
      }

      .add-comment {
        padding: 8px 16px;
      }
    }
  `]
})
export class SocialFeedComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  stories: Story[] = [];
  commentTexts: { [key: string]: string } = {};
  selectedProduct: any = null;
  currentUser: CurrentUser | null = null;
  loading = false;
  hasMorePosts = true;

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private socialMediaService: SocialMediaService,
    private socialFeaturesService: SocialFeaturesService,
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadStories();
    this.loadPosts();

    // Add some mock stories for testing
    this.addMockStories();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadCurrentUser() {
    this.currentUser = this.authService.currentUserValue;
    if (!this.currentUser) {
      // Fallback for non-authenticated users
      this.currentUser = {
        _id: 'guest-user',
        username: 'guest',
        fullName: 'Guest User',
        avatar: '/assets/images/default-avatar.svg'
      };
    }
    console.log('Social Feed - Current User loaded:', this.currentUser);
  }

  loadStories() {
    this.subscriptions.push(
      this.socialMediaService.loadStories().subscribe({
        next: (response) => {
          if (response.success) {
            // Group stories by user
            const userStories = response.stories.reduce((acc: any, story: any) => {
              const userId = story.user._id;
              if (!acc[userId]) {
                acc[userId] = {
                  user: story.user,
                  viewed: false, // TODO: Check if current user viewed this user's stories
                  stories: []
                };
              }
              acc[userId].stories.push(story);
              return acc;
            }, {});

            this.stories = Object.values(userStories);
            console.log('Social Feed - Stories loaded:', this.stories);
          }
        },
        error: (error) => {
          console.error('Error loading stories:', error);
          // Set empty stories array so add story button still shows
          this.stories = [];
        }
      })
    );
  }

  loadPosts() {
    this.loading = true;

    this.subscriptions.push(
      this.socialMediaService.loadPosts(1, 10).subscribe({
        next: (response) => {
          if (response.success) {
            this.posts = response.posts.map((post: any) => ({
              ...post,
              isLiked: this.checkIfUserLiked(post.likes),
              isSaved: this.checkIfUserSaved(post.saves)
            }));
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading posts:', error);
          this.loading = false;
        }
      })
    );
  }

  private checkIfUserLiked(likes: any[]): boolean {
    if (!this.currentUser || !likes) return false;
    return likes.some(like => like.user === this.currentUser!._id);
  }

  private checkIfUserSaved(saves: any[]): boolean {
    if (!this.currentUser || !saves) return false;
    return saves.some(save => save.user === this.currentUser!._id);
  }

  loadMorePosts() {
    if (this.loading || !this.hasMorePosts) return;

    this.loading = true;
    const page = Math.floor(this.posts.length / 10) + 1;

    this.subscriptions.push(
      this.socialMediaService.loadPosts(page, 10).subscribe({
        next: (response) => {
          if (response.success && response.posts.length > 0) {
            const newPosts = response.posts.map((post: any) => ({
              ...post,
              isLiked: this.checkIfUserLiked(post.likes),
              isSaved: this.checkIfUserSaved(post.saves)
            }));
            this.posts = [...this.posts, ...newPosts];

            // Check if there are more posts
            this.hasMorePosts = response.posts.length === 10;
          } else {
            this.hasMorePosts = false;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading more posts:', error);
          this.loading = false;
        }
      })
    );
  }

  // Stories actions
  createStory() {
    this.router.navigate(['/create-story']);
  }

  viewStory(userId: string) {
    // Navigate to stories viewer with user ID
    console.log('Navigating to user stories:', userId);
    this.router.navigate(['/stories', userId]);
  }

  viewStories() {
    // Navigate to general stories viewer
    console.log('Navigating to all stories');
    this.router.navigate(['/stories']);
  }

  openStoryViewer(storyIndex: number = 0) {
    // Open stories viewer starting from specific index
    console.log('Opening story viewer at index:', storyIndex);
    this.router.navigate(['/stories'], {
      queryParams: { index: storyIndex }
    });
  }

  onStoryClick(event: {story: Story, index: number}) {
    // Handle story click from carousel
    this.openStoryViewer(event.index);
  }

  // Post actions
  viewProfile(userId: string) {
    this.router.navigate(['/profile', userId]);
  }

  showPostMenu(post: Post) {
    // TODO: Show post menu (report, share, etc.)
    console.log('Show menu for post:', post);
  }

  toggleLike(post: Post) {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const wasLiked = post.isLiked;

    // Optimistic update
    post.isLiked = !post.isLiked;
    const currentUser = this.authService.currentUserValue;
    if (post.isLiked) {
      post.likes.push({
        user: currentUser?._id || '',
        likedAt: new Date()
      });
    } else {
      post.likes = post.likes.filter(like => like.user !== currentUser?._id);
    }

    // API call using new social features service
    this.subscriptions.push(
      this.socialFeaturesService.togglePostLike(post._id).subscribe({
        next: (response) => {
          if (response.success) {
            post.isLiked = response.isLiked!;
            // Update likes count from server response
            if (response.likesCount !== undefined) {
              if (post.analytics) {
                post.analytics.likes = response.likesCount;
              }
            }
          }
        },
        error: (error) => {
          // Revert optimistic update on error
          const currentUser = this.authService.currentUserValue;
          post.isLiked = wasLiked;
          if (wasLiked) {
            post.likes.push({
              user: currentUser?._id || '',
              likedAt: new Date()
            });
          } else {
            post.likes = post.likes.filter(like => like.user !== currentUser?._id);
          }
          console.error('Error toggling like:', error);
        }
      })
    );
  }

  toggleSave(post: Post) {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const wasSaved = post.isSaved;

    // Optimistic update
    const currentUser = this.authService.currentUserValue;
    post.isSaved = !post.isSaved;
    if (post.isSaved) {
      post.saves.push({
        user: currentUser?._id || '',
        savedAt: new Date()
      });
    } else {
      post.saves = post.saves.filter(save => save.user !== currentUser?._id);
    }

    // API call using new social features service
    this.subscriptions.push(
      this.socialFeaturesService.togglePostSave(post._id).subscribe({
        next: (response) => {
          if (response.success) {
            post.isSaved = response.isSaved!;
            // Update saves count from server response
            if (response.savesCount !== undefined) {
              if (post.analytics) {
                post.analytics.saves = response.savesCount;
              }
            }
          }
        },
        error: (error) => {
          // Revert optimistic update on error
          const currentUser = this.authService.currentUserValue;
          post.isSaved = wasSaved;
          if (wasSaved) {
            post.saves.push({
              user: currentUser?._id || '',
              savedAt: new Date()
            });
          } else {
            post.saves = post.saves.filter(save => save.user !== currentUser?._id);
          }
          console.error('Error toggling save:', error);
        }
      })
    );
  }

  sharePost(post: Post) {
    // TODO: Implement share functionality
    console.log('Share post:', post);

    if (navigator.share) {
      navigator.share({
        title: `${post.user.username}'s post`,
        text: post.caption,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }

  focusComment(postId: string) {
    const commentInput = document.getElementById(`comment-${postId}`) as HTMLInputElement;
    if (commentInput) {
      commentInput.focus();
    }
  }

  addComment(post: Post) {
    const commentText = this.commentTexts[post._id];
    if (!commentText?.trim()) return;

    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const currentUser = this.authService.currentUserValue;
    const newComment = {
      _id: Date.now().toString(),
      user: {
        _id: currentUser?._id || '',
        username: currentUser?.username || '',
        fullName: currentUser?.fullName || '',
        avatar: currentUser?.avatar || ''
      },
      text: commentText.trim(),
      commentedAt: new Date()
    };

    // Optimistic update
    post.comments.push(newComment);
    this.commentTexts[post._id] = '';

    // API call using new social features service
    this.subscriptions.push(
      this.socialFeaturesService.addPostComment(post._id, commentText.trim()).subscribe({
        next: (response) => {
          if (response.success) {
            // Replace the optimistic comment with the server response
            const commentIndex = post.comments.findIndex(c => c._id === newComment._id);
            if (commentIndex !== -1) {
              post.comments[commentIndex] = response.comment;
            }
            if (post.analytics) {
              post.analytics.comments += 1;
            }
          }
        },
        error: (error) => {
          // Remove optimistic comment on error
          post.comments = post.comments.filter(c => c._id !== newComment._id);
          this.commentTexts[post._id] = commentText; // Restore comment text
          console.error('Error adding comment:', error);
        }
      })
    );
  }

  viewAllComments(post: Post) {
    this.router.navigate(['/post', post._id, 'comments']);
  }

  viewPost(post: Post) {
    // Navigate to post detail view
    this.router.navigate(['/post', post._id]);
  }

  viewPostDetail(postId: string) {
    // Navigate to post detail view by ID
    this.router.navigate(['/post', postId]);
  }

  searchHashtag(hashtag: string) {
    this.router.navigate(['/search'], { queryParams: { hashtag } });
  }

  // E-commerce actions
  buyNow(post: Post) {
    if (post.products.length > 0) {
      const product = post.products[0].product;
      this.router.navigate(['/checkout'], {
        queryParams: { productId: product._id, source: 'post' }
      });
    }
  }

  addToCart(post: Post) {
    if (post.products.length > 0) {
      const product = post.products[0].product;
      const size = post.products[0].size;
      const color = post.products[0].color;

      if (!this.authService.isAuthenticated) {
        this.router.navigate(['/auth/login']);
        return;
      }

      this.subscriptions.push(
        this.cartService.addToCart(product._id, 1, size, color).subscribe({
          next: (response) => {
            if (response.success) {
              // Track analytics using new service
              this.socialFeaturesService.trackProductClick('post', post._id, product._id, 'add_to_cart').subscribe();
              alert(`${product.name} added to cart!`);
            }
          },
          error: (error) => {
            console.error('Error adding to cart:', error);
            alert('Failed to add to cart. Please try again.');
          }
        })
      );
    }
  }

  addToWishlist(post: Post) {
    if (post.products.length > 0) {
      const product = post.products[0].product;
      const size = post.products[0].size;
      const color = post.products[0].color;

      if (!this.authService.isAuthenticated) {
        this.router.navigate(['/auth/login']);
        return;
      }

      this.subscriptions.push(
        this.wishlistService.addToWishlist(product._id).subscribe({
          next: (response) => {
            if (response.success) {
              // Track analytics using new service
              this.socialFeaturesService.trackProductClick('post', post._id, product._id, 'add_to_wishlist').subscribe();
              alert(`${product.name} added to wishlist!`);
            }
          },
          error: (error) => {
            console.error('Error adding to wishlist:', error);
            alert('Failed to add to wishlist. Please try again.');
          }
        })
      );
    }
  }

  viewProduct(post: Post, product: any) {
    // Track analytics
    this.trackProductClick(post._id, product._id, 'view_product');

    // Navigate to product detail page
    this.router.navigate(['/products', product._id]);
  }

  private trackProductClick(postId: string, productId: string, action: string) {
    // Track product click analytics using new service
    this.socialFeaturesService.trackProductClick('post', postId, productId, action).subscribe({
      next: (response) => {
        console.log('Analytics tracked:', response);
      },
      error: (error) => {
        console.error('Error tracking analytics:', error);
      }
    });
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
      // TODO: Add to cart via service
      console.log('Add product to cart:', this.selectedProduct);
      alert(`${this.selectedProduct.name} added to cart!`);
      this.closeProductModal();
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

  addMockStories() {
    // Removed mock stories - use real API data only
    this.stories = [];
    console.log('Mock stories removed - using real API data only');
  }

}