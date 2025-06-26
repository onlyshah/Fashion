import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-container">
      <h2>Admin Dashboard</h2>
      <p>Admin functionality coming soon...</p>
    </div>
  `,
  styles: [`
    .admin-container {
      padding: 40px 20px;
      text-align: center;
    }
  `]
})
export class AdminDashboardComponent {}
