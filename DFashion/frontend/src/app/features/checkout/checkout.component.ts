import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService, CartItem, CartSummary } from '../../core/services/cart.service';
// import { CheckoutService } from '../../core/services/checkout.service';
import { PaymentService, PaymentMethod } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="checkout-container">
      <div class="checkout-header">
        <h1>Checkout</h1>
        <div class="step-indicator">
          <div class="step" [class.active]="currentStep >= 1" [class.completed]="currentStep > 1">
            <span class="step-number">1</span>
            <span class="step-label">Cart Review</span>
          </div>
          <div class="step" [class.active]="currentStep >= 2" [class.completed]="currentStep > 2">
            <span class="step-number">2</span>
            <span class="step-label">Shipping</span>
          </div>
          <div class="step" [class.active]="currentStep >= 3" [class.completed]="currentStep > 3">
            <span class="step-number">3</span>
            <span class="step-label">Payment</span>
          </div>
          <div class="step" [class.active]="currentStep >= 4">
            <span class="step-number">4</span>
            <span class="step-label">Confirmation</span>
          </div>
        </div>
      </div>

      <div class="checkout-content">
        <!-- Step 1: Cart Review -->
        <div class="checkout-step" *ngIf="currentStep === 1">
          <h2>Review Your Order</h2>
          <div class="cart-items" *ngIf="cartItems.length > 0">
            <div class="cart-item" *ngFor="let item of cartItems">
              <img [src]="getImageUrl(item.product.images[0])" [alt]="item.product.name" class="item-image">
              <div class="item-details">
                <h3>{{ item.product.name }}</h3>
                <p class="item-brand">{{ item.product.brand }}</p>
                <div class="item-variants" *ngIf="item.size || item.color">
                  <span *ngIf="item.size">Size: {{ item.size }}</span>
                  <span *ngIf="item.color">Color: {{ item.color }}</span>
                </div>
                <div class="item-price">
                  <span class="current-price">₹{{ item.product.price | number:'1.0-0' }}</span>
                  <span class="original-price" *ngIf="item.product.originalPrice">
                    ₹{{ item.product.originalPrice | number:'1.0-0' }}
                  </span>
                </div>
              </div>
              <div class="item-quantity">
                <span>Qty: {{ item.quantity }}</span>
                <span class="item-total">₹{{ (item.product.price * item.quantity) | number:'1.0-0' }}</span>
              </div>
            </div>
          </div>
          <div class="empty-cart" *ngIf="cartItems.length === 0">
            <i class="fas fa-shopping-cart"></i>
            <h3>Your cart is empty</h3>
            <p>Add some items to your cart to continue</p>
            <button class="btn btn-primary" (click)="goToShopping()">Continue Shopping</button>
          </div>
        </div>

        <!-- Step 2: Shipping Information -->
        <div class="checkout-step" *ngIf="currentStep === 2">
          <h2>Shipping Information</h2>
          <form [formGroup]="shippingForm" class="shipping-form">
            <div class="form-row">
              <div class="form-group">
                <label for="fullName">Full Name *</label>
                <input type="text" id="fullName" formControlName="fullName" class="form-control">
                <div class="error-message" *ngIf="shippingForm.get('fullName')?.invalid && shippingForm.get('fullName')?.touched">
                  Full name is required
                </div>
              </div>
              <div class="form-group">
                <label for="phone">Phone Number *</label>
                <input type="tel" id="phone" formControlName="phone" class="form-control">
                <div class="error-message" *ngIf="shippingForm.get('phone')?.invalid && shippingForm.get('phone')?.touched">
                  Valid phone number is required
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="addressLine1">Address Line 1 *</label>
              <input type="text" id="addressLine1" formControlName="addressLine1" class="form-control">
              <div class="error-message" *ngIf="shippingForm.get('addressLine1')?.invalid && shippingForm.get('addressLine1')?.touched">
                Address is required
              </div>
            </div>

            <div class="form-group">
              <label for="addressLine2">Address Line 2</label>
              <input type="text" id="addressLine2" formControlName="addressLine2" class="form-control">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="city">City *</label>
                <input type="text" id="city" formControlName="city" class="form-control">
                <div class="error-message" *ngIf="shippingForm.get('city')?.invalid && shippingForm.get('city')?.touched">
                  City is required
                </div>
              </div>
              <div class="form-group">
                <label for="state">State *</label>
                <select id="state" formControlName="state" class="form-control">
                  <option value="">Select State</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                </select>
                <div class="error-message" *ngIf="shippingForm.get('state')?.invalid && shippingForm.get('state')?.touched">
                  State is required
                </div>
              </div>
              <div class="form-group">
                <label for="pincode">Pincode *</label>
                <input type="text" id="pincode" formControlName="pincode" class="form-control" maxlength="6">
                <div class="error-message" *ngIf="shippingForm.get('pincode')?.invalid && shippingForm.get('pincode')?.touched">
                  Valid 6-digit pincode is required
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Step 3: Payment Method -->
        <div class="checkout-step" *ngIf="currentStep === 3">
          <h2>Payment Method</h2>
          <div class="payment-methods">
            <div class="payment-option" 
                 *ngFor="let method of paymentMethods" 
                 [class.selected]="selectedPaymentMethod === method.id"
                 (click)="selectPaymentMethod(method.id)">
              <i [class]="method.icon"></i>
              <div class="method-details">
                <h3>{{ method.name }}</h3>
                <p>{{ method.description }}</p>
              </div>
              <div class="method-radio">
                <input type="radio" [value]="method.id" [(ngModel)]="selectedPaymentMethod">
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4: Order Confirmation -->
        <div class="checkout-step" *ngIf="currentStep === 4">
          <div class="order-confirmation" *ngIf="!orderPlaced">
            <h2>Order Confirmation</h2>
            <div class="confirmation-details">
              <div class="shipping-summary">
                <h3>Shipping Address</h3>
                <div class="address-display">
                  <p><strong>{{ shippingForm.get('fullName')?.value }}</strong></p>
                  <p>{{ shippingForm.get('phone')?.value }}</p>
                  <p>{{ shippingForm.get('addressLine1')?.value }}</p>
                  <p *ngIf="shippingForm.get('addressLine2')?.value">{{ shippingForm.get('addressLine2')?.value }}</p>
                  <p>{{ shippingForm.get('city')?.value }}, {{ shippingForm.get('state')?.value }} {{ shippingForm.get('pincode')?.value }}</p>
                </div>
              </div>
              <div class="payment-summary">
                <h3>Payment Method</h3>
                <p>{{ getPaymentMethodName(selectedPaymentMethod) }}</p>
              </div>
            </div>
          </div>

          <div class="order-success" *ngIf="orderPlaced">
            <div class="success-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <h2>Order Placed Successfully!</h2>
            <p>Your order #{{ orderNumber }} has been placed successfully.</p>
            <div class="order-actions">
              <button class="btn btn-primary" (click)="viewOrder()">View Order</button>
              <button class="btn btn-secondary" (click)="continueShopping()">Continue Shopping</button>
            </div>
          </div>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="order-summary">
          <h3>Order Summary</h3>

          <!-- Cart Total Amount Display (Prominent) -->
          <div class="cart-total-highlight" *ngIf="cartSummary">
            <div class="total-amount-display">
              <i class="fas fa-shopping-cart"></i>
              <div class="amount-details">
                <span class="amount-label">Cart Total Amount</span>
                <span class="amount-value">₹{{ cartSummary.total | number:'1.0-0' }}</span>
              </div>
            </div>
          </div>

          <div class="summary-line">
            <span>Subtotal ({{ cartSummary?.itemCount }} items)</span>
            <span>₹{{ cartSummary?.subtotal | number:'1.0-0' }}</span>
          </div>
          <div class="summary-line" *ngIf="cartSummary && cartSummary.discount > 0">
            <span>Discount</span>
            <span class="discount">-₹{{ cartSummary.discount | number:'1.0-0' }}</span>
          </div>
          <div class="summary-line">
            <span>Tax (18% GST)</span>
            <span>₹{{ getTaxAmount() | number:'1.0-0' }}</span>
          </div>
          <div class="summary-line">
            <span>Shipping</span>
            <span>FREE</span>
          </div>
          <div class="summary-line total">
            <span><strong>Final Total</strong></span>
            <span><strong>₹{{ cartSummary?.total | number:'1.0-0' }}</strong></span>
          </div>

          <div class="checkout-actions">
            <button class="btn btn-secondary" 
                    *ngIf="currentStep > 1 && currentStep < 4" 
                    (click)="previousStep()"
                    [disabled]="processing">
              Previous
            </button>
            <button class="btn btn-primary" 
                    *ngIf="currentStep < 4" 
                    (click)="nextStep()"
                    [disabled]="!canProceed() || processing">
              <span *ngIf="!processing">{{ currentStep === 3 ? 'Place Order' : 'Continue' }}</span>
              <span *ngIf="processing">
                <i class="fas fa-spinner fa-spin"></i> Processing...
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .checkout-header {
      margin-bottom: 30px;
    }

    .checkout-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #2d3436;
      margin-bottom: 20px;
    }

    .step-indicator {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      position: relative;
    }

    .step:not(:last-child)::after {
      content: '';
      position: absolute;
      top: 20px;
      right: -50%;
      width: 100%;
      height: 2px;
      background: #ddd;
      z-index: 1;
    }

    .step.completed:not(:last-child)::after {
      background: #00b894;
    }

    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #ddd;
      color: #636e72;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      margin-bottom: 8px;
      position: relative;
      z-index: 2;
    }

    .step.active .step-number {
      background: #0984e3;
      color: white;
    }

    .step.completed .step-number {
      background: #00b894;
      color: white;
    }

    .step-label {
      font-size: 14px;
      color: #636e72;
      text-align: center;
    }

    .checkout-content {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 30px;
    }

    .checkout-step {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .checkout-step h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2d3436;
      margin-bottom: 20px;
    }

    .cart-items {
      space-y: 16px;
    }

    .cart-item {
      display: flex;
      gap: 16px;
      padding: 16px;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .item-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 8px;
    }

    .item-details {
      flex: 1;
    }

    .item-details h3 {
      font-size: 16px;
      font-weight: 600;
      color: #2d3436;
      margin-bottom: 4px;
    }

    .item-brand {
      color: #636e72;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .item-variants {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: #636e72;
      margin-bottom: 8px;
    }

    .item-price {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .current-price {
      font-weight: 600;
      color: #2d3436;
    }

    .original-price {
      text-decoration: line-through;
      color: #636e72;
      font-size: 14px;
    }

    .item-quantity {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }

    .item-total {
      font-weight: 600;
      color: #2d3436;
    }

    .shipping-form {
      space-y: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      color: #2d3436;
      margin-bottom: 8px;
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.3s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #0984e3;
      box-shadow: 0 0 0 3px rgba(9, 132, 227, 0.1);
    }

    .error-message {
      color: #e74c3c;
      font-size: 12px;
      margin-top: 4px;
    }

    .payment-methods {
      space-y: 12px;
    }

    .payment-option {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 12px;
    }

    .payment-option:hover {
      border-color: #0984e3;
    }

    .payment-option.selected {
      border-color: #0984e3;
      background: rgba(9, 132, 227, 0.05);
    }

    .payment-option i {
      font-size: 24px;
      color: #0984e3;
    }

    .method-details {
      flex: 1;
    }

    .method-details h3 {
      font-size: 16px;
      font-weight: 600;
      color: #2d3436;
      margin-bottom: 4px;
    }

    .method-details p {
      color: #636e72;
      font-size: 14px;
    }

    .order-summary {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      height: fit-content;
      position: sticky;
      top: 20px;
    }

    .order-summary h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #2d3436;
      margin-bottom: 20px;
    }

    .cart-total-highlight {
      background: linear-gradient(135deg, #4834d4, #686de0);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
      color: white;
    }

    .total-amount-display {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .total-amount-display i {
      font-size: 24px;
      color: #fff;
    }

    .amount-details {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .amount-label {
      font-size: 14px;
      font-weight: 500;
      opacity: 0.9;
      margin-bottom: 4px;
    }

    .amount-value {
      font-size: 24px;
      font-weight: 700;
      color: #fff;
    }

    .summary-line {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 14px;
    }

    .summary-line.total {
      border-top: 1px solid #e9ecef;
      padding-top: 12px;
      margin-top: 16px;
      font-size: 16px;
    }

    .discount {
      color: #00b894;
    }

    .checkout-actions {
      margin-top: 24px;
      display: flex;
      gap: 12px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      flex: 1;
    }

    .btn-primary {
      background: #0984e3;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0770c2;
    }

    .btn-secondary {
      background: #636e72;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #4a5459;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .order-success {
      text-align: center;
      padding: 40px 20px;
    }

    .success-icon {
      font-size: 4rem;
      color: #00b894;
      margin-bottom: 20px;
    }

    .order-success h2 {
      color: #00b894;
      margin-bottom: 16px;
    }

    .order-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-top: 24px;
    }

    .empty-cart {
      text-align: center;
      padding: 60px 20px;
    }

    .empty-cart i {
      font-size: 4rem;
      color: #ddd;
      margin-bottom: 20px;
    }

    .empty-cart h3 {
      color: #636e72;
      margin-bottom: 12px;
    }

    @media (max-width: 768px) {
      .checkout-content {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .step-indicator {
        flex-direction: column;
        gap: 16px;
      }

      .step:not(:last-child)::after {
        display: none;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  currentStep = 1;
  cartItems: CartItem[] = [];
  cartSummary: CartSummary | null = null;
  processing = false;
  orderPlaced = false;
  orderNumber = '';

  shippingForm: FormGroup;
  selectedPaymentMethod = '';

  paymentMethods: PaymentMethod[] = [];

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    // private checkoutService: CheckoutService,
    private paymentService: PaymentService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private http: HttpClient
  ) {
    this.shippingForm = this.fb.group({
      fullName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnInit() {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    this.loadCartData();
    this.loadPaymentMethods();
  }

  loadPaymentMethods() {
    this.paymentMethods = this.paymentService.getPaymentMethods();
  }

  loadCartData() {
    // Load cart data from API
    this.cartItems = [];
    this.cartSummary = {
      itemCount: 0,
      totalQuantity: 0,
      subtotal: 0,
      discount: 0,
      total: 0
    } as any;
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.cartItems.length > 0;
      case 2:
        return this.shippingForm.valid;
      case 3:
        return !!this.selectedPaymentMethod;
      default:
        return false;
    }
  }

  nextStep() {
    if (!this.canProceed()) return;

    if (this.currentStep === 3) {
      this.placeOrder();
    } else {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  selectPaymentMethod(methodId: string) {
    this.selectedPaymentMethod = methodId;
  }

  getPaymentMethodName(methodId: string): string {
    const method = this.paymentMethods.find(m => m.id === methodId);
    return method ? method.name : '';
  }

  placeOrder() {
    this.processing = true;

    const orderData = {
      shippingAddress: this.shippingForm.value,
      billingAddress: this.shippingForm.value,
      paymentMethod: this.selectedPaymentMethod
    };

    // Create order first
    this.http.post('/api/orders', orderData).subscribe({
      next: (response: any) => {
        if (response.success) {
          const orderId = response.data.order._id;
          this.processPayment(orderId);
        } else {
          this.snackBar.open('Failed to create order', 'Close', { duration: 3000 });
          this.processing = false;
        }
      },
      error: (error) => {
        console.error('Order creation error:', error);
        this.snackBar.open('Failed to create order. Please try again.', 'Close', { duration: 3000 });
        this.processing = false;
      }
    });
  }

  private processPayment(orderId: string) {
    const paymentData = {
      orderId: orderId,
      paymentMethod: this.selectedPaymentMethod,
      returnUrl: window.location.origin + '/order-confirmation'
    };

    this.paymentService.initiatePayment(paymentData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          if (this.selectedPaymentMethod === 'cod') {
            // Cash on Delivery - order is confirmed immediately
            this.orderNumber = response.data.orderNumber;
            this.currentStep = 4;
            this.orderPlaced = true;
            this.processing = false;
            this.snackBar.open('Order placed successfully!', 'Close', { duration: 3000 });
          } else {
            // Online payment - open Razorpay checkout
            this.openRazorpayCheckout(response.data);
          }
        } else {
          this.snackBar.open('Payment initiation failed', 'Close', { duration: 3000 });
          this.processing = false;
        }
      },
      error: (error) => {
        console.error('Payment initiation error:', error);
        this.snackBar.open('Payment failed. Please try again.', 'Close', { duration: 3000 });
        this.processing = false;
      }
    });
  }

  private async openRazorpayCheckout(paymentData: any) {
    try {
      const user = this.authService.currentUserValue;

      const options = {
        key: paymentData.razorpayKeyId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        order_id: paymentData.razorpayOrderId,
        name: 'DFashion',
        description: `Order #${paymentData.orderNumber}`,
        image: '/assets/logo.png',
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: '#3f51b5'
        },
        handler: (response: any) => {
          this.verifyPayment(response, paymentData.paymentId);
        },
        modal: {
          ondismiss: () => {
            this.processing = false;
            this.snackBar.open('Payment cancelled', 'Close', { duration: 3000 });
          }
        }
      };

      await this.paymentService.openRazorpayCheckout(options);
    } catch (error) {
      console.error('Razorpay checkout error:', error);
      this.snackBar.open('Failed to open payment gateway', 'Close', { duration: 3000 });
      this.processing = false;
    }
  }

  private verifyPayment(razorpayResponse: any, paymentId: string) {
    const verificationData = {
      razorpay_order_id: razorpayResponse.razorpay_order_id,
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      razorpay_signature: razorpayResponse.razorpay_signature,
      paymentId: paymentId
    };

    this.paymentService.verifyPayment(verificationData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.orderNumber = response.data.order.orderNumber;
          this.currentStep = 4;
          this.orderPlaced = true;
          this.snackBar.open('Payment successful! Order confirmed.', 'Close', { duration: 3000 });
        } else {
          this.snackBar.open('Payment verification failed', 'Close', { duration: 3000 });
        }
        this.processing = false;
      },
      error: (error) => {
        console.error('Payment verification error:', error);
        this.snackBar.open('Payment verification failed', 'Close', { duration: 3000 });
        this.processing = false;
      }
    });
  }

  goToShopping() {
    this.router.navigate(['/products']);
  }

  viewOrder() {
    this.router.navigate(['/account/orders']);
  }

  continueShopping() {
    this.router.navigate(['/']);
  }

  getImageUrl(image: any): string {
    if (typeof image === 'string') {
      return image;
    }
    return image?.url || '';
  }

  getTaxAmount(): number {
    return this.cartSummary ? this.cartSummary.subtotal * 0.18 : 0;
  }
}
