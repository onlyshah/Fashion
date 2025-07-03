import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export interface SocialUser {
  _id: string;
  username: string;
  fullName: string;
  avatar: string;
  socialStats: {
    followersCount: number;
    followingCount: number;
    postsCount: number;
  };
  isFollowing?: boolean;
}

export interface SocialInteraction {
  success: boolean;
  message: string;
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
  likesCount?: number;
  savesCount?: number;
  sharesCount?: number;
  followersCount?: number;
  followingCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SocialFeaturesService {
  private apiUrl = 'http://10.0.2.2:5000/api/api/v1'; // Direct IP for testing
  
  // Subjects for real-time updates
  private followingUpdatesSubject = new BehaviorSubject<any>(null);
  public followingUpdates$ = this.followingUpdatesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // ==================== POST INTERACTIONS ====================

  /**
   * Toggle like on a post (handles both like and unlike)
   */
  togglePostLike(postId: string): Observable<SocialInteraction> {
    if (!this.authService.isAuthenticated) {
      throw new Error('Authentication required');
    }

    return this.http.post<SocialInteraction>(`${this.apiUrl}/posts/${postId}/like`, {}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.showMessage(response.message);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Toggle save on a post (handles both save and unsave)
   */
  togglePostSave(postId: string): Observable<SocialInteraction> {
    if (!this.authService.isAuthenticated) {
      throw new Error('Authentication required');
    }

    return this.http.post<SocialInteraction>(`${this.apiUrl}/posts/${postId}/save`, {}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.showMessage(response.message);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Share a post
   */
  sharePost(postId: string): Observable<SocialInteraction> {
    if (!this.authService.isAuthenticated) {
      throw new Error('Authentication required');
    }

    return this.http.post<SocialInteraction>(`${this.apiUrl}/posts/${postId}/share`, {}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.showMessage(response.message);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Add comment to a post
   */
  addPostComment(postId: string, text: string): Observable<any> {
    if (!this.authService.isAuthenticated) {
      throw new Error('Authentication required');
    }

    return this.http.post<any>(`${this.apiUrl}/posts/${postId}/comment`, { text }, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.showMessage('Comment added successfully');
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get post comments with pagination
   */
  getPostComments(postId: string, page: number = 1, limit: number = 20): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/posts/${postId}/comments`, {
      params: { page: page.toString(), limit: limit.toString() }
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ==================== STORY INTERACTIONS ====================

  /**
   * Toggle like on a story
   */
  toggleStoryLike(storyId: string): Observable<SocialInteraction> {
    if (!this.authService.isAuthenticated) {
      throw new Error('Authentication required');
    }

    return this.http.post<SocialInteraction>(`${this.apiUrl}/stories/${storyId}/like`, {}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.showMessage(response.message);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Share a story
   */
  shareStory(storyId: string): Observable<SocialInteraction> {
    if (!this.authService.isAuthenticated) {
      throw new Error('Authentication required');
    }

    return this.http.post<SocialInteraction>(`${this.apiUrl}/stories/${storyId}/share`, {}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.showMessage(response.message);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Add comment to a story
   */
  addStoryComment(storyId: string, text: string): Observable<any> {
    if (!this.authService.isAuthenticated) {
      throw new Error('Authentication required');
    }

    return this.http.post<any>(`${this.apiUrl}/stories/${storyId}/comment`, { text }, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.showMessage('Comment added successfully');
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get story comments with pagination
   */
  getStoryComments(storyId: string, page: number = 1, limit: number = 20): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stories/${storyId}/comments`, {
      params: { page: page.toString(), limit: limit.toString() }
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ==================== USER FOLLOW SYSTEM ====================

  /**
   * Toggle follow status for a user
   */
  toggleUserFollow(userId: string): Observable<SocialInteraction> {
    if (!this.authService.isAuthenticated) {
      throw new Error('Authentication required');
    }

    return this.http.post<SocialInteraction>(`${this.apiUrl}/users/follow/${userId}`, {}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.showMessage(response.message);
          this.followingUpdatesSubject.next({ userId, isFollowing: response.isFollowing });
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get user's followers
   */
  getUserFollowers(userId: string, page: number = 1, limit: number = 20): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${userId}/followers`, {
      params: { page: page.toString(), limit: limit.toString() }
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get user's following
   */
  getUserFollowing(userId: string, page: number = 1, limit: number = 20): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${userId}/following`, {
      params: { page: page.toString(), limit: limit.toString() }
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Check follow status between current user and target user
   */
  getFollowStatus(userId: string): Observable<any> {
    if (!this.authService.isAuthenticated) {
      return new Observable(observer => {
        observer.next({ success: true, isFollowing: false, isSelf: false });
        observer.complete();
      });
    }

    return this.http.get<any>(`${this.apiUrl}/users/${userId}/follow-status`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ==================== ANALYTICS ====================

  /**
   * Track product click from social content
   */
  trackProductClick(contentType: 'post' | 'story', contentId: string, productId: string, action: string): Observable<any> {
    const endpoint = contentType === 'post' ? 'posts' : 'stories';
    
    return this.http.post<any>(`${this.apiUrl}/${endpoint}/${contentId}/analytics/product-click`, {
      productId,
      action
    }, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ==================== UTILITY METHODS ====================

  private handleError = (error: any): Observable<never> => {
    console.error('Social features service error:', error);
    throw error;
  };

  private showMessage(message: string): void {
    // You can integrate with a toast/notification service here
    console.log('Social action:', message);
  }
}
