import { Routes } from '@angular/router';
import { StoryViewerComponent } from './story-viewer/story-viewer.component';

export const storyRoutes: Routes = [
  {
    path: 'story/:userId/:storyIndex',
    component: StoryViewerComponent,
    title: 'Story Viewer'
  }
];
