import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat'
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number, currency: string = '₹', showDecimals: boolean = false): string {
    if (value === null || value === undefined || isNaN(value)) {
      return `${currency}0`;
    }

    // Format number with Indian number system (lakhs, crores)
    const absValue = Math.abs(value);
    let formattedValue: string;

    if (absValue >= 10000000) {
      // Crores
      formattedValue = (absValue / 10000000).toFixed(showDecimals ? 2 : 1) + ' Cr';
    } else if (absValue >= 100000) {
      // Lakhs
      formattedValue = (absValue / 100000).toFixed(showDecimals ? 2 : 1) + ' L';
    } else if (absValue >= 1000) {
      // Thousands
      formattedValue = (absValue / 1000).toFixed(showDecimals ? 2 : 1) + 'K';
    } else {
      // Regular formatting
      formattedValue = showDecimals ? 
        absValue.toFixed(2) : 
        absValue.toLocaleString('en-IN');
    }

    // Add negative sign if needed
    const sign = value < 0 ? '-' : '';
    
    return `${sign}${currency}${formattedValue}`;
  }
}
