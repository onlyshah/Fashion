import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="explore-container">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <h1>Discover Fashion</h1>
          <p>Explore trending styles, discover new brands, and find your perfect look</p>
          <div class="search-bar">
            <input type="text" 
                   placeholder="Search for styles, brands, or trends..." 
                   [(ngModel)]="searchQuery"
                   (keyup.enter)="onSearch()">
            <button (click)="onSearch()">
              <i class="fas fa-search"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Categories Grid -->
      <div class="categories-section">
        <h2>Shop by Category</h2>
        <div class="categories-grid">
          <div class="category-card" 
               *ngFor="let category of categories"
               (click)="navigateToCategory(category.slug)"
               [style.background-image]="'url(' + category.image + ')'">
            <div class="category-overlay">
              <h3>{{ category.name }}</h3>
              <p>{{ category.itemCount }} items</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Trending Section -->
      <div class="trending-section">
        <h2>Trending Now</h2>
        <div class="trending-grid">
          <div class="trend-item" *ngFor="let trend of trendingItems">
            <img [src]="trend.image" [alt]="trend.title">
            <div class="trend-content">
              <h4>{{ trend.title }}</h4>
              <p>{{ trend.description }}</p>
              <span class="trend-tag">{{ trend.tag }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Featured Brands -->
      <div class="brands-section">
        <h2>Featured Brands</h2>
        <div class="brands-grid">
          <div class="brand-card" *ngFor="let brand of featuredBrands">
            <img [src]="brand.logo" [alt]="brand.name">
            <h4>{{ brand.name }}</h4>
            <p>{{ brand.description }}</p>
            <button class="btn-explore" (click)="exploreBrand(brand.slug)">
              Explore
            </button>
          </div>
        </div>
      </div>

      <!-- Style Inspiration -->
      <div class="inspiration-section">
        <h2>Style Inspiration</h2>
        <div class="inspiration-grid">
          <div class="inspiration-item" 
               *ngFor="let inspiration of styleInspiration"
               (click)="viewInspiration(inspiration.id)">
            <img [src]="inspiration.image" [alt]="inspiration.title">
            <div class="inspiration-overlay">
              <h4>{{ inspiration.title }}</h4>
              <p>{{ inspiration.subtitle }}</p>
              <div class="inspiration-tags">
                <span *ngFor="let tag of inspiration.tags" class="tag">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .explore-container {
      padding: 80px 0 40px;
      min-height: 100vh;
    }

    .hero-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 80px 20px;
      text-align: center;
      margin-bottom: 60px;
    }

    .hero-content h1 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .hero-content p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .search-bar {
      display: flex;
      max-width: 500px;
      margin: 0 auto;
      background: white;
      border-radius: 50px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .search-bar input {
      flex: 1;
      padding: 15px 20px;
      border: none;
      font-size: 1rem;
      color: #333;
    }

    .search-bar button {
      background: #667eea;
      border: none;
      padding: 15px 20px;
      color: white;
      cursor: pointer;
      transition: background 0.3s;
    }

    .search-bar button:hover {
      background: #5a67d8;
    }

    .categories-section,
    .trending-section,
    .brands-section,
    .inspiration-section {
      max-width: 1200px;
      margin: 0 auto 60px;
      padding: 0 20px;
    }

    .categories-section h2,
    .trending-section h2,
    .brands-section h2,
    .inspiration-section h2 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 2rem;
      text-align: center;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .category-card {
      height: 200px;
      border-radius: 16px;
      background-size: cover;
      background-position: center;
      position: relative;
      cursor: pointer;
      transition: transform 0.3s ease;
      overflow: hidden;
    }

    .category-card:hover {
      transform: translateY(-5px);
    }

    .category-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0,0,0,0.8));
      color: white;
      padding: 20px;
    }

    .category-overlay h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .trending-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
    }

    .trend-item {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .trend-item:hover {
      transform: translateY(-5px);
    }

    .trend-item img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }

    .trend-content {
      padding: 20px;
    }

    .trend-content h4 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .trend-tag {
      background: #667eea;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .brands-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 30px;
    }

    .brand-card {
      background: white;
      padding: 30px;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .brand-card:hover {
      transform: translateY(-5px);
    }

    .brand-card img {
      width: 80px;
      height: 80px;
      object-fit: contain;
      margin-bottom: 1rem;
    }

    .btn-explore {
      background: #667eea;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 25px;
      cursor: pointer;
      transition: background 0.3s;
      margin-top: 1rem;
    }

    .btn-explore:hover {
      background: #5a67d8;
    }

    .inspiration-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .inspiration-item {
      position: relative;
      height: 300px;
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .inspiration-item:hover {
      transform: scale(1.02);
    }

    .inspiration-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .inspiration-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0,0,0,0.8));
      color: white;
      padding: 20px;
    }

    .inspiration-tags {
      display: flex;
      gap: 8px;
      margin-top: 10px;
    }

    .tag {
      background: rgba(255,255,255,0.2);
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
    }

    @media (max-width: 768px) {
      .hero-content h1 {
        font-size: 2rem;
      }
      
      .categories-grid,
      .trending-grid,
      .brands-grid,
      .inspiration-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ExploreComponent implements OnInit {
  searchQuery = '';
  
  categories = [
    {
      name: 'Women',
      slug: 'women',
      image: '/assets/images/categories/women.jpg',
      itemCount: 1250
    },
    {
      name: 'Men',
      slug: 'men', 
      image: '/assets/images/categories/men.jpg',
      itemCount: 890
    },
    {
      name: 'Kids',
      slug: 'kids',
      image: '/assets/images/categories/kids.jpg',
      itemCount: 450
    },
    {
      name: 'Ethnic',
      slug: 'ethnic',
      image: '/assets/images/categories/ethnic.jpg',
      itemCount: 320
    }
  ];

  trendingItems: any[] = [];

  featuredBrands = [
    {
      name: 'StyleHub',
      slug: 'stylehub',
      logo: '/assets/images/brands/stylehub.png',
      description: 'Contemporary fashion for modern lifestyle'
    },
    {
      name: 'TrendWear',
      slug: 'trendwear',
      logo: '/assets/images/brands/trendwear.png',
      description: 'Trendy and affordable fashion'
    },
    {
      name: 'ElegantCo',
      slug: 'elegantco',
      logo: '/assets/images/brands/elegant.png',
      description: 'Elegant and sophisticated designs'
    }
  ];

  styleInspiration = [
    {
      id: 1,
      title: 'Office Chic',
      subtitle: 'Professional yet stylish',
      image: '/assets/images/inspiration/office.jpg',
      tags: ['Professional', 'Elegant', 'Modern']
    },
    {
      id: 2,
      title: 'Weekend Casual',
      subtitle: 'Comfortable and relaxed',
      image: '/assets/images/inspiration/casual.jpg',
      tags: ['Casual', 'Comfortable', 'Trendy']
    },
    {
      id: 3,
      title: 'Evening Glam',
      subtitle: 'Glamorous night out looks',
      image: '/assets/images/inspiration/evening.jpg',
      tags: ['Glamorous', 'Party', 'Elegant']
    }
  ];

  constructor() {}

  ngOnInit() {}

  onSearch() {
    if (this.searchQuery.trim()) {
      // Navigate to search results
      console.log('Searching for:', this.searchQuery);
      // TODO: Implement search navigation
    }
  }

  navigateToCategory(categorySlug: string) {
    // Navigate to category page
    console.log('Navigate to category:', categorySlug);
    // TODO: Implement category navigation
  }

  exploreBrand(brandSlug: string) {
    console.log('Explore brand:', brandSlug);
    // TODO: Implement brand exploration
  }

  viewInspiration(inspirationId: number) {
    console.log('View inspiration:', inspirationId);
    // TODO: Implement inspiration view
  }
}
