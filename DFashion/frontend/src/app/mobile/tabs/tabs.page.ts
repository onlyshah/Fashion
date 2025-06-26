import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {
  cartItemCount = 0;
  wishlistItemCount = 0;
  isAuthenticated = false;
  isVendor = false;
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit() {
    // Subscribe to auth state
    this.authService.isAuthenticated$.subscribe(
      isAuth => this.isAuthenticated = isAuth
    );

    // Subscribe to current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isVendor = user?.role === 'vendor' || user?.role === 'admin';
    });

    // Subscribe to cart count
    this.cartService.cartItemCount$.subscribe(
      count => this.cartItemCount = count
    );

    // Subscribe to wishlist count
    this.wishlistService.wishlistItemCount$.subscribe(
      count => this.wishlistItemCount = count
    );
  }
}
