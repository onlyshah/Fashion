import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IonicModule } from '@ionic/angular';
import { CarouselModule } from 'ngx-owl-carousel-o';

interface ShopCategory {
  id: string;
  name: string;
  image: string;
  productCount: number;
  description: string;
  trending: boolean;
  discount?: number;
  subcategories: string[];
}

@Component({
  selector: 'app-shop-by-category',
  standalone: true,
  imports: [CommonModule, IonicModule, CarouselModule],
  templateUrl: './shop-by-category.component.html',
  styleUrls: ['./shop-by-category.component.scss']
})
export class ShopByCategoryComponent implements OnInit, OnDestroy {
  categories: ShopCategory[] = [];
  isLoading = true;
  error: string | null = null;
  private subscription: Subscription = new Subscription();

  // Slider properties
  currentSlide = 0;
  slideOffset = 0;
  cardWidth = 200; // Width of each category card including margin
  visibleCards = 4; // Number of cards visible at once
  maxSlide = 0;
  
  // Auto-sliding properties
  autoSlideInterval: any;
  autoSlideDelay = 4500; // 4.5 seconds for categories
  isAutoSliding = true;
  isPaused = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadCategories();
    this.updateResponsiveSettings();
    this.setupResizeListener();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.stopAutoSlide();
  }

  private async loadCategories() {
    try {
      this.isLoading = true;
      this.error = null;
      
      // Mock data for shop categories
      this.categories = [
        {
          id: '1',
          name: 'Women\'s Fashion',
          image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&h=200&fit=crop',
          productCount: 15420,
          description: 'Trendy outfits for every occasion',
          trending: true,
          discount: 30,
          subcategories: ['Dresses', 'Tops', 'Bottoms', 'Accessories']
        },
        {
          id: '2',
          name: 'Men\'s Fashion',
          image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop',
          productCount: 12850,
          description: 'Stylish clothing for modern men',
          trending: true,
          discount: 25,
          subcategories: ['Shirts', 'Pants', 'Jackets', 'Shoes']
        },
        {
          id: '3',
          name: 'Footwear',
          image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=200&fit=crop',
          productCount: 8960,
          description: 'Step up your shoe game',
          trending: false,
          discount: 20,
          subcategories: ['Sneakers', 'Formal', 'Casual', 'Sports']
        },
        {
          id: '4',
          name: 'Accessories',
          image: 'https://images.unsplash.com/photo-1506629905607-d9c36e0a3f90?w=300&h=200&fit=crop',
          productCount: 6750,
          description: 'Complete your look',
          trending: true,
          subcategories: ['Bags', 'Jewelry', 'Watches', 'Belts']
        },
        {
          id: '5',
          name: 'Kids Fashion',
          image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=300&h=200&fit=crop',
          productCount: 4320,
          description: 'Adorable styles for little ones',
          trending: false,
          discount: 35,
          subcategories: ['Boys', 'Girls', 'Baby', 'Toys']
        },
        {
          id: '6',
          name: 'Sports & Fitness',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
          productCount: 5680,
          description: 'Gear up for your workout',
          trending: true,
          subcategories: ['Activewear', 'Equipment', 'Shoes', 'Supplements']
        },
        {
          id: '7',
          name: 'Beauty & Personal Care',
          image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=200&fit=crop',
          productCount: 7890,
          description: 'Look and feel your best',
          trending: false,
          discount: 15,
          subcategories: ['Skincare', 'Makeup', 'Haircare', 'Fragrance']
        },
        {
          id: '8',
          name: 'Home & Living',
          image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop',
          productCount: 3450,
          description: 'Style your space',
          trending: false,
          subcategories: ['Decor', 'Furniture', 'Kitchen', 'Bedding']
        }
      ];
      
      this.isLoading = false;
      this.updateSliderOnCategoriesLoad();
    } catch (error) {
      console.error('Error loading categories:', error);
      this.error = 'Failed to load categories';
      this.isLoading = false;
    }
  }

  onCategoryClick(category: ShopCategory) {
    this.router.navigate(['/category', category.id]);
  }

  formatProductCount(count: number): string {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }

  onRetry() {
    this.loadCategories();
  }

  trackByCategoryId(index: number, category: ShopCategory): string {
    return category.id;
  }

  // Auto-sliding methods
  private startAutoSlide() {
    if (!this.isAutoSliding || this.isPaused) return;
    
    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => {
      if (!this.isPaused && this.categories.length > this.visibleCards) {
        this.autoSlideNext();
      }
    }, this.autoSlideDelay);
  }

  private stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  private autoSlideNext() {
    if (this.currentSlide >= this.maxSlide) {
      this.currentSlide = 0;
    } else {
      this.currentSlide++;
    }
    this.updateSlideOffset();
  }

  pauseAutoSlide() {
    this.isPaused = true;
    this.stopAutoSlide();
  }

  resumeAutoSlide() {
    this.isPaused = false;
    this.startAutoSlide();
  }

  // Responsive methods
  private updateResponsiveSettings() {
    const width = window.innerWidth;
    if (width <= 480) {
      this.cardWidth = 160;
      this.visibleCards = 1;
    } else if (width <= 768) {
      this.cardWidth = 180;
      this.visibleCards = 2;
    } else if (width <= 1200) {
      this.cardWidth = 200;
      this.visibleCards = 3;
    } else {
      this.cardWidth = 220;
      this.visibleCards = 4;
    }
    this.updateSliderLimits();
    this.updateSlideOffset();
  }

  private setupResizeListener() {
    window.addEventListener('resize', () => {
      this.updateResponsiveSettings();
    });
  }

  // Slider methods
  updateSliderLimits() {
    this.maxSlide = Math.max(0, this.categories.length - this.visibleCards);
  }

  slidePrev() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.updateSlideOffset();
      this.restartAutoSlideAfterInteraction();
    }
  }

  slideNext() {
    if (this.currentSlide < this.maxSlide) {
      this.currentSlide++;
      this.updateSlideOffset();
      this.restartAutoSlideAfterInteraction();
    }
  }

  private updateSlideOffset() {
    this.slideOffset = -this.currentSlide * this.cardWidth;
  }

  private restartAutoSlideAfterInteraction() {
    this.stopAutoSlide();
    setTimeout(() => {
      this.startAutoSlide();
    }, 2000);
  }

  // Update slider when categories load
  private updateSliderOnCategoriesLoad() {
    setTimeout(() => {
      this.updateSliderLimits();
      this.currentSlide = 0;
      this.slideOffset = 0;
      this.startAutoSlide();
    }, 100);
  }
}
