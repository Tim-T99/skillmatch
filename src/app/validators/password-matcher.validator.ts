import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";

export function passwordMatcher(passwordKey:string, confirmPasswordKey:string):ValidatorFn{
    return (FormGroup:AbstractControl): ValidationErrors | null => {
        const password = FormGroup.get(passwordKey)?.value;
        const confrimPassword = FormGroup.get(confirmPasswordKey)?.value;
        return password === confrimPassword ? null : {passwordMismatch: true}
    }
}