import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { CartService, CartItem, CartSummary } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  cartItems: CartItem[] = [];
  cartSummary: CartSummary | null = null;
  isLoading = false;
  selectedItems: string[] = [];
  cartCount = 0;

  constructor(
    private cartService: CartService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadCart();
    this.subscribeToCartUpdates();
    this.subscribeToCartCount();
  }

  subscribeToCartUpdates() {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.isLoading = false;
      console.log('🔄 Mobile cart items updated via subscription:', items.length, 'items');
      // Clear selections when cart updates
      this.selectedItems = this.selectedItems.filter(id =>
        items.some(item => item._id === id)
      );
    });

    this.cartService.cartSummary$.subscribe(summary => {
      this.cartSummary = summary;
      console.log('🔄 Mobile cart summary updated:', summary);
    });
  }

  subscribeToCartCount() {
    this.cartService.cartItemCount$.subscribe(count => {
      this.cartCount = count;
    });
  }

  ionViewWillEnter() {
    this.loadCart();
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

        console.log('🛒 Mobile cart component loaded:', this.cartItems.length, 'items');
        console.log('🛒 Mobile cart summary:', this.cartSummary);
        console.log('🛒 Mobile detailed cart items:', this.cartItems.map((item: any) => ({
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
          console.log('🛒 Mobile cart breakdown:', breakdown);
          console.log('🛒 Mobile selected items breakdown:', this.getSelectedItemsBreakdown());
        }
      },
      error: (error) => {
        console.error('❌ Failed to load mobile cart:', error);
        this.isLoading = false;
      }
    });
  }

  async updateQuantity(itemId: string, newQuantity: number) {
    if (newQuantity < 1) return;

    this.cartService.updateCartItem(itemId, newQuantity).subscribe({
      next: () => {
        this.presentToast('Quantity updated', 'success');
        this.loadCart(); // Refresh cart
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
        this.presentToast('Failed to update quantity', 'danger');
      }
    });
  }

  async removeItem(item: any) {
    const alert = await this.alertController.create({
      header: 'Remove Item',
      message: `Remove ${item.product.name} from cart?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Remove',
          handler: () => {
            this.cartService.removeFromCart(item._id).subscribe({
              next: () => {
                this.presentToast('Item removed from cart', 'success');
                this.loadCart(); // Refresh cart
              },
              error: (error) => {
                console.error('Error removing item:', error);
                this.presentToast('Failed to remove item', 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async clearCart() {
    const alert = await this.alertController.create({
      header: 'Clear Cart',
      message: 'Are you sure you want to remove all items from your cart?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Clear All',
          handler: () => {
            this.cartService.clearCartAPI().subscribe({
              next: () => {
                this.presentToast('Cart cleared', 'success');
                this.loadCart(); // Refresh cart
              },
              error: (error) => {
                console.error('Error clearing cart:', error);
                this.presentToast('Failed to clear cart', 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
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

  proceedToCheckout() {
    if (this.cartItems.length === 0) {
      this.presentToast('Your cart is empty', 'warning');
      return;
    }
    this.router.navigate(['/checkout']);
  }

  continueShopping() {
    this.router.navigate(['/tabs/home']);
  }

  doRefresh(event: any) {
    this.loadCart();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  // Selection methods
  toggleItemSelection(itemId: string) {
    const index = this.selectedItems.indexOf(itemId);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(itemId);
    }
    console.log('🛒 Mobile item selection toggled:', itemId, 'Selected items:', this.selectedItems.length);
    console.log('🛒 Mobile updated selected items breakdown:', this.getSelectedItemsBreakdown());
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
  async bulkRemoveItems() {
    if (this.selectedItems.length === 0) return;

    const alert = await this.alertController.create({
      header: 'Remove Selected Items',
      message: `Are you sure you want to remove ${this.selectedItems.length} item(s) from your cart?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Remove',
          handler: () => {
            this.cartService.bulkRemoveFromCart(this.selectedItems).subscribe({
              next: (response) => {
                console.log(`✅ ${response.removedCount} items removed from mobile cart`);
                this.selectedItems = [];
                this.loadCart();
                this.presentToast(`${response.removedCount} items removed from cart`, 'success');
              },
              error: (error) => {
                console.error('Failed to remove items:', error);
                this.presentToast('Failed to remove items', 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  // Enhanced calculation methods
  getDiscountPercentage(originalPrice: number, currentPrice: number): number {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  getItemTotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }

  getItemSavings(item: CartItem): number {
    if (!item.product.originalPrice || item.product.originalPrice <= item.product.price) return 0;
    return (item.product.originalPrice - item.product.price) * item.quantity;
  }

  getCartBreakdown() {
    return {
      totalItems: this.cartItems.length,
      totalQuantity: this.cartItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: this.cartItems.reduce((sum, item) => sum + (item.product.originalPrice || item.product.price) * item.quantity, 0),
      totalSavings: this.cartItems.reduce((sum, item) => sum + this.getItemSavings(item), 0),
      finalTotal: this.cartItems.reduce((sum, item) => sum + this.getItemTotal(item), 0)
    };
  }

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

  trackByItemId(index: number, item: any): string {
    return item._id;
  }

  async presentToast(message: string, color: string = 'medium') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    toast.present();
  }
}
