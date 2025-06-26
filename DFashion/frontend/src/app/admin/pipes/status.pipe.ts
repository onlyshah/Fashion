import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'status'
})
export class StatusPipe implements PipeTransform {

  private statusDisplayNames: { [key: string]: string } = {
    // User statuses
    'active': 'Active',
    'inactive': 'Inactive',
    'pending': 'Pending',
    'suspended': 'Suspended',
    'verified': 'Verified',
    'unverified': 'Unverified',
    
    // Order statuses
    'confirmed': 'Confirmed',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'refunded': 'Refunded',
    
    // Payment statuses
    'paid': 'Paid',
    'failed': 'Failed',
    'partial': 'Partial',
    
    // Product statuses
    'approved': 'Approved',
    'rejected': 'Rejected',
    'draft': 'Draft',
    'published': 'Published',
    'featured': 'Featured'
  };

  transform(status: string): string {
    return this.statusDisplayNames[status] || status;
  }
}
