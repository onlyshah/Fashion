import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'role'
})
export class RolePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    
    const roleMap: { [key: string]: string } = {
      'super_admin': 'Super Admin',
      'admin': 'Admin',
      'sales_manager': 'Sales Manager',
      'sales_executive': 'Sales Executive',
      'marketing_manager': 'Marketing Manager',
      'marketing_executive': 'Marketing Executive',
      'account_manager': 'Account Manager',
      'accountant': 'Accountant',
      'support_manager': 'Support Manager',
      'support_agent': 'Support Agent',
      'content_manager': 'Content Manager',
      'vendor_manager': 'Vendor Manager',
      'customer': 'Customer',
      'vendor': 'Vendor'
    };
    
    return roleMap[value] || value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
