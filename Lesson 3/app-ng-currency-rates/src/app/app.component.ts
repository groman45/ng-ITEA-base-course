import { Component } from '@angular/core';
import { ICurrencyRate } from './model/currencyRate';
import { Pipe, PipeTransform } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Currency rates'; 
  
  myDate = new Date();
  currencyRates: ICurrencyRate[] = [
    { currency: 'USD', rate: 36.5686 },
    { currency: 'EUR', rate: 39.9914 },    
    { currency: 'CAD', rate: 27.352 },  
    { currency: 'CHF', rate: 42.75 }     
  ]; 

  constructor() {  
  }

  deleteCurrencyRate(idx:number) : void {
      if(idx >= 0 && idx < this.currencyRates.length)
        this.currencyRates.splice(idx, 1);
  }
  



  

 



}
