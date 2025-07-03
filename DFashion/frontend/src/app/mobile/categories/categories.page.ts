import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit {
  categories: any[] = [];
  products: any[] = [];
  filteredProducts: any[] = [];
  selectedCategory: string = '';
  isLoading = true;
  searchQuery = '';
  sortBy = 'name';
  priceRange = { lower: 0, upper: 10000 };
  selectedBrands: string[] = [];
  availableBrands: string[] = [];
  searchFocused = false;

  // Quick search tags
  quickSearchTags = [
    'Trending', 'New Arrivals', 'Sale', 'Dresses', 'Shoes',
    'Accessories', 'Men\'s Fashion', 'Women\'s Fashion'
  ];

  // Filter options
  sortOptions = [
    { value: 'name', label: 'Name A-Z' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Rating' },
    { value: 'newest', label: 'Newest First' }
  ];

  get hasActiveFilters(): boolean {
    return !!(this.selectedCategory || this.searchQuery || this.selectedBrands.length > 0);
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
    
    // Check for category parameter
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
        this.filterProducts();
      }
    });
  }

  async loadCategories() {
    try {
      // Load categories from API or use default ones
      this.categories = [
        { id: 'men', name: 'Men', icon: 'man', color: 'primary' },
        { id: 'women', name: 'Women', icon: 'woman', color: 'secondary' },
        { id: 'kids', name: 'Kids', icon: 'happy', color: 'tertiary' },
        { id: 'accessories', name: 'Accessories', icon: 'bag', color: 'success' },
        { id: 'shoes', name: 'Shoes', icon: 'footsteps', color: 'warning' },
        { id: 'bags', name: 'Bags', icon: 'bag-handle', color: 'danger' }
      ];
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  async loadProducts() {
    try {
      this.isLoading = true;
      const response = await this.productService.getAllProducts().toPromise();
      this.products = response?.data || [];
      this.filteredProducts = [...this.products];
      this.extractBrands();
      this.filterProducts();
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      this.isLoading = false;
    }
  }

  extractBrands() {
    const brands = new Set(this.products.map(p => p.brand).filter(Boolean));
    this.availableBrands = Array.from(brands).sort();
  }

  onCategorySelect(category: any) {
    this.selectedCategory = this.selectedCategory === category.id ? '' : category.id;
    this.filterProducts();
  }

  onSearchChange() {
    this.filterProducts();
  }

  onSortChange() {
    this.sortProducts();
  }

  onBrandToggle(brand: string) {
    const index = this.selectedBrands.indexOf(brand);
    if (index > -1) {
      this.selectedBrands.splice(index, 1);
    } else {
      this.selectedBrands.push(brand);
    }
    this.filterProducts();
  }

  onPriceRangeChange() {
    this.filterProducts();
  }

  filterProducts() {
    let filtered = [...this.products];

    // Filter by category
    if (this.selectedCategory) {
      filtered = filtered.filter(p => 
        p.category?.toLowerCase() === this.selectedCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    // Filter by brands
    if (this.selectedBrands.length > 0) {
      filtered = filtered.filter(p => 
        this.selectedBrands.includes(p.brand)
      );
    }

    // Filter by price range
    filtered = filtered.filter(p => 
      p.price >= this.priceRange.lower && p.price <= this.priceRange.upper
    );

    this.filteredProducts = filtered;
    this.sortProducts();
  }

  sortProducts() {
    switch (this.sortBy) {
      case 'name':
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        this.filteredProducts.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        break;
      case 'newest':
        this.filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
  }

  clearFilters() {
    this.selectedCategory = '';
    this.searchQuery = '';
    this.selectedBrands = [];
    this.priceRange = { lower: 0, upper: 10000 };
    this.sortBy = 'name';
    this.filterProducts();
  }

  onProductClick(product: any) {
    this.router.navigate(['/product', product._id]);
  }

  async addToCart(product: any, event: Event) {
    event.stopPropagation();
    try {
      await this.cartService.addToCart(product._id, 1);
      // Show success message
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }

  async addToWishlist(product: any, event: Event) {
    event.stopPropagation();
    try {
      await this.wishlistService.addToWishlist(product._id);
      // Show success message
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  }

  getProductImage(product: any): string {
    return product.images?.[0]?.url || '/assets/images/placeholder-product.png';
  }

  getDiscountPercentage(product: any): number {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  }

  doRefresh(event: any) {
    this.loadProducts().then(() => {
      event.target.complete();
    });
  }

  // Enhanced search methods
  onSearchFocus() {
    console.log('📱 Search focused');
    this.searchFocused = true;
  }

  onSearchBlur() {
    console.log('📱 Search blurred');
    this.searchFocused = false;
  }

  onQuickSearch(tag: string) {
    console.log('📱 Quick search:', tag);
    this.searchQuery = tag;
    this.onSearchChange();
  }

  onFilterClick() {
    console.log('📱 Filter clicked');
    // Open filter modal or sheet
  }
}
