import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { RecommendationService, RecommendationProduct } from '../../../core/services/recommendation.service';
import { AuthService } from '../../../core/services/auth.service';
import { DataFlowService } from '../../../core/services/data-flow.service';

@Component({
  selector: 'app-recommendation-widget',
  templateUrl: './recommendation-widget.component.html',
  styleUrls: ['./recommendation-widget.component.scss']
})
export class RecommendationWidgetComponent implements OnInit, OnDestroy {
  @Input() title: string = 'Recommended for You';
  @Input() type: 'suggested' | 'trending' | 'similar' | 'category' = 'suggested';
  @Input() category?: string;
  @Input() productId?: string;
  @Input() limit: number = 10;
  @Input() showReason: boolean = true;
  @Input() layout: 'horizontal' | 'grid' = 'horizontal';

  recommendations: RecommendationProduct[] = [];
  loading: boolean = false;
  error: string | null = null;
  currentUser: any = null;

  private destroy$ = new Subject<void>();

  constructor(
    private recommendationService: RecommendationService,
    private authService: AuthService,
    private dataFlowService: DataFlowService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadRecommendations();

    // Subscribe to real-time updates for suggested products
    if (this.type === 'suggested') {
      this.recommendationService.getRealTimeRecommendations()
        .pipe(takeUntil(this.destroy$))
        .subscribe(recommendations => {
          if (recommendations.length > 0) {
            this.recommendations = recommendations.slice(0, this.limit);
          }
        });
    }

    // Subscribe to auth changes
    this.authService.getCurrentUser$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user && this.type === 'suggested') {
          this.loadRecommendations();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRecommendations() {
    this.loading = true;
    this.error = null;

    let recommendationObservable;

    switch (this.type) {
      case 'suggested':
        recommendationObservable = this.recommendationService.getSuggestedProducts(
          this.currentUser?._id,
          this.limit
        );
        break;

      case 'trending':
        recommendationObservable = this.recommendationService.getTrendingProducts(
          this.category,
          this.limit
        );
        break;

      case 'similar':
        if (!this.productId) {
          this.error = 'Product ID required for similar products';
          this.loading = false;
          return;
        }
        recommendationObservable = this.recommendationService.getSimilarProducts(
          this.productId,
          this.limit
        );
        break;

      case 'category':
        if (!this.category) {
          this.error = 'Category required for category recommendations';
          this.loading = false;
          return;
        }
        recommendationObservable = this.recommendationService.getCategoryRecommendations(
          this.category,
          this.limit
        );
        break;

      default:
        this.error = 'Invalid recommendation type';
        this.loading = false;
        return;
    }

    recommendationObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (recommendations) => {
          this.recommendations = recommendations;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading recommendations:', error);
          this.error = 'Failed to load recommendations';
          this.loading = false;
        }
      });
  }

  onProductClick(product: RecommendationProduct) {
    // Track product click
    if (this.currentUser) {
      this.recommendationService.trackProductView(
        product._id,
        product.category,
        0,
        `recommendation_widget_${this.type}`
      ).subscribe();
    }

    // Navigate to product detail
    this.router.navigate(['/product', product._id]);
  }

  onProductLike(product: RecommendationProduct, event: Event) {
    event.stopPropagation();
    
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Track like interaction
    this.recommendationService.trackProductLike(product._id, {
      source: `recommendation_widget_${this.type}`,
      category: product.category,
      brand: product.brand
    }).subscribe();

    // Update product like status (you might want to add this to the product model)
    // product.isLiked = !product.isLiked;
  }

  onProductShare(product: RecommendationProduct, platform: string, event: Event) {
    event.stopPropagation();

    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Track share interaction
    this.recommendationService.trackProductShare(product._id, platform, {
      source: `recommendation_widget_${this.type}`,
      category: product.category,
      brand: product.brand
    }).subscribe();

    // Implement actual sharing logic here
    this.shareProduct(product, platform);
  }

  onAddToCart(product: RecommendationProduct, event: Event) {
    event.stopPropagation();

    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Track cart add interaction
    this.recommendationService.trackCartAdd(product._id, {
      source: `recommendation_widget_${this.type}`,
      category: product.category,
      brand: product.brand,
      price: product.price
    }).subscribe();

    // Add to cart logic
    this.dataFlowService.addToCart(product).subscribe({
      next: () => {
        console.log('Product added to cart');
        // Show success message
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        // Show error message
      }
    });
  }

  onAddToWishlist(product: RecommendationProduct, event: Event) {
    event.stopPropagation();

    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Track wishlist add interaction
    this.recommendationService.trackWishlistAdd(product._id, {
      source: `recommendation_widget_${this.type}`,
      category: product.category,
      brand: product.brand
    }).subscribe();

    // Add to wishlist logic
    this.dataFlowService.addToWishlist(product).subscribe({
      next: () => {
        console.log('Product added to wishlist');
        // Show success message
      },
      error: (error) => {
        console.error('Error adding to wishlist:', error);
        // Show error message
      }
    });
  }

  private shareProduct(product: RecommendationProduct, platform: string) {
    const url = `${window.location.origin}/product/${product._id}`;
    const text = `Check out this ${product.name} on DFashion!`;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          console.log('Link copied to clipboard');
          // Show success message
        });
        break;
    }
  }

  refresh() {
    this.loadRecommendations();
  }

  getRecommendationIcon(): string {
    switch (this.type) {
      case 'suggested': return 'person';
      case 'trending': return 'trending_up';
      case 'similar': return 'compare_arrows';
      case 'category': return 'category';
      default: return 'recommend';
    }
  }

  getRecommendationColor(): string {
    switch (this.type) {
      case 'suggested': return 'primary';
      case 'trending': return 'warning';
      case 'similar': return 'accent';
      case 'category': return 'secondary';
      default: return 'primary';
    }
  }
}
