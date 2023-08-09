import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ICurrencyRate } from './model/currencyRate';
import { map, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CurrencyRateService {
  private apiUrl: string = "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json";
  constructor(private http: HttpClient) { }

  getRates() {    
    return this.http.get<ICurrencyRate[]>(this.apiUrl).pipe(
      delay(300), // because API does not allow very frequent requests (on F5)
      map((response: any) => {        
        return response;
      })
    );
  }
  
}
