import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  signupForm = this.fb.group({
    firstName: ['', Validators.required],
    secondName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    telephone1: [''],
    telephone2: [''],
    address: [''],
    postalCode: [''],
    companyName: ['', Validators.required],
    companyAddress: [''],
    companyPostalCode: ['']
  });

  errorMessage: string | null = null;

  onSubmit() {
    if (this.signupForm.valid) {
      const {
        firstName,
        secondName,
        email,
        password,
        telephone1,
        telephone2,
        address,
        postalCode,
        companyName,
        companyAddress,
        companyPostalCode
      } = this.signupForm.value;

      this.authService
        .signup(
          firstName!,
          secondName!,
          email!,
          telephone1 || '',
          telephone2 || '',
          address || '',
          postalCode || '',
          companyName!,
          companyAddress || '',
          companyPostalCode || '',
          password!
        )
        .subscribe({
          next: () => {
            this.router.navigate(['/employer/employerDash']);
            this.signupForm.reset();
          },
          error: (error) => {
            this.errorMessage = error.status === 400 ? error.error.message : 'An error occurred.';
            console.error('Signup error:', error);
          }
        });
    } else {
      this.errorMessage = 'Please fill all required fields.';
    }
  }
}