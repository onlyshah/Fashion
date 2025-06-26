import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-vendor-posts',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="vendor-posts-container">
      <div class="header">
        <h1>My Posts</h1>
        <a routerLink="/vendor/posts/create" class="btn-primary">
          <i class="fas fa-plus"></i> Create Post
        </a>
      </div>

      <!-- Posts Grid -->
      <div class="posts-grid" *ngIf="posts.length > 0">
        <div class="post-card" *ngFor="let post of posts">
          <div class="post-media">
            <img [src]="getMediaUrl(post.media[0])" [alt]="post.caption">
            <div class="media-count" *ngIf="post.media.length > 1">
              <i class="fas fa-images"></i> {{ post.media.length }}
            </div>
          </div>
          
          <div class="post-content">
            <p class="post-caption">{{ post.caption | slice:0:100 }}{{ post.caption.length > 100 ? '...' : '' }}</p>
            
            <div class="post-stats">
              <span><i class="fas fa-heart"></i> {{ post.likes || 0 }}</span>
              <span><i class="fas fa-comment"></i> {{ post.comments || 0 }}</span>
              <span><i class="fas fa-share"></i> {{ post.shares || 0 }}</span>
              <span><i class="fas fa-eye"></i> {{ post.views || 0 }}</span>
            </div>

            <div class="post-products" *ngIf="post.taggedProducts && post.taggedProducts.length > 0">
              <h4>Tagged Products:</h4>
              <div class="tagged-products">
                <span class="product-tag" *ngFor="let product of post.taggedProducts">
                  {{ product.name }}
                </span>
              </div>
            </div>

            <div class="post-meta">
              <span class="post-date">{{ post.createdAt | date:'short' }}</span>
              <span class="post-status" [class]="post.status">{{ post.status }}</span>
            </div>
          </div>
          
          <div class="post-actions">
            <button class="btn-edit" (click)="editPost(post)">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn-analytics" (click)="viewAnalytics(post)">
              <i class="fas fa-chart-bar"></i> Analytics
            </button>
            <button class="btn-delete" (click)="deletePost(post)">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="posts.length === 0">
        <div class="empty-content">
          <i class="fas fa-camera"></i>
          <h2>No posts yet</h2>
          <p>Start sharing your products with engaging posts</p>
          <a routerLink="/vendor/posts/create" class="btn-primary">Create Your First Post</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .vendor-posts-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .header h1 {
      font-size: 2rem;
      font-weight: 600;
    }

    .posts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    .post-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }

    .post-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .post-media {
      position: relative;
      height: 250px;
      overflow: hidden;
    }

    .post-media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .media-count {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
    }

    .post-content {
      padding: 16px;
    }

    .post-caption {
      font-size: 0.95rem;
      line-height: 1.4;
      margin-bottom: 12px;
      color: #333;
    }

    .post-stats {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
      font-size: 0.85rem;
      color: #666;
    }

    .post-stats span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .post-products {
      margin-bottom: 12px;
    }

    .post-products h4 {
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 6px;
      color: #333;
    }

    .tagged-products {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .product-tag {
      background: #f0f8ff;
      color: #007bff;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .post-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      color: #666;
    }

    .post-status {
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .post-status.published {
      background: #d4edda;
      color: #155724;
    }

    .post-status.draft {
      background: #fff3cd;
      color: #856404;
    }

    .post-actions {
      display: flex;
      gap: 8px;
      padding: 16px;
      border-top: 1px solid #f0f0f0;
    }

    .btn-edit, .btn-analytics, .btn-delete {
      flex: 1;
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-edit {
      background: #f8f9fa;
      color: #495057;
    }

    .btn-edit:hover {
      background: #e9ecef;
    }

    .btn-analytics {
      background: #e7f3ff;
      color: #007bff;
    }

    .btn-analytics:hover {
      background: #cce7ff;
    }

    .btn-delete {
      background: #fee;
      color: #dc3545;
    }

    .btn-delete:hover {
      background: #fdd;
    }

    .btn-primary {
      background: #007bff;
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: background 0.2s;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }

    .empty-content i {
      font-size: 4rem;
      color: #ddd;
      margin-bottom: 20px;
    }

    .empty-content h2 {
      font-size: 1.5rem;
      margin-bottom: 10px;
    }

    .empty-content p {
      color: #666;
      margin-bottom: 30px;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .posts-grid {
        grid-template-columns: 1fr;
      }

      .post-actions {
        flex-direction: column;
      }
    }
  `]
})
export class VendorPostsComponent implements OnInit {
  posts: any[] = [];

  constructor() {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    // Load vendor posts from API
    this.posts = [];
  }

  getMediaUrl(media: any): string {
    if (typeof media === 'string') {
      return media;
    }
    return media?.url || '/assets/images/placeholder.jpg';
  }

  editPost(post: any) {
    // TODO: Navigate to edit post page
    console.log('Edit post:', post);
  }

  viewAnalytics(post: any) {
    // TODO: Show post analytics
    console.log('View analytics for post:', post);
  }

  deletePost(post: any) {
    if (confirm('Are you sure you want to delete this post?')) {
      // TODO: Implement delete API call
      this.posts = this.posts.filter(p => p._id !== post._id);
    }
  }
}
