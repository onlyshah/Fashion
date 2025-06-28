# View Add Stories Component

A reusable Angular component that displays stories in a horizontal carousel using Swiper.js with Instagram-like design. Features smooth scrolling, touch/mouse support, and responsive design with a beautiful "Add Story" button.

## Features

- **Instagram-like Design**: Perfect replica of Instagram's stories carousel
- **Swiper.js Integration**: Smooth horizontal scrolling with touch/mouse support
- **Responsive Design**: Adapts to different screen sizes
- **Beautiful Story Rings**: Instagram's signature gradient rings for unviewed stories
- **Instagram-like Add Story**: Profile picture with blue plus icon overlay, exactly like Instagram
- **TypeScript Support**: Fully typed with interfaces
- **Standalone Component**: Can be used anywhere in the application

## Usage

### Basic Usage

```typescript
import { ViewAddStoriesComponent } from './shared/components/view-add-stories/view-add-stories.component';

@Component({
  imports: [ViewAddStoriesComponent],
  template: `
    <app-view-add-stories
      [stories]="stories"
      [currentUser]="currentUser"
      (storyClick)="onStoryClick($event)"
      (createStory)="onCreateStory()">
    </app-view-add-stories>
  `
})
export class MyComponent {
  stories: Story[] = [
    {
      _id: '1',
      user: {
        _id: 'user1',
        username: 'john_doe',
        fullName: 'John Doe',
        avatar: '/assets/avatars/john.jpg'
      },
      media: [{
        type: 'image',
        url: '/assets/stories/story1.jpg'
      }],
      viewed: false,
      createdAt: new Date()
    }
  ];

  onStoryClick(event: {story: Story, index: number}) {
    console.log('Story clicked:', event.story);
    // Navigate to story viewer
  }

  onCreateStory() {
    console.log('Create story clicked');
    // Navigate to story creation
  }
}
```

### Advanced Usage

```typescript
<app-view-add-stories
  [stories]="stories"
  [showAddStory]="true"
  addStoryText="Create Story"
  [currentUser]="currentUser"
  defaultAvatar="/assets/default-avatar.png"
  [slidesPerView]="'auto'"
  [spaceBetween]="20"
  (storyClick)="onStoryClick($event)"
  (createStory)="onCreateStory()">
</app-view-add-stories>
```

## Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `stories` | `Story[]` | `[]` | Array of stories to display |
| `showAddStory` | `boolean` | `true` | Whether to show the "Add Story" button |
| `addStoryText` | `string` | `'Your Story'` | Text to display under the add story button |
| `currentUser` | `CurrentUser \| null` | `null` | Current user object for the add story button |
| `defaultAvatar` | `string` | `'/assets/images/default-avatar.svg'` | Default avatar image path |
| `slidesPerView` | `string` | `'auto'` | Number of slides to show per view |
| `spaceBetween` | `number` | `16` | Space between slides in pixels |

## Output Events

| Event | Type | Description |
|-------|------|-------------|
| `storyClick` | `{story: Story, index: number}` | Emitted when a story is clicked |
| `createStory` | `void` | Emitted when the add story button is clicked |

## Interfaces

### Story Interface
```typescript
interface Story {
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
```

### CurrentUser Interface
```typescript
interface CurrentUser {
  _id: string;
  username: string;
  fullName: string;
  avatar?: string;
}
```

## Styling

The component uses Instagram's exact design patterns:

- **66px circular avatars** with 3px white borders
- **Beautiful gradient story rings** for unviewed stories (`#f09433` to `#bc1888`)
- **Gray borders** for viewed stories
- **Blue Instagram-style plus button** (24px) with white border
- **Proper typography** and spacing matching Instagram
- **Smooth hover effects** and transitions

### Custom Styling

You can customize the appearance by overriding CSS classes:

```css
app-view-add-stories {
  .story-avatar {
    width: 80px;
    height: 80px;
  }
  
  .story-ring {
    background: linear-gradient(45deg, #your-color, #your-color);
  }
}
```

## Dependencies

- **Swiper**: For carousel functionality
- **Angular 17+**: Standalone component support
- **Font Awesome**: For the plus icon (optional)

## Installation

The component is already included in the DFashion project. To use it in other projects:

1. Install Swiper: `npm install swiper`
2. Copy the component files
3. Import and use in your components

## Browser Support

- Modern browsers with ES6+ support
- Touch devices (iOS, Android)
- Desktop with mouse/keyboard navigation

## Performance

- Lazy loading of images
- Optimized for smooth scrolling
- Minimal re-renders with OnPush change detection
- Efficient memory usage with virtual scrolling
