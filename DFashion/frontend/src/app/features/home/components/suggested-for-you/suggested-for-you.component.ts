import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IonicModule } from '@ionic/angular';
import { CarouselModule } from 'ngx-owl-carousel-o';

interface SuggestedUser {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
  followedBy: string;
  isFollowing: boolean;
  isInfluencer: boolean;
  followerCount: number;
  category: string;
}

@Component({
  selector: 'app-suggested-for-you',
  standalone: true,
  imports: [CommonModule, IonicModule, CarouselModule],
  templateUrl: './suggested-for-you.component.html',
  styleUrls: ['./suggested-for-you.component.scss']
})
export class SuggestedForYouComponent implements OnInit, OnDestroy {
  suggestedUsers: SuggestedUser[] = [];
  isLoading = true;
  error: string | null = null;
  private subscription: Subscription = new Subscription();

  // Slider properties
  currentSlide = 0;
  slideOffset = 0;
  cardWidth = 200; // Width of each user card including margin
  visibleCards = 4; // Number of cards visible at once
  maxSlide = 0;
  
  // Auto-sliding properties
  autoSlideInterval: any;
  autoSlideDelay = 5000; // 5 seconds for users
  isAutoSliding = true;
  isPaused = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadSuggestedUsers();
    this.updateResponsiveSettings();
    this.setupResizeListener();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.stopAutoSlide();
  }

  private async loadSuggestedUsers() {
    try {
      this.isLoading = true;
      this.error = null;
      
      // Mock data for suggested users
      this.suggestedUsers = [
        {
          id: '1',
          username: 'fashionista_maya',
          fullName: 'Maya Patel',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
          followedBy: 'Followed by john_doe and 12 others',
          isFollowing: false,
          isInfluencer: true,
          followerCount: 45000,
          category: 'Fashion'
        },
        {
          id: '2',
          username: 'style_guru_raj',
          fullName: 'Raj Kumar',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          followedBy: 'Followed by sarah_k and 8 others',
          isFollowing: false,
          isInfluencer: true,
          followerCount: 32000,
          category: 'Menswear'
        },
        {
          id: '3',
          username: 'trendy_sara',
          fullName: 'Sara Johnson',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          followedBy: 'Followed by alex_m and 15 others',
          isFollowing: false,
          isInfluencer: false,
          followerCount: 8500,
          category: 'Casual'
        },
        {
          id: '4',
          username: 'luxury_lover',
          fullName: 'Emma Wilson',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
          followedBy: 'Followed by mike_t and 20 others',
          isFollowing: false,
          isInfluencer: true,
          followerCount: 67000,
          category: 'Luxury'
        },
        {
          id: '5',
          username: 'street_style_alex',
          fullName: 'Alex Chen',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          followedBy: 'Followed by lisa_p and 5 others',
          isFollowing: false,
          isInfluencer: false,
          followerCount: 12000,
          category: 'Streetwear'
        },
        {
          id: '6',
          username: 'boho_bella',
          fullName: 'Isabella Rodriguez',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
          followedBy: 'Followed by tom_h and 18 others',
          isFollowing: false,
          isInfluencer: true,
          followerCount: 28000,
          category: 'Boho'
        }
      ];
      
      this.isLoading = false;
      this.updateSliderOnUsersLoad();
    } catch (error) {
      console.error('Error loading suggested users:', error);
      this.error = 'Failed to load suggested users';
      this.isLoading = false;
    }
  }

  onUserClick(user: SuggestedUser) {
    this.router.navigate(['/profile', user.username]);
  }

  onFollowUser(user: SuggestedUser, event: Event) {
    event.stopPropagation();
    user.isFollowing = !user.isFollowing;
    
    if (user.isFollowing) {
      user.followerCount++;
    } else {
      user.followerCount--;
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
    this.loadSuggestedUsers();
  }

  trackByUserId(index: number, user: SuggestedUser): string {
    return user.id;
  }

  // Auto-sliding methods
  private startAutoSlide() {
    if (!this.isAutoSliding || this.isPaused) return;
    
    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => {
      if (!this.isPaused && this.suggestedUsers.length > this.visibleCards) {
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
      this.cardWidth = 180;
      this.visibleCards = 1;
    } else if (width <= 768) {
      this.cardWidth = 200;
      this.visibleCards = 2;
    } else if (width <= 1200) {
      this.cardWidth = 220;
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
    this.maxSlide = Math.max(0, this.suggestedUsers.length - this.visibleCards);
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

  // Update slider when users load
  private updateSliderOnUsersLoad() {
    setTimeout(() => {
      this.updateSliderLimits();
      this.currentSlide = 0;
      this.slideOffset = 0;
      this.startAutoSlide();
    }, 100);
  }
}
