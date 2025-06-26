import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { WishlistService, WishlistItem } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.page.html',
  styleUrls: ['./wishlist.page.scss'],
})
export class WishlistPage implements OnInit {
  wishlistItems: WishlistItem[] = [];
  isLoading = false;
  selectedItems: string[] = [];
  wishlistCount = 0;

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadWishlist();
    this.subscribeToWishlistUpdates();
    this.subscribeToWishlistCount();
  }

  ionViewWillEnter() {
    this.loadWishlist();
  }

  loadWishlist() {
    this.isLoading = true;
    this.wishlistService.getWishlist().subscribe({
      next: (response) => {
        this.wishlistItems = response.data?.items || [];
        this.isLoading = false;

        // Select all items by default
        this.selectedItems = this.wishlistItems.map(item => item._id);

        console.log('🛒 Mobile wishlist loaded:', this.wishlistItems.length, 'items');
      },
      error: (error) => {
        console.error('❌ Failed to load mobile wishlist:', error);
        this.isLoading = false;
      }
    });
  }

  subscribeToWishlistUpdates() {
    this.wishlistService.wishlistItems$.subscribe(items => {
      this.wishlistItems = items;
      this.isLoading = false;
      console.log('🔄 Mobile wishlist items updated via subscription:', items.length, 'items');
      // Clear selections when wishlist updates
      this.selectedItems = this.selectedItems.filter(id =>
        items.some(item => item._id === id)
      );
    });
  }

  subscribeToWishlistCount() {
    this.wishlistService.wishlistItemCount$.subscribe(count => {
      this.wishlistCount = count;
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
    console.log('🛒 Mobile wishlist item selection toggled:', itemId, 'Selected items:', this.selectedItems.length);
  }

  isItemSelected(itemId: string): boolean {
    return this.selectedItems.includes(itemId);
  }

  toggleSelectAll() {
    if (this.allItemsSelected()) {
      this.selectedItems = [];
    } else {
      this.selectedItems = this.wishlistItems.map(item => item._id);
    }
  }

  allItemsSelected(): boolean {
    return this.wishlistItems.length > 0 &&
           this.selectedItems.length === this.wishlistItems.length;
  }

  // Bulk operations
  async bulkRemoveItems() {
    if (this.selectedItems.length === 0) return;

    const alert = await this.alertController.create({
      header: 'Remove Selected Items',
      message: `Are you sure you want to remove ${this.selectedItems.length} item(s) from your wishlist?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Remove',
          handler: () => {
            this.selectedItems.forEach(itemId => {
              const item = this.wishlistItems.find(i => i._id === itemId);
              if (item) {
                this.removeFromWishlist(item.product._id);
              }
            });
            this.selectedItems = [];
          }
        }
      ]
    });
    await alert.present();
  }

  async bulkMoveToCart() {
    if (this.selectedItems.length === 0) return;

    const alert = await this.alertController.create({
      header: 'Move to Cart',
      message: `Move ${this.selectedItems.length} item(s) to cart?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Move to Cart',
          handler: () => {
            this.selectedItems.forEach(itemId => {
              const item = this.wishlistItems.find(i => i._id === itemId);
              if (item) {
                this.moveToCart(item);
              }
            });
            this.selectedItems = [];
          }
        }
      ]
    });
    await alert.present();
  }

  async removeFromWishlist(productId: string) {
    this.wishlistService.removeFromWishlist(productId).subscribe({
      next: () => {
        this.presentToast('Item removed from wishlist', 'success');
        this.loadWishlist(); // Refresh wishlist
      },
      error: (error) => {
        console.error('Failed to remove from wishlist:', error);
        this.presentToast('Failed to remove item', 'danger');
      }
    });
  }

  async moveToCart(item: WishlistItem) {
    this.cartService.addToCart(item.product._id, 1).subscribe({
      next: () => {
        this.removeFromWishlist(item.product._id);
        this.presentToast('Item moved to cart', 'success');
      },
      error: (error) => {
        console.error('Failed to move to cart:', error);
        this.presentToast('Failed to move to cart', 'danger');
      }
    });
  }

  viewProduct(productId: string) {
    this.router.navigate(['/product', productId]);
  }

  getImageUrl(image: any): string {
    if (typeof image === 'string') {
      return image;
    }
    return image?.url || '/assets/images/placeholder.jpg';
  }

  getDiscountPercentage(originalPrice: number, currentPrice: number): number {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  getSelectedItemsCount(): number {
    return this.selectedItems.length;
  }

  continueShopping() {
    this.router.navigate(['/tabs/home']);
  }

  doRefresh(event: any) {
    this.loadWishlist();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
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
