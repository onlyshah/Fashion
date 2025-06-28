import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/product.model';
import { TrendingProductsComponent } from '../trending-products/trending-products.component';
import { FeaturedBrandsComponent } from '../featured-brands/featured-brands.component';
import { NewArrivalsComponent } from '../new-arrivals/new-arrivals.component';
import { SuggestedForYouComponent } from '../suggested-for-you/suggested-for-you.component';
import { TopFashionInfluencersComponent } from '../top-fashion-influencers/top-fashion-influencers.component';
import { ShopByCategoryComponent } from '../shop-by-category/shop-by-category.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    TrendingProductsComponent,
    FeaturedBrandsComponent,
    NewArrivalsComponent,
    SuggestedForYouComponent,
    TopFashionInfluencersComponent,
    ShopByCategoryComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  suggestedUsers: any[] = [];
  trendingProducts: Product[] = [];
  topInfluencers: any[] = [];
  categories: any[] = [];

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSuggestedUsers();
    this.loadTrendingProducts();
    this.loadTopInfluencers();
    this.loadCategories();
  }

  loadSuggestedUsers() {
    // Mock data for suggested users
    this.suggestedUsers = [
      {
        id: '1',
        username: 'fashionista_maya',
        fullName: 'Maya Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        followedBy: 'Followed by 12 others',
        isFollowing: false
      },
      {
        id: '2',
        username: 'style_guru_alex',
        fullName: 'Alex Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        followedBy: 'Followed by 8 others',
        isFollowing: false
      }
    ];
  }

  loadTrendingProducts() {
    this.trendingProducts = [];
  }

  loadTopInfluencers() {
    // Mock data for top influencers
    this.topInfluencers = [
      {
        id: '1',
        username: 'fashion_queen',
        fullName: 'Priya Sharma',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        followersCount: 25000,
        postsCount: 156,
        engagement: 8.5,
        isFollowing: false
      },
      {
        id: '2',
        username: 'style_maven',
        fullName: 'Kavya Reddy',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        followersCount: 18000,
        postsCount: 89,
        engagement: 12.3,
        isFollowing: true
      }
    ];
  }

  loadCategories() {
    // Mock data for categories
    this.categories = [
      {
        id: '1',
        name: 'Women',
        slug: 'women',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400'
      },
      {
        id: '2',
        name: 'Men',
        slug: 'men',
        image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=400'
      },
      {
        id: '3',
        name: 'Accessories',
        slug: 'accessories',
        image: 'https://images.unsplash.com/photo-1506629905607-d405b7a30db9?w=400'
      },
      {
        id: '4',
        name: 'Footwear',
        slug: 'footwear',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400'
      }
    ];
  }

  formatFollowerCount(count: number): string {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  }

  followUser(userId: string) {
    const user = this.suggestedUsers.find(u => u.id === userId);
    if (user) {
      user.isFollowing = !user.isFollowing;
    }
  }

  followInfluencer(influencerId: string) {
    const influencer = this.topInfluencers.find(i => i.id === influencerId);
    if (influencer) {
      influencer.isFollowing = !influencer.isFollowing;
    }
  }

  quickBuy(productId: string) {
    console.log('Quick buy product:', productId);
    // TODO: Implement quick buy functionality
  }

  browseCategory(categorySlug: string) {
    console.log('Browse category:', categorySlug);
    this.router.navigate(['/category', categorySlug]);
  }
}
