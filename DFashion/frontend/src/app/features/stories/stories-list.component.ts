import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface StoryPreview {
  _id: string;
  user: {
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
  };
  media: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  };
  isViewed: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-stories-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stories-list.component.html',
  styles: [`
    .stories-container {
      background: #fff;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .stories-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .stories-header h3 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: #333;
    }

    .create-story-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      border: none;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .create-story-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .stories-list {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      padding: 8px 0;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .stories-list::-webkit-scrollbar {
      display: none;
    }

    .story-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      min-width: 80px;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .story-item:hover {
      transform: translateY(-4px);
    }

    .story-item.viewed {
      opacity: 0.6;
    }

    .story-avatar {
      position: relative;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      overflow: hidden;
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .add-avatar {
      background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      font-size: 1.5rem;
    }

    .avatar-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .story-ring {
      position: absolute;
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
      border: 3px solid;
      border-image: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c) 1;
      border-radius: 50%;
      animation: rotate 3s linear infinite;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .video-indicator {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 20px;
      height: 20px;
      background: rgba(0,0,0,0.7);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 0.7rem;
    }

    .story-username {
      font-size: 0.8rem;
      font-weight: 500;
      color: #333;
      text-align: center;
      max-width: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .story-time {
      font-size: 0.7rem;
      color: #666;
      text-align: center;
    }

    .loading-state {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      padding: 8px 0;
    }

    .loading-skeleton {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      min-width: 80px;
    }

    .skeleton-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }

    .skeleton-text {
      width: 60px;
      height: 12px;
      border-radius: 6px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }

    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .empty-state i {
      font-size: 3rem;
      color: #ddd;
      margin-bottom: 16px;
    }

    .empty-state h4 {
      margin: 0 0 8px 0;
      font-size: 1.1rem;
      color: #333;
    }

    .empty-state p {
      margin: 0 0 20px 0;
      font-size: 0.9rem;
    }

    .btn-primary {
      padding: 10px 20px;
      background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      border: none;
      border-radius: 20px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .stories-container {
        padding: 12px;
        margin-bottom: 16px;
      }

      .stories-header h3 {
        font-size: 1.1rem;
      }

      .create-story-btn {
        padding: 6px 12px;
        font-size: 0.8rem;
      }

      .btn-text {
        display: none;
      }

      .stories-list {
        gap: 12px;
      }

      .story-item {
        min-width: 70px;
        gap: 6px;
      }

      .story-avatar {
        width: 56px;
        height: 56px;
      }

      .story-username {
        font-size: 0.75rem;
        max-width: 70px;
      }

      .story-time {
        font-size: 0.65rem;
      }
    }

    @media (max-width: 480px) {
      .stories-container {
        padding: 10px;
        border-radius: 8px;
      }

      .stories-list {
        gap: 10px;
      }

      .story-item {
        min-width: 60px;
      }

      .story-avatar {
        width: 48px;
        height: 48px;
      }

      .story-username {
        font-size: 0.7rem;
        max-width: 60px;
      }
    }
  `]
})
export class StoriesListComponent implements OnInit {
  @Input() stories: StoryPreview[] = [];
  @Input() loading = false;
  @Output() storySelected = new EventEmitter<{story: StoryPreview, index: number}>();
  @Output() createStoryClicked = new EventEmitter<void>();

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadStories();
  }

  loadStories() {
    this.loading = true;
    
    // Load stories from API
    fetch('http://localhost:5000/api/stories/preview')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          this.stories = data.stories;
        }
        this.loading = false;
      })
      .catch(error => {
        console.error('Error loading stories:', error);
        this.loading = false;
      });
  }

  openStory(story: StoryPreview, index: number) {
    this.storySelected.emit({ story, index });
    this.router.navigate(['/stories', story.user._id], { 
      queryParams: { index, storyId: story._id } 
    });
  }

  createStory() {
    this.createStoryClicked.emit();
    this.router.navigate(['/stories/create']);
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'now';
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  }
}
