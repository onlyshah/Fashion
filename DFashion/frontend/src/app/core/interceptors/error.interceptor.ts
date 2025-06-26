import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastController, LoadingController } from '@ionic/angular';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  
  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

  private async handleError(error: HttpErrorResponse): Promise<void> {
    // Dismiss any loading indicators
    this.loadingController.dismiss().catch(() => {});

    let errorMessage = 'An unexpected error occurred';
    let showToast = true;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Bad request';
          break;
        case 401:
          errorMessage = 'Unauthorized access';
          showToast = false; // Don't show toast for auth errors (handled by auth interceptor)
          break;
        case 403:
          errorMessage = 'Access forbidden';
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 422:
          errorMessage = error.error?.message || 'Validation error';
          break;
        case 500:
          errorMessage = 'Internal server error';
          break;
        case 503:
          errorMessage = 'Service temporarily unavailable';
          break;
        default:
          errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
      }
    }

    if (showToast) {
      await this.showErrorToast(errorMessage);
    }

    console.error('HTTP Error:', error);
  }

  private async showErrorToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 5000,
      position: 'top',
      color: 'danger',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}
