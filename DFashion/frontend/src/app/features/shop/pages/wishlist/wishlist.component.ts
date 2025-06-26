import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { WishlistService, WishlistItem } from '../../../../core/services/wishlist.service';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="wishlist-page">
      <div class="wishlist-header">
        <h1>My Wishlist</h1>
        <p *ngIf="wishlistItems.length > 0">{{ wishlistItems.length }} items</p>
      </div>

      <div class="wishlist-content" *ngIf="wishlistItems.length > 0">
        <div class="wishlist-grid">
          <div *ngFor="let item of wishlistItems" class="wishlist-item">
            <div class="item-image">
              <img [src]="item.product.images[0].url" [alt]="item.product.name">
              <button class="remove-btn" (click)="removeFromWishlist(item.product._id)">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="item-details">
              <h3>{{ item.product.name }}</h3>
              <p class="brand">{{ item.product.brand }}</p>
              <div class="price">
                <span class="current-price">₹{{ item.product.price | number }}</span>
                <span class="original-price" *ngIf="item.product.originalPrice">₹{{ item.product.originalPrice | number }}</span>
                <span class="discount" *ngIf="item.product.discount > 0">{{ item.product.discount }}% OFF</span>
              </div>
              <div class="rating" *ngIf="item.product.rating">
                <div class="stars">
                  <i *ngFor="let star of getStars(item.product.rating.average)" [class]="star"></i>
                </div>
                <span>({{ item.product.rating.count }})</span>
              </div>
              <div class="item-actions">
                <button class="add-to-cart-btn" (click)="addToCart(item.product._id)">
                  <i class="fas fa-shopping-cart"></i>
                  Add to Cart
                </button>
                <button class="view-product-btn" (click)="viewProduct(item.product._id)">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="wishlist-actions">
          <button class="clear-wishlist-btn" (click)="clearWishlist()">
            Clear Wishlist
          </button>
          <button class="continue-shopping-btn" (click)="continueShopping()">
            Continue Shopping
          </button>
        </div>
      </div>

      <div class="empty-wishlist" *ngIf="wishlistItems.length === 0 && !isLoading">
        <i class="fas fa-heart"></i>
        <h3>Your wishlist is empty</h3>
        <p>Save items you love to your wishlist</p>
        <button class="shop-now-btn" (click)="continueShopping()">
          Shop Now
        </button>
      </div>

      <div class="loading-container" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Loading wishlist...</p>
      </div>
    </div>
  `,
  styles: [`
    .wishlist-page {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .wishlist-header {
      margin-bottom: 2rem;
      text-align: center;
    }

    .wishlist-header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: #333;
    }

    .wishlist-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .wishlist-item {
      border: 1px solid #eee;
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .wishlist-item:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .item-image {
      position: relative;
      aspect-ratio: 1;
      overflow: hidden;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      color: #dc3545;
    }

    .remove-btn:hover {
      background: #dc3545;
      color: white;
      transform: scale(1.1);
    }

    .item-details {
      padding: 1rem;
    }

    .item-details h3 {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #333;
    }

    .brand {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .price {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      flex-wrap: wrap;
    }

    .current-price {
      font-size: 1.2rem;
      font-weight: 700;
      color: #e91e63;
    }

    .original-price {
      font-size: 1rem;
      color: #999;
      text-decoration: line-through;
    }

    .discount {
      background: #e91e63;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .stars {
      display: flex;
      gap: 2px;
    }

    .stars i {
      color: #ffc107;
      font-size: 0.9rem;
    }

    .item-actions {
      display: flex;
      gap: 0.5rem;
    }

    .add-to-cart-btn {
      flex: 1;
      background: #007bff;
      color: white;
      border: none;
      padding: 0.75rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: background 0.2s;
    }

    .add-to-cart-btn:hover {
      background: #0056b3;
    }

    .view-product-btn {
      flex: 1;
      background: transparent;
      color: #007bff;
      border: 2px solid #007bff;
      padding: 0.75rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .view-product-btn:hover {
      background: #007bff;
      color: white;
    }

    .wishlist-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
    }

    .clear-wishlist-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .clear-wishlist-btn:hover {
      background: #c82333;
    }

    .continue-shopping-btn {
      background: transparent;
      color: #007bff;
      border: 2px solid #007bff;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .continue-shopping-btn:hover {
      background: #007bff;
      color: white;
    }

    .empty-wishlist {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }

    .empty-wishlist i {
      font-size: 4rem;
      margin-bottom: 1rem;
      color: #e91e63;
    }

    .shop-now-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 1rem;
    }

    .loading-container {
      text-align: center;
      padding: 4rem 2rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .wishlist-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
      }

      .wishlist-actions {
        flex-direction: column;
        align-items: center;
      }

      .clear-wishlist-btn,
      .continue-shopping-btn {
        width: 100%;
        max-width: 300px;
      }
    }
  `]
})
export class WishlistComponent implements OnInit {
  wishlistItems: WishlistItem[] = [];
  isLoading = true;

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadWishlist();
    this.subscribeToWishlistUpdates();
  }

  loadWishlist() {
    this.wishlistService.getWishlist().subscribe({
      next: (response) => {
        this.wishlistItems = response.data.items;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load wishlist:', error);
        this.isLoading = false;
        this.wishlistItems = [];
      }
    });
  }

  subscribeToWishlistUpdates() {
    this.wishlistService.wishlistItems$.subscribe(items => {
      this.wishlistItems = items;
    });
  }

  removeFromWishlist(productId: string) {
    this.wishlistService.removeFromWishlist(productId).subscribe({
      next: () => {
        this.loadWishlist(); // Refresh wishlist
      },
      error: (error) => {
        console.error('Failed to remove from wishlist:', error);
      }
    });
  }

  addToCart(productId: string) {
    this.cartService.addToCart(productId, 1).subscribe({
      next: () => {
        this.showNotification('Added to cart successfully!');
      },
      error: (error) => {
        console.error('Failed to add to cart:', error);
        this.showNotification('Failed to add to cart');
      }
    });
  }

  viewProduct(productId: string) {
    this.router.navigate(['/product', productId]);
  }

  clearWishlist() {
    if (confirm('Are you sure you want to clear your entire wishlist?')) {
      this.wishlistService.clearWishlist().subscribe({
        next: () => {
          this.wishlistItems = [];
        },
        error: (error) => {
          console.error('Failed to clear wishlist:', error);
        }
      });
    }
  }

  continueShopping() {
    this.router.navigate(['/']);
  }

  getStars(rating: number): string[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push('fas fa-star');
      } else if (i - 0.5 <= rating) {
        stars.push('fas fa-star-half-alt');
      } else {
        stars.push('far fa-star');
      }
    }
    return stars;
  }

  private showNotification(message: string) {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 10000;
      font-size: 14px;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}
