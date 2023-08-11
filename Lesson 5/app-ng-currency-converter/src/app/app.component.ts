import { Component, OnInit } from '@angular/core';
import { Title } from "@angular/platform-browser";
import { FormGroup, FormControl, FormBuilder, Validators  } from '@angular/forms';
import { ICurrencyRate } from './model/currencyRate';
import { CurrencyRateService } from './currency-rate.service';
import { numberValidator } from './Validators/numberValidator';
import { IExchangeState } from './model/exchangeState';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'Currency converter'; 
  
  currencyExchangeForm: FormGroup;
  /*
  currencyExchangeForm = new FormGroup({
    currencyCode1: new FormControl('', [Validators.required]),
    currencyCode2: new FormControl('', [Validators.required]),
    currencyAmount1: new FormControl('', [Validators.required, numberValidator]),
    currencyAmount2: new FormControl('', [Validators.required, numberValidator]),
    letfToRight: new FormControl(''),
  });*/

  currencyRates!: ICurrencyRate[];
  exchangeSate!: IExchangeState;

  constructor(private currencyRateService: CurrencyRateService,    
    private titleService: Title,
    private fb: FormBuilder) {
    this.titleService.setTitle(this.title);
  }

  ngOnInit(): void {
    // Init FormGroup
    this.currencyExchangeForm = this.fb.group({
      letfToRight: [true],
      currencyCode1: ['', [Validators.required]],
      currencyCode2: ['', [Validators.required]],
      currencyAmount1: [0, [Validators.required, numberValidator]],
      currencyAmount2: [0, [Validators.required, numberValidator]]     
    });
    
    this.exchangeSate = this.currencyRateService.getExchangeState();
    this.currencyRateService.getRates().subscribe(response => {
      this.currencyRates = response;  // GetRates
      this.currencyRateService.convertCurrency(this.exchangeSate); // Convert with new rates  
      // Init Form values 
      this.currencyExchangeForm.patchValue(
        this.exchangeSate,
        { emitEvent: false });      
    });    

    // Subscribe to Form changes
    this.currencyExchangeForm.valueChanges.subscribe(data => this.onCurrencyExchangeFormValueChange(data));
    this.currencyExchangeForm.controls["currencyAmount1"].valueChanges.subscribe
      (data => this.onCurrencyAmount1ValueChange(data));
    this.currencyExchangeForm.controls["currencyAmount2"].valueChanges.subscribe
      (data => this.onCurrencyAmount2ValueChange(data)); 
  }

  private onCurrencyExchangeFormValueChange(data: any): void {    
    if (this.currencyExchangeForm.valid) {         
      // Convert state with new form data
      this.exchangeSate.currencyCode1 = data.currencyCode1;
      this.exchangeSate.currencyCode2 = data.currencyCode2;
      
      this.exchangeSate.currencyAmount1 = parseFloat(data.currencyAmount1.toString().replace(',', '.'));
      this.exchangeSate.currencyAmount2 = parseFloat(data.currencyAmount2.toString().replace(',', '.'));
      if(isNaN(this.exchangeSate.currencyAmount1))
        this.exchangeSate.currencyAmount1 = 0;
      if(isNaN(this.exchangeSate.currencyAmount2))
        this.exchangeSate.currencyAmount2 = 0;

      // Convert
      this.currencyRateService.convertCurrency(this.exchangeSate);
      this.currencyRateService.SaveExchangeStateToLocalStorage(this.exchangeSate);

      // Applay results to form
      this.currencyExchangeForm.controls["currencyAmount1"].setValue
        (this.exchangeSate.currencyAmount1, { emitEvent: false });
      this.currencyExchangeForm.controls["currencyAmount2"].setValue
        (this.exchangeSate.currencyAmount2, { emitEvent: false });
    }
  } 

  private onCurrencyAmount1ValueChange(data: any): void {    
    // Set convert direction Currency1 -> Currency2
    this.exchangeSate.currencyAmount2 = 0;
    this.exchangeSate.letfToRight = true;
    this.currencyExchangeForm.controls["letfToRight"].setValue
      (this.exchangeSate.letfToRight, { emitEvent: false });
    this.currencyExchangeForm.controls["currencyAmount2"].setValue
      (this.exchangeSate.currencyAmount2, { emitEvent: false });
  }

  private onCurrencyAmount2ValueChange(data: any): void {    
    // Set convert direction Currency2 -> Currency1
    this.exchangeSate.currencyAmount1 = 0;
    this.exchangeSate.letfToRight = false;
    this.currencyExchangeForm.controls["letfToRight"].setValue
      (this.exchangeSate.letfToRight, { emitEvent: false });
    this.currencyExchangeForm.controls["currencyAmount1"].setValue
      (this.exchangeSate.currencyAmount1, { emitEvent: false });
  }



}
