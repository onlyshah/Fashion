import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LoadingController, ToastController } from '@ionic/angular';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage implements OnInit {
  currentStep = 1;
  cartItems: any[] = [];
  cartSummary: any = null;
  
  shippingForm: FormGroup;
  selectedPaymentMethod = '';
  processing = false;
  orderPlaced = false;
  orderNumber = '';

  paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Pay securely with your card',
      icon: 'card'
    },
    {
      id: 'upi',
      name: 'UPI',
      description: 'Pay using UPI apps',
      icon: 'phone-portrait'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'Pay using your bank account',
      icon: 'business'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when your order is delivered',
      icon: 'cash'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private router: Router,
    private http: HttpClient,
    private loadingController: LoadingController,
    private toastController: ToastController
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
    this.loadCart();
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });
    this.cartService.cartSummary$.subscribe(summary => {
      this.cartSummary = summary;
    });
  }

  loadCart() {
    this.cartService.getCartAPI().subscribe({
      next: () => {
        // Cart loaded successfully
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.presentToast('Error loading cart', 'danger');
      }
    });
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
    if (this.canProceed() && this.currentStep < 4) {
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

  getTax(): number {
    return this.cartSummary ? Math.round(this.cartSummary.subtotal * 0.18) : 0;
  }

  getShipping(): number {
    return this.cartSummary && this.cartSummary.subtotal >= 500 ? 0 : 50;
  }

  getTotal(): number {
    if (!this.cartSummary) return 0;
    return this.cartSummary.subtotal + this.getTax() + this.getShipping() - (this.cartSummary.discount || 0);
  }

  getImageUrl(image: any): string {
    if (typeof image === 'string') {
      return image;
    }
    return image?.url || '/assets/images/placeholder.jpg';
  }

  async placeOrder() {
    if (!this.canProceed()) {
      this.presentToast('Please complete all required fields', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Processing your order...'
    });
    await loading.present();

    this.processing = true;

    const orderData = {
      items: this.cartItems.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.product.price
      })),
      shippingAddress: this.shippingForm.value,
      billingAddress: this.shippingForm.value,
      paymentMethod: this.selectedPaymentMethod
    };

    // Create order and process payment
    this.http.post('/api/v1/orders', orderData).subscribe({
      next: (response: any) => {
        if (response.success) {
          const orderId = response.data.order._id;
          
          // Process payment
          const paymentData = {
            orderId: orderId,
            paymentMethod: this.selectedPaymentMethod,
            returnUrl: window.location.origin + '/order-confirmation'
          };
          
          this.http.post('/api/v1/payments/initiate', paymentData).subscribe({
            next: async (paymentResponse: any) => {
              await loading.dismiss();
              this.processing = false;
              
              if (paymentResponse.success && paymentResponse.data.status === 'completed') {
                this.orderNumber = paymentResponse.data.orderNumber;
                this.currentStep = 4;
                this.orderPlaced = true;
                this.presentToast('Order placed successfully!', 'success');
              } else {
                this.presentToast('Payment failed. Please try again.', 'danger');
              }
            },
            error: async (error: any) => {
              await loading.dismiss();
              this.processing = false;
              console.error('Payment error:', error);
              this.presentToast('Payment failed. Please try again.', 'danger');
            }
          });
        }
      },
      error: async (error: any) => {
        await loading.dismiss();
        this.processing = false;
        console.error('Order creation error:', error);
        this.presentToast('Failed to create order. Please try again.', 'danger');
      }
    });
  }

  goToShopping() {
    this.router.navigate(['/tabs/home']);
  }

  viewOrder() {
    this.router.navigate(['/orders']);
  }

  continueShopping() {
    this.router.navigate(['/tabs/home']);
  }

  async presentToast(message: string, color: string = 'medium') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    toast.present();
  }
}
