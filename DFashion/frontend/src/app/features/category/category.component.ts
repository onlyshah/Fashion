import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: { url: string; alt?: string }[];
  brand: string;
  rating: { average: number; count: number };
  category: string;
  subcategory: string;
  tags: string[];
  analytics?: {
    views: number;
    likes: number;
    shares: number;
  };
}

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="category-page">
      <!-- Header -->
      <div class="category-header">
        <div class="breadcrumb">
          <span (click)="goHome()">Home</span>
          <i class="fas fa-chevron-right"></i>
          <span class="current">{{ getCategoryDisplayName() }}</span>
        </div>
        <h1>{{ getCategoryDisplayName() }}</h1>
        <p class="category-description">{{ getCategoryDescription() }}</p>
      </div>

      <!-- Filters & Sort -->
      <div class="filters-section">
        <div class="filter-row">
          <div class="filter-group">
            <label>Sort by:</label>
            <select [(ngModel)]="sortBy" (change)="onSortChange()">
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Price Range:</label>
            <select [(ngModel)]="priceRange" (change)="onFilterChange()">
              <option value="">All Prices</option>
              <option value="0-1000">Under ₹1,000</option>
              <option value="1000-3000">₹1,000 - ₹3,000</option>
              <option value="3000-5000">₹3,000 - ₹5,000</option>
              <option value="5000-10000">₹5,000 - ₹10,000</option>
              <option value="10000+">Above ₹10,000</option>
            </select>
          </div>

          <div class="filter-group" *ngIf="category === 'women' || category === 'men'">
            <label>Size:</label>
            <select [(ngModel)]="selectedSize" (change)="onFilterChange()">
              <option value="">All Sizes</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>
          </div>

          <div class="results-count">
            {{ filteredProducts.length }} products found
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="products-grid" *ngIf="filteredProducts.length > 0">
        <div class="product-card" *ngFor="let product of filteredProducts" (click)="viewProduct(product)">
          <div class="product-image">
            <img [src]="getProductImage(product)" [alt]="product.name" loading="lazy">
            <div class="product-actions">
              <button class="btn-wishlist" (click)="addToWishlist(product, $event)">
                <i class="far fa-heart"></i>
              </button>
              <button class="btn-quick-view" (click)="quickView(product, $event)">
                <i class="fas fa-eye"></i>
              </button>
            </div>
            <div class="discount-badge" *ngIf="product.originalPrice && product.originalPrice > product.price">
              {{ getDiscountPercentage(product) }}% OFF
            </div>
          </div>
          
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-brand">{{ product.brand }}</p>
            
            <div class="product-rating" *ngIf="product.rating">
              <div class="stars">
                <i class="fas fa-star" *ngFor="let star of getStars(product.rating.average)"></i>
                <i class="far fa-star" *ngFor="let star of getEmptyStars(product.rating.average)"></i>
              </div>
              <span class="rating-count">({{ product.rating.count }})</span>
            </div>
            
            <div class="product-price">
              <span class="current-price">₹{{ product.price | number:'1.0-0' }}</span>
              <span class="original-price" *ngIf="product.originalPrice && product.originalPrice > product.price">
                ₹{{ product.originalPrice | number:'1.0-0' }}
              </span>
            </div>
            
            <button class="btn-add-cart" (click)="addToCart(product, $event)">
              <i class="fas fa-shopping-cart"></i>
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="filteredProducts.length === 0 && !loading">
        <div class="empty-content">
          <i class="fas fa-search"></i>
          <h2>No products found</h2>
          <p>Try adjusting your filters or browse other categories</p>
          <button class="btn-primary" (click)="clearFilters()">Clear Filters</button>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading">
        <div class="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    </div>
  `,
  styles: [`
    .category-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .category-header {
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

    .category-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 8px;
      color: #333;
    }

    .category-description {
      font-size: 1.1rem;
      color: #666;
      margin: 0;
    }

    .filters-section {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .filter-row {
      display: flex;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .filter-group label {
      font-weight: 500;
      color: #333;
      white-space: nowrap;
    }

    .filter-group select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.9rem;
      min-width: 150px;
    }

    .results-count {
      margin-left: auto;
      font-weight: 500;
      color: #666;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }

    .product-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }

    .product-image {
      position: relative;
      height: 300px;
      overflow: hidden;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .product-card:hover .product-image img {
      transform: scale(1.05);
    }

    .product-actions {
      position: absolute;
      top: 12px;
      right: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .product-card:hover .product-actions {
      opacity: 1;
    }

    .btn-wishlist, .btn-quick-view {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 50%;
      background: rgba(255,255,255,0.9);
      color: #333;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .btn-wishlist:hover, .btn-quick-view:hover {
      background: #007bff;
      color: white;
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

    .product-info {
      padding: 20px;
    }

    .product-name {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 4px;
      color: #333;
      line-height: 1.3;
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
      margin-bottom: 16px;
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

    .btn-add-cart {
      width: 100%;
      padding: 12px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-add-cart:hover {
      background: #0056b3;
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
    }

    .empty-content i {
      font-size: 4rem;
      color: #ddd;
      margin-bottom: 20px;
    }

    .empty-content h2 {
      font-size: 1.5rem;
      margin-bottom: 10px;
    }

    .empty-content p {
      color: #666;
      margin-bottom: 30px;
    }

    .btn-primary {
      background: #007bff;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
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
      .category-header h1 {
        font-size: 2rem;
      }

      .filter-row {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .filter-group {
        justify-content: space-between;
      }

      .results-count {
        margin-left: 0;
        text-align: center;
      }

      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 16px;
      }
    }
  `]
})
export class CategoryComponent implements OnInit {
  category: string = '';
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = true;
  
  // Filters
  sortBy = 'featured';
  priceRange = '';
  selectedSize = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.category = params['slug'] || params['category'];
      this.loadProducts();
    });
  }

  loadProducts() {
    this.loading = true;

    // Load products from API using category slug
    this.productService.getCategoryProducts(this.category).subscribe({
      next: (response) => {
        this.products = response.products || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.products = [];
        this.filteredProducts = [];
        this.loading = false;
      }
    });
  }



  getCategoryDisplayName(): string {
    const categoryNames: { [key: string]: string } = {
      'women': 'Women\'s Fashion',
      'men': 'Men\'s Fashion',
      'kids': 'Kids\' Fashion',
      'ethnic': 'Ethnic Wear',
      'all': 'All Products'
    };
    return categoryNames[this.category] || this.category.charAt(0).toUpperCase() + this.category.slice(1);
  }

  getCategoryDescription(): string {
    const descriptions: { [key: string]: string } = {
      'women': 'Discover the latest trends in women\'s fashion',
      'men': 'Explore stylish and comfortable men\'s clothing',
      'kids': 'Fun and comfortable clothing for children',
      'ethnic': 'Traditional and ethnic wear for special occasions',
      'all': 'Browse our complete collection of fashion items'
    };
    return descriptions[this.category] || 'Explore our collection';
  }



  onSortChange() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.products];

    // Apply price filter
    if (this.priceRange) {
      if (this.priceRange === '10000+') {
        filtered = filtered.filter(p => p.price >= 10000);
      } else {
        const [min, max] = this.priceRange.split('-').map(Number);
        filtered = filtered.filter(p => p.price >= min && p.price <= max);
      }
    }

    // Apply size filter
    if (this.selectedSize) {
      // Filter products by available sizes
      filtered = filtered.filter(p =>
        (p as any).sizes && (p as any).sizes.some((size: any) => size.size === this.selectedSize)
      );
    }

    // Apply sorting
    switch (this.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        break;
      case 'newest':
        // Sort by creation date (newest first)
        filtered.sort((a, b) => new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime());
        break;
      default:
        // Featured - keep original order
        break;
    }

    this.filteredProducts = filtered;
  }

  clearFilters() {
    this.sortBy = 'featured';
    this.priceRange = '';
    this.selectedSize = '';
    this.filteredProducts = [...this.products];
  }

  getProductImage(product: Product): string {
    return product.images[0]?.url || '/assets/images/placeholder.jpg';
  }

  getDiscountPercentage(product: Product): number {
    if (!product.originalPrice || product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }

  viewProduct(product: Product) {
    this.router.navigate(['/product', product._id]);
  }

  addToWishlist(product: Product, event: Event) {
    event.stopPropagation();
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }

    this.wishlistService.addToWishlist(product._id).subscribe({
      next: (response) => {
        console.log('Product added to wishlist:', response);
        // You could show a toast notification here
      },
      error: (error) => {
        console.error('Error adding to wishlist:', error);
      }
    });
  }

  quickView(product: Product, event: Event) {
    event.stopPropagation();
    // Navigate to product detail page
    this.router.navigate(['/product', product._id]);
  }

  addToCart(product: Product, event: Event) {
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

  goHome() {
    this.router.navigate(['/home']);
  }
}
