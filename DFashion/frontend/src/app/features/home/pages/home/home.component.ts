import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ViewAddStoriesComponent } from '../../components/view-add-stories/view-add-stories.component';
import { FeedComponent } from '../../components/feed/feed.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ViewAddStoriesComponent,
    FeedComponent,
    SidebarComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    // Home component initialization
  }
}
