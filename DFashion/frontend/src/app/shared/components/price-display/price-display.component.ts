import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-price-display',
  template: `
    <div class="price-display" [class]="size">
      <span class="current-price" [style.color]="currentPriceColor">
        {{ currency }}{{ currentPrice | number:'1.0-2' }}
      </span>
      
      <span *ngIf="originalPrice && originalPrice > currentPrice" 
            class="original-price">
        {{ currency }}{{ originalPrice | number:'1.0-2' }}
      </span>
      
      <span *ngIf="discountPercentage > 0" 
            class="discount-badge"
            [style.background-color]="discountColor">
        {{ discountPercentage }}% OFF
      </span>
      
      <span *ngIf="showSavings && savings > 0" 
            class="savings">
        You save {{ currency }}{{ savings | number:'1.0-2' }}
      </span>
    </div>
  `,
  styleUrls: ['./price-display.component.scss']
})
export class PriceDisplayComponent {
  @Input() currentPrice: number = 0;
  @Input() originalPrice?: number;
  @Input() currency: string = '₹';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() showSavings: boolean = false;
  @Input() currentPriceColor: string = '#2e7d32';
  @Input() discountColor: string = '#f44336';

  get discountPercentage(): number {
    if (!this.originalPrice || this.originalPrice <= this.currentPrice) {
      return 0;
    }
    return Math.round(((this.originalPrice - this.currentPrice) / this.originalPrice) * 100);
  }

  get savings(): number {
    if (!this.originalPrice || this.originalPrice <= this.currentPrice) {
      return 0;
    }
    return this.originalPrice - this.currentPrice;
  }
}
