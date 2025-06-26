import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TrendingService } from '../../../../core/services/trending.service';
import { Product } from '../../../../core/models/product.model';
import { SocialInteractionsService } from '../../../../core/services/social-interactions.service';
import { CartService } from '../../../../core/services/cart.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-new-arrivals',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './new-arrivals.component.html',
  styleUrls: ['./new-arrivals.component.scss']
})
export class NewArrivalsComponent implements OnInit, OnDestroy {
  newArrivals: Product[] = [];
  isLoading = true;
  error: string | null = null;
  likedProducts = new Set<string>();
  private subscription: Subscription = new Subscription();

  constructor(
    private trendingService: TrendingService,
    private socialService: SocialInteractionsService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadNewArrivals();
    this.subscribeNewArrivals();
    this.subscribeLikedProducts();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private subscribeNewArrivals() {
    this.subscription.add(
      this.trendingService.newArrivals$.subscribe(products => {
        this.newArrivals = products;
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

  private async loadNewArrivals() {
    try {
      this.isLoading = true;
      this.error = null;
      await this.trendingService.loadNewArrivals(1, 6);
    } catch (error) {
      console.error('Error loading new arrivals:', error);
      this.error = 'Failed to load new arrivals';
      this.isLoading = false;
    }
  }

  onProductClick(product: Product) {
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
        message: `Check out this fresh arrival: ${product.name} from ${product.brand}!`
      });

      console.log('Product link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing product:', error);
    }
  }

  async onAddToCart(product: Product, event: Event) {
    event.stopPropagation();
    try {
      await this.cartService.addToCart(product._id, 1);
      console.log('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }

  async onAddToWishlist(product: Product, event: Event) {
    event.stopPropagation();
    try {
      await this.wishlistService.addToWishlist(product._id);
      console.log('Product added to wishlist!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  }

  getDiscountPercentage(product: Product): number {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  }

  getDaysAgo(createdAt: Date): number {
    const now = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  onRetry() {
    this.loadNewArrivals();
  }

  onViewAll() {
    this.router.navigate(['/products'], { 
      queryParams: { filter: 'new-arrivals' } 
    });
  }

  isProductLiked(productId: string): boolean {
    return this.likedProducts.has(productId);
  }

  trackByProductId(index: number, product: Product): string {
    return product._id;
  }
}
