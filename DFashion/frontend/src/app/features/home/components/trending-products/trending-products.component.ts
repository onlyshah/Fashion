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
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-trending-products',
  standalone: true,
  imports: [CommonModule, IonicModule, CarouselModule],
  templateUrl: './trending-products.component.html',
  styleUrls: ['./trending-products.component.scss']
})
export class TrendingProductsComponent implements OnInit, OnDestroy {
  trendingProducts: Product[] = [];
  isLoading = true;
  error: string | null = null;
  likedProducts = new Set<string>();
  private subscription: Subscription = new Subscription();

  // Slider properties
  currentSlide = 0;
  slideOffset = 0;
  cardWidth = 280; // Width of each product card including margin
  visibleCards = 4; // Number of cards visible at once
  maxSlide = 0;

  // Auto-sliding properties
  autoSlideInterval: any;
  autoSlideDelay = 3000; // 3 seconds
  isAutoSliding = true;
  isPaused = false;

  // Owl Carousel Options with Auto-sliding
  carouselOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: true,
    navSpeed: 700,
    navText: [
      '<ion-icon name="chevron-back"></ion-icon>',
      '<ion-icon name="chevron-forward"></ion-icon>'
    ],
    autoplay: true,
    autoplayTimeout: 4000,        // 4 seconds between slides
    autoplayHoverPause: true,     // Pause on hover
    autoplaySpeed: 1000,          // Smooth 1 second transition
    smartSpeed: 1000,             // Smart speed for better UX
    fluidSpeed: true,             // Fluid speed calculation
    responsive: {
      0: {
        items: 1,
        margin: 10,
        nav: false,               // Hide nav on mobile for cleaner look
        dots: true
      },
      576: {
        items: 2,
        margin: 15,
        nav: true,
        dots: true
      },
      768: {
        items: 3,
        margin: 20,
        nav: true,
        dots: true
      },
      992: {
        items: 4,
        margin: 20,
        nav: true,
        dots: false               // Hide dots on desktop, show nav instead
      }
    },
    nav: true,
    margin: 20,
    stagePadding: 0,
    center: false,
    animateOut: false,
    animateIn: false
  };

  constructor(
    private trendingService: TrendingService,
    private socialService: SocialInteractionsService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadTrendingProducts();
    this.subscribeTrendingProducts();
    this.subscribeLikedProducts();
    this.updateResponsiveSettings();
    this.setupResizeListener();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.stopAutoSlide();
  }

  private subscribeTrendingProducts() {
    this.subscription.add(
      this.trendingService.trendingProducts$.subscribe(products => {
        this.trendingProducts = products;
        this.isLoading = false;
        this.updateSliderOnProductsLoad();
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

  private async loadTrendingProducts() {
    try {
      this.isLoading = true;
      this.error = null;
      await this.trendingService.loadTrendingProducts(1, 8);
    } catch (error) {
      console.error('Error loading trending products:', error);
      this.error = 'Failed to load trending products';
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
      // For now, copy link to clipboard
      const productUrl = `${window.location.origin}/product/${product._id}`;
      await navigator.clipboard.writeText(productUrl);

      // Track the share
      await this.socialService.shareProduct(product._id, {
        platform: 'copy_link',
        message: `Check out this amazing ${product.name} from ${product.brand}!`
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

  onRetry() {
    this.loadTrendingProducts();
  }

  onViewAll() {
    this.router.navigate(['/products'], {
      queryParams: { filter: 'trending' }
    });
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
      if (!this.isPaused && this.trendingProducts.length > this.visibleCards) {
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
      // Reset to beginning for infinite loop
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
    if (width <= 480) {
      this.cardWidth = 195; // 180px + 15px gap
      this.visibleCards = 1;
    } else if (width <= 768) {
      this.cardWidth = 215; // 200px + 15px gap
      this.visibleCards = 2;
    } else if (width <= 1200) {
      this.cardWidth = 260; // 240px + 20px gap
      this.visibleCards = 3;
    } else {
      this.cardWidth = 280; // 260px + 20px gap
      this.visibleCards = 4;
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
    this.maxSlide = Math.max(0, this.trendingProducts.length - this.visibleCards);
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

  private restartAutoSlideAfterInteraction() {
    this.stopAutoSlide();
    setTimeout(() => {
      this.startAutoSlide();
    }, 2000); // Wait 2 seconds before resuming auto-slide
  }

  private updateSlideOffset() {
    this.slideOffset = -this.currentSlide * this.cardWidth;
  }

  // Update slider when products load
  private updateSliderOnProductsLoad() {
    setTimeout(() => {
      this.updateSliderLimits();
      this.currentSlide = 0;
      this.slideOffset = 0;
      this.startAutoSlide();
    }, 100);
  }
}
