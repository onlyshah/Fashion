import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat'
})
export class CurrencyFormatPipe implements PipeTransform {

  transform(value: number, currency: string = 'INR', locale: string = 'en-IN'): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '₹0';
    }

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(value);
    } catch (error) {
      // Fallback for unsupported locales
      return `₹${value.toLocaleString()}`;
    }
  }
}
