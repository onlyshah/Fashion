import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

// Chart.js (commented out until ng2-charts is properly installed)
// import { NgChartsModule } from 'ng2-charts';

// Routing
import { AdminRoutingModule } from './admin-routing.module';

// Components
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { AdminLoginComponent } from './auth/admin-login.component';
import { UserManagementComponent } from './users/user-management.component';
import { UserDialogComponent } from './users/user-dialog.component';
import { ProductManagementComponent } from './products/product-management.component';
import { ProductDialogComponent } from './products/product-dialog.component';
import { OrderManagementComponent } from './orders/order-management.component';
import { OrderDetailsComponent } from './orders/order-details.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { SettingsComponent } from './settings/settings.component';
import { SidebarComponent } from './layout/sidebar.component';
import { HeaderComponent } from './layout/header.component';

// Services
import { AdminAuthService } from './services/admin-auth.service';
import { AdminApiService } from './services/admin-api.service';
///import { UserService } from './services/user.service';
import { AdminProductService } from './services/product.service';
import { OrderService } from './services/order.service';
import { AnalyticsService } from './services/analytics.service';

// Guards
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { PermissionGuard } from './guards/permission.guard';

// Pipes
import { RolePipe } from './pipes/role.pipe';
import { StatusPipe } from './pipes/status.pipe';
import { CurrencyFormatPipe as AdminCurrencyFormatPipe } from './pipes/currency-format.pipe';

@NgModule({
  declarations: [
    // Layout Components
    AdminLayoutComponent,
    SidebarComponent,
    HeaderComponent,
    
    // Auth Components
    AdminLoginComponent,
    
    // Dashboard Components
    AdminDashboardComponent,
    
    // User Management
    UserManagementComponent,
    UserDialogComponent,
    
    // Product Management
    ProductManagementComponent,
    ProductDialogComponent,
    
    // Order Management
    OrderManagementComponent,
    OrderDetailsComponent,
    
    // Analytics
    AnalyticsComponent,
    
    // Settings
    SettingsComponent,
    
    // Pipes
    RolePipe,
    StatusPipe,
    AdminCurrencyFormatPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AdminRoutingModule,
    // NgChartsModule, // Commented out until ng2-charts is properly installed
    
    // Angular Material Modules
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTabsModule,
    MatMenuModule,
    MatBadgeModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatRadioModule,
    MatExpansionModule,
    MatStepperModule,
    MatTooltipModule,
    MatDividerModule
  ],
  providers: [
    AdminAuthService,
    AdminApiService,
    //UserService,
    AdminProductService,
    OrderService,
    AnalyticsService,
    AdminAuthGuard,
    PermissionGuard
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class AdminModule { }
