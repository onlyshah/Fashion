import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WishlistNewService, WishlistItem } from '../../core/services/wishlist-new.service';
import { CartNewService } from '../../core/services/cart-new.service';
import { AuthService } from '../../core/services/auth.service';

// WishlistItem interface is now imported from the service

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wishlist.component.html',
  styles: [`
    .wishlist-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .wishlist-header {
      margin-bottom: 30px;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      font-size: 0.9rem;
      color: #666;
    }

    .breadcrumb span {
      cursor: pointer;
    }

    .breadcrumb span:hover {
      color: #007bff;
    }

    .breadcrumb .current {
      color: #333;
      font-weight: 500;
    }

    .wishlist-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 8px;
      color: #333;
    }

    .wishlist-count {
      font-size: 1.1rem;
      color: #666;
      margin: 0;
    }

    .wishlist-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .action-buttons {
      display: flex;
      gap: 12px;
    }

    .btn-move-all, .btn-clear-all {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-move-all {
      background: #007bff;
      color: white;
    }

    .btn-move-all:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-clear-all {
      background: #f8f9fa;
      color: #dc3545;
      border: 1px solid #dc3545;
    }

    .btn-clear-all:hover:not(:disabled) {
      background: #dc3545;
      color: white;
    }

    .sort-options {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sort-options label {
      font-weight: 500;
      color: #333;
    }

    .sort-options select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.9rem;
    }

    .wishlist-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    .wishlist-item {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }

    .wishlist-item:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }

    .item-image {
      position: relative;
      height: 250px;
      overflow: hidden;
      cursor: pointer;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .wishlist-item:hover .item-image img {
      transform: scale(1.05);
    }

    .discount-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: #ff4757;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .unavailable-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
    }

    .item-details {
      padding: 20px;
    }

    .product-name {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 4px;
      color: #333;
      line-height: 1.3;
      cursor: pointer;
    }

    .product-name:hover {
      color: #007bff;
    }

    .product-brand {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 8px;
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .stars {
      display: flex;
      gap: 2px;
    }

    .stars i {
      font-size: 0.8rem;
      color: #ffc107;
    }

    .rating-count {
      font-size: 0.8rem;
      color: #666;
    }

    .product-price {
      margin-bottom: 12px;
    }

    .current-price {
      font-size: 1.2rem;
      font-weight: 700;
      color: #333;
    }

    .original-price {
      font-size: 0.9rem;
      color: #999;
      text-decoration: line-through;
      margin-left: 8px;
    }

    .added-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: #666;
      margin-bottom: 16px;
    }

    .added-from {
      text-transform: capitalize;
    }

    .item-actions {
      display: flex;
      gap: 8px;
      padding: 0 20px 20px;
    }

    .btn-add-cart, .btn-remove {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-add-cart {
      background: #007bff;
      color: white;
    }

    .btn-add-cart:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-add-cart:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .btn-remove {
      background: #f8f9fa;
      color: #dc3545;
      border: 1px solid #dc3545;
    }

    .btn-remove:hover:not(:disabled) {
      background: #dc3545;
      color: white;
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
    }

    .empty-content i {
      font-size: 4rem;
      color: #ff6b9d;
      margin-bottom: 20px;
    }

    .empty-content h2 {
      font-size: 1.8rem;
      margin-bottom: 10px;
      color: #333;
    }

    .empty-content p {
      color: #666;
      margin-bottom: 30px;
      font-size: 1.1rem;
    }

    .empty-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
    }

    .btn-primary, .btn-secondary {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .btn-secondary {
      background: #f8f9fa;
      color: #007bff;
      border: 1px solid #007bff;
    }

    .btn-secondary:hover {
      background: #007bff;
      color: white;
    }

    .loading-state {
      text-align: center;
      padding: 80px 20px;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .wishlist-header h1 {
        font-size: 2rem;
      }

      .wishlist-actions {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .action-buttons {
        justify-content: center;
      }

      .sort-options {
        justify-content: space-between;
      }

      .wishlist-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .empty-actions {
        flex-direction: column;
        align-items: center;
      }
    }
  `]
})
export class WishlistComponent implements OnInit {
  wishlistItems: WishlistItem[] = [];
  sortedWishlistItems: WishlistItem[] = [];
  loading = true;
  sortBy = 'recent';

  constructor(
    private router: Router,
    private wishlistService: WishlistNewService,
    private cartService: CartNewService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadWishlist();
  }

  loadWishlist() {
    this.loading = true;

    this.wishlistService.loadWishlist().subscribe({
      next: (response) => {
        if (response.success) {
          this.wishlistItems = response.wishlist.items;
          this.sortWishlist();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading wishlist:', error);
        this.loading = false;
      }
    });
  }

  // Removed mock data - now using real API data from seeder

  sortWishlist() {
    let sorted = [...this.wishlistItems];
    
    switch (this.sortBy) {
      case 'recent':
        sorted.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        break;
      case 'price-low':
        sorted.sort((a, b) => a.product.price - b.product.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.product.price - a.product.price);
        break;
      case 'name':
        sorted.sort((a, b) => a.product.name.localeCompare(b.product.name));
        break;
    }
    
    this.sortedWishlistItems = sorted;
  }

  getProductImage(product: any): string {
    return product.images[0]?.url || '/assets/images/placeholder.jpg';
  }

  getDiscountPercentage(product: any): number {
    if (!product.originalPrice || product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }

  viewProduct(product: any) {
    this.router.navigate(['/product', product._id]);
  }

  addToCart(item: WishlistItem) {
    this.cartService.addFromWishlist(item.product._id, 1, item.size, item.color).subscribe({
      next: (response) => {
        if (response.success) {
          // Optionally remove from wishlist after adding to cart
          // this.removeFromWishlist(item);
        }
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
      }
    });
  }

  removeFromWishlist(item: WishlistItem) {
    this.wishlistService.removeFromWishlist(item._id).subscribe({
      next: (response) => {
        if (response.success) {
          // Refresh the wishlist to get updated data and count
          this.loadWishlist();
          console.log('✅ Item removed from wishlist successfully');
        }
      },
      error: (error) => {
        console.error('Error removing from wishlist:', error);
      }
    });
  }

  moveAllToCart() {
    const activeItems = this.wishlistItems.filter(item => item.product.isActive);

    if (activeItems.length === 0) {
      alert('No available items to move to cart');
      return;
    }

    if (confirm(`Move ${activeItems.length} items to cart?`)) {
      // Move items one by one
      activeItems.forEach(item => {
        this.wishlistService.moveToCart(item._id, 1).subscribe({
          next: (response) => {
            if (response.success) {
              this.loadWishlist(); // Refresh wishlist
            }
          },
          error: (error) => {
            console.error('Error moving to cart:', error);
          }
        });
      });
    }
  }

  clearWishlist() {
    if (confirm('Are you sure you want to clear your entire wishlist?')) {
      // Remove all items one by one
      this.wishlistItems.forEach(item => {
        this.removeFromWishlist(item);
      });
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  goShopping() {
    this.router.navigate(['/shop']);
  }

  browsePosts() {
    this.router.navigate(['/posts']);
  }
}
