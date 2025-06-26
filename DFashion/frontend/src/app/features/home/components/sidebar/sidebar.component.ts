import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/product.model';
import { TrendingProductsComponent } from '../trending-products/trending-products.component';
import { FeaturedBrandsComponent } from '../featured-brands/featured-brands.component';
import { NewArrivalsComponent } from '../new-arrivals/new-arrivals.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TrendingProductsComponent,
    FeaturedBrandsComponent,
    NewArrivalsComponent
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
    // Load from API - empty for now
    this.suggestedUsers = [];
  }

  loadTrendingProducts() {
    // Load from API - empty for now
    this.trendingProducts = [];
  }

  loadTopInfluencers() {
    // Load from API - empty for now
    this.topInfluencers = [];
  }

  loadCategories() {
    this.categories = [
      {
        name: 'Women',
        slug: 'women',
        image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=100'
      },
      {
        name: 'Men',
        slug: 'men',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100'
      },
      {
        name: 'Kids',
        slug: 'children',
        image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=100'
      },
      {
        name: 'Ethnic',
        slug: 'ethnic',
        image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=100'
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
