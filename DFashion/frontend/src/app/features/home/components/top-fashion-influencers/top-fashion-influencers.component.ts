import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IonicModule } from '@ionic/angular';
import { CarouselModule } from 'ngx-owl-carousel-o';

interface TopInfluencer {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
  followerCount: number;
  category: string;
  isVerified: boolean;
  isFollowing: boolean;
  engagementRate: number;
  recentPosts: number;
  topBrands: string[];
}

@Component({
  selector: 'app-top-fashion-influencers',
  standalone: true,
  imports: [CommonModule, IonicModule, CarouselModule],
  templateUrl: './top-fashion-influencers.component.html',
  styleUrls: ['./top-fashion-influencers.component.scss']
})
export class TopFashionInfluencersComponent implements OnInit, OnDestroy {
  topInfluencers: TopInfluencer[] = [];
  isLoading = true;
  error: string | null = null;
  private subscription: Subscription = new Subscription();

  // Slider properties
  currentSlide = 0;
  slideOffset = 0;
  cardWidth = 240; // Width of each influencer card including margin
  visibleCards = 3; // Number of cards visible at once
  maxSlide = 0;
  
  // Auto-sliding properties
  autoSlideInterval: any;
  autoSlideDelay = 6000; // 6 seconds for influencers
  isAutoSliding = true;
  isPaused = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadTopInfluencers();
    this.updateResponsiveSettings();
    this.setupResizeListener();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.stopAutoSlide();
  }

  private async loadTopInfluencers() {
    try {
      this.isLoading = true;
      this.error = null;
      
      // Mock data for top fashion influencers
      this.topInfluencers = [
        {
          id: '1',
          username: 'fashionista_queen',
          fullName: 'Priya Sharma',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
          followerCount: 2500000,
          category: 'High Fashion',
          isVerified: true,
          isFollowing: false,
          engagementRate: 8.5,
          recentPosts: 24,
          topBrands: ['Gucci', 'Prada', 'Versace']
        },
        {
          id: '2',
          username: 'street_style_king',
          fullName: 'Arjun Kapoor',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          followerCount: 1800000,
          category: 'Streetwear',
          isVerified: true,
          isFollowing: false,
          engagementRate: 12.3,
          recentPosts: 18,
          topBrands: ['Nike', 'Adidas', 'Supreme']
        },
        {
          id: '3',
          username: 'boho_goddess',
          fullName: 'Ananya Singh',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          followerCount: 1200000,
          category: 'Boho Chic',
          isVerified: true,
          isFollowing: false,
          engagementRate: 9.7,
          recentPosts: 32,
          topBrands: ['Free People', 'Anthropologie', 'Zara']
        },
        {
          id: '4',
          username: 'luxury_lifestyle',
          fullName: 'Kavya Reddy',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
          followerCount: 3200000,
          category: 'Luxury',
          isVerified: true,
          isFollowing: false,
          engagementRate: 6.8,
          recentPosts: 15,
          topBrands: ['Chanel', 'Dior', 'Louis Vuitton']
        },
        {
          id: '5',
          username: 'minimalist_maven',
          fullName: 'Ravi Kumar',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          followerCount: 950000,
          category: 'Minimalist',
          isVerified: true,
          isFollowing: false,
          engagementRate: 11.2,
          recentPosts: 21,
          topBrands: ['COS', 'Uniqlo', 'Everlane']
        },
        {
          id: '6',
          username: 'vintage_vibes',
          fullName: 'Meera Patel',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
          followerCount: 780000,
          category: 'Vintage',
          isVerified: true,
          isFollowing: false,
          engagementRate: 13.5,
          recentPosts: 28,
          topBrands: ['Vintage Stores', 'Thrift Finds', 'Custom']
        }
      ];
      
      this.isLoading = false;
      this.updateSliderOnInfluencersLoad();
    } catch (error) {
      console.error('Error loading top influencers:', error);
      this.error = 'Failed to load top influencers';
      this.isLoading = false;
    }
  }

  onInfluencerClick(influencer: TopInfluencer) {
    this.router.navigate(['/profile', influencer.username]);
  }

  onFollowInfluencer(influencer: TopInfluencer, event: Event) {
    event.stopPropagation();
    influencer.isFollowing = !influencer.isFollowing;
    
    if (influencer.isFollowing) {
      influencer.followerCount++;
    } else {
      influencer.followerCount--;
    }
  }

  formatFollowerCount(count: number): string {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }

  onRetry() {
    this.loadTopInfluencers();
  }

  trackByInfluencerId(index: number, influencer: TopInfluencer): string {
    return influencer.id;
  }

  // Auto-sliding methods
  private startAutoSlide() {
    if (!this.isAutoSliding || this.isPaused) return;
    
    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => {
      if (!this.isPaused && this.topInfluencers.length > this.visibleCards) {
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
      this.cardWidth = 200;
      this.visibleCards = 1;
    } else if (width <= 768) {
      this.cardWidth = 220;
      this.visibleCards = 2;
    } else if (width <= 1200) {
      this.cardWidth = 240;
      this.visibleCards = 2;
    } else {
      this.cardWidth = 260;
      this.visibleCards = 3;
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
    this.maxSlide = Math.max(0, this.topInfluencers.length - this.visibleCards);
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

  // Update slider when influencers load
  private updateSliderOnInfluencersLoad() {
    setTimeout(() => {
      this.updateSliderLimits();
      this.currentSlide = 0;
      this.slideOffset = 0;
      this.startAutoSlide();
    }, 100);
  }
}
