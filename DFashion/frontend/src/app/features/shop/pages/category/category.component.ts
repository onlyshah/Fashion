import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="category-page">
      <div class="category-header">
        <h1>{{ categoryName | titlecase }}</h1>
        <p>{{ productCount }} products found</p>
      </div>

      <div class="filters-section">
        <div class="filter-chips">
          <button 
            *ngFor="let filter of activeFilters" 
            class="filter-chip"
            (click)="removeFilter(filter)"
          >
            {{ filter.label }}
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div class="products-grid" *ngIf="!isLoading">
        <div 
          *ngFor="let product of products" 
          class="product-card"
          (click)="viewProduct(product._id)"
        >
          <div class="product-image">
            <img [src]="product.images[0]?.url" [alt]="product.name">
            <button class="wishlist-btn" (click)="toggleWishlist(product._id, $event)">
              <i class="far fa-heart"></i>
            </button>
          </div>
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="brand">{{ product.brand }}</p>
            <div class="price">
              <span class="current-price">₹{{ product.price | number }}</span>
              <span class="original-price" *ngIf="product.originalPrice">₹{{ product.originalPrice | number }}</span>
            </div>
            <div class="rating" *ngIf="product.rating">
              <div class="stars">
                <i *ngFor="let star of getStars(product.rating.average)" [class]="star"></i>
              </div>
              <span>({{ product.rating.count }})</span>
            </div>
          </div>
        </div>
      </div>

      <div class="loading-container" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Loading products...</p>
      </div>

      <div class="empty-state" *ngIf="!isLoading && products.length === 0">
        <i class="fas fa-search"></i>
        <h3>No products found</h3>
        <p>Try adjusting your filters or search terms</p>
      </div>
    </div>
  `,
  styles: [`
    .category-page {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .category-header {
      margin-bottom: 2rem;
      text-align: center;
    }

    .category-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: #333;
    }

    .category-header p {
      color: #666;
      font-size: 1.1rem;
    }

    .filters-section {
      margin-bottom: 2rem;
    }

    .filter-chips {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .filter-chip {
      background: #f0f0f0;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    .filter-chip:hover {
      background: #e0e0e0;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
    }

    .product-card {
      border: 1px solid #eee;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .product-image {
      position: relative;
      aspect-ratio: 1;
      overflow: hidden;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .wishlist-btn {
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
    }

    .wishlist-btn:hover {
      background: white;
      transform: scale(1.1);
    }

    .product-info {
      padding: 1rem;
    }

    .product-info h3 {
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

    .rating {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .stars {
      display: flex;
      gap: 2px;
    }

    .stars i {
      color: #ffc107;
      font-size: 0.9rem;
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

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }

    .empty-state i {
      font-size: 4rem;
      margin-bottom: 1rem;
      color: #ddd;
    }

    @media (max-width: 768px) {
      .category-page {
        padding: 1rem;
      }

      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
      }
    }
  `]
})
export class CategoryComponent implements OnInit {
  categoryName = '';
  products: any[] = [];
  productCount = 0;
  isLoading = true;
  activeFilters: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.categoryName = params['category'];
      this.loadProducts();
    });
  }

  loadProducts() {
    this.isLoading = true;
    // Load from real API
    this.products = [];
    this.productCount = 0;
    this.isLoading = false;
  }

  viewProduct(productId: string) {
    this.router.navigate(['/product', productId]);
  }

  toggleWishlist(productId: string, event: Event) {
    event.stopPropagation();
    console.log('Toggle wishlist for:', productId);
  }

  removeFilter(filter: any) {
    this.activeFilters = this.activeFilters.filter(f => f !== filter);
    this.loadProducts();
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
}
