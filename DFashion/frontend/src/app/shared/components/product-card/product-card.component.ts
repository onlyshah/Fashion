import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  brand?: string;
  rating?: {
    average: number;
    count: number;
  };
  isWishlisted?: boolean;
  isFeatured?: boolean;
  discount?: number;
}

@Component({
  selector: 'app-product-card',
  template: `
    <ion-card class="product-card" [class.featured]="product.isFeatured">
      <!-- Product Image -->
      <div class="image-container" (click)="onProductClick()">
        <img 
          [src]="product.images?.[0] || '/assets/images/placeholder-product.jpg'"
          [alt]="product.name"
          appLazyLoad>
        
        <!-- Featured Badge -->
        <div class="featured-badge" *ngIf="product.isFeatured">
          <ion-icon name="star"></ion-icon>
          Featured
        </div>
        
        <!-- Discount Badge -->
        <div class="discount-badge" *ngIf="product.discount && product.discount > 0">
          {{ product.discount }}% OFF
        </div>
        
        <!-- Wishlist Button -->
        <ion-button 
          fill="clear" 
          class="wishlist-button"
          [color]="product.isWishlisted ? 'danger' : 'medium'"
          (click)="onWishlistToggle($event)">
          <ion-icon [name]="product.isWishlisted ? 'heart' : 'heart-outline'"></ion-icon>
        </ion-button>
      </div>
      
      <!-- Product Info -->
      <ion-card-content class="product-info" (click)="onProductClick()">
        <!-- Brand -->
        <div class="brand" *ngIf="product.brand">{{ product.brand }}</div>
        
        <!-- Product Name -->
        <h3 class="product-name">{{ product.name }}</h3>
        
        <!-- Description -->
        <p class="description" *ngIf="product.description && showDescription">
          {{ product.description | truncate:80 }}
        </p>
        
        <!-- Rating -->
        <app-rating 
          *ngIf="product.rating && showRating"
          [value]="product.rating.average"
          [count]="product.rating.count"
          [showValue]="false"
          size="small">
        </app-rating>
        
        <!-- Price -->
        <app-price-display
          [currentPrice]="product.price"
          [originalPrice]="product.originalPrice"
          [size]="priceSize">
        </app-price-display>
      </ion-card-content>
      
      <!-- Action Buttons -->
      <div class="action-buttons" *ngIf="showActions">
        <ion-button 
          expand="block" 
          fill="solid" 
          color="primary"
          (click)="onAddToCart($event)">
          <ion-icon name="bag-add" slot="start"></ion-icon>
          Add to Cart
        </ion-button>
        
        <ion-button 
          expand="block" 
          fill="outline" 
          color="primary"
          (click)="onBuyNow($event)">
          Buy Now
        </ion-button>
      </div>
    </ion-card>
  `,
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() showDescription: boolean = true;
  @Input() showRating: boolean = true;
  @Input() showActions: boolean = true;
  @Input() priceSize: 'small' | 'medium' | 'large' = 'medium';

  @Output() productClick = new EventEmitter<Product>();
  @Output() wishlistToggle = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();
  @Output() buyNow = new EventEmitter<Product>();

  onProductClick(): void {
    this.productClick.emit(this.product);
  }

  onWishlistToggle(event: Event): void {
    event.stopPropagation();
    this.wishlistToggle.emit(this.product);
  }

  onAddToCart(event: Event): void {
    event.stopPropagation();
    this.addToCart.emit(this.product);
  }

  onBuyNow(event: Event): void {
    event.stopPropagation();
    this.buyNow.emit(this.product);
  }
}
