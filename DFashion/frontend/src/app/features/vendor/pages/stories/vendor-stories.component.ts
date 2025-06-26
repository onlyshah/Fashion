import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-vendor-stories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './vendor-stories.component.html',
  styleUrls: ['./vendor-stories.component.scss']
})
export class VendorStoriesComponent implements OnInit {
  stories: any[] = [];

  constructor() {}

  ngOnInit() {
    this.loadStories();
  }

  loadStories() {
    // Load vendor stories from API
    this.stories = [];
  }

  getTimeRemaining(createdAt: Date): string {
    const now = new Date();
    const storyTime = new Date(createdAt);
    const diffMs = now.getTime() - storyTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const remainingHours = 24 - diffHours;

    if (remainingHours <= 0) {
      return 'Expired';
    } else if (remainingHours < 1) {
      const remainingMinutes = 60 - Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${remainingMinutes}m left`;
    } else {
      return `${remainingHours}h left`;
    }
  }

  getStoryStatus(createdAt: Date): string {
    const now = new Date();
    const storyTime = new Date(createdAt);
    const diffHours = (now.getTime() - storyTime.getTime()) / (1000 * 60 * 60);
    
    return diffHours >= 24 ? 'expired' : 'active';
  }

  viewStory(story: any) {
    // TODO: Open story viewer
    console.log('View story:', story);
  }

  viewAnalytics(story: any) {
    // TODO: Show story analytics
    console.log('View analytics for story:', story);
  }

  deleteStory(story: any) {
    if (confirm('Are you sure you want to delete this story?')) {
      // TODO: Implement delete API call
      this.stories = this.stories.filter(s => s._id !== story._id);
    }
  }
}
