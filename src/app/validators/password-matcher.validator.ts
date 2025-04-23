import { AbstractControl, ValidatorFn } from '@angular/forms';

export function passwordMatcher(password: string, confirmPassword: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    const passwordControl = control.get(password);
    const confirmPasswordControl = control.get(confirmPassword);

    if (!passwordControl || !confirmPasswordControl) {
      return null;
    }

    return passwordControl.value === confirmPasswordControl.value ? null : { passwordMismatch: true };
  };
}