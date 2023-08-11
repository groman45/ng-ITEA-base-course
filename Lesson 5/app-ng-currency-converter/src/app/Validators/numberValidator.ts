import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms'

export const numberValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (isNaN(control?.value)) {   
    return {
      number: true // This mean error of validation
    }
  }  

  if (control && control.value) {
    let str = control.value.toString();
    if (str != "") {
      // Ckecing last symbol
      if (str.slice(-1) === "." || str.slice(-1) === ",") {
        return {
          number: true // This mean error of validation
        }
      }
    }
  }

  return null;
};

