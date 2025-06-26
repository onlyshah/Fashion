import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { AdminLoginComponent } from './auth/admin-login.component';
import { UserManagementComponent } from './users/user-management.component';
import { ProductManagementComponent } from './products/product-management.component';
import { OrderManagementComponent } from './orders/order-management.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { SettingsComponent } from './settings/settings.component';
import { AdminAuthGuard } from './guards/admin-auth.guard';

const routes: Routes = [
  {
    path: 'login',
    component: AdminLoginComponent
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AdminAuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
        data: { title: 'Dashboard', permission: 'dashboard:view' }
      },
      {
        path: 'users',
        component: UserManagementComponent,
        data: { title: 'User Management', permission: 'users:view' }
      },
      {
        path: 'products',
        component: ProductManagementComponent,
        data: { title: 'Product Management', permission: 'products:view' }
      },
      {
        path: 'orders',
        component: OrderManagementComponent,
        data: { title: 'Order Management', permission: 'orders:view' }
      },
      {
        path: 'analytics',
        component: AnalyticsComponent,
        data: { title: 'Analytics', permission: 'analytics:view' }
      },
      {
        path: 'settings',
        component: SettingsComponent,
        data: { title: 'Settings', permission: 'settings:view' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
