import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss']
})
export class RatingComponent {
  @Input() value: number = 0;
  @Input() count: number = 0;
  @Input() maxStars: number = 5;
  @Input() interactive: boolean = false;
  @Input() showValue: boolean = true;
  @Input() showCount: boolean = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  @Output() ratingChange = new EventEmitter<number>();

  get stars(): number[] {
    return Array(this.maxStars).fill(0).map((_, i) => i);
  }

  getStarIcon(index: number): string {
    const starValue = index + 1;
    if (this.value >= starValue) {
      return 'star';
    } else if (this.value >= starValue - 0.5) {
      return 'star-half';
    } else {
      return 'star-outline';
    }
  }

  getStarColor(index: number): string {
    return this.value > index ? 'warning' : 'medium';
  }

  onStarClick(index: number): void {
    if (this.interactive) {
      const newValue = index + 1;
      this.value = newValue;
      this.ratingChange.emit(newValue);
    }
  }
}
