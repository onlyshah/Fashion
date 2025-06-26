import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-settings',
  template: `
    <div class="settings-container">
      <div class="settings-header">
        <h1>Settings</h1>
        <p>Manage your application settings and preferences</p>
      </div>

      <mat-tab-group>
        <!-- General Settings -->
        <mat-tab label="General">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>General Settings</mat-card-title>
                <mat-card-subtitle>Basic application configuration</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="generalForm" class="settings-form">
                  <mat-form-field appearance="outline">
                    <mat-label>Application Name</mat-label>
                    <input matInput formControlName="appName">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Company Name</mat-label>
                    <input matInput formControlName="companyName">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Support Email</mat-label>
                    <input matInput type="email" formControlName="supportEmail">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Default Currency</mat-label>
                    <mat-select formControlName="defaultCurrency">
                      <mat-option value="INR">Indian Rupee (₹)</mat-option>
                      <mat-option value="USD">US Dollar ($)</mat-option>
                      <mat-option value="EUR">Euro (€)</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Timezone</mat-label>
                    <mat-select formControlName="timezone">
                      <mat-option value="Asia/Kolkata">Asia/Kolkata</mat-option>
                      <mat-option value="America/New_York">America/New_York</mat-option>
                      <mat-option value="Europe/London">Europe/London</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <div class="form-actions">
                    <button mat-raised-button color="primary" (click)="saveGeneralSettings()">
                      Save Changes
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- E-commerce Settings -->
        <mat-tab label="E-commerce">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>E-commerce Settings</mat-card-title>
                <mat-card-subtitle>Configure your online store</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="ecommerceForm" class="settings-form">
                  <mat-form-field appearance="outline">
                    <mat-label>Store Name</mat-label>
                    <input matInput formControlName="storeName">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Store Description</mat-label>
                    <textarea matInput rows="3" formControlName="storeDescription"></textarea>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Default Tax Rate (%)</mat-label>
                    <input matInput type="number" formControlName="taxRate">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Shipping Fee</mat-label>
                    <input matInput type="number" formControlName="shippingFee">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Free Shipping Threshold</mat-label>
                    <input matInput type="number" formControlName="freeShippingThreshold">
                  </mat-form-field>

                  <div class="checkbox-group">
                    <mat-checkbox formControlName="enableInventoryTracking">
                      Enable Inventory Tracking
                    </mat-checkbox>
                    <mat-checkbox formControlName="enableReviews">
                      Enable Product Reviews
                    </mat-checkbox>
                    <mat-checkbox formControlName="enableWishlist">
                      Enable Wishlist
                    </mat-checkbox>
                  </div>

                  <div class="form-actions">
                    <button mat-raised-button color="primary" (click)="saveEcommerceSettings()">
                      Save Changes
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Notifications -->
        <mat-tab label="Notifications">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Notification Settings</mat-card-title>
                <mat-card-subtitle>Configure email and push notifications</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="notificationForm" class="settings-form">
                  <h3>Email Notifications</h3>
                  <div class="checkbox-group">
                    <mat-checkbox formControlName="emailNewOrders">
                      New Orders
                    </mat-checkbox>
                    <mat-checkbox formControlName="emailLowStock">
                      Low Stock Alerts
                    </mat-checkbox>
                    <mat-checkbox formControlName="emailNewUsers">
                      New User Registrations
                    </mat-checkbox>
                    <mat-checkbox formControlName="emailReviews">
                      New Product Reviews
                    </mat-checkbox>
                  </div>

                  <h3>Push Notifications</h3>
                  <div class="checkbox-group">
                    <mat-checkbox formControlName="pushNewOrders">
                      New Orders
                    </mat-checkbox>
                    <mat-checkbox formControlName="pushUrgentAlerts">
                      Urgent System Alerts
                    </mat-checkbox>
                    <mat-checkbox formControlName="pushDailyReports">
                      Daily Reports
                    </mat-checkbox>
                  </div>

                  <div class="form-actions">
                    <button mat-raised-button color="primary" (click)="saveNotificationSettings()">
                      Save Changes
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Security -->
        <mat-tab label="Security">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Security Settings</mat-card-title>
                <mat-card-subtitle>Manage security and access controls</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="securityForm" class="settings-form">
                  <mat-form-field appearance="outline">
                    <mat-label>Session Timeout (minutes)</mat-label>
                    <input matInput type="number" formControlName="sessionTimeout">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Password Minimum Length</mat-label>
                    <input matInput type="number" formControlName="passwordMinLength">
                  </mat-form-field>

                  <div class="checkbox-group">
                    <mat-checkbox formControlName="requireTwoFactor">
                      Require Two-Factor Authentication
                    </mat-checkbox>
                    <mat-checkbox formControlName="enableLoginAttempts">
                      Enable Login Attempt Limits
                    </mat-checkbox>
                    <mat-checkbox formControlName="enableAuditLog">
                      Enable Audit Logging
                    </mat-checkbox>
                  </div>

                  <div class="form-actions">
                    <button mat-raised-button color="primary" (click)="saveSecuritySettings()">
                      Save Changes
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  generalForm!: FormGroup;
  ecommerceForm!: FormGroup;
  notificationForm!: FormGroup;
  securityForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.createForms();
    this.loadSettings();
  }

  createForms(): void {
    this.generalForm = this.fb.group({
      appName: ['DFashion', Validators.required],
      companyName: ['DFashion Inc.', Validators.required],
      supportEmail: ['support@dfashion.com', [Validators.required, Validators.email]],
      defaultCurrency: ['INR', Validators.required],
      timezone: ['Asia/Kolkata', Validators.required]
    });

    this.ecommerceForm = this.fb.group({
      storeName: ['DFashion Store', Validators.required],
      storeDescription: ['Your one-stop fashion destination'],
      taxRate: [18, [Validators.required, Validators.min(0), Validators.max(100)]],
      shippingFee: [99, [Validators.required, Validators.min(0)]],
      freeShippingThreshold: [999, [Validators.required, Validators.min(0)]],
      enableInventoryTracking: [true],
      enableReviews: [true],
      enableWishlist: [true]
    });

    this.notificationForm = this.fb.group({
      emailNewOrders: [true],
      emailLowStock: [true],
      emailNewUsers: [false],
      emailReviews: [false],
      pushNewOrders: [true],
      pushUrgentAlerts: [true],
      pushDailyReports: [false]
    });

    this.securityForm = this.fb.group({
      sessionTimeout: [30, [Validators.required, Validators.min(5), Validators.max(480)]],
      passwordMinLength: [8, [Validators.required, Validators.min(6), Validators.max(20)]],
      requireTwoFactor: [false],
      enableLoginAttempts: [true],
      enableAuditLog: [true]
    });
  }

  loadSettings(): void {
    // In a real app, load settings from the backend
    console.log('Loading settings...');
  }

  saveGeneralSettings(): void {
    if (this.generalForm.valid) {
      console.log('Saving general settings:', this.generalForm.value);
      this.showSuccessMessage('General settings saved successfully');
    }
  }

  saveEcommerceSettings(): void {
    if (this.ecommerceForm.valid) {
      console.log('Saving e-commerce settings:', this.ecommerceForm.value);
      this.showSuccessMessage('E-commerce settings saved successfully');
    }
  }

  saveNotificationSettings(): void {
    if (this.notificationForm.valid) {
      console.log('Saving notification settings:', this.notificationForm.value);
      this.showSuccessMessage('Notification settings saved successfully');
    }
  }

  saveSecuritySettings(): void {
    if (this.securityForm.valid) {
      console.log('Saving security settings:', this.securityForm.value);
      this.showSuccessMessage('Security settings saved successfully');
    }
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
}
