import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AdminAuthService } from '../services/admin-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AdminAuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(route, state);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(route, state);
  }

  private checkAuth(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/login'], {
        queryParams: { returnUrl: state.url }
      });
      return of(false);
    }

    // Check if user can access admin panel
    if (!this.authService.canAccessAdmin()) {
      this.router.navigate(['/admin/login']);
      return of(false);
    }

    // Check specific permission if required
    const requiredPermission = route.data?.['permission'];
    if (requiredPermission) {
      const [module, action] = requiredPermission.split(':');
      if (!this.authService.hasPermission(module, action)) {
        // Redirect to dashboard with error message
        this.router.navigate(['/admin/dashboard'], {
          queryParams: { error: 'insufficient_permissions' }
        });
        return of(false);
      }
    }

    // Verify token with server
    return this.authService.verifyToken().pipe(
      map(() => true),
      catchError(() => {
        this.router.navigate(['/admin/login'], {
          queryParams: { returnUrl: state.url, error: 'session_expired' }
        });
        return of(false);
      })
    );
  }
}
