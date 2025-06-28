import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss']
})
export class EmptyStateComponent {
  @Input() icon: string = 'document-outline';
  @Input() iconColor: string = 'medium';
  @Input() title: string = 'No data found';
  @Input() message: string = 'There are no items to display at the moment.';
  @Input() buttonText: string = '';
  @Input() buttonIcon: string = '';
  @Input() buttonColor: string = 'primary';
  @Input() buttonFill: string = 'solid';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() showAnimation: boolean = true;
  @Input() customClass: string = '';

  @Output() buttonClick = new EventEmitter<void>();

  onButtonClick(): void {
    this.buttonClick.emit();
  }

  get containerClasses(): string {
    const classes = ['empty-state'];
    if (this.size) classes.push(`size-${this.size}`);
    if (this.showAnimation) classes.push('animated');
    if (this.customClass) classes.push(this.customClass);
    return classes.join(' ');
  }
}
