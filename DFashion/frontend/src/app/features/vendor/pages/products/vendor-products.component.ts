import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-vendor-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="vendor-products-container">
      <div class="header">
        <h1>My Products</h1>
        <a routerLink="/vendor/products/create" class="btn-primary">
          <i class="fas fa-plus"></i> Add Product
        </a>
      </div>

      <!-- Products Grid -->
      <div class="products-grid" *ngIf="products.length > 0">
        <div class="product-card" *ngFor="let product of products">
          <div class="product-image">
            <img [src]="getImageUrl(product.images[0])" [alt]="product.name">
            <div class="product-status" [class]="product.status">
              {{ product.status }}
            </div>
          </div>
          
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="product-brand">{{ product.brand }}</p>
            <div class="product-price">
              <span class="current-price">₹{{ product.price | number:'1.0-0' }}</span>
              <span class="original-price" *ngIf="product.originalPrice">
                ₹{{ product.originalPrice | number:'1.0-0' }}
              </span>
            </div>
            <div class="product-stats">
              <span><i class="fas fa-eye"></i> {{ product.views || 0 }}</span>
              <span><i class="fas fa-shopping-cart"></i> {{ product.orders || 0 }}</span>
              <span><i class="fas fa-star"></i> {{ product.rating || 0 }}</span>
            </div>
          </div>
          
          <div class="product-actions">
            <button class="btn-edit" (click)="editProduct(product)">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn-delete" (click)="deleteProduct(product)">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="products.length === 0">
        <div class="empty-content">
          <i class="fas fa-box-open"></i>
          <h2>No products yet</h2>
          <p>Start by adding your first product</p>
          <a routerLink="/vendor/products/create" class="btn-primary">Add Product</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .vendor-products-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .header h1 {
      font-size: 2rem;
      font-weight: 600;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .product-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .product-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-status {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .product-status.active {
      background: #d4edda;
      color: #155724;
    }

    .product-status.inactive {
      background: #f8d7da;
      color: #721c24;
    }

    .product-info {
      padding: 16px;
    }

    .product-info h3 {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .product-brand {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 8px;
    }

    .product-price {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .current-price {
      font-weight: 600;
      color: #333;
    }

    .original-price {
      text-decoration: line-through;
      color: #999;
      font-size: 0.9rem;
    }

    .product-stats {
      display: flex;
      gap: 16px;
      font-size: 0.85rem;
      color: #666;
    }

    .product-stats span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .product-actions {
      display: flex;
      gap: 8px;
      padding: 16px;
      border-top: 1px solid #f0f0f0;
    }

    .btn-edit, .btn-delete {
      flex: 1;
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-edit {
      background: #f8f9fa;
      color: #495057;
    }

    .btn-edit:hover {
      background: #e9ecef;
    }

    .btn-delete {
      background: #fee;
      color: #dc3545;
    }

    .btn-delete:hover {
      background: #fdd;
    }

    .btn-primary {
      background: #007bff;
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: background 0.2s;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
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

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .products-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class VendorProductsComponent implements OnInit {
  products: any[] = [];

  constructor() {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    // Load vendor products from API
    this.products = [];
  }

  getImageUrl(image: any): string {
    if (typeof image === 'string') {
      return image;
    }
    return image?.url || '/assets/images/placeholder.jpg';
  }

  editProduct(product: any) {
    // TODO: Navigate to edit product page
    console.log('Edit product:', product);
  }

  deleteProduct(product: any) {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      // TODO: Implement delete API call
      this.products = this.products.filter(p => p._id !== product._id);
    }
  }
}
