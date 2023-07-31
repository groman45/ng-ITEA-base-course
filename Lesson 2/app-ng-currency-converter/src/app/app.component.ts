import { Component } from '@angular/core';
import { ICurrencyRate } from './model/currencyRate';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ng-currency-converter';
  
  currencyList: Array<string> = ['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'UAH']; // Available currencies
  currencyRates: ICurrencyRate[] = [
    { currencyFrom: 'USD', currencyTo: 'EUR', rate: 0.90731 },
    { currencyFrom: 'USD', currencyTo: 'GBP', rate: 0.77799 },
    { currencyFrom: 'USD', currencyTo: 'CHF', rate: 0.87007 },
    { currencyFrom: 'USD', currencyTo: 'JPY', rate: 141.128 },
    { currencyFrom: 'USD', currencyTo: 'UAH', rate: 36.6584 },
    { currencyFrom: 'EUR', currencyTo: 'UAH', rate: 40.3763 },
  ]; // Double conversion will be used (through USD) for example CHF -> JPY

  letfToRight: boolean = true; // Convert direction
  currencyCode1: string;
  currencyCode2: string;
  currencyAmount1: number = 0;
  currencyAmount2: number = 0;

  constructor() {
    // Inital selection
    this.currencyCode1 = this.currencyList[0];
    this.currencyCode2 = this.currencyList[1];
  }

  // Select 1 changed
  selectCurrency1_OnChange(e: Event): void {
    const element = e.currentTarget as HTMLSelectElement;
    this.currencyCode1 = element.value;
    this.convertCurrency();
  }

  // Select 2 changed
  selectCurrency2_OnChange(e: Event): void {
    const element = e.currentTarget as HTMLSelectElement;
    this.currencyCode2 = element.value;
    this.convertCurrency();
  }

  // Handler for Inputs 
  // Parametr letfToRight = true, when user enterd number to left input
  // Parametr letfToRight = false, when user enterd number to right input
  ValidateInputAmount(letfToRight: boolean, e: Event) {
    this.letfToRight = letfToRight;
    const element = e.currentTarget as HTMLInputElement;
    const value = element.value;

    let haveToClear: boolean = false;
    if ((value != null) && (value !== '')) {
      if (this.isNumber(value)) {
        if (this.letfToRight) {
          this.currencyAmount1 = +value;
        }
        else {
          this.currencyAmount2 = +value;
        }
        this.convertCurrency();
      }
      else {
        alert("Entered value " + value + " is not a number!");
        haveToClear = true;
      }
    }
    else {
      haveToClear = true;
    }

    if (haveToClear) {
      this.clear();
      element.value = '0';
    }
  }

  // Check is specyfiead value a number
  isNumber(value?: string | number): boolean {
    return ((value != null) &&
      (value !== '') &&
      !isNaN(Number(value.toString())));
  }

  // Clear 
  clear(): void {
    this.currencyAmount1 = 0;
    this.currencyAmount2 = 0;
  }

  // Core method for conversion
  convertCurrency() {
    // Direct conversion (User entered value to left field)
    let amountToConvert: number = this.currencyAmount1 != null ? this.currencyAmount1 : 0;
    let currencyFrom: string = this.currencyCode1;
    let currencyTo: string = this.currencyCode2;

    // Reverse conversion (User entered value to right field)
    if (!this.letfToRight && this.currencyAmount2 != null) {
      amountToConvert = this.currencyAmount2;
      currencyFrom = this.currencyCode2;
      currencyTo = this.currencyCode1;
    }

    let rate: number | undefined = this.findRate(currencyFrom, currencyTo);
    if (rate == undefined) // Double conversion using USD
    {
      rate = this.findRate(currencyFrom, 'USD');
      rate = (rate ?? 1) * (this.findRate('USD', currencyTo) ?? 1);
    }

    let amountConverted: number = amountToConvert * (rate ?? 1);
    if (this.letfToRight)
      this.currencyAmount2 = amountConverted;
    else this.currencyAmount1 = amountConverted;
  }

  // Find rate in  currencyRates: ICurrencyRate[]
  findRate(currencyFrom: string, currencyTo: string): number | undefined {
    if (currencyFrom == currencyTo) {
      return 1;
    }
    // find rate probe 1 
    let currencyRate = this.currencyRates.find(x => {
      return x.currencyFrom == currencyFrom
        && x.currencyTo == currencyTo
    });   
    if (currencyRate != undefined) {
      return currencyRate.rate;
    }
    // find rate probe 2 
    let currencyRateReverse = this.currencyRates.find(x => {
      return x.currencyFrom == currencyTo
        && x.currencyTo == currencyFrom
    });
    if (currencyRateReverse != undefined) {
      return 1 / currencyRateReverse.rate;
    }
    return undefined;
  }


}
