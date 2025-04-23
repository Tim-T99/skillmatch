import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { passwordMatcher } from '../../validators/password-matcher.validator';

@Component({
  selector: 'app-employer-account',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './employer-account.component.html',
  styleUrl: './employer-account.component.css'
})
export class EmployerAccountComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private existingUsernames = ['john_doe', 'jane_smith', 'admin'];

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
    password: ['', [Validators.minLength(8)]], // Password not required for updates
    confirmPassword: ['']
  }, { validators: passwordMatcher('password', 'confirmPassword') });

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.authService.getUserProfile().subscribe({
      next: (userData) => {
        this.signupForm.patchValue({
          firstName: userData.firstName,
          secondName: userData.secondName,
          email: userData.email,
          telephone1: userData.telephone1,
          telephone2: userData.telephone2,
          address: userData.address,
          postalCode: userData.postalCode,
          companyName: userData.companyName,
          companyAddress: userData.companyAddress,
          companyPostalCode: userData.companyPostalCode
        });
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        window.alert('Failed to load user data.');
      }
    });
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      const formData = this.signupForm.value;
      // Only include password if provided
      const updateData = {
        firstName: formData.firstName,
        secondName: formData.secondName,
        email: formData.email,
        telephone1: formData.telephone1,
        telephone2: formData.telephone2,
        address: formData.address,
        postalCode: formData.postalCode,
        companyName: formData.companyName,
        companyAddress: formData.companyAddress,
        companyPostalCode: formData.companyPostalCode,
        ...(formData.password && { password: formData.password })
      };

      this.authService.updateUserProfile(updateData).subscribe({
        next: () => {
          window.alert('Updated successfully');
          this.signupForm.reset(this.signupForm.value); // Reset form but keep values
        },
        error: (error) => {
          console.error('Error updating user data:', error);
          window.alert('Failed to update user data.');
        }
      });
    } else {
      window.alert('Please fill out all required fields correctly.');
    }
  }
}