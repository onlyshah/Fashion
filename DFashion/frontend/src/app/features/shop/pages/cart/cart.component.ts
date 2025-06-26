import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { CartService, CartItem, CartSummary } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartSummary: CartSummary | null = null;
  isLoading = true;
  selectedItems: string[] = [];
  cartCount = 0;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCart();
    this.subscribeToCartUpdates();
    this.subscribeToCartCount();
  }

  loadCart() {
    this.isLoading = true;
    this.cartService.getCart().subscribe({
      next: (response) => {
        this.cartItems = response.cart?.items || [];
        this.cartSummary = response.summary;
        this.isLoading = false;

        // Select all items by default
        this.selectedItems = this.cartItems.map(item => item._id);

        console.log('🛒 Cart component loaded:', this.cartItems.length, 'items');
        console.log('🛒 Cart summary:', this.cartSummary);
        console.log('🛒 Detailed cart items:', this.cartItems.map((item: any) => ({
          id: item._id,
          name: item.product?.name,
          quantity: item.quantity,
          unitPrice: item.product?.price,
          itemTotal: item.product?.price * item.quantity,
          originalPrice: item.product?.originalPrice
        })));

        // Log cart breakdown for debugging
        if (this.cartItems.length > 0) {
          const breakdown = this.getCartBreakdown();
          console.log('🛒 Cart breakdown:', breakdown);
          console.log('🛒 Selected items breakdown:', this.getSelectedItemsBreakdown());
        }
      },
      error: (error) => {
        console.error('❌ Failed to load cart:', error);
        this.isLoading = false;
      }
    });
  }

  subscribeToCartUpdates() {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.isLoading = false;
      console.log('🔄 Cart items updated via subscription:', items.length, 'items');
      // Clear selections when cart updates
      this.selectedItems = this.selectedItems.filter(id =>
        items.some(item => item._id === id)
      );
    });

    this.cartService.cartSummary$.subscribe(summary => {
      this.cartSummary = summary;
      console.log('🔄 Cart summary updated:', summary);
    });
  }

  subscribeToCartCount() {
    this.cartService.cartItemCount$.subscribe(count => {
      this.cartCount = count;
    });
  }

  // Selection methods
  toggleItemSelection(itemId: string) {
    const index = this.selectedItems.indexOf(itemId);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(itemId);
    }
    console.log('🛒 Item selection toggled:', itemId, 'Selected items:', this.selectedItems.length);
    console.log('🛒 Updated selected items breakdown:', this.getSelectedItemsBreakdown());
  }

  isItemSelected(itemId: string): boolean {
    return this.selectedItems.includes(itemId);
  }

  toggleSelectAll() {
    if (this.allItemsSelected()) {
      this.selectedItems = [];
    } else {
      this.selectedItems = this.cartItems.map(item => item._id);
    }
  }

  allItemsSelected(): boolean {
    return this.cartItems.length > 0 &&
           this.selectedItems.length === this.cartItems.length;
  }

  // Bulk operations
  bulkRemoveItems() {
    if (this.selectedItems.length === 0) return;

    if (confirm(`Are you sure you want to remove ${this.selectedItems.length} item(s) from your cart?`)) {
      this.cartService.bulkRemoveFromCart(this.selectedItems).subscribe({
        next: (response) => {
          console.log(`✅ ${response.removedCount} items removed from cart`);
          this.selectedItems = [];
          this.loadCart();
        },
        error: (error) => {
          console.error('Failed to remove items:', error);
        }
      });
    }
  }

  refreshCart() {
    this.isLoading = true;
    this.cartService.refreshCartCount();
    this.loadCart();
  }

  async increaseQuantity(item: CartItem) {
    this.cartService.updateCartItem(item._id, item.quantity + 1).subscribe({
      next: () => {
        this.loadCart(); // Refresh cart
      },
      error: (error) => {
        console.error('Failed to update quantity:', error);
      }
    });
  }

  async decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      this.cartService.updateCartItem(item._id, item.quantity - 1).subscribe({
        next: () => {
          this.loadCart(); // Refresh cart
        },
        error: (error) => {
          console.error('Failed to update quantity:', error);
        }
      });
    }
  }

  async removeItem(item: CartItem) {
    this.cartService.removeFromCart(item._id).subscribe({
      next: () => {
        this.loadCart(); // Refresh cart
      },
      error: (error) => {
        console.error('Failed to remove item:', error);
      }
    });
  }

  getTotalItems(): number {
    return this.cartSummary?.totalQuantity || 0;
  }

  getSubtotal(): number {
    return this.cartSummary?.subtotal || 0;
  }

  getDiscount(): number {
    return this.cartSummary?.discount || 0;
  }

  getTotal(): number {
    return this.cartSummary?.total || 0;
  }

  // Calculate discount percentage
  getDiscountPercentage(originalPrice: number, currentPrice: number): number {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  // Get individual item total
  getItemTotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }

  // Get individual item savings
  getItemSavings(item: CartItem): number {
    if (!item.product.originalPrice || item.product.originalPrice <= item.product.price) return 0;
    return (item.product.originalPrice - item.product.price) * item.quantity;
  }

  // Get cart breakdown for detailed display
  getCartBreakdown() {
    return {
      totalItems: this.cartItems.length,
      totalQuantity: this.cartItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: this.cartItems.reduce((sum, item) => sum + (item.product.originalPrice || item.product.price) * item.quantity, 0),
      totalSavings: this.cartItems.reduce((sum, item) => sum + this.getItemSavings(item), 0),
      finalTotal: this.cartItems.reduce((sum, item) => sum + this.getItemTotal(item), 0)
    };
  }

  // Get selected items breakdown for detailed display
  getSelectedItemsBreakdown() {
    const selectedCartItems = this.cartItems.filter(item => this.selectedItems.includes(item._id));
    return {
      selectedItems: selectedCartItems.length,
      selectedQuantity: selectedCartItems.reduce((sum, item) => sum + item.quantity, 0),
      selectedSubtotal: selectedCartItems.reduce((sum, item) => sum + (item.product.originalPrice || item.product.price) * item.quantity, 0),
      selectedSavings: selectedCartItems.reduce((sum, item) => sum + this.getItemSavings(item), 0),
      selectedTotal: selectedCartItems.reduce((sum, item) => sum + this.getItemTotal(item), 0)
    };
  }

  // Get selected items totals for display
  getSelectedItemsTotal(): number {
    const selectedCartItems = this.cartItems.filter(item => this.selectedItems.includes(item._id));
    return selectedCartItems.reduce((sum, item) => sum + this.getItemTotal(item), 0);
  }

  getSelectedItemsCount(): number {
    const selectedCartItems = this.cartItems.filter(item => this.selectedItems.includes(item._id));
    return selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  getSelectedItemsSavings(): number {
    const selectedCartItems = this.cartItems.filter(item => this.selectedItems.includes(item._id));
    return selectedCartItems.reduce((sum, item) => sum + this.getItemSavings(item), 0);
  }

  proceedToCheckout() {
    this.router.navigate(['/shop/checkout']);
  }

  continueShopping() {
    this.router.navigate(['/']);
  }
}
