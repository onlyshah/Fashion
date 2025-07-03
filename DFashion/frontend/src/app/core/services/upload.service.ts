import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UploadProgress {
  percentage: number;
  loaded: number;
  total: number;
  status: 'uploading' | 'completed' | 'error';
}

export interface UploadedFile {
  filename: string;
  originalName: string;
  size: number;
  url: string;
  path: string;
  type?: string;
  mimetype?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    filename?: string;
    originalName?: string;
    size?: number;
    url?: string;
    path?: string;
    type?: string;
    mimetype?: string;
    files?: UploadedFile[];
    images?: UploadedFile[];
    media?: UploadedFile[];
    count?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private baseUrl = 'http://10.0.2.2:5000/api/upload'; // Direct IP for testing
  private uploadProgress$ = new BehaviorSubject<UploadProgress | null>(null);

  // Allowed file types and sizes
  private readonly allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  private readonly allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly maxImageSize = 3 * 1024 * 1024; // 3MB for images
  private readonly maxVideoSize = 10 * 1024 * 1024; // 10MB for videos

  constructor(private http: HttpClient) {}

  // Get upload progress observable
  getUploadProgress(): Observable<UploadProgress | null> {
    return this.uploadProgress$.asObservable();
  }

  // Validate file before upload
  validateFile(file: File, type: 'image' | 'video' | 'any' = 'any'): { isValid: boolean; error?: string } {
    // Check file size
    let maxSize = this.maxFileSize;
    if (type === 'image') {
      maxSize = this.maxImageSize;
      if (!this.allowedImageTypes.includes(file.type)) {
        return { isValid: false, error: 'Invalid image type. Allowed: JPG, PNG, GIF, WebP' };
      }
    } else if (type === 'video') {
      maxSize = this.maxVideoSize;
      if (!this.allowedVideoTypes.includes(file.type)) {
        return { isValid: false, error: 'Invalid video type. Allowed: MP4, MOV, AVI, WebM' };
      }
    } else {
      // Any type - check if it's image or video
      const isImage = this.allowedImageTypes.includes(file.type);
      const isVideo = this.allowedVideoTypes.includes(file.type);
      if (!isImage && !isVideo) {
        return { isValid: false, error: 'Invalid file type. Only images and videos are allowed' };
      }
    }

    if (file.size > maxSize) {
      const sizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      return { isValid: false, error: `File too large. Maximum size: ${sizeMB}MB` };
    }

    return { isValid: true };
  }

  // Validate multiple files
  validateFiles(files: File[], type: 'image' | 'video' | 'any' = 'any', maxCount = 10): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (files.length === 0) {
      errors.push('No files selected');
      return { isValid: false, errors };
    }

    if (files.length > maxCount) {
      errors.push(`Too many files. Maximum ${maxCount} files allowed`);
    }

    files.forEach((file, index) => {
      const validation = this.validateFile(file, type);
      if (!validation.isValid) {
        errors.push(`File ${index + 1}: ${validation.error}`);
      }
    });

    return { isValid: errors.length === 0, errors };
  }

  // Upload single image
  uploadImage(file: File): Observable<UploadResponse> {
    const validation = this.validateFile(file, 'image');
    if (!validation.isValid) {
      return throwError(() => new Error(validation.error));
    }

    const formData = new FormData();
    formData.append('image', file);

    return this.uploadWithProgress(`${this.baseUrl}/image`, formData);
  }

  // Upload multiple images
  uploadMultipleImages(files: File[]): Observable<UploadResponse> {
    const validation = this.validateFiles(files, 'image', 10);
    if (!validation.isValid) {
      return throwError(() => new Error(validation.errors.join(', ')));
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    return this.uploadWithProgress(`${this.baseUrl}/multiple`, formData);
  }

  // Upload product images
  uploadProductImages(files: File[]): Observable<UploadResponse> {
    const validation = this.validateFiles(files, 'image', 5);
    if (!validation.isValid) {
      return throwError(() => new Error(validation.errors.join(', ')));
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    return this.uploadWithProgress(`${this.baseUrl}/product-images`, formData);
  }

  // Upload user avatar
  uploadAvatar(file: File): Observable<UploadResponse> {
    const validation = this.validateFile(file, 'image');
    if (!validation.isValid) {
      return throwError(() => new Error(validation.error));
    }

    const formData = new FormData();
    formData.append('avatar', file);

    return this.uploadWithProgress(`${this.baseUrl}/avatar`, formData);
  }

  // Upload post media (images and videos)
  uploadPostMedia(files: File[]): Observable<UploadResponse> {
    const validation = this.validateFiles(files, 'any', 10);
    if (!validation.isValid) {
      return throwError(() => new Error(validation.errors.join(', ')));
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append('media', file);
    });

    return this.uploadWithProgress(`${this.baseUrl}/post-media`, formData);
  }

  // Upload story media (single image or video)
  uploadStoryMedia(file: File): Observable<UploadResponse> {
    const validation = this.validateFile(file, 'any');
    if (!validation.isValid) {
      return throwError(() => new Error(validation.error));
    }

    const formData = new FormData();
    formData.append('media', file);

    return this.uploadWithProgress(`${this.baseUrl}/story-media`, formData);
  }

  // Generic upload with progress tracking
  private uploadWithProgress(url: string, formData: FormData): Observable<UploadResponse> {
    this.uploadProgress$.next({ percentage: 0, loaded: 0, total: 0, status: 'uploading' });

    return this.http.post<UploadResponse>(url, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress: UploadProgress = {
            percentage: Math.round(100 * event.loaded / (event.total || 1)),
            loaded: event.loaded,
            total: event.total || 0,
            status: 'uploading'
          };
          this.uploadProgress$.next(progress);
          return null; // Return null for progress events
        } else if (event.type === HttpEventType.Response) {
          const progress: UploadProgress = {
            percentage: 100,
            loaded: event.body?.data?.size || 0,
            total: event.body?.data?.size || 0,
            status: 'completed'
          };
          this.uploadProgress$.next(progress);
          return event.body as UploadResponse;
        }
        return null;
      }),
      catchError(error => {
        const progress: UploadProgress = {
          percentage: 0,
          loaded: 0,
          total: 0,
          status: 'error'
        };
        this.uploadProgress$.next(progress);
        return throwError(() => error);
      }),
      tap(() => {
        // Clear progress after a delay
        setTimeout(() => {
          this.uploadProgress$.next(null);
        }, 2000);
      })
    ).pipe(
      // Filter out null values (progress events)
      map(response => response as UploadResponse)
    );
  }

  // Create file preview URL
  createFilePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Get file type from file
  getFileType(file: File): 'image' | 'video' | 'unknown' {
    if (this.allowedImageTypes.includes(file.type)) {
      return 'image';
    } else if (this.allowedVideoTypes.includes(file.type)) {
      return 'video';
    }
    return 'unknown';
  }

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Reset upload progress
  resetProgress(): void {
    this.uploadProgress$.next(null);
  }
}
