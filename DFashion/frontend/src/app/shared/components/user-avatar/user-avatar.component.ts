import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss']
})
export class UserAvatarComponent {
  @Input() avatarUrl?: string;
  @Input() displayName: string = '';
  @Input() size: 'small' | 'medium' | 'large' | 'xlarge' = 'medium';
  @Input() showStatus: boolean = false;
  @Input() isOnline: boolean = false;
  @Input() backgroundColor?: string;

  imageError: boolean = false;

  get initials(): string {
    if (!this.displayName) return '?';
    
    const names = this.displayName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  get backgroundColor(): string {
    if (this.backgroundColor) {
      return this.backgroundColor;
    }
    
    // Generate color based on name
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7',
      '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
      '#009688', '#4caf50', '#8bc34a', '#cddc39',
      '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
    ];
    
    let hash = 0;
    for (let i = 0; i < this.displayName.length; i++) {
      hash = this.displayName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }

  onImageError(): void {
    this.imageError = true;
  }
}
