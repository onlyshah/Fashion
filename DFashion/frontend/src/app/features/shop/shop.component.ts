import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Category {
  id: string;
  name: string;
  image: string;
  subcategories: string[];
  productCount: number;
}

interface Brand {
  id: string;
  name: string;
  logo: string;
  isPopular: boolean;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: { url: string; alt: string }[];
  brand: string;
  rating: { average: number; count: number };
  category: string;
  subcategory: string;
  tags: string[];
  isNew: boolean;
  isTrending: boolean;
}

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="shop-container">
      <!-- Hero Banner -->
      <div class="hero-banner">
        <div class="hero-content">
          <h1>Discover Fashion That Defines You</h1>
          <p>Explore thousands of products from top brands</p>
          <div class="hero-search">
            <input type="text" placeholder="Search for products, brands, categories..." [(ngModel)]="searchQuery">
            <button (click)="search()">
              <i class="fas fa-search"></i>
            </button>
          </div>
        </div>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-number">10K+</span>
            <span class="stat-label">Products</span>
          </div>
          <div class="stat">
            <span class="stat-number">500+</span>
            <span class="stat-label">Brands</span>
          </div>
          <div class="stat">
            <span class="stat-number">50K+</span>
            <span class="stat-label">Happy Customers</span>
          </div>
        </div>
      </div>

      <!-- Categories Section -->
      <section class="categories-section">
        <div class="section-header">
          <h2>Shop by Category</h2>
          <p>Find exactly what you're looking for</p>
        </div>

        <div class="categories-grid">
          <div class="category-card" *ngFor="let category of categories" (click)="navigateToCategory(category.id)">
            <div class="category-image">
              <img [src]="category.image" [alt]="category.name" loading="lazy">
              <div class="category-overlay">
                <span class="product-count">{{ category.productCount }}+ Products</span>
              </div>
            </div>
            <div class="category-info">
              <h3>{{ category.name }}</h3>
              <div class="subcategories">
                <span *ngFor="let sub of category.subcategories.slice(0, 3)">{{ sub }}</span>
                <span *ngIf="category.subcategories.length > 3" class="more">+{{ category.subcategories.length - 3 }} more</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Brands -->
      <section class="brands-section">
        <div class="section-header">
          <h2>Featured Brands</h2>
          <p>Shop from your favorite brands</p>
        </div>

        <div class="brands-grid">
          <div class="brand-card" *ngFor="let brand of featuredBrands" (click)="navigateToBrand(brand.id)">
            <div class="brand-logo">
              <img [src]="brand.logo" [alt]="brand.name" loading="lazy">
            </div>
            <h4>{{ brand.name }}</h4>
            <span class="popular-badge" *ngIf="brand.isPopular">Popular</span>
          </div>
        </div>
      </section>

      <!-- Trending Products -->
      <section class="trending-section">
        <div class="section-header">
          <h2>Trending Now</h2>
          <p>What everyone's buying</p>
          <button class="view-all-btn" (click)="viewAllTrending()">View All</button>
        </div>

        <div class="products-grid">
          <div class="product-card" *ngFor="let product of trendingProducts" (click)="viewProduct(product)">
            <div class="product-image">
              <img [src]="getProductImage(product)" [alt]="product.name" loading="lazy">
              <div class="product-badges">
                <span class="badge trending" *ngIf="product.isTrending">Trending</span>
                <span class="badge new" *ngIf="product.isNew">New</span>
                <span class="badge discount" *ngIf="product.originalPrice && product.originalPrice > product.price">
                  {{ getDiscountPercentage(product) }}% OFF
                </span>
              </div>
              <div class="product-actions">
                <button class="btn-wishlist" (click)="addToWishlist(product, $event)">
                  <i class="far fa-heart"></i>
                </button>
                <button class="btn-quick-add" (click)="quickAddToCart(product, $event)">
                  <i class="fas fa-shopping-cart"></i>
                </button>
              </div>
            </div>

            <div class="product-info">
              <h4 class="product-name">{{ product.name }}</h4>
              <p class="product-brand">{{ product.brand }}</p>

              <div class="product-rating" *ngIf="product.rating">
                <div class="stars">
                  <i class="fas fa-star" *ngFor="let star of getStars(product.rating.average)"></i>
                  <i class="far fa-star" *ngFor="let star of getEmptyStars(product.rating.average)"></i>
                </div>
                <span class="rating-text">{{ product.rating.average }} ({{ product.rating.count }})</span>
              </div>

              <div class="product-price">
                <span class="current-price">₹{{ product.price | number:'1.0-0' }}</span>
                <span class="original-price" *ngIf="product.originalPrice && product.originalPrice > product.price">
                  ₹{{ product.originalPrice | number:'1.0-0' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- New Arrivals -->
      <section class="new-arrivals-section">
        <div class="section-header">
          <h2>New Arrivals</h2>
          <p>Fresh styles just dropped</p>
          <button class="view-all-btn" (click)="viewAllNew()">View All</button>
        </div>

        <div class="products-grid">
          <div class="product-card" *ngFor="let product of newArrivals" (click)="viewProduct(product)">
            <div class="product-image">
              <img [src]="getProductImage(product)" [alt]="product.name" loading="lazy">
              <div class="product-badges">
                <span class="badge new">New</span>
                <span class="badge discount" *ngIf="product.originalPrice && product.originalPrice > product.price">
                  {{ getDiscountPercentage(product) }}% OFF
                </span>
              </div>
              <div class="product-actions">
                <button class="btn-wishlist" (click)="addToWishlist(product, $event)">
                  <i class="far fa-heart"></i>
                </button>
                <button class="btn-quick-add" (click)="quickAddToCart(product, $event)">
                  <i class="fas fa-shopping-cart"></i>
                </button>
              </div>
            </div>

            <div class="product-info">
              <h4 class="product-name">{{ product.name }}</h4>
              <p class="product-brand">{{ product.brand }}</p>

              <div class="product-rating" *ngIf="product.rating">
                <div class="stars">
                  <i class="fas fa-star" *ngFor="let star of getStars(product.rating.average)"></i>
                  <i class="far fa-star" *ngFor="let star of getEmptyStars(product.rating.average)"></i>
                </div>
                <span class="rating-text">{{ product.rating.average }} ({{ product.rating.count }})</span>
              </div>

              <div class="product-price">
                <span class="current-price">₹{{ product.price | number:'1.0-0' }}</span>
                <span class="original-price" *ngIf="product.originalPrice && product.originalPrice > product.price">
                  ₹{{ product.originalPrice | number:'1.0-0' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Links -->
      <section class="quick-links-section">
        <div class="section-header">
          <h2>Quick Links</h2>
        </div>

        <div class="quick-links-grid">
          <div class="quick-link" (click)="navigateToCategory('women')">
            <i class="fas fa-female"></i>
            <span>Women's Fashion</span>
          </div>
          <div class="quick-link" (click)="navigateToCategory('men')">
            <i class="fas fa-male"></i>
            <span>Men's Fashion</span>
          </div>
          <div class="quick-link" (click)="navigateToCategory('kids')">
            <i class="fas fa-child"></i>
            <span>Kids' Fashion</span>
          </div>
          <div class="quick-link" (click)="navigateToCategory('ethnic')">
            <i class="fas fa-star-and-crescent"></i>
            <span>Ethnic Wear</span>
          </div>
          <div class="quick-link" (click)="navigateToCategory('accessories')">
            <i class="fas fa-gem"></i>
            <span>Accessories</span>
          </div>
          <div class="quick-link" (click)="navigateToCategory('shoes')">
            <i class="fas fa-shoe-prints"></i>
            <span>Footwear</span>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .shop-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 20px;
    }

    /* Hero Banner */
    .hero-banner {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 60px 40px;
      border-radius: 20px;
      margin: 20px 0 40px;
      position: relative;
      overflow: hidden;
    }

    .hero-banner::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      opacity: 0.3;
    }

    .hero-content {
      position: relative;
      z-index: 2;
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    }

    .hero-content h1 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 16px;
      line-height: 1.2;
    }

    .hero-content p {
      font-size: 1.2rem;
      margin-bottom: 32px;
      opacity: 0.9;
    }

    .hero-search {
      display: flex;
      max-width: 500px;
      margin: 0 auto 40px;
      background: white;
      border-radius: 50px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .hero-search input {
      flex: 1;
      padding: 16px 24px;
      border: none;
      font-size: 1rem;
      color: #333;
    }

    .hero-search input::placeholder {
      color: #999;
    }

    .hero-search button {
      padding: 16px 24px;
      background: #007bff;
      border: none;
      color: white;
      cursor: pointer;
      transition: background 0.2s;
    }

    .hero-search button:hover {
      background: #0056b3;
    }

    .hero-stats {
      display: flex;
      justify-content: center;
      gap: 60px;
      position: relative;
      z-index: 2;
    }

    .stat {
      text-align: center;
    }

    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 0.9rem;
      opacity: 0.8;
    }

    /* Section Headers */
    .section-header {
      text-align: center;
      margin-bottom: 40px;
      position: relative;
    }

    .section-header h2 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 8px;
      color: #333;
    }

    .section-header p {
      font-size: 1.1rem;
      color: #666;
      margin: 0;
    }

    .view-all-btn {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 25px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .view-all-btn:hover {
      background: #0056b3;
      transform: translateY(-50%) scale(1.05);
    }

    /* Categories Section */
    .categories-section {
      margin: 60px 0;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .category-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .category-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    }

    .category-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .category-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .category-card:hover .category-image img {
      transform: scale(1.1);
    }

    .category-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0,0,0,0.7));
      padding: 20px;
      color: white;
    }

    .product-count {
      font-size: 0.9rem;
      font-weight: 500;
    }

    .category-info {
      padding: 20px;
    }

    .category-info h3 {
      font-size: 1.3rem;
      font-weight: 600;
      margin-bottom: 8px;
      color: #333;
    }

    .subcategories {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .subcategories span {
      background: #f8f9fa;
      color: #666;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
    }

    .subcategories .more {
      background: #007bff;
      color: white;
    }

    /* Brands Section */
    .brands-section {
      margin: 60px 0;
      background: #f8f9fa;
      padding: 40px;
      border-radius: 20px;
    }

    .brands-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 24px;
    }

    .brand-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
    }

    .brand-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    }

    .brand-logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 12px;
      border-radius: 50%;
      overflow: hidden;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-logo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .brand-card h4 {
      font-size: 1rem;
      font-weight: 600;
      color: #333;
      margin: 0;
    }

    .popular-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      background: #ff6b6b;
      color: white;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 0.7rem;
      font-weight: 500;
    }

    /* Products Grid */
    .trending-section,
    .new-arrivals-section {
      margin: 60px 0;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 24px;
    }

    .product-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }

    .product-image {
      position: relative;
      height: 280px;
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

    .product-badges {
      position: absolute;
      top: 12px;
      left: 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge.trending {
      background: #ff6b6b;
      color: white;
    }

    .badge.new {
      background: #4ecdc4;
      color: white;
    }

    .badge.discount {
      background: #ffa726;
      color: white;
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

    .btn-wishlist,
    .btn-quick-add {
      width: 36px;
      height: 36px;
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

    .btn-wishlist:hover {
      background: #ff6b6b;
      color: white;
    }

    .btn-quick-add:hover {
      background: #007bff;
      color: white;
    }

    .product-info {
      padding: 16px;
    }

    .product-name {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 4px;
      color: #333;
      line-height: 1.3;
    }

    .product-brand {
      color: #666;
      font-size: 0.85rem;
      margin-bottom: 8px;
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .stars {
      display: flex;
      gap: 1px;
    }

    .stars i {
      font-size: 0.7rem;
      color: #ffc107;
    }

    .rating-text {
      font-size: 0.75rem;
      color: #666;
    }

    .product-price {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .current-price {
      font-size: 1.1rem;
      font-weight: 700;
      color: #333;
    }

    .original-price {
      font-size: 0.85rem;
      color: #999;
      text-decoration: line-through;
    }

    /* Quick Links */
    .quick-links-section {
      margin: 60px 0;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      padding: 40px;
      border-radius: 20px;
      color: white;
    }

    .quick-links-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .quick-link {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid rgba(255,255,255,0.2);
    }

    .quick-link:hover {
      background: rgba(255,255,255,0.2);
      transform: translateY(-4px);
    }

    .quick-link i {
      font-size: 2rem;
      margin-bottom: 12px;
      display: block;
    }

    .quick-link span {
      font-weight: 500;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .hero-content h1 {
        font-size: 2rem;
      }

      .hero-stats {
        gap: 30px;
      }

      .section-header h2 {
        font-size: 2rem;
      }

      .view-all-btn {
        position: static;
        transform: none;
        margin-top: 16px;
      }

      .categories-grid,
      .products-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }

      .brands-grid {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      }

      .quick-links-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }
    }
  `]
})
export class ShopComponent implements OnInit {
  searchQuery = '';
  categories: Category[] = [];
  featuredBrands: Brand[] = [];
  trendingProducts: Product[] = [];
  newArrivals: Product[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadCategories();
    this.loadFeaturedBrands();
    this.loadTrendingProducts();
    this.loadNewArrivals();
  }

  loadCategories() {
    this.categories = [
      {
        id: 'women',
        name: 'Women\'s Fashion',
        image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=300&fit=crop',
        subcategories: ['Dresses', 'Tops', 'Bottoms', 'Ethnic Wear', 'Accessories'],
        productCount: 2500
      },
      {
        id: 'men',
        name: 'Men\'s Fashion',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=300&fit=crop',
        subcategories: ['Shirts', 'T-Shirts', 'Jeans', 'Formal Wear', 'Accessories'],
        productCount: 1800
      },
      {
        id: 'kids',
        name: 'Kids\' Fashion',
        image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&h=300&fit=crop',
        subcategories: ['Boys', 'Girls', 'Baby', 'Toys', 'Accessories'],
        productCount: 1200
      },
      {
        id: 'ethnic',
        name: 'Ethnic Wear',
        image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=300&fit=crop',
        subcategories: ['Sarees', 'Kurtas', 'Lehengas', 'Sherwanis', 'Accessories'],
        productCount: 900
      },
      {
        id: 'accessories',
        name: 'Accessories',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
        subcategories: ['Bags', 'Jewelry', 'Watches', 'Sunglasses', 'Belts'],
        productCount: 1500
      },
      {
        id: 'shoes',
        name: 'Footwear',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop',
        subcategories: ['Sneakers', 'Formal', 'Sandals', 'Boots', 'Sports'],
        productCount: 800
      }
    ];
  }

  loadFeaturedBrands() {
    // Load from real API
    this.featuredBrands = [];
  }

  loadTrendingProducts() {
    // Load from real API
    this.trendingProducts = [];
  }

  loadNewArrivals() {
    // Load from real API
    this.newArrivals = [];
  }

  search() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }

  navigateToCategory(categoryId: string) {
    this.router.navigate(['/category', categoryId]);
  }

  navigateToBrand(brandId: string) {
    this.router.navigate(['/brand', brandId]);
  }

  viewProduct(product: Product) {
    this.router.navigate(['/product', product._id]);
  }



  viewAllTrending() {
    this.router.navigate(['/category/trending']);
  }

  viewAllNew() {
    this.router.navigate(['/category/new-arrivals']);
  }

  addToWishlist(product: Product, event: Event) {
    event.stopPropagation();
    // TODO: Check authentication first
    if (!this.isAuthenticated()) {
      this.showLoginPrompt('add to wishlist');
      return;
    }
    // TODO: Implement wishlist API call
    console.log('Add to wishlist:', product);
    this.showSuccessMessage(`${product.name} added to wishlist!`);
  }

  quickAddToCart(product: Product, event: Event) {
    event.stopPropagation();
    // TODO: Check authentication first
    if (!this.isAuthenticated()) {
      this.showLoginPrompt('add to cart');
      return;
    }
    // TODO: Implement add to cart API call
    console.log('Add to cart:', product);
    this.showSuccessMessage(`${product.name} added to cart!`);
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

  private isAuthenticated(): boolean {
    // TODO: Implement actual authentication check
    return localStorage.getItem('authToken') !== null;
  }

  private showLoginPrompt(action: string) {
    const message = `Please login to ${action}`;
    if (confirm(`${message}. Would you like to login now?`)) {
      this.router.navigate(['/auth/login']);
    }
  }

  private showSuccessMessage(message: string) {
    // TODO: Implement proper toast/notification system
    alert(message);
  }
}