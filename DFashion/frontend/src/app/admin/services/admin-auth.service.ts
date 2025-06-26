import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  department: string;
  employeeId: string;
  permissions: Permission[];
  avatar?: string;
}

export interface Permission {
  module: string;
  actions: string[];
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AdminUser;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private apiUrl = 'http://localhost:5000/api';
  private currentUserSubject = new BehaviorSubject<AdminUser | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check for existing token on service initialization
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');
    
    if (token && user) {
      this.tokenSubject.next(token);
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  // Login
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/admin/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        if (response.success) {
          // Store token and user data
          localStorage.setItem('admin_token', response.data.token);
          localStorage.setItem('admin_user', JSON.stringify(response.data.user));
          
          // Update subjects
          this.tokenSubject.next(response.data.token);
          this.currentUserSubject.next(response.data.user);
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(error);
      })
    );
  }

  // Logout
  logout(): void {
    // Clear local storage
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    
    // Clear subjects
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    
    // Redirect to login
    this.router.navigate(['/admin/login']);
  }

  // Get current user
  getCurrentUser(): AdminUser | null {
    return this.currentUserSubject.value;
  }

  // Get current token
  getToken(): string | null {
    return this.tokenSubject.value;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  // Check if user has specific permission
  hasPermission(module: string, action: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Super admin has all permissions
    if (user.role === 'super_admin') return true;

    // Check specific permission
    return user.permissions?.some(permission => 
      permission.module === module && permission.actions.includes(action)
    ) || false;
  }

  // Check if user has any of the specified roles
  hasRole(roles: string | string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(user.role);
  }

  // Verify token with server
  verifyToken(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError('No token found');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get(`${this.apiUrl}/auth/verify`, { headers }).pipe(
      tap(response => {
        // Token is valid, update user data if needed
        if (response && (response as any).data?.user) {
          this.currentUserSubject.next((response as any).data.user);
        }
      }),
      catchError(error => {
        // Token is invalid, logout user
        this.logout();
        return throwError(error);
      })
    );
  }

  // Get authorization headers
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Refresh user data
  refreshUserData(): Observable<AdminUser> {
    return this.verifyToken().pipe(
      map(response => response.data.user)
    );
  }

  // Update user profile
  updateProfile(profileData: Partial<AdminUser>): Observable<any> {
    const headers = this.getAuthHeaders();
    
    return this.http.put(`${this.apiUrl}/admin/profile`, profileData, { headers }).pipe(
      tap(response => {
        if (response && (response as any).success) {
          // Update current user data
          const currentUser = this.getCurrentUser();
          if (currentUser) {
            const updatedUser = { ...currentUser, ...profileData };
            this.currentUserSubject.next(updatedUser);
            localStorage.setItem('admin_user', JSON.stringify(updatedUser));
          }
        }
      })
    );
  }

  // Change password
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    const headers = this.getAuthHeaders();
    
    return this.http.post(`${this.apiUrl}/admin/change-password`, {
      currentPassword,
      newPassword
    }, { headers });
  }

  // Get user permissions for display
  getUserPermissions(): Permission[] {
    const user = this.getCurrentUser();
    return user?.permissions || [];
  }

  // Check if user can access admin panel
  canAccessAdmin(): boolean {
    const adminRoles = [
      'super_admin', 'admin', 'sales_manager', 'marketing_manager',
      'account_manager', 'support_manager', 'sales_executive',
      'marketing_executive', 'account_executive', 'support_executive'
    ];
    
    return this.hasRole(adminRoles);
  }

  // Get user's department
  getUserDepartment(): string {
    const user = this.getCurrentUser();
    return user?.department || '';
  }

  // Get user's role display name
  getRoleDisplayName(): string {
    const user = this.getCurrentUser();
    if (!user) return '';

    const roleNames: { [key: string]: string } = {
      'super_admin': 'Super Administrator',
      'admin': 'Administrator',
      'sales_manager': 'Sales Manager',
      'marketing_manager': 'Marketing Manager',
      'account_manager': 'Account Manager',
      'support_manager': 'Support Manager',
      'sales_executive': 'Sales Executive',
      'marketing_executive': 'Marketing Executive',
      'account_executive': 'Account Executive',
      'support_executive': 'Support Executive'
    };

    return roleNames[user.role] || user.role;
  }

  // Auto-logout on token expiration
  private setupTokenExpiration(): void {
    // This would typically decode JWT to get expiration time
    // For now, we'll set a timeout for 8 hours (token expiry time)
    setTimeout(() => {
      this.logout();
    }, 8 * 60 * 60 * 1000); // 8 hours
  }
}
