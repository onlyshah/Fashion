import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Home Route (Public)
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },

  // Authentication Routes
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },

  // Home with Auth
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.routes').then(m => m.homeRoutes),
    canActivate: [AuthGuard]
  },

  // Explore Routes
  {
    path: 'explore',
    loadComponent: () => import('./features/explore/explore.component').then(m => m.ExploreComponent),
    title: 'Explore - DFashion'
  },

  // Shop Routes
  {
    path: 'shop',
    loadComponent: () => import('./features/shop/shop.component').then(m => m.ShopComponent),
    title: 'Shop - DFashion'
  },

  // Category Routes
  {
    path: 'category/:category',
    loadComponent: () => import('./features/category/category.component').then(m => m.CategoryComponent),
    title: 'Category - DFashion'
  },

  // Wishlist Routes
  {
    path: 'wishlist',
    loadComponent: () => import('./features/wishlist/wishlist.component').then(m => m.WishlistComponent),
    title: 'My Wishlist - DFashion'
  },

  // Social Media Routes
  {
    path: 'social',
    loadComponent: () => import('./features/social-media/social-media.component').then(m => m.SocialMediaComponent),
    title: 'Social Feed - DFashion'
  },
  {
    path: 'feed',
    loadComponent: () => import('./features/posts/social-feed.component').then(m => m.SocialFeedComponent),
    title: 'Social Feed - DFashion'
  },
  {
    path: 'stories',
    loadComponent: () => import('./features/stories/stories-viewer.component').then(m => m.StoriesViewerComponent),
    title: 'Stories - DFashion'
  },
  {
    path: 'stories/create',
    loadComponent: () => import('./features/stories/story-create.component').then(m => m.StoryCreateComponent),
    canActivate: [AuthGuard],
    title: 'Create Story - DFashion'
  },
  {
    path: 'stories/:userId',
    loadComponent: () => import('./features/stories/stories-viewer.component').then(m => m.StoriesViewerComponent),
    title: 'User Stories - DFashion'
  },
  {
    path: 'post/:id',
    loadComponent: () => import('./features/posts/post-detail.component').then(m => m.PostDetailComponent),
    title: 'Post Detail - DFashion'
  },

  // E-commerce Hub Routes
  {
    path: 'hub',
    loadComponent: () => import('./features/ecommerce/ecommerce-hub.component').then(m => m.EcommerceHubComponent),
    title: 'E-commerce Hub - DFashion'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/ecommerce/ecommerce-hub.component').then(m => m.EcommerceHubComponent),
    title: 'Dashboard - DFashion'
  },



  // Products Routes (using existing product detail)
  {
    path: 'product/:id',
    loadComponent: () => import('./features/product/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'products/:id',
    redirectTo: 'product/:id'
  },

  // Shopping Cart & Wishlist (will be created)
  {
    path: 'cart',
    loadComponent: () => import('./features/shop/pages/cart/cart.component').then(m => m.CartComponent),
    canActivate: [AuthGuard],
    title: 'Shopping Cart - DFashion'
  },

  // Checkout Process (using existing checkout)
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [AuthGuard],
    title: 'Checkout - DFashion'
  },

  // User Account Management
  {
    path: 'account',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full'
      },
      {
        path: 'profile',
        loadChildren: () => import('./features/profile/profile.routes').then(m => m.profileRoutes)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/profile/pages/profile/profile.component').then(m => m.ProfileComponent),
        title: 'My Orders - DFashion'
      }
    ]
  },

  // Vendor Dashboard
  {
    path: 'vendor',
    loadChildren: () => import('./features/vendor/vendor.routes').then(m => m.vendorRoutes),
    canActivate: [AuthGuard],
    title: 'Vendor Dashboard - DFashion'
  },

  // Legacy Routes (maintain compatibility)
  {
    path: 'shop',
    loadChildren: () => import('./features/shop/shop.routes').then(m => m.shopRoutes),
    canActivate: [AuthGuard]
  },
  {
    path: 'search',
    loadChildren: () => import('./features/search/search.routes').then(m => m.searchRoutes)
  },
  {
    path: 'product/:id',
    redirectTo: 'products/:id'
  },

  // Admin Routes
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },

  // Support & Help (using existing profile as placeholder)
  {
    path: 'support',
    loadComponent: () => import('./features/profile/pages/profile/profile.component').then(m => m.ProfileComponent),
    title: 'Support - DFashion'
  },

  // Wildcard route
  {
    path: '**',
    redirectTo: '/'
  }
];
