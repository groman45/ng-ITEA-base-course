import { Pipe, PipeTransform } from '@angular/core';
import { getCurrencySymbol } from "@angular/common";

// Sustom pipe
// Provide currencySymbol for specyfied currency code (USD -> $)
@Pipe({
  name: 'currencySymbol'
})
export class CurrencySymbolPipe implements PipeTransform {

  transform(
    code: string,
    format: 'wide' | 'narrow' = 'narrow',
    locale?: string
  ): any {
    let currencySymbol: string | undefined = getCurrencySymbol(code, format, locale);
    if (currencySymbol !== code)
      return currencySymbol;
    return "";
  }

}
