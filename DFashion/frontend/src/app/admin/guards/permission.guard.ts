import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AdminAuthService } from '../services/admin-auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {

  constructor(
    private authService: AdminAuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    const requiredPermission = route.data?.['permission'];
    const requiredRole = route.data?.['role'];

    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/login']);
      return false;
    }

    // Check role-based access
    if (requiredRole) {
      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!this.authService.hasRole(allowedRoles)) {
        this.showAccessDeniedMessage('You do not have the required role to access this page.');
        this.router.navigate(['/admin/dashboard']);
        return false;
      }
    }

    // Check permission-based access
    if (requiredPermission) {
      const [module, action] = requiredPermission.split(':');
      if (!this.authService.hasPermission(module, action)) {
        this.showAccessDeniedMessage('You do not have permission to access this page.');
        this.router.navigate(['/admin/dashboard']);
        return false;
      }
    }

    return true;
  }

  private showAccessDeniedMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
