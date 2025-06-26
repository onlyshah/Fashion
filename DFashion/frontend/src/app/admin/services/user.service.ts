import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  _id?: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'customer' | 'vendor' | 'admin' | 'sales' | 'marketing' | 'support';
  department?: string;
  isActive: boolean;
  isVerified: boolean;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  addresses?: Address[];
  preferences?: any;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  permissions?: UserPermissions;
}

export interface Address {
  _id?: string;
  type: 'home' | 'work' | 'other';
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface UserPermissions {
  users?: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  products?: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
  };
  orders?: {
    view: boolean;
    edit: boolean;
    cancel: boolean;
    refund: boolean;
  };
  analytics?: {
    view: boolean;
    export: boolean;
  };
  settings?: {
    view: boolean;
    edit: boolean;
  };
}

export interface UserFilters {
  search?: string;
  role?: string;
  department?: string;
  isActive?: boolean;
  isVerified?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  usersByRole: { [key: string]: number };
  usersByDepartment: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Get all users with filters
  getUsers(filters: UserFilters = {}): Observable<UserResponse> {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<UserResponse>(this.apiUrl, { params });
  }

  // Get user by ID
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // Create new user
  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  // Update user
  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  // Delete user
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Toggle user status (active/inactive)
  toggleUserStatus(id: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  // Verify user email
  verifyUser(id: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/verify`, {});
  }

  // Reset user password
  resetUserPassword(id: string): Observable<{ temporaryPassword: string }> {
    return this.http.post<{ temporaryPassword: string }>(`${this.apiUrl}/${id}/reset-password`, {});
  }

  // Update user permissions
  updateUserPermissions(id: string, permissions: UserPermissions): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/permissions`, { permissions });
  }

  // Get user statistics
  getUserStats(period: string = '30d'): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/stats?period=${period}`);
  }

  // Search users
  searchUsers(query: string, filters: UserFilters = {}): Observable<UserResponse> {
    const searchFilters = { ...filters, search: query };
    return this.getUsers(searchFilters);
  }

  // Get users by role
  getUsersByRole(role: string, filters: UserFilters = {}): Observable<UserResponse> {
    const roleFilters = { ...filters, role };
    return this.getUsers(roleFilters);
  }

  // Get users by department
  getUsersByDepartment(department: string, filters: UserFilters = {}): Observable<UserResponse> {
    const deptFilters = { ...filters, department };
    return this.getUsers(deptFilters);
  }

  // Upload user avatar
  uploadUserAvatar(userId: string, file: File): Observable<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.http.post<{ avatarUrl: string }>(`${this.apiUrl}/${userId}/avatar`, formData);
  }

  // Get user addresses
  getUserAddresses(userId: string): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.apiUrl}/${userId}/addresses`);
  }

  // Add user address
  addUserAddress(userId: string, address: Partial<Address>): Observable<Address> {
    return this.http.post<Address>(`${this.apiUrl}/${userId}/addresses`, address);
  }

  // Update user address
  updateUserAddress(userId: string, addressId: string, address: Partial<Address>): Observable<Address> {
    return this.http.put<Address>(`${this.apiUrl}/${userId}/addresses/${addressId}`, address);
  }

  // Delete user address
  deleteUserAddress(userId: string, addressId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}/addresses/${addressId}`);
  }

  // Set default address
  setDefaultAddress(userId: string, addressId: string): Observable<Address> {
    return this.http.patch<Address>(`${this.apiUrl}/${userId}/addresses/${addressId}/set-default`, {});
  }

  // Bulk operations
  bulkUpdateUsers(userIds: string[], updates: Partial<User>): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/bulk-update`, {
      userIds,
      updates
    });
  }

  bulkDeleteUsers(userIds: string[]): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/bulk-delete`, {
      body: { userIds }
    });
  }

  // Export users
  exportUsers(filters: UserFilters = {}, format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    
    params = params.set('format', format);

    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }

  // Send welcome email
  sendWelcomeEmail(userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${userId}/send-welcome-email`, {});
  }

  // Get user activity log
  getUserActivityLog(userId: string, limit: number = 50): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}/activity-log?limit=${limit}`);
  }

  // Update users subject
  updateUsersSubject(users: User[]): void {
    this.usersSubject.next(users);
  }

  // Get current users
  getCurrentUsers(): User[] {
    return this.usersSubject.value;
  }

  // Get available roles
  getAvailableRoles(): string[] {
    return ['customer', 'vendor', 'admin', 'sales', 'marketing', 'support'];
  }

  // Get available departments
  getAvailableDepartments(): string[] {
    return ['Sales', 'Marketing', 'Support', 'IT', 'Finance', 'Operations'];
  }
}
