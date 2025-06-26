import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../../core/services/product.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CartService } from '../../../../core/services/cart.service';
import { WishlistService } from '../../../../core/services/wishlist.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {
  featuredBrands: any[] = [];
  trendingProducts: any[] = [];
  newArrivals: any[] = [];
  categories: any[] = [];
  searchQuery: string = '';
  loading = true;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadShopData();
  }

  loadShopData() {
    this.loading = true;
    Promise.all([
      this.loadFeaturedBrands(),
      this.loadTrendingProducts(),
      this.loadNewArrivals(),
      this.loadCategories()
    ]).finally(() => {
      this.loading = false;
    });
  }

  loadFeaturedBrands() {
    return this.productService.getFeaturedBrands().toPromise().then(
      (response) => {
        this.featuredBrands = response?.data || [];
      }
    ).catch(error => {
      console.error('Error loading featured brands:', error);
      this.featuredBrands = [];
    });
  }

  loadTrendingProducts() {
    return this.productService.getTrendingProducts().toPromise().then(
      (response) => {
        this.trendingProducts = response?.data || [];
      }
    ).catch(error => {
      console.error('Error loading trending products:', error);
      this.trendingProducts = [];
    });
  }

  loadNewArrivals() {
    return this.productService.getNewArrivals().toPromise().then(
      (response) => {
        this.newArrivals = response?.data || [];
      }
    ).catch(error => {
      console.error('Error loading new arrivals:', error);
      this.newArrivals = [];
    });
  }

  loadCategories() {
    return this.productService.getCategories().toPromise().then(
      (response) => {
        this.categories = response?.data || [];
      }
    ).catch(error => {
      console.error('Error loading categories:', error);
      this.categories = [];
    });
  }

  // Product interaction methods
  likeProduct(product: any, event: Event) {
    event.stopPropagation();
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }

    product.isLiked = !product.isLiked;
    product.likesCount = product.isLiked ? (product.likesCount || 0) + 1 : (product.likesCount || 1) - 1;

    this.productService.toggleProductLike(product._id).subscribe({
      next: (response) => {
        console.log('Product like updated:', response);
      },
      error: (error) => {
        console.error('Error updating product like:', error);
        product.isLiked = !product.isLiked;
        product.likesCount = product.isLiked ? (product.likesCount || 0) + 1 : (product.likesCount || 1) - 1;
      }
    });
  }

  shareProduct(product: any, event: Event) {
    event.stopPropagation();
    const shareData = {
      title: product.name,
      text: `Check out this amazing product: ${product.name}`,
      url: `${window.location.origin}/product/${product._id}`
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(shareData.url).then(() => {
        alert('Product link copied to clipboard!');
      });
    }

    this.productService.shareProduct(product._id).subscribe({
      next: (response) => {
        product.sharesCount = (product.sharesCount || 0) + 1;
      },
      error: (error) => {
        console.error('Error tracking product share:', error);
      }
    });
  }

  commentOnProduct(product: any, event: Event) {
    event.stopPropagation();
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }

    this.router.navigate(['/product', product._id], {
      queryParams: { action: 'comment' }
    });
  }

  addToWishlist(product: any, event: Event) {
    event.stopPropagation();
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }

    this.wishlistService.addToWishlist(product._id).subscribe({
      next: (response) => {
        product.isInWishlist = true;
        console.log('Product added to wishlist:', response);
      },
      error: (error) => {
        console.error('Error adding to wishlist:', error);
      }
    });
  }

  addToCart(product: any, event: Event) {
    event.stopPropagation();
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }

    this.cartService.addToCart(product._id, 1).subscribe({
      next: (response) => {
        console.log('Product added to cart:', response);
        alert('Product added to cart successfully!');
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
      }
    });
  }

  // Navigation methods
  viewProduct(product: any) {
    this.router.navigate(['/product', product._id]);
  }

  navigateToCategory(category: any) {
    this.router.navigate(['/category', category.slug]);
  }

  search() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], {
        queryParams: { q: this.searchQuery }
      });
    }
  }

  getProductImage(product: any): string {
    return product.images?.[0]?.url || '/assets/images/placeholder.jpg';
  }

  getDiscountPercentage(product: any): number {
    if (!product.originalPrice || product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }
}
