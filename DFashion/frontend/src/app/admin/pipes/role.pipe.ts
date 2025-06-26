import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'role'
})
export class RolePipe implements PipeTransform {

  private roleDisplayNames: { [key: string]: string } = {
    'super_admin': 'Super Administrator',
    'admin': 'Administrator',
    'sales_manager': 'Sales Manager',
    'marketing_manager': 'Marketing Manager',
    'account_manager': 'Account Manager',
    'support_manager': 'Support Manager',
    'sales_executive': 'Sales Executive',
    'marketing_executive': 'Marketing Executive',
    'account_executive': 'Account Executive',
    'support_executive': 'Support Executive',
    'customer': 'Customer',
    'vendor': 'Vendor'
  };

  transform(role: string): string {
    return this.roleDisplayNames[role] || role;
  }
}
