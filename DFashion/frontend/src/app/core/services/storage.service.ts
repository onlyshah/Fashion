import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    // If running on the web, Storage will only use IndexedDB, LocalStorage and SessionStorage
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // Create and expose methods that users of this service can call
  public async set(key: string, value: any): Promise<any> {
    return this._storage?.set(key, value);
  }

  public async get(key: string): Promise<any> {
    return this._storage?.get(key);
  }

  public async remove(key: string): Promise<any> {
    return this._storage?.remove(key);
  }

  public async clear(): Promise<void> {
    return this._storage?.clear();
  }

  public async keys(): Promise<string[]> {
    return this._storage?.keys() || [];
  }

  public async length(): Promise<number> {
    return this._storage?.length() || 0;
  }

  // Convenience methods for common operations
  public async setUser(user: any): Promise<any> {
    return this.set('user', user);
  }

  public async getUser(): Promise<any> {
    return this.get('user');
  }

  public async removeUser(): Promise<any> {
    return this.remove('user');
  }

  public async setToken(token: string): Promise<any> {
    return this.set('auth_token', token);
  }

  public async getToken(): Promise<string> {
    return this.get('auth_token');
  }

  public async removeToken(): Promise<any> {
    return this.remove('auth_token');
  }

  public async setCart(cart: any[]): Promise<any> {
    return this.set('cart', cart);
  }

  public async getCart(): Promise<any[]> {
    return this.get('cart') || [];
  }

  public async clearCart(): Promise<any> {
    return this.remove('cart');
  }

  public async setWishlist(wishlist: any[]): Promise<any> {
    return this.set('wishlist', wishlist);
  }

  public async getWishlist(): Promise<any[]> {
    return this.get('wishlist') || [];
  }

  public async clearWishlist(): Promise<any> {
    return this.remove('wishlist');
  }

  public async setSettings(settings: any): Promise<any> {
    return this.set('app_settings', settings);
  }

  public async getSettings(): Promise<any> {
    return this.get('app_settings') || {};
  }

  public async setOnboardingCompleted(completed: boolean): Promise<any> {
    return this.set('onboarding_completed', completed);
  }

  public async isOnboardingCompleted(): Promise<boolean> {
    return this.get('onboarding_completed') || false;
  }
}
