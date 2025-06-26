import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

export const vendorRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/vendor-dashboard.component').then(m => m.VendorDashboardComponent),
    canActivate: [AuthGuard],
    title: 'Vendor Dashboard - DFashion'
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/vendor-products.component').then(m => m.VendorProductsComponent),
    canActivate: [AuthGuard],
    title: 'My Products - DFashion'
  },
  {
    path: 'products/create',
    loadComponent: () => import('./pages/products/create-product.component').then(m => m.CreateProductComponent),
    canActivate: [AuthGuard],
    title: 'Create Product - DFashion'
  },
  {
    path: 'posts',
    loadComponent: () => import('./pages/posts/vendor-posts.component').then(m => m.VendorPostsComponent),
    canActivate: [AuthGuard],
    title: 'My Posts - DFashion'
  },
  {
    path: 'posts/create',
    loadComponent: () => import('./pages/posts/create-post.component').then(m => m.CreatePostComponent),
    canActivate: [AuthGuard],
    title: 'Create Post - DFashion'
  },
  {
    path: 'stories',
    loadComponent: () => import('./pages/stories/vendor-stories.component').then(m => m.VendorStoriesComponent),
    canActivate: [AuthGuard],
    title: 'My Stories - DFashion'
  },
  {
    path: 'stories/create',
    loadComponent: () => import('./pages/stories/create-story.component').then(m => m.CreateStoryComponent),
    canActivate: [AuthGuard],
    title: 'Create Story - DFashion'
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/orders/vendor-orders.component').then(m => m.VendorOrdersComponent),
    canActivate: [AuthGuard],
    title: 'Orders - DFashion'
  },
  {
    path: 'analytics',
    loadComponent: () => import('./pages/analytics/vendor-analytics.component').then(m => m.VendorAnalyticsComponent),
    canActivate: [AuthGuard],
    title: 'Analytics - DFashion'
  }
];
