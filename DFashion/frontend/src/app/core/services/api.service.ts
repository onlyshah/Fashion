import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  error: string;
  statusCode: number;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // GET request
  get<T>(endpoint: string, params?: any): Observable<ApiResponse<T>> {
    const httpParams = this.buildHttpParams(params);
    const headers = this.getHeaders();

    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, {
      headers,
      params: httpParams
    }).pipe(
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  // POST request
  post<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    const headers = this.getHeaders();

    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data, {
      headers
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // PUT request
  put<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    const headers = this.getHeaders();

    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data, {
      headers
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // PATCH request
  patch<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    const headers = this.getHeaders();

    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data, {
      headers
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // DELETE request
  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    const headers = this.getHeaders();

    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, {
      headers
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Upload file
  upload<T>(endpoint: string, file: File, additionalData?: any): Observable<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const headers = this.getHeaders(false); // Don't set Content-Type for FormData

    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, formData, {
      headers
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Upload multiple files
  uploadMultiple<T>(endpoint: string, files: File[], additionalData?: any): Observable<ApiResponse<T>> {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const headers = this.getHeaders(false);

    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, formData, {
      headers
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Download file
  download(endpoint: string, filename?: string): Observable<Blob> {
    const headers = this.getHeaders();

    return this.http.get(`${this.baseUrl}${endpoint}`, {
      headers,
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Get with full response (including headers)
  getWithFullResponse<T>(endpoint: string, params?: any): Observable<any> {
    const httpParams = this.buildHttpParams(params);
    const headers = this.getHeaders();

    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, {
      headers,
      params: httpParams,
      observe: 'response'
    }).pipe(
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  // Build HTTP headers
  private getHeaders(includeContentType: boolean = true): HttpHeaders {
    let headers = new HttpHeaders();

    if (includeContentType) {
      headers = headers.set('Content-Type', 'application/json');
    }

    // Add authorization header if user is authenticated
    const token = this.authService.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // Build HTTP params
  private buildHttpParams(params?: any): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(item => {
              httpParams = httpParams.append(key, item.toString());
            });
          } else {
            httpParams = httpParams.set(key, value.toString());
          }
        }
      });
    }

    return httpParams;
  }

  // Handle HTTP errors
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
      errorCode = 'CLIENT_ERROR';
    } else {
      // Server-side error
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
        errorCode = error.error.error || 'SERVER_ERROR';
      } else {
        switch (error.status) {
          case 400:
            errorMessage = 'Bad Request';
            errorCode = 'BAD_REQUEST';
            break;
          case 401:
            errorMessage = 'Unauthorized';
            errorCode = 'UNAUTHORIZED';
            // Auto logout on 401
            this.authService.logout();
            break;
          case 403:
            errorMessage = 'Forbidden';
            errorCode = 'FORBIDDEN';
            break;
          case 404:
            errorMessage = 'Not Found';
            errorCode = 'NOT_FOUND';
            break;
          case 500:
            errorMessage = 'Internal Server Error';
            errorCode = 'INTERNAL_SERVER_ERROR';
            break;
          case 503:
            errorMessage = 'Service Unavailable';
            errorCode = 'SERVICE_UNAVAILABLE';
            break;
          default:
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
            errorCode = 'HTTP_ERROR';
        }
      }
    }

    const apiError: ApiError = {
      success: false,
      message: errorMessage,
      error: errorCode,
      statusCode: error.status || 0,
      timestamp: new Date().toISOString()
    };

    console.error('API Error:', apiError);
    return throwError(() => apiError);
  }
}
