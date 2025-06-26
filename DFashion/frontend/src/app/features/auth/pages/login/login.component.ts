import { Component } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TitleCasePipe],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }



  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      // Trim whitespace from form values
      const formData = {
        ...this.loginForm.value,
        email: this.loginForm.value.email?.trim(),
        password: this.loginForm.value.password?.trim()
      };

      this.authService.login(formData).subscribe({
        next: (response) => {
          this.loading = false;
          this.notificationService.success(
            'Login Successful!',
            `Welcome back, ${response.user.fullName}!`
          );

          // Role-based redirect
          if (response.user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else if (response.user.role === 'vendor') {
            this.router.navigate(['/vendor/dashboard']);
          } else {
            this.router.navigate(['/home']);
          }
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Invalid credentials. Please check your email and password.';
          this.notificationService.error(
            'Login Failed',
            'Please check your credentials and try again.'
          );
        }
      });
    }
  }


}
