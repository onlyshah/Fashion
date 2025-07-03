import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SocialInteractionResponse {
  success: boolean;
  message: string;
  isLiked?: boolean;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
}

export interface Comment {
  _id: string;
  user: {
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
  };
  text: string;
  likes: string[];
  replies: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ShareData {
  platform: 'facebook' | 'twitter' | 'instagram' | 'whatsapp' | 'email' | 'copy_link';
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocialInteractionsService {
  private API_URL = 'http://10.0.2.2:5000/api'; // Direct IP for testing
  
  // Track liked items to update UI immediately
  private likedProductsSubject = new BehaviorSubject<Set<string>>(new Set());
  private likedPostsSubject = new BehaviorSubject<Set<string>>(new Set());
  
  public likedProducts$ = this.likedProductsSubject.asObservable();
  public likedPosts$ = this.likedPostsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserLikes();
  }

  // ==================== PRODUCT SOCIAL INTERACTIONS ====================

  /**
   * Like or unlike a product
   */
  async likeProduct(productId: string): Promise<SocialInteractionResponse> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await this.http.post<SocialInteractionResponse>(
        `${this.API_URL}/v1/ecommerce/products/${productId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      ).toPromise();

      if (response?.success) {
        // Update local state
        const currentLiked = this.likedProductsSubject.value;
        if (response.isLiked) {
          currentLiked.add(productId);
        } else {
          currentLiked.delete(productId);
        }
        this.likedProductsSubject.next(new Set(currentLiked));
      }

      return response || { success: false, message: 'Unknown error' };
    } catch (error) {
      console.error('Error liking product:', error);
      return { success: false, message: 'Failed to like product' };
    }
  }

  /**
   * Share a product
   */
  async shareProduct(productId: string, shareData: ShareData): Promise<SocialInteractionResponse> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await this.http.post<SocialInteractionResponse>(
        `${this.API_URL}/v1/ecommerce/products/${productId}/share`,
        shareData,
        { headers: { Authorization: `Bearer ${token}` } }
      ).toPromise();

      return response || { success: false, message: 'Unknown error' };
    } catch (error) {
      console.error('Error sharing product:', error);
      return { success: false, message: 'Failed to share product' };
    }
  }

  /**
   * Add comment to product
   */
  async commentOnProduct(productId: string, text: string, rating: number): Promise<SocialInteractionResponse> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await this.http.post<SocialInteractionResponse>(
        `${this.API_URL}/v1/product-comments`,
        { product: productId, text, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      ).toPromise();

      return response || { success: false, message: 'Unknown error' };
    } catch (error) {
      console.error('Error commenting on product:', error);
      return { success: false, message: 'Failed to add comment' };
    }
  }

  /**
   * Get product comments
   */
  async getProductComments(productId: string, page: number = 1, limit: number = 10): Promise<{ comments: Comment[], total: number }> {
    try {
      const response = await this.http.get<any>(
        `${this.API_URL}/v1/product-comments?product=${productId}&page=${page}&limit=${limit}`
      ).toPromise();

      return {
        comments: response?.data?.comments || [],
        total: response?.data?.total || 0
      };
    } catch (error) {
      console.error('Error fetching product comments:', error);
      return { comments: [], total: 0 };
    }
  }

  // ==================== POST SOCIAL INTERACTIONS ====================

  /**
   * Like or unlike a post
   */
  async likePost(postId: string): Promise<SocialInteractionResponse> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await this.http.post<SocialInteractionResponse>(
        `${this.API_URL}/v1/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      ).toPromise();

      if (response?.success) {
        // Update local state
        const currentLiked = this.likedPostsSubject.value;
        if (response.isLiked) {
          currentLiked.add(postId);
        } else {
          currentLiked.delete(postId);
        }
        this.likedPostsSubject.next(new Set(currentLiked));
      }

      return response || { success: false, message: 'Unknown error' };
    } catch (error) {
      console.error('Error liking post:', error);
      return { success: false, message: 'Failed to like post' };
    }
  }

  /**
   * Share a post
   */
  async sharePost(postId: string, shareData: ShareData): Promise<SocialInteractionResponse> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await this.http.post<SocialInteractionResponse>(
        `${this.API_URL}/v1/posts/${postId}/share`,
        shareData,
        { headers: { Authorization: `Bearer ${token}` } }
      ).toPromise();

      return response || { success: false, message: 'Unknown error' };
    } catch (error) {
      console.error('Error sharing post:', error);
      return { success: false, message: 'Failed to share post' };
    }
  }

  /**
   * Add comment to post
   */
  async commentOnPost(postId: string, text: string): Promise<SocialInteractionResponse> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await this.http.post<SocialInteractionResponse>(
        `${this.API_URL}/v1/posts/${postId}/comment`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      ).toPromise();

      return response || { success: false, message: 'Unknown error' };
    } catch (error) {
      console.error('Error commenting on post:', error);
      return { success: false, message: 'Failed to add comment' };
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Check if user has liked a product
   */
  isProductLiked(productId: string): boolean {
    return this.likedProductsSubject.value.has(productId);
  }

  /**
   * Check if user has liked a post
   */
  isPostLiked(postId: string): boolean {
    return this.likedPostsSubject.value.has(postId);
  }

  /**
   * Load user's liked items on service initialization
   */
  private async loadUserLikes(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Load liked products
      const productsResponse = await this.http.get<any>(
        `${this.API_URL}/v1/user/liked-products`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).toPromise();

      if (productsResponse?.success) {
        const likedProductIds = new Set<string>(productsResponse.data.map((item: any) => item._id));
        this.likedProductsSubject.next(likedProductIds);
      }

      // Load liked posts
      const postsResponse = await this.http.get<any>(
        `${this.API_URL}/v1/user/liked-posts`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).toPromise();

      if (postsResponse?.success) {
        const likedPostIds = new Set<string>(postsResponse.data.map((item: any) => item._id));
        this.likedPostsSubject.next(likedPostIds);
      }
    } catch (error) {
      console.error('Error loading user likes:', error);
    }
  }

  /**
   * Clear user data on logout
   */
  clearUserData(): void {
    this.likedProductsSubject.next(new Set());
    this.likedPostsSubject.next(new Set());
  }

  /**
   * Generate share URL for different platforms
   */
  generateShareUrl(platform: string, url: string, text: string): string {
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);

    switch (platform) {
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      case 'twitter':
        return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
      case 'whatsapp':
        return `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
      case 'email':
        return `mailto:?subject=${encodedText}&body=${encodedUrl}`;
      default:
        return url;
    }
  }
}
