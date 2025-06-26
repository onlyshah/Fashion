import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Import all story components
import { StoriesViewerComponent } from './stories-viewer.component';
import { StoriesListComponent } from './stories-list.component';
import { StoriesGridComponent } from './stories-grid.component';
import { StoryCreateComponent } from './story-create.component';

// Import shared components
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@NgModule({
  declarations: [
    // All components are standalone, so no declarations needed
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    // Standalone components
    StoriesViewerComponent,
    StoriesListComponent,
    StoriesGridComponent,
    StoryCreateComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent
  ],
  exports: [
    StoriesViewerComponent,
    StoriesListComponent,
    StoriesGridComponent,
    StoryCreateComponent
  ]
})
export class StoriesModule { }

// Stories routing configuration
export const storiesRoutes = [
  {
    path: '',
    component: StoriesViewerComponent,
    title: 'Stories - DFashion'
  },
  {
    path: 'create',
    component: StoryCreateComponent,
    title: 'Create Story - DFashion'
  },
  {
    path: ':userId',
    component: StoriesViewerComponent,
    title: 'User Stories - DFashion'
  }
];

// Stories service interface
export interface StoriesService {
  // Story management
  getStories(): Promise<any[]>;
  getUserStories(userId: string): Promise<any[]>;
  getStoryGroups(): Promise<any[]>;
  createStory(storyData: FormData): Promise<any>;
  deleteStory(storyId: string): Promise<any>;
  
  // Story interactions
  viewStory(storyId: string): Promise<any>;
  likeStory(storyId: string): Promise<any>;
  unlikeStory(storyId: string): Promise<any>;
  commentOnStory(storyId: string, comment: string): Promise<any>;
  shareStory(storyId: string): Promise<any>;
  
  // Product tagging
  searchProducts(query: string): Promise<any[]>;
  tagProduct(storyId: string, productId: string, position: {x: number, y: number}): Promise<any>;
  removeProductTag(storyId: string, tagId: string): Promise<any>;
}

// Stories configuration
export const STORIES_CONFIG = {
  // Media settings
  maxFileSize: 50 * 1024 * 1024, // 50MB
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  supportedVideoTypes: ['video/mp4', 'video/webm', 'video/mov'],
  
  // Story settings
  defaultDuration: 15000, // 15 seconds
  maxCaptionLength: 500,
  maxProductTags: 5,
  
  // UI settings
  autoAdvance: true,
  showProgressBar: true,
  enableSwipeNavigation: true,
  enableKeyboardNavigation: true,
  
  // Responsive breakpoints
  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1024
  }
};

// Stories utility functions
export class StoriesUtils {
  static formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'now';
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  }

  static isVideoFile(file: File): boolean {
    return STORIES_CONFIG.supportedVideoTypes.includes(file.type);
  }

  static isImageFile(file: File): boolean {
    return STORIES_CONFIG.supportedImageTypes.includes(file.type);
  }

  static validateFileSize(file: File): boolean {
    return file.size <= STORIES_CONFIG.maxFileSize;
  }

  static generateThumbnail(videoFile: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        video.currentTime = 1; // Capture frame at 1 second
      };

      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
          resolve(thumbnail);
        } else {
          reject(new Error('Canvas context not available'));
        }
      };

      video.onerror = () => reject(new Error('Video load error'));
      video.src = URL.createObjectURL(videoFile);
    });
  }

  static optimizeImage(file: File, maxWidth: number = 1080): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(optimizedFile);
            } else {
              reject(new Error('Image optimization failed'));
            }
          }, 'image/jpeg', 0.8);
        } else {
          reject(new Error('Canvas context not available'));
        }
      };

      img.onerror = () => reject(new Error('Image load error'));
      img.src = URL.createObjectURL(file);
    });
  }

  static detectSwipeDirection(startX: number, startY: number, endX: number, endY: number): 'left' | 'right' | 'up' | 'down' | null {
    const diffX = startX - endX;
    const diffY = startY - endY;
    const minSwipeDistance = 50;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
      return diffX > 0 ? 'left' : 'right';
    } else if (Math.abs(diffY) > minSwipeDistance) {
      return diffY > 0 ? 'up' : 'down';
    }
    
    return null;
  }

  static getResponsiveImageUrl(baseUrl: string, width: number): string {
    if (!baseUrl) return '';
    
    // If it's an Unsplash URL, add width parameter
    if (baseUrl.includes('unsplash.com')) {
      return `${baseUrl}?w=${width}&q=80&fm=webp`;
    }
    
    // For other URLs, return as-is or implement your own logic
    return baseUrl;
  }

  static preloadMedia(urls: string[]): Promise<void[]> {
    const promises = urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        if (url.includes('video') || url.endsWith('.mp4') || url.endsWith('.webm')) {
          const video = document.createElement('video');
          video.oncanplaythrough = () => resolve();
          video.onerror = () => reject();
          video.src = url;
        } else {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject();
          img.src = url;
        }
      });
    });

    return Promise.all(promises);
  }

  static isMobileDevice(): boolean {
    return window.innerWidth <= STORIES_CONFIG.breakpoints.mobile;
  }

  static isTabletDevice(): boolean {
    return window.innerWidth <= STORIES_CONFIG.breakpoints.tablet && 
           window.innerWidth > STORIES_CONFIG.breakpoints.mobile;
  }

  static isDesktopDevice(): boolean {
    return window.innerWidth > STORIES_CONFIG.breakpoints.tablet;
  }
}

// Export everything for easy importing
export {
  StoriesViewerComponent,
  StoriesListComponent,
  StoriesGridComponent,
  StoryCreateComponent
};
