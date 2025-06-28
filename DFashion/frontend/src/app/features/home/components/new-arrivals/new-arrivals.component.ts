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
import { CarouselModule } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-new-arrivals',
  standalone: true,
  imports: [CommonModule, IonicModule, CarouselModule],
  templateUrl: './new-arrivals.component.html',
  styleUrls: ['./new-arrivals.component.scss']
})
export class NewArrivalsComponent implements OnInit, OnDestroy {
  newArrivals: Product[] = [];
  isLoading = true;
  error: string | null = null;
  likedProducts = new Set<string>();
  private subscription: Subscription = new Subscription();

  // Slider properties
  currentSlide = 0;
  slideOffset = 0;
  cardWidth = 280;
  visibleCards = 4;
  maxSlide = 0;
  autoSlideInterval: any;
  autoSlideDelay = 3500; // 3.5 seconds for new arrivals

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
    this.initializeSlider();
    this.startAutoSlide();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.stopAutoSlide();
  }

  private subscribeNewArrivals() {
    this.subscription.add(
      this.trendingService.newArrivals$.subscribe(products => {
        this.newArrivals = products;
        this.isLoading = false;
        this.calculateMaxSlide();
        this.currentSlide = 0;
        this.updateSlidePosition();
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

  // Slider methods
  private initializeSlider() {
    this.updateResponsiveSettings();
    this.calculateMaxSlide();
    window.addEventListener('resize', () => this.updateResponsiveSettings());
  }

  private updateResponsiveSettings() {
    const containerWidth = window.innerWidth;

    if (containerWidth >= 1200) {
      this.visibleCards = 4;
      this.cardWidth = 280;
    } else if (containerWidth >= 992) {
      this.visibleCards = 3;
      this.cardWidth = 260;
    } else if (containerWidth >= 768) {
      this.visibleCards = 2;
      this.cardWidth = 240;
    } else {
      this.visibleCards = 1;
      this.cardWidth = 220;
    }

    this.calculateMaxSlide();
    this.updateSlidePosition();
  }

  private calculateMaxSlide() {
    this.maxSlide = Math.max(0, this.newArrivals.length - this.visibleCards);
  }

  private updateSlidePosition() {
    this.slideOffset = this.currentSlide * (this.cardWidth + 16); // 16px gap
  }

  nextSlide() {
    if (this.currentSlide < this.maxSlide) {
      this.currentSlide++;
      this.updateSlidePosition();
    }
  }

  prevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.updateSlidePosition();
    }
  }

  private startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      if (this.currentSlide >= this.maxSlide) {
        this.currentSlide = 0;
      } else {
        this.currentSlide++;
      }
      this.updateSlidePosition();
    }, this.autoSlideDelay);
  }

  private stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  pauseAutoSlide() {
    this.stopAutoSlide();
  }

  resumeAutoSlide() {
    this.startAutoSlide();
  }

  get canGoPrev(): boolean {
    return this.currentSlide > 0;
  }

  get canGoNext(): boolean {
    return this.currentSlide < this.maxSlide;
  }
}
