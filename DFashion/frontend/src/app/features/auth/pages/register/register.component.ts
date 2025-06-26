import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .auth-card {
      background: #fff;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }

    .logo {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .logo p {
      color: #8e8e8e;
      font-size: 14px;
    }

    .auth-form {
      margin-bottom: 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-control {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #dbdbdb;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: all 0.2s;
    }

    .form-control:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(0, 149, 246, 0.1);
    }

    .form-control.error {
      border-color: #ef4444;
    }

    .error-message {
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
    }

    .auth-btn {
      width: 100%;
      padding: 12px;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .auth-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .vendor-info {
      padding: 16px;
      background: #f8fafc;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .auth-link {
      text-align: center;
    }

    .auth-link p {
      font-size: 14px;
      color: #8e8e8e;
    }

    .auth-link a {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 600;
    }

    .auth-link a:hover {
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .auth-card {
        padding: 24px;
      }

      .logo h1 {
        font-size: 28px;
      }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['customer', Validators.required],
      businessName: [''],
      businessType: ['']
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const formData = { ...this.registerForm.value };
      
      if (formData.role === 'vendor') {
        formData.vendorInfo = {
          businessName: formData.businessName,
          businessType: formData.businessType
        };
      }

      delete formData.businessName;
      delete formData.businessType;

      this.authService.register(formData).subscribe({
        next: (response) => {
          this.loading = false;
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        }
      });
    }
  }
}
