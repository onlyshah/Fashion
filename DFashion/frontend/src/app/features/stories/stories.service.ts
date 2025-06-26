import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Story {
  _id: string;
  user: {
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
  };
  media: {
    type: 'image' | 'video';
    url: string;
    duration: number;
    thumbnail?: string;
  };
  caption?: string;
  products: {
    _id: string;
    product: any;
    position: { x: number; y: number };
  }[];
  viewers: { user: string; viewedAt: Date }[];
  likes: { user: string; likedAt: Date }[];
  comments: {
    _id: string;
    user: any;
    text: string;
    commentedAt: Date;
  }[];
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  analytics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

export interface StoryGroup {
  user: {
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
  };
  stories: Story[];
  totalStories: number;
  hasUnviewed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StoriesService {
  private apiUrl = 'http://localhost:5000/api';
  private storiesSubject = new BehaviorSubject<Story[]>([]);
  private currentStorySubject = new BehaviorSubject<Story | null>(null);

  public stories$ = this.storiesSubject.asObservable();
  public currentStory$ = this.currentStorySubject.asObservable();

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private getAuthHeadersForUpload(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type for FormData uploads
    });
  }

  // Get all active stories
  getStories(): Observable<Story[]> {
    return this.http.get<any>(`${this.apiUrl}/stories`).pipe(
      map(response => {
        if (response.success) {
          const stories = response.stories.filter((story: Story) => story.isActive);
          this.storiesSubject.next(stories);
          return stories;
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  // Get stories by user ID
  getUserStories(userId: string): Observable<Story[]> {
    return this.http.get<any>(`${this.apiUrl}/stories/user/${userId}`).pipe(
      map(response => {
        if (response.success) {
          return response.stories.filter((story: Story) => story.isActive);
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  // Get story groups for grid view
  getStoryGroups(): Observable<StoryGroup[]> {
    return this.http.get<any>(`${this.apiUrl}/stories/groups`).pipe(
      map(response => {
        if (response.success) {
          return response.groups;
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  // Get story previews for list view
  getStoryPreviews(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/stories/preview`).pipe(
      map(response => {
        if (response.success) {
          return response.stories;
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  // Create a new story
  createStory(storyData: FormData): Observable<Story> {
    return this.http.post<any>(`${this.apiUrl}/stories`, storyData, {
      headers: this.getAuthHeadersForUpload()
    }).pipe(
      map(response => {
        if (response.success) {
          // Update local stories list
          const currentStories = this.storiesSubject.value;
          this.storiesSubject.next([response.story, ...currentStories]);
          return response.story;
        }
        throw new Error(response.message || 'Failed to create story');
      }),
      catchError(this.handleError)
    );
  }

  // Delete a story
  deleteStory(storyId: string): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/stories/${storyId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          // Remove from local stories list
          const currentStories = this.storiesSubject.value;
          const updatedStories = currentStories.filter(story => story._id !== storyId);
          this.storiesSubject.next(updatedStories);
          return true;
        }
        return false;
      }),
      catchError(this.handleError)
    );
  }

  // View a story (mark as viewed)
  viewStory(storyId: string): Observable<boolean> {
    return this.http.post<any>(`${this.apiUrl}/stories/${storyId}/view`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.success),
      catchError(this.handleError)
    );
  }

  // Like a story
  likeStory(storyId: string): Observable<boolean> {
    return this.http.post<any>(`${this.apiUrl}/stories/${storyId}/like`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          this.updateStoryInList(storyId, { isLiked: true });
          return true;
        }
        return false;
      }),
      catchError(this.handleError)
    );
  }

  // Unlike a story
  unlikeStory(storyId: string): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/stories/${storyId}/like`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          this.updateStoryInList(storyId, { isLiked: false });
          return true;
        }
        return false;
      }),
      catchError(this.handleError)
    );
  }

  // Comment on a story
  commentOnStory(storyId: string, comment: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/stories/${storyId}/comment`, 
      { text: comment }, 
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => {
        if (response.success) {
          return response.comment;
        }
        throw new Error(response.message || 'Failed to add comment');
      }),
      catchError(this.handleError)
    );
  }

  // Get story comments
  getStoryComments(storyId: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/stories/${storyId}/comments`).pipe(
      map(response => {
        if (response.success) {
          return response.comments;
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  // Share a story
  shareStory(storyId: string, platform?: string): Observable<boolean> {
    return this.http.post<any>(`${this.apiUrl}/stories/${storyId}/share`, 
      { platform }, 
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => response.success),
      catchError(this.handleError)
    );
  }

  // Search products for tagging
  searchProducts(query: string, limit: number = 20): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/products/search`, {
      params: { q: query, limit: limit.toString() }
    }).pipe(
      map(response => {
        if (response.success) {
          return response.products;
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  // Tag a product in a story
  tagProduct(storyId: string, productId: string, position: {x: number, y: number}): Observable<boolean> {
    return this.http.post<any>(`${this.apiUrl}/stories/${storyId}/tag-product`, 
      { productId, position }, 
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => response.success),
      catchError(this.handleError)
    );
  }

  // Remove product tag from story
  removeProductTag(storyId: string, tagId: string): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/stories/${storyId}/tag/${tagId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.success),
      catchError(this.handleError)
    );
  }

  // Get story analytics
  getStoryAnalytics(storyId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stories/${storyId}/analytics`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        if (response.success) {
          return response.analytics;
        }
        return null;
      }),
      catchError(this.handleError)
    );
  }

  // Set current story
  setCurrentStory(story: Story | null): void {
    this.currentStorySubject.next(story);
  }

  // Get current story
  getCurrentStory(): Story | null {
    return this.currentStorySubject.value;
  }

  // Update story in local list
  private updateStoryInList(storyId: string, updates: Partial<Story>): void {
    const currentStories = this.storiesSubject.value;
    const updatedStories = currentStories.map(story => 
      story._id === storyId ? { ...story, ...updates } : story
    );
    this.storiesSubject.next(updatedStories);
  }

  // Error handler
  private handleError = (error: any) => {
    console.error('Stories service error:', error);
    let errorMessage = 'An error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  };

  // Utility methods
  isStoryExpired(story: Story): boolean {
    return new Date() > new Date(story.expiresAt);
  }

  getTimeRemaining(story: Story): number {
    const now = new Date().getTime();
    const expiry = new Date(story.expiresAt).getTime();
    return Math.max(0, expiry - now);
  }

  formatDuration(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}
