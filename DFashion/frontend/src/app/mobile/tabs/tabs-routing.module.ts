import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'categories',
        loadChildren: () => import('../categories/categories.module').then(m => m.CategoriesPageModule)
      },
      {
        path: 'stories',
        loadChildren: () => import('../stories/stories.module').then(m => m.StoriesPageModule)
      },
      {
        path: 'posts',
        loadChildren: () => import('../posts/posts.module').then(m => m.PostsPageModule)
      },
      {
        path: 'wishlist',
        loadChildren: () => import('../wishlist/wishlist.module').then(m => m.WishlistPageModule)
      },
      {
        path: 'cart',
        loadChildren: () => import('../cart/cart.module').then(m => m.CartPageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'vendor',
    loadChildren: () => import('../vendor/vendor.module').then(m => m.VendorPageModule)
  },
  {
    path: 'checkout',
    loadChildren: () => import('../checkout/checkout.module').then(m => m.CheckoutPageModule)
  },
  {
    path: 'wishlist',
    loadChildren: () => import('../wishlist/wishlist.module').then(m => m.WishlistPageModule)
  },
  {
    path: 'orders',
    loadChildren: () => import('../orders/orders.module').then(m => m.OrdersPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
