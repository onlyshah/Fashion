import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Story {
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
  }[];
  viewed?: boolean;
  createdAt: Date;
}

export interface CurrentUser {
  _id: string;
  username: string;
  fullName: string;
  avatar?: string;
}

@Component({
  selector: 'app-view-add-stories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-add-stories.component.html',
  styleUrls: ['./view-add-stories.component.scss']
})
export class ViewAddStoriesComponent implements OnInit {
  @Input() stories: Story[] = [];
  @Input() showAddStory: boolean = true;
  @Input() addStoryText: string = 'Your Story';
  @Input() defaultAvatar: string = '/assets/images/default-avatar.svg';
  @Input() currentUser: CurrentUser | null = null;

  @Output() storyClick = new EventEmitter<{story: Story, index: number}>();
  @Output() createStory = new EventEmitter<void>();

  ngOnInit() {
    console.log('View Add Stories - Current User:', this.currentUser);
    console.log('View Add Stories - Show Add Story:', this.showAddStory);
    console.log('View Add Stories - Default Avatar:', this.defaultAvatar);
  }

  onStoryClick(story: Story, index: number) {
    this.storyClick.emit({ story, index });
  }

  onCreateStory() {
    this.createStory.emit();
  }

  onImageError(event: any) {
    event.target.src = this.defaultAvatar;
  }
}
