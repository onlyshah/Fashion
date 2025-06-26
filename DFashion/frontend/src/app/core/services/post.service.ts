import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Post, PostsResponse, CreatePostRequest } from '../models/post.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly API_URL = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getPosts(page: number = 1, limit: number = 10): Observable<PostsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PostsResponse>(`${this.API_URL}/posts`, { params });
  }

  getPost(id: string): Observable<{ post: Post }> {
    return this.http.get<{ post: Post }>(`${this.API_URL}/posts/${id}`);
  }

  createPost(postData: CreatePostRequest): Observable<{ message: string; post: Post }> {
    return this.http.post<{ message: string; post: Post }>(`${this.API_URL}/posts`, postData);
  }

  likePost(postId: string): Observable<{ message: string; likesCount: number }> {
    return this.http.post<{ message: string; likesCount: number }>(`${this.API_URL}/posts/${postId}/like`, {});
  }

  addComment(postId: string, text: string): Observable<{ message: string; comment: any }> {
    return this.http.post<{ message: string; comment: any }>(`${this.API_URL}/posts/${postId}/comment`, { text });
  }

  sharePost(postId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/posts/${postId}/share`, {});
  }

  savePost(postId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/posts/${postId}/save`, {});
  }

  deletePost(postId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/posts/${postId}`);
  }

  getUserPosts(userId: string, page: number = 1, limit: number = 12): Observable<PostsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PostsResponse>(`${this.API_URL}/posts/user/${userId}`, { params });
  }

  getPostsByHashtag(hashtag: string, page: number = 1, limit: number = 12): Observable<PostsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PostsResponse>(`${this.API_URL}/posts/hashtag/${hashtag}`, { params });
  }
}
