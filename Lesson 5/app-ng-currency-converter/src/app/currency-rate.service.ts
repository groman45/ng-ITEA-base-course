import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ICurrencyRate } from './model/currencyRate';
import { map, delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { IExchangeState } from './model/exchangeState';

@Injectable({
  providedIn: 'root'
})
export class CurrencyRateService {
  private apiUrl: string = "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json";
  private currencyRates: ICurrencyRate[] = [];
  private exchangeSate: IExchangeState = { letfToRight: true, currencyCode1: "", currencyCode2: "",  
      currencyAmount1: 0, currencyAmount2: 0 };

  constructor(private http: HttpClient) { }

  /** Returns rates from API or from cached data */
  getRates() {    
    if (this.currencyRates.length > 0) {
      return of(this.currencyRates);
    }
    return this.http.get<ICurrencyRate[]>(this.apiUrl).pipe(      
      map((response: any) => {     
        this.currencyRates = response;  
        this.addUahToCurrencyRates(); 
        return response;
      })
    );
  }

  /** Add UAH (UAH is missing in api data) */
  private addUahToCurrencyRates(): void
  {
    let uah: ICurrencyRate = { r030: 980, txt:"Гривня", rate:1, cc:"UAH", exchangedate: "null" };
    this.currencyRates.unshift(uah);
  }

  getExchangeState() : IExchangeState
  {   
    this.InitExchangeState();   
    return this.exchangeSate;
  }

  /** Init exchangeSate by default data or by localStorage if it is filled */ 
  private InitExchangeState(): void {    
    this.exchangeSate.currencyCode1 = localStorage.getItem("currencyCode1") ?? "USD";
    this.exchangeSate.currencyCode2 = localStorage.getItem("currencyCode2") ?? "UAH";
    if( this.exchangeSate.currencyCode1 === '') 
      this.exchangeSate.currencyCode1 = "USD";
    if( this.exchangeSate.currencyCode2 === '') 
      this.exchangeSate.currencyCode2 = "UAH";

    this.exchangeSate.currencyAmount1 = Number(localStorage.getItem("currencyAmount1"));
    this.exchangeSate.currencyAmount2 = Number(localStorage.getItem("currencyAmount2"));
    if (isNaN(this.exchangeSate.currencyAmount1))
      this.exchangeSate.currencyAmount1 = 0;
    if (isNaN(this.exchangeSate.currencyAmount2))
      this.exchangeSate.currencyAmount2 = 0;

    if (localStorage.getItem("letfToRight"))
      this.exchangeSate.letfToRight = localStorage.getItem("letfToRight") === 'true'
        || localStorage.getItem("letfToRight") === '1';      
  }  

  /** Save values to localStorage */
  SaveExchangeStateToLocalStorage(exchangeSate: IExchangeState): void
  {      
    localStorage.setItem("currencyCode1", this.exchangeSate.currencyCode1);
    localStorage.setItem("currencyCode2", this.exchangeSate.currencyCode2);
    localStorage.setItem("currencyAmount1", this.exchangeSate.currencyAmount1.toString());
    localStorage.setItem("currencyAmount2", this.exchangeSate.currencyAmount2.toString());
    localStorage.setItem("letfToRight", this.exchangeSate.letfToRight.toString());
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

  /** Core method for currency conversion */
  convertCurrency(exchangeSate: IExchangeState) {
    
    // Direct conversion (User entered value to left field)
    let amountToConvert: number = exchangeSate.currencyAmount1 != null ? exchangeSate.currencyAmount1 : 0;
    let currencyFrom: string = exchangeSate.currencyCode1;
    let currencyTo: string = exchangeSate.currencyCode2;

    // Reverse conversion (User entered value to right field)
    if (!exchangeSate.letfToRight && exchangeSate.currencyAmount2 != null) {
      amountToConvert = exchangeSate.currencyAmount2;
      currencyFrom = exchangeSate.currencyCode2;
      currencyTo = exchangeSate.currencyCode1;
    }

    let rate: number | undefined = this.findRate(currencyFrom, currencyTo);
    let amountConverted: number = amountToConvert * (rate ?? 1);
    amountConverted = this.naiveRound(amountConverted, 2);

    if (exchangeSate.letfToRight)
        exchangeSate.currencyAmount2 = amountConverted;
    else exchangeSate.currencyAmount1 = amountConverted; 
  }

  private naiveRound(num: number, decimalPlaces = 0): number {
    var p = Math.pow(10, decimalPlaces);
    return Math.round(num * p) / p;
  }
  
}


