import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { AdminApiService } from '../services/admin-api.service';
import { UserDialogComponent } from './user-dialog.component';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  role: string;
  department: string;
  employeeId?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();
  
  displayedColumns: string[] = [
    'fullName', 'email', 'role', 'department', 'status', 'lastLogin', 'actions'
  ];
  
  dataSource = new MatTableDataSource<User>([]);
  isLoading = false;
  totalUsers = 0;
  
  // Filters
  searchControl = new FormControl('');
  roleFilter = new FormControl('');
  departmentFilter = new FormControl('');
  statusFilter = new FormControl('');
  
  roles = [
    { value: '', label: 'All Roles' },
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'sales_manager', label: 'Sales Manager' },
    { value: 'marketing_manager', label: 'Marketing Manager' },
    { value: 'account_manager', label: 'Account Manager' },
    { value: 'support_manager', label: 'Support Manager' },
    { value: 'customer', label: 'Customer' },
    { value: 'vendor', label: 'Vendor' }
  ];
  
  departments = [
    { value: '', label: 'All Departments' },
    { value: 'administration', label: 'Administration' },
    { value: 'sales', label: 'Sales' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'accounting', label: 'Accounting' },
    { value: 'support', label: 'Support' }
  ];
  
  statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ];

  constructor(
    private apiService: AdminApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.setupFilters();
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupFilters(): void {
    // Search filter
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadUsers();
    });

    // Other filters
    [this.roleFilter, this.departmentFilter, this.statusFilter].forEach(control => {
      control.valueChanges.pipe(
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.loadUsers();
      });
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    
    const params = {
      page: this.paginator?.pageIndex ? this.paginator.pageIndex + 1 : 1,
      limit: this.paginator?.pageSize || 10,
      search: this.searchControl.value || '',
      role: this.roleFilter.value || '',
      department: this.departmentFilter.value || '',
      isActive: this.statusFilter.value || '',
      sortBy: this.sort?.active || 'createdAt',
      sortOrder: this.sort?.direction || 'desc'
    };

    this.apiService.getUsers(params).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.dataSource.data = response.data.users || [];
        this.totalUsers = response.data.pagination.totalUsers || 0;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load users:', error);
        this.isLoading = false;
        this.snackBar.open('Failed to load users', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });

        // Initialize empty data on error
        this.dataSource.data = [];
        this.totalUsers = 0;
      }
    });
  }



  onPageChange(): void {
    this.loadUsers();
  }

  onSortChange(): void {
    this.loadUsers();
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.roleFilter.setValue('');
    this.departmentFilter.setValue('');
    this.statusFilter.setValue('');
  }

  openUserDialog(user?: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '600px',
      data: user ? { ...user } : null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  toggleUserStatus(user: User): void {
    const action = user.isActive ? 'deactivate' : 'activate';
    
    if (user.isActive) {
      this.apiService.deleteUser(user._id).subscribe({
        next: () => {
          this.snackBar.open('User deactivated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadUsers();
        },
        error: (error) => {
          console.error('Failed to deactivate user:', error);
          this.snackBar.open('Failed to deactivate user', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.apiService.activateUser(user._id).subscribe({
        next: () => {
          this.snackBar.open('User activated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadUsers();
        },
        error: (error) => {
          console.error('Failed to activate user:', error);
          this.snackBar.open('Failed to activate user', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user "${user.fullName}"?`)) {
      this.apiService.deleteUser(user._id).subscribe({
        next: () => {
          this.snackBar.open('User deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadUsers();
        },
        error: (error) => {
          console.error('Failed to delete user:', error);
          this.snackBar.open('Failed to delete user', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  exportUsers(): void {
    // Export functionality
    this.snackBar.open('Export feature coming soon!', 'Close', {
      duration: 3000
    });
  }

  getStatusColor(user: User): string {
    if (!user.isActive) return '#f44336';
    if (!user.isVerified) return '#ff9800';
    return '#4caf50';
  }

  getStatusText(user: User): string {
    if (!user.isActive) return 'Inactive';
    if (!user.isVerified) return 'Unverified';
    return 'Active';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getRoleColor(role: string): string {
    const roleColors: { [key: string]: string } = {
      'super_admin': '#e91e63',
      'admin': '#9c27b0',
      'sales_manager': '#2196f3',
      'sales_executive': '#03a9f4',
      'marketing_manager': '#ff9800',
      'marketing_executive': '#ffc107',
      'account_manager': '#4caf50',
      'accountant': '#8bc34a',
      'support_manager': '#795548',
      'support_agent': '#9e9e9e',
      'customer': '#607d8b',
      'vendor': '#ff5722'
    };

    return roleColors[role] || '#666666';
  }

  getDepartmentDisplay(department: string): string {
    if (!department) return 'N/A';
    return department.charAt(0).toUpperCase() + department.slice(1).toLowerCase();
  }
}
