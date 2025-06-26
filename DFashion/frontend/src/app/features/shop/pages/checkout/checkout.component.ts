import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CartService, CartSummary } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="checkout-page">
      <div class="checkout-header">
        <h1>Checkout</h1>
        <div class="steps">
          <div class="step active">
            <span class="step-number">1</span>
            <span class="step-label">Shipping</span>
          </div>
          <div class="step">
            <span class="step-number">2</span>
            <span class="step-label">Payment</span>
          </div>
          <div class="step">
            <span class="step-number">3</span>
            <span class="step-label">Review</span>
          </div>
        </div>
      </div>

      <div class="checkout-content">
        <div class="checkout-form">
          <div class="form-section">
            <h3>Shipping Address</h3>
            <form>
              <div class="form-row">
                <div class="form-group">
                  <label>First Name</label>
                  <input type="text" [(ngModel)]="shippingAddress.firstName" name="firstName" required>
                </div>
                <div class="form-group">
                  <label>Last Name</label>
                  <input type="text" [(ngModel)]="shippingAddress.lastName" name="lastName" required>
                </div>
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" [(ngModel)]="shippingAddress.email" name="email" required>
              </div>
              <div class="form-group">
                <label>Phone</label>
                <input type="tel" [(ngModel)]="shippingAddress.phone" name="phone" required>
              </div>
              <div class="form-group">
                <label>Address</label>
                <input type="text" [(ngModel)]="shippingAddress.address" name="address" required>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>City</label>
                  <input type="text" [(ngModel)]="shippingAddress.city" name="city" required>
                </div>
                <div class="form-group">
                  <label>State</label>
                  <input type="text" [(ngModel)]="shippingAddress.state" name="state" required>
                </div>
                <div class="form-group">
                  <label>PIN Code</label>
                  <input type="text" [(ngModel)]="shippingAddress.pinCode" name="pinCode" required>
                </div>
              </div>
            </form>
          </div>

          <div class="form-section">
            <h3>Payment Method</h3>
            <div class="payment-options">
              <label class="payment-option">
                <input type="radio" name="paymentMethod" value="card" [(ngModel)]="paymentMethod">
                <span class="option-content">
                  <i class="fas fa-credit-card"></i>
                  Credit/Debit Card
                </span>
              </label>
              <label class="payment-option">
                <input type="radio" name="paymentMethod" value="upi" [(ngModel)]="paymentMethod">
                <span class="option-content">
                  <i class="fas fa-mobile-alt"></i>
                  UPI
                </span>
              </label>
              <label class="payment-option">
                <input type="radio" name="paymentMethod" value="cod" [(ngModel)]="paymentMethod">
                <span class="option-content">
                  <i class="fas fa-money-bill-wave"></i>
                  Cash on Delivery
                </span>
              </label>
            </div>
          </div>
        </div>

        <div class="order-summary">
          <div class="summary-card">
            <h3>Order Summary</h3>
            <div class="summary-row">
              <span>Subtotal</span>
              <span>₹{{ cartSummary?.subtotal | number }}</span>
            </div>
            <div class="summary-row" *ngIf="cartSummary && cartSummary.discount && cartSummary.discount > 0">
              <span>Discount</span>
              <span class="discount">-₹{{ cartSummary.discount | number }}</span>
            </div>
            <div class="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div class="summary-row">
              <span>Tax</span>
              <span>₹{{ tax | number }}</span>
            </div>
            <hr>
            <div class="summary-row total">
              <span>Total</span>
              <span>₹{{ getTotal() | number }}</span>
            </div>
            <button class="place-order-btn" (click)="placeOrder()" [disabled]="!isFormValid()">
              Place Order
            </button>
            <button class="back-to-cart-btn" (click)="backToCart()">
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-page {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .checkout-header {
      margin-bottom: 2rem;
    }

    .checkout-header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: #333;
    }

    .steps {
      display: flex;
      gap: 2rem;
    }

    .step {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #999;
    }

    .step.active {
      color: #007bff;
    }

    .step-number {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    .step.active .step-number {
      background: #007bff;
      color: white;
    }

    .checkout-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }

    .form-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid #eee;
      margin-bottom: 1rem;
    }

    .form-section h3 {
      margin-bottom: 1rem;
      color: #333;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
    }

    .form-group input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .form-group input:focus {
      outline: none;
      border-color: #007bff;
    }

    .payment-options {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .payment-option {
      display: flex;
      align-items: center;
      padding: 1rem;
      border: 2px solid #eee;
      border-radius: 8px;
      cursor: pointer;
      transition: border-color 0.2s;
    }

    .payment-option:hover {
      border-color: #007bff;
    }

    .payment-option input[type="radio"] {
      margin-right: 1rem;
    }

    .option-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
    }

    .option-content i {
      font-size: 1.2rem;
      color: #666;
    }

    .summary-card {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      position: sticky;
      top: 2rem;
    }

    .summary-card h3 {
      margin-bottom: 1rem;
      color: #333;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .summary-row.total {
      font-weight: 700;
      font-size: 1.2rem;
      color: #333;
    }

    .discount {
      color: #28a745;
    }

    .place-order-btn {
      width: 100%;
      background: #28a745;
      color: white;
      border: none;
      padding: 1rem;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 1rem;
      transition: background 0.2s;
    }

    .place-order-btn:hover:not(:disabled) {
      background: #218838;
    }

    .place-order-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .back-to-cart-btn {
      width: 100%;
      background: transparent;
      color: #007bff;
      border: 2px solid #007bff;
      padding: 1rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .back-to-cart-btn:hover {
      background: #007bff;
      color: white;
    }

    @media (max-width: 768px) {
      .checkout-content {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .steps {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  cartSummary: CartSummary | null = null;
  tax = 0;
  paymentMethod = 'card';

  shippingAddress = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pinCode: ''
  };

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.cartSummary$.subscribe(summary => {
      this.cartSummary = summary;
      this.tax = summary ? Math.round(summary.total * 0.18) : 0; // 18% GST
    });
  }

  getTotal(): number {
    return this.cartSummary ? this.cartSummary.total + this.tax : 0;
  }

  isFormValid(): boolean {
    return !!(
      this.shippingAddress.firstName &&
      this.shippingAddress.lastName &&
      this.shippingAddress.email &&
      this.shippingAddress.phone &&
      this.shippingAddress.address &&
      this.shippingAddress.city &&
      this.shippingAddress.state &&
      this.shippingAddress.pinCode &&
      this.paymentMethod
    );
  }

  async placeOrder() {
    if (this.isFormValid()) {
      // Mock order placement
      alert('Order placed successfully! (Demo)');
      this.cartService.clearCartAPI().subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error clearing cart:', error);
          this.router.navigate(['/']);
        }
      });
    }
  }

  backToCart() {
    this.router.navigate(['/shop/cart']);
  }
}
