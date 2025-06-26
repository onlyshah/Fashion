import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TrendingService, FeaturedBrand } from '../../../../core/services/trending.service';
import { Product } from '../../../../core/models/product.model';
import { SocialInteractionsService } from '../../../../core/services/social-interactions.service';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-featured-brands',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './featured-brands.component.html',
  styleUrls: ['./featured-brands.component.scss']
})
export class FeaturedBrandsComponent implements OnInit, OnDestroy {
  featuredBrands: FeaturedBrand[] = [];
  isLoading = true;
  error: string | null = null;
  likedProducts = new Set<string>();
  private subscription: Subscription = new Subscription();

  constructor(
    private trendingService: TrendingService,
    private socialService: SocialInteractionsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadFeaturedBrands();
    this.subscribeFeaturedBrands();
    this.subscribeLikedProducts();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private subscribeFeaturedBrands() {
    this.subscription.add(
      this.trendingService.featuredBrands$.subscribe(brands => {
        this.featuredBrands = brands;
        this.isLoading = false;
      })
    );
  }

  private subscribeLikedProducts() {
    this.subscription.add(
      this.socialService.likedProducts$.subscribe(likedProducts => {
        this.likedProducts = likedProducts;
      })
    );
  }

  private async loadFeaturedBrands() {
    try {
      this.isLoading = true;
      this.error = null;
      await this.trendingService.loadFeaturedBrands();
    } catch (error) {
      console.error('Error loading featured brands:', error);
      this.error = 'Failed to load featured brands';
      this.isLoading = false;
    }
  }

  onBrandClick(brand: FeaturedBrand) {
    this.router.navigate(['/products'], { 
      queryParams: { brand: brand.brand } 
    });
  }

  onProductClick(product: Product, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/product', product._id]);
  }

  async onLikeProduct(product: Product, event: Event) {
    event.stopPropagation();
    try {
      const result = await this.socialService.likeProduct(product._id);
      if (result.success) {
        console.log(result.message);
      } else {
        console.error('Failed to like product:', result.message);
      }
    } catch (error) {
      console.error('Error liking product:', error);
    }
  }

  async onShareProduct(product: Product, event: Event) {
    event.stopPropagation();
    try {
      const productUrl = `${window.location.origin}/product/${product._id}`;
      await navigator.clipboard.writeText(productUrl);

      await this.socialService.shareProduct(product._id, {
        platform: 'copy_link',
        message: `Check out this amazing ${product.name} from ${product.brand}!`
      });

      console.log('Product link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing product:', error);
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  onRetry() {
    this.loadFeaturedBrands();
  }

  trackByBrandName(index: number, brand: FeaturedBrand): string {
    return brand.brand;
  }

  isProductLiked(productId: string): boolean {
    return this.likedProducts.has(productId);
  }

  trackByProductId(index: number, product: Product): string {
    return product._id;
  }
}
