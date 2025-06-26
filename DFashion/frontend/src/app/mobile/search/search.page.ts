import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSearchbar, ToastController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  @ViewChild('searchbar', { static: true }) searchbar!: IonSearchbar;

  searchQuery = '';
  searchResults: any[] = [];
  recentSearches: string[] = [];
  popularSearches = ['Dresses', 'Jeans', 'T-shirts', 'Sneakers', 'Jackets', 'Accessories'];
  categories = [
    { name: 'Men', icon: 'man-outline', color: 'primary' },
    { name: 'Women', icon: 'woman-outline', color: 'secondary' },
    { name: 'Kids', icon: 'happy-outline', color: 'tertiary' },
    { name: 'Accessories', icon: 'bag-outline', color: 'success' }
  ];

  isLoading = false;
  hasSearched = false;
  private searchSubject = new Subject<string>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Load recent searches from storage
    this.loadRecentSearches();

    // Check for query parameter
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchQuery = params['q'];
        this.searchbar.value = params['q'];
        this.searchSubject.next(params['q']);
      }
    });

    // Setup search with debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.trim().length > 0) {
          this.isLoading = true;
          return this.productService.searchProducts(query);
        } else {
          this.searchResults = [];
          this.hasSearched = false;
          this.isLoading = false;
          return [];
        }
      })
    ).subscribe({
      next: (response: any) => {
        console.log('Mobile search response:', response);
        this.searchResults = response.products || response.data?.products || [];
        this.hasSearched = true;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Mobile search error:', error);
        this.isLoading = false;
        this.hasSearched = true;
        this.searchResults = [];
        this.showErrorToast('Search failed. Please try again.');
      }
    });

    // Auto-focus search bar
    setTimeout(() => {
      this.searchbar.setFocus();
    }, 300);
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
      this.searchSubject.next(this.searchQuery);
    }
  }

  onPopularSearchClick(term: string) {
    this.searchQuery = term;
    this.searchbar.value = term;
    this.saveRecentSearch(term);
    this.searchSubject.next(term);
  }

  onRecentSearchClick(term: string) {
    this.searchQuery = term;
    this.searchbar.value = term;
    this.searchSubject.next(term);
  }

  onCategoryClick(category: any) {
    this.router.navigate(['/tabs/categories'], {
      queryParams: { category: category.name.toLowerCase() }
    });
  }

  onProductClick(product: any) {
    this.router.navigate(['/product', product._id]);
  }

  clearRecentSearches() {
    this.recentSearches = [];
    localStorage.removeItem('recentSearches');
  }

  removeRecentSearch(term: string) {
    this.recentSearches = this.recentSearches.filter(search => search !== term);
    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
  }

  goBack() {
    this.router.back();
  }

  private loadRecentSearches() {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      this.recentSearches = JSON.parse(saved);
    }
  }

  private saveRecentSearch(term: string) {
    // Remove if already exists
    this.recentSearches = this.recentSearches.filter(search => search !== term);

    // Add to beginning
    this.recentSearches.unshift(term);

    // Keep only last 10 searches
    this.recentSearches = this.recentSearches.slice(0, 10);

    // Save to storage
    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: 'danger',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}
