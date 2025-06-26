import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-empty-state',
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

  @Output() buttonClick = new EventEmitter<void>();

  onButtonClick(): void {
    this.buttonClick.emit();
  }
}
