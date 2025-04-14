import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from 'express';
import { passwordMatcher } from '../../validators/password-matcher.validator';

@Component({
  selector: 'app-employer-account',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './employer-account.component.html',
  styleUrl: './employer-account.component.css'
})
export class EmployerAccountComponent {
      private fb = inject(FormBuilder);
      private authService = inject(AuthService)
      private existingUsernames = ['john_doe', 'jane_smith', 'admin', 'librarian'];
    
      signupForm = this.fb.group({
        firstName: ['', [Validators.required]],
        secondName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        telephone1: ['', [Validators.required]],
        telephone2: ['', [Validators.required]],
        address: ['', [Validators.required]],
        postalCode: ['', [Validators.required]],
        companyName: ['', [Validators.required]],
        companyAddress: ['', [Validators.required]],
        companyPostalCode: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      {validators: passwordMatcher('password', 'confirmPassword')}
    );

  onSubmit(){
    window.alert('Updated successfully')
  }
}
