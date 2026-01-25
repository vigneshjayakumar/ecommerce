import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'inrcurr',
})
export class INRCurrency implements PipeTransform {
  transform(value: any) {
    if (!isNaN(value)) {
      const ruppeSymbol = '₹';
      const result = value.toString().split('.');
      let lastThreeDigit = result[0].substring(result[0].length - 3);
      const otherDigits = result[0].substring(0, result[0].length - 3);
      if (otherDigits != '') {
        lastThreeDigit = ',' + lastThreeDigit;
      }
      let output =
        otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThreeDigit;
      if (result.length > 1) {
        output += '.' + result[1];
      }
      return ruppeSymbol + output;
    }
    return value;
  }
}
