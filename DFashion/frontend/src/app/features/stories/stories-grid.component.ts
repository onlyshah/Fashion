import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface StoryGroup {
  user: {
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
  };
  stories: {
    _id: string;
    media: {
      type: 'image' | 'video';
      url: string;
      thumbnail?: string;
    };
    isViewed: boolean;
    createdAt: Date;
  }[];
  totalStories: number;
  hasUnviewed: boolean;
}

@Component({
  selector: 'app-stories-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stories-grid.component.html',
  styleUrls: ['./stories-grid.component.scss']
})
export class StoriesGridComponent implements OnInit {
  @Input() storyGroups: StoryGroup[] = [];
  @Input() loading = false;

  viewMode: 'grid' | 'list' = 'grid';

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadStoryGroups();
  }

  loadStoryGroups() {
    this.loading = true;
    
    fetch('http://localhost:5000/api/stories/groups')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          this.storyGroups = data.groups;
        }
        this.loading = false;
      })
      .catch(error => {
        console.error('Error loading story groups:', error);
        this.loading = false;
      });
  }

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  openStoryGroup(group: StoryGroup) {
    this.router.navigate(['/stories', group.user._id]);
  }

  getPreviewImage(group: StoryGroup): string {
    const latestStory = group.stories[0];
    return latestStory.media.type === 'video' 
      ? latestStory.media.thumbnail || 'assets/images/default-story.svg'
      : latestStory.media.url;
  }

  getStoryThumbnail(story: any): string {
    return story.media.type === 'video'
      ? story.media.thumbnail || 'assets/images/default-story.svg'
      : story.media.url;
  }

  hasVideo(group: StoryGroup): boolean {
    return group.stories.some(story => story.media.type === 'video');
  }

  getLatestTime(group: StoryGroup): string {
    const latestDate = new Date(group.stories[0].createdAt);
    const now = new Date();
    const diffMs = now.getTime() - latestDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'now';
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  }
}
