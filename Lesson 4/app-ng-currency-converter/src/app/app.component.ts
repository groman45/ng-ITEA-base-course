import { Component } from '@angular/core';
import {Title} from "@angular/platform-browser";
import { ICurrencyRate } from './model/currencyRate';
import { CurrencyRateService } from './currency-rate.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Currency converter';
 
  currencyRates!: ICurrencyRate[];
  letfToRight: boolean = true; // Convert direction
  currencyCode1: string = "";
  currencyCode2: string = "";
  currencyAmount1: number = 0;
  currencyAmount2: number = 0;

  constructor(private currencyRateService: CurrencyRateService,
    private titleService: Title) {
    this.titleService.setTitle(this.title);
    this.currencyRateService.getRates().subscribe(response => {
      this.currencyRates = response;
      this.addUahToCurrencyRates();
      this.initFromLocalStorage();
    });
  }
 
  // Add UAH (UAH is missing in api data)
  addUahToCurrencyRates(): void
  {
    var uah: ICurrencyRate = { r030: 980, txt:"Гривня", rate:1, cc:"UAH", exchangedate: "null" };
    this.currencyRates.unshift(uah);
  }

  // Get inital data from localStorage
  initFromLocalStorage(): void {    
    this.currencyCode1 = localStorage.getItem("currencyCode1") ?? "USD";
    this.currencyCode2 = localStorage.getItem("currencyCode2") ?? "UAH";
    this.currencyAmount1 = Number(localStorage.getItem("currencyAmount1"));
    this.currencyAmount2 = Number(localStorage.getItem("currencyAmount2"));
    if (localStorage.getItem("letfToRight"))
      this.letfToRight = localStorage.getItem("letfToRight") === 'true'
        || localStorage.getItem("letfToRight") === '1';
    
    // Convert currencies with actual rate 
    this.convertCurrency();
    this.saveToLocalStorage();
  }

  // Save user values to localStorage
  saveToLocalStorage(): void
  {  
    localStorage.setItem("currencyCode1", this.currencyCode1);
    localStorage.setItem("currencyCode2", this.currencyCode2);
    localStorage.setItem("currencyAmount1", this.currencyAmount1.toString());
    localStorage.setItem("currencyAmount2", this.currencyAmount2.toString());
    localStorage.setItem("letfToRight", this.letfToRight.toString());
  }

  // Select 1 changed
  selectCurrency1_OnChange(e: Event): void {
    const element = e.currentTarget as HTMLSelectElement;
    this.currencyCode1 = element.value;
    this.saveToLocalStorage();
    this.convertCurrency();
  }

  // Select 2 changed
  selectCurrency2_OnChange(e: Event): void {
    const element = e.currentTarget as HTMLSelectElement;
    this.currencyCode2 = element.value;
    this.saveToLocalStorage();
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
        this.saveToLocalStorage();
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
      this.clearAmounts();
      element.value = '0';
    }
  }

  // Check is specyfiead value a number
  isNumber(value?: string | number): boolean {
    return ((value != null) &&
      (value !== '') &&
      !isNaN(Number(value.toString())));
  }

  // Clear Amounts
  clearAmounts(): void {
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
    let currencyRateFrom = this.currencyRates.find(x => { return x.cc == currencyFrom });
    let currencyRateTo = this.currencyRates.find(x => { return x.cc == currencyTo });     
    if (currencyRateFrom != undefined && currencyRateTo != undefined)
    {
      return currencyRateFrom.rate / currencyRateTo.rate;
    }    
    return undefined;
  }


}
