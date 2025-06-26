import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VendorPage } from './vendor.page';

const routes: Routes = [
  {
    path: '',
    component: VendorPage
  },
  {
    path: 'products',
    loadChildren: () => import('./products/products.module').then(m => m.ProductsPageModule)
  },
  {
    path: 'posts',
    loadChildren: () => import('./posts/posts.module').then(m => m.PostsPageModule)
  },
  {
    path: 'stories',
    loadChildren: () => import('./stories/stories.module').then(m => m.StoriesPageModule)
  },
  {
    path: 'orders',
    loadChildren: () => import('./orders/orders.module').then(m => m.OrdersPageModule)
  },
  {
    path: 'analytics',
    loadChildren: () => import('./analytics/analytics.module').then(m => m.AnalyticsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VendorPageRoutingModule {}
