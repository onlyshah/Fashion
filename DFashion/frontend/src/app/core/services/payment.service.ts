import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet' | 'cod';
  icon: string;
  description?: string;
  enabled: boolean;
}

export interface PaymentInitiateRequest {
  orderId: string;
  paymentMethod: string;
  returnUrl?: string;
}

export interface PaymentInitiateResponse {
  success: boolean;
  data?: {
    paymentId: string;
    razorpayOrderId?: string;
    razorpayKeyId?: string;
    amount: number;
    currency: string;
    status: string;
    message: string;
    orderId: string;
    orderNumber: string;
  };
  message?: string;
}

export interface PaymentVerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  paymentId: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  data?: {
    payment: {
      id: string;
      status: string;
      amount: number;
      paymentMethod: string;
      gatewayPaymentId: string;
    };
    order: {
      id: string;
      orderNumber: string;
      status: string;
      paymentStatus: string;
    };
  };
  message?: string;
}

export interface PaymentHistory {
  success: boolean;
  data?: {
    payments: any[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://10.0.2.2:5000/api/payments'; // Direct IP for testing
  private paymentMethodsSubject = new BehaviorSubject<PaymentMethod[]>([]);
  public paymentMethods$ = this.paymentMethodsSubject.asObservable();

  private defaultPaymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      type: 'card',
      icon: 'card',
      description: 'Visa, Mastercard, RuPay',
      enabled: true
    },
    {
      id: 'upi',
      name: 'UPI',
      type: 'upi',
      icon: 'qr-code',
      description: 'Google Pay, PhonePe, Paytm',
      enabled: true
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      type: 'netbanking',
      icon: 'business',
      description: 'All major banks',
      enabled: true
    },
    {
      id: 'wallet',
      name: 'Wallet',
      type: 'wallet',
      icon: 'wallet',
      description: 'Paytm, Amazon Pay',
      enabled: true
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      type: 'cod',
      icon: 'cash',
      description: 'Pay when you receive',
      enabled: true
    }
  ];

  constructor(private http: HttpClient) {
    this.paymentMethodsSubject.next(this.defaultPaymentMethods);
  }

  /**
   * Initiate payment for an order
   */
  initiatePayment(paymentData: PaymentInitiateRequest): Observable<PaymentInitiateResponse> {
    return this.http.post<PaymentInitiateResponse>(`${this.apiUrl}/initiate`, paymentData);
  }

  /**
   * Verify payment after successful payment
   */
  verifyPayment(verificationData: PaymentVerifyRequest): Observable<PaymentVerifyResponse> {
    return this.http.post<PaymentVerifyResponse>(`${this.apiUrl}/verify`, verificationData);
  }

  /**
   * Get payment details by ID
   */
  getPaymentDetails(paymentId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${paymentId}`);
  }

  /**
   * Get payment history for the user
   */
  getPaymentHistory(params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentMethod?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Observable<PaymentHistory> {
    let queryParams = '';
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
      queryParams = searchParams.toString();
    }

    const url = queryParams ? `${this.apiUrl}?${queryParams}` : this.apiUrl;
    return this.http.get<PaymentHistory>(url);
  }

  /**
   * Request refund for a payment
   */
  requestRefund(paymentId: string, refundData: {
    amount?: number;
    reason: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${paymentId}/refund`, refundData);
  }

  /**
   * Get available payment methods
   */
  getPaymentMethods(): PaymentMethod[] {
    return this.paymentMethodsSubject.value;
  }

  /**
   * Update payment methods availability
   */
  updatePaymentMethods(methods: PaymentMethod[]): void {
    this.paymentMethodsSubject.next(methods);
  }

  /**
   * Load Razorpay script dynamically
   */
  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  /**
   * Open Razorpay checkout
   */
  async openRazorpayCheckout(options: {
    key: string;
    amount: number;
    currency: string;
    order_id: string;
    name: string;
    description: string;
    image?: string;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    theme?: {
      color?: string;
    };
    handler: (response: any) => void;
    modal?: {
      ondismiss?: () => void;
    };
  }): Promise<void> {
    const scriptLoaded = await this.loadRazorpayScript();
    
    if (!scriptLoaded) {
      throw new Error('Failed to load Razorpay script');
    }

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Get payment method by ID
   */
  getPaymentMethodById(id: string): PaymentMethod | undefined {
    return this.paymentMethodsSubject.value.find(method => method.id === id);
  }

  /**
   * Check if payment method is enabled
   */
  isPaymentMethodEnabled(id: string): boolean {
    const method = this.getPaymentMethodById(id);
    return method ? method.enabled : false;
  }

  /**
   * Get payment status display text
   */
  getPaymentStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'processing': 'Processing',
      'completed': 'Completed',
      'failed': 'Failed',
      'cancelled': 'Cancelled',
      'refunded': 'Refunded'
    };
    return statusMap[status] || status;
  }

  /**
   * Get payment status color
   */
  getPaymentStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'pending': 'warning',
      'processing': 'primary',
      'completed': 'success',
      'failed': 'danger',
      'cancelled': 'medium',
      'refunded': 'secondary'
    };
    return colorMap[status] || 'medium';
  }
}
