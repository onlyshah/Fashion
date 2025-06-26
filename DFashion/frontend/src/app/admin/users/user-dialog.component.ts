import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminApiService } from '../services/admin-api.service';

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styles: [`
    .user-dialog {
      min-width: 500px;
    }

    .user-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin: 1rem 0;
    }

    .form-row {
      display: flex;
      gap: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      flex: 1;
    }

    .save-spinner {
      margin-right: 0.5rem;
    }

    ::ng-deep .save-spinner circle {
      stroke: white;
    }

    @media (max-width: 600px) {
      .user-dialog {
        min-width: auto;
        width: 100%;
      }

      .form-row {
        flex-direction: column;
      }

      .half-width {
        width: 100%;
      }
    }
  `]
})
export class UserDialogComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  isLoading = false;

  roles = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'sales_manager', label: 'Sales Manager' },
    { value: 'marketing_manager', label: 'Marketing Manager' },
    { value: 'account_manager', label: 'Account Manager' },
    { value: 'support_manager', label: 'Support Manager' },
    { value: 'sales_executive', label: 'Sales Executive' },
    { value: 'marketing_executive', label: 'Marketing Executive' },
    { value: 'account_executive', label: 'Account Executive' },
    { value: 'support_executive', label: 'Support Executive' }
  ];

  departments = [
    { value: 'administration', label: 'Administration' },
    { value: 'sales', label: 'Sales' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'accounting', label: 'Accounting' },
    { value: 'support', label: 'Support' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: AdminApiService,
    private snackBar: MatSnackBar
  ) {
    this.isEditMode = !!data;
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data) {
      this.userForm.patchValue(this.data);
    }
  }

  createForm(): FormGroup {
    const formConfig: any = {
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      role: ['', [Validators.required]],
      department: [''],
      employeeId: [''],
      isActive: [true]
    };

    if (!this.isEditMode) {
      formConfig.password = ['', [Validators.required, Validators.minLength(6)]];
    }

    return this.fb.group(formConfig);
  }

  get showEmployeeFields(): boolean {
    const role = this.userForm.get('role')?.value;
    return role && role !== 'customer' && role !== 'vendor';
  }

  onSave(): void {
    if (this.userForm.valid) {
      this.isLoading = true;
      const formData = this.userForm.value;

      const apiCall = this.isEditMode 
        ? this.apiService.updateUser(this.data._id, formData)
        : this.apiService.createUser(formData);

      apiCall.subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open(
            `User ${this.isEditMode ? 'updated' : 'created'} successfully`, 
            'Close', 
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage = error.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} user`;
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
