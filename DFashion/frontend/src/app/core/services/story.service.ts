import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Story, StoriesResponse, CreateStoryRequest, StoryGroup } from '../models/story.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  private readonly API_URL = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getStories(page: number = 1, limit: number = 20): Observable<StoriesResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<StoriesResponse>(`${this.API_URL}/stories`, { params });
  }

  getUserStories(userId: string): Observable<{ stories: Story[] }> {
    return this.http.get<{ stories: Story[] }>(`${this.API_URL}/stories/user/${userId}`);
  }



  createStory(storyData: CreateStoryRequest): Observable<{ message: string; story: Story }> {
    return this.http.post<{ message: string; story: Story }>(`${this.API_URL}/stories`, storyData);
  }

  viewStory(storyId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/stories/${storyId}/view`, {});
  }

  likeStory(storyId: string): Observable<{ message: string; likesCount: number }> {
    return this.http.post<{ message: string; likesCount: number }>(`${this.API_URL}/stories/${storyId}/like`, {});
  }

  shareStory(storyId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/stories/${storyId}/share`, {});
  }

  deleteStory(storyId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/stories/${storyId}`);
  }

  getStoryViewers(storyId: string): Observable<{ viewers: any[] }> {
    return this.http.get<{ viewers: any[] }>(`${this.API_URL}/stories/${storyId}/viewers`);
  }
}
