import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { SearchService, SearchSuggestion, SearchFilters, TrendingSearch } from '../../../core/services/search.service';
import { ProductService } from '../../../core/services/product.service';
import { VisualSearchComponent } from '../visual-search/visual-search.component';

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, VisualSearchComponent],
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.scss']
})
export class AdvancedSearchComponent implements OnInit, OnDestroy {
  @Input() placeholder: string = 'Search for products, brands, and more...';
  @Input() showFilters: boolean = true;
  @Input() enableVoiceSearch: boolean = true;
  @Input() autoFocus: boolean = false;
  
  @Output() searchPerformed = new EventEmitter<{ query: string; filters: SearchFilters }>();
  @Output() suggestionSelected = new EventEmitter<SearchSuggestion>();
  @Output() filtersChanged = new EventEmitter<SearchFilters>();

  @ViewChild('searchInput', { static: false }) searchInputRef!: ElementRef;

  // Form and state
  filtersForm: FormGroup;
  searchQuery: string = '';
  showSuggestions: boolean = false;
  
  // Data
  suggestions: SearchSuggestion[] = [];
  trendingSearches: TrendingSearch[] = [];
  recentSearches: any[] = [];
  categories: any[] = [];
  brands: string[] = [];
  activeFilters: any[] = [];
  searchResults: any = null;
  showVisualSearch = false;

  // Subjects for cleanup
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private searchService: SearchService,
    private productService: ProductService
  ) {
    this.filtersForm = this.createFiltersForm();
  }

  ngOnInit(): void {
    this.initializeComponent();
    this.setupSearchSubscriptions();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createFiltersForm(): FormGroup {
    return this.fb.group({
      category: [''],
      brand: [''],
      minPrice: [''],
      maxPrice: [''],
      rating: [''],
      inStock: [false],
      onSale: [false],
      sortBy: ['relevance']
    });
  }

  private initializeComponent(): void {
    // Subscribe to search service state
    this.searchService.searchQuery$
      .pipe(takeUntil(this.destroy$))
      .subscribe(query => {
        if (query !== this.searchQuery) {
          this.searchQuery = query;
        }
      });

    this.searchService.searchResults$
      .pipe(takeUntil(this.destroy$))
      .subscribe(results => {
        this.searchResults = results;
        this.updateActiveFilters();
      });
  }

  private setupSearchSubscriptions(): void {
    // Setup debounced search for suggestions
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length > 1) {
          return this.searchService.getSearchSuggestions(query, 8);
        }
        return of([]);
      }),
      takeUntil(this.destroy$)
    ).subscribe(suggestions => {
      this.suggestions = suggestions;
    });
  }

  private loadInitialData(): void {
    // Load categories
    this.productService.getCategories().subscribe(response => {
      if (response.success) {
        this.categories = response.data.map((cat: any) => ({
          value: cat.name || cat,
          label: cat.displayName || cat.name || cat
        }));
      }
    });

    // Load brands
    this.productService.getBrands().subscribe(response => {
      this.brands = response.brands || [];
    });

    // Load trending searches
    this.searchService.getTrendingSearches(5).subscribe(trending => {
      this.trendingSearches = trending;
    });

    // Load recent searches if user is authenticated
    this.searchService.getSearchHistory(5).subscribe(history => {
      this.recentSearches = history.searches;
    });
  }

  // Search input handlers
  onSearchInput(event: any): void {
    const query = event.target.value || '';
    this.searchQuery = query;
    this.searchSubject.next(query);
    
    if (query.length > 0) {
      this.showSuggestions = true;
    }
  }

  onSearchFocus(): void {
    this.showSuggestions = true;
    if (!this.searchQuery) {
      // Load trending and recent searches
      this.loadInitialData();
    }
  }

  onSearchBlur(): void {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  // Search actions
  performSearch(): void {
    const filters = this.getFiltersFromForm();
    this.searchService.setSearchQuery(this.searchQuery);
    this.searchService.setSearchFilters(filters);
    this.searchPerformed.emit({ query: this.searchQuery, filters });
    this.showSuggestions = false;
  }

  selectSuggestion(suggestion: SearchSuggestion): void {
    this.searchQuery = suggestion.text;
    this.searchService.setSearchQuery(suggestion.text);
    this.suggestionSelected.emit(suggestion);
    this.performSearch();
  }

  selectTrendingSearch(trending: TrendingSearch): void {
    this.searchQuery = trending.query;
    this.performSearch();
  }

  selectRecentSearch(recent: any): void {
    this.searchQuery = recent.query;
    if (recent.filters) {
      this.filtersForm.patchValue(recent.filters);
    }
    this.performSearch();
  }

  // Voice search
  startVoiceSearch(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.searchQuery = transcript;
        this.performSearch();
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };
      
      recognition.start();
    }
  }

  // Visual search handlers
  toggleVisualSearch(): void {
    this.showVisualSearch = !this.showVisualSearch;
    if (this.showVisualSearch) {
      this.showSuggestions = false;
    }
  }

  onVisualSearchResults(results: any): void {
    this.showVisualSearch = false;
    this.searchResults.emit(results);
  }

  onVisualSearchError(error: string): void {
    console.error('Visual search error:', error);
    // Could show a toast or alert here
  }

  // Filter handlers
  onFilterChange(): void {
    const filters = this.getFiltersFromForm();
    this.searchService.setSearchFilters(filters);
    this.filtersChanged.emit(filters);
    
    // Track filter change
    if (this.searchQuery) {
      this.searchService.trackFilterChange(this.searchQuery).subscribe();
    }
  }

  clearFilters(): void {
    this.filtersForm.reset({
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      inStock: false,
      onSale: false,
      sortBy: 'relevance'
    });
    this.onFilterChange();
  }

  removeFilter(filter: any): void {
    this.filtersForm.patchValue({ [filter.key]: filter.key === 'inStock' || filter.key === 'onSale' ? false : '' });
    this.onFilterChange();
  }

  clearRecentSearches(): void {
    this.searchService.clearSearchHistory('recent').subscribe(success => {
      if (success) {
        this.recentSearches = [];
      }
    });
  }

  // Helper methods
  private getFiltersFromForm(): SearchFilters {
    const formValue = this.filtersForm.value;
    const filters: SearchFilters = {};
    
    Object.keys(formValue).forEach(key => {
      const value = formValue[key];
      if (value !== '' && value !== null && value !== false) {
        (filters as any)[key] = value;
      }
    });
    
    return filters;
  }

  private updateActiveFilters(): void {
    const filters = this.getFiltersFromForm();
    this.activeFilters = [];
    
    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== '' && value !== false) {
        this.activeFilters.push({
          key,
          label: this.getFilterLabel(key),
          value: this.getFilterDisplayValue(key, value)
        });
      }
    });
  }

  private getFilterLabel(key: string): string {
    const labels: { [key: string]: string } = {
      category: 'Category',
      brand: 'Brand',
      minPrice: 'Min Price',
      maxPrice: 'Max Price',
      rating: 'Rating',
      inStock: 'In Stock',
      onSale: 'On Sale',
      sortBy: 'Sort'
    };
    return labels[key] || key;
  }

  private getFilterDisplayValue(key: string, value: any): string {
    if (key === 'rating') {
      return `${value}+ Stars`;
    }
    if (key === 'inStock' || key === 'onSale') {
      return 'Yes';
    }
    return value.toString();
  }

  // Template helper methods
  getSuggestionIcon(type: string): string {
    const icons: { [key: string]: string } = {
      completion: 'search',
      product: 'cube',
      brand: 'business',
      category: 'grid',
      trending: 'trending-up',
      personal: 'person'
    };
    return icons[type] || 'search';
  }

  getSuggestionTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      completion: 'Search suggestion',
      product: 'Product',
      brand: 'Brand',
      category: 'Category',
      trending: 'Trending',
      personal: 'From your history'
    };
    return labels[type] || type;
  }

  highlightQuery(text: string): string {
    if (!this.searchQuery) return text;
    const regex = new RegExp(`(${this.searchQuery})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
  }

  getRelativeTime(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  getSearchTime(timestamp: number): number {
    return Date.now() - timestamp;
  }

  // Track by functions for performance
  trackSuggestion(index: number, suggestion: SearchSuggestion): string {
    return suggestion.text + suggestion.type;
  }

  trackTrending(index: number, trending: TrendingSearch): string {
    return trending.query;
  }

  trackRecent(index: number, recent: any): string {
    return recent.query + recent.timestamp;
  }

  trackFilter(index: number, filter: any): string {
    return filter.key + filter.value;
  }
}
