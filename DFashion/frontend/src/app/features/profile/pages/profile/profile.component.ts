import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styles: [`
    .profile-container {
      padding: 40px 20px;
      text-align: center;
    }
  `]
})
export class ProfileComponent {}
