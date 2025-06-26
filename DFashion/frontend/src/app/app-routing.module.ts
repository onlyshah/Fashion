import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.routes').then(m => m.homeRoutes)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'shop',
    loadChildren: () => import('./features/shop/shop.routes').then(m => m.shopRoutes)
  },
  {
    path: 'category/:category',
    loadComponent: () => import('./features/category/category.component').then(m => m.CategoryComponent)
  },
  {
    path: 'products',
    loadChildren: () => import('./features/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'search',
    loadChildren: () => import('./features/search/search.routes').then(m => m.searchRoutes)
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.routes').then(m => m.profileRoutes)
  },
  {
    path: 'story',
    loadChildren: () => import('./features/story/story.routes').then(m => m.storyRoutes)
  },
  // Mobile routes (for mobile app compatibility) - Commented out until modules are created
  /*
  {
    path: 'tabs',
    loadChildren: () => import('./mobile/tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'onboarding',
    loadChildren: () => import('./mobile/onboarding/onboarding.module').then(m => m.OnboardingPageModule)
  },
  {
    path: 'product/:id',
    loadChildren: () => import('./mobile/product-detail/product-detail.module').then(m => m.ProductDetailPageModule)
  },
  {
    path: 'cart',
    loadChildren: () => import('./mobile/cart/cart.module').then(m => m.CartPageModule)
  },
  {
    path: 'checkout',
    loadChildren: () => import('./mobile/checkout/checkout.module').then(m => m.CheckoutPageModule)
  },
  {
    path: 'orders',
    loadChildren: () => import('./mobile/orders/orders.module').then(m => m.OrdersPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./mobile/profile/profile.module').then(m => m.ProfilePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'stories',
    loadChildren: () => import('./mobile/stories/stories.module').then(m => m.StoriesPageModule)
  },
  {
    path: 'posts',
    loadChildren: () => import('./mobile/posts/posts.module').then(m => m.PostsPageModule)
  },
  {
    path: 'search',
    loadChildren: () => import('./mobile/search/search.module').then(m => m.SearchPageModule)
  },
  {
    path: 'wishlist',
    loadChildren: () => import('./mobile/wishlist/wishlist.module').then(m => m.WishlistPageModule)
  },
  {
    path: 'notifications',
    loadChildren: () => import('./mobile/notifications/notifications.module').then(m => m.NotificationsPageModule),
    canActivate: [AuthGuard]
  },
  */
  // Admin routes (web-only) - Commented out until module is created
  /*
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  */
  // Web routes (for desktop/tablet) - Commented out until module is created
  /*
  {
    path: 'web',
    loadChildren: () => import('./web/web.module').then(m => m.WebModule)
  },
  */
  {
    path: '**',
    redirectTo: '/home'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { 
      preloadingStrategy: PreloadAllModules,
      enableTracing: false // Set to true for debugging
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
