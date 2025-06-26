import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ProductService } from '../../../../core/services/product.service';
import { SearchService, SearchFilters, SearchSuggestion } from '../../../../core/services/search.service';
import { AdvancedSearchComponent } from '../../../../shared/components/advanced-search/advanced-search.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, AdvancedSearchComponent],
  templateUrl: './search.component.html',
  styles: [`
    .search-page {
      min-height: calc(100vh - 60px);
      background: #f8f9fa;
    }

    .search-header {
      background: white;
      border-bottom: 1px solid #e9ecef;
      padding: 2rem 0;
      position: sticky;
      top: 60px;
      z-index: 100;
    }

    .search-bar-container {
      max-width: 600px;
      margin: 0 auto;
    }

    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      color: #6c757d;
      z-index: 1;
    }

    .search-input {
      width: 100%;
      padding: 1rem 1rem 1rem 3rem;
      border: 2px solid #e9ecef;
      border-radius: 50px;
      font-size: 1rem;
      outline: none;
      transition: all 0.3s ease;
    }

    .search-input:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }

    .clear-btn {
      position: absolute;
      right: 1rem;
      background: none;
      border: none;
      color: #6c757d;
      cursor: pointer;
      padding: 0.5rem;
    }

    .search-content {
      padding: 2rem 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .loading-container {
      text-align: center;
      padding: 4rem 0;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .results-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .results-count {
      color: #6c757d;
      font-size: 0.9rem;
    }

    .filters-section {
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-weight: 500;
      font-size: 0.9rem;
      color: #495057;
    }

    .filter-group select {
      padding: 0.5rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    .no-results {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 8px;
    }

    .no-results i {
      font-size: 4rem;
      color: #dee2e6;
      margin-bottom: 1rem;
    }

    .no-results h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      color: #495057;
    }

    .no-results p {
      color: #6c757d;
      margin-bottom: 2rem;
    }

    .suggested-searches h4 {
      margin: 0 0 1rem 0;
      font-size: 1rem;
      color: #495057;
    }

    .search-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
    }

    .search-tag {
      background: #e9ecef;
      color: #495057;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }

    .search-tag:hover {
      background: #007bff;
      color: white;
    }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .product-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .product-image {
      position: relative;
      width: 100%;
      height: 200px;
      overflow: hidden;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .product-card:hover .product-image img {
      transform: scale(1.05);
    }

    .product-badge {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      background: #dc3545;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .product-actions {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
    }

    .action-btn {
      background: rgba(255, 255, 255, 0.9);
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #6c757d;
    }

    .action-btn:hover {
      background: white;
      color: #dc3545;
    }

    .product-info {
      padding: 1rem;
    }

    .product-info h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: #212529;
      line-height: 1.3;
    }

    .brand {
      color: #6c757d;
      font-size: 0.85rem;
      margin: 0 0 0.5rem 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .price-container {
      margin-bottom: 0.5rem;
    }

    .current-price {
      font-size: 1.125rem;
      font-weight: 700;
      color: #28a745;
      margin-right: 0.5rem;
    }

    .original-price {
      font-size: 0.9rem;
      color: #6c757d;
      text-decoration: line-through;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .stars {
      display: flex;
      gap: 0.125rem;
    }

    .stars i {
      font-size: 0.875rem;
      color: #dee2e6;
    }

    .stars i.filled {
      color: #ffc107;
    }

    .rating-count {
      font-size: 0.8rem;
      color: #6c757d;
    }

    .product-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .btn-cart,
    .btn-buy {
      flex: 1;
      padding: 0.5rem;
      border: none;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-cart {
      background: #f8f9fa;
      color: #495057;
      border: 1px solid #dee2e6;
    }

    .btn-cart:hover {
      background: #e9ecef;
    }

    .btn-buy {
      background: #007bff;
      color: white;
    }

    .btn-buy:hover {
      background: #0056b3;
    }

    .default-content {
      max-width: 800px;
      margin: 0 auto;
    }

    .section {
      margin-bottom: 3rem;
    }

    .section h3 {
      margin: 0 0 1rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #212529;
    }

    .search-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .search-chip {
      background: white;
      border: 1px solid #dee2e6;
      color: #495057;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .search-chip:hover {
      border-color: #007bff;
      color: #007bff;
    }

    .search-chip.popular {
      background: linear-gradient(45deg, #ff6b6b, #feca57);
      color: white;
      border: none;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .category-card {
      background: white;
      padding: 2rem 1rem;
      border-radius: 12px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .category-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .category-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(45deg, #007bff, #0056b3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
    }

    .category-icon i {
      font-size: 1.5rem;
      color: white;
    }

    .category-card h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #212529;
    }

    .category-card p {
      margin: 0;
      color: #6c757d;
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .filters-section {
        flex-direction: column;
        gap: 1rem;
      }

      .results-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
      }

      .categories-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }

      .search-header {
        padding: 1rem 0;
      }
    }
  `]
})
export class SearchComponent implements OnInit, OnDestroy {
  searchQuery = '';
  searchResults: any[] = [];
  recentSearches: string[] = [];
  isLoading = false;
  hasSearched = false;
  currentFilters: SearchFilters = {};
  searchStartTime: number = 0;

  private destroy$ = new Subject<void>();
  
  // Filters
  selectedCategory = '';
  selectedPriceRange = '';
  sortBy = 'relevance';
  categories: string[] = ['Men', 'Women', 'Kids', 'Accessories', 'Footwear', 'Electronics'];
  
  // Data
  popularSearches = ['Dresses', 'Jeans', 'T-shirts', 'Sneakers', 'Jackets', 'Accessories', 'Formal Wear', 'Casual Wear'];
  categoryList = [
    { name: 'Men', icon: 'fas fa-male', count: 1250 },
    { name: 'Women', icon: 'fas fa-female', count: 1890 },
    { name: 'Kids', icon: 'fas fa-child', count: 650 },
    { name: 'Accessories', icon: 'fas fa-gem', count: 890 },
    { name: 'Footwear', icon: 'fas fa-shoe-prints', count: 750 },
    { name: 'Electronics', icon: 'fas fa-mobile-alt', count: 450 }
  ];
  
  wishlistItems: string[] = [];
  private searchSubject = new Subject<string>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private searchService: SearchService
  ) {}

  ngOnInit() {
    this.loadRecentSearches();
    this.loadWishlistItems();
    
    // Check for query parameter
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchQuery = params['q'];
        this.performSearch();
      }
    });

    // Setup search with debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.trim().length > 0) {
          this.isLoading = true;
          return this.productService.searchProducts(query, {
            category: this.selectedCategory,
            minPrice: this.getPriceRange().min,
            maxPrice: this.getPriceRange().max,
            sortBy: this.getSortField(),
            sortOrder: this.getSortOrder()
          });
        } else {
          this.searchResults = [];
          this.hasSearched = false;
          this.isLoading = false;
          return [];
        }
      })
    ).subscribe({
      next: (response: any) => {
        console.log('Search response:', response);
        this.searchResults = response.products || response.data?.products || [];
        this.hasSearched = true;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.isLoading = false;
        this.hasSearched = true;
        this.searchResults = [];
        // Show user-friendly error message
        this.showErrorMessage('Search failed. Please try again.');
      }
    });
  }

  onSearchInput(event: any) {
    this.searchQuery = event.target.value;
    if (this.searchQuery.trim().length > 0) {
      this.searchSubject.next(this.searchQuery);
    } else {
      this.searchResults = [];
      this.hasSearched = false;
    }
  }

  onSearchSubmit() {
    if (this.searchQuery.trim()) {
      this.saveRecentSearch(this.searchQuery.trim());
      this.performSearch();
    }
  }

  performSearch() {
    if (this.searchQuery.trim()) {
      this.searchSubject.next(this.searchQuery);
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.hasSearched = false;
  }

  searchFor(term: string) {
    this.searchQuery = term;
    this.saveRecentSearch(term);
    this.performSearch();
  }

  applyFilters() {
    if (this.searchQuery) {
      this.performSearch();
    }
  }

  browseCategory(category: string) {
    this.selectedCategory = category;
    this.searchQuery = category;
    this.performSearch();
  }

  viewProduct(productId: string) {
    this.router.navigate(['/shop/product', productId]);
  }

  toggleWishlist(productId: string) {
    if (this.isInWishlist(productId)) {
      this.wishlistItems = this.wishlistItems.filter(id => id !== productId);
    } else {
      this.wishlistItems.push(productId);
    }
    localStorage.setItem('wishlist', JSON.stringify(this.wishlistItems));
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistItems.includes(productId);
  }

  addToCart(productId: string) {
    // Add to cart logic
    console.log('Added to cart:', productId);
    this.showNotification('Added to cart!', 'success');
  }

  buyNow(productId: string) {
    // Buy now logic
    console.log('Buy now:', productId);
    this.showNotification('Redirecting to checkout...', 'info');
  }

  getDiscountPercentage(product: any): number {
    if (product.discountPrice) {
      return Math.round(((product.price - product.discountPrice) / product.price) * 100);
    }
    return 0;
  }

  removeRecentSearch(term: string) {
    this.recentSearches = this.recentSearches.filter(search => search !== term);
    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
  }

  private loadRecentSearches() {
    const saved = localStorage.getItem('recentSearches');
    this.recentSearches = saved ? JSON.parse(saved) : [];
  }

  private loadWishlistItems() {
    const saved = localStorage.getItem('wishlist');
    this.wishlistItems = saved ? JSON.parse(saved) : [];
  }

  private saveRecentSearch(term: string) {
    this.recentSearches = this.recentSearches.filter(search => search !== term);
    this.recentSearches.unshift(term);
    this.recentSearches = this.recentSearches.slice(0, 10);
    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
  }

  private showErrorMessage(message: string) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'search-error-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-size: 14px;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  private getPriceRange() {
    if (!this.selectedPriceRange) return { min: undefined, max: undefined };
    
    const ranges: { [key: string]: { min?: number; max?: number } } = {
      '0-1000': { min: 0, max: 1000 },
      '1000-2500': { min: 1000, max: 2500 },
      '2500-5000': { min: 2500, max: 5000 },
      '5000-10000': { min: 5000, max: 10000 },
      '10000+': { min: 10000 }
    };
    
    return ranges[this.selectedPriceRange] || { min: undefined, max: undefined };
  }

  private getSortField(): string {
    const sortMap: { [key: string]: string } = {
      'relevance': 'createdAt',
      'price-low': 'price',
      'price-high': 'price',
      'newest': 'createdAt',
      'rating': 'rating'
    };
    return sortMap[this.sortBy] || 'createdAt';
  }

  private getSortOrder(): 'asc' | 'desc' {
    return this.sortBy === 'price-high' ? 'desc' : 'asc';
  }

  private showNotification(message: string, type: 'success' | 'info' | 'error') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-size: 0.9rem;
      font-weight: 500;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  // Advanced search event handlers
  onSearchPerformed(event: { query: string; filters: SearchFilters }) {
    this.searchQuery = event.query;
    this.currentFilters = event.filters;
    this.searchStartTime = Date.now();
    this.hasSearched = true;

    // Update URL with search parameters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: event.query, ...event.filters },
      queryParamsHandling: 'merge'
    });

    // Save to recent searches
    this.saveRecentSearch(event.query);
  }

  onSuggestionSelected(suggestion: SearchSuggestion) {
    // Track suggestion selection
    console.log('Suggestion selected:', suggestion);

    // Track the interaction
    if (this.searchQuery) {
      this.searchService.trackSearchInteraction(
        this.searchQuery,
        suggestion.metadata?.productId || '',
        'suggestion_click'
      ).subscribe();
    }
  }

  onFiltersChanged(filters: SearchFilters) {
    this.currentFilters = filters;

    // Update URL with new filters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...filters },
      queryParamsHandling: 'merge'
    });

    // Track filter change
    if (this.searchQuery) {
      this.searchService.trackFilterChange(this.searchQuery).subscribe();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Track product clicks from search results
  onProductClick(product: any, position: number) {
    if (this.searchQuery) {
      this.searchService.trackProductClick(this.searchQuery, product._id, position).subscribe();
    }
  }
}
