import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TrendingService, FeaturedBrand } from '../../../../core/services/trending.service';
import { Product } from '../../../../core/models/product.model';
import { SocialInteractionsService } from '../../../../core/services/social-interactions.service';
import { IonicModule } from '@ionic/angular';
import { CarouselModule } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-featured-brands',
  standalone: true,
  imports: [CommonModule, IonicModule, CarouselModule],
  templateUrl: './featured-brands.component.html',
  styleUrls: ['./featured-brands.component.scss']
})
export class FeaturedBrandsComponent implements OnInit, OnDestroy {
  featuredBrands: FeaturedBrand[] = [];
  isLoading = true;
  error: string | null = null;
  likedProducts = new Set<string>();
  private subscription: Subscription = new Subscription();

  // Slider properties
  currentSlide = 0;
  slideOffset = 0;
  cardWidth = 320; // Width of each brand card including margin
  visibleCards = 3; // Number of cards visible at once
  maxSlide = 0;

  // Auto-sliding properties
  autoSlideInterval: any;
  autoSlideDelay = 4000; // 4 seconds for brands
  isAutoSliding = true;
  isPaused = false;

  constructor(
    private trendingService: TrendingService,
    private socialService: SocialInteractionsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadFeaturedBrands();
    this.subscribeFeaturedBrands();
    this.subscribeLikedProducts();
    this.updateResponsiveSettings();
    this.setupResizeListener();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.stopAutoSlide();
  }

  private subscribeFeaturedBrands() {
    this.subscription.add(
      this.trendingService.featuredBrands$.subscribe(brands => {
        this.featuredBrands = brands;
        this.isLoading = false;
        this.updateSliderOnBrandsLoad();
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

  // Auto-sliding methods
  private startAutoSlide() {
    if (!this.isAutoSliding || this.isPaused) return;

    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => {
      if (!this.isPaused && this.featuredBrands.length > this.visibleCards) {
        this.autoSlideNext();
      }
    }, this.autoSlideDelay);
  }

  private stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  private autoSlideNext() {
    if (this.currentSlide >= this.maxSlide) {
      this.currentSlide = 0;
    } else {
      this.currentSlide++;
    }
    this.updateSlideOffset();
  }

  pauseAutoSlide() {
    this.isPaused = true;
    this.stopAutoSlide();
  }

  resumeAutoSlide() {
    this.isPaused = false;
    this.startAutoSlide();
  }

  // Responsive methods
  private updateResponsiveSettings() {
    const width = window.innerWidth;
    if (width <= 768) {
      this.cardWidth = 280;
      this.visibleCards = 1;
    } else if (width <= 1200) {
      this.cardWidth = 320;
      this.visibleCards = 2;
    } else {
      this.cardWidth = 340;
      this.visibleCards = 3;
    }
    this.updateSliderLimits();
    this.updateSlideOffset();
  }

  private setupResizeListener() {
    window.addEventListener('resize', () => {
      this.updateResponsiveSettings();
    });
  }

  // Slider methods
  updateSliderLimits() {
    this.maxSlide = Math.max(0, this.featuredBrands.length - this.visibleCards);
  }

  slidePrev() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.updateSlideOffset();
      this.restartAutoSlideAfterInteraction();
    }
  }

  slideNext() {
    if (this.currentSlide < this.maxSlide) {
      this.currentSlide++;
      this.updateSlideOffset();
      this.restartAutoSlideAfterInteraction();
    }
  }

  private updateSlideOffset() {
    this.slideOffset = -this.currentSlide * this.cardWidth;
  }

  private restartAutoSlideAfterInteraction() {
    this.stopAutoSlide();
    setTimeout(() => {
      this.startAutoSlide();
    }, 2000);
  }

  // Update slider when brands load
  private updateSliderOnBrandsLoad() {
    setTimeout(() => {
      this.updateSliderLimits();
      this.currentSlide = 0;
      this.slideOffset = 0;
      this.startAutoSlide();
    }, 100);
  }
}
